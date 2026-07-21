import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { runIngest } from "@/lib/brief/ingest";
import { sendPushToAll } from "@/lib/brief/push";
import { CATEGORY_BY_SLUG } from "@/lib/brief/types";
import type { BriefCategory } from "@/lib/brief/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  if (fresh.length) {
    const top = fresh[0];
    const cat = CATEGORY_BY_SLUG[top.category_slug as BriefCategory];
    push =
      fresh.length === 1
        ? await sendPushToAll({ title: top.title, body: `${cat ? cat.label + " · " : ""}Tap for the 30-second brief.`, tag: "brief-news" })
        : await sendPushToAll({ title: `${fresh.length} new ESG & BRSR updates`, body: top.title, tag: "brief-news" });
  }
  return NextResponse.json({ ...result, push });
}
