"use client";

import ratingsData from "@/data/esg_ratings_mapping.json";

interface RatingMapping {
  brsr_principle: string;
  principle_name: string;
  msci_pillar: string;
  msci_key_issues: string[];
  djsi_dimension: string;
  djsi_criteria: string[];
  cdp_areas: string[];
  ecovadis_theme: string;
  ecovadis_criteria: string[];
  note: string;
}

type RatingDef = { name: string; what: string };

const DATA = ratingsData as {
  ratings: { msci: RatingDef; djsi: RatingDef; cdp: RatingDef; ecovadis: RatingDef };
  mappings: RatingMapping[];
};

// One scheme's chips inside a principle card. Renders an honest "not covered"
// line rather than an empty box where a scheme genuinely doesn't reach (CDP is
// environmental only, so it never touches P3/P5/P8/P9).
// Full class strings, never interpolated: Tailwind's JIT only sees literals.
function SchemeBlock({
  label, sub, items, labelCls, chipCls, empty,
}: { label: string; sub?: string; items: string[]; labelCls: string; chipCls: string; empty: string }) {
  return (
    <div>
      <p className={`text-[11.5px] font-semibold uppercase tracking-[0.1em] mb-1.5 ${labelCls}`}>
        {label}
        {sub && <span className="font-normal text-stone-500 normal-case tracking-normal"> · {sub}</span>}
      </p>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((k, i) => (
            <span key={i} className={`text-[11px] font-medium px-2 py-0.5 rounded ${chipCls}`}>{k}</span>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-stone-400 italic">{empty}</p>
      )}
    </div>
  );
}

