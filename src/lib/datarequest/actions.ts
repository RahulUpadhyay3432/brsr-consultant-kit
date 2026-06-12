"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { fieldsByIds } from "./fields";
import * as db from "./db";
import { sendRequestEmail } from "./email";

function baseUrl(): string {
  return process.env.APP_BASE_URL || "http://localhost:3000";
}

// 1) Consultant creates a campaign (one client). Owners are added next.
export async function createCampaignAction(formData: FormData): Promise<void> {
  const clientName = String(formData.get("clientName") || "").trim();
  const deadline = (String(formData.get("deadline") || "").trim() || null) as string | null;
  if (!clientName) redirect("/requests/new?error=missing");

  const id = await db.createCampaign(clientName, deadline);
  redirect(`/requests/${id}`);
}

// 2) Consultant adds a data owner to a campaign and sends them a request.
export async function addContactAction(
  campaignId: string, clientName: string, deadline: string | null, formData: FormData
): Promise<void> {
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
      items: fields.map((f) => ({ label: f.label, unit: f.unit ?? null })),
      token,
    },
    `${baseUrl()}/submit/${token}`
  );

  redirect(`/requests/${campaignId}`);
}

// 3) Recipient submits their values (token bound in the page).
export async function submitDataAction(token: string, formData: FormData): Promise<void> {
  const found = await db.getContactByToken(token);
  if (!found) redirect("/submit/invalid");

  const { contact } = found!;
  let received = 0;
  for (const item of contact.items) {
    const v = formData.get(`f_${item.id}`);
    const val = v == null ? "" : String(v).trim();
    if (val !== "") {
      await db.updateItem(item.id, val);
      received++;
    } else if (item.status === "received") {
      received++; // already had a value, left unchanged
    }
  }

  const status = received === 0 ? "pending" : received === contact.items.length ? "received" : "partial";
  await db.setContactStatus(contact.id, status);

  redirect(`/submit/${token}?done=1`);
}
