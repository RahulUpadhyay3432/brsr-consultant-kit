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
  {
    id: "checklist",
    label: "Action Plan",
    hint: "All 108 BRSR disclosure fields your client must report — with status showing what's already documented in their compliance filings vs what needs to be collected fresh.",
  },
  {
    id: "materiality",
    label: "Suggested Materiality",
    hint: "A suggested shortlist of material ESG topics for your client's industry — a starting point for the stakeholder-driven materiality process, not a finished assessment.",
  },
] as const;

// SVG tab icons — no emojis, consistent stroke weight
function TabIcon({ id, className }: { id: string; className?: string }) {
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
  if (id === "framework") return (
    <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="2.5" cy="7.5" r="1.5" />
      <circle cx="12.5" cy="3" r="1.5" />
      <circle cx="12.5" cy="12" r="1.5" />
      <path d="M4 7.5l7-4M4 7.5l7 4" />
    </svg>
  );
  return null;
}

type TabId = (typeof TABS)[number]["id"];

// TOUR_STEPS removed — content is now inline in the header card

export default function ReportView({ report, onBack }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("checklist");

  const industryLabel = INDUSTRY_LABELS[report.industry as IndustryType] || report.industry;
  const { alreadyTracked, partiallyTracked, newDataNeeded, notApplicable, totalDataPoints } = report.summary;
  const alreadySourced = alreadyTracked + partiallyTracked;
  const noFilings = alreadySourced === 0;
  const applicableFields = totalDataPoints - notApplicable;

  return (
    <div className="space-y-5 w-full">

      {/* ── Back link + Export PDF — enters first ────────────────────────── */}
      <div className="flex items-center justify-between no-print anim-up-sm" style={{ animationDelay: "0ms" }}>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-stone-400
            hover:text-stone-700 transition-colors pressable"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New report
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600
            bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50
            px-4 py-2 rounded-full pressable transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" aria-hidden="true" />
          </svg>
          Save as PDF
        </button>
      </div>

      {/* ── Report header card — hero element, card reveal ──────────────── */}
      <div className="anim-card bg-white rounded-xl border border-stone-200 overflow-hidden" style={{ animationDelay: "60ms" }}>

        {/* ── 1. Client identity ───────────────────────────────────────────── */}
        <div className="px-6 pt-5 pb-4">
          <h2 className="font-display text-xl font-light text-stone-900 tracking-tight">
            {report.companyName || "Your Client"}
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            {industryLabel} · BRSR Readiness Assessment
          </p>
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            SEBI's BRSR framework requires{" "}
            <strong className="text-stone-700">
              {report.companyName || "this company"}
            </strong>{" "}
            to report on{" "}
            <span className="font-semibold text-stone-700">{applicableFields} disclosure fields</span>{" "}
            across 9 business responsibility principles
            {notApplicable > 0 && (
              <> — we marked <span className="font-semibold text-slate-500">{notApplicable}</span> manufacturing-only
              disclosures <span className="font-medium text-slate-500">Not applicable</span> for this service-sector client</>
            )}.
          </p>
        </div>

        {/* ── 2. Gap Analysis ──────────────────────────────────────────────── */}
        <div className="border-t border-stone-200 bg-stone-50/60">

          {/* Section header row */}
          <div className="px-6 py-3 border-b border-stone-200">
            {/* Single header row: label left, filing chips right */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em]">
                Gap Analysis
              </span>

              {noFilings ? (
                <span className="text-xs font-medium text-amber-700">
                  No filings selected — {newDataNeeded} fields showing as collect fresh
                </span>
              ) : (
                /* Filing chips sit inline on the right — source of the numbers below */
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className="text-[10px] text-stone-400">Based on:</span>
                  {report.selectedFilings
                    .filter(f => f !== "none")
                    .map(f => (
                      <span
                        key={f}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                          bg-stone-100 text-stone-600 border border-stone-200"
                      >
                        {FILING_LABELS[f as ExistingFiling]}
                      </span>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* 3 stat columns */}
          <div className="grid grid-cols-3 divide-x divide-stone-200">
            <div className="px-5 py-4">
              <p className={`text-3xl font-semibold leading-none tabular-nums
                ${alreadyTracked > 0 ? "text-emerald-600" : "text-stone-300"}`}>
                {alreadyTracked}
              </p>
              <p className="text-sm font-medium text-stone-700 mt-2">Ready to pull</p>
              <p className="text-xs text-stone-500 mt-1 leading-snug">
                Already in their existing compliance reports.
              </p>
            </div>
            <div className="px-5 py-4">
              <p className={`text-3xl font-semibold leading-none tabular-nums
                ${partiallyTracked > 0 ? "text-amber-600" : "text-stone-300"}`}>
                {partiallyTracked}
              </p>
              <p className="text-sm font-medium text-stone-700 mt-2">Needs verification</p>
              <p className="text-xs text-stone-500 mt-1 leading-snug">
                Partially covered — one missing piece each.
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-3xl font-semibold leading-none tabular-nums text-stone-700">
                {newDataNeeded}
              </p>
              <p className="text-sm font-medium text-stone-700 mt-2">Collect fresh</p>
              <p className="text-xs text-stone-500 mt-1 leading-snug">
                Not in any existing filing.
              </p>
            </div>
          </div>

          {/* Not-applicable strip — service-sector clients skip manufacturing-only fields */}
          {notApplicable > 0 && (
            <div className="px-6 py-2.5 border-t border-stone-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
              <p className="text-xs text-stone-500 leading-snug">
                <span className="font-semibold text-slate-500 tabular-nums">{notApplicable}</span>{" "}
                manufacturing-only disclosures marked{" "}
                <span className="font-medium text-slate-500">Not applicable</span>{" "}
                for this service-sector client — open the Action Plan and filter by{" "}
                <span className="font-medium">Not applicable</span> to review them.
              </p>
            </div>
          )}

          {/* Amber alert — shown below columns when no filings selected */}
          {noFilings && (
            <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                Most companies already document 15–25 of these fields in PCB consents, EPR registrations,
                or PAT certificates. Go back and add their filings — this tool will automatically find
                which BRSR fields are already covered.
              </p>
              <button
                onClick={onBack}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold
                  text-amber-900 underline underline-offset-2 pressable"
              >
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go back and add compliance filings
              </button>
            </div>
          )}
        </div>

        {/* ── 3. Where to start ────────────────────────────────────────────── */}
        <div className="px-6 py-3.5 border-t border-stone-200">
          <p className="text-xs text-stone-600 leading-relaxed">
            <span className="font-semibold text-stone-700">Where to start:</span>{" "}
            {noFilings
              ? <>Add compliance filings first to reduce the "Collect fresh" count. Then open the <span className="font-semibold">Action Plan</span> tab below.</>
              : alreadyTracked > 0
              ? <>Open the <span className="font-semibold">Action Plan</span> tab and filter by <span className="font-medium text-emerald-700">"Ready to pull"</span> — send those document requests today. Then verify the partial fields, and tackle "Collect fresh" last.</>
              : <>Open the <span className="font-semibold">Action Plan</span> tab, filter by "Needs verification" first, then work through "Collect fresh" by topic.</>
            }
          </p>
        </div>
      </div>

      {/* ── What's in this report — 2 output cards ──────────────────────── */}
      <div role="tablist" aria-label="Report outputs" className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print anim-up-md" style={{ animationDelay: "160ms" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            onClick={() => setActiveTab(tab.id)}
            className={`text-left p-4 rounded-xl border pressable transition-all duration-150
              ${activeTab === tab.id
                ? "bg-white border-brand-300 shadow-sm ring-1 ring-brand-200"
                : "bg-white border-stone-200 hover:border-stone-300"
              }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <TabIcon id={tab.id} className={`flex-shrink-0 ${activeTab === tab.id ? "text-brand-700" : "text-stone-400"}`} />
              <span className={`text-sm font-semibold ${activeTab === tab.id ? "text-brand-800" : "text-stone-700"}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <span className="ml-auto text-[10px] font-medium text-brand-800 bg-brand-50 px-1.5 py-0.5 rounded-full">
                  Viewing
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 leading-snug">{tab.hint}</p>
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <div key={activeTab} role="tabpanel" id={`${activeTab}-panel`} className="tab-fade">
        {activeTab === "checklist"   && <DataChecklist items={report.checklist} />}
        {activeTab === "materiality" && <MaterialityMatrix topics={report.materialityTopics} />}
      </div>

      {/* ── Advanced: International Framework Mapping ─────────────────────── */}
      <AdvancedFrameworks mappings={report.frameworkMappings} />

      {/* ── Advanced: ESG Ratings Alignment (MSCI & DJSI) ────────────────── */}
      <EsgRatingsSection />

      {/* ── Save as PDF CTA — bottom of report, before the page footer ───── */}
      <div className="mt-6 bg-forest rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <p className="text-sm font-semibold text-white">Ready to share with your client?</p>
          <p className="text-xs text-white/70 mt-0.5">
            Save this report as a PDF and send it to your client as their BRSR readiness briefing.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5
            bg-white text-forest text-sm font-semibold rounded-full
            hover:bg-stone-100 pressable transition-colors shadow-sm"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Save as PDF
        </button>
      </div>
    </div>
  );
}

// ─── Advanced: International Framework Mapping ────────────────────────────────
function AdvancedFrameworks({ mappings }: { mappings: FrameworkMapping[] }) {
  const [open, setOpen] = useState(true); // open by default — consultants with international clients need this

  const withGRI  = mappings.filter(m => m.gri_standard   && m.gri_standard   !== "—").length;
  const withTCFD = mappings.filter(m => m.tcfd_pillar     && m.tcfd_pillar    !== "—").length;
  const withIFRS = mappings.filter(m => m.ifrs_reference  && m.ifrs_reference !== "—").length;

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden no-print">
      {/* Collapsed header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4
          bg-white hover:bg-stone-50 transition-colors text-left pressable"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-stone-700">
            International Framework Mapping
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            Only relevant if your client reports to GRI, TCFD, or IFRS S1/S2
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Framework counts — hint at what's inside */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              GRI {withGRI}
            </span>
            <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              TCFD {withTCFD}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              IFRS {withIFRS}
            </span>
          </div>
          <svg
            aria-hidden="true"
            className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300
          ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="min-h-0">
          <div className="border-t border-stone-100 p-5">
            <FrameworkMapper mappings={mappings} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Advanced: ESG Ratings Alignment (MSCI & DJSI) ────────────────────────────
function EsgRatingsSection() {
  const [open, setOpen] = useState(false); // closed by default — keeps the report scannable

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden no-print">
      {/* Collapsed header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4
          bg-white hover:bg-stone-50 transition-colors text-left pressable"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-stone-700">
            ESG Ratings Alignment — MSCI &amp; DJSI
          </p>
          <p className="text-xs text-stone-400 mt-0.5">
            See how this BRSR data also feeds your client's MSCI ESG Rating and S&amp;P CSA / DJSI submission
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              MSCI
            </span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              DJSI
            </span>
          </div>
          <svg
            aria-hidden="true"
            className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300
          ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="min-h-0">
          <div className="border-t border-stone-100 p-5">
            <EsgRatingsMapper />
          </div>
        </div>
      </div>
    </div>
  );
}
