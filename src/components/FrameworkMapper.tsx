"use client";

import { useState, useMemo } from "react";
import type { FrameworkMapping } from "@/lib/types";
import { isMapped } from "@/lib/types";

interface FrameworkMapperProps {
  mappings: FrameworkMapping[];
}

const TCFD_PILLARS = ["Governance", "Strategy", "Risk Management", "Metrics and Targets"];

// A cell is "unmapped" when it's absent or carries the em-dash placeholder.
// isMapped is the single shared guard, see the note beside it in lib/types.
const has = isMapped;

// The frameworks a consultant can target. In practice they're doing BRSR→GRI *or*
// BRSR→ESRS, rarely all five at once, so this is a primary selector rather than a
// buried filter: picking one renders a focused two-column crosswalk instead of a
// row of five competing badges. "All" stays the browse/overview mode.
// Full class strings only, Tailwind's JIT can't see interpolated ones.
type FwKey = "all" | "gri" | "tcfd" | "ifrs" | "tnfd" | "esrs";

const FRAMEWORKS: {
  key: Exclude<FwKey, "all">;
  label: string;
  short: string;
  chip: string;      // badge + focused-column styling
  label_cls: string; // the uppercase label in the expanded panel
  ref: (m: FrameworkMapping) => string | undefined;
  detail: (m: FrameworkMapping) => string | undefined;
}[] = [
  // gri_standard already reads "GRI 2-12", so it is rendered as-is. Prepending
  // "GRI " here is what produced the "GRI GRI 2-12" badges.
  { key: "gri",  label: "GRI",         short: "GRI",
    chip: "bg-blue-50 text-blue-700 border-blue-100",       label_cls: "text-blue-600",
    ref: (m) => (has(m.gri_standard) ? m.gri_standard : undefined), detail: (m) => m.gri_label },
  { key: "tcfd", label: "TCFD",        short: "TCFD",
    chip: "bg-violet-50 text-violet-700 border-violet-100", label_cls: "text-violet-600",
    ref: (m) => (has(m.tcfd_pillar) ? `TCFD: ${m.tcfd_pillar}` : undefined), detail: (m) => m.tcfd_detail },
  { key: "ifrs", label: "IFRS S1/S2",  short: "IFRS",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-100", label_cls: "text-emerald-600",
    ref: (m) => (has(m.ifrs_reference) ? m.ifrs_reference : undefined), detail: () => undefined },
  { key: "tnfd", label: "TNFD",        short: "TNFD",
    chip: "bg-teal-50 text-teal-700 border-teal-100",       label_cls: "text-teal-600",
    ref: (m) => (has(m.tnfd_pillar) ? `TNFD: ${m.tnfd_pillar}` : undefined), detail: (m) => m.tnfd_detail },
  { key: "esrs", label: "ESRS (CSRD)", short: "ESRS",
    chip: "bg-indigo-50 text-indigo-700 border-indigo-100", label_cls: "text-indigo-600",
    ref: (m) => (has(m.esrs_standard) ? m.esrs_standard : undefined), detail: (m) => m.esrs_detail },
];

