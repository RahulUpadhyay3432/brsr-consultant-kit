"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import { ToolLearn } from "@/components/tools/ToolLearn";
import {
  assessBrsrApplicability, VERDICT_META,
  type RankBand, type ApplicabilityResult,
} from "@/lib/brsr-applicability";

const TONE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  green: { bg: "#E3F7F0", text: "#0E7A56", border: "#BFE6D8", dot: "#10A572" },
  amber: { bg: "#F6ECD8", text: "#8A6516", border: "#EAD8B0", dot: "#C2871B" },
  blue:  { bg: "#EAF4FE", text: "#0B5FB0", border: "#C5DEFA", dot: "#1E9DF2" },
  slate: { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0", dot: "#94A3B8" },
};

const RANK_OPTIONS: { value: RankBand; label: string }[] = [
  { value: "top150", label: "Top 150" },
  { value: "top250", label: "151 – 250" },
  { value: "top500", label: "251 – 500" },
  { value: "top1000", label: "501 – 1000" },
  { value: "outside1000", label: "Outside top 1000" },
];

function VerdictCard({ r }: { r: ApplicabilityResult }) {
  const m = VERDICT_META[r.verdict];
  const t = TONE[m.tone];
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-elev-1">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <h3 className="font-display font-bold text-[1.05rem] text-ink leading-snug">{r.title}</h3>
        <span
          className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5"
          style={{ backgroundColor: t.bg, color: t.text, border: `1px solid ${t.border}` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} />
          {m.label}
        </span>
      </div>
      <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] mb-2" style={{ color: t.text }}>
        {r.timing}
      </p>
      <p className="text-[14.5px] text-ink-muted leading-relaxed">{r.reason}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-line-soft">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Source</span>
        {r.sources.map((s) => (
          <a key={s.href} href={s.href} target="_blank" rel="noreferrer"
            className="text-[12.5px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
            {s.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

export default function BrsrApplicabilityPage() {
  const [listed, setListed] = useState(true);
  const [rankBand, setRankBand] = useState<RankBand>("top500");
  const [valueChainPartner, setValueChainPartner] = useState(false);

  const effectiveRank: RankBand = listed ? rankBand : "not_listed";
  const results = assessBrsrApplicability({ listed, rankBand: effectiveRank, valueChainPartner });

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          active="tools"
          eyebrow="Free tool · on-device"
          title="Does your client have to file BRSR, and by when?"
          subtitle="Answer three questions and get a cited verdict on BRSR, BRSR Core assurance and value-chain disclosure, with the financial year each obligation starts. Nothing is stored; this runs in your browser."
          benefits={[
            "A cited verdict for BRSR, Core assurance and value-chain disclosure",
            "The financial year each obligation kicks in",
            "Three questions, answered entirely on-device",
          ]}
          whoFor="For the consultant scoping whether, and when, a client falls in scope. A readiness check, not legal advice."
          maxWidth={1180}
        />

        <div className="anim-up-sm max-w-[1180px] mx-auto px-5 sm:px-8 py-10">
          <div className="grid lg:grid-cols-[360px_1fr] gap-8 lg:gap-12 items-start">
            {/* Inputs */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-elev-1 lg:sticky lg:top-24">
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-semibold text-ink mb-2">Is the company listed on an Indian exchange (BSE / NSE)?</p>
                  <div className="flex gap-1 bg-band rounded-lg p-0.5">
                    {[["Listed", true], ["Unlisted", false]].map(([label, val]) => (
                      <button key={String(val)} onClick={() => setListed(val as boolean)}
                        className={`flex-1 text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${listed === val ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}>
                        {label as string}
                      </button>
                    ))}
                  </div>
                </div>

                {listed && (
                  <div>
                    <p className="text-[13px] font-semibold text-ink mb-2">Rank by market capitalisation</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {RANK_OPTIONS.map((o) => (
                        <button key={o.value} onClick={() => setRankBand(o.value)}
                          className={`text-[12.5px] font-medium px-2.5 py-2 rounded-lg border transition-colors ${rankBand === o.value ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-muted border-line hover:border-brand-300"}`}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[13px] font-semibold text-ink mb-2">
                    Is it a significant value-chain partner (&ge;2% of purchases / sales) of a larger listed company?
                  </p>
                  <div className="flex gap-1 bg-band rounded-lg p-0.5">
                    {[["Yes", true], ["No", false]].map(([label, val]) => (
                      <button key={String(val)} onClick={() => setValueChainPartner(val as boolean)}
                        className={`flex-1 text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${valueChainPartner === val ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}>
                        {label as string}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verdicts */}
            <div className="space-y-4">
              {results.map((r) => <VerdictCard key={r.id} r={r} />)}
              <p className="text-[12.5px] text-ink-faint leading-relaxed">
                A readiness check, not legal advice. SEBI has restated the BRSR Core glide-path years; confirm the exact year for your client against the latest{" "}
                <a href="https://www.sebi.gov.in/legal/circulars/" target="_blank" rel="noreferrer" className="text-brand-700 underline decoration-line hover:decoration-brand-500">SEBI circular</a>.
                Then run the{" "}
                <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">free readiness report</Link>{" "}
                for the full 108-field gap analysis.
              </p>
            </div>
          </div>
        </div>

        <ToolLearn
          title="How BRSR scope is widening"
          intro="BRSR didn't arrive all at once. SEBI has widened it in deliberate stages, first who reports at all, then who gets assured, then whose value chain is pulled in. Knowing the phasing tells you what to prepare a client for next."
          items={[
            { icon: "building", title: "Who must file", body: "The top 1000 listed companies by market capitalisation file the full BRSR. SEBI phased this in, the top 100, then 500, now 1000, so a client climbing the rankings can come into scope in a given year." },
            { icon: "seal", title: "The Core assurance glide path", body: "Beyond filing, the BRSR Core attributes need reasonable assurance. That obligation phases in by market cap too, starting with the top 150 and widening down toward the top 1000 over successive years." },
            { icon: "link", title: "Value-chain disclosure", body: "The frontier is the value chain: significant partners (roughly 2% or more of purchases or sales) of a large listed company are pulled in, reporting BRSR Core on a comply-or-explain basis from FY 2026-27." },
            { icon: "calendar", title: "Confirm the exact year", body: "SEBI has restated the glide-path years more than once. Treat this tool as a fast readiness check, then confirm the precise financial year for your client against the latest SEBI circular before you commit to it." },
          ]}
          maxWidth={1180}
        />
      </main>
      <BlogFooter />
    </div>
  );
}
