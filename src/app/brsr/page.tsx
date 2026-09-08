import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { jsonLdHtml } from "@/lib/jsonld";
import { BRSR_FIELDS, fieldsByPrinciple, PRINCIPLE_GUIDE, ICAI_SOURCE, SEBI_FORMAT_URL } from "@/lib/brsr-fields";

// The hub for the 108 per-field reference pages. Doubles as the answer to the
// broad query ("BRSR Section C disclosures list", "all 108 BRSR indicators"),
// which nobody currently publishes in a readable form, and as the internal
// linking spine that makes the field pages discoverable.

export const metadata: Metadata = {
  title: "All 108 BRSR Section C Disclosures, Explained",
  description:
    "Every BRSR Section C disclosure, P1 to P9: SEBI's own wording, the unit, which team holds the data, and what a complete assurance-ready answer contains. 68 Essential and 40 Leadership indicators, cited to SEBI and ICAI.",
  alternates: { canonical: "/brsr" },
};

const ESSENTIAL = BRSR_FIELDS.filter((f) => f.indicatorType === "Essential").length;
const LEADERSHIP = BRSR_FIELDS.filter((f) => f.indicatorType === "Leadership").length;

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-5 py-4 shadow-elev-1">
      <div className="font-editorial font-semibold text-ink text-[1.9rem] leading-none tabular-nums">{n}</div>
      <div className="text-[12.5px] text-ink-muted leading-snug mt-1.5">{label}</div>
    </div>
  );
}

export default function BrsrIndexPage() {
  const groups = fieldsByPrinciple();

  const listLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "SEBI Business Responsibility and Sustainability Report (BRSR), Section C",
    description:
      "The 108 principle-wise performance disclosures in Section C of SEBI's BRSR format: 68 Essential indicators and 40 Leadership indicators across Principles 1 to 9.",
    url: "https://saaksh.co/brsr",
    hasDefinedTerm: BRSR_FIELDS.map((f) => ({
      "@type": "DefinedTerm",
      name: `BRSR ${f.id}`,
      termCode: f.id,
      description: f.plain ?? f.label,
      url: `https://saaksh.co/brsr/${f.code}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://saaksh.co" },
      { "@type": "ListItem", position: 2, name: "BRSR disclosures", item: "https://saaksh.co/brsr" },
    ],
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(listLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbLd) }} />
      <SiteHeader active="tools" />

      <section className="bg-forest glow-dark">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400 mb-4">BRSR reference</p>
          <h1 className="font-editorial font-semibold text-white text-[2.4rem] md:text-[3.1rem] leading-[1.06] tracking-[-0.02em] max-w-[20ch]">
            All 108 BRSR Section C disclosures
          </h1>
          <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[660px]">
            Every principle-wise performance disclosure in SEBI&apos;s BRSR format, with the regulator&apos;s own wording, the unit,
            the team that usually holds the data, and what a complete assurance-ready answer contains. Cited to the SEBI
            BRSR Format and the {ICAI_SOURCE}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/start" className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-forest text-[15px] font-semibold px-5 py-3 hover:bg-white/90 transition-colors">
              Gap-analyse a client, free
            </Link>
            <a href={SEBI_FORMAT_URL} target="_blank" rel="noopener noreferrer" className="pressable inline-flex items-center gap-2 rounded-xl border border-white/25 text-white text-[15px] font-medium px-5 py-3 hover:bg-white/10 transition-colors">
              The SEBI format (PDF)
            </a>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-14">

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat n="108" label="Section C disclosures across P1 to P9" />
            <Stat n={String(ESSENTIAL)} label="Essential indicators, mandatory for every filer" />
            <Stat n={String(LEADERSHIP)} label="Leadership indicators, voluntary" />
            <Stat n="42" label="BRSR Core KPIs requiring independent assurance" />
          </section>

          <section>
            <h2 className="font-editorial font-semibold text-ink text-[1.9rem] leading-tight tracking-[-0.015em]">
              How Section C is structured
            </h2>
            <p className="text-[15px] text-ink-body leading-relaxed mt-3 max-w-[680px]">
              BRSR has three sections. Section A covers general disclosures, Section B covers management and process, and
              Section C covers principle-wise performance against the nine National Guidelines on Responsible Business
              Conduct principles. Section C is where almost all of the data collection work sits: 68 Essential indicators
              that every filer must answer, and 40 Leadership indicators that apply to companies filing for three or more
              years, or in the top 1000. Eleven of the 108 assume manufacturing operations and can be marked not
              applicable, with justification, by a pure services business.
            </p>
          </section>

          {groups.map((g) => (
            <section key={g.principle} id={g.principle}>
              <div className="flex flex-wrap items-baseline gap-3 mb-1">
                <h2 className="font-editorial font-semibold text-ink text-[1.6rem] leading-tight tracking-[-0.015em]">
                  Principle {g.principle.slice(1)}, {g.name}
                </h2>
                <span className="text-[13px] text-ink-faint">{g.fields.length} disclosures</span>
                {PRINCIPLE_GUIDE[g.principle] && (
                  <Link href={PRINCIPLE_GUIDE[g.principle]} className="text-[13px] font-semibold text-brand-700 hover:underline">
                    Read the Principle {g.principle.slice(1)} guide →
                  </Link>
                )}
              </div>
              <p className="text-[14px] text-ink-muted leading-relaxed max-w-[720px] mb-5">{g.fullName}</p>

              <div className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden divide-y divide-line-soft">
                {g.fields.map((f) => (
                  <Link
                    key={f.id}
                    href={`/brsr/${f.code}`}
                    className="group flex items-start gap-4 px-5 py-3.5 hover:bg-band transition-colors"
                  >
                    <span className="mt-0.5 flex-shrink-0 w-[62px] text-[11.5px] font-bold tracking-[0.04em] text-brand-700">
                      {f.id}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14.5px] text-ink-body leading-snug group-hover:text-brand-700 transition-colors">
                        {f.plain ?? f.label}
                      </span>
                      <span className="block text-[12px] text-ink-faint mt-1">
                        {f.indicatorType}
                        {" · "}
                        {f.unit}
                        {f.manufacturingOnly && " · manufacturing only"}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-3xl border border-brand-200 bg-tint p-8 sm:p-10 text-center">
            <h2 className="font-editorial font-semibold text-ink text-[1.7rem] leading-tight tracking-[-0.015em]">
              Which of these does your client already have?
            </h2>
            <p className="text-[15px] text-ink-body leading-relaxed mt-2.5 max-w-[560px] mx-auto">
              Most of the answers already sit in filings the company makes elsewhere. Describe a client in six fields and
              the free tool classifies all 108 as ready to pull, needs verification, or collect fresh, with the emissions,
              energy and water calculators built in. Nothing leaves your browser.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="pressable inline-flex items-center gap-2 rounded-xl bg-forest text-white text-[15px] font-semibold px-5 py-3 hover:bg-forest-light transition-colors">
                Start a free report
              </Link>
              <Link href="/demo" className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-ink text-[15px] font-medium px-5 py-3 border border-line hover:bg-band transition-colors">
                See a sample
              </Link>
            </div>
          </section>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
