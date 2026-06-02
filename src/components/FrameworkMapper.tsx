"use client";

import { useState, useMemo } from "react";
import type { FrameworkMapping } from "@/lib/types";

interface FrameworkMapperProps {
  mappings: FrameworkMapping[];
}

const TCFD_PILLARS = ["Governance", "Strategy", "Risk Management", "Metrics and Targets"];

export default function FrameworkMapper({ mappings }: FrameworkMapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPillar, setFilterPillar] = useState("all");
  const [filterFramework, setFilterFramework] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return mappings.filter((m) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = `${m.brsr_id} ${m.brsr_label} ${m.gri_standard} ${m.gri_label} ${m.tcfd_detail} ${m.ifrs_reference} ${m.notes}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (filterPillar !== "all" && m.tcfd_pillar !== filterPillar) return false;
      if (filterFramework === "gri" && (!m.gri_standard || m.gri_standard === "—")) return false;
      if (filterFramework === "tcfd" && (!m.tcfd_pillar || m.tcfd_pillar === "—")) return false;
      if (filterFramework === "ifrs" && (!m.ifrs_reference || m.ifrs_reference === "—")) return false;
      return true;
    });
  }, [mappings, searchQuery, filterPillar, filterFramework]);

  // Stats
  const stats = useMemo(() => {
    const withGRI = mappings.filter((m) => m.gri_standard && m.gri_standard !== "—").length;
    const withTCFD = mappings.filter((m) => m.tcfd_pillar && m.tcfd_pillar !== "—").length;
    const withIFRS = mappings.filter((m) => m.ifrs_reference && m.ifrs_reference !== "—").length;
    return { total: mappings.length, withGRI, withTCFD, withIFRS };
  }, [mappings]);

  return (
    <div className="space-y-6">

      {/* ── What is this tab? ─────────────────────────────────────────────── */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-white rounded-lg border border-brand-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-700" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
              <circle cx="2.5" cy="7.5" r="1.5" />
              <circle cx="12.5" cy="3" r="1.5" />
              <circle cx="12.5" cy="12" r="1.5" />
              <path d="M4 7.5l7-4M4 7.5l7 4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-800">What is this? — Cross-Framework Mapping</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              If your client exports to the EU, reports to international investors, or is listed on global indices, they may also need to report against <strong className="text-stone-700">GRI, TCFD, or IFRS S1/S2</strong>.
              Good news: BRSR overlaps significantly with all three.
              This table shows exactly which BRSR disclosures map to which international standard — so you can <strong className="text-stone-700">collect the data once and report across all frameworks</strong>.
            </p>
            <p className="text-[11px] text-stone-500 mt-2">
              <strong className="text-stone-600">How to use this:</strong> Filter by a framework (e.g. "Has GRI mapping") to see only the rows relevant for your client's international reporting obligations.
            </p>
          </div>
        </div>
      </div>

      {/* ── Framework definition cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">GRI</span>
            <span className="text-2xl font-semibold text-blue-600">{stats.withGRI}</span>
          </div>
          <p className="text-xs font-semibold text-stone-800 mb-1">Global Reporting Initiative</p>
          <p className="text-xs text-stone-500 leading-relaxed">
            The world's most widely used sustainability standard — adopted by 10,000+ companies in 100+ countries.
            <span className="text-blue-700 font-medium"> {stats.withGRI} of your {stats.total} BRSR fields</span> directly overlap with GRI disclosures.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-violet-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">TCFD</span>
            <span className="text-2xl font-semibold text-violet-600">{stats.withTCFD}</span>
          </div>
          <p className="text-xs font-semibold text-stone-800 mb-1">Climate Disclosure Standard</p>
          <p className="text-xs text-stone-500 leading-relaxed">
            Required by global banks, investors, and regulators to disclose how climate change affects the business.
            Covers 4 pillars: Governance, Strategy, Risk Management, and Metrics.
            <span className="text-violet-700 font-medium"> {stats.withTCFD} BRSR fields</span> align here.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">IFRS S1/S2</span>
            <span className="text-2xl font-semibold text-emerald-600">{stats.withIFRS}</span>
          </div>
          <p className="text-xs font-semibold text-stone-800 mb-1">IFRS Sustainability Standards</p>
          <p className="text-xs text-stone-500 leading-relaxed">
            The new global baseline being adopted by 40+ countries. S1 = general sustainability risks; S2 = climate-specific disclosures.
            <span className="text-emerald-700 font-medium"> {stats.withIFRS} BRSR fields</span> map to these standards.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search across all frameworks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-72"
        />
        <select
          value={filterFramework}
          onChange={(e) => setFilterFramework(e.target.value)}
          className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="all">All frameworks</option>
          <option value="gri">Has GRI mapping</option>
          <option value="tcfd">Has TCFD mapping</option>
          <option value="ifrs">Has IFRS mapping</option>
        </select>
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
      </div>

      <p className="text-xs text-stone-500">
        Showing <span className="font-medium text-stone-700">{filtered.length}</span> of {mappings.length} BRSR disclosures that have at least one international framework counterpart
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800 font-medium">{mapping.brsr_label}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {mapping.gri_standard && mapping.gri_standard !== "—" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        GRI {mapping.gri_standard}
                      </span>
                    )}
                    {mapping.tcfd_pillar && mapping.tcfd_pillar !== "—" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                        TCFD: {mapping.tcfd_pillar}
                      </span>
                    )}
                    {mapping.ifrs_reference && mapping.ifrs_reference !== "—" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {mapping.ifrs_reference}
                      </span>
                    )}
                  </div>
                </div>
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

              {/* Animated expand/collapse — smooth both ways */}
              <div
                className={`grid overflow-hidden transition-[grid-template-rows] duration-200
                  ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
              >
              <div className="min-h-0">
                <div className="px-4 pb-4 border-t border-stone-100 pt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">GRI</span>
                      <p className="text-sm text-stone-700 mt-0.5">{mapping.gri_standard || "—"}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{mapping.gri_label}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">TCFD</span>
                      <p className="text-sm text-stone-700 mt-0.5">{mapping.tcfd_pillar || "—"}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{mapping.tcfd_detail}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">IFRS S1/S2</span>
                      <p className="text-sm text-stone-700 mt-0.5">{mapping.ifrs_reference || "—"}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">BRSR Section (where it appears)</span>
                      <p className="text-sm text-stone-700 mt-0.5">{mapping.brsr_section}</p>
                    </div>
                  </div>
                  {mapping.notes && (
                    <div className="bg-stone-50 border border-stone-100 rounded-lg p-3">
                      <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">How the frameworks compare</span>
                      <p className="text-sm text-stone-600 mt-0.5 leading-relaxed">{mapping.notes}</p>
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
