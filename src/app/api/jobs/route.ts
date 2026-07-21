// Public read of the ingested/stored jobs (brsr_jobs), merged into the board on top
// of the curated jobs.json. Best-effort: returns [] before the table/pipeline exist,
// so the board always works from curated data.
import { NextResponse } from "next/server";
import { fetchStoredJobs } from "@/lib/jobs/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = await fetchStoredJobs();
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ jobs: [] });
  }
}
