"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import Scope3Calculator from "@/components/checklist/Scope3Calculator";
import { DEFAULT_SCOPE3_INPUTS, type Scope3Inputs } from "@/lib/scope3-calculator";
import factors from "@/data/scope3_factors.json";

const COVERED = [
  { code: "Cat 6", title: "Business travel", body: "Flights, rail and road for work trips. Air factors include radiative forcing, the full climate impact of emissions at altitude." },
  { code: "Cat 7", title: "Employee commuting", body: "Staff travel to work by car, two-wheeler, bus or rail. Reuses DEFRA's land-travel factors, the standard practice." },
  { code: "Cat 4 / 9", title: "Transport & distribution", body: "Inbound and outbound freight by road, rail, sea or air, on a tonne-km basis (direct + well-to-tank)." },
  { code: "Cat 5", title: "Waste in operations", body: "Waste sent to landfill, recycling, combustion or composting, on a per-tonne basis." },
];

const APPROACHES = [
  { title: "Activity-based, what this tool does", body: "Multiply a physical quantity, passenger-km flown, tonnes freighted, tonnes to landfill, by a published per-unit factor. More accurate, and every number traces back to a DEFRA line." },
  { title: "Supplier data, for Category 1", body: "For purchased goods, no authoritative India spend-per-rupee factor exists, so instead of guessing we let you enter your suppliers' own reported emissions directly. Real primary data, added to the total unchanged." },
];

const FACTOR_GROUPS = [factors.business_travel, factors.commuting, factors.freight, factors.waste];

// Upstream -> operations -> downstream value-chain ribbon.
function ValueChainRibbon() {
  return (
    <svg viewBox="0 0 280 132" className="w-full" role="img" aria-label="Value chain: upstream, operations, downstream">
      <rect x="6" y="34" width="74" height="44" rx="10" fill="#EAF4FE" stroke="#CDE2F6" strokeWidth="1.2" />
      <text x="43" y="52" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#0B5FB0">Upstream</text>
      <text x="43" y="66" textAnchor="middle" fontFamily="var(--font-hanken), sans-serif" fontSize="8" fill="#5B6573">Cat 4</text>
      <line x1="82" y1="56" x2="100" y2="56" stroke="#94A3B8" strokeWidth="1.8" markerEnd="url(#s3ar)" />
      <rect x="103" y="28" width="74" height="56" rx="10" fill="#0F1E33" />
      <text x="140" y="50" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#fff">Operations</text>
      <text x="140" y="66" textAnchor="middle" fontFamily="var(--font-hanken), sans-serif" fontSize="8" fill="#9DB2CE">Cat 5 · 6 · 7</text>
      <line x1="179" y1="56" x2="197" y2="56" stroke="#94A3B8" strokeWidth="1.8" markerEnd="url(#s3ar)" />
      <rect x="200" y="34" width="74" height="44" rx="10" fill="#FDEDE9" stroke="#F8C9BD" strokeWidth="1.2" />
      <text x="237" y="52" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#C24428">Downstream</text>
      <text x="237" y="66" textAnchor="middle" fontFamily="var(--font-hanken), sans-serif" fontSize="8" fill="#5B6573">Cat 9</text>
      <text x="140" y="108" textAnchor="middle" fontSize="10" fill="#5B6573">Screened here: Cat 4, 5, 6, 7 & 9</text>
      <text x="140" y="122" textAnchor="middle" fontSize="9.5" fill="#8A938D">Cat 1 (purchased goods): enter supplier-reported data</text>
      <defs>
        <marker id="s3ar" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0 0l6 3-6 3z" fill="#94A3B8" />
        </marker>
      </defs>
    </svg>
  );
}

