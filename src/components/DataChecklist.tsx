"use client";

import { useState, useMemo } from "react";
import type { ChecklistItem } from "@/lib/types";

// ─── Principle metadata ────────────────────────────────────────────────────────
const PRINCIPLES: Record<string, { name: string; color: string; bg: string; border: string }> = {
  P1: { name: "Ethics & Transparency",   color: "text-violet-700", bg: "bg-violet-50",  border: "border-violet-200" },
  P2: { name: "Products & Services",     color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200"   },
  P3: { name: "Employee Wellbeing",      color: "text-sky-700",    bg: "bg-sky-50",     border: "border-sky-200"    },
  P4: { name: "Stakeholder Engagement",  color: "text-teal-700",   bg: "bg-teal-50",    border: "border-teal-200"   },
  P5: { name: "Human Rights",            color: "text-rose-700",   bg: "bg-rose-50",    border: "border-rose-200"   },
  P6: { name: "Environment",             color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200"},
  P7: { name: "Policy & Advocacy",       color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200"  },
  P8: { name: "Inclusive Growth",        color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" },
  P9: { name: "Consumer Responsibility", color: "text-pink-700",   bg: "bg-pink-50",    border: "border-pink-200"   },
};

// ─── Status metadata ───────────────────────────────────────────────────────────
const STATUS_META = {
  already_tracked: {
    dot:   "bg-emerald-500",
    text:  "text-emerald-700",
    bg:    "bg-emerald-50",
    label: "Ready to pull",
    short: "Ready",
  },
  partially_tracked: {
    dot:   "bg-amber-400",
    text:  "text-amber-700",
    bg:    "bg-amber-50",
    label: "Needs verification",
    short: "Verify",
  },
  new_data_needed: {
    dot:   "bg-stone-400",
    text:  "text-stone-600",
    bg:    "bg-stone-50",
    label: "Collect fresh",
    short: "Collect",
  },
  not_applicable: {
    dot:   "bg-slate-300",
    text:  "text-slate-400",
    bg:    "bg-slate-50",
    label: "Not applicable",
    short: "N/A",
  },
} as const;

// Trim regulatory boilerplate so labels read naturally
function plain(label: string): string {
  const s = label
    .replace(/[\?.]?\s*[Ii]f yes[,.]?[\s\S]*/i, "")
    .replace(/\s*\(Yes\/No[^)]*\)/g, "")
    .replace(/^Does the entity have an?\s+/i, "")
    .replace(/^Whether the entity\s+/i, "")
    .replace(/^Provide details (of |related to |on )?/i, "")
    .replace(/^Details of /i, "")
    .replace(/^Describe the /i, "")
    .replace(/^Please provide details (of |on )?/i, "")
    .replace(/^Is the entity /i, "")
    // Strip leading sub-question marker e.g. "A. " "a. " "1. "
    .replace(/^[A-Za-z0-9]\.\s+/, "")
    // Split on em-dash, semicolon, or a new lettered sub-question "? b. "
    .split(/\s+[—–]\s+|\s*;\s+/)[0]
    .replace(/\?\s+[a-zA-Z]\.\s[\s\S]*/, "?")  // "...sourcing? b. Also..." → "...sourcing?"
    .trim()
    .replace(/\s+/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── SEBI source references ──────────────────────────────────────────────────
// SEBI does not publish per-field deep links — every Section-C principle
// disclosure is defined in one canonical document: the updated BRSR Format
// (Annexure II, Jul 2023). We link there and cite the ICAI Background Material
// page (already in the data) for true per-field granularity.
const SEBI_BRSR_FORMAT_URL =
  "https://www.sebi.gov.in/sebi_data/commondocs/jul-2023/Annexure_II-Updated-BRSR_p.PDF";

// Map "P6" → "6" for a principle-specific link label
function principleNumber(principle: string): string {
  return principle.replace(/^P/i, "");
}

type StatusKey = keyof typeof STATUS_META;
type TypeKey   = "all" | "essential" | "leadership";

// ─── Main component ────────────────────────────────────────────────────────────
export default function DataChecklist({ items }: { items: ChecklistItem[] }) {
  const [statusFilter,      setStatusFilter]      = useState<StatusKey | "all">("all");
  const [principleFilter,   setPrincipleFilter]   = useState<string>("all");
  const [typeFilter,        setTypeFilter]        = useState<TypeKey>("all");
  const [search,            setSearch]            = useState("");
  const [expandedId,        setExpandedId]        = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(Object.keys(PRINCIPLES))
  );

  // ── Collected state — consultant marks data they've already gathered ────────
  const [collectedIds,  setCollectedIds]  = useState<Set<string>>(new Set());
  const [hideCollected, setHideCollected] = useState(false);

  function toggleCollected(id: string) {
    setCollectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSection(principle: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(principle)) next.delete(principle);
      else { next.add(principle); setExpandedId(null); }
      return next;
    });
  }

  // ── Sidebar counts ────────────────────────────────────────────────────────
  const statusCounts = useMemo(() => ({
    all:               items.length,
    already_tracked:   items.filter(i => i.status === "already_tracked").length,
    partially_tracked: items.filter(i => i.status === "partially_tracked").length,
    new_data_needed:   items.filter(i => i.status === "new_data_needed").length,
    not_applicable:    items.filter(i => i.status === "not_applicable").length,
  }), [items]);

  const principleCounts = useMemo(() => {
    const base = statusFilter === "all" ? items : items.filter(i => i.status === statusFilter);
    const counts: Record<string, number> = {};
    for (const item of base) counts[item.principle] = (counts[item.principle] || 0) + 1;
    return counts;
  }, [items, statusFilter]);

  // ── Filtered items ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter(item => {
      if (statusFilter !== "all"    && item.status         !== statusFilter)    return false;
      if (principleFilter !== "all" && item.principle      !== principleFilter) return false;
      if (typeFilter !== "all"      && item.indicator_type !== typeFilter)       return false;
      if (q && !item.label.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) return false;
      if (hideCollected && collectedIds.has(item.id))                           return false;
      return true;
    });
  }, [items, statusFilter, principleFilter, typeFilter, search, hideCollected, collectedIds]);

  const grouped = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.principle]) groups[item.principle] = [];
      groups[item.principle].push(item);
    }
    return groups;
  }, [filtered]);

  const principleKeys = Object.keys(grouped).sort();

  function clearFilters() {
    setStatusFilter("all");
    setPrincipleFilter("all");
    setTypeFilter("all");
    setSearch("");
  }

  return (
    <div className="space-y-4">

    {/* ── What is this tab? ─────────────────────────────────────────────── */}
    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-white rounded-lg border border-brand-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-brand-700" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="1.5" width="11" height="12" rx="1.5" />
            <path d="M5 5.5h5M5 8h5M5 10.5h3" />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-stone-800">
            What is this? — Your BRSR Data Collection Guide
          </h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            SEBI's BRSR framework requires companies to disclose information across{" "}
            <span className="font-medium text-stone-700">9 Business Responsibility Principles</span> (P1–P9).
            This tab lists all <span className="font-medium text-stone-700">{items.length} disclosure fields</span> your client must fill in their annual report,
            with each field pre-assessed against their existing filings.
          </p>
          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
            Fields are marked:{" "}
            <span className="font-medium text-emerald-700">Ready to pull</span> (data exists in a filing you can copy),{" "}
            <span className="font-medium text-amber-700">Needs verification</span> (partially covered — one piece missing), or{" "}
            <span className="font-medium text-stone-600">Collect fresh</span> (needs to be gathered from scratch).
          </p>
          <p className="text-[11px] text-stone-400 mt-2">
            <strong className="text-stone-500">Already collecting data?</strong> Expand any row and click{" "}
            <span className="font-semibold text-stone-500">Mark as collected</span> to track your progress and filter out what's done.
          </p>
        </div>
      </div>
    </div>

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
          {collectedIds.size > 0 && (
            <p className="text-[10px] text-emerald-700 font-medium mt-1">
              {collectedIds.size} marked as collected
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
            count={statusCounts.all}
            active={statusFilter === "all" && principleFilter === "all"}
            onClick={() => { setStatusFilter("all"); setPrincipleFilter("all"); }}
          />
          {([
            "already_tracked",
            "partially_tracked",
            "new_data_needed",
            ...(statusCounts.not_applicable > 0 ? ["not_applicable" as const] : []),
          ] as StatusKey[]).map(s => (
            <NavItem
              key={s}
              dot={STATUS_META[s].dot}
              label={STATUS_META[s].label}
              count={statusCounts[s]}
              active={statusFilter === s}
              onClick={() => { setStatusFilter(s); setPrincipleFilter("all"); }}
              dimmed={statusCounts[s] === 0}
            />
          ))}
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
              const count = principleCounts[key] ?? 0;
              const isActive = principleFilter === key;
              const isDimmed = count === 0;
              return (
                <button
                  key={key}
                  disabled={isDimmed && !isActive}
                  onClick={() => setPrincipleFilter(principleFilter === key ? "all" : key)}
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
              ...(statusCounts.not_applicable > 0 ? ["not_applicable" as const] : []),
            ] as const).map((key) => {
              const meta = key === "all"
                ? { label: "All", count: statusCounts.all, dot: null }
                : key === "already_tracked"
                ? { label: "Ready to pull",       count: statusCounts.already_tracked,   dot: "bg-emerald-500" }
                : key === "partially_tracked"
                ? { label: "Needs verification",  count: statusCounts.partially_tracked, dot: "bg-amber-400"   }
                : key === "new_data_needed"
                ? { label: "Collect fresh",        count: statusCounts.new_data_needed,   dot: "bg-stone-400"   }
                : { label: "Not applicable",       count: statusCounts.not_applicable,    dot: "bg-slate-300"   };
              const isActive = key === "all"
                ? statusFilter === "all" && principleFilter === "all"
                : statusFilter === key;
              const isDimmed = key !== "all" && meta.count === 0;
              return (
                <button
                  key={key}
                  disabled={isDimmed}
                  onClick={() => {
                    if (key === "all") { setStatusFilter("all"); setPrincipleFilter("all"); }
                    else setStatusFilter(key);
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
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-md
                bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500
                transition-[border-color,box-shadow] placeholder:text-stone-400"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500">
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Type filter pills */}
          <div className="flex items-center border border-stone-200 rounded-md overflow-hidden divide-x divide-stone-200 flex-shrink-0">
            {(["all", "essential", "leadership"] as TypeKey[]).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 text-xs font-medium chip-spring
                  ${typeFilter === t ? "bg-forest text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
              >
                {t === "all" ? "All" : t === "essential" ? "Essential" : "Leadership"}
              </button>
            ))}
          </div>

          {/* Hide collected toggle — only shown when some items are collected */}
          {collectedIds.size > 0 && (
            <button
              onClick={() => setHideCollected(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border flex-shrink-0
                transition-colors pressable ${
                  hideCollected
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
            >
              <svg aria-hidden="true" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {hideCollected ? "Showing all" : "Hide collected"}
              <span className={`tabular-nums ${hideCollected ? "text-white/80" : "text-emerald-600"}`}>
                ({collectedIds.size})
              </span>
            </button>
          )}

          {/* Result count */}
          <span className="text-xs text-stone-500 ml-auto tabular-nums flex-shrink-0">
            {filtered.length === items.length
              ? <><span className="font-medium">{items.length}</span> <span className="text-stone-400">disclosures</span></>
              : <><span className="font-medium">{filtered.length}</span> <span className="text-stone-400">of {items.length} shown</span></>
            }
          </span>
        </div>

        {/* No filings warning — above column headers */}
        {statusCounts.already_tracked === 0 && statusCounts.partially_tracked === 0 && statusFilter === "all" && (
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
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-stone-400 text-sm mb-2">No items match your filters.</p>
              <button onClick={clearFilters}
                className="text-xs text-teal-600 hover:underline font-medium">
                Clear all filters
              </button>
            </div>
          ) : (
            principleKeys.map((principle, idx) => (
              <PrincipleSection
                key={principle}
                principle={principle}
                items={grouped[principle]}
                expandedId={expandedId}
                onToggle={id => setExpandedId(expandedId === id ? null : id)}
                isFirst={idx === 0}
                collapsed={collapsedSections.has(principle)}
                onCollapse={() => toggleSection(principle)}
                collectedIds={collectedIds}
                onToggleCollected={toggleCollected}
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

// ─── Sidebar nav item ──────────────────────────────────────────────────────────
function NavItem({
  label, sublabel, count, dot, active, dimmed, onClick,
}: {
  label: string;
  sublabel?: string;
  count: number;
  dot?: string;
  active?: boolean;
  dimmed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={dimmed && !active}
      className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md
        text-left transition-colors mb-0.5 pressable
        ${active
          ? "bg-forest text-white"
          : dimmed
          ? "text-stone-300 cursor-default"
          : "hover:bg-stone-100"
        }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />}
        <div className="min-w-0 flex items-baseline gap-1">
          {sublabel && (
            <span className={`text-[10px] font-bold font-mono flex-shrink-0
              ${active ? "text-white/70" : dimmed ? "text-stone-300" : "text-stone-400"}`}>
              {sublabel}
            </span>
          )}
          <p className={`text-[12px] font-medium truncate leading-tight
            ${active ? "text-white" : dimmed ? "text-stone-300" : "text-stone-700"}`}>
            {label}
          </p>
        </div>
      </div>
      <span className={`text-[11px] tabular-nums flex-shrink-0 whitespace-nowrap
        ${active ? "text-white/75" : dimmed ? "text-stone-300" : "text-stone-500"}`}>
        {sublabel ? `${count} fields` : count}
      </span>
    </button>
  );
}

// ─── Principle section ─────────────────────────────────────────────────────────
function PrincipleSection({
  principle, items, expandedId, onToggle, isFirst, collapsed, onCollapse, collectedIds, onToggleCollected,
}: {
  principle: string;
  items: ChecklistItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  isFirst?: boolean;
  collapsed?: boolean;
  onCollapse: () => void;
  collectedIds: Set<string>;
  onToggleCollected: (id: string) => void;
}) {
  const info = PRINCIPLES[principle];
  const collectedCount = items.filter(i => collectedIds.has(i.id)).length;

  return (
    <div className={isFirst ? "" : "border-t-2 border-stone-200"}>
      <button
        onClick={onCollapse}
        aria-expanded={!collapsed}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-stone-100 border-b border-stone-200
          sticky top-0 z-10 hover:bg-stone-150 transition-colors text-left group pressable"
      >
        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded
          ${info?.bg ?? "bg-stone-200"} ${info?.color ?? "text-stone-700"} border ${info?.border ?? "border-stone-300"}`}>
          {principle}
        </span>
        <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900">
          {info?.name ?? principle}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {collectedCount > 0 && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
              {collectedCount} collected
            </span>
          )}
          <span className="text-xs text-stone-500 tabular-nums font-medium">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <svg
            aria-hidden="true"
            className={`w-4 h-4 text-stone-400 transition-transform duration-200 flex-shrink-0
              ${collapsed ? "-rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200
          ${collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="min-h-0">
          {items.map((item, idx) => (
            <DisclosureRow
              key={item.id}
              item={item}
              isOdd={idx % 2 === 1}
              expanded={expandedId === item.id}
              onToggle={() => onToggle(item.id)}
              isCollected={collectedIds.has(item.id)}
              onToggleCollected={() => onToggleCollected(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Single disclosure row ─────────────────────────────────────────────────────
function DisclosureRow({
  item, isOdd, expanded, onToggle, isCollected, onToggleCollected,
}: {
  item: ChecklistItem;
  isOdd: boolean;
  expanded: boolean;
  onToggle: () => void;
  isCollected: boolean;
  onToggleCollected: () => void;
}) {
  const s = STATUS_META[item.status as StatusKey];
  const isNA = item.status === "not_applicable";

  return (
    <div className={`border-b border-stone-200 transition-colors duration-300
      ${isCollected ? "bg-stone-100/60" : isNA ? "bg-slate-50/40" : isOdd ? "bg-stone-50/60" : "bg-white"}`}>

      {/* Main row */}
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-start px-4 py-3 gap-3 hover:bg-stone-50/70 transition-colors text-left group"
      >
        {/* Disclosure label + ID */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${isCollected ? "bg-emerald-400" : s.dot}`} />
          <div className="min-w-0">
            <p className={`text-sm leading-snug line-clamp-2 group-hover:text-stone-900
              ${isCollected
                ? "line-through text-stone-400"
                : isNA
                ? "text-slate-400"
                : "text-stone-800"
              }`}>
              {plain(item.label)}
            </p>
            {/* Inline gap hint — only for partially tracked, not collected */}
            {item.status === "partially_tracked" && item.gap_note && !isCollected && (
              <p className="text-[10px] text-amber-600 mt-0.5 line-clamp-1 leading-snug">
                Missing: {item.gap_note}
              </p>
            )}
            <p className="text-[10px] text-stone-400 mt-0.5 font-mono">{item.id}</p>
          </div>
        </div>

        {/* Indicator type — desktop only */}
        <div className="hidden md:flex items-start pt-0.5 w-[90px] flex-shrink-0">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded
            ${isCollected
              ? "text-stone-400 bg-stone-100 border border-stone-200"
              : item.indicator_type === "essential"
              ? "text-blue-700 bg-blue-50 border border-blue-100"
              : "text-violet-700 bg-violet-50 border border-violet-100"
            }`}>
            {item.indicator_type === "essential" ? "Essential" : "Leadership"}
          </span>
        </div>

        {/* Status + expand chevron */}
        <div className="flex items-center gap-1.5 w-[145px] flex-shrink-0">
          {isCollected ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 truncate">
              <svg key="row-checked" aria-hidden="true" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path className="check-path" d="M5 13l4 4L19 7" />
              </svg>
              Collected
            </span>
          ) : (
            <span className={`text-xs font-medium ${s.text}`}>
              {s.label}
            </span>
          )}
          <svg
            aria-hidden="true"
            className={`w-3.5 h-3.5 text-stone-400 ml-auto flex-shrink-0
              transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded detail panel */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200
          ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
      <div className="min-h-0">
        <div className="px-4 pb-4" style={{ paddingLeft: "calc(1rem + 22px)" }}>
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-3">

            {/* Not-applicable explainer — service-sector clients skip this */}
            {isNA && (
              <div className="bg-slate-100 border border-slate-200 rounded-md px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600 mb-1">
                  Why not applicable?
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This is a manufacturing/product-specific disclosure (e.g. stack air emissions,
                  industrial effluent, product end-of-life reclaim, or project EIAs). Pure
                  service-sector entities normally report it as <span className="font-medium">"Not applicable"</span> in their BRSR.
                  Confirm with your client — switch <span className="font-medium">Business Type</span> to Product/Manufacturing if any of these apply.
                </p>
              </div>
            )}

            {/* Source filing — shown when data comes from an existing compliance report */}
            {item.source_filing && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-800 mb-1">
                  Pull from
                </p>
                <span className="inline-flex items-center text-xs font-medium text-stone-700
                  bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                  {item.source_filing}
                </span>
              </div>
            )}

            {/* Gap note */}
            {item.gap_note && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-800 mb-1">
                  Gap — what's missing
                </p>
                <p className="text-xs text-stone-600 leading-relaxed">{item.gap_note}</p>
              </div>
            )}

            {/* Measurement guidance */}
            {item.measurement_guidance && (
              <div className={item.gap_note ? "border-t border-stone-200 pt-3" : ""}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-800 mb-1">
                  How to collect?
                </p>
                <p className="text-xs text-stone-600 leading-relaxed">{item.measurement_guidance}</p>
              </div>
            )}

            {/* SEBI verbatim */}
            <div className={item.measurement_guidance || item.gap_note ? "border-t border-stone-200 pt-3" : ""}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-800 mb-1">
                SEBI language
              </p>
              <p className="text-xs text-stone-500 leading-relaxed italic">{item.label}</p>
            </div>

            {/* SEBI source — link to the official BRSR Format + page citation */}
            <div className="border-t border-stone-200 pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-800 mb-1.5">
                SEBI source
              </p>
              <a
                href={SEBI_BRSR_FORMAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700
                  bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-md
                  hover:bg-brand-100 hover:border-brand-200 transition-colors pressable"
              >
                <svg aria-hidden="true" className="w-3 h-3 flex-shrink-0" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2.5" y="1.5" width="8" height="12" rx="1" />
                  <path d="M5 5h3M5 7.5h3M5 10h2" />
                </svg>
                SEBI BRSR Format — Principle {principleNumber(item.principle)}
                <svg aria-hidden="true" className="w-2.5 h-2.5 flex-shrink-0 opacity-70" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5.5 3h6.5v6.5M12 3L4 11" />
                </svg>
              </a>
              <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">
                Official SEBI disclosure format (Annexure II, 2023).
                {item.page ? <> Cross-reference: ICAI Background Material, p.{item.page}.</> : null}
              </p>
            </div>

            {/* Unit */}
            {item.unit && (
              <p className="text-[10px] text-stone-400 border-t border-stone-200 pt-2">
                Unit: <span className="font-medium text-stone-500">{item.unit}</span>
              </p>
            )}

            {/* ── Mark as collected ──────────────────────────────────────── */}
            {!isNA && (
            <div className="border-t border-stone-200 pt-3 flex items-center justify-between gap-3">
              <p className="text-[10px] text-stone-400 leading-relaxed">
                {isCollected
                  ? "You've marked this data as collected."
                  : "Already have this data? Mark it as collected to track your progress."}
              </p>
              <button
                onClick={onToggleCollected}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-semibold pressable transition-colors ${
                    isCollected
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
              >
                {isCollected ? (
                  <>
                    {/* Checkmark draws in — key forces remount so animation fires on each collect */}
                    <svg key="checked" aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path className="check-path" d="M5 13l4 4L19 7" />
                    </svg>
                    Collected — undo
                  </>
                ) : (
                  <>
                    <svg key="unchecked" aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    Mark as collected
                  </>
                )}
              </button>
            </div>
            )}

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
