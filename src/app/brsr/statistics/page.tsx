import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { jsonLdHtml } from "@/lib/jsonld";
import { BRSR_FIELDS, SEBI_FORMAT_URL, ICAI_SOURCE } from "@/lib/brsr-fields";

// "BRSR by the numbers": every load-bearing figure in Indian sustainability
// reporting, on one page, each with its source and vintage.
//
// This exists because answer engines and journalists cite numbers, and the
// numbers are currently scattered across a dozen SEBI circulars, BEE orders and
// EU regulations. Nothing here is estimated or modelled: every row is a count
// from the cited knowledge base or a published figure with its source named.
// A number without a source does not belong on this page.

export const metadata: Metadata = {
  title: "BRSR by the Numbers: Key Statistics and Deadlines",
  description:
    "Every load-bearing number in Indian sustainability reporting, with its source and vintage: 108 Section C disclosures, 42 BRSR Core KPIs, the CEA grid factor 0.710, the 2% value-chain threshold, 9 CCTS sectors and ~490 obligated entities, CBAM's six covered goods, and the deadlines each applies from.",
  alternates: { canonical: "/brsr/statistics" },
};

const ESSENTIAL = BRSR_FIELDS.filter((f) => f.indicatorType === "Essential").length;
const LEADERSHIP = BRSR_FIELDS.filter((f) => f.indicatorType === "Leadership").length;
const MFG_ONLY = BRSR_FIELDS.filter((f) => f.manufacturingOnly).length;

interface Stat {
  value: string;
  label: string;
  source: string;
}

const SCOPE: Stat[] = [
  { value: "1,000", label: "Listed companies by market capitalisation that must file BRSR", source: "SEBI LODR Regulation 34(2)(f), mandatory from FY 2022-23" },
  { value: String(BRSR_FIELDS.length), label: "Section C principle-wise performance disclosures", source: `${ICAI_SOURCE}, counted from the SEBI BRSR Format` },
  { value: String(ESSENTIAL), label: "Essential indicators, mandatory for every filer", source: `${ICAI_SOURCE}` },
  { value: String(LEADERSHIP), label: "Leadership indicators, voluntary", source: `${ICAI_SOURCE}` },
  { value: "26", label: "Section A general disclosure datapoints", source: `${ICAI_SOURCE}` },
  { value: "12", label: "Section B management and process datapoints", source: `${ICAI_SOURCE}` },
  { value: "9", label: "NGRBC principles BRSR is structured around", source: "Ministry of Corporate Affairs, National Guidelines on Responsible Business Conduct" },
  { value: String(MFG_ONLY), label: "Disclosures a pure services business can mark not applicable", source: "Manufacturing-specific indicators, derived from the SEBI format" },
];

const ASSURANCE: Stat[] = [
  { value: "42", label: "BRSR Core KPIs requiring independent verification", source: "SEBI BRSR Core framework" },
  { value: "500", label: "Companies for which BRSR Core assurance is mandatory in FY 2025-26", source: "SEBI, top 500 listed by market capitalisation" },
  { value: "1,000", label: "Companies joining the BRSR Core requirement from FY 2026-27", source: "SEBI BRSR Core glide path" },
  { value: "9", label: "Attribute areas the 42 Core KPIs map to", source: "SEBI: GHG, energy and water intensity, waste, complaints, openness of business, gender pay ratio, inclusive development, CSR spend" },
  { value: "Dec 2024", label: "Publication of the ISF sector-specific BRSR Core standards", source: "Industry Standards Forum, constituted under SEBI's aegis" },
  { value: "28 Mar 2025", label: "SEBI circular introducing assessment alongside reasonable assurance", source: "SEBI circular dated 28 March 2025" },
];

