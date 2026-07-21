// Web-push for Saaksh Brief: store browser push subscriptions and fan a
// notification out to all of them when fresh news lands. Best-effort throughout,
// never throws; a missing table or missing VAPID keys just no-ops. SDK-free
// Supabase access mirrors news.ts.
import "server-only";
import webpush from "web-push";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:rahulu626@gmail.com";

let vapidReady = false;
function ensureVapid(): boolean {
  if (vapidReady) return true;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
    vapidReady = true;
    return true;
  } catch {
    return false;
  }
}

export function pushConfigured(): boolean {
  return !!URL && !!KEY && !!VAPID_PUBLIC && !!VAPID_PRIVATE;
}

async function rest(path: string, init?: RequestInit & { prefer?: string }): Promise<Response> {
  if (!URL || !KEY) throw new Error("supabase-not-configured");
  const headers: Record<string, string> = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
  };
  if (init?.prefer) headers["Prefer"] = init.prefer;
  const res = await fetch(`${URL}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text().catch(() => "")}`);
  return res;
}

export interface PushSub {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// Store (or refresh) a subscription. Idempotent on the endpoint unique index.
export async function saveSubscription(sub: PushSub): Promise<boolean> {
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return false;
  try {
    await rest("push_subscriptions?on_conflict=endpoint", {
      method: "POST",
      prefer: "resolution=merge-duplicates",
      body: JSON.stringify({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
  if (!endpoint) return;
  try {
    await rest(`push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, { method: "DELETE" });
  } catch {
    /* best-effort */
  }
}

interface SubRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;   // where a tap should open (defaults to /brief)
  tag?: string;   // collapse key so repeats replace rather than stack
}

// Send one notification to every stored subscription. Prunes endpoints the push
// service reports as gone (404/410). Returns how many were delivered.
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; pruned: number }> {
  if (!pushConfigured() || !ensureVapid()) return { sent: 0, pruned: 0 };
  let rows: SubRow[] = [];
  try {
    const res = await rest("push_subscriptions?select=endpoint,p256dh,auth");
    rows = (await res.json()) as SubRow[];
  } catch {
    return { sent: 0, pruned: 0 };
  }
  const data = JSON.stringify({ url: "/brief", ...payload });
  let sent = 0;
  const dead: string[] = [];
  await Promise.all(
    rows.map(async (r) => {
      try {
        await webpush.sendNotification(
          { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
          data,
          { TTL: 60 * 60 * 12 }
        );
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) dead.push(r.endpoint);
      }
    })
  );
  await Promise.all(dead.map((e) => removeSubscription(e)));
  return { sent, pruned: dead.length };
}
