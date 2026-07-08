"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import EmissionsCalculator from "@/components/checklist/EmissionsCalculator";
import { DEFAULT_CALC_INPUTS, type CalcInputs } from "@/lib/emissions-calculator";
import factors from "@/data/emission_factors.json";

const MODES = [
  { id: "ghg" as const, label: "Scope 1 & 2 GHG", hint: "Direct + purchased electricity, tCO₂e" },
  { id: "energy" as const, label: "Energy", hint: "Total consumption + intensity, GJ" },
  { id: "water" as const, label: "Water", hint: "Withdrawal + intensity, kL" },
];

const SCOPES = [
  { tag: "Scope 1", color: "#F2674A", bg: "bg-ember-bg border-[#F8C9BD]", title: "Direct emissions", body: "Fuel you burn on-site or in owned vehicles: diesel gensets, boilers, furnace oil, company cars. You control the source, so you own the emission." },
  { tag: "Scope 2", color: "#1E9DF2", bg: "bg-brand-50 border-[#CDE2F6]", title: "Purchased energy", body: "The grid electricity (and purchased heat or steam) you buy. BRSR uses the location-based grid-average factor; a market-based figure needs contractual instruments." },
  { tag: "Scope 3", color: "#8A938D", bg: "bg-band border-line", title: "Value chain", body: "Everything else: suppliers, business travel, commuting, logistics, product use, end-of-life. 15 categories, voluntary under BRSR (a P6 Leadership indicator). Screen it with the Scope 3 tool." },
];

const MISTAKES = [
  "Counting renewables twice. A rooftop-solar unit consumed on-site is zero Scope 2, but don't also subtract it from your grid-purchase figure.",
  "Mixing units. The grid factor is per kWh; fuels are per litre, kg or m³. Convert to the factor's unit before you multiply.",
  "Forgetting process emissions. The calculator now covers refrigerant leakage, but cement calcination, welding gases and other process CO₂ are still Scope 1, add them separately.",
  "Using a stale grid factor. CEA republishes it every year; a two-year-old factor mis-states every Scope 2 number you file.",
];

// Scope 1/2/3 boundary diagram — on-brand inline SVG.
function ScopeDiagram() {
  return (
    <svg viewBox="0 0 280 190" className="w-full" role="img" aria-label="Scope 1, 2 and 3 emission boundaries">
      {/* Scope 3 outer boundary */}
      <rect x="5" y="5" width="270" height="180" rx="16" fill="none" stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="18" y="24" fontFamily="var(--font-hanken), sans-serif" fontSize="10" fill="#64748B">SCOPE 3 · value chain</text>
      {/* Operations box */}
      <rect x="86" y="66" width="108" height="70" rx="12" fill="#EAF4FE" stroke="#0F1E33" strokeWidth="1.4" />
      <text x="140" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0F1E33">Your operations</text>
      {/* Scope 2: grid -> operations */}
      <rect x="18" y="86" width="34" height="30" rx="7" fill="#1E9DF2" />
      <path d="M37 92l-6 10h5l-4 8 9-12h-5z" fill="#fff" />
      <line x1="52" y1="101" x2="82" y2="101" stroke="#1E9DF2" strokeWidth="2" markerEnd="url(#ar)" />
      <text x="35" y="132" textAnchor="middle" fontFamily="var(--font-hanken), sans-serif" fontSize="8.5" fill="#0B5FB0">S2 · grid</text>
      {/* Scope 1: fuel flame on operations */}
      <circle cx="140" cy="66" r="13" fill="#F2674A" />
      <path d="M140 59c3 3 4 6 2 9a3.2 3.2 0 01-6-0.4c0-2 1.5-3 1.5-5 1.5 1 2.5 1 2.5-3.6z" fill="#fff" />
      <text x="140" y="156" textAnchor="middle" fontFamily="var(--font-hanken), sans-serif" fontSize="8.5" fill="#C24428">S1 · on-site fuel</text>
      <defs>
        <marker id="ar" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0 0l6 3-6 3z" fill="#1E9DF2" />
        </marker>
      </defs>
    </svg>
  );
}

