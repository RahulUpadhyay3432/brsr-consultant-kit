// Saaksh Brief ingestion: pull ESG/BRSR/carbon news from RSS, summarise each item
// with a grounded Groq call (no invented facts), quality-gate, dedup, and store.
// Best-effort throughout, never throws; a failure just means fewer new cards.
import "server-only";
import Parser from "rss-parser";
import { groqComplete, groqConfigured } from "@/lib/datarequest/groq";
import type { BriefCategory } from "./types";
import { CATEGORY_DEFINITIONS } from "./types";
import { existingUrls, insertNews, pruneOldNews, newsConfigured, type NewsInsert } from "./news";
import { fetchPageMeta } from "./page-meta";
import { isBadSummary } from "./quality";

const VALID: BriefCategory[] = ["brsr", "assurance", "cbam", "carbon-markets", "global", "guides"];
const MAX_PER_RUN = 20; // bound Groq calls + article fetches to stay under the function timeout

const gnews = (q: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;

// Curated source queries. Google News RSS is free, India-scoped, and reliable.
export const BRIEF_SOURCES: string[] = [
  gnews('BRSR OR "business responsibility and sustainability report" SEBI'),
  gnews("CBAM India exporter carbon border adjustment"),
  gnews('CCTS OR "carbon credit trading scheme" India carbon market'),
  gnews("SEBI ESG disclosure India sustainability"),
  gnews("CSRD OR ESRS OR EcoVadis OR CDP sustainability reporting"),
  gnews("BRSR Core assurance India"),
];

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

interface Candidate {
  title: string;
  link: string;
  sourceName: string | null;
  publishedAt: string;
  snippet: string;
}

// Parse all feeds into a deduped candidate list, newest first.
async function collectCandidates(): Promise<Candidate[]> {
  const parser = new Parser({ timeout: 12000 });
  const seen = new Set<string>();
  const out: Candidate[] = [];
  const feeds = await Promise.allSettled(BRIEF_SOURCES.map((u) => parser.parseURL(u)));
  for (const f of feeds) {
    if (f.status !== "fulfilled") continue;
    for (const it of f.value.items || []) {
      const link = (it.link || "").trim();
      if (!link || seen.has(link)) continue;
      seen.add(link);
      // Google News titles are "Headline - Publisher"; split the source off.
      let title = (it.title || "").trim();
      let sourceName: string | null = null;
      const m = title.match(/^(.+?)\s+-\s+([^-]{2,60})$/);
      if (m) { title = m[1].trim(); sourceName = m[2].trim(); }
      if (!title) continue;
      out.push({
        title,
        link,
        sourceName,
        publishedAt: it.isoDate || (it.pubDate ? new Date(it.pubDate).toISOString() : new Date().toISOString()),
        snippet: stripHtml(it.contentSnippet || it.content || "").slice(0, 600),
      });
    }
  }
  return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

const SYSTEM = `You classify and summarise a single ESG/sustainability news item for a digest read by Indian ESG and BRSR consultants.
STRICT RULES:
- Use ONLY the provided title and text. Never invent, infer, estimate, or add any fact, number, name, date, or company not present in the input.
- Write a calm, factual summary of 2 to 3 sentences. Present tense, active voice, no hype, no emojis, no exclamation marks. First sentence states the core fact in 10 to 15 words.
- RELEVANCE GATE (strict): the reader is an Indian ESG/BRSR consultant. Output exactly LOW_SIGNAL (and nothing else) UNLESS the item has a real, material angle for them: SEBI / BRSR / BRSR Core / assurance moves; India's CCTS / carbon market / GEI targets; the EU CBAM as it affects Indian exporters; a NAMED INDIAN LISTED COMPANY's ESG/BRSR filing or disclosure; or a genuine CHANGE to a major global framework (CSRD/ESRS, CDP, EcoVadis, IFRS/ISSB, GRI, TNFD). Reject as LOW_SIGNAL: a random foreign company's routine sustainability/CSR report, award, or medal with no India or regulatory angle; product marketing or press-release fluff; generic "company goes green" PR; and anything not about ESG, sustainability reporting, or carbon regulation.
- Otherwise output STRICT JSON only, no prose, no markdown fences: {"category_slug":"<one of the categories>","summary":"<your summary>"}
Categories:
${VALID.map((c) => `- ${c}: ${CATEGORY_DEFINITIONS[c]}`).join("\n")}`;

interface Classified {
  category_slug: BriefCategory;
  summary: string;
}

function parseResult(raw: string | null): Classified | null {
  if (!raw) return null;
  if (/LOW_SIGNAL/i.test(raw) && !raw.includes("{")) return null;
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[0]) as { category_slug?: string; summary?: string };
    const cat = (obj.category_slug || "").toLowerCase() as BriefCategory;
    const summary = (obj.summary || "").trim();
    if (!summary || isBadSummary(summary)) return null;
    return { category_slug: VALID.includes(cat) ? cat : "global", summary: summary.slice(0, 500) };
  } catch {
    return null;
  }
}

