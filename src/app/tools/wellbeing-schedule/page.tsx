"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import { ToolLearn } from "@/components/tools/ToolLearn";
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
      <main className="flex-1">
        <ToolHero
          eyebrow="Filing & audit tools · on-device"
          title="Build the P3 well-being expenditure schedule"
          subtitle="BRSR asks for spending on employee well-being as a % of revenue, a BRSR Core assured figure. This maps each welfare head to the P&L line it comes from, so you assemble the number straight from the audited accounts."
          benefits={[
            "Each of the 11 welfare heads mapped to the exact ledger line it sits in",
            "Download a ready-to-fill schedule with a total and prior-year column",
            "Every mapping cited to SEBI BRSR and the underlying labour law",
          ]}
          whoFor="For the consultant assembling the P3 well-being spend from the client's accounts. Maps heads to ledger lines only, no spend-to-emission conversion."
          maxWidth={1080}
        />

        <div className="anim-up-sm mx-auto w-full px-5 sm:px-8 py-10" style={{ maxWidth: 1080 }}>
          <div className="grid lg:grid-cols-[290px_1fr] gap-8 lg:gap-10 items-start">
            {/* Sticky rail: what this is + export */}
            <aside className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-elev-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint mb-2">The schedule</p>
                <p className="text-[13.5px] text-ink-body leading-relaxed">
                  11 welfare heads, each mapped to the P&amp;L / ledger line you pull it from. The CSV adds a TOTAL row and blank current / prior-FY amount columns.
                </p>
                <button onClick={() => downloadCsv("brsr-p3-wellbeing-schedule.csv", buildWellbeingScheduleRows())}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-forest text-white text-[13.5px] font-semibold px-3.5 py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable">
                  <DownloadIcon /> Download CSV
                </button>
                <p className="text-[12.5px] text-ink-muted leading-relaxed mt-3">
                  Divide the total by revenue from operations to get the BRSR Core %.
                </p>
              </div>
            </aside>

            {/* Table + guide */}
            <div className="min-w-0 space-y-6">
              <div className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden">
                <div className="px-5 py-3.5 bg-band border-b border-line">
                  <h2 className="text-[14.5px] font-semibold text-ink">Welfare head → P&amp;L line mapping</h2>
                </div>
                <div className="divide-y divide-line">
                  {WELLBEING_ROWS.map((r, i) => (
                    <div key={i} className="px-5 py-4 grid sm:grid-cols-[1fr_1fr] gap-x-6 gap-y-1.5">
                      <div>
                        <p className="text-[14px] font-semibold text-ink leading-snug">{r.head}</p>
                        <p className="text-[13px] text-ink-body mt-1 leading-relaxed">{r.relevance}</p>
                      </div>
                      <div>
                        <p className="text-[13.5px] text-ink font-medium leading-snug">{r.ledger}</p>
                        <p className="text-[13px] text-ink-body mt-1 leading-relaxed">{r.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide */}
              <div className="border border-line rounded-xl bg-white overflow-hidden">
                <button onClick={() => setGuideOpen((o) => !o)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-band transition-colors">
                  <span className="flex-1 text-[14.5px] font-semibold text-ink">How to use this schedule</span>
                  <svg className={`w-4 h-4 text-ink-muted transition-transform ${guideOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${guideOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="min-h-0">
                    <div className="px-5 pb-5 space-y-2.5 text-[14px] text-ink-body leading-relaxed">
                      <p>1. Pull each line from the trial balance / notes to accounts for the reporting FY and the prior FY.</p>
                      <p>2. Keep employees and workers separate where the BRSR table asks for the split; the same welfare head may sit in more than one cost centre.</p>
                      <p>3. Sum to a total, then express it as a percentage of revenue from operations, that is the figure the assurer tests.</p>
                      <p>4. Keep the premium invoices, actuarial valuation and challans; the audit-readiness checklist lists exactly what an assurer asks for.</p>
                      <p className="text-[13px] text-ink-muted pt-1">
                        This maps welfare heads to ledger lines only. It does not attempt any spend-to-emission conversion.
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 border-t border-line-soft">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Sources</span>
                        {SOURCES.map((s) => (
                          <a key={s.href} href={s.href} target="_blank" rel="noreferrer"
                            className="text-[13px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
                            {s.label} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-ink-muted leading-relaxed">
                See what an assurer wants alongside this in the{" "}
                <Link href="/tools/audit-readiness" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">audit-readiness checklist</Link>, or run the full{" "}
                <Link href="/start" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">readiness report</Link>.
              </p>
            </div>
          </div>
        </div>

        <ToolLearn
          title="Why the P3 well-being number matters"
          intro="Spending on employee well-being reads like a soft disclosure, but under BRSR Core it's an assured percentage that has to reconcile to the audited accounts. Knowing where it comes from is what makes it defensible."
          items={[
            { icon: "seal", title: "An assured figure", body: "BRSR Core tests spend on employee well-being as a percentage of revenue. It isn't a claim you assert, it's a number the assurer traces back to source, so it has to tie out to the ledger." },
            { icon: "ledger", title: "It lives in the P&L", body: "Every welfare head is already a cost line in the accounts, PF contributions, insurance premia, gratuity provisions. You're assembling the figure from audited numbers, not estimating it, which is exactly why it's assurable." },
            { icon: "heart", title: "Statutory and voluntary heads", body: "Provident Fund, ESI, gratuity and maternity benefit are mandated by law; health insurance, transport, canteen and welfare funds are voluntary. BRSR counts both, and asks for the employees-versus-workers split." },
          ]}
          maxWidth={1080}
        />
      </main>
      <BlogFooter />
    </div>
  );
}