export default function FrameworkMapper({ mappings }: FrameworkMapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPillar, setFilterPillar] = useState("all");
  const [filterFramework, setFilterFramework] = useState<FwKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const target = FRAMEWORKS.find((f) => f.key === filterFramework);

  // Coverage per framework, shown on the selector so the consultant can see how
  // far each crosswalk reaches before committing to it.
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of FRAMEWORKS) c[f.key] = mappings.filter((m) => !!f.ref(m)).length;
    return c;
  }, [mappings]);

  const filtered = useMemo(() => {
    return mappings.filter((m) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = `${m.brsr_id} ${m.brsr_label} ${m.gri_standard} ${m.gri_label} ${m.tcfd_detail} ${m.ifrs_reference} ${m.tnfd_detail ?? ""} ${m.esrs_standard ?? ""} ${m.esrs_detail ?? ""} ${m.notes}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (filterPillar !== "all" && m.tcfd_pillar !== filterPillar) return false;
      if (target && !target.ref(m)) return false;
      return true;
    });
  }, [mappings, searchQuery, filterPillar, target]);

  return (
    <div className="space-y-5">

      {/* ── Primary selector: which framework are you reporting to? ─────────
          Promoted out of the old dropdown. Picking one focuses the whole list
          into a BRSR → that-framework crosswalk. */}
      <div>
        <p className="text-[13px] font-medium text-ink-body mb-2">Map BRSR to</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterFramework("all")}
            aria-pressed={filterFramework === "all"}
            className={`pressable text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-colors
              ${filterFramework === "all"
                ? "bg-forest text-white border-forest"
                : "bg-white text-ink-body border-line hover:border-brand-300"}`}
          >
            All frameworks
          </button>
          {FRAMEWORKS.map((f) => {
            const on = filterFramework === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilterFramework(f.key)}
                aria-pressed={on}
                className={`pressable text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-colors inline-flex items-center gap-1.5
                  ${on ? "bg-forest text-white border-forest" : "bg-white text-ink-body border-line hover:border-brand-300"}`}
              >
                {f.label}
                <span className={`text-[11px] tabular-nums ${on ? "text-white/70" : "text-ink-faint"}`}>
                  {counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + TCFD pillar narrowing, secondary to the selector above. The
          pillar filter only makes sense while TCFD is in view, so it's hidden
          otherwise rather than offering to filter an ESRS list by TCFD pillar. */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder={target ? `Search the BRSR to ${target.short} mapping...` : "Search across all frameworks..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-72"
        />
        {(filterFramework === "all" || filterFramework === "tcfd") && (
          <select
            value={filterPillar}
            onChange={(e) => setFilterPillar(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All TCFD pillars</option>
            {TCFD_PILLARS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      <p className="text-[13.5px] text-stone-600">
        {target ? (
          <>
            Showing <span className="font-medium text-stone-700">{filtered.length}</span> of {mappings.length} BRSR
            disclosures that map to {target.label}.
            {target.key === "esrs" && " Indicative, and a crosswalk only: whether CSRD applies depends on EU turnover and headcount thresholds this tool doesn't collect."}
            {target.key === "tnfd" && " TNFD covers nature beyond climate, so GHG disclosures are intentionally left to TCFD and IFRS S2."}
          </>
        ) : (
          <>
            Showing <span className="font-medium text-stone-700">{filtered.length}</span> of {mappings.length} BRSR
            disclosures that have at least one international framework counterpart. Pick a framework above to focus the list.
          </>
        )}
      </p>

      {/* Mapping Cards */}
      <div className="space-y-2">
        {filtered.map((mapping) => {
          const isExpanded = expandedId === mapping.brsr_id;
          return (
            <div
              key={mapping.brsr_id}
              className="bg-white rounded-lg border border-stone-200 hover:border-stone-300 transition-[border-color] duration-150"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : mapping.brsr_id)}
                className="w-full px-4 py-3 flex items-start gap-3 text-left"
              >
                <span className="text-xs font-mono text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                  {mapping.brsr_id}
                </span>
                {/* Focused mode renders a real two-column crosswalk (BRSR left,
                    the chosen framework right). "All frameworks" keeps the
                    badge overview, which answers a different question: which
                    frameworks does this disclosure touch at all. */}
                {target ? (
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_auto] sm:items-start gap-x-4 gap-y-1.5">
                    <p className="text-sm text-stone-800 font-medium">{mapping.brsr_label}</p>
                    <span className={`inline-flex items-center self-start px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${target.chip}`}>
                      {target.ref(mapping)}
                    </span>
                    {target.detail(mapping) && (
                      <p className="text-[12.5px] text-ink-muted leading-snug sm:col-span-2">{target.detail(mapping)}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800 font-medium">{mapping.brsr_label}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {FRAMEWORKS.map((f) => {
                        const ref = f.ref(mapping);
                        if (!ref) return null;
                        return (
                          <span key={f.key} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${f.chip}`}>
                            {ref}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                <svg
                  aria-hidden="true"
                  className={`w-4 h-4 text-stone-400 flex-shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Animated expand/collapse, smooth both ways */}
              <div
                className={`grid overflow-hidden transition-[grid-template-rows] duration-200
                  ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
              >
              <div className="min-h-0">
                <div className="px-4 pb-4 border-t border-stone-100 pt-3 space-y-3">
                  {/* Driven off the same FRAMEWORKS array as the badges, so a
                      framework can never render one way collapsed and another
                      way expanded. An unmapped framework says so in words
                      rather than showing a bare em-dash that reads as a glitch. */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FRAMEWORKS.map((f) => {
                      const ref = f.ref(mapping);
                      const detail = ref ? f.detail(mapping) : undefined;
                      return (
                        <div key={f.key}>
                          <span className={`text-xs font-medium uppercase tracking-wider ${f.label_cls}`}>{f.label}</span>
                          {ref ? (
                            <>
                              <p className="text-sm text-stone-700 mt-0.5">{ref}</p>
                              {isMapped(detail) && <p className="text-[12.5px] text-stone-600 mt-0.5">{detail}</p>}
                            </>
                          ) : (
                            <p className="text-sm text-stone-400 mt-0.5 italic">No counterpart in {f.short}.</p>
                          )}
                        </div>
                      );
                    })}
                    <div>
                      <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">BRSR Section (where it appears)</span>
                      <p className="text-sm text-stone-700 mt-0.5">{mapping.brsr_section}</p>
                    </div>
                  </div>
                  {mapping.notes && (
                    <div className="bg-stone-50 border border-stone-100 rounded-lg p-3">
                      <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">How the frameworks compare</span>
                      <p className="text-[14px] text-stone-600 mt-0.5 leading-relaxed">{mapping.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
