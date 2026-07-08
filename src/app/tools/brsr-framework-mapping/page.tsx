"use client";

import Link from "next/link";
import { ToolHero } from "@/components/tools/ToolHero";
import { BlogFooter } from "@/components/blog/BlogFooter";
import FrameworkMapper from "@/components/FrameworkMapper";
import { generateFrameworkMappings } from "@/lib/report-generator";
import { buildFrameworkExportRows } from "@/lib/framework-export";
import { downloadCsv, exportFilename } from "@/lib/export";
import { downloadTableDocx } from "@/lib/report-docx";
import { jsonLdHtml } from "@/lib/jsonld";

// The same merged crosswalk the report's Alignment tab uses, as a standalone,
// no-signup public tool. Static data (same for every company).
const MAPPINGS = generateFrameworkMappings();

const FAQS = [
  {
    q: "Does BRSR map to GRI?",
    a: "Yes. Most BRSR disclosures have a close GRI counterpart, because both frameworks ask for the same underlying sustainability data. This crosswalk shows the GRI standard that lines up with each BRSR disclosure.",
  },
  {
    q: "Is BRSR aligned with IFRS S1 and S2 (ISSB)?",
    a: "Partly. BRSR's governance, risk-management and climate disclosures map to IFRS S1/S2, and the two share the Scope 1 & 2 emissions data. IFRS S2 goes deeper on climate (scenario analysis, transition plans) than BRSR requires. The crosswalk shows the IFRS reference for each BRSR field.",
  },
  {
    q: "Is this an official SEBI crosswalk?",
    a: "No. It is an indicative, consultant-facing mapping to orient the work, not a certified equivalence. Standards evolve, so confirm the exact clause against each framework's current version before relying on it for a filing.",
  },
  {
    q: "Can I export the crosswalk?",
    a: "Yes. Download the whole mapping as a CSV or an editable Word document, on your device, nothing is uploaded.",
  },
];

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function FrameworkMappingToolPage() {
  const exportCsv = () => downloadCsv(exportFilename("brsr-framework-mapping"), buildFrameworkExportRows(MAPPINGS));
  const exportDocx = () =>
    void downloadTableDocx({
      filename: exportFilename("brsr-framework-mapping").replace(/\.csv$/, ""),
      title: "BRSR cross-framework mapping",
      subtitle: "BRSR to GRI, TCFD, IFRS S1/S2 and TNFD. Collect once, report across frameworks.",
      rows: buildFrameworkExportRows(MAPPINGS),
      footnote: "An indicative crosswalk, confirm the exact clause against each framework's current standard before filing.",
    });

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(FAQ_LD) }} />
      <main className="flex-1">
        <ToolHero
          active="tools"
          eyebrow="Free tool · on-device"
          title="BRSR to GRI, TCFD, IFRS & TNFD, one crosswalk"
          subtitle="Search the mapping between every BRSR disclosure and its GRI, TCFD, IFRS S1/S2 and TNFD counterpart. Cited, exportable, and free, so one round of BRSR data can feed your other reports."
          benefits={[
            "Every BRSR disclosure mapped to GRI, TCFD, IFRS & TNFD",
            "Search and filter by framework or TCFD pillar",
            "Export the whole crosswalk to CSV or Word",
          ]}
          maxWidth={1120}
        />

        <div className="anim-up-sm mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-12">
          {/* Export actions */}
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={exportCsv}
              className="pressable inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
              Download CSV
            </button>
            <button
              onClick={exportDocx}
              className="pressable inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-body bg-white border border-line hover:border-brand-300 hover:bg-band px-3 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6M9 16h6M9 8h2M5 3h9l5 5v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
              Download Word
            </button>
          </div>

          <FrameworkMapper mappings={MAPPINGS} />

          {/* Internal links to the comparison guides + CTA */}
          <div className="mt-10 rounded-2xl border border-brand-200 bg-tint p-6 sm:p-8">
            <h2 className="font-editorial font-semibold text-ink text-[1.5rem] leading-tight tracking-[-0.015em]">Go deeper</h2>
            <p className="text-[14.5px] text-ink-body leading-relaxed mt-2 max-w-[620px]">
              Read the side-by-side comparisons, or run a full gap-analysed BRSR report that maps every one of your client&apos;s 108 fields to these frameworks automatically.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/blog/brsr-vs-gri" className="pressable inline-flex items-center gap-1.5 rounded-lg bg-white text-ink text-[14px] font-medium px-4 py-2 border border-line hover:bg-band transition-colors">BRSR vs GRI</Link>
              <Link href="/blog/brsr-vs-ifrs-issb" className="pressable inline-flex items-center gap-1.5 rounded-lg bg-white text-ink text-[14px] font-medium px-4 py-2 border border-line hover:bg-band transition-colors">BRSR vs IFRS S1/S2</Link>
              <Link href="/start" className="pressable inline-flex items-center gap-1.5 rounded-lg bg-forest text-white text-[14px] font-semibold px-4 py-2 hover:bg-forest-light transition-colors">
                Start a free report
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/demo" className="pressable inline-flex items-center gap-1.5 rounded-lg bg-white text-ink text-[14px] font-medium px-4 py-2 border border-line hover:bg-band transition-colors">See a sample</Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="bg-band border-t border-line-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em] mb-6">Frequently asked questions</h2>
            <div className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden max-w-[820px]">
              {FAQS.map((f, i) => (
                <details key={i} className={i > 0 ? "border-t border-line-soft" : ""}>
                  <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 text-[15px] font-semibold text-ink list-none">
                    {f.q}
                    <svg className="w-4 h-4 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </summary>
                  <p className="px-5 pb-4 text-[14px] text-ink-body leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <BlogFooter />
    </div>
  );
}
