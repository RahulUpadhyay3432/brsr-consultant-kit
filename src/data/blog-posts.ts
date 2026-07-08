export type BlogCategory = "BRSR" | "Regulation" | "GHG & Emissions" | "How-to" | "Case Studies";

export type CoverIcon =
  | "clipboard" | "chart" | "scales" | "bulb" | "globe"
  | "shield" | "users" | "check" | "drop" | "chain" | "leaf" | "code";

export interface FaqItem {
  q: string;
  a: string;
}

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
  /** Q&A pairs. Rendered as an on-page FAQ section AND emitted as FAQPage JSON-LD. */
  faqs?: FaqItem[];
}

const AUTHOR = { name: "Rahul Upadhyay", role: "Founder, Saaksh" };

export const BLOG_POSTS: BlogPost[] = [
  /* ── Principle-by-principle guide series (P1–P9) ──────────────────────── */
  {
    slug: "brsr-principle-6-environment-guide",
    title: "How to fill BRSR Principle 6 (Environment): the complete guide",
    excerpt:
      "Principle 6 is the heaviest part of BRSR, and where reasonable assurance concentrates. A field-by-field guide to energy, water, GHG, waste and biodiversity disclosures, what each asks, how to answer it, and which filings you can pull from.",
    date: "2026-07-08",
    category: "How-to",
    readTime: "10 min read",
    coverGradient: ["#0C2B1E", "#10A572"],
    coverIcon: "leaf",
    author: AUTHOR,
    faqs: [
      {
        q: "Which BRSR Principle 6 disclosures need reasonable assurance?",
        a: "The BRSR Core assurance attributes concentrate in Principle 6: greenhouse-gas (Scope 1 & 2) intensity, energy intensity, water consumption and intensity, and waste intensity. For companies in the BRSR Core assurance net, these figures must be independently assured, so the underlying meter readings, invoices and calculation workings need to be audit-ready.",
      },
      {
        q: "How do I calculate Scope 1 and Scope 2 emissions for P6-E7?",
        a: "Scope 1 is the fuel burnt on site or in owned vehicles multiplied by each fuel's IPCC emission factor; Scope 2 is grid electricity purchased multiplied by the CEA national grid factor (0.710 kgCO₂/kWh for FY 2024-25). Report absolute tonnes of CO₂e plus intensity per rupee of turnover, and state the standard and GWP rates used. Saaksh's free GHG calculator does this with every factor cited.",
      },
      {
        q: "What is the difference between water withdrawal, consumption and discharge in P6?",
        a: "Withdrawal (P6-E3) is all the water drawn, broken down by source (surface, ground, third-party, seawater). Consumption is what is used and not returned. Discharge (P6-E4) is what is released, by destination and level of treatment. Principle 6 asks for all three, plus water intensity per rupee of turnover.",
      },
      {
        q: "Is Scope 3 mandatory under BRSR Principle 6?",
        a: "No. Scope 3 emissions (P6-L2) sit in the Leadership indicators, which are voluntary. Scope 1 and Scope 2 (P6-E7) are Essential and expected of every filer in scope. Many companies still screen Scope 3 because investors and value-chain partners increasingly ask for it.",
      },
      {
        q: "Which existing filings already cover Principle 6 data?",
        a: "A lot of it. Your PAT scheme returns cover energy; your State Pollution Control Board consent-to-operate and water-cess returns cover water and air; and hazardous-waste manifests (Form 3/Form 10) cover waste. Much of Principle 6 can be pulled from filings your client already submits, rather than collected fresh.",
      },
    ],
  },
  {
    slug: "brsr-principle-1-ethics-guide",
    title: "How to fill BRSR Principle 1 (Ethics, Transparency & Accountability)",
    excerpt:
      "Principle 1 covers governance and business ethics, anti-corruption, fines and penalties, conflicts of interest, related-party transactions and more. A plain-English guide to what each disclosure asks and who in the company actually owns the data.",
    date: "2026-07-07",
    category: "How-to",
    readTime: "8 min read",
    coverGradient: ["#0F1E33", "#0B6FD4"],
    coverIcon: "scales",
    author: AUTHOR,
    faqs: [
      {
        q: "What does BRSR Principle 1 cover?",
        a: "Governance and business ethics: the anti-corruption/anti-bribery policy, fines and penalties paid to regulators, disciplinary actions for bribery or corruption, conflict-of-interest complaints, concentration of related-party transactions, number of days of accounts payable, and training on the NGRBC principles.",
      },
      {
        q: "Who owns Principle 1 data in a company?",
        a: "Mostly the Company Secretary and the legal/compliance function (policies, fines and penalties, conflict-of-interest records, disciplinary actions), with the finance team for accounts-payable days and the concentration of purchases, sales and related-party transactions.",
      },
      {
        q: "Does BRSR Principle 1 need reasonable assurance?",
        a: "Principle 1 is largely narrative and disclosure-based and is not among the numeric BRSR Core attributes that require reasonable assurance. That said, the fines/penalties and anti-corruption disclosures are read closely by assurers and investors, so keep the underlying board minutes, policy documents and legal records ready.",
      },
      {
        q: "How should we answer the anti-corruption disclosure (P1-E4)?",
        a: "Don't answer with a bare 'Yes'. Describe the policy itself, the risk-assessment procedures and internal controls, the mechanism for handling bribery/corruption complaints, and the coverage of anti-corruption training by employee category, and provide a web link to the published policy.",
      },
    ],
  },

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
