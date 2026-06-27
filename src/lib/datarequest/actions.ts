"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { fieldsByIds, REQUEST_FIELDS } from "./fields";
import * as db from "./db";
import { sendRequestEmail, sendSubmissionAlert } from "./email";
import { uploadEvidence } from "./storage";
import { generateNarrative, type NarrativeResult } from "./narrative";
import { extractValues, extractValuesBulk, type ImportResult, type BulkImportResult, type BulkDoc, type DocCategory } from "./importer";
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

// Permanently delete a campaign and all its data (owners, items, saved contacts).
// Guarded; refreshes the collections list in place. Irreversible by design — the
// UI confirms before calling this.
export async function deleteCampaignAction(campaignId: string): Promise<void> {
  requireConsultant();
  if (!campaignId) return;
  await db.deleteCampaign(campaignId);
  revalidatePath("/requests");
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

// ── Bulk import: many documents → the FULL BRSR skeleton (campaign-level) ─────
// The consultant uploads one or more of the client's existing reports; the text is
// extracted on their device and passed here. We run the grounded extract-only +
// verifier pass against the whole BRSR format (not just the fields already assigned),
// so a single upload can pre-fill the entire draft. Nothing is written — the
// consultant applies the verified ones via applyBulkImportAction.
export async function bulkImportAction(
  campaignId: string, docs: BulkDoc[]
): Promise<BulkImportResult> {
  requireConsultant();
  if (!groqConfigured()) return { suggestions: [], truncated: false, configured: false };

  const ALLOWED: DocCategory[] = ["auto", "brsr", "annual", "energy", "hr", "water", "policies", "other"];
  const normCategory = (c: unknown): DocCategory =>
    ALLOWED.includes(c as DocCategory) ? (c as DocCategory) : "auto";

  const cleaned: BulkDoc[] = (docs || [])
    .map((d) => ({
      name: String(d?.name || "document").trim() || "document",
      text: String(d?.text || "").trim(),
      category: normCategory(d?.category),
    }))
    .filter((d) => d.text.length > 0);
  if (cleaned.length === 0) return { suggestions: [], truncated: false, configured: true };

  // Candidates = the FULL BRSR request-field skeleton (itemId is irrelevant here).
  const candidates = REQUEST_FIELDS.map((f) => ({ itemId: "", fieldId: f.id, label: f.label, unit: f.unit ?? null }));
  const { suggestions, truncated } = await extractValuesBulk(cleaned, candidates);
  return { suggestions, truncated, configured: true };
}

// Apply the bulk-imported figures the consultant accepted. For each {fieldId,value}:
// if the campaign already has an item for that field, update it in place; otherwise
// create it under the synthetic "Imported documents" contact. Best-effort per row.
export async function applyBulkImportAction(
  campaignId: string, accepted: { fieldId: string; value: string }[]
): Promise<void> {
  requireConsultant();
  const campaign = await db.getCampaign(campaignId);
  if (!campaign) redirect(`/requests/${campaignId}`);

  // fieldId → existing item id (first match across all owners).
  const existing = new Map<string, string>();
  for (const c of campaign!.contacts) {
    for (const it of c.items) {
      if (!existing.has(it.fieldId)) existing.set(it.fieldId, it.id);
    }
  }
  const fieldById = new Map(REQUEST_FIELDS.map((f) => [f.id, f]));

  let importContactId: string | null = null;
  for (const { fieldId, value } of accepted || []) {
    const v = String(value || "").trim();
    if (!fieldId || !v) continue;
    try {
      const itemId = existing.get(fieldId);
      if (itemId) {
        await db.updateItem(itemId, v);
      } else {
        const field = fieldById.get(fieldId);
        if (!field) continue;
        if (!importContactId) importContactId = await db.getOrCreateImportContact(campaignId);
        await db.addItemWithValue(importContactId, field, v);
      }
    } catch { /* best-effort per row */ }
  }
  redirect(`/requests/${campaignId}`);
}

// Seed a fully-populated DEMO campaign so a first-time consultant can explore Collect
// (dashboard + emissions + ledger + draft) without setting up real owners. Idempotent:
// reuses an existing "Sample —" campaign. No emails are sent (we go straight via db).
export async function loadSampleClientAction(): Promise<void> {
  requireConsultant();

  // Reuse an existing sample rather than duplicating.
  const all = await db.listCampaigns();
  const prior = all.find((c) => c.clientName.startsWith("Sample —"));
  if (prior) redirect(`/requests/${prior.id}`);

  const deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const reportingPeriod = mostRecentCompletedFy();
  const id = await db.createCampaign("Sample — Acme Manufacturing (demo)", deadline, reportingPeriod);

  const pick = (ids: string[]) => fieldsByIds(ids);
  // Owner 1 — EHS / energy: the activity inputs so GHG computes + a few P6 fields.
  const owner1Ids = ["P6-E1-elec", "P6-E1-diesel", "P6-E1", "P6-E3", "P6-E7"];
  // Owner 2 — HR: a couple of Principle 3 fields.
  const owner2Ids = ["P3-E1", "P3-E2", "P5-E1"];
  // Owner 3 — Company secretary: governance fields (left pending).
  const owner3Ids = ["P1-E1", "P1-E2", "P7-E1"];

  await db.addContact(id, "Priya Sharma", "priya@acme.example", randToken(), pick(owner1Ids));
  await db.addContact(id, "Arjun Mehta", "arjun@acme.example", randToken(), pick(owner2Ids));
  await db.addContact(id, "Neha Rao", "neha@acme.example", randToken(), pick(owner3Ids));

  // Re-read to get the generated item ids, then fill realistic values.
  const seeded = await db.getCampaign(id);
  if (seeded) {
    const valueFor: Record<string, string> = {
      "P6-E1-elec": "4200000", "P6-E1-diesel": "85000",
      "P6-E1": "21450", "P6-E3": "18.4", "P6-E7": "5200",
      "P3-E1": "640", "P3-E2": "37", "P5-E1": "0",
    };
    for (const contact of seeded.contacts) {
      // Owner 1 fully received; owner 2 partial; owner 3 left pending.
      const isOwner1 = contact.email === "priya@acme.example";
      const isOwner2 = contact.email === "arjun@acme.example";
      if (!isOwner1 && !isOwner2) continue;
      const items = isOwner2 ? contact.items.slice(0, Math.max(1, contact.items.length - 1)) : contact.items;
      for (const it of items) {
        const v = valueFor[it.fieldId];
        if (v == null) continue;
        try { await db.updateItem(it.id, v); } catch { /* best-effort */ }
      }
    }
  }

  redirect(`/requests/${id}`);
}

// Chase every still-open owner on a campaign in one click: re-send the request email
// (same shape as addContactAction) and bump each contact's reminder cadence. Owners
// who already submitted ("received") are skipped. Best-effort per contact.
export async function remindAllPendingAction(campaignId: string): Promise<void> {
  requireConsultant();
  const campaign = await db.getCampaign(campaignId);
  if (!campaign) redirect(`/requests/${campaignId}`);

  for (const contact of campaign!.contacts) {
    if (contact.status === "received") continue;
    try {
      await sendRequestEmail(
        {
          clientName: campaign!.clientName,
          contactName: contact.name || null,
          contactEmail: contact.email,
          deadline: campaign!.deadline,
          reportingPeriod: campaign!.reportingPeriod,
          items: contact.items.map((it) => ({ label: it.label, unit: it.unit })),
          token: contact.token,
          kind: "reminder",
        },
        `${baseUrl()}/submit/${contact.token}`
      );
      await db.markReminded(contact.id, (contact.remindersSent || 0) + 1);
    } catch { /* best-effort per contact */ }
  }
  redirect(`/requests/${campaignId}`);
}

// A token for the sample owners (their links are never emailed). randomBytes keeps
// it consistent with addContactAction's real tokens.
function randToken(): string {
  return randomBytes(24).toString("base64url");
}

// Most recently completed Indian financial year (Apr–Mar), e.g. "FY 2024-25".
function mostRecentCompletedFy(): string {
  const now = new Date();
  // Before April, the last completed FY ended the previous calendar year.
  const endYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const startYear = endYear - 1;
  return `FY ${startYear}-${String(endYear).slice(2)}`;
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
