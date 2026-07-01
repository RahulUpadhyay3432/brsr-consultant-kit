export type BlogCategory = "BRSR" | "Regulation" | "GHG & Emissions" | "How-to" | "Case Studies";

export type CoverIcon =
  | "clipboard" | "chart" | "scales" | "bulb" | "globe"
  | "shield" | "users" | "check" | "drop" | "chain" | "leaf" | "code";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: BlogCategory;
  readTime: string;
  coverGradient: [string, string];
  coverIcon: CoverIcon;
  author: { name: string; role: string };
  /** Optional real photo at /blog/<slug>.jpg (16:9). When set, replaces the generated cover art. */
  coverImage?: string;
}

const AUTHOR = { name: "Rahul Upadhyay", role: "Founder, Saaksh" };

export const BLOG_POSTS: BlogPost[] = [
  /* ── Tier 1, Original 5 posts ─────────────────────────────────────────── */
  {
    slug: "brsr-fy2526-changes",
    title: "What's new in BRSR for FY 2025-26",
    excerpt:
      "BRSR Core is now mandatory for the top 500 listed companies. Here's what changed, what's voluntary, and what every consultant should brief their clients on before filing this year.",
    date: "2026-06-20",
    category: "BRSR",
    readTime: "5 min read",
    coverGradient: ["#0F1E33", "#0B6FD4"],
    coverIcon: "clipboard",
    author: AUTHOR,
    coverImage: "/blog/brsr-fy2526-changes.jpg",
  },
  {
    slug: "scope-1-2-ghg-brsr-guide",
    title: "How to calculate Scope 1 & 2 GHG emissions for BRSR",
    excerpt:
      "The P6-E1 disclosure trips up most first-time filers. This guide covers the CEA grid factor, IPCC fuel factors, what 'absolute' emissions means, and the most common calculation mistakes.",
    date: "2026-06-15",
    category: "GHG & Emissions",
    readTime: "7 min read",
    coverGradient: ["#0C2B1E", "#10A572"],
    coverIcon: "chart",
    author: AUTHOR,
    coverImage: "/blog/scope-1-2-ghg-brsr-guide.jpg",
  },
  {
    slug: "brsr-core-vs-essential",
    title: "BRSR Core vs BRSR Essential: a clear breakdown",
    excerpt:
      "\"BRSR Core\" and \"BRSR Essential\" confuse almost everyone. Here's exactly what each term means, who it applies to, and what the reasonable assurance requirement actually asks of your client.",
    date: "2026-06-10",
    category: "How-to",
    readTime: "4 min read",
    coverGradient: ["#1A0F33", "#7B6FE0"],
    coverIcon: "scales",
    author: AUTHOR,
    coverImage: "/blog/brsr-core-vs-essential.jpg",
  },
  {
    slug: "5-brsr-fields-manufacturers-struggle",
    title: "5 BRSR disclosures that trip up every manufacturer",
    excerpt:
      "After working through dozens of manufacturer filings, these five disclosures consistently generate the most confusion, data gaps, and revision rounds. Here's what to watch for.",
    date: "2026-06-05",
    category: "How-to",
    readTime: "6 min read",
    coverGradient: ["#2B0F0A", "#F2674A"],
    coverIcon: "bulb",
    author: AUTHOR,
    coverImage: "/blog/5-brsr-fields-manufacturers-struggle.jpg",
  },
  {
    slug: "cbam-2026-indian-exporters",
    title: "CBAM in 2026: what Indian exporters need to know",
    excerpt:
      "The EU's Carbon Border Adjustment Mechanism entered its definitive period in January 2026. Indian steel, cement and aluminium exporters now have real reporting obligations, here's what to do.",
    date: "2026-05-28",
    category: "Regulation",
    readTime: "8 min read",
    coverGradient: ["#1A1200", "#C2871B"],
    coverIcon: "globe",
    author: AUTHOR,
    coverImage: "/blog/cbam-2026-indian-exporters.jpg",
  },

  /* ── New SEO posts ──────────────────────────────────────────────────────── */
  {
    slug: "brsr-applicability-guide",
    title: "BRSR applicability: which companies must file and when",
    excerpt:
      "Top 1000, top 500, BRSR Core, value chain, the rules layered over three years and the deadlines are now live. Here's a single, clear guide to who must file what for FY 2025-26.",
    date: "2026-06-25",
    category: "BRSR",
    readTime: "6 min read",
    coverGradient: ["#0A1828", "#0F3060"],
    coverIcon: "shield",
    author: AUTHOR,
    coverImage: "/blog/brsr-applicability-guide.jpg",
  },
  {
    slug: "brsr-core-assurance-fy2526",
    title: "BRSR Core assurance in FY 2025-26: a practical guide for top-500 companies",
    excerpt:
      "Reasonable assurance for BRSR Core is now mandatory for India's top 500 listed companies. This guide explains what the 9 KPIs are, what an auditor actually checks, and how to build an assurance-ready data trail.",
    date: "2026-06-22",
    category: "Regulation",
    readTime: "8 min read",
    coverGradient: ["#1E0A28", "#5B1A8A"],
    coverIcon: "check",
    author: AUTHOR,
    coverImage: "/blog/brsr-core-assurance-fy2526.jpg",
  },
  {
    slug: "brsr-data-collection-guide",
    title: "BRSR data collection: how to get numbers from your client's team",
    excerpt:
      "The consultant's actual pain: ESG data lives with five different departments and no one answers emails. This guide covers who owns what, what to ask, and how to stop chasing people manually.",
    date: "2026-06-18",
    category: "How-to",
    readTime: "7 min read",
    coverGradient: ["#0A2018", "#0E5535"],
    coverIcon: "users",
    author: AUTHOR,
    coverImage: "/blog/brsr-data-collection-guide.jpg",
  },
  {
    slug: "brsr-assurance-vs-assessment",
    title: "BRSR assurance vs assessment: what SEBI's March 2025 circular changed",
    excerpt:
      "SEBI's March 2025 circular introduced 'assessment' as a lighter alternative to reasonable assurance under ISAE 3000. Most consultants don't yet know the difference, or which clients can choose which path.",
    date: "2026-06-12",
    category: "Regulation",
    readTime: "5 min read",
    coverGradient: ["#1A0820", "#400F5A"],
    coverIcon: "scales",
    author: AUTHOR,
    coverImage: "/blog/brsr-assurance-vs-assessment.jpg",
  },
  {
    slug: "brsr-for-it-services",
    title: "BRSR for IT services companies: what 'not applicable' really means",
    excerpt:
      "IT companies can mark certain manufacturing-related disclosures as 'not applicable', but only the right ones, and only with a clear justification. Here's the field-by-field guide.",
    date: "2026-06-08",
    category: "Case Studies",
    readTime: "5 min read",
    coverGradient: ["#0A1830", "#1A3560"],
    coverIcon: "code",
    author: AUTHOR,
    coverImage: "/blog/brsr-for-it-services.jpg",
  },
  {
    slug: "brsr-for-textile-companies",
    title: "BRSR for textile companies: sector guide for FY 2025-26",
    excerpt:
      "Textile companies face a double compliance burden in FY 2025-26: BRSR Core assurance and CCTS GHG reporting (BEE deadline: July 31, 2026). This guide covers both, and how they overlap.",
    date: "2026-06-02",
    category: "Case Studies",
    readTime: "8 min read",
    coverGradient: ["#1A0A28", "#4A1A6B"],
    coverIcon: "leaf",
    author: AUTHOR,
    coverImage: "/blog/brsr-for-textile-companies.jpg",
  },
  {
    slug: "brsr-value-chain-disclosure",
    title: "BRSR value chain disclosure: voluntary now, mandatory from FY 2026-27",
    excerpt:
      "SEBI's March 2025 circular deferred mandatory value chain ESG disclosure to FY 2026-27 and narrowed the scope to partners at 2%+ of purchases/sales. Here's exactly what's required and when.",
    date: "2026-05-25",
    category: "Regulation",
    readTime: "5 min read",
    coverGradient: ["#0A1E30", "#0E3A55"],
    coverIcon: "chain",
    author: AUTHOR,
    coverImage: "/blog/brsr-value-chain-disclosure.jpg",
  },
  {
    slug: "brsr-water-disclosure-calculation",
    title: "BRSR water disclosure: how to calculate water withdrawal intensity",
    excerpt:
      "P6-E3 requires water withdrawal intensity, but SEBI specifies different denominators for manufacturers (production units) vs service companies (revenue or FTE). Here's the calculation methodology, cited.",
    date: "2026-05-20",
    category: "GHG & Emissions",
    readTime: "6 min read",
    coverGradient: ["#0A2028", "#0E4A6B"],
    coverIcon: "drop",
    author: AUTHOR,
    coverImage: "/blog/brsr-water-disclosure-calculation.jpg",
  },
  {
    slug: "ccts-india-2025-26",
    title: "CCTS India 2025-26: which 490 companies must comply and what to do",
    excerpt:
      "India's Carbon Credit Trading Scheme entered force for seven sectors in early 2026. First verified GHG emission intensity reports are due to BEE by July 31, 2026. Here's who's in scope and what the process looks like.",
    date: "2026-05-15",
    category: "Regulation",
    readTime: "7 min read",
    coverGradient: ["#0A1E0A", "#1A4020"],
    coverIcon: "leaf",
    author: AUTHOR,
    coverImage: "/blog/ccts-india-2025-26.jpg",
  },
  {
    slug: "brsr-materiality-assessment-guide",
    title: "BRSR materiality assessment: a step-by-step guide for consultants",
    excerpt:
      "Only 34% of BSE 100 companies publicly disclose their materiality methodology. This guide walks through a defensible materiality process, stakeholder mapping, impact scoring, and how to document it for BRSR.",
    date: "2026-05-10",
    category: "How-to",
    readTime: "8 min read",
    coverGradient: ["#0A1828", "#1A3548"],
    coverIcon: "chart",
    author: AUTHOR,
    coverImage: "/blog/brsr-materiality-assessment-guide.jpg",
  },
];

export function getPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const CATEGORY_COLORS: Record<BlogCategory, { bg: string; text: string; border: string }> = {
  "BRSR":            { bg: "#EAF4FE", text: "#0B5FB0", border: "#C5DEFA" },
  "Regulation":      { bg: "#F6ECD8", text: "#8A6516", border: "#EAD8B0" },
  "GHG & Emissions": { bg: "#E3F7F0", text: "#0E7A56", border: "#BFE6D8" },
  "How-to":          { bg: "#FFF1ED", text: "#C24428", border: "#F8C9BD" },
  "Case Studies":    { bg: "#F3F0FF", text: "#5B21B6", border: "#DDD6FE" },
};
