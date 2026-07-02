"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import { ToolLearn } from "@/components/tools/ToolLearn";
import { SEBI_BRSR_FORMAT_URL } from "@/components/checklist/constants";
import {
  calcPppIntensity, DEFAULT_PPP_INPUTS, METRIC_LABEL,
  PPP_META, PPP_YEAR, fmt, fmtInt,
  type PppInputs, type MetricUnit,
} from "@/lib/ppp-intensity";

function Field({ label, unit, value, onChange, placeholder }: {
  label: string; unit: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-brand-800 uppercase tracking-[0.05em] mb-1.5">{label}</label>
      <div className="flex items-center gap-1.5">
        <input type="number" min="0" step="any" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "0"}
          className="flex-1 min-w-0 h-11 px-3 text-[16px] font-mono text-ink border border-[#CDE2F6] rounded-lg
            bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400
            transition-[border-color,box-shadow] placeholder:text-ink-faint" />
        <span className="flex items-center h-11 px-2.5 rounded-lg bg-brand-50 border border-[#CDE2F6]
          text-[12.5px] font-semibold text-brand-800 whitespace-nowrap flex-shrink-0">{unit}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, unit, bold }: { label: string; value: string; unit: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className={`text-[13px] leading-relaxed ${bold ? "text-ink font-semibold" : "text-ink-muted"}`}>{label}</span>
      <span className={`text-[13.5px] font-mono tabular-nums whitespace-nowrap ${bold ? "text-ink font-semibold" : "text-ink-body"}`}>
        {value} <span className="font-sans text-[11.5px] text-ink-muted font-normal">{unit}</span>
      </span>
    </div>
  );
}