export default function Scope3CalculatorPage() {
  const [inputs, setInputs] = useState<Scope3Inputs>(DEFAULT_SCOPE3_INPUTS);
  const [turnover, setTurnover] = useState("");
  const onChange = (key: string, value: string) => setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          active="tools"
          eyebrow="Free tool · on-device"
          title="Scope 3 screening calculator"
          subtitle="An activity-based Scope 3 estimate across business travel, commuting, freight and waste, plus a place to record supplier-reported purchased goods. GHG Protocol Scope 3 Standard, DEFRA/DESNZ 2024 factors cited per line. Runs entirely in your browser."
          benefits={[
            "Categories 4, 5, 6, 7 & 9 from physical activity data",
            "Category 1 from real supplier-reported figures, no invented factor",
            "Every factor traced to a DEFRA 2024 line",
          ]}
          maxWidth={1120}
        />

        {/* Calculator + explainer rail */}
        <div className="anim-up-sm mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-12">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
            <div>
              <div className="mb-6 rounded-xl border border-[#CDE2F6] bg-[#EAF4FE] p-4 max-w-[360px]">
                <label className="block text-[11px] font-semibold text-brand-700 uppercase tracking-[0.08em] mb-1.5">
                  Annual turnover <span className="text-ink-faint normal-case tracking-normal font-normal">, optional, for intensity</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number" min="0" step="any" value={turnover} placeholder="0"
                    onChange={(e) => setTurnover(e.target.value)}
                    className="flex-1 min-w-0 h-10 px-3 text-[14px] font-mono border border-[#CDE2F6] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-[border-color,box-shadow] placeholder:text-ink-faint"
                  />
                  <span className="text-[11.5px] text-ink-muted font-mono whitespace-nowrap">₹ crore</span>
                </div>
              </div>

              <Scope3Calculator inputs={inputs} turnoverCrore={turnover} onChange={onChange} />

              <p className="text-[12.5px] text-ink-muted leading-relaxed mt-6">
                A screening estimate. Scope 3 is a voluntary BRSR Leadership indicator, not assurance-grade. For the assured Scope 1 & 2, see the{" "}
                <Link href="/tools/ghg-calculator" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">GHG calculator</Link>, or run the full{" "}
                <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">readiness report</Link>.
              </p>
            </div>

            <aside className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-elev-1">
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-700 mb-3">Across the value chain</p>
                <ValueChainRibbon />
              </div>
              <div className="rounded-2xl border border-line bg-white p-5 shadow-elev-1">
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-700 mb-2.5">Sample factors</p>
                <ul className="space-y-1.5 text-[12.5px]">
                  <li className="flex items-baseline justify-between gap-3"><span className="text-ink-body">Air, long-haul</span><span className="font-mono text-ink whitespace-nowrap">0.261/pkm</span></li>
                  <li className="flex items-baseline justify-between gap-3"><span className="text-ink-body">Rail (national)</span><span className="font-mono text-ink whitespace-nowrap">0.035/pkm</span></li>
                  <li className="flex items-baseline justify-between gap-3"><span className="text-ink-body">Road freight (HGV)</span><span className="font-mono text-ink whitespace-nowrap">0.121/t·km</span></li>
                  <li className="flex items-baseline justify-between gap-3"><span className="text-ink-body">To landfill (mixed)</span><span className="font-mono text-ink whitespace-nowrap">520.3/t</span></li>
                </ul>
                <p className="text-[11px] text-ink-faint mt-3 leading-snug">DEFRA/DESNZ 2024 v1.1 · kgCO₂e. Air includes radiative forcing; freight is direct + well-to-tank.</p>
              </div>
            </aside>
          </div>
        </div>

        {/* Categories */}
        <section className="bg-band border-y border-line-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">The 15 categories, and which this screens</h2>
            <p className="text-[15.5px] text-ink-body leading-relaxed mt-3 max-w-[720px]">
              The GHG Protocol splits Scope 3 into 15 categories. This tool covers the ones you can compute from physical activity data, the four most consultants can actually get numbers for.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {COVERED.map((c) => (
                <div key={c.code} className="rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <span className="font-mono text-[10.5px] font-semibold text-brand-700 bg-brand-50 border border-[#CDE2F6] rounded-full px-2 py-0.5">{c.code}</span>
                  <h3 className="text-[15.5px] font-semibold text-ink mt-3">{c.title}</h3>
                  <p className="text-[13.5px] text-ink-body leading-relaxed mt-2">{c.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-elev-1">
              <svg className="w-5 h-5 text-ink-faint shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></svg>
              <p className="text-[13.5px] text-ink-body leading-relaxed">
                <span className="font-semibold text-ink">Category 1, purchased goods &amp; services, is not estimated with a factor.</span> No authoritative India spend-per-rupee factor set exists, so rather than guess, the calculator lets you enter your suppliers&apos; own reported emissions directly, real primary data, added to the total unchanged.
              </p>
            </div>
          </div>
        </section>

        {/* Activity vs spend */}
        <section>
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">Activity-based vs spend-based</h2>
            <p className="text-[15.5px] text-ink-body leading-relaxed mt-3 max-w-[720px]">
              There are two ways to screen a Scope 3 category. This tool uses the more accurate one and stays honest where the data isn&apos;t there.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-8">
              {APPROACHES.map((a) => (
                <div key={a.title} className="rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <h3 className="text-[16px] font-semibold text-ink">{a.title}</h3>
                  <p className="text-[14px] text-ink-body leading-relaxed mt-2">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Factor reference */}
        <section className="bg-band border-y border-line-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">The factors, and where they come from</h2>
            <p className="text-[15.5px] text-ink-body leading-relaxed mt-3 max-w-[720px]">
              Every factor is a published DEFRA/DESNZ 2024 line, not an estimate. Air travel and air freight include radiative forcing; freight is direct plus well-to-tank.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-8">
              {FACTOR_GROUPS.map((g) => (
                <div key={g.category} className="rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-brand-700">{g.category}</p>
                  <ul className="mt-3 divide-y divide-line-soft">
                    {g.factors.map((f) => (
                      <li key={f.id} className="flex items-baseline justify-between gap-3 py-2">
                        <span className="text-[13.5px] text-ink-body">{f.label}</span>
                        <span className="font-mono text-[12.5px] text-ink whitespace-nowrap">{f.display.replace(" kgCO₂e", "").replace(/\/pkm.*/, "/pkm").replace(/\/t·km.*/, "/t·km")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-ink-muted leading-relaxed mt-4">
              Source: {factors._meta.factor_source} Refresh against the latest DEFRA/DESNZ set each filing year.
            </p>
          </div>
        </section>

        {/* What BRSR expects */}
        <section>
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">What BRSR expects of Scope 3</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { title: "Voluntary, for now", body: "Scope 3 sits in Principle 6 as a Leadership indicator. It is not mandatory, and not under reasonable assurance in 2026." },
                { title: "Scope 1 & 2 come first", body: "Those are the assured, mandatory figures. Get them right with the GHG calculator before you screen Scope 3." },
                { title: "A screening is enough", body: "A cited, activity-based estimate is a credible starting point. A certified GHG auditor should sign off final disclosures." },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <h3 className="text-[15.5px] font-semibold text-ink">{c.title}</h3>
                  <p className="text-[14px] text-ink-body leading-relaxed mt-2">{c.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/start" className="group cta-glow inline-flex items-center gap-2 rounded-xl bg-forest text-white text-[15px] font-semibold px-5 py-3 hover:bg-forest-light">
                Gap-analyse a client&apos;s full BRSR
                <svg className="arrow-nudge w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <BlogFooter />
    </div>
  );
}
