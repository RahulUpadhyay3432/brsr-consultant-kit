"use client";

import { useState, useMemo, useEffect } from "react";
import type { MaterialityTopic } from "@/lib/types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "@/lib/storage";
import { downloadCsv, exportFilename } from "@/lib/export";

interface MaterialityMatrixProps {
  topics: MaterialityTopic[];
  clientName?: string;
}

const CATEGORY_META = {
  environment: {
    label:   "Environment",
    color:   "text-emerald-700",
    bg:      "bg-emerald-50",
    border:  "border-emerald-200",
    dot:     "bg-emerald-500",
  },
  social: {
    label:   "Social",
    color:   "text-blue-700",
    bg:      "bg-blue-50",
    border:  "border-blue-200",
    dot:     "bg-blue-500",
  },
  governance: {
    label:   "Governance",
    color:   "text-violet-700",
    bg:      "bg-violet-50",
    border:  "border-violet-200",
    dot:     "bg-violet-500",
  },
} as const;

type Category = keyof typeof CATEGORY_META;
const CATEGORY_ORDER: Category[] = ["environment", "social", "governance"];

interface MaterialityPersist {
  shortlistedIds: string[];
  showShortlistedOnly: boolean;
}

export default function MaterialityMatrix({ topics, clientName }: MaterialityMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");

  // ── Working shortlist, the consultant flags topics to carry into the
  //    client's stakeholder process. A working note, NOT a final assessment.
  //    Persisted client-side so it survives a refresh / tab switch.
  const [shortlisted,         setShortlisted]         = useState<Set<string>>(new Set());
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);
  const [hydrated,            setHydrated]            = useState(false);

  useEffect(() => {
    const saved = loadJSON<MaterialityPersist | null>(STORAGE_KEYS.materiality, null);
    if (saved) {
      setShortlisted(new Set(saved.shortlistedIds ?? []));
      setShowShortlistedOnly(!!saved.showShortlistedOnly);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJSON(STORAGE_KEYS.materiality, {
      shortlistedIds: Array.from(shortlisted),
      showShortlistedOnly,
    } satisfies MaterialityPersist);
  }, [hydrated, shortlisted, showShortlistedOnly]);

  function toggleShortlist(id: string) {
    setShortlisted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const shortlistedCount = useMemo(
    () => topics.filter(t => shortlisted.has(t.id)).length,
    [topics, shortlisted]
  );

  // Download a materiality-assessment WORKING TEMPLATE: the suggested topics
  // pre-filled, with empty scoring/decision columns the consultant completes
  // through the client's stakeholder-engagement process. Honestly framed as a
  // starting format, not a completed assessment (matches the in-app disclaimer).
  function exportTemplate() {
    const intro =
      "Materiality assessment, working template. Pre-filled with suggested topics for this industry; " +
      "complete the scoring and decision columns through your client's stakeholder-engagement process. " +
      "This is a starting format, not a completed materiality assessment.";
    const header = [
      "Material topic", "Category", "BRSR principles", "Why it may be material", "On shortlist",
      "Stakeholder importance (1-5)", "Business impact (1-5)", "Priority (High/Med/Low)",
      "Stakeholders consulted", "Material? (Yes/No)", "Notes / decision rationale",
    ];
    const body = CATEGORY_ORDER.flatMap(cat =>
      topics.filter(t => t.category === cat).map(t => [
        t.topic, CATEGORY_META[cat].label, t.brsr_principles.join(" "), t.why_material,
        shortlisted.has(t.id) ? "Yes" : "",
        "", "", "", "", "", "", // filled by the consultant via stakeholder engagement
      ])
    );
    const rows: string[][] = [[intro], [], header, ...body];
    downloadCsv(exportFilename("BRSR-materiality-assessment-template", clientName), rows);
  }

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const t of topics) counts[t.category as Category] = (counts[t.category as Category] || 0) + 1;
    return counts;
  }, [topics]);

  const filtered = useMemo(() => {
    let out = selectedCategory === "all" ? topics : topics.filter(t => t.category === selectedCategory);
    if (showShortlistedOnly) out = out.filter(t => shortlisted.has(t.id));
    return out;
  }, [topics, selectedCategory, showShortlistedOnly, shortlisted]);

  const grouped = useMemo(() => {
    const g: Partial<Record<Category, MaterialityTopic[]>> = {};
    for (const t of filtered) {
      const cat = t.category as Category;
      if (!g[cat]) g[cat] = [];
      g[cat]!.push(t);
    }
    return g;
  }, [filtered]);

  return (
    <div className="space-y-6">

      {/* ── What is this? ─────────────────────────────────────────────────── */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-white rounded-lg border border-brand-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-700" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
              <circle cx="4" cy="10" r="1.5" />
              <circle cx="7.5" cy="6" r="1.5" />
              <circle cx="11" cy="3.5" r="1.5" />
              <circle cx="6" cy="12" r="1" />
              <circle cx="11.5" cy="8.5" r="1" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-800">
              Suggested Material Topics, a starting point for your client&apos;s industry
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              SEBI&apos;s BRSR requires companies to identify which ESG topics are{" "}
              <strong className="text-stone-700">material</strong>, topics that significantly
              affect the company or matter to its stakeholders (investors, employees, communities,
              regulators). The topics below are a <strong className="text-stone-700">suggested shortlist</strong>{" "}
              for your client&apos;s industry, a head-start, not a finished assessment.
            </p>
            <p className="text-[11px] text-stone-500 mt-2">
              <strong className="text-stone-600">How to use this:</strong> Flag the ones that look relevant
              with <span className="font-medium text-brand-700">Add to shortlist</span>, cross off what
              doesn&apos;t apply, add what&apos;s missing, then run your shortlist through the client&apos;s actual
              stakeholder process to arrive at the final materiality disclosure.
            </p>
          </div>
        </div>
      </div>

      {/* ── Honest disclaimer, this is suggested, not a completed assessment ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 1.5l6.5 11.5h-13L8 1.5z" />
          <path d="M8 6.5v3M8 11.5h.01" />
        </svg>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>This is a suggested starting list, not a completed materiality assessment.</strong>{" "}
          A BRSR-compliant assessment comes from a structured stakeholder-engagement process, and
          priorities differ between companies even within the same sector. Your shortlist below is a
          working note to kick off that process, not a substitute for it.
        </p>
      </div>

      {/* ── Working shortlist summary ─────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-brand-50 rounded-lg border border-brand-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-stone-800">
              Your working shortlist
              <span className="ml-2 text-[11px] font-bold tabular-nums text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-full">
                {shortlistedCount}
              </span>
            </p>
            <p className="text-[11.5px] text-stone-500 mt-0.5 leading-relaxed">
              {shortlistedCount > 0
                ? <>{shortlistedCount} topic{shortlistedCount === 1 ? "" : "s"} flagged to carry into the client&apos;s materiality process.</>
                : <>Tap <span className="font-medium text-brand-700">Add to shortlist</span> on the topics you&apos;ll take into the client&apos;s stakeholder process.</>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {shortlistedCount > 0 && (
            <>
              <button
                onClick={() => setShowShortlistedOnly(v => !v)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border pressable transition-colors ${
                  showShortlistedOnly
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100"
                }`}
              >
                {showShortlistedOnly ? "Showing shortlist" : "Show shortlist only"}
                <span className={showShortlistedOnly ? "text-white/80" : "text-brand-500"}>({shortlistedCount})</span>
              </button>
              <button
                onClick={() => { setShortlisted(new Set()); setShowShortlistedOnly(false); }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  text-stone-500 hover:text-stone-700 hover:bg-stone-100 pressable transition-colors"
              >
                Clear
              </button>
            </>
          )}
          <button
            onClick={exportTemplate}
            title="Download a materiality-assessment working template (suggested topics pre-filled, scoring left for your stakeholder process). Opens in Excel."
            className="no-print inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
              text-stone-600 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 pressable transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Assessment template
          </button>
        </div>
      </div>

      {/* ── Category filter ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-full text-sm pressable ${
            selectedCategory === "all"
              ? "bg-forest text-white"
              : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"
          }`}
        >
          All topics
          <span className={`ml-1.5 text-[11px] tabular-nums ${selectedCategory === "all" ? "text-white/70" : "text-stone-400"}`}>
            {topics.length}
          </span>
        </button>

        {CATEGORY_ORDER.map(cat => {
          const meta = CATEGORY_META[cat];
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm pressable flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-forest text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
              {meta.label}
              <span className={`text-[11px] tabular-nums ${selectedCategory === cat ? "text-white/70" : "text-stone-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Topic sections, grouped by E / S / G ─────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-stone-400">No topics on your shortlist in this category.</p>
          <button
            onClick={() => setShowShortlistedOnly(false)}
            className="mt-2 text-xs text-brand-700 hover:underline font-medium"
          >
            Show all suggested topics
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORY_ORDER
            .filter(cat => grouped[cat]?.length)
            .map(cat => (
              <CategorySection
                key={cat}
                category={cat}
                topics={grouped[cat]!}
                shortlisted={shortlisted}
                onToggleShortlist={toggleShortlist}
              />
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── Category section ──────────────────────────────────────────────────────────
function CategorySection({
  category, topics, shortlisted, onToggleShortlist,
}: {
  category: Category;
  topics: MaterialityTopic[];
  shortlisted: Set<string>;
  onToggleShortlist: (id: string) => void;
}) {
  const meta = CATEGORY_META[category];
  return (
    <div>
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${meta.color}`}>
          {meta.label}
        </span>
        <span className="text-[11px] text-stone-400">
          {topics.length} {topics.length === 1 ? "topic" : "topics"}
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topics.map(topic => (
          <TopicCard
            key={topic.id}
            topic={topic}
            meta={meta}
            isShortlisted={shortlisted.has(topic.id)}
            onToggleShortlist={() => onToggleShortlist(topic.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Topic card ────────────────────────────────────────────────────────────────
function TopicCard({
  topic, meta, isShortlisted, onToggleShortlist,
}: {
  topic: MaterialityTopic;
  meta: typeof CATEGORY_META[Category];
  isShortlisted: boolean;
  onToggleShortlist: () => void;
}) {
  return (
    <div className={`bg-white border rounded-xl p-4 flex flex-col gap-3 transition-shadow
      ${isShortlisted ? "border-brand-300 ring-2 ring-brand-500/25 shadow-[0_1px_4px_rgba(0,116,90,0.10)]" : meta.border}`}>
      <div>
        <p className={`text-sm font-semibold leading-snug ${meta.color}`}>{topic.topic}</p>
        <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{topic.why_material}</p>
      </div>

      {/* BRSR principle chips */}
      <div className="flex flex-wrap gap-1 mt-auto pt-1">
        {topic.brsr_principles.map(p => (
          <span
            key={p}
            className="text-[10px] font-mono font-semibold text-brand-700 bg-brand-50
              px-1.5 py-0.5 rounded border border-brand-100"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Shortlist toggle, "select", not "collect": this is a working note */}
      <button
        onClick={onToggleShortlist}
        aria-pressed={isShortlisted}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold
          pressable transition-colors ${
            isShortlisted
              ? "bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100"
              : "bg-white text-stone-500 border border-stone-200 hover:border-brand-300 hover:text-brand-700"
          }`}
      >
        {isShortlisted ? (
          <>
            <svg key={`ml-${topic.id}-on`} aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path className="check-path" d="M5 13l4 4L19 7" />
            </svg>
            On shortlist
          </>
        ) : (
          <>
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add to shortlist
          </>
        )}
      </button>
    </div>
  );
}
