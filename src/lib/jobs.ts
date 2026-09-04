// Curated ESG / sustainability jobs board. Roles come from two places: hand-picked
// entries in src/data/jobs.json (always shown), plus link-verified listings ingested
// by the scraping pipeline (src/lib/jobs/*) and served from /api/jobs. Both link to
// the original posting; nothing is fabricated.
// NOTE: this module is imported by server routes (via src/lib/jobs/db.ts), so it must
// stay hook-free. The client `useMergedJobs` hook lives in src/lib/jobs/useMergedJobs.ts.
import jobsData from "@/data/jobs.json";
import { canonicalUrl } from "@/lib/jobs/url";

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

// A rich, structured chunk of a job description: an optional heading, an optional
// intro paragraph, and an optional bullet list. When a job has `sections`, the
// detail views render these instead of the plain `aboutRole` prose.
export interface JobSection {
  heading?: string;
  body?: string;
  bullets?: string[];
}

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
  aboutRole?: string;       // longer "About the job" detail-pane copy (fallback)
  sections?: JobSection[];  // rich, structured description (headings + bullets)
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

// ── Sorting ──────────────────────────────────────────────────────────────────
// Deliberately no "by salary": only a minority of postings state one, and those
// that do state it as free text ("12-18 LPA", "As per industry", "Competitive"),
// so a salary sort would silently rank on a number parsed out of prose. Better to
// offer three orders that are always true than four where one quietly lies.
export type JobSort = "newest" | "oldest" | "company";

export const JOB_SORTS: { value: JobSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "company", label: "Company A-Z" },
];

export function sortJobs(jobs: Job[], sort: JobSort): Job[] {
  const byDate = (a: Job, b: Job) => (b.postedDate || "").localeCompare(a.postedDate || "");
  return [...jobs].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return -byDate(a, b);
      case "company": {
        // Some listings never name the employer. An empty string sorts first,
        // which puts the anonymous roles at the head of an A-Z list; push them
        // to the end instead, where an unnamed company belongs.
        const an = realCompany(a.company) || "";
        const bn = realCompany(b.company) || "";
        if (!an !== !bn) return an ? -1 : 1;
        return an.localeCompare(bn, "en", { sensitivity: "base" }) || byDate(a, b);
      }
      default:
        // Featured roles are pinned only in the default order. Once someone picks
        // an explicit sort, honour it — a pinned card in an A-Z list reads as a bug.
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || byDate(a, b);
    }
  });
}

// ── Text tidy ────────────────────────────────────────────────────────────────
// Listings arrive from job boards and from the extraction model, and both sprinkle
// em and en dashes through titles and prose. The rest of the product was scrubbed
// of them deliberately; this keeps ingested copy to the same house style, at render
// time, so it applies to rows already stored.
export function deDash(text: string): string;
export function deDash(text: undefined): undefined;
export function deDash(text?: string): string | undefined;
export function deDash(text?: string): string | undefined {
  if (!text) return text;
  return text
    // Take the spacing from the source rather than imposing one. A spaced dash was
    // punctuation ("Manager - Environment"); an unspaced one joined a compound or a
    // range ("Mid-Senior", "3-5 years"), and spacing those out would misread them.
    .replace(/ *[–—] */g, (m) => (/ /.test(m) ? " - " : "-"))
    .replace(/\s{2,}/g, " ")
    .trim();
}

// The extraction model is told to omit a field it cannot fill, and mostly does,
// but for the employer it sometimes answers in words instead: "Unknown",
// "(Unnamed)", "(Company not specified in text)". Those reached the board as if
// they were real employers, and a leading bracket even sorted them to the top of
// A-Z. Treat them as absent so the graceful fallback shows instead.
const NO_COMPANY = /^(unknown|unnamed|none|n\.?\/?a\.?|na|unspecified|confidential|not\s+specified|not\s+available|no\s+company(\s+name)?|company\s+not\s+specified.*|.*not\s+specified\s+in\s+text)$/i;

export function realCompany(name?: string): string | undefined {
  // Matched against the WHOLE value, with any wrapping brackets removed, so a real
  // firm that merely starts with one of these words ("NA Consulting", "Nonesuch")
  // is not thrown away.
  const n = (name || "").trim().replace(/^\(+|\)+$/g, "").trim();
  if (!n || NO_COMPANY.test(n)) return undefined;
  return deDash(n);
}

export function jobChips(j: Job): string[] {
  // Seniority and experience are free text from the posting ("Mid-Senior",
  // "3-5 yrs"), so they get the same dash treatment as the prose.
  return [jobTypeLabel(j.type), workModeLabel(j.workMode), j.seniority, j.experience]
    .filter(Boolean)
    .map((c) => deDash(c as string)) as string[];
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
  // Compare on the canonical link, not the raw one: a scraped row can carry the
  // board's listing-position params (`?ref=kp&jobPos=7`) on a URL we already
  // curate by hand, which would otherwise show the same role on the board twice.
  const urls = new Set(curated.map((j) => canonicalUrl(j.applyUrl)));
  const seen = new Set<string>();
  const extra = stored.filter((j) => {
    if (!j.applyUrl) return false;
    const key = canonicalUrl(j.applyUrl);
    if (urls.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
