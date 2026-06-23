"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { fieldsByIds } from "./fields";
import * as db from "./db";
import { sendRequestEmail, sendSubmissionAlert } from "./email";
import { uploadEvidence } from "./storage";
import { generateNarrative, type NarrativeResult } from "./narrative";
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
