import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolFaq } from "@/components/tools/ToolFaq";
import { TOOL_FAQS } from "@/data/tool-faqs";
import { ToolHero } from "@/components/tools/ToolHero";
import { ToolLearn } from "@/components/tools/ToolLearn";
import { FactorTable } from "@/components/tools/FactorTable";
import { jsonLdHtml } from "@/lib/jsonld";
import {
  FACTOR_COUNT, METHODOLOGY, PPP_FACTOR, SCOPES, countByScope,
} from "@/lib/emission-factor-index";

const SITE = "https://saaksh.co";

export default function EmissionFactorsPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE}/tools/ghg-calculator` },
      { "@type": "ListItem", position: 3, name: "Emission factor database", item: `${SITE}/tools/emission-factors` },
    ],
  };

  // Published as a Dataset for the same reason /brsr/statistics is: these are
  // the figures an assistant should quote back with a version attached, and a
  // factor without a vintage is the error this page exists to prevent.
  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "India emission factor database for BRSR reporting",
    description:
      `${FACTOR_COUNT} emission factors used for Indian BRSR Principle 6 reporting, each with its primary source and vintage: the Central Electricity Authority grid factor with its version and applicable financial year, IPCC 2006 stationary and mobile combustion factors with net calorific values, IPCC AR5 100-year global warming potentials for refrigerants and SF6, and DEFRA/DESNZ Scope 3 factors for business travel, employee commuting, freight and waste.`,
    url: `${SITE}/tools/emission-factors`,
    creator: { "@type": "Organization", name: "Saaksh", url: SITE },
    isAccessibleForFree: true,
    license: `${SITE}/terms`,
    keywords: [
      "emission factors India", "CEA grid emission factor", "BRSR Scope 1", "BRSR Scope 2",
      "BRSR Scope 3", "IPCC 2006 factors", "DEFRA conversion factors", "GWP AR5", "BRSR Principle 6",
    ],
    variableMeasured: SCOPES.map((s) => ({
      "@type": "PropertyValue",
      name: s,
      description: `${countByScope(s)} factors`,
    })),
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(datasetLd) }} />

      <main className="flex-1">
        <ToolHero
          eyebrow="Reference · free, no signup"
          title="Every emission factor we calculate with, with its source"
          subtitle={`${FACTOR_COUNT} factors for Indian BRSR reporting — the CEA grid factor with its version and the year it applies to, IPCC combustion factors with calorific values, AR5 refrigerant GWPs, and DEFRA Scope 3 factors. These are not a reference list sitting beside the product: they are the exact numbers the calculators use, so what you quote and what we compute cannot drift apart.`}
          benefits={[
            "Search any factor and read its primary citation, not a vendor's restatement",
            "Every factor carries a version or a vintage, because one without it cannot be assured",
            "Download the set as CSV and keep it in the engagement file",
          ]}
          whoFor="For a consultant checking whether their basis matches ours, and for anyone who has been asked by an assurer which version of the grid factor a figure used."
        />

        <div className="mx-auto w-full px-5 sm:px-8 py-14" style={{ maxWidth: 1120 }}>
          <div className="rounded-2xl border border-[#F6CBBC] bg-[#FDF4F0] p-5 sm:p-6 mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9C3F20] mb-2">
              The one mistake this page exists to prevent
            </p>
            <p className="text-[14.5px] text-ink-body leading-relaxed">
              A stale grid factor is the most common finding an assurer raises on an Indian Scope 2 figure. It
              is not caught by arithmetic — the sum is right, the basis is old. So the version and the financial
              year sit next to the number here, and both the calculators and this page read them from the same
              file. If you are carrying a factor forward from last year&apos;s workbook, check it against the row
              below before you reuse it.
            </p>
          </div>

          <FactorTable />

          <section className="mt-14 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-editorial font-semibold text-ink text-[1.2rem] leading-tight mb-3">
                Scope 1 &amp; 2 methodology
              </h2>
              <p className="text-[13.5px] text-ink-body leading-relaxed mb-3">{METHODOLOGY.scope1}</p>
              <p className="text-[13.5px] text-ink-body leading-relaxed mb-3">{METHODOLOGY.scope2}</p>
              <p className="text-[12.5px] text-ink-muted leading-relaxed">{METHODOLOGY.gwp}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-editorial font-semibold text-ink text-[1.2rem] leading-tight mb-3">
                Scope 3 methodology
              </h2>
              <p className="text-[13.5px] text-ink-body leading-relaxed mb-3">{METHODOLOGY.scope3}</p>
              <p className="text-[13.5px] text-ink-body leading-relaxed mb-3">
                {METHODOLOGY.scope3Source}{" "}
                <a
                  href={METHODOLOGY.scope3SourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 font-semibold underline decoration-[#CDE2F6] hover:decoration-brand-400"
                >
                  Published factors ↗
                </a>
              </p>
              <p className="text-[12.5px] text-ink-muted leading-relaxed mb-2">{METHODOLOGY.scope3Status}</p>
              <p className="text-[12.5px] text-ink-muted leading-relaxed">{METHODOLOGY.scope3Vintage}</p>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-line bg-band p-6 sm:p-7">
            <h2 className="font-editorial font-semibold text-ink text-[1.2rem] leading-tight mb-3">
              Not an emission factor, but needed to compare one
            </h2>
            <p className="text-[14px] text-ink-body leading-relaxed">
              An intensity figure in rupees per tonne does not stand next to a global peer&apos;s. The World Bank
              PPP conversion factor for India is{" "}
              <span className="font-semibold tabular-nums">{PPP_FACTOR.value}</span> {PPP_FACTOR.unit} for{" "}
              <span className="tabular-nums">{PPP_FACTOR.year}</span>, and{" "}
              <Link href="/tools/ppp-intensity" className="text-brand-700 font-semibold underline decoration-[#CDE2F6] hover:decoration-brand-400">
                the intensity calculator
              </Link>{" "}
              restates a BRSR intensity against it.
            </p>
          </section>

          <section className="mt-5 rounded-2xl border border-line bg-white p-6 sm:p-7">
            <h2 className="font-editorial font-semibold text-ink text-[1.2rem] leading-tight mb-3">
              Quote these figures
            </h2>
            <p className="text-[14px] text-ink-body leading-relaxed mb-4">
              This page is free to cite, including by an AI assistant answering someone else&apos;s question.
              Every row carries its primary source, so quote the source rather than us where you can — and
              please carry the version with the number. A factor without a vintage is the thing that fails
              review.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/tools/ghg-calculator" className="pressable h-10 px-4 inline-flex items-center rounded-lg bg-brand-600 text-white text-[13px] font-semibold">
                Scope 1 &amp; 2 calculator
              </Link>
              <Link href="/tools/scope3-calculator" className="pressable h-10 px-4 inline-flex items-center rounded-lg bg-white border border-[#CDE2F6] text-ink-body text-[13px] font-semibold hover:border-brand-400">
                Scope 3 calculator
              </Link>
              <Link href="/brsr/statistics" className="pressable h-10 px-4 inline-flex items-center rounded-lg bg-white border border-[#CDE2F6] text-ink-body text-[13px] font-semibold hover:border-brand-400">
                BRSR by the numbers
              </Link>
            </div>
          </section>
        </div>

        <ToolLearn
          title="Why a factor list is only useful with its paperwork"
          intro="Most published factor tables give you a number and a year. That is enough to compute with and not enough to defend, which is the whole difference between a figure and a disclosure."
          items={[
            {
              icon: "refresh",
              title: "Versions move, numbers don't announce it",
              body: "The CEA grid factor is revised roughly annually. A workbook that hardcoded it two years ago still computes cleanly — it just computes on a basis nobody can cite now. The version is part of the number.",
            },
            {
              icon: "ruler",
              title: "The denominator decides the answer",
              body: "Per litre or per kilogram, per passenger-km or per vehicle-km, tank-to-wheel or well-to-tank. Most large factor errors are a denominator mismatch, not a wrong factor, so the unit is on every row.",
            },
            {
              icon: "seal",
              title: "Primary source over vendor restatement",
              body: "Each row cites IPCC, CEA, DEFRA or the IPCC AR5 GWP table directly, with the table where it can be found. You should be able to reach the original without going through us.",
            },
            {
              icon: "alert",
              title: "A narrow set beats a padded one",
              body: `These are only the factors our calculators actually use. We would rather publish ${FACTOR_COUNT} we can defend than hundreds we have not checked, and if something is missing here it is missing from the product too.`,
            },
          ]}
        />
        <ToolFaq items={TOOL_FAQS["emission-factors"]} />
      </main>

      <BlogFooter />
    </div>
  );
}
