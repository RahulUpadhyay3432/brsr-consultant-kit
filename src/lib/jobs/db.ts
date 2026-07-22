// Read access for the `brsr_jobs` table (jobs ingested by the free headless scraper,
// scripts/scrape-jobs.mjs) via PostgREST + service_role, same SDK-free posture as
// datarequest/db.ts. Best-effort: before the table is migrated the board simply falls
// back to the curated jobs.json. Writes happen in the scraper script, not here.
import "server-only";
import type { Job, JobCategory } from "@/lib/jobs";
import { JOB_CATEGORIES } from "@/lib/jobs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function jobsDbConfigured(): boolean {
  return !!URL && !!KEY;
}

async function rest(path: string): Promise<Response> {
  if (!URL || !KEY) throw new Error("supabase-not-configured");
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text().catch(() => "")}`);
  return res;
}

const VALID = new Set(JOB_CATEGORIES.map((c) => c.slug));

interface JobRow {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  category: string | null;
  apply_url: string;
  posted_date: string | null;
  type: string | null;
  work_mode: string | null;
  seniority: string | null;
  experience: string | null;
  salary: string | null;
  summary: string | null;
  about_role: string | null;
  about_company: string | null;
  company_size: string | null;
  tags: string[] | null;
  source_name: string | null;
  featured: boolean | null;
  actively_hiring: boolean | null;
  closed: boolean | null;
}

function mapRow(r: JobRow): Job {
  const category = (r.category && VALID.has(r.category as JobCategory) ? r.category : "other") as JobCategory;
  return {
    id: `db-${r.id}`,
    title: r.title,
    company: r.company || "",
    location: r.location || "",
    category,
    applyUrl: r.apply_url,
    postedDate: r.posted_date || "",
    type: (r.type as Job["type"]) || undefined,
    workMode: (r.work_mode as Job["workMode"]) || undefined,
    seniority: r.seniority || undefined,
    experience: r.experience || undefined,
    salary: r.salary || undefined,
    summary: r.summary || undefined,
    aboutRole: r.about_role || undefined,
    aboutCompany: r.about_company || undefined,
    companySize: r.company_size || undefined,
    tags: r.tags || undefined,
    sourceName: r.source_name || undefined,
    featured: r.featured || undefined,
    activelyHiring: r.actively_hiring || undefined,
    closed: r.closed || undefined,
  };
}

// Stored jobs in the freshness window, newest first. [] on any error (pre-migration).
export async function fetchStoredJobs(days = 30, limit = 200): Promise<Job[]> {
  try {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const res = await rest(`brsr_jobs?created_at=gte.${since}&select=*&order=created_at.desc&limit=${limit}`);
    return ((await res.json()) as JobRow[]).map(mapRow);
  } catch {
    return [];
  }
}
