"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolFaq } from "@/components/tools/ToolFaq";
import { TOOL_FAQS } from "@/data/tool-faqs";
import { ToolHero } from "@/components/tools/ToolHero";
import { ToolLearn } from "@/components/tools/ToolLearn";
import { SEBI_BRSR_FORMAT_URL } from "@/components/checklist/constants";
import { CalcPanel, NumberField, ResultList, ResultRow, SegmentedTabs } from "@/components/calc/CalcKit";
import {
  calcPppIntensity, DEFAULT_PPP_INPUTS, METRIC_LABEL,
  PPP_META, PPP_YEAR, fmt, fmtInt,
  type PppInputs, type MetricUnit,
} from "@/lib/ppp-intensity";

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

        {/* Calculator: frost panels on a tinted stage */}
        <section className="calc-stage border-b border-line-soft">
          <div className="anim-up-sm mx-auto w-full px-5 sm:px-8 py-12" style={{ maxWidth: 1000 }}>
            <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-5 items-start">
              {/* Inputs */}
              <CalcPanel level={2} title="Your figures" className="lg:sticky lg:top-24">
                <div className="space-y-5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink mb-1.5">Metric</p>
                    <SegmentedTabs
                      full
                      ariaLabel="Metric"
                      options={(["tco2e", "gj"] as MetricUnit[]).map((u) => ({ id: u, label: METRIC_LABEL[u] }))}
                      value={inp.metricUnit}
                      onChange={setUnit}
                    />
                  </div>
                  <NumberField label={`Total ${mlabel}`} unit={mlabel} value={inp.metric} onChange={set("metric")} placeholder="e.g. 1000" />
                  <NumberField label="Annual turnover" unit="₹ crore" value={inp.revenueCrore} onChange={set("revenueCrore")} placeholder="e.g. 500" />
                  <NumberField label="PPP conversion factor" unit="₹ / int'l $" value={inp.pppFactor} onChange={set("pppFactor")}
                    hint={`Pre-filled with the World Bank ${PPP_YEAR} value. Editable; override it with the current-year figure before filing.`} />
                </div>
              </CalcPanel>

              {/* Results */}
              <div className="space-y-5">
                <CalcPanel level={2} title="PPP-adjusted intensity">
                  <ResultList>
                    <ResultRow label="Rupee intensity" value={r.valid ? fmt(r.rupeeIntensityPerCrore ?? 0) : "—"} unit={`${mlabel} / ₹ crore`} />
                    <ResultRow label="PPP-adjusted turnover" value={r.valid ? fmtInt(r.pppRevenueIntl) : "—"} unit="int'l $ (PPP)" />
                    <ResultRow label="PPP-adjusted intensity" sub={`${mlabel} per million int'l $ (PPP)`}
                      value={r.valid ? fmt(r.pppIntensityPerMillionIntl ?? 0) : "—"} strong />
                  </ResultList>
                  <p className="mt-3 text-[12.5px] text-ink-muted leading-relaxed">
                    {r.valid ? (
                      <>Computed as the metric divided by PPP-adjusted turnover ({fmtInt(r.pppRevenueIntl)} int&rsquo;l $ at ₹{fmt(r.factor)} per int&rsquo;l $). A higher PPP factor converts each rupee of turnover into more international dollars, so the PPP intensity sits above the raw market-rate figure.</>
                    ) : (
                      "Enter a metric, turnover, and a PPP factor to see the PPP-adjusted intensity."
                    )}
                  </p>
                </CalcPanel>

                <CalcPanel level={2} title="Method & formula" compact>
                  <p className="text-[13.5px] text-ink leading-relaxed bg-white/70 border border-[#D6E6F7] rounded-xl px-3.5 py-2.5 mb-3">
                    PPP intensity = metric ÷ (revenue in ₹ ÷ PPP factor)
                  </p>
                  <p className="text-[13px] text-ink-body leading-relaxed">
                    BRSR reports intensity per rupee of turnover (P6). This tool adds an optional PPP-adjusted view for peer comparison; it does not replace the rupee figure you file.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-[#D6E6F7]">
                    <span className="text-[12px] font-semibold text-brand-700">Sources:</span>
                    <a href={PPP_META.source_url} target="_blank" rel="noreferrer"
                      className="text-[13px] text-brand-700 hover:text-brand-800 underline decoration-[#AFD2FB] hover:decoration-brand-500 transition-colors">
                      {PPP_META.source_short} ↗
                    </a>
                    <a href={SEBI_BRSR_FORMAT_URL} target="_blank" rel="noreferrer"
                      className="text-[13px] text-brand-700 hover:text-brand-800 underline decoration-[#AFD2FB] hover:decoration-brand-500 transition-colors">
                      SEBI BRSR Format (P6 intensity) ↗
                    </a>
                  </div>
                  <p className="text-[12.5px] text-ink-muted mt-2.5 leading-relaxed">{PPP_META.vintage_note}</p>
                </CalcPanel>

                <p className="text-[13px] text-ink-body leading-relaxed px-1">
                  Need the underlying emissions figure first? Use the{" "}
                  <Link href="/tools/ghg-calculator" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">GHG calculator</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

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
        <ToolFaq items={TOOL_FAQS["ppp-intensity"]} />
      </main>
      <BlogFooter />
    </div>
  );
}
