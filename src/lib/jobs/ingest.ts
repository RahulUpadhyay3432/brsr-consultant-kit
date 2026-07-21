// Jobs ingestion: scrape each source page (Firecrawl -> markdown), extract the
// individual openings with a grounded Groq pass, verify each apply link is live,
// dedup, and store in brsr_jobs. Best-effort throughout, never throws. Mirrors the
// Brief news pipeline (src/lib/brief/ingest.ts).
import "server-only";
import { groqComplete, groqConfigured } from "@/lib/datarequest/groq";
import { JOB_CATEGORIES } from "@/lib/jobs";
import { JOB_SOURCES } from "./sources";
import { scrapeMarkdown, isLikelyLive, firecrawlConfigured } from "./firecrawl";
import { existingJobUrls, insertJobs, pruneOldJobs, jobsDbConfigured, type JobInsert } from "./db";

const MAX_PER_SOURCE = 12; // bound extraction + link checks per run
const CATS = JOB_CATEGORIES.map((c) => `${c.slug} (${c.label})`).join(", ");

const SYSTEM = `You extract Indian ESG/sustainability JOB LISTINGS from the markdown of a careers or job-board page, for a curated jobs board.
STRICT RULES:
- Use ONLY the provided markdown. Never invent a company, title, salary, date, or link.
- Include an entry ONLY if it is a specific role with an ABSOLUTE http(s) apply/detail URL present in the markdown. Skip anything without a real link. Skip navigation, ads, and "see all jobs" links.
- Keep only roles based in India (or explicitly Remote-India). Drop unrelated roles.
- Return STRICT JSON only: an array of objects. No prose, no markdown fences. Empty array [] if none.
Each object:
{"title","company","location","applyUrl","category","type","workMode","seniority","experience","salary","summary","aboutRole","aboutCompany","companySize","tags"}
- category: one of ${CATS}. Choose the best fit; use "other" if unsure.
- type: one of full-time, part-time, contract, internship (or omit).
- workMode: one of onsite, hybrid, remote (or omit).
- summary: one line. aboutRole: 3-6 sentences from the posting if available (else omit). tags: up to 6 skills.
- Omit any field you cannot fill; never guess.`;

interface Extracted {
  title?: string; company?: string; location?: string; applyUrl?: string;
  category?: string; type?: string; workMode?: string; seniority?: string;
  experience?: string; salary?: string; summary?: string; aboutRole?: string;
  aboutCompany?: string; companySize?: string; tags?: string[];
}

const VALID_CAT = new Set<string>(JOB_CATEGORIES.map((c) => c.slug));

function parseArray(raw: string | null): Extracted[] {
  if (!raw) return [];
  const m = raw.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[0]) as unknown;
    return Array.isArray(arr) ? (arr as Extracted[]) : [];
  } catch {
    return [];
  }
}

function toRow(e: Extracted, sourceName: string): JobInsert | null {
  const applyUrl = (e.applyUrl || "").trim();
  const title = (e.title || "").trim();
  if (!title || !/^https?:\/\//.test(applyUrl)) return null;
  const cat = (e.category || "").toLowerCase();
  return {
    title,
    company: (e.company || "").trim() || null,
    location: (e.location || "").trim() || null,
    category: VALID_CAT.has(cat) ? cat : "other",
    apply_url: applyUrl,
    posted_date: new Date().toISOString().slice(0, 10),
    type: e.type?.toLowerCase() || null,
    work_mode: e.workMode?.toLowerCase() || null,
    seniority: e.seniority || null,
    experience: e.experience || null,
    salary: e.salary || null,
    summary: e.summary || null,
    about_role: e.aboutRole || null,
    about_company: e.aboutCompany || null,
    company_size: e.companySize || null,
    tags: Array.isArray(e.tags) ? e.tags.slice(0, 6) : null,
    source_name: sourceName,
  };
}

export interface JobsIngestResult {
  configured: boolean;
  sources: number;
  extracted: number;
  verified: number;
  inserted: number;
  samples?: { title: string; company: string | null; source: string | null }[];
}

export async function runJobsIngest(): Promise<JobsIngestResult> {
  if (!firecrawlConfigured() || !groqConfigured() || !jobsDbConfigured()) {
    return { configured: false, sources: 0, extracted: 0, verified: 0, inserted: 0 };
  }

  const candidates: JobInsert[] = [];
  for (let i = 0; i < JOB_SOURCES.length; i++) {
    const src = JOB_SOURCES[i];
    const md = await scrapeMarkdown(src.url);
    if (!md) continue;
    const raw = await groqComplete(SYSTEM, `Source: ${src.sourceName}\n\n${md}`, {
      maxTokens: 2200,
      temperature: 0.1,
      salt: i,
    });
    for (const e of parseArray(raw).slice(0, MAX_PER_SOURCE)) {
      const row = toRow(e, src.sourceName);
      if (row) candidates.push(row);
    }
  }

  // Dedup within this run + against what's already stored.
  const seen = new Set<string>();
  const unique = candidates.filter((c) => (seen.has(c.apply_url) ? false : (seen.add(c.apply_url), true)));
  const known = await existingJobUrls(unique.map((c) => c.apply_url));
  const fresh = unique.filter((c) => !known.has(c.apply_url));

  // Verify each apply link is reachable before storing.
  const verified: JobInsert[] = [];
  const CHUNK = 6;
  for (let i = 0; i < fresh.length; i += CHUNK) {
    const batch = fresh.slice(i, i + CHUNK);
    const live = await Promise.all(batch.map((c) => isLikelyLive(c.apply_url)));
    batch.forEach((c, j) => { if (live[j]) verified.push(c); });
  }

  const inserted = await insertJobs(verified);
  await pruneOldJobs();
  return {
    configured: true,
    sources: JOB_SOURCES.length,
    extracted: candidates.length,
    verified: verified.length,
    inserted,
    samples: verified.slice(0, 5).map((r) => ({ title: r.title, company: r.company, source: r.source_name })),
  };
}
