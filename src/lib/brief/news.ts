// Supabase access for the `brsr_news` table (Saaksh Brief's fresh news source),
// via PostgREST + the service_role key, same SDK-free posture as datarequest/db.ts.
// Every reader/writer is best-effort: if the table isn't migrated yet the feed just
// falls back to curated regs + blog guides, and ingestion no-ops.
import "server-only";
import type { BriefCategory, BriefItem } from "./types";
import { CATEGORY_BY_SLUG, relativeTime } from "./types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function newsConfigured(): boolean {
  return !!URL && !!KEY;
}

async function rest(path: string, init?: RequestInit & { prefer?: string }): Promise<Response> {
  if (!URL || !KEY) throw new Error("supabase-not-configured");
  const headers: Record<string, string> = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
  };
  if (init?.prefer) headers["Prefer"] = init.prefer;
  const res = await fetch(`${URL}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text().catch(() => "")}`);
  return res;
}

interface NewsRow {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string | null;
  category_slug: string;
  image_url: string | null;
  why_it_matters: string | null;
  published_at: string;
}

const MODEL_LABEL = (process.env.GROQ_MODEL || "openai/gpt-oss-20b").split("/").pop() || "gpt-oss";

function mapRow(r: NewsRow): BriefItem {
  const category = (CATEGORY_BY_SLUG[r.category_slug as BriefCategory] ? r.category_slug : "global") as BriefCategory;
  return {
    id: `news-${r.id}`,
    kind: "news",
    category,
    tagLabel: CATEGORY_BY_SLUG[category].label,
    date: r.published_at,
    displayDate: relativeTime(r.published_at),
    title: r.title,
    summary: r.summary,
    href: r.source_url,
    external: true,
    sourceName: r.source_name || undefined,
    aiSummary: true,
    imageUrl: r.image_url || undefined,
    model: MODEL_LABEL,
    whyItMatters: r.why_it_matters || undefined,
  };
}

// The freshest news in the window, newest first. [] on any error (pre-migration etc.).
export async function fetchBriefNews(days = 14, limit = 120): Promise<BriefItem[]> {
  try {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const res = await rest(
      `brsr_news?published_at=gte.${since}&select=*&order=published_at.desc&limit=${limit}`
    );
    return ((await res.json()) as NewsRow[]).map(mapRow);
  } catch {
    return [];
  }
}

// The subset of the given source_urls already stored, so ingestion can skip them.
export async function existingUrls(urls: string[]): Promise<Set<string>> {
  if (!urls.length) return new Set();
  try {
    // The table holds only a rolling window (pruneOldNews), so fetching every stored
    // URL is small and bounded. An in.(...) filter with hundreds of long Google News
    // URLs exceeds the request-line limit and fails silently, killing dedup.
    const res = await rest(`brsr_news?select=source_url&order=created_at.desc&limit=2000`);
    const stored = new Set(((await res.json()) as { source_url: string }[]).map((r) => r.source_url));
    return new Set(urls.filter((u) => stored.has(u)));
  } catch {
    return new Set();
  }
}

export interface NewsInsert {
  title: string;
  summary: string;
  source_url: string;
  source_name: string | null;
  category_slug: string;
  image_url: string | null;
  published_at: string;
}

// Insert new rows, ignoring any that collide on the source_url unique index.
// Returns the rows that were actually inserted (duplicates are excluded), so a
// caller can notify only on genuinely-new items.
export async function insertNews(rows: NewsInsert[]): Promise<NewsInsert[]> {
  if (!rows.length) return [];
  try {
    const res = await rest("brsr_news?on_conflict=source_url", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=representation",
      body: JSON.stringify(rows),
    });
    return (await res.json()) as NewsInsert[];
  } catch {
    return [];
  }
}

// Drop rows older than the window so the feed stays a rolling brief.
export async function pruneOldNews(days = 14): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    await rest(`brsr_news?published_at=lt.${cutoff}`, { method: "DELETE" });
  } catch {
    /* best-effort */
  }
}

// Lazily persist a generated "Why it matters" so it's computed once per item.
export async function setWhyItMatters(newsId: string, text: string): Promise<void> {
  try {
    await rest(`brsr_news?id=eq.${encodeURIComponent(newsId)}`, {
      method: "PATCH",
      body: JSON.stringify({ why_it_matters: text }),
    });
  } catch {
    /* best-effort */
  }
}
