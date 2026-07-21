// Builds the unified Saaksh Brief feed: fresh AI-summarised news (from Supabase)
// merged with the cited curated regulatory items and the blog guides. The two
// curated sources are never AI-touched, so the highest-trust cards stay pristine.
import "server-only";
import { BLOG_POSTS } from "@/data/blog-posts";
import regulatory from "@/data/regulatory_updates.json";
import type { BriefItem } from "./types";
import { regTagToCategory, relativeTime } from "./types";
import { fetchBriefNews } from "./news";

interface RegUpdate {
  id: string; date: string; display_date: string; tag: string;
  title: string; summary: string; source_label: string; source_url: string;
}

// Curated regulatory items → BriefItems. Cited, never AI-summarised.
const REG_ITEMS: BriefItem[] = (regulatory.updates as RegUpdate[]).map((u) => ({
  id: `reg-${u.id}`,
  kind: "regulation",
  category: regTagToCategory(u.tag),
  tagLabel: u.tag,
  date: u.date,
  displayDate: u.display_date,
  title: u.title,
  summary: u.summary,
  href: u.source_url,
  external: true,
  sourceName: u.source_label,
  aiSummary: false,
}));

// Blog posts → BriefItems (kind "guide"). Real cover photos, never AI-summarised.
const GUIDE_ITEMS: BriefItem[] = BLOG_POSTS.map((p) => ({
  id: `guide-${p.slug}`,
  kind: "guide",
  category: "guides",
  tagLabel: "Guide",
  date: p.date,
  displayDate: relativeTime(p.date),
  title: p.title,
  summary: p.excerpt,
  href: `/blog/${p.slug}`,
  external: false,
  sourceName: p.author?.name,
  aiSummary: false,
  imageUrl: p.coverImage,
}));

// Prevent >2 of the same category in a row, so no topic walls up the feed. Pure,
// stable, degrades to plain recency when categories are already varied.
function interleave(items: BriefItem[]): BriefItem[] {
  const out: BriefItem[] = [];
  const pending = [...items];
  while (pending.length) {
    let idx = 0;
    if (out.length >= 2) {
      const a = out[out.length - 1].category;
      const b = out[out.length - 2].category;
      if (a === b) {
        const alt = pending.findIndex((it) => it.category !== a);
        if (alt !== -1) idx = alt;
      }
    }
    out.push(pending.splice(idx, 1)[0]);
  }
  return out;
}

// The full feed, newest first, gently interleaved. News leads because it's the
// freshest; curated items and guides fold in by date.
export async function getBriefFeed(): Promise<BriefItem[]> {
  const news = await fetchBriefNews();
  const merged = [...news, ...REG_ITEMS, ...GUIDE_ITEMS].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return interleave(merged);
}

// Curated-only fallback (used if the news table isn't available), so /brief is
// never empty.
export const CURATED_FEED: BriefItem[] = interleave(
  [...REG_ITEMS, ...GUIDE_ITEMS].sort((a, b) => b.date.localeCompare(a.date))
);