// Retry a transient all-keys-rate-limited miss once (groqComplete already rotates
// keys and returns null rather than throwing).
async function groqWithRetry(
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number; salt?: number }
): Promise<string | null> {
  for (let i = 0; i < 2; i++) {
    const r = await groqComplete(system, user, { ...opts, salt: (opts.salt ?? 0) + i });
    if (r) return r;
    if (i === 0) await new Promise((res) => setTimeout(res, 500));
  }
  return null;
}

async function classify(c: Candidate, salt: number): Promise<Classified | null> {
  const meta = await fetchPageMeta(c.link);
  const text = [meta.description, c.snippet].filter(Boolean).join(" ").slice(0, 700) || "(no description available)";
  const raw = await groqWithRetry(SYSTEM, `Title: ${c.title}\n\nText: ${text}`, {
    maxTokens: 260,
    temperature: 0.2,
    salt,
  });
  const parsed = parseResult(raw);
  if (!parsed) return null;
  (parsed as Classified & { image?: string }).image = meta.imageUrl ?? undefined;
  return parsed;
}

export interface IngestResult {
  configured: boolean;
  fetched: number;
  candidates: number;
  kept: number;
  inserted: number;
  samples?: { title: string; category_slug: string; summary: string }[]; // for monitoring
}

// The full pipeline. Safe to call with no Groq / no DB: it degrades to a no-op.
export async function runIngest(): Promise<IngestResult> {
  if (!groqConfigured() || !newsConfigured()) {
    return { configured: false, fetched: 0, candidates: 0, kept: 0, inserted: 0 };
  }
  const all = await collectCandidates();
  const fresh = all.filter((c) => c.link);
  const known = await existingUrls(fresh.map((c) => c.link));
  const candidates = fresh.filter((c) => !known.has(c.link)).slice(0, MAX_PER_RUN);

  const rows: NewsInsert[] = [];
  // Small concurrency so one run doesn't take too long, key rotation via salt.
  const CHUNK = 5;
  for (let i = 0; i < candidates.length; i += CHUNK) {
    const batch = candidates.slice(i, i + CHUNK);
    const results = await Promise.all(batch.map((c, j) => classify(c, i + j)));
    results.forEach((r, j) => {
      if (!r) return;
      const c = batch[j];
      rows.push({
        title: c.title,
        summary: r.summary,
        source_url: c.link,
        source_name: c.sourceName,
        category_slug: r.category_slug,
        image_url: (r as Classified & { image?: string }).image || null,
        published_at: c.publishedAt,
      });
    });
  }

  const inserted = await insertNews(rows);
  await pruneOldNews();
  return {
    configured: true,
    fetched: all.length,
    candidates: candidates.length,
    kept: rows.length,
    inserted,
    samples: rows.slice(0, 4).map((r) => ({ title: r.title, category_slug: r.category_slug, summary: r.summary })),
  };
}
