import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { runIngest } from "@/lib/brief/ingest";
import { sendPushToAll } from "@/lib/brief/push";
import { CATEGORY_BY_SLUG } from "@/lib/brief/types";
import type { BriefCategory } from "@/lib/brief/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Quiet-hours + a light rolling cap so subscribers are never pinged at night or too
// often. In-memory per warm instance (mirrors datarequest/throttle.ts) — a best-effort
// backstop, not a durable guarantee; the cron already only pushes on genuinely-new items.
const PUSH_WINDOW_MS = 3 * 60 * 60 * 1000; // 3h
const PUSH_MAX_IN_WINDOW = 4;
const pushHits: number[] = [];

function istHour(now: number): number {
  // IST is UTC+5:30 year-round (no DST).
  return new Date(now + 5.5 * 60 * 60 * 1000).getUTCHours();
}

function pushAllowedNow(now: number): { ok: boolean; reason?: string } {
  const h = istHour(now);
  if (h < 8 || h > 21) return { ok: false, reason: "quiet-hours" }; // send only ~8am–10pm IST
  while (pushHits.length && now - pushHits[0] > PUSH_WINDOW_MS) pushHits.shift();
  if (pushHits.length >= PUSH_MAX_IN_WINDOW) return { ok: false, reason: "rate-capped" };
  pushHits.push(now);
  return { ok: true };
}

// Refreshes the Saaksh Brief news feed: pulls RSS, grounded-summarises new items,
// stores them, prunes old ones. Secured by CRON_SECRET (Vercel Cron injects the
// header; the optional GitHub Action passes it explicitly). Best-effort, so a
// misconfigured run returns { configured: false } rather than erroring.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runIngest();
  revalidatePath("/brief");

  // Notify subscribers only on genuinely-new items. Most runs insert 0 (dedup),
  // so this fires a handful of times a day, not every refresh. Best-effort.
  const fresh = result.insertedItems || [];
  let push: { sent: number; pruned: number } | undefined;
  let pushSkipped: string | undefined;
  if (fresh.length) {
    const gate = pushAllowedNow(Date.now());
    if (!gate.ok) {
      pushSkipped = gate.reason; // new items still stored + shown; we just don't ping now
    } else {
      const top = fresh[0];
      const cat = CATEGORY_BY_SLUG[top.category_slug as BriefCategory];
      push =
        fresh.length === 1
          ? await sendPushToAll({ title: top.title, body: `${cat ? cat.label + " · " : ""}Tap for the 30-second brief.`, tag: "brief-news" })
          : await sendPushToAll({ title: `${fresh.length} new ESG & BRSR updates`, body: top.title, tag: "brief-news" });
    }
  }
  return NextResponse.json({ ...result, push, pushSkipped });
}