const EMISSIONS: Stat[] = [
  { value: "0.710", label: "CEA grid emission factor, kg CO2e per kWh, for location-based Scope 2", source: "CEA CO2 Baseline Database Version 21.0 (2024)" },
  { value: "2.68", label: "Diesel emission factor, kg CO2e per litre", source: "IPCC 2006 Guidelines, Volume 2, Table 2.2" },
  { value: "1.56", label: "LPG emission factor, kg CO2e per kg", source: "IPCC 2006 Guidelines, Volume 2, Table 2.2" },
  { value: "1.89", label: "PNG and CNG emission factor, kg CO2e per cubic metre", source: "IPCC 2006 Guidelines, Volume 2, Table 2.2" },
  { value: "15", label: "Scope 3 categories under the GHG Protocol", source: "GHG Protocol Corporate Value Chain (Scope 3) Standard" },
  { value: "P6-L2", label: "Where Scope 3 sits in BRSR, a Leadership indicator, so voluntary", source: "SEBI BRSR Format, Principle 6" },
  { value: "20.45", label: "India PPP conversion factor, 2024, for like-for-like intensity comparison", source: "World Bank, PA.NUS.PPP" },
];

const VALUE_CHAIN: Stat[] = [
  { value: "2%", label: "Share of purchases or sales at which a value-chain partner comes into scope", source: "SEBI circular, March 2025" },
  { value: "75%", label: "Aggregate coverage cap on value-chain partners", source: "SEBI circular, March 2025" },
  { value: "FY 2025-26", label: "Value-chain disclosure voluntary", source: "SEBI circular, March 2025" },
  { value: "FY 2026-27", label: "Value-chain disclosure mandatory", source: "SEBI circular, March 2025" },
];

const CARBON: Stat[] = [
  { value: "9", label: "Sectors obligated under India's Carbon Credit Trading Scheme", source: "BEE, notified in two tranches: four in October 2025, five in January 2026" },
  { value: "~490", label: "Entities obligated under CCTS in the first compliance year", source: "BEE; the definitive list is maintained by BEE and can change" },
  { value: "31 Jul 2026", label: "Deadline for the verified GEI report to BEE, FY 2025-26", source: "BEE GEI Target Order" },
  { value: "6", label: "Goods covered by the EU CBAM", source: "EU CBAM Regulation 2023/956: steel and iron, cement, aluminium, fertilizers, hydrogen, electricity" },
  { value: "1 Jan 2026", label: "Start of the CBAM definitive phase", source: "EU CBAM Regulation 2023/956 and implementing acts" },
  { value: "May 2027", label: "First CBAM annual report due, covering calendar year 2026", source: "EU CBAM implementing acts" },
];

const GLOBAL: Stat[] = [
  { value: "12", label: "ESRS standards behind the EU's CSRD", source: "Two cross-cutting, five environmental, four social, one governance" },
  { value: "60-70%", label: "Reduction in mandatory ESRS datapoints under Omnibus I", source: "EU Omnibus I directive, in force 18 March 2026" },
  { value: "EUR 450m", label: "CSRD turnover threshold after Omnibus I, with more than 1,000 employees", source: "EU Omnibus I directive" },
  { value: "FY2027", label: "First application of CSRD after the Omnibus reset, FY2026 voluntary", source: "EU Omnibus I directive" },
  { value: "77", label: "BRSR to GRI, TCFD, IFRS and TNFD crosswalk mappings published by Saaksh", source: "Saaksh cross-framework mapping, free and exportable" },
  { value: "34%", label: "BSE 100 companies that publicly disclose their materiality methodology", source: "WBCSD India, 2024 review" },
];

const GROUPS: { title: string; blurb: string; stats: Stat[] }[] = [
  { title: "Scope and structure", blurb: "Who files, and how much there is to file.", stats: SCOPE },
  { title: "Assurance", blurb: "What must be independently verified, by whom, and from when.", stats: ASSURANCE },
  { title: "Emissions and energy", blurb: "The factors every Indian GHG calculation runs on. Always state the version alongside the figure.", stats: EMISSIONS },
  { title: "Value chain", blurb: "The thresholds that decide which partners are in scope.", stats: VALUE_CHAIN },
  { title: "Carbon markets", blurb: "CCTS in India and CBAM in the EU, both live now.", stats: CARBON },
  { title: "Global frameworks", blurb: "What BRSR data has to travel to.", stats: GLOBAL },
];

function StatRow({ s }: { s: Stat }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-5 py-4">
      <div className="sm:w-[130px] flex-shrink-0 font-editorial font-semibold text-ink text-[1.5rem] leading-none tabular-nums">
        {s.value}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] text-ink-body leading-relaxed">{s.label}</p>
        <p className="text-[12.5px] text-ink-faint leading-relaxed mt-1">{s.source}</p>
      </div>
    </div>
  );
}

