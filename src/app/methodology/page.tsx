import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GlowOrb, Contours } from "@/components/brand/Decor";

export const metadata: Metadata = {
  title: "How we calculate & cite, Saaksh",
  description: "Saaksh's methodology: every factor and disclosure is cited to a primary source, and we never fabricate figures.",
};

const TOC = [
  { id: "principle", label: "Nothing is invented" },
  { id: "provenance", label: "Per-factor provenance" },
  { id: "standards", label: "Standards we align to" },
  { id: "sebi-icai", label: "Cited to SEBI & ICAI" },
  { id: "assurance", label: "Built for the assurance era" },
  { id: "not-claim", label: "What we don't claim" },
];

const STANDARDS = [
  { name: "GHG Protocol", detail: "Corporate + Corporate Value Chain (Scope 3) Standards, the accounting method." },
  { name: "CEA", detail: "Central Electricity Authority CO₂ Baseline Database, the India grid factor." },
  { name: "IPCC 2006", detail: "Guidelines for stationary / mobile fuel combustion factors." },
  { name: "DEFRA / DESNZ", detail: "GHG Conversion Factors, for Scope 3 screening (travel, freight, waste)." },
  { name: "SEBI BRSR Format", detail: "The disclosure text and structure, cited per field." },
  { name: "ICAI Background Material", detail: "Revised 2024, with the page reference behind each disclosure." },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-editorial font-semibold text-ink text-[1.6rem] sm:text-[1.8rem] leading-tight tracking-[-0.015em] scroll-mt-24">
      {children}
    </h2>
  );
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <ScrollReveal />
      <SiteHeader active="methodology" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-forest glow-dark">
        <GlowOrb tone="brand" className="w-[520px] h-[520px] -top-48 left-1/3" />
        <Contours className="w-[420px] h-[420px] -right-20 -top-12 text-brand-400" stroke="#4D97F0" opacity={0.13} />
        <div className="relative mx-auto w-full max-w-[1120px] px-5 sm:px-8 pt-16 pb-16">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">Methodology &amp; sources</p>
          <h1 className="font-editorial font-semibold text-white mt-4 text-[2.4rem] sm:text-[3.1rem] leading-[1.06] tracking-[-0.02em] max-w-[16ch]" style={{ textWrap: "balance" }}>
            How we calculate, and cite every number.
          </h1>
          <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[620px]">
            The whole point of Saaksh is defensible, cited data. Here is exactly where every number and mapping comes
            from, and what we will never do.
          </p>
          <p className="text-[12.5px] text-ondark-faint mt-5 font-mono">Last updated: 29 June 2026</p>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16 grid lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Sticky TOC rail */}
          <aside className="lg:col-span-3">
            <nav className="lg:sticky lg:top-24">
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-3">On this page</p>
              <ul className="space-y-1">
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="block rounded-lg px-3 py-1.5 text-[13.5px] text-ink-muted hover:text-ink hover:bg-band transition-colors">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 space-y-10">
            <section className="rounded-2xl border border-line bg-white p-7 sm:p-8 shadow-elev-1" data-reveal>
              <H2 id="principle">The principle: nothing is invented</H2>
              <p className="text-[16px] text-ink-body leading-[1.75] mt-3">
                Saaksh never fabricates a figure. Every value in a report is either something you entered, or a
                calculation from your input using a cited factor. Where data is missing, we say so, we don&apos;t fill
                the gap with a guess. This is what makes the output survive assurance.
              </p>
            </section>

            <section className="rounded-2xl border border-line bg-white p-7 sm:p-8 shadow-elev-1" data-reveal>
              <H2 id="provenance">Per-factor provenance</H2>
              <p className="text-[16px] text-ink-body leading-[1.75] mt-3">
                Each emission factor we use carries its full provenance: the <strong className="text-ink">source</strong>,
                the exact <strong className="text-ink">table/row</strong>, the <strong className="text-ink">vintage</strong>
                {" "}(publication year), the <strong className="text-ink">unit</strong>, and a <strong className="text-ink">link</strong>
                {" "}to the authoritative document. You can trace any number we compute back to its origin.
              </p>
            </section>

            <section data-reveal>
              <H2 id="standards">Standards we align to</H2>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {STANDARDS.map((s) => (
                  <div key={s.name} className="card-lift rounded-xl border border-line bg-white p-4 shadow-elev-1">
                    <p className="text-[13px] font-mono font-semibold text-brand-700">{s.name}</p>
                    <p className="text-[13.5px] text-ink-body leading-relaxed mt-1.5">{s.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-7 sm:p-8 shadow-elev-1" data-reveal>
              <H2 id="sebi-icai">Cited to SEBI &amp; ICAI</H2>
              <p className="text-[16px] text-ink-body leading-[1.75] mt-3">
                Every BRSR disclosure in the tool is cited to the <strong className="text-ink">SEBI BRSR Format</strong> and
                the <strong className="text-ink">ICAI Background Material on BRSR (Revised 2024)</strong>, with the page
                reference. The cross-framework mappings (BRSR ↔ GRI ↔ TCFD ↔ IFRS S1/S2 ↔ TNFD) and the MSCI/DJSI rating
                crosswalks are likewise documented.
              </p>
            </section>

            <section className="rounded-2xl border border-brand-200 bg-tint p-7 sm:p-8 shadow-elev-1" data-reveal>
              <H2 id="assurance">Built for the assurance era</H2>
              <p className="text-[16px] text-ink-body leading-[1.75] mt-3">
                BRSR Core now carries reasonable assurance for the largest listed companies, and assurers increasingly
                ask not just &quot;is the number right?&quot; but &quot;show the trail behind it.&quot; Saaksh&apos;s
                Collect tier captures, per figure, the named data owner, the supporting evidence document, and the cited
                calculation basis, an exportable data-ownership ledger aligned to what ISAE 3000 / ICAI SSAE 3000
                assurers look for.
              </p>
            </section>

            <section className="rounded-2xl border border-line bg-white p-7 sm:p-8 shadow-elev-1" data-reveal>
              <H2 id="not-claim">What we don&apos;t claim</H2>
              <p className="text-[16px] text-ink-body leading-[1.75] mt-3">
                We don&apos;t claim an independent third-party audit of our calculation engine (yet), and we don&apos;t
                present our materiality shortlist as a finished assessment, it&apos;s a starting point for your
                stakeholder process. We&apos;d rather under-claim and be trusted than over-claim.
              </p>
            </section>
          </div>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
