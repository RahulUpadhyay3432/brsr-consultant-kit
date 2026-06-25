"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { fieldsByIds } from "./fields";
import * as db from "./db";
import { sendRequestEmail, sendSubmissionAlert } from "./email";
import { uploadEvidence } from "./storage";
import { generateNarrative, type NarrativeResult } from "./narrative";
import { extractValues, type ImportResult } from "./importer";
import { groqConfigured } from "./groq";
import { requireConsultant } from "./guard";

function baseUrl(): string {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

// 1) Consultant creates a campaign (one client). Owners are added next.
export async function createCampaignAction(formData: FormData): Promise<void> {
  requireConsultant();
  const clientName = String(formData.get("clientName") || "").trim();
  const deadline = (String(formData.get("deadline") || "").trim() || null) as string | null;
  const reportingPeriod = (String(formData.get("reportingPeriod") || "").trim() || null) as string | null;
  if (!clientName) redirect("/requests/new?error=missing");

  const id = await db.createCampaign(clientName, deadline, reportingPeriod);
  redirect(`/requests/${id}`);
}

// 2) Consultant adds a data owner to a campaign and sends them a request.
export async function addContactAction(
  campaignId: string, clientName: string, deadline: string | null,
  reportingPeriod: string | null, formData: FormData
): Promise<void> {
  requireConsultant();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const fieldIds = formData.getAll("fields").map(String);

  if (!email || fieldIds.length === 0) {
    redirect(`/requests/${campaignId}?error=owner`);
  }

  const fields = fieldsByIds(fieldIds);
  const token = randomBytes(24).toString("base64url");
  await db.addContact(campaignId, name, email, token, fields);

  await sendRequestEmail(
    {
      clientName,
      contactName: name || null,
      contactEmail: email,
      deadline,
      reportingPeriod,
      items: fields.map((f) => ({ label: f.label, unit: f.unit ?? null })),
      token,
    },
    `${baseUrl()}/submit/${token}`
  );

  // Auto-capture this owner into the client's saved roster, so the directory
  // fills itself as you add owners. Best-effort — never breaks the send.
  try {
    await db.upsertCompanyContacts(campaignId, [{ name: name || null, email: email.toLowerCase(), role: null }]);
  } catch { /* directory table optional */ }

  redirect(`/requests/${campaignId}`);
}

// ── Saved-contacts directory (per client) ───────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Smart-parse a pasted block: one contact per line, fields split on tab OR comma
// (so a list from a client email *and* cells copied from Excel/Sheets both work).
// The token that looks like an email is required; the rest become name then role.
function parseContactLines(text: string): { name: string | null; email: string; role: string | null }[] {
  const out: { name: string | null; email: string; role: string | null }[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const parts = rawLine.split(/[\t,]+/).map((p) => p.trim()).filter(Boolean);
    const emailIdx = parts.findIndex((p) => EMAIL_RE.test(p));
    if (emailIdx === -1) continue; // no email on this line → skip
    const rest = parts.filter((_, i) => i !== emailIdx);
    out.push({ email: parts[emailIdx].toLowerCase(), name: rest[0] || null, role: rest[1] || null });
  }
  return out;
}

// Add one contact (name/email/role) and/or a pasted list to the client's roster.
export async function addDirectoryContactsAction(campaignId: string, formData: FormData): Promise<void> {
  requireConsultant();
  const rows: { name: string | null; email: string; role: string | null }[] = [];

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (EMAIL_RE.test(email)) {
    rows.push({
      name: String(formData.get("name") || "").trim() || null,
      email,
      role: String(formData.get("role") || "").trim() || null,
    });
  }
  const paste = String(formData.get("paste") || "");
  if (paste.trim()) rows.push(...parseContactLines(paste));

  if (rows.length) {
    try { await db.upsertCompanyContacts(campaignId, rows); } catch { /* table may not exist yet */ }
  }
  redirect(`/requests/${campaignId}`);
}

export async function deleteDirectoryContactAction(campaignId: string, formData: FormData): Promise<void> {
  requireConsultant();
  const contactId = String(formData.get("contactId") || "");
  if (contactId) {
    try { await db.deleteCompanyContact(contactId); } catch { /* best-effort */ }
  }
  redirect(`/requests/${campaignId}`);
}

// Generate the AI narrative draft for a campaign (paid tier — /requests/* is
// passcode-gated by middleware). Grounded in collected data only; persisted
// best-effort (the column may not exist until the migration runs), but always
// returned so the draft can render it immediately.
export async function generateNarrativeAction(campaignId: string): Promise<NarrativeResult> {
  requireConsultant();
  const campaign = await db.getCampaign(campaignId);
  if (!campaign) return {};
  const narrative = await generateNarrative(campaign);
  if (Object.keys(narrative).length > 0) {
    try { await db.setNarrative(campaignId, narrative); } catch { /* column missing — still return it */ }
  }
  return narrative;
}

// Compliance importer (paid tier). Reads the extracted text of a client's
// existing report and returns reviewable figure suggestions for the campaign's
// fields — extract-only, each with its source sentence. Nothing is written here;
// the consultant applies the ones they verify via applyImportAction. Value-returning
// action (the client passes the locally-extracted text; the document stays on the
// consultant's device — only the text reaches the grounded model).
export async function importDocumentAction(campaignId: string, extractedText: string): Promise<ImportResult> {
  requireConsultant();
  if (!groqConfigured()) return { suggestions: [], truncated: false, configured: false };

  const text = (extractedText || "").trim();
  const campaign = await db.getCampaign(campaignId);
  if (!campaign || !text) return { suggestions: [], truncated: false, configured: true };

  const candidates = campaign.contacts.flatMap((c) =>
    c.items.map((i) => ({ itemId: i.id, fieldId: i.fieldId, label: i.label, unit: i.unit }))
  );
  if (candidates.length === 0) return { suggestions: [], truncated: false, configured: true };

  const { suggestions, truncated } = await extractValues(text, candidates);
  return { suggestions, truncated, configured: true };
}

// Apply the imported figures the consultant ticked. Each accepted itemId gets its
// (possibly edited) value written — same path as a collected value (status → received).
export async function applyImportAction(campaignId: string, formData: FormData): Promise<void> {
  requireConsultant();
  const itemIds = formData.getAll("apply").map(String);
  for (const itemId of itemIds) {
    const value = String(formData.get(`value_${itemId}`) || "").trim();
    if (!value) continue;
    try { await db.updateItem(itemId, value); } catch { /* best-effort per row */ }
  }
  redirect(`/requests/${campaignId}`);
}

// 3) Recipient submits their values (token bound in the page).
export async function submitDataAction(token: string, formData: FormData): Promise<void> {
  const found = await db.getContactByToken(token);
  if (!found) redirect("/submit/invalid");

  const { contact, clientName, campaignId } = found!;
  let received = 0;
  for (const item of contact.items) {
    const v = formData.get(`f_${item.id}`);
    const val = v == null ? "" : String(v).trim();
    const pv = formData.get(`pf_${item.id}`);
    const prior = pv == null ? "" : String(pv).trim();
    if (val !== "") {
      await db.updateItem(item.id, val);
      received++;
    } else if (item.status === "received") {
      received++; // already had a value, left unchanged
    }

    // Prior-year figure is supplementary — write it best-effort so a missing
    // column or hiccup never fails the owner's core submission.
    if (prior !== "") {
      try { await db.setItemPrior(item.id, prior); } catch { /* supplementary */ }
    }

    // Optional supporting document — best-effort, never blocks the number.
    const file = formData.get(`file_${item.id}`);
    if (file instanceof File && file.size > 0) {
      try {
        const up = await uploadEvidence(item.id, file);
        if (up) await db.setItemEvidence(item.id, up.path, up.name);
      } catch {
        /* storage/column hiccup must not fail the owner's submission */
      }
    }
  }

  const status = received === 0 ? "pending" : received === contact.items.length ? "received" : "partial";
  await db.setContactStatus(contact.id, status);

  // Alert the consultant that this owner just submitted (best-effort).
  await sendSubmissionAlert({
    clientName,
    ownerName: contact.name || contact.email,
    received,
    total: contact.items.length,
    link: `${baseUrl()}/requests/${campaignId}`,
  });

  redirect(`/submit/${token}?done=1`);
}
