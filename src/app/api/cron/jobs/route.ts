import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { runJobsIngest } from "@/lib/jobs/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Refreshes the curated jobs board with freshly-scraped, link-verified listings.
// Secured by CRON_SECRET. Best-effort: returns { configured:false } if Firecrawl /
// Groq / Supabase aren't set up yet, rather than erroring.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runJobsIngest();
  revalidatePath("/jobs");
  return NextResponse.json(result);
}
