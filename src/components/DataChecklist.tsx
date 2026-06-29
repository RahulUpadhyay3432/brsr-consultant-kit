"use client";

import { useState } from "react";
import type { ChecklistItem, SectionDisclosure } from "@/lib/types";
import type { DisclosureMatch } from "@/lib/report-extractor";
import { PRINCIPLES, STATUS_META, SEBI_BRSR_FORMAT_URL, type StatusKey, type TypeKey } from "./checklist/constants";
import { useChecklistState } from "./checklist/useChecklistState";
import UploadCard from "./checklist/UploadCard";
import PrincipleSection from "./checklist/PrincipleSection";
import { downloadCsv, exportFilename } from "@/lib/export";

type GeneralDisclosures = { sectionA: SectionDisclosure[]; sectionB: SectionDisclosure[] };

const EXPORT_STATUS_LABEL: Record<ChecklistItem["status"], string> = {
  already_tracked: "Ready to pull",
  partially_tracked: "Needs verification",
  new_data_needed: "Collect fresh",
  not_applicable: "Not applicable",
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function DataChecklist({ items, general, seedQuery, clientName }: { items: ChecklistItem[]; general: GeneralDisclosures; seedQuery?: string; clientName?: string }) {
  const c = useChecklistState(items, general, seedQuery);

  // Export the full BRSR action plan (Sections A, B and all of Section C) as a
  // working CSV the consultant can edit or hand to the client. Exports
  // everything, not just the filtered view, plus their collected / last-year flags.
  function exportChecklist() {
    const ab = (d: SectionDisclosure, section: string) =>
      [section, d.id, d.label, "", "", "", "", "", "", d.page ?? "",
        c.collectedIds.has(d.id) ? "Yes" : "", c.detectedSet.has(d.id) ? "Yes" : ""];
    const rows: (string | number)[][] = [
      ["Section", "Code", "Disclosure", "Indicator", "Status", "Pull from (filing)", "Missing / gap", "How to collect", "Unit", "SEBI ref", "Collected", "Found last year"],
      ...general.sectionA.map((d) => ab(d, "A")),
      ...general.sectionB.map((d) => ab(d, "B")),
      ...items.map((it) => [
        "C", it.id, it.label, it.indicator_type, EXPORT_STATUS_LABEL[it.status],
        it.source_filing ?? "", it.gap_note ?? "", it.measurement_guidance ?? "", it.unit ?? "", it.page ?? "",
        c.collectedIds.has(it.id) ? "Yes" : "", c.detectedSet.has(it.id) ? "Yes" : "",
      ]),
    ];
    downloadCsv(exportFilename("BRSR-action-plan", clientName), rows);
  }

  // Sections A & B are only relevant when no gap-analysis filter is narrowing
  // the view (they aren't part of the Section-C status/principle/type filters).
  const abVisible = c.statusFilter === "all" && c.principleFilter === "all" && c.typeFilter === "all";
  const essentialCount  = items.filter(i => i.indicator_type === "essential").length;
  const leadershipCount = items.filter(i => i.indicator_type === "leadership").length;

  // Segmented status filter, All / Ready / Verify / Collect (+ N/A when present).
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold text-stone-900 leading-tight tracking-tight">
            Action Plan
          </h1>
          <p className="text-[14px] text-stone-600 mt-1 max-w-[72ch] leading-relaxed">
            The full BRSR, Section A &amp; B entity disclosures, plus the {items.length} principle fields (Section C)
            with their gap status. Open a row for how to collect it, the SEBI source, and, for emissions, a calculator.
          </p>
        </div>
        <button
          onClick={exportChecklist}
          title="Download the full checklist as a CSV (opens in Excel)"
          className="no-print flex-shrink-0 inline-flex items-center gap-1.5 text-[12.5px] font-medium
            text-stone-600 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50
            px-3 py-1.5 rounded-lg pressable transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── Sections A & B, entity & governance disclosures ────────────────── */}
      {abVisible && (
        <GeneralDisclosuresCard
          general={general}
          search={c.search}
          collectedIds={c.collectedIds}
          onToggleCollected={c.toggleCollected}
          detectedMatches={c.detection?.matches ?? null}
          detectedSet={c.detectedSet}
          showOnlyDetected={c.showOnlyDetected}
        />
      )}

      {/* ── Upload last year's report, client-side, privacy-safe ───────────── */}
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
        <p className="text-[13px] text-stone-600">
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
              and pick your client&apos;s existing filings, the tool will mark fields already covered as &quot;Ready&quot; or &quot;Verify.&quot;
            </p>
          </div>
        </div>
      )}

      {/* ── Section C, principle-wise performance (the gap analysis) ───────── */}
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500 px-0.5 pt-1">
        Section C · Principle-wise performance
      </p>
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
        {/* Column header */}
        <div className="flex items-center bg-stone-100 px-4 py-2.5 gap-3 border-b border-stone-200">
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600">Disclosure</span>
          <span className="hidden md:block w-[90px] flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600 pl-1.5">Type</span>
          <span className="w-[120px] flex-shrink-0 text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-600 pl-1.5">Status</span>
        </div>

        {c.filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-stone-500 text-[13.5px] mb-2">No fields match your filters.</p>
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
              scope3Inputs={c.scope3Inputs}
              onScope3Change={c.setScope3Input}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Sections A & B, entity + governance disclosures (not gap-analysed) ──────
// Not gap-analysed (no filing overlaps to match against), but still *collected*
// work, so they carry a "mark collected" toggle and, for Section B policies,
// the same "Last year" detection as Section C.
interface ABProps {
  collectedIds: Set<string>;
  onToggleCollected: (id: string) => void;
  detectedMatches: Record<string, DisclosureMatch> | null;
  detectedSet: Set<string>;
  showOnlyDetected: boolean;
}

function GeneralDisclosuresCard({
  general, search, collectedIds, onToggleCollected, detectedMatches, detectedSet, showOnlyDetected,
}: { general: GeneralDisclosures; search: string } & ABProps) {
  const q = search.toLowerCase().trim();
  const filt = (arr: SectionDisclosure[]) => {
    let out = q ? arr.filter(d => d.label.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)) : arr;
    if (showOnlyDetected) out = out.filter(d => detectedSet.has(d.id));
    return out;
  };
  const a = filt(general.sectionA);
  const b = filt(general.sectionB);
  if ((q || showOnlyDetected) && a.length === 0 && b.length === 0) return null;

  const total = general.sectionA.length + general.sectionB.length;
  const allIds = [...general.sectionA, ...general.sectionB].map(d => d.id);
  const collectedCount = allIds.filter(id => collectedIds.has(id)).length;
  const detectedCount  = allIds.filter(id => detectedSet.has(id)).length;

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-stone-100 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-[15px] font-semibold text-stone-900">Sections A &amp; B · Entity &amp; governance disclosures</h3>
          <p className="text-[13px] text-stone-600 mt-0.5 leading-relaxed max-w-[70ch]">
            The {total} entity-level and policy disclosures every BRSR opens with, collected from the client&apos;s
            own records, not gap-analysed against filings.
          </p>
          {/* Progress, collected + last-year detection (policies recur year to year) */}
          <div className="flex items-center gap-3 mt-2 text-[11.5px]">
            <span className="inline-flex items-center gap-1.5 text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="tabular-nums font-semibold text-stone-700">{collectedCount}</span> of{" "}
              <span className="tabular-nums">{total}</span> collected
            </span>
            {detectedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-indigo-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="tabular-nums font-semibold">{detectedCount}</span> from last year
              </span>
            )}
          </div>
        </div>
        <a
          href={SEBI_BRSR_FORMAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-700 hover:text-brand-800 pressable flex-shrink-0 mt-0.5"
        >
          SEBI source
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <SectionBlock tag="A" title="Section A · General disclosures"
        hint="Pull from the client's MCA filings, annual report and HR records."
        items={a} forceOpen={!!q || showOnlyDetected}
        collectedIds={collectedIds} onToggleCollected={onToggleCollected}
        detectedMatches={detectedMatches} detectedSet={detectedSet} showOnlyDetected={showOnlyDetected} />
      <SectionBlock tag="B" title="Section B · Management & process"
        hint="From the client's board-approved policies and governance records."
        items={b} forceOpen={!!q || showOnlyDetected}
        collectedIds={collectedIds} onToggleCollected={onToggleCollected}
        detectedMatches={detectedMatches} detectedSet={detectedSet} showOnlyDetected={showOnlyDetected} />
    </div>
  );
}

