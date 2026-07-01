"use server";

// Public (no-auth) marketing capture actions: newsletter signup + Pro-access
// requests. Both are best-effort and never throw, they store to Supabase and,
// when that isn't possible yet (table not created / transient), fall back to a
// founder email so nothing is lost. A hidden honeypot field drops obvious bots.

import * as db from "./db";
import { notifyFounder } from "./email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Newsletter / regulatory-updates signup.
export async function subscribeAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  // Honeypot: a real user never fills a hidden field. Pretend success for bots.
  if (String(formData.get("company_url") || "").trim()) return { ok: true };

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const source = String(formData.get("source") || "").trim() || "site";
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Please enter a valid email." };

  try {
    await db.addSubscriber(email, source);
  } catch {
    // Table may not exist yet (pre-migration) or a transient error: don't lose
    // the signup, notify the founder instead. Best-effort, never surfaced.
    await notifyFounder("New Saaksh signup", [["Email", email], ["Source", source]]).catch(() => {});
  }
  return { ok: true };
}

// On-site "Request Pro access" lead form (replaces the old mailto).
export async function requestAccessAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  if (String(formData.get("company_url") || "").trim()) return { ok: true }; // honeypot

  const name = String(formData.get("name") || "").trim();
  const organisation = String(formData.get("organisation") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const clients = String(formData.get("clients") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !EMAIL_RE.test(email)) {
    return { ok: false, message: "Please add your name and a valid email." };
  }

  // Store (durable) and notify (immediate). Both best-effort so at least one lands.
  await db.addAccessRequest({ name, organisation, email, clients, message }).catch(() => {});
  await notifyFounder(`Pro access request from ${name}`, [
    ["Name", name],
    ["Organisation", organisation || "—"],
    ["Email", email],
    ["Clients", clients || "—"],
    ["Message", message || "—"],
  ]).catch(() => {});

  return { ok: true };
}
