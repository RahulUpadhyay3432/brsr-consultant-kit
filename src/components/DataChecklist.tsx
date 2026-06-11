"use client";

import type { ChecklistItem } from "@/lib/types";
import { PRINCIPLES, STATUS_META, type StatusKey, type TypeKey } from "./checklist/constants";
import { useChecklistState } from "./checklist/useChecklistState";
import UploadCard from "./checklist/UploadCard";
import PrincipleSection from "./checklist/PrincipleSection";

// ─── Main component ────────────────────────────────────────────────────────────
export default function DataChecklist({ items, seedQuery }: { items: ChecklistItem[]; seedQuery?: string }) {
  const c = useChecklistState(items, seedQuery);
  const essentialCount  = items.filter(i => i.indicator_type === "essential").length;
  const leadershipCount = items.filter(i => i.indicator_type === "leadership").length;

  // Segmented status filter — All / Ready / Verify / Collect (+ N/A when present).
  const statusTabs: { key: StatusKey | "all"; label: string; count: number; dot: string | null }[] = [
    { key: "all",               label: "All",                              count: c.statusCounts.all,               dot: null },
    { key: "already_tracked",   label: STATUS_META.already_tracked.short,  count: c.statusCounts.already_tracked,   dot: STATUS_META.already_tracked.dot },
    { key: "partially_tracked", label: STATUS_META.partially_tracked.short,count: c.statusCounts.partially_tracked, dot: STATUS_META.partially_tracked.dot },
    { key: "new_data_needed",   label: STATUS_META.new_data_needed.short,  count: c.statusCounts.new_data_needed,   dot: STATUS_META.new_data_needed.dot },
    ...(c.statusCounts.not_applicable > 0
      ? [{ key: "not_applicable" as const, label: STATUS_META.not_applicable.short, count: c.statusCounts.not_applicable, dot: STATUS_META.not_applicable.dot }]
      : []),
  ];

  const noFilings = c.statusCounts.already_tracked === 0 && c.statusCounts.partially_tracked === 0;

  return (
    <div className="space-y-4">

      {/* ── Title ───────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-[24px] font-normal text-stone-900 leading-tight tracking-tight">
          Action Plan
        </h1>
        <p className="text-[13px] text-stone-500 mt-1 max-w-[72ch] leading-relaxed">
          All {items.length} BRSR disclosure fields with their gap status. Open a row for how to collect it,
          the SEBI source, and — for emissions — an audit-ready calculator.
        </p>
      </div>

      {/* ── Upload last year's report — client-side, privacy-safe ───────────── */}
      <UploadCard
        fileInputRef={c.fileInputRef}
        uploadStatus={c.uploadStatus}
        uploadInfo={c.uploadInfo}
        uploadError={c.uploadError}
        detectedInReport={c.detectedInReport}
        showOnlyDetected={c.showOnlyDetected}
        onFile={c.handleFile}
        onToggleShowOnlyDetected={() => c.setShowOnlyDetected(v => !v)}
        onMarkAllDetected={c.markAllDetectedCollected}
        onClear={c.clearUpload}
      />

      {/* ── Filter toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">

        {/* Segmented status tabs */}
        <div className="inline-flex items-center gap-0.5 p-0.5 bg-stone-100/80 rounded-lg border border-stone-200/60 self-start overflow-x-auto max-w-full">
          {statusTabs.map(t => {
            const active = c.statusFilter === t.key;
            const dimmed = t.key !== "all" && t.count === 0;
            return (
              <button
                key={t.key}
                disabled={dimmed}
                onClick={() => c.setStatusFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium
                  whitespace-nowrap flex-shrink-0 transition-colors pressable
                  ${active ? "bg-white text-stone-800 shadow-sm"
                    : dimmed ? "text-stone-300 cursor-not-allowed"
                    : "text-stone-500 hover:text-stone-700"}`}
              >
                {t.dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.dot}`} />}
                {t.label}
                <span className={`tabular-nums text-[11px] ${active ? "text-stone-400" : dimmed ? "text-stone-300" : "text-stone-400"}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:flex-none sm:w-[220px] min-w-[160px]">
            <svg aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search fields…"
              value={c.search}
              onChange={e => c.setSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-7 text-[13px] border border-stone-200 rounded-lg bg-white shadow-sm
                focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100
                transition-colors placeholder:text-stone-400"
            />
            {c.search && (
              <button onClick={() => c.setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500">
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <SelectFilter
            value={c.principleFilter}
            onChange={c.setPrincipleFilter}
            options={[
              { value: "all", label: "All principles" },
              ...Object.entries(PRINCIPLES).map(([key, info]) => ({
                value: key,
                label: `${key} · ${info.name}`,
              })),
            ]}
          />

          <SelectFilter
            value={c.typeFilter}
            onChange={v => c.setTypeFilter(v as TypeKey)}
            options={[
              { value: "all",        label: "All indicators" },
              { value: "essential",  label: `Essential (${essentialCount})` },
              { value: "leadership", label: `Leadership (${leadershipCount})` },
            ]}
          />
        </div>
      </div>

      {/* ── Result count + hide-collected ───────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[13px] text-stone-500">
          Showing <span className="font-semibold text-stone-700 tabular-nums">{c.filtered.length}</span>{" "}
          of <span className="font-semibold text-stone-700 tabular-nums">{items.length}</span> fields
        </p>
        {c.collectedIds.size > 0 && (
          <button
            onClick={() => c.setHideCollected(v => !v)}
            className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium border
              transition-colors pressable ${
                c.hideCollected
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
          >
            <svg aria-hidden="true" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {c.hideCollected ? "Showing all" : "Hide collected"}
            <span className={`tabular-nums ${c.hideCollected ? "text-white/80" : "text-emerald-600"}`}>
              ({c.collectedIds.size})
            </span>
          </button>
        )}
      </div>

      {/* ── No-filings hint ─────────────────────────────────────────────────── */}
      {noFilings && c.statusFilter === "all" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2a4 4 0 0 1 2.83 6.83L10 10H6l-.83-1.17A4 4 0 0 1 8 2z" />
            <path d="M6 10v1a2 2 0 0 0 4 0v-1" />
          </svg>
          <div>
            <p className="text-[13px] font-semibold text-amber-800">Everything showing as &quot;Collect fresh&quot;</p>
            <p className="text-[12px] text-amber-700 mt-0.5 leading-relaxed">
              No compliance filings were selected. Click <span className="font-semibold">New report</span>{" "}
              and pick your client&apos;s existing filings — the tool will mark fields already covered as &quot;Ready&quot; or &quot;Verify.&quot;
            </p>
          </div>
        </div>
      )}

      {/* ── Sections ────────────────────────────────────────────────────────── */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
        {/* Column header */}
        <div className="flex items-center bg-stone-100 px-4 py-2.5 gap-3 border-b border-stone-200">
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600">Disclosure</span>
          <span className="hidden md:block w-[90px] flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600 pl-1.5">Type</span>
          <span className="w-[120px] flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600 pl-1.5">Status</span>
        </div>

        {c.filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-stone-400 text-sm mb-2">No fields match your filters.</p>
            <button onClick={c.clearFilters} className="text-xs text-brand-700 hover:underline font-medium">
              Clear all filters
            </button>
          </div>
        ) : (
          c.principleKeys.map((principle, idx) => (
            <PrincipleSection
              key={principle}
              principle={principle}
              items={c.grouped[principle]}
              expandedId={c.expandedId}
              onToggle={c.toggleExpanded}
              isFirst={idx === 0}
              collapsed={c.collapsedSections.has(principle)}
              onCollapse={() => c.toggleSection(principle)}
              collectedIds={c.collectedIds}
              onToggleCollected={c.toggleCollected}
              matches={c.detection?.matches ?? null}
              calcInputs={c.calcInputs}
              onCalcChange={c.setCalcInput}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Styled native select — keeps keyboard/native behavior, custom chrome ─────
function SelectFilter({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none h-9 pl-3 pr-8 text-[13px] font-medium text-stone-700 bg-white
          border border-stone-200 rounded-lg shadow-sm cursor-pointer
          focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg aria-hidden="true" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
