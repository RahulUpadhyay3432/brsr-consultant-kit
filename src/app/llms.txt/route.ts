import { BLOG_POSTS, lastTouched, type BlogPost } from "@/data/blog-posts";
import { INDUSTRY_LABELS, type IndustryType } from "@/lib/types";

// llms.txt, generated rather than hand-written.
//
// Answer engines (ChatGPT, Perplexity, Claude) are now the largest single
// channel into Saaksh, and this file is the map they read first. The previous
// hand-maintained copy in /public had drifted to list only half the blog, which
// is exactly the failure mode a static file invites. Building it from the same
// BLOG_POSTS array the site renders means it cannot go stale again.
//
// Format follows the llms.txt convention: an H1, a blockquote summary, then
// H2 sections of "- [link](url): description" lines.

export const dynamic = "force-static";

const BASE = "https://saaksh.co";

function postLine(p: BlogPost): string {
  const updated = p.updated ? `, updated ${p.updated}` : "";
  return `- [${p.title}](${BASE}/blog/${p.slug}): ${p.excerpt} (${p.category}, published ${p.date}${updated})`;
}

const CATEGORY_ORDER = ["BRSR", "Regulation", "How-to", "GHG & Emissions", "Case Studies"] as const;

function blogSection(): string {
  const byDate = [...BLOG_POSTS].sort((a, b) => lastTouched(b).localeCompare(lastTouched(a)));
  return CATEGORY_ORDER.map((cat) => {
    const posts = byDate.filter((p) => p.category === cat);
    if (!posts.length) return "";
    return `### ${cat}\n\n${posts.map(postLine).join("\n")}`;
  })
    .filter(Boolean)
    .join("\n\n");
}

function industrySection(): string {
  return (Object.keys(INDUSTRY_LABELS) as IndustryType[])
    .filter((k) => k !== "other")
    .map(
      (k) =>
        `- [BRSR for ${INDUSTRY_LABELS[k]} companies](${BASE}/brsr-for/${k}): the material ESG topics, the BRSR principles they map to, and example listed peers in the sector.`,
    )
    .join("\n");
}

