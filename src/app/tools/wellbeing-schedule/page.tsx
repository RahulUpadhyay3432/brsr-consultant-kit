"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { SEBI_BRSR_FORMAT_URL } from "@/components/checklist/constants";
import { downloadCsv } from "@/lib/export";
import { WELLBEING_ROWS, buildWellbeingScheduleRows } from "@/lib/wellbeing-schedule";

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  );
}

const SOURCES = [
  { label: "SEBI BRSR Format (Principle 3)", href: SEBI_BRSR_FORMAT_URL },
  { label: "SEBI BRSR Core (circular 12 Jul 2023)", href: "https://www.sebi.gov.in/legal/circulars/jul-2023/brsr-core-framework-for-assurance-and-esg-disclosures-for-value-chain_73854.html" },
  { label: "Maternity Benefit Act, 1961", href: "https://labour.gov.in/womenlabour/maternity-benefit-act-1961" },
  { label: "Employees' State Insurance Act, 1948", href: "https://www.esic.gov.in/" },
];

export default function WellbeingSchedulePage() {
  const [guideOpen, setGuideOpen] = useState(true);

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="tools" />
      <main className="flex-1">
        <div className="bg-[#0F1E33]">
          <div className="max-w-[1000px] mx-auto px-5 sm:px-8 py-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
              Filing &amp; audit tools · on-device
            </p>
            <h1 className="font-display font-bold text-[2rem] sm:text-[2.5rem] text-white leading-[1.1] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
              Build the P3 well-being expenditure schedule
            </h1>
            <p className="text-[15px] text-[#9FB0C4] leading-relaxed mt-3 max-w-[640px]">
              BRSR asks for &ldquo;spending on employee well-being as a % of revenue&rdquo;, a BRSR Core assured figure. This maps each welfare head to the P&amp;L line it comes from, so you can assemble the number from the audited accounts. Download it as a working schedule.
            </p>
          </div>
        </div>

        <div className="anim-up-sm max-w-[1000px] mx-auto px-5 sm:px-8 py-10 space-y-8">
          <div className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-band border-b border-line">
              <h2 className="text-[14px] font-semibold text-ink flex-1">Welfare head → P&amp;L line mapping</h2>
              <button onClick={() => downloadCsv("brsr-p3-wellbeing-schedule.csv", buildWellbeingScheduleRows())}
                className="inline-flex items-center gap-2 bg-forest text-white text-[13px] font-semibold px-3.5 py-2 rounded-lg hover:bg-forest-light transition-colors pressable">
                <DownloadIcon /> Download CSV
              </button>
            </div>
            <div className="divide-y divide-line">
              {WELLBEING_ROWS.map((r, i) => (
                <div key={i} className="px-5 py-3.5 grid sm:grid-cols-[1fr_1fr] gap-x-6 gap-y-1">
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink leading-snug">{r.head}</p>
                    <p className="text-[11.5px] text-ink-faint mt-0.5">{r.relevance}</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-ink-muted leading-snug font-mono">{r.ledger}</p>
                    <p className="text-[11.5px] text-ink-faint mt-0.5">{r.notes}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-band border-t border-line">
              <p className="text-[12px] text-ink-muted leading-snug">
                The CSV adds a TOTAL row and blank current / prior-FY amount columns. Divide the total by revenue from operations to get the BRSR Core %.
              </p>
            </div>
          </div>

          {/* Guide */}
          <div className="border border-line rounded-xl bg-white overflow-hidden">
            <button onClick={() => setGuideOpen((o) => !o)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-band transition-colors">
              <span className="flex-1 text-[14px] font-semibold text-ink">How to use this schedule</span>
              <svg className={`w-4 h-4 text-ink-faint transition-transform ${guideOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${guideOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="min-h-0">
                <div className="px-5 pb-5 space-y-2.5 text-[13.5px] text-ink-muted leading-relaxed">
                  <p>1. Pull each line from the trial balance / notes to accounts for the reporting FY and the prior FY.</p>
                  <p>2. Keep employees and workers separate where the BRSR table asks for the split; the same welfare head may sit in more than one cost centre.</p>
                  <p>3. Sum to a total, then express it as a percentage of revenue from operations, that is the figure the assurer tests.</p>
                  <p>4. Keep the premium invoices, actuarial valuation and challans, the audit-readiness checklist lists exactly what an assurer asks for.</p>
                  <p className="text-[12.5px] text-ink-faint pt-1">
                    This maps welfare heads to ledger lines only. It does not attempt any spend-to-emission conversion.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 border-t border-line-soft">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Sources</span>
                    {SOURCES.map((s) => (
                      <a key={s.href} href={s.href} target="_blank" rel="noreferrer"
                        className="text-[12.5px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
                        {s.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[12.5px] text-ink-faint leading-relaxed">
            See what an assurer wants alongside this in the{" "}
            <Link href="/tools/audit-readiness" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">audit-readiness checklist</Link>, or run the full{" "}
            <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">readiness report</Link>.
          </p>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
