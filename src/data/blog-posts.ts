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
  /**
   * Last substantive revision (YYYY-MM-DD). Drives `dateModified` in the
   * BlogPosting schema, the "Updated" line on the article, and the sitemap's
   * lastModified. Regulation moves; a post that says when it was last checked
   * is the one search engines and answer engines trust. Omit until a post is
   * genuinely revised, so it never claims freshness it does not have.
   */
  updated?: string;
}

const AUTHOR = { name: "Rahul Upadhyay", role: "Founder, Saaksh" };

export const BLOG_POSTS: BlogPost[] = [
  /* ── Trending crosswalk + sector batch (July 2026) ─────────────────────── */
  {
    slug: "brsr-vs-csrd-esrs",
    coverImage: "/blog/brsr-vs-csrd-esrs.jpg",
    title: "BRSR vs CSRD / ESRS: how India's BRSR maps to European sustainability reporting",
    excerpt:
      "BRSR maps topic-for-topic onto the twelve ESRS standards behind the EU's CSRD, and after the 2026 Omnibus reset the live question for every Indian subsidiary and exporter is whether BRSR data can feed an ESRS report. A cited BRSR-to-ESRS crosswalk, and where the two diverge.",
    date: "2026-07-19",
    category: "Regulation",
    readTime: "12 min read",
    coverGradient: ["#0F1E33", "#0B6FD4"],
    coverIcon: "globe",
    author: AUTHOR,
    faqs: [
      {
        q: "Does BRSR align with CSRD and the ESRS?",
        a: "Partly. BRSR maps topic-for-topic onto the ESRS environmental (E1–E5), social (S1–S4) and governance (G1) standards, and the two share most of the underlying data: emissions, energy, water, workforce and governance. But ESRS requires a double-materiality assessment, quantified targets and transition-plan depth that BRSR does not, and it makes Scope 3 mandatory where material, whereas BRSR keeps Scope 3 a voluntary Leadership indicator.",
      },
      {
        q: "Do Indian companies have to comply with CSRD?",
        a: "Only if they meet the EU thresholds. After the Omnibus I directive, in force from 18 March 2026, CSRD applies to EU undertakings with more than 1,000 employees and turnover above EUR 450 million. Indian groups are pulled in mainly through large EU subsidiaries, and potentially later through the Non-EU Sustainability Reporting Standards (NESRS) that EFRAG is due to advise on by early 2027 for non-EU parents above the CSRD turnover threshold.",
      },
      {
        q: "What did the EU Omnibus change for the ESRS?",
        a: "Omnibus I narrowed CSRD scope, cut mandatory ESRS datapoints by roughly 60–70%, deleted the voluntary datapoints, capped what large reporters can demand from smaller value-chain partners, and pushed first application to FY2027 (FY2026 voluntary). Crucially, the twelve ESRS standards and their topics are unchanged, so a topic-level BRSR-to-ESRS crosswalk still holds even though specific datapoint references have moved.",
      },
      {
        q: "Can BRSR data feed an ESRS report?",
        a: "Yes, as a strong starting point. The Principle 6 energy, GHG, water and waste data (mapping to ESRS E1/E3/E5), the Principle 3 workforce data (ESRS S1) and the Principle 1 governance data (ESRS G1) all carry across. ESRS then asks for more, notably a double-materiality assessment, mandatory Scope 3 where material, and quantified targets, which BRSR does not require, so the crosswalk saves the data-collection work but not the extra analysis.",
      },
    ],
  },
  {
    slug: "scope-3-brsr-value-chain",
    coverImage: "/blog/scope-3-brsr-value-chain.jpg",
    title: "Scope 3 for BRSR: how to screen and collect value-chain emissions in India",
    excerpt:
      "Scope 3 disclosures across the NSE top 200 are up nearly 59%, and BRSR value-chain reporting is now live for FY 2025-26. Where Scope 3 sits in BRSR, the 15 categories, why the data is so hard to collect in India, and how to screen it honestly without inventing factors.",
    date: "2026-07-17",
    category: "GHG & Emissions",
    readTime: "12 min read",
    coverGradient: ["#0C2B1E", "#10A572"],
    coverIcon: "chain",
    author: AUTHOR,
    faqs: [
      {
        q: "Is Scope 3 mandatory under BRSR?",
        a: "No. Scope 3 (P6-L2) is a Leadership indicator, so it is voluntary. Scope 1 and Scope 2 (P6-E7) are the Essential figures and, for BRSR Core filers, the assured ones. Many companies still screen Scope 3 because investors, CDP and value-chain partners increasingly ask for it, and BRSR value-chain disclosure begins for FY 2025-26.",
      },
      {
        q: "What are the 15 Scope 3 categories?",
        a: "The GHG Protocol splits Scope 3 into 15 categories: 8 upstream (purchased goods and services, capital goods, fuel- and energy-related activities, upstream transport, waste, business travel, employee commuting, upstream leased assets) and 7 downstream (downstream transport, processing of sold products, use of sold products, end-of-life, downstream leased assets, franchises, investments). Most Indian filers start with the handful that dominate their footprint.",
      },
      {
        q: "Why is Scope 3 so hard to collect in India?",
        a: "The data sits with suppliers, not the reporting company, and most of those suppliers are SMEs without emissions-accounting capacity. Boundary definition (which suppliers to include, how to treat joint ventures and outsourced activity) and supplier engagement at scale are the two biggest blockers, which is why a screening estimate usually comes before any supplier-specific data.",
      },
      {
        q: "How does Saaksh calculate Scope 3?",
        a: "Saaksh's free Scope 3 screening calculator uses the GHG Protocol Corporate Value Chain (Scope 3) Standard with cited DEFRA/DESNZ 2024 factors, covering activity-based business travel, employee commuting, transport and distribution, and waste. Category 1 (purchased goods) is deliberately deferred because no authoritative free India spend-factor set exists, so the tool never invents a factor to fill the gap.",
      },
    ],
  },
  {
    slug: "brsr-cdp-ecovadis",
    coverImage: "/blog/brsr-cdp-ecovadis.jpg",
    title: "Report once, score everywhere: mapping BRSR to CDP and EcoVadis",
    excerpt:
      "CDP's 2026 disclosure window and EcoVadis scorecards are what every ESG consultant is fielding right now. The useful news: a filed BRSR already carries most of the data. How BRSR Section B and C map onto CDP's modules and EcoVadis's Policies-Actions-Results scoring.",
    date: "2026-07-15",
    category: "Regulation",
    readTime: "10 min read",
    coverGradient: ["#1A1030", "#7B6FE0"],
    coverIcon: "scales",
    author: AUTHOR,
    faqs: [
      {
        q: "What is the difference between CDP and EcoVadis?",
        a: "CDP is an annual environmental disclosure scored A to D-, run through one integrated questionnaire covering climate change, forests and water security. EcoVadis is a supplier sustainability rating scored out of 100 with medals, across four themes: Environment, Labour & Human Rights, Ethics, and Sustainable Procurement. CDP is environmental only; EcoVadis is broader but buyer-driven, usually requested by a customer.",
      },
      {
        q: "Can BRSR data feed a CDP or EcoVadis submission?",
        a: "A lot of it can. BRSR Principle 6 energy, GHG, water and waste data maps to CDP's scored climate and water modules and to the EcoVadis Environment theme. And because EcoVadis scores Policies, Actions and Results, BRSR Section B policies feed the Policies dimension while Section C performance feeds Results. It is a strong starting point, not a complete submission.",
      },
      {
        q: "How is EcoVadis scored?",
        a: "Every EcoVadis theme is scored on three dimensions, Policies (25%), Actions (40%) and Results (35%), across 21 criteria. That structure is exactly why BRSR helps: BRSR Section B is essentially your Policies evidence and Section C is your Results evidence, so a filed BRSR already covers two of the three scored dimensions for the themes it touches.",
      },
      {
        q: "When is the CDP 2026 deadline?",
        a: "The CDP 2026 disclosure window opens in mid-June and closes around 14 September 2026 for a scored response, with a later cut-off (around late October) for submissions that will not be scored. SMEs became eligible for an A score in 2026, and the SME questionnaire added new forests and water-security modules.",
      },
    ],
  },
  {
    slug: "brsr-steel-metals-sector-guide",
    coverImage: "/blog/brsr-steel-metals-sector-guide.jpg",
    title: "BRSR for steel & metals: BRSR Core, CBAM and CCTS in one place",
    excerpt:
      "Steel and metals is the one sector caught by BRSR Core assurance, the EU CBAM and India's CCTS all at once, with a CCTS Form A deadline of 31 July 2026. One practical guide to all three regimes, and the single emissions dataset that feeds them.",
    date: "2026-07-13",
    category: "Case Studies",
    readTime: "11 min read",
    coverGradient: ["#1A1200", "#C2871B"],
    coverIcon: "leaf",
    author: AUTHOR,
    faqs: [
      {
        q: "Which regulations hit Indian steel companies at once?",
        a: "Three overlap for FY 2025-26: BRSR, with Core reasonable assurance now mandatory for the top 500 listed entities; the EU's Carbon Border Adjustment Mechanism (CBAM), now in its definitive period, for exporters to Europe; and India's Carbon Credit Trading Scheme (CCTS), under which Iron & Steel has a notified GHG emission-intensity target. All three run off the same energy and emissions data.",
      },
      {
        q: "What is the CCTS deadline for steel?",
        a: "Obligated entities must submit verified GHG emission-intensity data to the Bureau of Energy Efficiency via Form A by 31 July 2026, against sector GEI targets that tighten by roughly 1–3% in FY 2025-26 and 2–8% in FY 2026-27. Entities that beat their target earn Carbon Credit Certificates, with the first compliance trading expected from around October 2026.",
      },
      {
        q: "What does CBAM require from steel exporters in 2026?",
        a: "Since the definitive period began in January 2026, EU importers of Indian steel need installation-level embedded-emissions data with third-party verification. Where verified data is missing, the EU applies a high default value, so the practical task is producing verifiable installation-level emissions rather than corporate averages or sector benchmarks. The first annual CBAM declaration for 2026 imports is due 30 September 2027.",
      },
      {
        q: "How can one dataset cover BRSR, CBAM and CCTS?",
        a: "Steel's metered energy and Scope 1 and 2 emissions are the common core. The same fuel, electricity and production data feeds the BRSR Principle 6 intensities, the CCTS GHG emission-intensity calculation, and the CBAM embedded-emissions figure. Collecting it once, with an audit trail an assurer or verifier can inspect, is what makes all three regimes tractable instead of three separate scrambles.",
      },
    ],
  },

  /* ── Principle-by-principle guide series (P1–P9) ──────────────────────── */
  {
    slug: "brsr-principle-6-environment-guide",
    coverImage: "/blog/brsr-principle-6-environment-guide.jpg",
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
    coverImage: "/blog/brsr-principle-1-ethics-guide.jpg",
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
  {
    slug: "brsr-principle-2-products-guide",
    coverImage: "/blog/brsr-principle-2-products-guide.jpg",
    title: "How to fill BRSR Principle 2 (Sustainable & Safe Goods and Services)",
    excerpt:
      "Principle 2 covers sustainable sourcing, product life-cycle impacts, recycled inputs and Extended Producer Responsibility. A plain-English guide to what each disclosure asks, which are manufacturing-only, and how EPR ties back to the plan you already filed with the Pollution Control Board.",
    date: "2026-07-06",
    category: "How-to",
    readTime: "7 min read",
    coverGradient: ["#0F1E33", "#7B6FE0"],
    coverIcon: "chain",
    author: AUTHOR,
    faqs: [
      {
        q: "What does BRSR Principle 2 cover?",
        a: "Sustainable and safe products: R&D and capex on cleaner technology (P2-E1), sustainable sourcing procedures and the share of inputs sourced sustainably (P2-E2), safe end-of-life reclaim for plastics, e-waste and hazardous waste (P2-E3), and whether Extended Producer Responsibility applies and matches the plan filed with the Pollution Control Board (P2-E4). Leadership adds life-cycle assessments and recycled-input percentages.",
      },
      {
        q: "Is Principle 2 relevant to service companies?",
        a: "Partly. The sourcing and R&D disclosures apply to everyone, but the physical end-of-life reclaim (P2-E3), EPR (P2-E4) and product-packaging reclaim (P2-L4, P2-L5) are manufacturing-oriented. Saaksh marks the manufacturing-only Principle 2 fields Not Applicable for service-sector clients so you are not chasing data that does not exist.",
      },
      {
        q: "How does EPR connect to BRSR Principle 2?",
        a: "P2-E4 asks whether Extended Producer Responsibility applies and, if so, whether your waste-collection plan matches the EPR plan already submitted to the Pollution Control Board. If your client filed an EPR registration under the Plastic Waste or E-Waste Rules, that document is the answer, so this is a field you can pull from an existing filing rather than collect fresh.",
      },
      {
        q: "What is a Life Cycle Assessment for P2-L1?",
        a: "A Life Cycle Assessment (ISO 14040/14044) traces a product's environmental impact from raw material to disposal. P2-L1 is a Leadership indicator, so it is voluntary, but conducting one for a flagship product and disclosing the significant concerns it surfaces (P2-L2) is a strong signal to assurers and investors.",
      },
    ],
  },
  {
    slug: "brsr-principle-3-employee-wellbeing-guide",
    coverImage: "/blog/brsr-principle-3-employee-wellbeing-guide.jpg",
    title: "How to fill BRSR Principle 3 (Employee Wellbeing & Safety)",
    excerpt:
      "Principle 3 is the largest Essential block in BRSR, 15 disclosures on wages, benefits, retirement cover, training, grievances and workplace safety, split across employees and workers. A guide to what each asks and why the People team owns almost all of it.",
    date: "2026-07-05",
    category: "How-to",
    readTime: "9 min read",
    coverGradient: ["#10233A", "#1E9DF2"],
    coverIcon: "users",
    author: AUTHOR,
    faqs: [
      {
        q: "What does BRSR Principle 3 cover?",
        a: "Employee and worker wellbeing: measures for wellbeing and retirement benefits, workplace accessibility and equal-opportunity policy, parental-leave return and retention, grievance mechanisms, union membership, training, career-development reviews, the occupational health and safety management system, and safety-incident data (LTIFR, fatalities).",
      },
      {
        q: "Which Principle 3 numbers need reasonable assurance?",
        a: "Safety is where it concentrates. The Lost Time Injury Frequency Rate and safety-incident figures in P3-E11 are read closely and, for BRSR Core filers, underpin assured attributes. Keep the safety register, incident reports and man-hours-worked workings audit-ready, not just the headline count.",
      },
      {
        q: "Does BRSR distinguish employees from workers?",
        a: "Yes, and it matters throughout Principle 3. 'Employees' are on the company payroll; 'workers' includes contract and other non-payroll labour. Almost every P3 disclosure asks for both categories separately, and further splits by gender and by permanent versus non-permanent, so build your data request around that matrix from the start.",
      },
      {
        q: "Who owns Principle 3 data?",
        a: "Almost all of it sits with HR and the People team: payroll for wages and benefits, HR records for training, grievances, parental leave and union membership, and the EHS or safety function for the health-and-safety management system and incident data. Route the whole principle to your People team with EHS looped in on safety.",
      },
    ],
  },
  {
    slug: "brsr-principle-4-stakeholder-guide",
    coverImage: "/blog/brsr-principle-4-stakeholder-guide.jpg",
    title: "How to fill BRSR Principle 4 (Stakeholder Engagement)",
    excerpt:
      "Principle 4 is short but foundational: how you identify your key stakeholders, how often you engage each group, and how you reach the vulnerable and marginalised. A guide to answering it well, and to why it underpins your whole materiality assessment.",
    date: "2026-07-04",
    category: "How-to",
    readTime: "6 min read",
    coverGradient: ["#0F1E33", "#10A572"],
    coverIcon: "globe",
    author: AUTHOR,
    faqs: [
      {
        q: "What does BRSR Principle 4 cover?",
        a: "Stakeholder engagement: the process for identifying key stakeholder groups (P4-E1), the list of those groups and how often you engage each one (P4-E2), and, in Leadership, how stakeholder input reaches the Board and how you engage vulnerable and marginalised groups (P4-L3).",
      },
      {
        q: "Why is Principle 4 important if it is only two Essential disclosures?",
        a: "Because it is the evidence base for materiality. A credible BRSR materiality assessment has to be stakeholder-driven, and Principle 4 is where you document who those stakeholders are and how you consult them. Assurers cross-check your material topics against your stated engagement, so a thin Principle 4 undermines the rest of the report.",
      },
      {
        q: "Who counts as a vulnerable or marginalised stakeholder group?",
        a: "Groups that may be disadvantaged in engaging with the business, for example local communities near operations, contract labour, small suppliers, and persons with disabilities. P4-L3 asks specifically how you engage them and act on their concerns, so identify them explicitly in your stakeholder register rather than folding them into a generic 'community' line.",
      },
    ],
  },
  {
    slug: "brsr-principle-5-human-rights-guide",
    coverImage: "/blog/brsr-principle-5-human-rights-guide.jpg",
    title: "How to fill BRSR Principle 5 (Human Rights)",
    excerpt:
      "Principle 5 covers minimum wages, human-rights training, POSH complaints, grievance mechanisms, discrimination and forced/child labour, plus due diligence across your value chain. A field-by-field guide, with the wage and POSH tables that trip most filers.",
    date: "2026-07-03",
    category: "How-to",
    readTime: "8 min read",
    coverGradient: ["#1A1030", "#7B6FE0"],
    coverIcon: "shield",
    author: AUTHOR,
    faqs: [
      {
        q: "What does BRSR Principle 5 cover?",
        a: "Human rights in the workplace and value chain: human-rights training (P5-E1), minimum wages and remuneration by gender (P5-E2, P5-E3), a focal point for human-rights issues, grievance mechanisms, complaints on sexual harassment, discrimination, child labour and forced labour (P5-E6), POSH Act complaints (P5-E7), and human-rights clauses in contracts. Leadership adds due-diligence scope and value-chain assessments.",
      },
      {
        q: "How do I complete the minimum-wage disclosure (P5-E2)?",
        a: "P5-E2 asks, for both employees and workers, how many were paid at or above the minimum wage, split by gender, for the current and previous year. Draw it from payroll against the applicable state minimum-wage notification. The paired P5-E3 asks for median remuneration by gender, so gather both from the same payroll extract.",
      },
      {
        q: "What is the difference between P5-E7 (POSH) and the P5-E6 harassment line?",
        a: "P5-E6 counts all complaints of sexual harassment made by employees and workers in the year. P5-E7 is the specific statutory format under the POSH Act 2013: complaints filed, upheld, pending and those pending beyond 90 days. Both must reconcile, and the Internal Committee's annual return is the source for P5-E7.",
      },
      {
        q: "Does Principle 5 require value-chain data?",
        a: "The Leadership indicators do. P5-L4 asks for assessment of value-chain partners on human-rights parameters like child labour, forced labour, wages and discrimination. It is voluntary, but with the EU CSDDD and BRSR value-chain disclosure approaching, running supplier human-rights due diligence per the UN Guiding Principles is worth starting early.",
      },
    ],
  },
  {
    slug: "brsr-principle-7-policy-advocacy-guide",
    coverImage: "/blog/brsr-principle-7-policy-advocacy-guide.jpg",
    title: "How to fill BRSR Principle 7 (Policy Advocacy)",
    excerpt:
      "Principle 7 is the shortest in BRSR: your trade-association memberships, any anti-competitive-conduct corrective actions, and the public-policy positions you advocate. A quick guide to answering it transparently without over- or under-disclosing.",
    date: "2026-07-02",
    category: "How-to",
    readTime: "5 min read",
    coverGradient: ["#0F1E33", "#0B6FD4"],
    coverIcon: "bulb",
    author: AUTHOR,
    faqs: [
      {
        q: "What does BRSR Principle 7 cover?",
        a: "Responsible policy advocacy: the number of trade and industry chambers or associations you are affiliated to and the top 10 by membership (P7-E1), corrective action on any adverse orders for anti-competitive conduct (P7-E2), and, in Leadership, the specific public-policy positions the entity advocates (P7-L1).",
      },
      {
        q: "Who owns Principle 7 data?",
        a: "The public affairs, corporate affairs or sustainability function, whoever manages the company's trade-association memberships and policy positions. It is a small principle, usually answerable from membership records and any board-noted advocacy positions, so it rarely needs a wide data-collection effort.",
      },
      {
        q: "How much should we disclose under P7-L1 (public-policy positions)?",
        a: "P7-L1 is a Leadership indicator, so it is voluntary, but leading practice is to disclose the policy positions you actively advocate, the method (direct or via associations), and whether the information is in the public domain. Investors increasingly check that a company's climate advocacy is consistent with its net-zero commitments.",
      },
    ],
  },
  {
    slug: "brsr-principle-8-inclusive-growth-guide",
    coverImage: "/blog/brsr-principle-8-inclusive-growth-guide.jpg",
    title: "How to fill BRSR Principle 8 (Inclusive Growth & Equitable Development)",
    excerpt:
      "Principle 8 covers Social Impact Assessments, rehabilitation and resettlement, community grievances, local sourcing and employment, and CSR beneficiaries. A guide to answering it from CSR and procurement records, and to reporting outcomes rather than just rupees spent.",
    date: "2026-07-01",
    category: "How-to",
    readTime: "7 min read",
    coverGradient: ["#0C2B1E", "#10A572"],
    coverIcon: "chart",
    author: AUTHOR,
    faqs: [
      {
        q: "What does BRSR Principle 8 cover?",
        a: "Inclusive growth and community impact: Social Impact Assessments of projects (P8-E1), ongoing rehabilitation and resettlement (P8-E2), mechanisms to redress community grievances (P8-E3), input material sourced from suppliers including MSMEs (P8-E4), and wages paid in smaller towns (P8-E5). Leadership adds CSR in aspirational districts, preferential procurement from marginalised groups, and CSR beneficiaries.",
      },
      {
        q: "Where does Principle 8 data come from?",
        a: "Mostly the CSR function. CSR spend and project records (mandated under Companies Act 2013 Section 135) feed the beneficiary and aspirational-district disclosures; procurement records feed the local and MSME sourcing questions; and any Social Impact Assessments done under applicable law feed P8-E1 and P8-L1.",
      },
      {
        q: "How should we report CSR under BRSR Principle 8?",
        a: "Report outcomes, not just rupees. P8-L6 asks for the number and category of CSR beneficiaries, and P8-L2 asks about projects in government-designated aspirational districts. Leading practice is to quantify community programmes with Social Return on Investment or a Social Impact Assessment, so you are disclosing impact rather than only expenditure.",
      },
    ],
  },
  {
    slug: "brsr-principle-9-consumer-responsibility-guide",
    coverImage: "/blog/brsr-principle-9-consumer-responsibility-guide.jpg",
    title: "How to fill BRSR Principle 9 (Consumer Responsibility)",
    excerpt:
      "Principle 9 covers consumer complaints, product recalls, cyber-security and data-privacy policy, data breaches, and product labelling. A guide to answering it from complaints and product records, and to getting the data-breach and DPDP-Act disclosures right.",
    date: "2026-06-30",
    category: "How-to",
    readTime: "7 min read",
    coverGradient: ["#10233A", "#1E9DF2"],
    coverIcon: "check",
    author: AUTHOR,
    faqs: [
      {
        q: "What does BRSR Principle 9 cover?",
        a: "Responsible engagement with consumers: mechanisms for consumer complaints (P9-E1), the share of turnover carrying environmental, safe-usage and disposal information (P9-E2), consumer complaints by type including data privacy and cyber-security (P9-E3), product recalls on safety grounds (P9-E4), a cyber-security and data-privacy policy (P9-E5), and data-breach disclosures (P9-E7).",
      },
      {
        q: "How do I answer the data-breach disclosure (P9-E7)?",
        a: "P9-E7 asks for the number of data-breach instances in the year, the percentage involving personally identifiable customer information, and their impact. Draw it from the information-security incident register. With the Digital Personal Data Protection Act 2023 in force, this disclosure is under growing scrutiny, so reconcile it with your breach-notification records.",
      },
      {
        q: "Who owns Principle 9 data?",
        a: "It is split between customer service, which owns the complaints and recall data, and the legal, IT-security or data-protection function, which owns the cyber-security and data-privacy policy (P9-E5) and the data-breach figures (P9-E7). Route the complaints questions to customer service and the privacy and security questions to legal or IT.",
      },
    ],
  },

  /* ── Framework comparison guides (cited crosswalk) ─────────────────────── */
  {
    slug: "brsr-vs-gri",
    coverImage: "/blog/brsr-vs-gri.jpg",
    title: "BRSR vs GRI: how India's BRSR maps to the GRI Standards",
    excerpt:
      "BRSR and GRI overlap heavily but aren't identical. What each covers, where they line up, and how one round of data collection can feed both, with a cited BRSR-to-GRI crosswalk.",
    date: "2026-07-09",
    category: "Regulation",
    readTime: "7 min read",
    coverGradient: ["#0C2B1E", "#10A572"],
    coverIcon: "scales",
    author: AUTHOR,
    faqs: [
      {
        q: "Is BRSR based on GRI?",
        a: "Not directly. BRSR is SEBI's own format, structured around the nine NGRBC principles, but it overlaps substantially with the GRI Standards, so most BRSR disclosures can be mapped to a GRI equivalent. They share concepts and much of the underlying data, but the structure and granularity differ.",
      },
      {
        q: "Can a company report both BRSR and GRI?",
        a: "Yes, and many large Indian listed companies do. Because the two frameworks draw on largely the same underlying data (emissions, energy, water, workforce, governance), one round of data collection can feed both a BRSR filing and a GRI report. The main work is re-mapping the same figures into each framework's structure.",
      },
      {
        q: "What is the main difference between BRSR and GRI?",
        a: "BRSR is mandatory for the top 1000 listed Indian companies, prescriptive, and organised around nine principles. GRI is voluntary, global, modular (a set of universal, sector and topic standards) and impact/materiality-driven. BRSR asks specific fixed questions; GRI lets you report the topics your materiality assessment surfaces.",
      },
      {
        q: "Does BRSR require GRI?",
        a: "No. GRI is not required to file BRSR. But GRI is one of the internationally recognised frameworks BRSR is designed to be interoperable with, which is why a BRSR-to-GRI crosswalk is straightforward for most disclosures.",
      },
    ],
  },
  {
    slug: "brsr-vs-ifrs-issb",
    coverImage: "/blog/brsr-vs-ifrs-issb.jpg",
    title: "BRSR vs IFRS S1 & S2 (ISSB): what maps and what doesn't",
    excerpt:
      "The ISSB's IFRS S1 and S2 are becoming the global baseline for sustainability and climate disclosure. How BRSR lines up with them, where the gaps are, and how BRSR data can feed an IFRS S2 climate disclosure, with a cited crosswalk.",
    date: "2026-07-09",
    category: "Regulation",
    readTime: "7 min read",
    coverGradient: ["#0F1E33", "#0B6FD4"],
    coverIcon: "globe",
    author: AUTHOR,
    faqs: [
      {
        q: "Does BRSR align with IFRS S1 and S2?",
        a: "Partly. BRSR's governance, risk-management and climate disclosures map to IFRS S1 and S2, and the two share the Scope 1 & 2 emissions data. But IFRS S2 goes much deeper on climate specifically (scenario analysis, transition plans, financed emissions), while BRSR is broader and shallower, covering all nine NGRBC principles.",
      },
      {
        q: "Is ISSB / IFRS S1 & S2 mandatory in India?",
        a: "Not as of now. BRSR is the mandatory sustainability disclosure for the top 1000 listed Indian companies. IFRS S1/S2 (from the ISSB) are being adopted by many jurisdictions as the global baseline, and Indian companies with global investors or listings increasingly prepare them voluntarily.",
      },
      {
        q: "Can BRSR data feed an IFRS S2 climate disclosure?",
        a: "Yes, as a strong starting point. The Scope 1 & 2 emissions, board-oversight and risk-management data you collect for BRSR Principle 6 and Principle 1 map onto IFRS S2's governance, risk and metrics pillars. IFRS S2 then asks for more, notably climate scenario analysis and a transition plan, which BRSR does not require.",
      },
      {
        q: "What is the difference between BRSR and TCFD or IFRS S2?",
        a: "TCFD (now consolidated into IFRS S2) is climate-only and organised around four pillars: governance, strategy, risk management, and metrics & targets. BRSR is broader, covering environment plus eight other principles, but its climate depth is lighter. BRSR tells you where a company stands across all of ESG; IFRS S2 goes deep on climate for investors.",
      },
    ],
  },

  /* ── Tier 1, Original 5 posts ─────────────────────────────────────────── */
  {
    slug: "brsr-fy2526-changes",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "What changed in BRSR for FY 2025-26?",
        a:
          "Three things. Reasonable assurance on the 42 BRSR Core KPIs became mandatory for the top 500 listed companies by market capitalisation. Value-chain disclosure was pushed to purely voluntary for FY 2025-26, becoming mandatory from FY 2026-27. And SEBI's March 2025 circular clarified several long-debated points in the format, including introducing assessment as an alternative to full ISAE 3000 assurance.",
      },
      {
        q: "Is BRSR Core assurance mandatory for the top 500 companies?",
        a:
          "Yes. For FY 2025-26, SEBI requires reasonable assurance on the 42 BRSR Core KPIs for the top 500 listed companies by market capitalisation. The top 1000 join the same requirement from FY 2026-27. The assurance must come from an independent provider, typically a practising CA firm or a specialist ESG assurer.",
      },
      {
        q: "Are BRSR value-chain disclosures mandatory in FY 2025-26?",
        a:
          "No. SEBI's March 2025 circular made value-chain disclosure purely voluntary for FY 2025-26, with mandatory reporting from FY 2026-27. Companies in the top 250 should use this year to map their supply chain and brief their key Tier-1 partners, because the data will not appear on demand next year.",
      },
      {
        q: "When is the BRSR for FY 2025-26 due?",
        a:
          "BRSR is filed as part of the Annual Report rather than as a separate document, and is typically due three months after the financial year ends. For FY 2025-26 that means the Annual Report containing the BRSR is expected by late September or October 2026.",
      },
    ],
  },
  {
    slug: "scope-1-2-ghg-brsr-guide",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "How do you calculate Scope 1 and Scope 2 emissions for BRSR?",
        a:
          "Scope 1 is activity-based: collect fuel consumption from purchase records, multiply by the fuel's emission factor, and divide by 1,000 to convert kg to tonnes. Scope 2 is purchased grid electricity: kWh multiplied by the CEA grid factor, divided by 1,000. Both are reported under P6-E1 in absolute tonnes of CO2-equivalent, alongside intensity ratios.",
      },
      {
        q: "Which grid emission factor should an Indian company use for Scope 2?",
        a:
          "The Central Electricity Authority CO2 Baseline Database factor, on a location-based approach. Use version 21.0, which is 0.710 kg CO2e per kWh, for FY 2025-26 filings. Using a stale CEA version is one of the most common reasons a figure has to be restated, so state the version alongside the number.",
      },
      {
        q: "What is the diesel emission factor for BRSR Scope 1?",
        a:
          "2.68 kg CO2e per litre, from IPCC 2006 Guidelines Volume 2, Table 2.2. LPG is 1.56 kg CO2e per kg and PNG or CNG is 1.89 kg CO2e per cubic metre. Assurers increasingly expect the factor and its source version to be stated with the figure, because undocumented factors are a common reason for a qualified opinion.",
      },
      {
        q: "Does rooftop solar reduce a company's Scope 2 emissions?",
        a:
          "Only indirectly. Self-generated renewable electricity is Scope 1-neutral: it neither adds to nor offsets Scope 2. What it does is reduce the volume of electricity imported from the grid, and Scope 2 is calculated on grid imports alone, so the reported figure falls because less electricity was purchased.",
      },
    ],
  },
  {
    slug: "brsr-core-vs-essential",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "What is the difference between BRSR Core and BRSR Essential?",
        a:
          "BRSR Essential is the full reporting format SEBI prescribes, covering Sections A, B and C. BRSR Core is a curated sub-set of 42 Key Performance Indicators drawn from that format, which SEBI identified as the most material and quantifiable. Every BRSR filer completes Essential; only the 42 Core KPIs require independent assurance.",
      },
      {
        q: "How many KPIs are in BRSR Core?",
        a:
          "42. They are drawn from the full BRSR format and span all nine principles, mapping to nine broad attribute areas: GHG intensity, energy intensity, water intensity, waste generated, complaints on essential indicators, openness of business, gender-wise pay ratio, inclusive development, and CSR spend.",
      },
      {
        q: "Do companies file a separate BRSR Core report?",
        a:
          "No. Companies file the standard BRSR as part of their Annual Report, and the 42 Core KPIs within that filing are independently assured. The assurer then issues a separate Assurance Statement covering those 42 indicators. There is no separate Core filing.",
      },
      {
        q: "What is the difference between reasonable and limited assurance?",
        a:
          "Reasonable assurance is a positive opinion: the assurer states that in their opinion the KPIs are free from material misstatement, which is the same level of confidence as a statutory financial audit. Limited assurance is a negative opinion: nothing came to the assurer's attention to suggest misstatement. Reasonable assurance requires substantially more evidence, and it is what BRSR Core demands.",
      },
    ],
  },
  {
    slug: "5-brsr-fields-manufacturers-struggle",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Which BRSR disclosures do manufacturers get wrong most often?",
        a:
          "Five recur: P6-E1 GHG emissions (reporting Scope 1 but omitting Scope 2, or using kg instead of tonnes), P3-E1 total workforce (missing third-party contractor headcount), P2-E3 and P2-E4 Extended Producer Responsibility, P6-E7 energy intensity (wrong denominator), and the gender wage ratio. None are conceptually hard; the data is simply scattered or the format is misread.",
      },
      {
        q: "Does BRSR P3-E1 include contract and agency workers?",
        a:
          "Yes. P3-E1 asks for total workforce including contractual workers, part-time workers and workers supplied by staffing agencies. Most HR systems track only permanent and direct-hire staff, so security, housekeeping and logistics contractors are almost always missed. Ask facilities or admin for the third-party headcount, not just HR.",
      },
      {
        q: "Which denominator should be used for BRSR energy intensity?",
        a:
          "The format allows either turnover in rupees crore or physical output in units or tonnes. Use both where the data exists, since they answer different questions. For a service business with no physical output, turnover alone is acceptable. The mistake to avoid is switching denominators between years, which makes the trend meaningless.",
      },
      {
        q: "Do manufacturers need EPR registration to answer BRSR?",
        a:
          "If they use plastic packaging or sell electronics or batteries, they need an Extended Producer Responsibility registration with CPCB under the Plastic Waste, E-Waste and Battery Waste Management Rules 2022. BRSR asks for the EPR obligation and how much was collected or recycled. A missing registration is a compliance problem in its own right, not just a reporting gap.",
      },
    ],
  },
  {
    slug: "cbam-2026-indian-exporters",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Does CBAM apply to Indian exporters?",
        a:
          "Indirectly but unavoidably. The legal obligation sits with the EU importer, who must buy CBAM certificates covering the embedded emissions in the goods. But the importer can only discharge it with accurate embedded-emissions data from the manufacturer, so the data burden lands on the Indian exporter.",
      },
      {
        q: "Which goods does CBAM cover?",
        a:
          "Steel and iron, cement, aluminium, fertilizers, hydrogen and electricity. The definitive phase began on 1 January 2026, so the obligations are live rather than transitional, and the first annual report covering calendar year 2026 is due in May 2027.",
      },
      {
        q: "What happens if an Indian exporter cannot provide embedded-emissions data?",
        a:
          "The EU importer must fall back on CBAM default values set by the EU Commission. Those defaults are based on average EU production carbon intensity and are deliberately conservative, so they price the consignment punitively. In practice importers either pass that cost back or move to suppliers who can produce real data.",
      },
      {
        q: "Can BRSR GHG data be reused for CBAM?",
        a:
          "Mostly. If a client already calculates Scope 1 and Scope 2 for BRSR P6-E1, that covers most of what CBAM needs. The key difference is granularity: CBAM asks for emissions per tonne of product, not total company emissions, so a plant making multiple products needs an allocation methodology.",
      },
    ],
  },

  /* ── New SEO posts ──────────────────────────────────────────────────────── */
  {
    slug: "brsr-applicability-guide",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Which companies have to file BRSR?",
        a:
          "The top 1000 listed companies by market capitalisation, under SEBI's LODR Regulations, specifically Regulation 34(2)(f). BRSR has been mandatory for that group since FY 2022-23, replacing the older Business Responsibility Report required since 2012.",
      },
      {
        q: "Do first-time BRSR filers have to complete the Leadership indicators?",
        a:
          "No. Leadership indicators are required only for companies that have been filing BRSR for three or more years, or that are among the top 1000. A first-time filer completes the 68 Essential indicators. Settling this in the kickoff meeting keeps the data-collection scope honest, because Leadership adds 40 more fields.",
      },
      {
        q: "Is BRSR filed separately from the annual report?",
        a:
          "No. BRSR is filed as part of the Annual Report, not as a standalone document, and is typically due three months after the financial year closes. BRSR Core is likewise not a separate report: the 42 Core KPIs sit inside the same filing and attract a separate Assurance Statement.",
      },
      {
        q: "Do unlisted companies have to file BRSR?",
        a:
          "Not directly. But an unlisted company can be pulled in as a significant value-chain partner of a listed filer, which from FY 2026-27 means disclosing against the BRSR Core KPIs. Unlisted suppliers to large listed customers should expect the request rather than wait for it.",
      },
    ],
  },
  {
    slug: "brsr-core-assurance-fy2526",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Who needs BRSR Core assurance in FY 2025-26?",
        a:
          "The top 500 listed companies by market capitalisation. FY 2025-26 is the second year the requirement applies to that group. The top 1000 join from FY 2026-27, so companies ranked 501 to 1000 should be building the evidence trail this year rather than next.",
      },
      {
        q: "What standard is BRSR Core assurance carried out under?",
        a:
          "ISAE 3000, the international standard for assurance engagements other than audits of historical financial information. BRSR Core requires reasonable assurance under it, which is a positive opinion carrying the same level of confidence as a statutory financial audit.",
      },
      {
        q: "What does a BRSR Core assurer actually check?",
        a:
          "Source-level data, not the final reported figure. Expect requests for meter readings rather than just the electricity bill total, site-level data before aggregation to company level, and documentary evidence of every calculation step including the emission factor and its version.",
      },
      {
        q: "What are the ISF BRSR Core standards?",
        a:
          "Sector-specific standards published in December 2024 by the Industry Standards Forum, a body constituted under SEBI's aegis. They give binding guidance on how each of the 42 Core KPIs should be measured, and they are also the criteria an evaluator tests against under the lighter assessment pathway.",
      },
    ],
  },
  {
    slug: "brsr-data-collection-guide",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Who inside a company owns the BRSR data?",
        a:
          "It is split across departments: HR owns Principle 3 workforce and most of Principle 5, EHS and the energy manager own Principle 6 environment, the Company Secretary owns Principle 1 governance and Principle 7, Procurement owns Principle 2 value chain, and CSR owns Principle 8. Mapping principle to owner before sending anything is what stops a request being forwarded three times.",
      },
      {
        q: "Why do BRSR data-collection spreadsheets fail?",
        a:
          "Because one large sheet with all 108 fields sent to whoever handles compliance gives the recipient no way to know which fields they own, why each number is needed, or what unit SEBI expects. It sits for two weeks and comes back ten fields filled. Five or six targeted requests, one per team, work far better.",
      },
      {
        q: "What should a BRSR request to the HR team ask for?",
        a:
          "Permanent employees and workers segmented by male and female and differently-abled, contract employees and third-party staffing-agency headcount, part-time and on-call numbers, and the Principle 5 human-rights items such as complaints and training. The agency contractors are the ones most often missed, because they are not in the HRMS.",
      },
      {
        q: "How can a consultant speed up BRSR data collection?",
        a:
          "Split the ask by owning team, explain in plain language what each field means and where the team would normally find it, and state the unit. Saaksh's free tool generates a per-team data request brief from a client's gap analysis, and Collect (Pro) sends and chases those requests with reminders and no-login submission.",
      },
    ],
  },
  {
    slug: "brsr-assurance-vs-assessment",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "What is the difference between BRSR assurance and assessment?",
        a:
          "Reasonable assurance under ISAE 3000 requires the assurer to gather sufficient evidence for a positive opinion, at the evidence burden of a statutory financial audit. Assessment, introduced by SEBI in March 2025, is an evaluation of whether the reported Core KPIs comply with the ISF sector-specific standards. It is less onerous, but still needs an independent third party and a structured evidence review.",
      },
      {
        q: "When did SEBI introduce the BRSR assessment pathway?",
        a:
          "In its circular dated 28 March 2025. Before that, reasonable assurance under ISAE 3000 was the only permitted pathway for verifying the 42 BRSR Core KPIs.",
      },
      {
        q: "Is BRSR assessment a self-certification?",
        a:
          "No. Assessment requires an independent evaluator and a structured review of the evidence behind the reported Core KPIs. It is a lighter pathway than ISAE 3000 reasonable assurance, not an internal sign-off.",
      },
      {
        q: "Which companies can choose assessment instead of reasonable assurance?",
        a:
          "The specific eligibility criteria are set out in SEBI's circular of 28 March 2025, and the pathway decision should be taken against the circular itself rather than a summary. Read it directly before advising a client; it is published on SEBI's website under the ESG and BRSR section.",
      },
    ],
  },
  {
    slug: "brsr-for-it-services",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Which BRSR disclosures are not applicable to an IT services company?",
        a:
          "Eleven Section C indicators are manufacturing-specific: P2-E3, P2-E4, P2-L4, P2-L5, P6-E2, P6-E4, P6-E5, P6-E6, P6-E11, P6-E12 and P6-L3. A pure services business with no factory can mark each not applicable, but only with a brief written justification against each one.",
      },
      {
        q: "Do IT companies have to report GHG emissions under BRSR?",
        a:
          "Yes. Scope 2 grid electricity for offices and data centres is fully applicable under P6-E1, and Scope 1 applies wherever the company runs DG sets or owns vehicles. Being a services business removes the process-emission disclosures, not the energy ones.",
      },
      {
        q: "Can a services company mark a BRSR field not applicable without explaining why?",
        a:
          "It should not. A bare not applicable with no justification is what invites SEBI scrutiny. Each of the eleven manufacturing-specific indicators should carry a one-line reason, such as the company having no manufacturing operations or industrial effluent.",
      },
      {
        q: "Which BRSR principles matter most for IT services companies?",
        a:
          "Principle 3 (employee wellbeing) and Principle 5 (human rights) apply in full and are usually the most material, given large workforces and contract staffing. Principle 1 governance and Principle 9 consumer responsibility, particularly data privacy under the DPDP Act, also carry more weight than they do for a manufacturer.",
      },
    ],
  },
  {
    slug: "brsr-for-textile-companies",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Does CCTS apply to textile companies?",
        a:
          "Yes. BEE notified textile as one of the nine GEI-obligated sectors under India's Carbon Credit Trading Scheme in January 2026. Obligated textile companies must measure their actual GHG emission intensity for FY 2025-26 and submit a verified report to BEE.",
      },
      {
        q: "When is the BEE GEI report due for textile companies?",
        a:
          "31 July 2026, for the FY 2025-26 compliance year. Companies that beat their BEE-set GEI target earn Carbon Credit Certificates; those that miss it must buy certificates to cover the shortfall.",
      },
      {
        q: "Which BRSR disclosures matter most for a textile company?",
        a:
          "The Principle 6 environmental set, because dyeing and finishing are heat-intensive and textile is among the most water-intensive manufacturing sectors in India, and dyeing effluent carries high chemical oxygen demand. Principles 3 and 5 are equally material given a large, predominantly female and often contract-heavy workforce.",
      },
      {
        q: "Can CCTS and BRSR data collection be combined?",
        a:
          "Largely, yes. The fuel consumption, electricity units and production volume that CCTS needs for GHG emission intensity are substantially the same inputs BRSR P6-E1 requires. Collecting them once, at site level and with the emission factor versions documented, serves both obligations.",
      },
    ],
  },
  {
    slug: "brsr-value-chain-disclosure",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Are BRSR value-chain disclosures mandatory?",
        a:
          "Not for FY 2025-26. SEBI's March 2025 circular made them purely voluntary for that year, with mandatory reporting from FY 2026-27. This replaced the earlier comply-or-explain expectation and gives both listed companies and their suppliers a year to build the capability.",
      },
      {
        q: "Which value-chain partners are in scope for BRSR?",
        a:
          "Partners that individually account for 2% or more of the company's total purchases or sales, with aggregate coverage capped at 75%. Once enough partners cover 75% of purchases and sales you stop, even if others individually exceed 2%. You apply whichever criterion yields the smaller number of partners.",
      },
      {
        q: "Do value-chain partners have to file a full BRSR?",
        a:
          "No. In-scope partners are not expected to complete all 108 indicators. The expectation is disclosure against the 42 BRSR Core KPIs under the assessment framework, rather than full reasonable assurance.",
      },
      {
        q: "How many suppliers does the 2% threshold typically capture?",
        a:
          "For a large manufacturer, usually between 8 and 20 key Tier-1 suppliers, and a similar number of large customers. The threshold narrows the scope considerably compared with the whole-supply-chain exercise many companies initially feared.",
      },
    ],
  },
  {
    slug: "brsr-water-disclosure-calculation",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "What is the difference between water withdrawal and water consumption in BRSR?",
        a:
          "Withdrawal is the total volume taken from all sources. Consumption is the volume that does not return to the source catchment, because it is incorporated into the product, evaporated or otherwise not discharged. The relationship is consumption equals withdrawal minus water discharged, and SEBI expects both figures, not just withdrawal.",
      },
      {
        q: "Which BRSR indicators cover water?",
        a:
          "Three. P6-E3 covers total water withdrawal by source, total consumption, and water intensity (Essential). P6-E4 covers effluent generation and treatment (Essential). P6-L1 covers water discharge quality parameters (Leadership, so it applies only to companies with three or more years of filing or in the top 1000).",
      },
      {
        q: "How is water intensity calculated for BRSR?",
        a:
          "By dividing the water volume, in kilolitres, by turnover in rupees crore, giving kL per crore of revenue. Physical output can be used as an additional denominator where the client has it. Keep the denominator consistent year on year, or the trend cannot be read.",
      },
      {
        q: "How does Zero Liquid Discharge affect the BRSR water disclosure?",
        a:
          "It simplifies it. In a ZLD-certified facility there is no discharge, so water consumption equals water withdrawal. The certification itself is also the evidence an assurer will ask for under P6-E5.",
      },
    ],
  },
  {
    slug: "ccts-india-2025-26",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "What is India's Carbon Credit Trading Scheme?",
        a:
          "CCTS is India's national carbon market framework, notified by MoEFCC under the Energy Conservation (Amendment) Act 2022 and implemented by the Bureau of Energy Efficiency. BEE sets sector-specific GHG emission intensity targets through GEI Target Orders. Entities that beat their target earn Carbon Credit Certificates tradable on the Indian Carbon Market; those that miss must buy them.",
      },
      {
        q: "Which sectors are obligated under CCTS?",
        a:
          "Nine, notified in two tranches. Aluminium, cement, chlor-alkali and pulp and paper came in October 2025. Petroleum refining, petrochemicals, textiles, iron and steel, and fertilisers followed in January 2026.",
      },
      {
        q: "How many companies are obligated under CCTS?",
        a:
          "Approximately 490 entities across the nine sectors in the first compliance year. The definitive list is maintained by BEE and can change as BEE updates its assessments, so it should be checked against BEE rather than assumed.",
      },
      {
        q: "When is the first CCTS report due?",
        a:
          "31 July 2026. Obligated entities must measure their actual GHG emission intensity across the full FY 2025-26 year, April 2025 to March 2026, and submit a verified emission intensity report to BEE by that date.",
      },
    ],
  },
  {
    slug: "brsr-materiality-assessment-guide",
    updated: "2026-09-08",
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
    faqs: [
      {
        q: "Does BRSR require a materiality assessment?",
        a:
          "It requires evidence of a process rather than a prescribed methodology. Principle 4 requires companies to identify material stakeholders and describe how they engage them, and the Section B management disclosures ask about policies, targets and governance for ESG issues, which implicitly requires identifying material topics.",
      },
      {
        q: "What are the six BRSR stakeholder groups?",
        a:
          "Communities affected by operations, employees (permanent and contract), shareholders and investors, regulators, customers, and value-chain partners such as suppliers and distributors. The useful step is naming the specific groups within each category for that client, rather than restating the six labels.",
      },
      {
        q: "Does BRSR require double materiality like the CSRD?",
        a:
          "Not formally, but a defensible assessment demonstrates both directions: outside-in, meaning which ESG topics could affect financial performance, and inside-out, meaning the company's impact on the environment and society. That is broadly the double-materiality concept the EU's CSRD formalises, applied less prescriptively.",
      },
      {
        q: "How many Indian companies disclose their materiality methodology?",
        a:
          "Only 34% of BSE 100 companies publicly disclose their materiality assessment methodology, according to WBCSD India's 2024 review. The rest either omit the disclosure or present a pre-screened topic list with no evidence of a genuine stakeholder process.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

/** The date a post should be judged fresh by: its revision if it has one, else publication. */
export function lastTouched(post: BlogPost): string {
  return post.updated ?? post.date;
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
