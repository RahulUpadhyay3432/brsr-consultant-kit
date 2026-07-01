import { BLOG_POSTS, formatDate } from "@/data/blog-posts";
import regulatory from "@/data/regulatory_updates.json";

export type LatestKind = "regulation" | "article";

export interface LatestItem {
  id: string;
  kind: LatestKind;
  date: string;         // ISO date, used for ordering
  displayDate: string;  // human timeframe (regulatory items are period-level)
  tag: string;          // display tag / category
  title: string;
  summary: string;
  href: string;         // internal (/blog/...) or external source url
  external: boolean;
  sourceLabel?: string; // regulatory items only
}

interface RegUpdate {
  id: string; date: string; display_date: string; tag: string;
  title: string; summary: string; source_label: string; source_url: string;
}

const REG: LatestItem[] = (regulatory.updates as RegUpdate[]).map((u) => ({
  id: u.id,
  kind: "regulation",
  date: u.date,
  displayDate: u.display_date,
  tag: u.tag,
  title: u.title,
  summary: u.summary,
  href: u.source_url,
  external: true,
  sourceLabel: u.source_label,
}));

const ART: LatestItem[] = BLOG_POSTS.map((p) => ({
  id: `post-${p.slug}`,
  kind: "article",
  date: p.date,
  displayDate: formatDate(p.date),
  tag: p.category,
  title: p.title,
  summary: p.excerpt,
  href: `/blog/${p.slug}`,
  external: false,
}));

/** Regulatory updates + blog posts, newest first. */
export const LATEST: LatestItem[] = [...REG, ...ART].sort((a, b) => b.date.localeCompare(a.date));

export function topLatest(n: number): LatestItem[] {
  return LATEST.slice(0, n);
}

/** Distinct display tags, regulatory tags first (they lead the filter row). */
export const LATEST_TAGS: string[] = (() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of [...REG, ...ART]) {
    if (!seen.has(i.tag)) { seen.add(i.tag); out.push(i.tag); }
  }
  return out;
})();
