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

// A consultant asking to be listed in the directory.
//
// Same posture as postGigAction: stored against the access-request table with a
// "[DIRECTORY]" marker so no migration is needed, and treated as an inbox rather
// than the directory itself. Contact details are collected so we can reply, but
// the published profile carries only the link the consultant gives us, never an
// email or a phone number.
export async function listConsultantAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  if (String(formData.get("company_url") || "").trim()) return { ok: true }; // honeypot

  const name = cap(String(formData.get("name") || "").trim(), 120);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const headline = cap(String(formData.get("headline") || "").trim(), 160);
  const location = cap(String(formData.get("location") || "").trim(), 120);
  const expertise = cap(String(formData.get("expertise") || "").trim(), 240);
  const experience = cap(String(formData.get("experience") || "").trim(), 60);
  const link = cap(String(formData.get("link") || "").trim(), 300);
  const about = cap(String(formData.get("about") || "").trim(), 1200);

  if (!name || !EMAIL_RE.test(email) || email.length > MAX_EMAIL || !headline) {
    return { ok: false, message: "Please add your name, a valid email, and a one-line headline." };
  }

  const message = cap(
    [
      `[DIRECTORY] ${headline}`,
      location && `Location: ${location}`,
      expertise && `Expertise: ${expertise}`,
      experience && `Experience: ${experience}`,
      link && `Link: ${link}`,
      about && `About: ${about}`,
    ]
      .filter(Boolean)
      .join("\n"),
    2000
  );

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  try {
    if (await db.recentAccessRequestExists(email, since)) return { ok: true };
  } catch { /* fall through and record */ }

  await db.addAccessRequest({ name, organisation: "", email, clients: "", message }).catch(() => {});
  if (allowFounderEmail()) {
    await notifyFounder(`Directory listing: ${name}`, [
      ["Name", name],
      ["Headline", headline],
      ["Email", email],
      ["Location", location || "not given"],
      ["Expertise", expertise || "not given"],
      ["Experience", experience || "not given"],
      ["Link", link || "not given"],
      ["About", about || "not given"],
    ]).catch(() => {});
  }

  return { ok: true };
}

// A one-off freelance assignment someone wants listed on the gigs board.
//
// Deliberately reuses the access-request table with a "[GIG]" marker rather than
// adding a schema, exactly as the agency/partner nudge does. Gigs are curated by
// hand into src/data/gigs.json before they appear, so the store here is an inbox,
// not the board: nothing a stranger submits goes live unreviewed.
export async function postGigAction(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  if (String(formData.get("company_url") || "").trim()) return { ok: true }; // honeypot

  const name = cap(String(formData.get("name") || "").trim(), 120);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const organisation = cap(String(formData.get("organisation") || "").trim(), 200);
  const title = cap(String(formData.get("title") || "").trim(), 200);
  const location = cap(String(formData.get("location") || "").trim(), 120);
  const budget = cap(String(formData.get("budget") || "").trim(), 60);
  const brief = cap(String(formData.get("brief") || "").trim(), 1500);

  if (!name || !EMAIL_RE.test(email) || email.length > MAX_EMAIL || !title) {
    return { ok: false, message: "Please add your name, a valid email, and what the assignment is." };
  }

  const message = cap(
    [
      `[GIG] ${title}`,
      location && `Location: ${location}`,
      budget && `Budget: ${budget}`,
      brief && `Brief: ${brief}`,
    ]
      .filter(Boolean)
      .join("\n"),
    2000
  );

  // Same 24h per-email dedupe as the access form, so a double submit or a retry
  // loop cannot flood the inbox. Someone with a genuine second gig can post it
  // tomorrow, or reply to the acknowledgement.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  try {
    if (await db.recentAccessRequestExists(email, since)) return { ok: true };
  } catch { /* fall through and record */ }

  await db.addAccessRequest({ name, organisation, email, clients: "", message }).catch(() => {});
  if (allowFounderEmail()) {
    await notifyFounder(`Gig submitted: ${title}`, [
      ["Assignment", title],
      ["Posted by", name],
      ["Organisation", organisation || "not given"],
      ["Email", email],
      ["Location", location || "not given"],
      ["Budget", budget || "not given"],
      ["Brief", brief || "not given"],
    ]).catch(() => {});
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
  const rawMessage = cap(String(formData.get("message") || "").trim(), 2000);
  const agency = String(formData.get("agency") || "").trim() === "yes";
  // Tag agency/partnership interest inline (no schema change) so it's captured in
  // the stored lead and stands out in the founder email.
  const message = agency ? cap(`[AGENCY / PARTNERSHIP INTEREST] ${rawMessage}`.trim(), 2000) : rawMessage;

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
    await notifyFounder(`Pro access request from ${name}${agency ? " (AGENCY / PARTNER)" : ""}`, [
      ["Name", name],
      ["Organisation", organisation || "—"],
      ["Email", email],
      ["Clients", clients || "—"],
      ["Agency / partner interest", agency ? "YES — wants to bundle/resell Saaksh" : "—"],
      ["Message", message || "—"],
    ]).catch(() => {});
  }

  return { ok: true };
}