export default function PppIntensityPage() {
  const [inp, setInp] = useState<PppInputs>(DEFAULT_PPP_INPUTS);
  const set = (key: keyof PppInputs) => (v: string) => setInp((p) => ({ ...p, [key]: v }));
  const setUnit = (u: MetricUnit) => setInp((p) => ({ ...p, metricUnit: u }));
  const r = calcPppIntensity(inp);
  const mlabel = METRIC_LABEL[inp.metricUnit];

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          eyebrow="Filing & audit tools · on-device"
          title="PPP-adjusted intensity, comparable with global peers"
          subtitle="Restate an emissions or energy intensity against PPP-adjusted turnover, so an Indian company's figure stands next to international peers on a like-for-like basis."
          benefits={[
            "Turn a rupee-per-turnover intensity into an int'l-dollar figure peers use",
            "World Bank PPP factor pre-filled and cited, editable for the current year",
            "Sits alongside, not instead of, the rupee intensity you file under P6",
          ]}
          whoFor="For the consultant benchmarking a client against global peers or a parent group. An optional view; it does not replace the BRSR rupee figure."
          maxWidth={1000}
        />

        <div className="anim-up-sm mx-auto w-full px-5 sm:px-8 py-10" style={{ maxWidth: 1000 }}>
          <div className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-10 items-start">
            {/* Inputs */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-elev-1 lg:sticky lg:top-24 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-brand-800 uppercase tracking-[0.05em] mb-1.5">Metric</label>
                <div className="flex gap-1 bg-band rounded-lg p-0.5 mb-2.5">
                  {(["tco2e", "gj"] as MetricUnit[]).map((u) => (
                    <button key={u} onClick={() => setUnit(u)}
                      className={`flex-1 text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${inp.metricUnit === u ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}>
                      {METRIC_LABEL[u]}
                    </button>
                  ))}
                </div>
                <Field label={`Total ${mlabel}`} unit={mlabel} value={inp.metric} onChange={set("metric")} placeholder="e.g. 1000" />
              </div>

              <Field label="Annual turnover" unit="₹ crore" value={inp.revenueCrore} onChange={set("revenueCrore")} placeholder="e.g. 500" />

              <div>
                <Field label="PPP conversion factor" unit="₹ / int'l $" value={inp.pppFactor} onChange={set("pppFactor")} />
                <p className="text-[13px] text-ink-body mt-2 leading-relaxed">
                  Pre-filled with the World Bank {PPP_YEAR} value. Editable, override with the current-year figure before filing.
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#CDE2F6] bg-[#EAF4FE] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-brand-700 mb-3">Results</p>
                {r.valid ? (
                  <div className="space-y-2.5">
                    <div className="pb-3 mb-1 border-b border-[#CDE2F6]">
                      <span className="text-[30px] font-bold text-ink tabular-nums leading-none font-mono">
                        {fmt(r.pppIntensityPerMillionIntl ?? 0)}
                      </span>
                      <span className="text-[13px] text-ink-muted ml-2">{mlabel} / million int&rsquo;l $ (PPP)</span>
                    </div>
                    <ResultRow label="Rupee intensity" value={fmt(r.rupeeIntensityPerCrore ?? 0)} unit={`${mlabel} / ₹ crore`} />
                    <ResultRow label="PPP-adjusted turnover" value={fmtInt(r.pppRevenueIntl)} unit="int'l $ (PPP)" />
                    <div className="border-t border-[#CDE2F6] pt-2.5 mt-2.5">
                      <ResultRow label={`PPP-adjusted intensity`} value={fmt(r.pppIntensityPerMillionIntl ?? 0)} unit={`${mlabel} / M int'l $`} bold />
                    </div>
                    <p className="text-[13px] text-ink-body mt-1.5 leading-relaxed">
                      Computed as the metric divided by PPP-adjusted turnover ({fmtInt(r.pppRevenueIntl)} int&rsquo;l $ at ₹{fmt(r.factor)} per int&rsquo;l $). A higher PPP factor converts each rupee of turnover into more international dollars, so the PPP intensity sits above the raw market-rate figure.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#B9D7F5] bg-[#F8FBFE] px-4 py-5">
                    <span className="text-[26px] font-bold text-ink-faint tabular-nums leading-none">—</span>
                    <p className="text-[12.5px] text-ink-muted leading-relaxed mt-2">
                      Enter a metric, turnover, and a PPP factor to see the PPP-adjusted intensity.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-line bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-brand-700 mb-2">Method &amp; formula</p>
                <p className="text-[13px] text-ink-body leading-relaxed font-mono bg-band rounded-lg px-3 py-2.5 mb-3">
                  PPP intensity = metric ÷ (revenue in ₹ ÷ PPP factor)
                </p>
                <p className="text-[13px] text-ink-body leading-relaxed">
                  BRSR reports intensity per rupee of turnover (P6). This tool adds an optional PPP-adjusted view for peer comparison; it does not replace the rupee figure you file.
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-line-soft">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Sources</span>
                  <a href={PPP_META.source_url} target="_blank" rel="noreferrer"
                    className="text-[13px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
                    {PPP_META.source_short} ↗
                  </a>
                  <a href={SEBI_BRSR_FORMAT_URL} target="_blank" rel="noreferrer"
                    className="text-[13px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
                    SEBI BRSR Format (P6 intensity) ↗
                  </a>
                </div>
                <p className="text-[13px] text-ink-muted mt-2.5 leading-relaxed">{PPP_META.vintage_note}</p>
              </div>

              <p className="text-[13px] text-ink-muted leading-relaxed">
                Need the underlying emissions figure first? Use the{" "}
                <Link href="/tools/ghg-calculator" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">GHG calculator</Link>.
              </p>
            </div>
          </div>
        </div>

        <ToolLearn
          title="Why a rupee intensity misleads a global comparison"
          intro="BRSR asks for emissions intensity per rupee of turnover. That's the right figure to file, but it can't sit next to a European or US peer's number, because a rupee doesn't buy the same output abroad that it does in India. PPP corrects for exactly that."
          items={[
            { icon: "globe", title: "The comparison problem", body: "A peer reports tonnes per million dollars of revenue. Convert your rupees at the market exchange rate and Indian intensity looks worse than it is, because the rupee is undervalued against what it actually buys." },
            { icon: "scale", title: "What PPP does", body: "Purchasing Power Parity restates turnover in international dollars, the amount that buys the same basket of goods everywhere. It strips the currency distortion out of the denominator so the intensity is like-for-like." },
            { icon: "refresh", title: "One editable, cited factor", body: "The World Bank publishes India's PPP conversion factor each year (about ₹20.45 per international dollar for 2024). It's pre-filled and cited here, override it with the current-year value before you rely on it." },
          ]}
          maxWidth={1000}
        />
      </main>
      <BlogFooter />
    </div>
  );
}
