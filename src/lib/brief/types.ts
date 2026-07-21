// Shared types + category config for Saaksh Brief (the swipeable ESG/BRSR digest).
// A BriefItem is the unified card model, a superset of LatestItem (src/lib/latest.ts)
// that also carries fresh, AI-summarised news alongside the cited regulatory items
// and blog guides.

export type BriefCategory =
  | "brsr"
  | "assurance"
  | "cbam"
  | "carbon-markets"
  | "global"
  | "guides";

export type BriefKind = "news" | "regulation" | "guide";

export interface BriefItem {
  id: string;
  kind: BriefKind;
  category: BriefCategory;
  tagLabel: string;      // short display tag on the card, e.g. "CBAM"
  date: string;          // ISO, for ordering
  displayDate: string;   // human, e.g. "2h ago" / "FY 2025-26"
  title: string;
  summary: string;
  href: string;          // source url (news/reg) or /blog/... (guide)
  external: boolean;
  sourceName?: string;   // news source, reg source_label, or blog author
  aiSummary: boolean;    // true only for news → renders the "AI summary" label
  imageUrl?: string;     // news OG image or blog coverImage; else a gradient is used
  model?: string;        // model name for the "AI summary · <model>" label
  whyItMatters?: string; // cached grounded explanation, if generated
}

// The tab bar + the hero-fallback gradients + accent colours. One definition drives
// the category pills, the card badges, and the gradient used when a card has no image.
export const BRIEF_CATEGORIES: {
  slug: BriefCategory;
  label: string;
  gradient: [string, string];
  accent: string;
}[] = [
  { slug: "brsr",           label: "BRSR",           gradient: ["#0F1E33", "#0B6FD4"], accent: "#1E9DF2" },
  { slug: "assurance",      label: "Assurance",      gradient: ["#1A1030", "#7B6FE0"], accent: "#9B8CF0" },
  { slug: "cbam",           label: "CBAM",           gradient: ["#1A1200", "#C2871B"], accent: "#E0A93B" },
  { slug: "carbon-markets", label: "Carbon Markets", gradient: ["#0A2018", "#10A572"], accent: "#22C08A" },
  { slug: "global",         label: "Global",         gradient: ["#082226", "#0E8F9E"], accent: "#2AB6C6" },
  { slug: "guides",         label: "Guides",         gradient: ["#2B0F0A", "#F2674A"], accent: "#FF8266" },
];

export const CATEGORY_BY_SLUG: Record<BriefCategory, (typeof BRIEF_CATEGORIES)[number]> =
  Object.fromEntries(BRIEF_CATEGORIES.map((c) => [c.slug, c])) as Record<
    BriefCategory,
    (typeof BRIEF_CATEGORIES)[number]
  >;

// The category slugs the news classifier is allowed to return, with a one-line
// definition each. Kept here so the ingestion prompt and the UI stay in sync.
export const CATEGORY_DEFINITIONS: Record<BriefCategory, string> = {
  brsr: "India's BRSR / SEBI sustainability-reporting disclosures and rules.",
  assurance: "BRSR Core, reasonable assurance, ISAE/ISSA, assessment vs assurance.",
  cbam: "The EU Carbon Border Adjustment Mechanism affecting exporters.",
  "carbon-markets": "India's CCTS carbon market, carbon credits, GEI targets, offsets.",
  global: "Global sustainability frameworks: ESRS/CSRD, CDP, EcoVadis, IFRS/ISSB, GRI, TNFD.",
  guides: "How-to guidance and explainers (used for Saaksh blog articles).",
};

// Map a curated regulatory-item tag (regulatory_updates.json) to a Brief category.
export function regTagToCategory(tag: string): BriefCategory {
  const t = tag.toLowerCase();
  if (t.includes("cbam")) return "cbam";
  if (t.includes("ccts") || t.includes("carbon")) return "carbon-markets";
  if (t.includes("core") || t.includes("assur")) return "assurance";
  if (t.includes("csrd") || t.includes("esrs") || t.includes("cdp") || t.includes("ecovadis") || t.includes("gri") || t.includes("ifrs") || t.includes("issb"))
    return "global";
  return "brsr"; // SEBI / BRSR / GHG default
}

// A human "2h ago" / "3d ago" / date for a card. Regulatory items keep their own
// period label (displayDate) instead of using this.
export function relativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