export default function GhgCalculatorPage() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_CALC_INPUTS);
  const [mode, setMode] = useState<"ghg" | "energy" | "water">("ghg");
  const onChange = (key: keyof CalcInputs, value: string) => setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          active="tools"
          eyebrow="Free tool · on-device"
          title="GHG, energy & water calculator"
          subtitle="Scope 1 & 2 emissions, total energy and water withdrawal, straight from activity data. CEA grid factor v21.0, IPCC 2006 fuel factors, every figure cited. Nothing leaves your browser."
          benefits={[
            "Scope 1 & 2 in tCO₂e, plus intensity per ₹ crore",
            "Every factor cited to CEA / IPCC with its vintage",
            "Energy (GJ) and water (kL) in the same place",
          ]}
          maxWidth={1120}
        />

        {/* Calculator + explainer rail */}
        <div className="anim-up-sm mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-12">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {MODES.map((m) => (
                  <button key={m.id} onClick={() => setMode(m.id)}
                    className={`text-left px-3.5 py-2 rounded-xl border transition-colors ${mode === m.id ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-muted border-line hover:border-brand-300"}`}>
                    <span className="block text-[13.5px] font-semibold">{m.label}</span>
                    <span className={`block text-[11px] ${mode === m.id ? "text-white/80" : "text-ink-faint"}`}>{m.hint}</span>
                  </button>
                ))}
              </div>
              <EmissionsCalculator mode={mode} inputs={inputs} onChange={onChange} />
              <p className="text-[12.5px] text-ink-muted leading-relaxed mt-6">
                A screening calculation from the figures you enter. For all 108 BRSR fields gap-analysed for your client, run the{" "}
                <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">free readiness report</Link>.
              </p>
            </div>

            <aside className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-elev-1">
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-700 mb-3">The three scopes</p>
                <ScopeDiagram />
                <p className="text-[11.5px] text-ink-muted leading-snug mt-2">This tool computes Scope 1 & 2. Scope 3 has its own screening tool.</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5 shadow-elev-1">
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-700 mb-2.5">Factors in play</p>
                <ul className="space-y-1.5 text-[12.5px]">
                  <li className="flex items-baseline justify-between gap-3"><span className="text-ink-body">Grid electricity</span><span className="font-mono text-ink whitespace-nowrap">{factors.scope2_grid.factor_display}</span></li>
                  {factors.scope1_fuels.slice(0, 4).map((f) => (
                    <li key={f.id} className="flex items-baseline justify-between gap-3"><span className="text-ink-body">{f.label}</span><span className="font-mono text-ink whitespace-nowrap">{f.co2e_display}</span></li>
                  ))}
                </ul>
                <p className="text-[11px] text-ink-faint mt-3 leading-snug">{factors.scope2_grid.source_short} · IPCC 2006 Vol. 2. Re-check the grid factor each filing year.</p>
              </div>
            </aside>
          </div>
        </div>

        {/* What the scopes mean */}
        <section className="bg-band border-y border-line-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">What Scope 1, 2 and 3 mean</h2>
            <p className="text-[15.5px] text-ink-body leading-relaxed mt-3 max-w-[720px]">
              The GHG Protocol splits a company&apos;s emissions into three scopes by where they occur. This tool computes the two that BRSR Core assures, Scope 1 and Scope 2; Scope 3 is a separate screening.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {SCOPES.map((s) => (
                <div key={s.tag} className="rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.bg}`} style={{ color: s.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.tag}
                  </span>
                  <h3 className="text-[16px] font-semibold text-ink mt-3.5">{s.title}</h3>
                  <p className="text-[14px] text-ink-body leading-relaxed mt-2">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How each factor is derived */}
        <section>
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">How each factor is derived</h2>
            <p className="text-[15.5px] text-ink-body leading-relaxed mt-3 max-w-[720px]">
              Every number here is a published factor, not an estimate. Scope 2 uses the CEA national grid factor; each fuel&apos;s factor is its IPCC carbon content times its calorific value; each refrigerant uses its IPCC AR5 100-year global warming potential. Here is the full trail.
            </p>
            <div className="mt-8 rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="bg-band text-ink-muted font-mono text-[11px] uppercase tracking-wide">
                      <th className="font-medium px-5 py-3">Fuel</th>
                      <th className="font-medium px-5 py-3 whitespace-nowrap">Emission factor</th>
                      <th className="font-medium px-5 py-3 whitespace-nowrap">Calorific value</th>
                      <th className="font-medium px-5 py-3">Derivation &amp; source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-line-soft align-top">
                      <td className="px-5 py-3.5 text-[14px] font-medium text-ink">Grid electricity</td>
                      <td className="px-5 py-3.5 font-mono text-[13px] text-ink-body whitespace-nowrap">{factors.scope2_grid.factor_display}</td>
                      <td className="px-5 py-3.5 text-[13px] text-ink-faint">—</td>
                      <td className="px-5 py-3.5 text-[12.5px] text-ink-body leading-relaxed">CEA CO₂ Baseline Database, {factors.scope2_grid.source_short} (location-based national grid average).</td>
                    </tr>
                    {factors.scope1_fuels.map((f) => (
                      <tr key={f.id} className="border-t border-line-soft align-top">
                        <td className="px-5 py-3.5 text-[14px] font-medium text-ink">{f.label}</td>
                        <td className="px-5 py-3.5 font-mono text-[13px] text-ink-body whitespace-nowrap">{f.co2e_display}</td>
                        <td className="px-5 py-3.5 font-mono text-[13px] text-ink-body whitespace-nowrap">{f.ncv_display}</td>
                        <td className="px-5 py-3.5 text-[12.5px] text-ink-body leading-relaxed">{f.source}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-line align-top">
                      <td colSpan={4} className="px-5 pt-4 pb-1 font-mono text-[11px] uppercase tracking-wide text-ink-muted">Fugitive emissions (refrigerant leakage) — Scope 1</td>
                    </tr>
                    {factors.scope1_fugitive.map((f) => (
                      <tr key={f.id} className="border-t border-line-soft align-top">
                        <td className="px-5 py-3.5 text-[14px] font-medium text-ink">{f.label}</td>
                        <td className="px-5 py-3.5 font-mono text-[13px] text-ink-body whitespace-nowrap">{f.co2e_display}</td>
                        <td className="px-5 py-3.5 text-[13px] text-ink-faint">—</td>
                        <td className="px-5 py-3.5 text-[12.5px] text-ink-body leading-relaxed">{f.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[12.5px] text-ink-muted leading-relaxed mt-4">
              GWPs are IPCC AR5 100-year (CH₄ = 28, N₂O = 265), aligned with the GHG Protocol. Verify against the latest CEA and BEE publications each filing year.
            </p>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="bg-band border-y border-line-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">Common mistakes to avoid</h2>
            <ul className="grid md:grid-cols-2 gap-4 mt-8">
              {MISTAKES.map((m, i) => (
                <li key={i} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-elev-1">
                  <svg className="w-5 h-5 text-ember shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9l-8 13.9A2 2 0 004 21h16a2 2 0 001.7-3.2l-8-13.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01" /></svg>
                  <span className="text-[14px] text-ink-body leading-relaxed">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Where these numbers go in BRSR */}
        <section>
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">Where these numbers go in BRSR</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { code: "P6-E7", title: "Scope 1 & 2 GHG", body: "The headline emissions figure, plus intensity per rupee of turnover. Assured under BRSR Core for the top listed companies." },
                { code: "P6-E1", title: "Total energy", body: "Electricity + fuel + other sources in joules, with energy intensity. The Energy tab computes it from the same inputs." },
                { code: "P6-E3", title: "Water withdrawal", body: "Withdrawal by source in kilolitres, plus water intensity. The Water tab covers the P6-E3 format." },
              ].map((c) => (
                <div key={c.code} className="rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <span className="font-mono text-[10.5px] font-semibold text-brand-700 bg-brand-50 border border-[#CDE2F6] rounded-full px-2 py-0.5">{c.code}</span>
                  <h3 className="text-[16px] font-semibold text-ink mt-3">{c.title}</h3>
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
