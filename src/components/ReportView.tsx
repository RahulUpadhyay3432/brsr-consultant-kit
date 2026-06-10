"use client";

import { useState } from "react";
import type { ReportOutput, FrameworkMapping } from "@/lib/types";
import { INDUSTRY_LABELS, FILING_LABELS, type IndustryType, type ExistingFiling } from "@/lib/types";
import DataChecklist from "./DataChecklist";
import MaterialityMatrix from "./MaterialityMatrix";
import FrameworkMapper from "./FrameworkMapper";
import EsgRatingsMapper from "./EsgRatingsMapper";

interface ReportViewProps {
  report: ReportOutput;
  onBack: () => void;
}

const TABS = [
  { id: "overview",    label: "Overview" },
  { id: "checklist",   label: "Action Plan" },
  { id: "materiality", label: "Suggested Materiality" },
  { id: "alignment",   label: "Frameworks & Ratings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// SVG nav icons — consistent stroke weight, no emoji.
function TabIcon({ id, className }: { id: string; className?: string }) {
  if (id === "overview") return (
    <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="4.5" height="4.5" rx="1" />
      <rect x="8.5" y="2" width="4.5" height="4.5" rx="1" />
      <rect x="2" y="8.5" width="4.5" height="4.5" rx="1" />
      <rect x="8.5" y="8.5" width="4.5" height="4.5" rx="1" />
    </svg>
  );
  if (id === "checklist") return (
    <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1.5" width="11" height="12" rx="1.5" />
      <path d="M5 5.5h5M5 8h5M5 10.5h3" />
    </svg>
  );
  if (id === "materiality") return (
    <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="7.5" cy="6" r="1.5" />
      <circle cx="11" cy="3.5" r="1.5" />
      <circle cx="6" cy="12" r="1" />
      <circle cx="11.5" cy="8.5" r="1" />
    </svg>
  );
  if (id === "framework" || id === "alignment") return (
    <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="2.5" cy="7.5" r="1.5" />
      <circle cx="12.5" cy="3" r="1.5" />
      <circle cx="12.5" cy="12" r="1.5" />
      <path d="M4 7.5l7-4M4 7.5l7 4" />
    </svg>
  );
  return null;
}

export default function ReportView({ report, onBack }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const industryLabel = INDUSTRY_LABELS[report.industry as IndustryType] || report.industry;

  return (
    <div className="anim-up-sm w-full">
      <div className="flex flex-col lg:flex-row lg:gap-6 lg:items-start">

        {/* ── Left rail — client context + workspace nav ─────────────────── */}
        <aside className="lg:w-[220px] flex-shrink-0 mb-5 lg:mb-0">
          <div className="lg:sticky lg:top-[72px] space-y-5">

            <button
              onClick={onBack}
              className="no-print inline-flex items-center gap-1.5 text-[13px] text-stone-400
                hover:text-stone-700 transition-colors pressable"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              New report
            </button>

            {/* Client identity — prints at the top of the PDF */}
            <div>
              <h2 className="font-display text-[22px] font-normal text-stone-900 leading-tight tracking-tight">
                {report.companyName || "Your Client"}
              </h2>
              <p className="text-[13px] text-stone-500 mt-0.5">{industryLabel} · BRSR Readiness</p>
            </div>

            {/* Workspace nav */}
            <nav role="tablist" aria-label="Report sections"
              className="no-print flex lg:flex-col gap-1 overflow-x-auto pb-1 -mx-1 px-1">
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium
                      flex-shrink-0 whitespace-nowrap transition-colors pressable
                      ${active ? "bg-forest text-white" : "text-stone-600 hover:bg-stone-100"}`}
                  >
                    <TabIcon id={tab.id} className={`flex-shrink-0 ${active ? "text-white" : "text-stone-400"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center justify-center gap-2 w-full text-[13px] font-medium
                text-stone-600 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50
                px-3.5 py-2 rounded-lg pressable transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" aria-hidden="true" />
              </svg>
              Save as PDF
            </button>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div key={activeTab} role="tabpanel" id={`${activeTab}-panel`} className="tab-fade">
            {activeTab === "overview" && (
              <Overview report={report} onGoToPlan={() => setActiveTab("checklist")} onBack={onBack} />
            )}
            {activeTab === "checklist"   && <DataChecklist items={report.checklist} />}
            {activeTab === "materiality" && <MaterialityMatrix topics={report.materialityTopics} />}
            {activeTab === "alignment"   && <AlignmentWorkspace mappings={report.frameworkMappings} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Overview — the report's dashboard, mapped to our data (no dummy data) ────
function Overview({
  report, onGoToPlan, onBack,
}: {
  report: ReportOutput;
  onGoToPlan: () => void;
  onBack: () => void;
}) {
  const { alreadyTracked, partiallyTracked, newDataNeeded, notApplicable, totalDataPoints } = report.summary;
  const applicableFields = totalDataPoints - notApplicable;
  const noFilings = alreadyTracked + partiallyTracked === 0;
  const filings = report.selectedFilings.filter(f => f !== "none");

  const stats = [
    { n: alreadyTracked,   label: "Ready to pull",      sub: "In existing filings",   dot: "bg-emerald-500", num: alreadyTracked > 0 ? "text-emerald-600" : "text-stone-300" },
    { n: partiallyTracked, label: "Needs verification", sub: "One piece missing",     dot: "bg-amber-400",   num: partiallyTracked > 0 ? "text-amber-600"  : "text-stone-300" },
    { n: newDataNeeded,    label: "Collect fresh",      sub: "Not in any filing",     dot: "bg-stone-400",   num: "text-stone-700" },
    { n: applicableFields, label: "Total to report",    sub: `of ${totalDataPoints} disclosures`, dot: "bg-slate-300", num: "text-stone-700" },
  ];

  return (
    <div className="space-y-4">

      {/* Title + filing source */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-[24px] font-normal text-stone-900 leading-tight tracking-tight">
            Readiness overview
          </h1>
          <p className="text-[13px] text-stone-500 mt-1 max-w-[64ch] leading-relaxed">
            SEBI&apos;s BRSR framework requires{" "}
            <strong className="font-semibold text-stone-700">{report.companyName || "this company"}</strong>{" "}
            to report on <span className="font-semibold text-stone-700">{applicableFields} disclosure fields</span>{" "}
            across 9 business responsibility principles
            {notApplicable > 0 && <> — {notApplicable} manufacturing-only marked <span className="font-medium text-slate-500">Not applicable</span></>}.
          </p>
        </div>
        {!noFilings && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-stone-400">Based on:</span>
            {filings.map(f => (
              <span key={f} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
                bg-white text-stone-600 border border-stone-200">
                {FILING_LABELS[f as ExistingFiling]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
            <p className={`text-[2.25rem] font-semibold leading-none tabular-nums ${s.num}`}>{s.n}</p>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-stone-700 mt-2.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
              {s.label}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Status bar + where-to-start, in one summary card */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)] space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-2.5">
            All {totalDataPoints} disclosures by status
          </p>
          <div className="flex items-stretch gap-1 h-3">
            {alreadyTracked > 0 &&
              <div className="bg-emerald-500 rounded-full min-w-[10px]" style={{ flexGrow: alreadyTracked }} title={`Ready to pull: ${alreadyTracked}`} />}
            {partiallyTracked > 0 &&
              <div className="bg-amber-400 rounded-full min-w-[10px]" style={{ flexGrow: partiallyTracked }} title={`Needs verification: ${partiallyTracked}`} />}
            {newDataNeeded > 0 &&
              <div className="bg-stone-300 rounded-full min-w-[10px]" style={{ flexGrow: newDataNeeded }} title={`Collect fresh: ${newDataNeeded}`} />}
            {notApplicable > 0 &&
              <div className="bg-slate-300 rounded-full min-w-[10px]" style={{ flexGrow: notApplicable }} title={`Not applicable: ${notApplicable}`} />}
          </div>
        </div>

        {noFilings ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-[13px] text-amber-800 leading-relaxed">
              No compliance filings selected — all {newDataNeeded} fields show as &quot;Collect fresh.&quot; Most companies
              already cover 15–25 of these in PCB consents, EPR registrations, or PAT certificates.
            </p>
            <button onClick={onBack}
              className="no-print mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-900 underline underline-offset-2 pressable">
              <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Add their filings
            </button>
          </div>
        ) : (
          <p className="text-[13px] text-stone-600 leading-relaxed">
            <span className="font-semibold text-stone-700">Where to start:</span>{" "}
            {alreadyTracked > 0
              ? <>Open <button onClick={onGoToPlan} className="font-semibold text-brand-700 hover:underline pressable">Action Plan</button>{" "}
                  and filter by <span className="font-medium text-emerald-700">Ready to pull</span> — send those document requests today.
                  Then verify the partial fields, and tackle Collect fresh last.</>
              : <>Open <button onClick={onGoToPlan} className="font-semibold text-brand-700 hover:underline pressable">Action Plan</button>,{" "}
                  clear the Needs verification fields first, then work through Collect fresh by topic.</>
            }
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Alignment workspace — Reporting frameworks + ESG ratings, in one tab ─────
// Replaces the two stacked accordions (PRODUCT.md §4): one consistent nav model,
// ratings is a peer of frameworks instead of buried below a long table.
function AlignmentWorkspace({ mappings }: { mappings: FrameworkMapping[] }) {
  const withGRI  = mappings.filter(m => m.gri_standard   && m.gri_standard   !== "—").length;
  const withTCFD = mappings.filter(m => m.tcfd_pillar     && m.tcfd_pillar    !== "—").length;
  const withIFRS = mappings.filter(m => m.ifrs_reference  && m.ifrs_reference !== "—").length;

  return (
    <div className="space-y-5">

      {/* Reporting frameworks — GRI / TCFD / IFRS */}
      <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-[15px] font-semibold text-stone-800">Reporting frameworks</h3>
            <p className="text-[13px] text-stone-500 mt-0.5 leading-relaxed">
              How each BRSR disclosure maps to GRI, TCFD, and IFRS S1/S2 — collect once, report across all of them.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              GRI {withGRI}
            </span>
            <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              TCFD {withTCFD}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              IFRS {withIFRS}
            </span>
          </div>
        </div>
        <div className="p-5">
          <FrameworkMapper mappings={mappings} />
        </div>
      </section>

      {/* ESG ratings alignment — MSCI / DJSI */}
      <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-[15px] font-semibold text-stone-800">ESG ratings alignment</h3>
            <p className="text-[13px] text-stone-500 mt-0.5 leading-relaxed">
              How this same BRSR data feeds your client&apos;s MSCI ESG Rating and S&amp;P CSA / DJSI submission.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              MSCI
            </span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              DJSI
            </span>
          </div>
        </div>
        <div className="p-5">
          <EsgRatingsMapper />
        </div>
      </section>

    </div>
  );
}
