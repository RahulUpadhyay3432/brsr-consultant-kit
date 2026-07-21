"use server";

// Public (no-auth) "Why it matters" action for a Brief card. Explains an already-
// cited item's stakes to an Indian ESG consultant, grounded strictly to that item's
// own title + summary (no new facts). Best-effort, never throws; rate-capped per
// warm instance so it can't be used to burn the shared Groq keys.
import { groqComplete, groqConfigured } from "@/lib/datarequest/groq";
import { setWhyItMatters } from "./news";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_IN_WINDOW = 80;
let hits: number[] = [];
function allow(): boolean {
  const now = Date.now();
  hits = hits.filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_IN_WINDOW) return false;
  hits.push(now);
  return true;
}

const SYSTEM = `You explain why a single ESG/sustainability item matters to an Indian ESG and BRSR consultant.
Use ONLY the facts in the provided title and summary. Never invent or add any fact, number, name, or date.
Write 2 to 3 calm, practical sentences focused on the "so what" for a consultant advising Indian companies: what to do, watch, or prepare. No hype, no emojis, no exclamation marks.`;

export async function whyItMattersAction(input: {
  id: string;
  title: string;
  summary: string;
}): Promise<{ text: string | null }> {
  if (!groqConfigured() || !allow()) return { text: null };
  const title = String(input.title || "").slice(0, 300).trim();
  const summary = String(input.summary || "").slice(0, 900).trim();
  if (!title) return { text: null };

  const raw = await groqComplete(SYSTEM, `Title: ${title}\n\nSummary: ${summary}`, {
    maxTokens: 220,
    temperature: 0.3,
    salt: title.length,
  });
  const text = raw?.trim() || null;

  // Cache on the news row so it's generated once (curated items cache client-side).
  if (text && input.id?.startsWith("news-")) {
    await setWhyItMatters(input.id.slice("news-".length), text).catch(() => {});
  }
  return { text };
}
