// A single disclosure row with its expanded detail panel. Field-level features
// (detected-in-last-year, best practices, SEBI source, and calculators)
// render inside the expanded panel.
import type { ChecklistItem } from "@/lib/types";
import type { DisclosureMatch } from "@/lib/report-extractor";
import {
  STATUS_META, type StatusKey, plain, BEST_PRACTICES,
  SEBI_BRSR_FORMAT_URL, principleNumber,
} from "./constants";
import type { CalcInputs } from "@/lib/emissions-calculator";
import EmissionsCalculator from "./EmissionsCalculator";
import explainersData from "@/data/brsr_field_explainers.json";

// Pre-generated, AI-written plain-English explanation per BRSR field. Static data
// (generated once via scripts/generate-field-explainers.mjs) — zero runtime tokens,
// no network call, nothing about the client is sent anywhere.
const EXPLAINERS = (explainersData as { explainers: Record<string, string> }).explainers;

// Fields that get an embedded calculator, and which mode each uses.
const CALC_MODES: Partial<Record<string, "energy" | "ghg" | "water">> = {
  "P6-E1": "energy",
  "P6-E7": "ghg",
  "P6-E3": "water",
};

// Pill border per status — pairs with STATUS_META bg/text for a Vanta-style status chip.
const STATUS_PILL_BORDER: Record<StatusKey, string> = {
  already_tracked:   "border-emerald-200",
  partially_tracked: "border-amber-200",
  new_data_needed:   "border-orange-200",
  not_applicable:    "border-slate-200",
};

