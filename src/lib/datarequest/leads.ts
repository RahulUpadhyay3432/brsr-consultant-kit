"use server";

// Public (no-auth) marketing capture actions: newsletter signup + Pro-access
// requests. Both are best-effort and never throw, they store to Supabase and,
// when that isn't possible yet (table not created / transient), fall back to a
// founder email so nothing is lost. A hidden honeypot field drops obvious bots.

import * as db from "./db";
import { notifyFounder } from "./email";
import { allowFounderEmail } from "./throttle";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254; // RFC 5321 practical max

// Hard length caps so an oversized POST (bodySizeLimit is 12mb) can't persist a
// huge string or bloat the founder email. Optional fields are truncated; the
// email is rejected outright if malformed or over-length.
const cap = (s: string, n: number): string => (s.length > n ? s.slice(0, n) : s);

// Newsletter / regulatory-updates signup.
export async function subscribeAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  // Honeypot: a real user never fills a hidden field. Pretend success for bots.
  if (String(formData.get("company_url") || "").trim()) return { ok: true };

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const source = cap(String(formData.get("source") || "").trim() || "site", 60);
  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL) {
    return { ok: false, message: "Please enter a valid email." };
  }

  try {
    await db.addSubscriber(email, source);
  } catch {
    // Table may not exist yet (pre-migration) or a transient error: don't lose
    // the signup, notify the founder instead. Best-effort, rate-capped, never surfaced.
    if (allowFounderEmail()) {
      await notifyFounder("New Saaksh signup", [["Email", email], ["Source", source]]).catch(() => {});
    }
  }
  return { ok: true };
}

// On-site "Request Pro access" lead form (replaces the old mailto).
export async function requestAccessAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  if (String(formData.get("company_url") || "").trim()) return { ok: true }; // honeypot

  const name = cap(String(formData.get("name") || "").trim(), 120);
  const organisation = cap(String(formData.get("organisation") || "").trim(), 200);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const clients = cap(String(formData.get("clients") || "").trim(), 60);
  const message = cap(String(formData.get("message") || "").trim(), 2000);

  if (!name || !EMAIL_RE.test(email) || email.length > MAX_EMAIL) {
    return { ok: false, message: "Please add your name and a valid email." };
  }

  // Dedupe: a repeat request from the same email within 24h is a silent no-op
  // (still shows success), so a loop can't flood the table or the inbox. Best-
  // effort, if the check fails we fall through and record as before.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  try {
    if (await db.recentAccessRequestExists(email, since)) return { ok: true };
  } catch { /* fall through and record */ }

  // Store (durable) and notify (immediate, rate-capped). Both best-effort.
  await db.addAccessRequest({ name, organisation, email, clients, message }).catch(() => {});
  if (allowFounderEmail()) {
    await notifyFounder(`Pro access request from ${name}`, [
      ["Name", name],
      ["Organisation", organisation || "—"],
      ["Email", email],
      ["Clients", clients || "—"],
      ["Message", message || "—"],
    ]).catch(() => {});
  }

  return { ok: true };
}
