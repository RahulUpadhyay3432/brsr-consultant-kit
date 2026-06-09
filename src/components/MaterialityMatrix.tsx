"use client";

import { useState, useMemo } from "react";
import type { MaterialityTopic } from "@/lib/types";

interface MaterialityMatrixProps {
  topics: MaterialityTopic[];
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

export default function MaterialityMatrix({ topics }: MaterialityMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const t of topics) counts[t.category as Category] = (counts[t.category as Category] || 0) + 1;
    return counts;
  }, [topics]);

  const filtered = useMemo(() => (
    selectedCategory === "all" ? topics : topics.filter(t => t.category === selectedCategory)
  ), [topics, selectedCategory]);

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
              Suggested Material Topics — a starting point for your client's industry
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              SEBI's BRSR requires companies to identify which ESG topics are{" "}
              <strong className="text-stone-700">material</strong> — topics that significantly
              affect the company or matter to its stakeholders (investors, employees, communities,
              regulators). The topics below are a <strong className="text-stone-700">suggested shortlist</strong>{" "}
              for your client's industry — a head-start, not a finished assessment.
            </p>
            <p className="text-[11px] text-stone-500 mt-2">
              <strong className="text-stone-600">How to use this:</strong> Use it to open the conversation
              with your client. Cross off what doesn't apply, add what's missing, and prioritise together —
              then run it through their actual stakeholder process to arrive at the final materiality disclosure.
            </p>
          </div>
        </div>
      </div>

      {/* ── Honest disclaimer — this is suggested, not a completed assessment ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 1.5l6.5 11.5h-13L8 1.5z" />
          <path d="M8 6.5v3M8 11.5h.01" />
        </svg>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>This is a suggested starting list, not a completed materiality assessment.</strong>{" "}
          A BRSR-compliant assessment comes from a structured stakeholder-engagement process, and
          priorities differ between companies even within the same sector. Treat this as a prompt to
          kick off that process — not a substitute for it.
        </p>
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
      <div className="space-y-8">
        {CATEGORY_ORDER
          .filter(cat => grouped[cat]?.length)
          .map(cat => (
            <CategorySection key={cat} category={cat} topics={grouped[cat]!} />
          ))
        }
      </div>
    </div>
  );
}

// ─── Category section ──────────────────────────────────────────────────────────
function CategorySection({ category, topics }: { category: Category; topics: MaterialityTopic[] }) {
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
          <TopicCard key={topic.id} topic={topic} meta={meta} />
        ))}
      </div>
    </div>
  );
}

// ─── Topic card ────────────────────────────────────────────────────────────────
function TopicCard({
  topic,
  meta,
}: {
  topic: MaterialityTopic;
  meta: typeof CATEGORY_META[Category];
}) {
  return (
    <div className={`bg-white border ${meta.border} rounded-xl p-4 flex flex-col gap-3`}>
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
    </div>
  );
}
