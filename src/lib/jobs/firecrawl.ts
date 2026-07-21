// Firecrawl scrape client: turns any URL (incl. JS-heavy, bot-walled boards) into
// clean markdown for LLM extraction. Best-effort, never throws; no-ops without a key.
// https://docs.firecrawl.dev/api-reference/endpoint/scrape
import "server-only";

const KEY = process.env.FIRECRAWL_API_KEY;

export function firecrawlConfigured(): boolean {
  return !!KEY;
}

export async function scrapeMarkdown(url: string, timeoutMs = 30000): Promise<string | null> {
  if (!KEY || !url) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { markdown?: string } };
    return data?.data?.markdown?.slice(0, 40000) || null;
  } catch {
    return null;
  }
}

// Best-effort liveness check: is a job posting still reachable (not 404/410/gone)?
// A GET (some hosts 405 HEAD). Treats a fetch failure as "unknown → keep".
export async function isLikelyLive(url: string, timeoutMs = 10000): Promise<boolean> {
  if (!url) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SaakshJobs/1.0)" },
      cache: "no-store",
    });
    clearTimeout(timer);
    return res.status !== 404 && res.status !== 410;
  } catch {
    return true; // network hiccup — don't drop a possibly-good link
  }
}
