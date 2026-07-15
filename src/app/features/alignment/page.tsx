import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";

export const metadata: Metadata = {
  title: "Cross-framework mapping, BRSR to GRI, TCFD, IFRS, TNFD, ESRS | Saaksh",
  description:
    "Map your client's BRSR data across GRI, TCFD, IFRS S1/S2, TNFD, ESRS (CSRD) and the MSCI, DJSI, CDP and EcoVadis assessments, collect once, report to many frameworks. Free and on-device.",
};

const FRAMEWORKS = [
  { name: "GRI", full: "Global Reporting Initiative standards", tone: "#0B6FD4" },
  { name: "TCFD", full: "Climate-related financial disclosures", tone: "#7B6FE0" },
  { name: "IFRS S1 / S2", full: "ISSB sustainability & climate standards", tone: "#0E7A56" },
  { name: "TNFD", full: "Nature-related disclosures", tone: "#0E7A56" },
  { name: "ESRS", full: "EU CSRD reporting standards", tone: "#5B5BD6" },
  { name: "MSCI", full: "ESG rating key issues", tone: "#7B6FE0" },
  { name: "S&P / DJSI", full: "Corporate Sustainability Assessment", tone: "#C2871B" },
];

const SAMPLE = [
  ["P6-E1", "GHG emissions (Scope 1 & 2)", "GRI 305-1/2", "Metrics & Targets", "IFRS S2"],
  ["P3-E1", "Employee well-being & wages", "GRI 401/405", "—", "IFRS S1"],
  ["P6-L3", "Water discharge by quality", "GRI 303-4", "—", "TNFD"],
  ["P1-E1", "Anti-corruption & conduct", "GRI 205", "Governance", "IFRS S1"],
];

export default function AlignmentFeaturePage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="tools" />

      {/* Hero */}
      <section className="bg-forest glow-dark">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="bg-brand-600 text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full uppercase">Free</span>
            <span className="text-brand-500 text-sm font-mono">77 line-by-line mappings</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-5 leading-tight" style={{ textWrap: "balance" }}>
            Collect once, report to every framework
          </h1>
          <p className="text-lg text-white/70 max-w-[640px] leading-relaxed">
            Your client&apos;s BRSR answers already contain most of what GRI, TCFD, IFRS S1/S2, TNFD and the EU&apos;s ESRS ask for. Saaksh maps each BRSR disclosure to its equivalent across the major frameworks, so one data-collection effort feeds many reports.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-16">

          {/* Frameworks covered */}
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">Frameworks covered</h2>
            <p className="text-ink-muted text-[15px] mb-8 max-w-[600px] leading-relaxed">
              A line-by-line crosswalk over the BRSR format, plus a principle-level alignment to the two ESG ratings consultants are asked about most.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRAMEWORKS.map((f) => (
                <div key={f.name} className="rounded-2xl border border-line bg-surface p-5 shadow-elev-1">
                  <span className="font-display font-bold text-[1.05rem]" style={{ color: f.tone }}>{f.name}</span>
                  <p className="text-[13.5px] text-ink-muted mt-1.5 leading-relaxed">{f.full}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Sample crosswalk */}
          <section>
            <h2 className="font-display text-2xl text-ink mb-3">What a mapping looks like</h2>
            <p className="text-ink-muted text-[15px] mb-6 max-w-[600px] leading-relaxed">
              Each BRSR field carries its equivalent reference in every framework. A few examples:
            </p>
            <div className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-band border-b border-line">
                    {["BRSR", "Disclosure", "GRI", "TCFD", "IFRS"].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {SAMPLE.map((r) => (
                    <tr key={r[0]}>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-brand-700">{r[0]}</td>
                      <td className="px-4 py-3 text-[13.5px] text-ink">{r[1]}</td>
                      <td className="px-4 py-3 text-[13px] text-ink-muted">{r[2]}</td>
                      <td className="px-4 py-3 text-[13px] text-ink-muted">{r[3]}</td>
                      <td className="px-4 py-3 text-[13px] text-ink-muted">{r[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12.5px] text-ink-faint mt-3">Indicative crosswalk for orientation; confirm against each framework&apos;s current standard before filing.</p>
          </section>

          {/* Export */}
          <section className="rounded-2xl bg-tint border border-line p-8">
            <h2 className="font-display text-2xl text-ink mb-3">Export the whole crosswalk</h2>
            <p className="text-ink-muted text-[15px] max-w-[620px] leading-relaxed">
              In the readiness report&apos;s Alignment tab, download the full BRSR ↔ GRI ↔ TCFD ↔ IFRS ↔ TNFD ↔ ESRS mapping (and the MSCI, DJSI, CDP and EcoVadis ratings alignment) as a CSV, on-device, nothing uploaded. Hand it to a client who reports under more than one framework.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="font-display text-[1.8rem] text-ink mb-3">See the mapping for your client</h2>
            <p className="text-ink-muted text-[15px] mb-6 max-w-[480px] mx-auto leading-relaxed">
              Generate a free readiness report, then open the Alignment tab for the full crosswalk and export.
            </p>
            <Link href="/start" className="inline-flex items-center gap-2 bg-forest text-white text-[14.5px] font-semibold px-6 py-3 rounded-xl hover:bg-forest-light transition-colors pressable">
              Start a free report
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </section>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
