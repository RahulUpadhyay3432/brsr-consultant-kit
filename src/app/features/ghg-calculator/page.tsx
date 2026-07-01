import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "GHG & Energy Calculator, Saaksh",
  description:
    "Calculate Scope 1 & 2 GHG emissions, energy intensity, and water intensity for BRSR P6, cited to IPCC 2006 and the latest CEA grid factor, entirely in your browser.",
};

export default function GhgCalculatorPage() {
  return (
    <div className="min-h-screen bg-page">
      <SiteHeader active="tools" />

      {/* Hero */}
      <section style={{ background: "#0F1E33" }} className="mt-6">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <span
              className="text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full uppercase"
              style={{ background: "#0B6FD4" }}
            >
              Free tool
            </span>
            <span className="text-sm font-mono" style={{ color: "#1E9DF2" }}>
              BRSR P6 · Scope 1 &amp; 2
            </span>
          </div>
          <h1
            className="font-display text-4xl md:text-5xl mb-5 leading-tight"
            style={{ color: "#FFFFFF" }}
          >
            Built-in GHG &amp; Energy Calculator
          </h1>
          <p className="text-lg max-w-[640px] leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
            Calculate Scope 1 and 2 GHG emissions, energy intensity, and water intensity for BRSR P6
            disclosures, cited to IPCC 2006 and CEA v21.0, running entirely in your browser.
          </p>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-16">

        {/* Section 1, What it calculates */}
        <section>
          <h2 className="font-display text-2xl mb-3" style={{ color: "#0F172A" }}>
            What it calculates
          </h2>
          <p className="text-sm mb-8 max-w-[560px]" style={{ color: "#5B6573" }}>
            Four calculators inside the BRSR action plan, each one opens inline when you reach the
            relevant P6 disclosure row.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                label: "P6-E1",
                title: "Scope 1 Emissions",
                body: "Diesel, LPG, and other combustion fuels. Factor: 2.68 kg CO₂e/litre for diesel (IPCC 2006, Vol. 2 Table 2.2). Result in tCO₂e.",
                cite: "IPCC 2006, Vol. 2 Table 2.2",
                accent: "#EAF4FE",
                accentBorder: "#AFD2FB",
                accentText: "#0B5FB0",
              },
              {
                label: "P6-E1",
                title: "Scope 2 Emissions",
                body: "Grid electricity consumption converted to CO₂e. Factor: 0.710 kg CO₂e/kWh (CEA Version 21.0, 2024). Result in tCO₂e.",
                cite: "CEA v21.0, 0.710 kg CO₂e / kWh",
                accent: "#EAF4FE",
                accentBorder: "#AFD2FB",
                accentText: "#0B5FB0",
              },
              {
                label: "P6-E7",
                title: "Energy Intensity",
                body: "Total energy consumed ÷ turnover (₹ crore) and ÷ physical output (tonnes/units). Both denominators supported for mixed-sector clients.",
                cite: "BRSR Format, Principle 6, Essential Indicator 7",
                accent: "#FFF1ED",
                accentBorder: "#F8C9BD",
                accentText: "#C24428",
              },
              {
                label: "P6-E3",
                title: "Water Consumption",
                body: "Total water withdrawal by source, water intensity per rupee of turnover. Covers surface water, groundwater, rainwater, and third-party water.",
                cite: "BRSR Format, Principle 6, Essential Indicator 3",
                accent: "#FFF1ED",
                accentBorder: "#F8C9BD",
                accentText: "#C24428",
              },
            ].map(({ label, title, body, cite, accent, accentBorder, accentText }) => (
              <div
                key={title}
                className="rounded-xl p-7 flex flex-col gap-4 border"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#E5E9F0",
                  boxShadow: "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)",
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg" style={{ color: "#0F172A" }}>
                    {title}
                  </h3>
                  <span
                    className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                    style={{ background: accent, color: accentText }}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#28303B" }}>
                  {body}
                </p>
                <div
                  className="text-xs font-mono px-3 py-1.5 rounded-lg border"
                  style={{ background: accent, color: accentText, borderColor: accentBorder }}
                >
                  {cite}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2, Citation standard */}
        <section>
          <h2 className="font-display text-2xl mb-3" style={{ color: "#0F172A" }}>
            Citation standard
          </h2>
          <p className="text-sm mb-8 max-w-[600px]" style={{ color: "#5B6573" }}>
            Every factor is cited by source, version, and year. Your assurer can trace each number
            back to its source.
          </p>
          <div
            className="rounded-xl p-8"
            style={{ background: "#0F1E33" }}
          >
            <p
              className="text-xs font-mono uppercase tracking-widest mb-5"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              Example, Scope 1 &amp; 2 factor citations
            </p>
            <div className="space-y-3 font-mono text-sm">
              {[
                {
                  name: "Diesel emissions",
                  value: "2.68 kg CO₂e / litre",
                  source: "IPCC 2006, Vol. 2, Table 2.2",
                },
                {
                  name: "Grid electricity",
                  value: "0.710 kg CO₂e / kWh",
                  source: "CEA CO₂ Baseline Version 21.0 (2024)",
                },
              ].map(({ name, value, source }) => (
                <div key={name} className="flex flex-wrap gap-x-4 gap-y-1.5">
                  <span style={{ color: "#1E9DF2" }}>{name}</span>
                  <span style={{ color: "rgba(255,255,255,0.80)" }}>{value}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>{source}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3, 100% on-device */}
        <section>
          <div
            className="rounded-xl p-8 border"
            style={{
              background: "#FFFFFF",
              borderColor: "#E5E9F0",
              boxShadow: "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)",
            }}
          >
            <div className="flex gap-4 items-start">
              <div
                className="shrink-0 p-2.5 rounded-xl"
                style={{ background: "#EAF4FE" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M17 10C17 13.866 13.866 17 10 17C6.134 17 3 13.866 3 10C3 6.134 6.134 3 10 3C13.866 3 17 6.134 17 10Z"
                    stroke="#0B6FD4"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 7v4M10 13h.01"
                    stroke="#0B6FD4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg mb-2" style={{ color: "#0F172A" }}>
                  100% on-device
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#28303B" }}>
                  The calculator runs in your browser. No figures are sent to any server. Your
                  client&apos;s energy and emissions data stays on your device.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4, Intensity ratios */}
        <section>
          <h2 className="font-display text-2xl mb-4" style={{ color: "#0F172A" }}>
            Intensity ratios
          </h2>
          <p className="text-base leading-relaxed max-w-[680px]" style={{ color: "#28303B" }}>
            BRSR requires intensity ratios alongside absolute figures. The calculator outputs both
            turnover-based intensity (₹ crore denominator) and physical output intensity (tonnes or
            units) where relevant. For service-sector companies without physical output,
            turnover-only is acceptable.
          </p>
        </section>

        {/* CEA refresh note */}
        <section>
          <div
            className="rounded-xl p-7 border"
            style={{ background: "#EFF3FA", borderColor: "#E5E9F0" }}
          >
            <div className="flex gap-3 items-start">
              <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="#5B6573" strokeWidth="1.5" />
                <path
                  d="M9 8v5M9 6h.01"
                  stroke="#5B6573"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#0F172A" }}>
                  CEA factor refresh
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#5B6573" }}>
                  The CEA grid emission factor (currently 0.710&nbsp;kg&nbsp;CO₂e/kWh,
                  Version&nbsp;21.0, 2024) is updated by the Central Electricity Authority
                  annually. Saaksh will refresh this when v22 is published (expected late 2026).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-6">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors pressable"
            style={{ background: "#0B6FD4" }}
          >
            Access the calculator →
          </Link>
          <p className="text-sm mt-4" style={{ color: "#5B6573" }}>
            The GHG calculator is inside the BRSR gap analysis report, on the P6 disclosures.
          </p>
        </section>
      </div>
    </div>
  );
}