function SectionBlock({
  tag, title, hint, items, forceOpen,
  collectedIds, onToggleCollected, detectedMatches, detectedSet,
}: {
  tag: string; title: string; hint: string; items: SectionDisclosure[]; forceOpen?: boolean;
} & ABProps) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  const showOpen = open || !!forceOpen;
  const collectedHere = items.filter(d => collectedIds.has(d.id)).length;

  return (
    <div className="border-t border-stone-100">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={showOpen}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-50 transition-colors text-left group pressable"
      >
        <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{tag}</span>
        <span className="text-[13px] font-semibold text-stone-700 group-hover:text-stone-900">{title}</span>
        <span className="ml-auto flex items-center gap-2.5">
          {collectedHere > 0 && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full tabular-nums">
              {collectedHere}/{items.length} done
            </span>
          )}
          <span className="text-[12px] text-stone-500 tabular-nums">{items.length} items</span>
          <svg aria-hidden="true"
            className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0 ${showOpen ? "" : "-rotate-90"}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${showOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="px-4 py-2 text-[13px] text-stone-600 bg-stone-50/70 border-y border-stone-100">
            <span className="font-medium text-stone-700">Where to collect:</span> {hint}
          </p>
          {items.map((d, i) => (
            <ABRow
              key={d.id}
              d={d}
              isOdd={!!(i % 2)}
              isCollected={collectedIds.has(d.id)}
              onToggleCollected={() => onToggleCollected(d.id)}
              detectedMatch={detectedSet.has(d.id) ? detectedMatches?.[d.id] ?? null : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// A single Section A/B row: label + ID, an optional "Last year" badge with the
// matched snippet, and a collect checkbox. No gap status (these aren't analysed).
function ABRow({
  d, isOdd, isCollected, onToggleCollected, detectedMatch,
}: {
  d: SectionDisclosure;
  isOdd: boolean;
  isCollected: boolean;
  onToggleCollected: () => void;
  detectedMatch: DisclosureMatch | null;
}) {
  return (
    <div className={`flex items-start gap-3 px-4 py-2.5 border-b border-stone-100 last:border-b-0
      ${isCollected ? "bg-stone-100/50" : isOdd ? "bg-stone-50/40" : ""}`}>
      <span className="text-[11px] font-bold font-mono text-stone-500 flex-shrink-0 w-[82px] pt-1">{d.id}</span>

      <div className="flex-1 min-w-0">
        <span className={`text-[13px] leading-relaxed ${isCollected ? "line-through text-stone-400" : "text-stone-700"}`}>
          {d.label}
        </span>
        {detectedMatch && !isCollected && (
          <div className="mt-1.5">
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700
              bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full leading-none align-middle">
              <svg className="w-2.5 h-2.5" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M7.5 4v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7.5" cy="7.5" r="5.5" />
              </svg>
              Last year
            </span>
            <span className="text-[12px] text-stone-600 italic ml-2">
              matched “{detectedMatch.keywords[0]}”, verify it&apos;s still current.
            </span>
          </div>
        )}
      </div>

      {d.page != null && (
        <span className="hidden sm:block text-[11px] text-stone-500 flex-shrink-0 whitespace-nowrap pt-1">
          {typeof d.page === "number" ? `ICAI p.${d.page}` : d.page}
        </span>
      )}

      {/* Collect toggle */}
      <button
        onClick={onToggleCollected}
        aria-pressed={isCollected}
        title={isCollected ? "Marked collected, click to undo" : "Mark as collected"}
        className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold
          pressable transition-colors ${
            isCollected
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-white border border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50"
          }`}
      >
        {isCollected ? (
          <>
            <svg key={`ab-${d.id}-on`} aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path className="check-path" d="M5 13l4 4L19 7" />
            </svg>
            <span className="hidden sm:inline">Collected</span>
          </>
        ) : (
          <>
            <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <circle cx="12" cy="12" r="9" />
            </svg>
            <span className="hidden sm:inline">Collect</span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── Styled native select, keeps keyboard/native behavior, custom chrome ─────
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