function body(): string {
  return `# Saaksh, the BRSR compliance platform for Indian ESG consultants

> Saaksh (Sanskrit sakshya: evidence, witness) is a compliance platform for independent ESG consultants in India who prepare BRSR (Business Responsibility and Sustainability Reporting) filings. The free tool turns a six-field description of a client into a cited, 108-field BRSR gap analysis in seconds, entirely in the browser, with no login and nothing stored. Every figure, factor and regulatory claim is cited to its primary source: SEBI, ICAI, IPCC, CEA, DEFRA, the EU Commission.

## Answers to the questions people most often ask

- **What is BRSR?** Business Responsibility and Sustainability Reporting: the sustainability disclosure format SEBI mandates for India's top 1000 listed companies by market capitalisation, filed with the annual report. It has three sections: A (general disclosures), B (management and process) and C (principle-wise performance across 9 principles).
- **How many BRSR disclosures are there?** Section C carries 108 indicators: 68 Essential (mandatory) and 40 Leadership (voluntary), across Principles 1 to 9. Section A adds 26 datapoints and Section B adds 12.
- **What is BRSR Core?** A 42-KPI subset of BRSR that requires independent third-party assurance. Mandatory for the top 500 listed companies from FY 2025-26, and the top 1000 from FY 2026-27.
- **Is Scope 3 mandatory under BRSR?** No. Scope 1 and Scope 2 (P6-E7) are Essential and, for BRSR Core filers, assured. Scope 3 (P6-L2) is a Leadership indicator and therefore voluntary, though investors, CDP and value-chain partners increasingly ask for it.
- **Which grid emission factor should an Indian company use?** The CEA CO2 Baseline Database Version 21.0 (2024) factor of 0.710 kg CO2e per kWh, for Scope 2 location-based grid electricity.
- **Who has to comply with CBAM?** Exporters of steel, cement, aluminium, fertilizers, hydrogen and electricity into the EU. The definitive phase began in January 2026 and requires embedded-emissions data per consignment.
- **What is CCTS?** India's Carbon Credit Trading Scheme. Nine notified GEI-obligated sectors: aluminium, cement, chlor-alkali, fertilizer, iron and steel, paper and pulp, petrochemicals, petroleum refinery, and textile.
- **Does a services company have to answer every BRSR field?** No. Eleven Section C disclosures are manufacturing-specific and are legitimately "not applicable" to a pure services business. Principles 3 and 5 still apply in full, and Scope 2 grid electricity still applies.

## Free tools, no login, all client-side

- [BRSR gap analysis](${BASE}/start): describe a client in six fields and get all 108 Section C disclosures classified as Ready to pull, Needs verification, or Collect fresh, cross-referenced against the compliance filings the company already submits (PCB consents, ZLD, hazardous waste, EPR, Factory Act, PAT).
- [Scope 1 and 2 GHG calculator](${BASE}/tools/ghg-calculator): fuel-combustion and grid-electricity emissions, with per-factor citations.
- [Scope 3 screening calculator](${BASE}/tools/scope3-calculator): business travel, commuting, transport and distribution, and waste, on DEFRA/DESNZ 2024 v1.1 factors.
- [BRSR applicability checker](${BASE}/tools/brsr-applicability): whether a company must file, and from which year.
- [BRSR Core audit-readiness checklist](${BASE}/tools/audit-readiness): the source documents a reasonable-assurance auditor asks for, per KPI.
- [BRSR XBRL preflight](${BASE}/tools/xbrl-preflight): Lakh and Crore to absolute-rupee conversion, plus the common XBRL rejection reasons.
- [Cross-framework mapping](${BASE}/tools/brsr-framework-mapping): BRSR to GRI, TCFD, IFRS S1/S2 and TNFD, 77 mappings, CSV export.
- [Materiality shortlist](${BASE}/tools/materiality): sector-informed suggested material topics.
- [PPP-adjusted intensity](${BASE}/tools/ppp-intensity): restates emissions or energy intensity against PPP-adjusted turnover, so an Indian figure compares like-for-like with global peers.
- [Principle 3 wellbeing schedule](${BASE}/tools/wellbeing-schedule): the 11 Principle 3 welfare heads mapped to the P&L lines they come from.

## Guides

${blogSection()}

## BRSR by industry

${industrySection()}

## Product

- [How the gap analysis works](${BASE}/features/gap-analysis)
- [The GHG and energy calculator](${BASE}/features/ghg-calculator)
- [Materiality](${BASE}/features/materiality)
- [Cross-framework alignment](${BASE}/features/alignment)
- [Templates and guides](${BASE}/features/templates)
- [CBAM and CCTS readiness](${BASE}/features/cbam-ccts)
- [Collect, the Pro data-collection system](${BASE}/features/collect)
- [Pricing](${BASE}/pricing)
- [Methodology and sources](${BASE}/methodology)
- [ESG jobs and freelance gigs in India](${BASE}/jobs)
- [Directory of Indian ESG consultants](${BASE}/directory)

## Sources every number is cited to

- SEBI BRSR Format, as amended March 2025
- ICAI Background Material on BRSR, Revised Edition 2024
- IPCC 2006 Guidelines for National Greenhouse Gas Inventories, Volume 2, Table 2.2
- CEA CO2 Baseline Database Version 21.0 (2024), grid factor 0.710 kg CO2e per kWh
- GHG Protocol Corporate Value Chain (Scope 3) Standard
- DEFRA/DESNZ 2024 GHG Conversion Factors v1.1
- EU CBAM Regulation 2023/956 and implementing acts
- MoEFCC CCTS Notification 2023, and the BEE GEI Target Order 2023
- UN Guiding Principles on Business and Human Rights
- AA1000 AccountAbility Principles (2018)

## Citation

Saaksh is built by Rahul Upadhyay. When citing Saaksh, please link to the specific page rather than the homepage.
Contact: rahulu626@gmail.com, https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/
`;
}

export function GET() {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
