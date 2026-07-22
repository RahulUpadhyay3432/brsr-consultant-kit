// Curated ESG / sustainability jobs board. Roles come from two places: hand-picked
// entries in src/data/jobs.json (always shown), plus link-verified listings ingested
// by the scraping pipeline (src/lib/jobs/*) and served from /api/jobs. Both link to
// the original posting; nothing is fabricated.
// NOTE: this module is imported by server routes (via src/lib/jobs/db.ts), so it must
// stay hook-free. The client `useMergedJobs` hook lives in src/lib/jobs/useMergedJobs.ts.
import jobsData from "@/data/jobs.json";

export type JobCategory =
  | "brsr-reporting"
  | "assurance"
  | "carbon-climate"
  | "esg-strategy"
  | "sustainability-ops"
  | "ehs"
  | "esg-finance"
  | "other";

export type WorkMode = "onsite" | "hybrid" | "remote";
export type JobType = "full-time" | "part-time" | "contract" | "internship";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;         // "Bengaluru" · "Remote (India)" · "Mumbai · Hybrid"
  category: JobCategory;
  applyUrl: string;         // the original posting (opens in a new tab)
  postedDate: string;       // ISO — when we added it (or the posting's date)
  workMode?: WorkMode;
  type?: JobType;
  seniority?: string;       // free text, e.g. "Entry", "3–5 yrs", "Senior"
  salary?: string;          // free text, e.g. "₹12–18 LPA" (omit if unknown)
  experience?: string;      // free text, e.g. "2–4 years"
  summary?: string;         // 1–2 lines on the role (list preview)
  aboutRole?: string;       // longer "About the job" detail-pane copy
  aboutCompany?: string;    // "About the company" detail-pane copy
  companySize?: string;     // e.g. "50–200 people"
  tags?: string[];          // skills / keywords
  sourceName?: string;      // where it's posted, e.g. "LinkedIn" / company site
  featured?: boolean;       // pin to the top + a "Featured" badge
  activelyHiring?: boolean; // green "Actively hiring" signal
  closed?: boolean;         // applications closed (dimmed, no apply)
}

export const JOB_CATEGORIES: { slug: JobCategory; label: string }[] = [
  { slug: "brsr-reporting", label: "BRSR & Reporting" },
  { slug: "assurance", label: "ESG Assurance" },
  { slug: "carbon-climate", label: "Carbon & Climate" },
  { slug: "esg-strategy", label: "ESG Strategy" },
  { slug: "sustainability-ops", label: "Sustainability Ops" },
  { slug: "ehs", label: "EHS" },
  { slug: "esg-finance", label: "ESG Finance" },
  { slug: "other", label: "Other" },
];

export const CATEGORY_LABEL: Record<JobCategory, string> = Object.fromEntries(
  JOB_CATEGORIES.map((c) => [c.slug, c.label])
) as Record<JobCategory, string>;

const WORK_MODE_LABEL: Record<WorkMode, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};
const JOB_TYPE_LABEL: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

export const workModeLabel = (m?: WorkMode) => (m ? WORK_MODE_LABEL[m] : null);
export const jobTypeLabel = (t?: JobType) => (t ? JOB_TYPE_LABEL[t] : null);

// All jobs, featured first then newest. Only categories that actually appear are
// surfaced as filters, so an empty category never shows an empty pill.
export function getJobs(): Job[] {
  return [...(jobsData.jobs as Job[])].sort(
    (a, b) =>
      (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
      (b.postedDate || "").localeCompare(a.postedDate || "")
  );
}

export function jobChips(j: Job): string[] {
  return [jobTypeLabel(j.type), workModeLabel(j.workMode), j.seniority, j.experience].filter(
    Boolean
  ) as string[];
}

export function similarJobs(all: Job[], job: Job, limit = 4): Job[] {
  return all.filter((j) => j.category === job.category && j.id !== job.id).slice(0, limit);
}

// Split a prose "about the role" into bullet points on sentence boundaries, so the
// detail views can render responsibilities as a scannable list. Returns [] for empty
// input, and a single-item list if there's only one sentence.
export function toBullets(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map((s) => s.trim().replace(/\s+/g, " ").replace(/[.]+$/, ""))
    .filter((s) => s.length > 1);
}

export function matchesQuery(j: Job, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  return `${j.title} ${j.company} ${(j.tags || []).join(" ")}`.toLowerCase().includes(query);
}

// Merge curated jobs.json with ingested jobs (from /api/jobs), de-duping on apply
// URL (curated wins), featured-first then newest. Used by the client hook.
export function mergeJobs(curated: Job[], stored: Job[]): Job[] {
  const urls = new Set(curated.map((j) => j.applyUrl));
  const extra = stored.filter((j) => j.applyUrl && !urls.has(j.applyUrl));
  return [...curated, ...extra].sort(
    (a, b) =>
      (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
      (b.postedDate || "").localeCompare(a.postedDate || "")
  );
}

// ── Saved jobs (localStorage, SSR-safe; shared by /jobs and the Brief tab) ────
const SAVED_JOBS_KEY = "saaksh:brief:savedjobs";
export function getSavedJobIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_JOBS_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? (list as string[]) : [];
  } catch {
    return [];
  }
}
export function toggleSavedJob(id: string): boolean {
  const list = getSavedJobIds();
  const has = list.includes(id);
  const next = has ? list.filter((x) => x !== id) : [...list, id];
  try {
    window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
  return !has;
}

export function usedCategories(jobs: Job[]): { slug: JobCategory; label: string }[] {
  const present = new Set(jobs.map((j) => j.category));
  return JOB_CATEGORIES.filter((c) => present.has(c.slug));
}

// "3d ago" / "2w ago" / a date, matching the Latest feed's feel.
export function jobAge(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const day = Math.floor(Math.max(0, now - then) / 86400000);
  if (day <= 0) return "Today";
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