export default function DisclosureRow({
  item, isOdd, expanded, onToggle, isCollected, onToggleCollected, detectedMatch,
  calcInputs, onCalcChange,
}: {
  item: ChecklistItem;
  isOdd: boolean;
  expanded: boolean;
  onToggle: () => void;
  isCollected: boolean;
  onToggleCollected: () => void;
  detectedMatch?: DisclosureMatch | null;
  calcInputs: CalcInputs;
  onCalcChange: (key: keyof CalcInputs, value: string) => void;
}) {
  const s = STATUS_META[item.status as StatusKey];
  const isNA = item.status === "not_applicable";
  const isDetected = !!detectedMatch && !isNA;
  const explainer = EXPLAINERS[item.id];

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
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] text-stone-400 font-mono">{item.id}</p>
              {isDetected && !isCollected && (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-brand-700
                  bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-full leading-none">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M7.5 4v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="7.5" cy="7.5" r="5.5" />
                  </svg>
                  Last year
                </span>
              )}
            </div>
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

        {/* Status pill + expand chevron */}
        <div className="flex items-center gap-1.5 w-[145px] flex-shrink-0">
          {isCollected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
              bg-emerald-100 text-emerald-700 border border-emerald-200">
              <svg key="row-checked" aria-hidden="true" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path className="check-path" d="M5 13l4 4L19 7" />
              </svg>
              Collected
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border
              ${s.bg} ${s.text} ${STATUS_PILL_BORDER[item.status as StatusKey]}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
              {s.short}
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
          <div className="bg-stone-100/70 border border-stone-200/80 rounded-lg p-3 space-y-3">

            {/* In plain English — AI-written, precomputed, on-device (no live call) */}
            {explainer && (
              <div className="bg-white border border-stone-200 rounded-lg px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-700 mb-1.5 flex items-center gap-1.5">
                  In plain English
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l1.6 4.8L18 8.4l-4.4 1.6L12 15l-1.6-5L6 8.4l4.4-1.6L12 2z" />
                    </svg>
                    AI-written
                  </span>
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">{explainer}</p>
                <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">
                  General explanation to aid understanding, not legal advice. Written from the public SEBI/ICAI definition; nothing about your client is used.
                </p>
              </div>
            )}

            {/* Not-applicable explainer — service-sector clients skip this */}
            {isNA && (
              <div className="bg-slate-100 border border-slate-200 rounded-md px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 mb-1.5">
                  Why not applicable?
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  This is a manufacturing/product-specific disclosure (e.g. stack air emissions,
                  industrial effluent, product end-of-life reclaim, or project EIAs). Pure
                  service-sector entities normally report it as <span className="font-medium">"Not applicable"</span> in their BRSR.
                  Confirm with your client — switch <span className="font-medium">Business Type</span> to Product/Manufacturing if any of these apply.
                </p>
              </div>
            )}

            {/* Detected in uploaded report — consultant confirms */}
            {isDetected && detectedMatch && (
              <div className="bg-brand-50 border border-brand-100 rounded-md px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-700 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M7.5 4v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="7.5" cy="7.5" r="5.5" />
                  </svg>
                  Found in last year's report
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Matched: {detectedMatch.keywords.map((k, i) => (
                    <span key={i} className="inline-block font-medium text-[13px] text-brand-700 bg-white border border-brand-100 px-1.5 py-0.5 rounded mr-1 mb-1">
                      {k}
                    </span>
                  ))}
                </p>
                <p className="text-[13px] text-stone-500 italic leading-relaxed mt-1.5 border-l-2 border-brand-200 pl-2.5">
                  {detectedMatch.snippet}
                </p>
                <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                  Detected from text — verify last year's disclosure is still accurate before reusing it, then mark it collected below.
                </p>
              </div>
            )}

            {/* ── Action card (raised) — what to actually do: pull-from, gap, how to collect ── */}
            {(item.source_filing || item.gap_note || item.measurement_guidance) && (
            <div className="bg-white border border-stone-200 rounded-lg p-3.5 shadow-[0_1px_4px_rgba(80,60,30,0.06)] space-y-3.5">

            {/* Source filing — shown when data comes from an existing compliance report */}
            {item.source_filing && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-700 mb-1.5">
                  Pull from
                </p>
                <span className="inline-flex items-center text-[13px] font-medium text-stone-700
                  bg-stone-100 border border-stone-200 px-2.5 py-1 rounded">
                  {item.source_filing}
                </span>
              </div>
            )}

            {/* Gap note */}
            {item.gap_note && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-700 mb-1.5">
                  Gap — what's missing
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">{item.gap_note}</p>
              </div>
            )}

            {/* Measurement guidance */}
            {item.measurement_guidance && (
              <div className={item.gap_note ? "border-t border-stone-200 pt-3.5" : ""}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-700 mb-1.5">
                  How to collect?
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">{item.measurement_guidance}</p>
              </div>
            )}

            </div>
            )}

            {/* Embedded calculator — its own raised card (energy P6-E1, GHG P6-E7, water P6-E3) */}
            {!isNA && CALC_MODES[item.id] && (
              <EmissionsCalculator
                mode={CALC_MODES[item.id]!}
                inputs={calcInputs}
                onChange={onCalcChange}
              />
            )}

            {/* Reference — best practices + verbatim SEBI language, source & unit.
                Tiered behind one disclosure so the open row leads with the next
                ACTION (gap, how to collect, calculator), not a regulatory essay. */}
            {(() => {
              const hasBP = !isNA && !!BEST_PRACTICES[item.principle];
              return (
            <details className="group bg-white/60 border border-stone-200/70 rounded-lg px-3.5 py-3">
              <summary className="flex items-center gap-1.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden
                text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 hover:text-stone-800 transition-colors">
                <svg aria-hidden="true" className="w-3 h-3 flex-shrink-0 transition-transform duration-200 group-open:rotate-90"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {hasBP ? "Best practices & SEBI reference" : "SEBI reference — verbatim language, source & unit"}
              </summary>

              <div className="mt-3.5 space-y-4">

                {/* Best practices — principle-level, India + International. Hidden for N/A. */}
                {hasBP && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-700 mb-2.5">
                      Best practices
                      <span className="font-normal text-stone-400 normal-case tracking-normal">
                        {" "}— how leaders address {item.principle} ({BEST_PRACTICES[item.principle].name})
                      </span>
                    </p>
                    <div className="space-y-3">
                      {BEST_PRACTICES[item.principle].india.length > 0 && (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded mb-2">
                            India
                          </span>
                          <ul className="space-y-2">
                            {BEST_PRACTICES[item.principle].india.map((bp, i) => (
                              <li key={`in-${i}`} className="flex gap-2 text-sm text-stone-600 leading-relaxed">
                                <span className="mt-2 w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                                <span>{bp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {BEST_PRACTICES[item.principle].international.length > 0 && (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded mb-2">
                            International
                          </span>
                          <ul className="space-y-2">
                            {BEST_PRACTICES[item.principle].international.map((bp, i) => (
                              <li key={`int-${i}`} className="flex gap-2 text-sm text-stone-600 leading-relaxed">
                                <span className="mt-2 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                                <span>{bp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SEBI verbatim */}
                <div className={hasBP ? "border-t border-stone-200 pt-4" : ""}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-700 mb-1.5">
                    SEBI language
                  </p>
                  <p className="text-sm text-stone-500 leading-relaxed italic">{item.label}</p>
                </div>

                {/* SEBI source — link to the official BRSR Format + page citation */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-700 mb-1.5">
                    SEBI source
                  </p>
                  <a
                    href={SEBI_BRSR_FORMAT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-700
                      bg-brand-50 border border-brand-100 px-2.5 py-1.5 rounded-md
                      hover:bg-brand-100 hover:border-brand-200 transition-colors pressable"
                  >
                    <svg aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2.5" y="1.5" width="8" height="12" rx="1" />
                      <path d="M5 5h3M5 7.5h3M5 10h2" />
                    </svg>
                    SEBI BRSR Format — Principle {principleNumber(item.principle)}
                    <svg aria-hidden="true" className="w-2.5 h-2.5 flex-shrink-0 opacity-70" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5.5 3h6.5v6.5M12 3L4 11" />
                    </svg>
                  </a>
                  <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                    Official SEBI disclosure format (Annexure II, 2023).
                    {item.page ? <> Cross-reference: ICAI Background Material, p.{item.page}.</> : null}
                  </p>
                </div>

                {/* Unit */}
                {item.unit && (
                  <p className="text-[11px] text-stone-400">
                    Unit: <span className="font-medium text-stone-500">{item.unit}</span>
                  </p>
                )}
              </div>
            </details>
              );
            })()}

            {/* ── Mark as collected ──────────────────────────────────────── */}
            {!isNA && (
            <div className="flex items-center justify-between gap-3 px-0.5 pt-1">
              <p className="text-[11px] text-stone-400 leading-relaxed">
                {isCollected
                  ? "You've marked this data as collected."
                  : "Already have this data? Mark it as collected to track your progress."}
              </p>
              <button
                onClick={onToggleCollected}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                  text-[13px] font-semibold pressable transition-colors ${
                    isCollected
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
              >
                {isCollected ? (
                  <>
                    {/* Checkmark draws in — key forces remount so animation fires on each collect */}
                    <svg key="checked" aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path className="check-path" d="M5 13l4 4L19 7" />
                    </svg>
                    Collected — undo
                  </>
                ) : (
                  <>
                    <svg key="unchecked" aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
