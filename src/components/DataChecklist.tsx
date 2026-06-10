"use client";

import type { ChecklistItem } from "@/lib/types";
import { PRINCIPLES, STATUS_META, type StatusKey, type TypeKey } from "./checklist/constants";
import { useChecklistState } from "./checklist/useChecklistState";
import NavItem from "./checklist/NavItem";
import UploadCard from "./checklist/UploadCard";
import PrincipleSection from "./checklist/PrincipleSection";

// ─── Main component ────────────────────────────────────────────────────────────
export default function DataChecklist({ items }: { items: ChecklistItem[] }) {
  const c = useChecklistState(items);
  const essentialCount  = items.filter(i => i.indicator_type === "essential").length;
  const leadershipCount = items.filter(i => i.indicator_type === "leadership").length;

  return (
    <div className="space-y-4">

    {/* ── How to use this list — concise orientation ────────────────────── */}
    <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-white rounded-lg border border-brand-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-brand-700" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="1.5" width="11" height="12" rx="1.5" />
            <path d="M5 5.5h5M5 8h5M5 10.5h3" />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-stone-800">How to use this list</h3>
          <p className="text-[13px] text-stone-500 mt-0.5 leading-relaxed">
            All {items.length} BRSR fields, pre-checked against your client's filings. Expand any row for how to collect it, then <span className="font-medium text-stone-600">Mark as collected</span> to track progress.
          </p>
        </div>
      </div>
    </div>

    {/* ── Upload last year's report — client-side, privacy-safe ─────────── */}
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

    {/* ── Checklist ─────────────────────────────────────────────────────── */}
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
    <div className="flex flex-col md:flex-row md:min-h-[640px]">

      {/* ══ LEFT SIDEBAR ════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex w-[240px] flex-shrink-0 border-r border-stone-200 flex-col">

        {/* Context header */}
        <div className="px-4 pt-4 pb-3 border-b border-stone-100">
          <p className="text-xs font-semibold text-stone-700 leading-snug">
            {items.length} disclosure requirements
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
            Filter by status or topic below
          </p>
          {c.collectedIds.size > 0 && (
            <p className="text-[10px] text-emerald-700 font-medium mt-1">
              {c.collectedIds.size} marked as collected
            </p>
          )}
        </div>

        {/* Status filter */}
        <div className="px-3 pt-3 pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 px-2 mb-1.5">
            Filter by status
          </p>
          <NavItem
            label="All disclosures"
            count={c.statusCounts.all}
            active={c.statusFilter === "all" && c.principleFilter === "all"}
            onClick={() => { c.setStatusFilter("all"); c.setPrincipleFilter("all"); }}
          />
          {([
            "already_tracked",
            "partially_tracked",
            "new_data_needed",
            ...(c.statusCounts.not_applicable > 0 ? ["not_applicable" as const] : []),
          ] as StatusKey[]).map(s => (
            <NavItem
              key={s}
              dot={STATUS_META[s].dot}
              label={STATUS_META[s].label}
              count={c.statusCounts[s]}
              active={c.statusFilter === s}
              onClick={() => { c.setStatusFilter(s); c.setPrincipleFilter("all"); }}
              dimmed={c.statusCounts[s] === 0}
            />
          ))}
        </div>

        <div className="mx-3 border-t border-stone-100" />

        {/* Indicator type filter — desktop sidebar (mobile uses the top-bar pills) */}
        <div className="px-3 pt-3 pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 px-2 mb-1.5">
            Filter by indicator
          </p>
          <NavItem label="All types"  count={items.length}    active={c.typeFilter === "all"}        onClick={() => c.setTypeFilter("all")} />
          <NavItem label="Essential"  count={essentialCount}  active={c.typeFilter === "essential"}  onClick={() => c.setTypeFilter("essential")} />
          <NavItem label="Leadership" count={leadershipCount} active={c.typeFilter === "leadership"} onClick={() => c.setTypeFilter("leadership")} />
        </div>

        <div className="mx-3 border-t border-stone-100" />

        {/* Principle section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 px-1 mb-0.5">
              Filter by topic
            </p>
            <p className="text-[10px] text-stone-500 px-1 mb-2">
              BRSR's 9 business principles
            </p>
          </div>
          <div className="flex flex-col border-t border-stone-100">
            {Object.entries(PRINCIPLES).map(([key, info]) => {
              const count = c.principleCounts[key] ?? 0;
              const isActive = c.principleFilter === key;
              const isDimmed = count === 0;
              return (
                <button
                  key={key}
                  disabled={isDimmed && !isActive}
                  onClick={() => c.setPrincipleFilter(c.principleFilter === key ? "all" : key)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5
                    border-b border-stone-100 text-left transition-colors pressable
                    ${isActive
                      ? "bg-forest text-white"
                      : isDimmed
                      ? "text-stone-300 cursor-default"
                      : "hover:bg-stone-50"
                    }`}
                >
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className={`text-[10px] font-bold font-mono flex-shrink-0
                      ${isActive ? "text-white/70" : isDimmed ? "text-stone-300" : "text-stone-400"}`}>
                      {key}
                    </span>
                    <span className={`text-[12px] font-medium truncate
                      ${isActive ? "text-white" : isDimmed ? "text-stone-300" : "text-stone-700"}`}>
                      {info.name}
                    </span>
                  </div>
                  <span className={`text-[10px] tabular-nums flex-shrink-0 whitespace-nowrap
                    ${isActive ? "text-white/70" : isDimmed ? "text-stone-200" : "text-stone-400"}`}>
                    {count} <span className="text-[9px] opacity-70">fields</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ══ MAIN AREA ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile status chips */}
        <div className="md:hidden px-3 py-2.5 border-b border-stone-100">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
            {([
              "all", "already_tracked", "partially_tracked", "new_data_needed",
              ...(c.statusCounts.not_applicable > 0 ? ["not_applicable" as const] : []),
            ] as const).map((key) => {
              const meta = key === "all"
                ? { label: "All", count: c.statusCounts.all, dot: null }
                : key === "already_tracked"
                ? { label: "Ready to pull",       count: c.statusCounts.already_tracked,   dot: "bg-emerald-500" }
                : key === "partially_tracked"
                ? { label: "Needs verification",  count: c.statusCounts.partially_tracked, dot: "bg-amber-400"   }
                : key === "new_data_needed"
                ? { label: "Collect fresh",        count: c.statusCounts.new_data_needed,   dot: "bg-stone-400"   }
                : { label: "Not applicable",       count: c.statusCounts.not_applicable,    dot: "bg-slate-300"   };
              const isActive = key === "all"
                ? c.statusFilter === "all" && c.principleFilter === "all"
                : c.statusFilter === key;
              const isDimmed = key !== "all" && meta.count === 0;
              return (
                <button
                  key={key}
                  disabled={isDimmed}
                  onClick={() => {
                    if (key === "all") { c.setStatusFilter("all"); c.setPrincipleFilter("all"); }
                    else c.setStatusFilter(key);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 whitespace-nowrap
                    ${isActive
                      ? "bg-forest text-white border-forest"
                      : isDimmed
                      ? "text-stone-300 border-stone-100 cursor-default"
                      : "bg-white border-stone-200 text-stone-600"
                    }`}
                >
                  {meta.dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />}
                  {meta.label}
                  <span className={`tabular-nums text-[10px] ${isActive ? "text-white/70" : isDimmed ? "text-stone-300" : "text-stone-400"}`}>
                    {meta.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <div className="px-4 py-2.5 border-b border-stone-100 flex items-center gap-2 flex-wrap bg-white sticky top-0 z-20">
          {/* Search */}
          <div className="relative flex-shrink-0 w-full sm:w-auto sm:flex-1 max-w-xs">
            <svg aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search disclosures…"
              value={c.search}
              onChange={e => c.setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-md
                bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500
                transition-[border-color,box-shadow] placeholder:text-stone-400"
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

          {/* Type filter pills — mobile only; desktop uses the sidebar "Filter by indicator" */}
          <div className="md:hidden flex items-center border border-stone-200 rounded-md overflow-hidden divide-x divide-stone-200 flex-shrink-0">
            {(["all", "essential", "leadership"] as TypeKey[]).map(t => (
              <button
                key={t}
                onClick={() => c.setTypeFilter(t)}
                className={`px-2.5 py-1.5 text-xs font-medium chip-spring
                  ${c.typeFilter === t ? "bg-forest text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
              >
                {t === "all" ? "All" : t === "essential" ? "Essential" : "Leadership"}
              </button>
            ))}
          </div>

          {/* Hide collected toggle — only shown when some items are collected */}
          {c.collectedIds.size > 0 && (
            <button
              onClick={() => c.setHideCollected(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border flex-shrink-0
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

          {/* Result count */}
          <span className="text-xs text-stone-500 ml-auto tabular-nums flex-shrink-0">
            {c.filtered.length === items.length
              ? <><span className="font-medium">{items.length}</span> <span className="text-stone-400">disclosures</span></>
              : <><span className="font-medium">{c.filtered.length}</span> <span className="text-stone-400">of {items.length} shown</span></>
            }
          </span>
        </div>

        {/* No filings warning — above column headers */}
        {c.statusCounts.already_tracked === 0 && c.statusCounts.partially_tracked === 0 && c.statusFilter === "all" && (
          <div className="mx-4 mt-3 mb-0 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 2a4 4 0 0 1 2.83 6.83L10 10H6l-.83-1.17A4 4 0 0 1 8 2z" />
              <path d="M6 10v1a2 2 0 0 0 4 0v-1" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Everything showing as "Collect fresh"</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                No compliance filings were selected. Click{" "}
                <span className="font-semibold">← New report</span>{" "}
                and pick your client's existing filings — the tool will mark fields already covered as "Ready to pull" or "Needs verification."
              </p>
            </div>
          </div>
        )}

        {/* Table header */}
        <div className="flex items-center border-y border-stone-200 bg-stone-100 px-4 py-2.5 gap-3 mt-3">
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600">Disclosure</span>
          <span className="hidden md:block w-[90px] flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600 pl-1.5">Type</span>
          <span className="w-[145px] flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600 pl-1.5">Status</span>
        </div>

        {/* Table body */}
        <div className="flex-1 overflow-y-auto">
          {c.filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-stone-400 text-sm mb-2">No items match your filters.</p>
              <button onClick={c.clearFilters}
                className="text-xs text-teal-600 hover:underline font-medium">
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
    </div>
    </div>

    </div>
  );
}