export default function EsgRatingsMapper() {
  const { mappings, ratings } = DATA;
  const msciIssues = mappings.reduce((n, m) => n + m.msci_key_issues.length, 0);
  const djsiCriteria = mappings.reduce((n, m) => n + m.djsi_criteria.length, 0);
  const cdpAreas = new Set(mappings.flatMap((m) => m.cdp_areas)).size;
  const ecovadisCriteria = new Set(mappings.flatMap((m) => m.ecovadis_criteria)).size;

  return (
    <div className="space-y-5">

      {/* Compact ratings note (the Alignment header carries the full explainer). */}
      <p className="text-[13px] text-ink-muted leading-relaxed max-w-[74ch]">
        If your client is rated by <strong className="text-ink-body">MSCI</strong>, submits to the{" "}
        <strong className="text-ink-body">S&amp;P Global CSA / DJSI</strong>, discloses to <strong className="text-ink-body">CDP</strong>,
        or is assessed by <strong className="text-ink-body">EcoVadis</strong>, the BRSR data they&apos;re already collecting feeds
        all four. This maps <strong className="text-ink-body">which BRSR principle supports which scheme</strong>, at the principle
        level these assessments actually score (by issue and criterion, not by disclosure line).
      </p>

      {/* ── Rating definition cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-violet-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              MSCI
            </span>
            <span className="text-[15px] font-semibold text-stone-900">{ratings.msci.name}</span>
          </div>
          <p className="text-[13.5px] text-stone-600 leading-relaxed">{ratings.msci.what}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              DJSI
            </span>
            <span className="text-[15px] font-semibold text-stone-900">{ratings.djsi.name}</span>
          </div>
          <p className="text-[13.5px] text-stone-600 leading-relaxed">{ratings.djsi.what}</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              CDP
            </span>
            <span className="text-[15px] font-semibold text-stone-900">{ratings.cdp.name}</span>
          </div>
          <p className="text-[13.5px] text-stone-600 leading-relaxed">{ratings.cdp.what}</p>
        </div>
        <div className="bg-white border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
              ECOVADIS
            </span>
            <span className="text-[15px] font-semibold text-stone-900">{ratings.ecovadis.name}</span>
          </div>
          <p className="text-[13.5px] text-stone-600 leading-relaxed">{ratings.ecovadis.what}</p>
        </div>
      </div>

      {/* ── The P-A-R insight ──────────────────────────────────────────────
          EcoVadis scores every theme on Policies / Actions / Results, and BRSR
          Section B *is* policies while Section C *is* results. That structural
          overlap is the practical point of this whole tab, so it gets stated
          once, plainly, rather than buried in the EcoVadis card copy. The
          weights are EcoVadis's own, not ours. */}
      <div className="rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3.5">
        <p className="text-[13.5px] text-ink-body leading-relaxed mb-3">
          <strong className="font-semibold">Where BRSR already does the work:</strong> EcoVadis scores every theme on
          Policies, Actions and Results, and your BRSR sections line up with two of the three.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2.5">
          {[
            { pillar: "Policies",  weight: "25%", body: "BRSR Section B is this, almost line for line." },
            { pillar: "Actions",   weight: "40%", body: "The usual score gap: evidence the policy actually operates." },
            { pillar: "Results",   weight: "35%", body: "BRSR Section C performance data feeds this directly." },
          ].map((p) => (
            <div key={p.pillar} className="border-t border-rose-200/70 pt-2">
              <p className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-[13.5px] font-semibold text-rose-900">{p.pillar}</span>
                <span className="text-[12px] font-medium text-rose-700 tabular-nums">{p.weight}</span>
              </p>
              <p className="text-[12.5px] text-ink-muted leading-snug">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Crosswalk count chips ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap text-[11px]">
        <span className="text-stone-600">Across all 9 BRSR principles:</span>
        <span className="font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
          {msciIssues} MSCI Key Issues
        </span>
        <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
          {djsiCriteria} DJSI / CSA Criteria
        </span>
        <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
          {cdpAreas} CDP disclosure areas
        </span>
        <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
          {ecovadisCriteria} EcoVadis criteria
        </span>
      </div>

      {/* ── Principle-by-principle crosswalk ──────────────────────────────── */}
      <div className="space-y-2.5">
        {mappings.map((m) => (
          <div key={m.brsr_principle} className="border border-stone-200 rounded-xl bg-white overflow-hidden">
            {/* Principle header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 border-b border-stone-100">
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                {m.brsr_principle}
              </span>
              <span className="text-[15px] font-semibold text-stone-800">{m.principle_name}</span>
            </div>

            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3.5">
              <SchemeBlock
                label="MSCI Key Issues"
                sub={`${m.msci_pillar} pillar`}
                items={m.msci_key_issues}
                labelCls="text-violet-700"
                chipCls="text-violet-700 bg-violet-50 border border-violet-100"
                empty="Not scored by MSCI."
              />
              <SchemeBlock
                label="DJSI / S&P CSA Criteria"
                sub={m.djsi_dimension}
                items={m.djsi_criteria}
                labelCls="text-amber-700"
                chipCls="text-amber-700 bg-amber-50 border border-amber-100"
                empty="Not scored by the CSA."
              />
              <SchemeBlock
                label="CDP disclosure areas"
                items={m.cdp_areas}
                labelCls="text-emerald-700"
                chipCls="text-emerald-700 bg-emerald-50 border border-emerald-100"
                empty="Not covered, CDP is an environmental disclosure only."
              />
              <SchemeBlock
                label="EcoVadis criteria"
                sub={m.ecovadis_theme}
                items={m.ecovadis_criteria}
                labelCls="text-rose-700"
                chipCls="text-rose-700 bg-rose-50 border border-rose-100"
                empty="Not assessed by EcoVadis."
              />
            </div>

            {/* Note */}
            <p className="px-4 pb-3 text-[13px] text-stone-600 leading-relaxed">{m.note}</p>
          </div>
        ))}
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <p className="text-[12px] text-stone-500 leading-relaxed">
        MSCI Key Issues are scored 7–15 per sub-industry, so not every issue applies to every client. Names follow the
        latest published MSCI ESG Ratings and S&P Global CSA methodologies, CDP&apos;s full corporate questionnaire and the
        EcoVadis ratings methodology; every one of these is revised periodically and CDP restructures its questionnaire
        annually, so this maps to CDP&apos;s disclosure areas rather than to module numbers that move each year. Use it as a
        directional guide for which BRSR data supports each assessment, not as the assessment itself.
      </p>
    </div>
  );
}