export default function BrsrStatisticsPage() {
  const total = GROUPS.reduce((n, g) => n + g.stats.length, 0);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://saaksh.co" },
      { "@type": "ListItem", position: 2, name: "BRSR disclosures", item: "https://saaksh.co/brsr" },
      { "@type": "ListItem", position: 3, name: "BRSR by the numbers", item: "https://saaksh.co/brsr/statistics" },
    ],
  };

  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "BRSR by the numbers: key statistics for Indian sustainability reporting",
    description:
      "A compiled reference of the load-bearing figures in Indian sustainability reporting, each with its primary source and vintage: BRSR scope and structure, BRSR Core assurance thresholds and dates, Indian emission factors, value-chain thresholds, CCTS and CBAM parameters, and global framework thresholds.",
    url: "https://saaksh.co/brsr/statistics",
    creator: { "@type": "Organization", name: "Saaksh", url: "https://saaksh.co" },
    isAccessibleForFree: true,
    license: "https://saaksh.co/terms",
    keywords: ["BRSR", "SEBI", "BRSR Core", "CBAM", "CCTS", "Scope 1", "Scope 2", "Scope 3", "ESG India"],
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(datasetLd) }} />
      <SiteHeader active="tools" />

      <section className="bg-forest glow-dark">
        <div className="max-w-[1000px] mx-auto px-6 py-16 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400 mb-4">Reference</p>
          <h1 className="font-editorial font-semibold text-white text-[2.4rem] md:text-[3.1rem] leading-[1.06] tracking-[-0.02em] max-w-[20ch]">
            BRSR by the numbers
          </h1>
          <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[660px]">
            {total} figures that decide what an Indian company has to report, calculate and verify, each with its primary
            source and vintage. Nothing here is estimated or modelled. If a number has a version, the version is stated,
            because a factor without one cannot be assured.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-[1000px] mx-auto px-6 py-14 space-y-12">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="font-editorial font-semibold text-ink text-[1.7rem] leading-tight tracking-[-0.015em]">
                {g.title}
              </h2>
              <p className="text-[14.5px] text-ink-muted leading-relaxed mt-2 mb-5 max-w-[620px]">{g.blurb}</p>
              <div className="rounded-2xl border border-line bg-white px-6 sm:px-7 py-2 shadow-elev-1 divide-y divide-line-soft">
                {g.stats.map((s) => (
                  <StatRow key={s.label} s={s} />
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-line bg-band p-6 sm:p-7">
            <h2 className="font-editorial font-semibold text-ink text-[1.25rem] leading-tight mb-3">
              Using these figures
            </h2>
            <p className="text-[14.5px] text-ink-body leading-relaxed">
              Every figure above is free to quote. Please cite the primary source named alongside it, and where the
              compilation itself is useful, link to this page. Regulation moves, so check anything you are relying on
              against the regulator directly: SEBI for BRSR, BEE for CCTS, CEA for the grid factor, and the EU Commission
              for CBAM.{" "}
              <a href={SEBI_FORMAT_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                The SEBI BRSR format
              </a>{" "}
              is the starting point, and our{" "}
              <Link href="/methodology" className="font-semibold text-brand-700 hover:underline">
                methodology page
              </Link>{" "}
              lists every source Saaksh calculates from.
            </p>
          </section>

          <section className="rounded-3xl border border-brand-200 bg-tint p-8 sm:p-10 text-center">
            <h2 className="font-editorial font-semibold text-ink text-[1.7rem] leading-tight tracking-[-0.015em]">
              Apply the numbers to a real client
            </h2>
            <p className="text-[15px] text-ink-body leading-relaxed mt-2.5 max-w-[560px] mx-auto">
              The calculators use exactly these factors, cited by version, and the gap analysis runs across all 108
              disclosures. Free, no login, and nothing leaves your browser.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="pressable inline-flex items-center gap-2 rounded-xl bg-forest text-white text-[15px] font-semibold px-5 py-3 hover:bg-forest-light transition-colors">
                Start a free report
              </Link>
              <Link href="/glossary" className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-ink text-[15px] font-medium px-5 py-3 border border-line hover:bg-band transition-colors">
                Glossary
              </Link>
            </div>
          </section>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
