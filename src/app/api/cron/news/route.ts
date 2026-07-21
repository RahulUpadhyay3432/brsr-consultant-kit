import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { runIngest } from "@/lib/brief/ingest";

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
  return NextResponse.json(result);
}
