"use client";
import { useEffect, useState } from "react";

export interface TourStep { tab: string; title: string; blurb: string; }

// Steps for the report walkthrough. As each step activates it switches the view
// (via onNavigate), so the real content changes behind the tour card and the
// sidebar's active-tab styling highlights the current step for free.
export const REPORT_TOUR_STEPS: TourStep[] = [
  { tab: "overview",    title: "Overview",     blurb: "Start here: your client's readiness at a glance, how many of the 108 fields are ready to pull, need checking, or must be collected fresh." },
  { tab: "checklist",   title: "Action Plan",  blurb: "The core of the report. Every BRSR field, grouped by principle. Expand a row for the gap, the exact SEBI wording, and how to collect it. Emissions calculators live here." },
  { tab: "materiality", title: "Materiality",  blurb: "A suggested shortlist of the ESG topics that matter most for this sector, a starting point for the client's own stakeholder process." },
  { tab: "alignment",   title: "Alignment",    blurb: "How each BRSR disclosure maps to GRI, TCFD, IFRS S1/S2 and TNFD, exportable as a crosswalk for multi-framework reporting." },
  { tab: "beyond-brsr", title: "Beyond BRSR",  blurb: "A quick CBAM and CCTS in-scope readiness check, based on this client's sector and export markets." },
];

export default function GuidedTour({
  steps,
  onNavigate,
  onClose,
}: {
  steps: TourStep[];
  onNavigate: (tab: string) => void;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const step = steps[i];
  const last = i === steps.length - 1;

  // Switch the view to the current step's tab whenever the step changes.
  useEffect(() => { onNavigate(step.tab); /* eslint-disable-next-line */ }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Very light scrim: reads as a layer without hiding the content it describes. */}
      <div className="no-print fixed inset-0 z-40 bg-forest/10 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label="Guided tour"
        className="no-print anim-card fixed z-50 bottom-6 left-1/2 -translate-x-1/2 w-[min(440px,calc(100vw-2rem))]
          rounded-2xl bg-white border border-brand-200 shadow-elev-3 overflow-hidden"
      >
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
              Tour · {i + 1} of {steps.length}
            </span>
            <button onClick={onClose} aria-label="End tour" className="pressable text-ink-faint hover:text-ink text-[12.5px] font-medium">
              Skip
            </button>
          </div>
          <p className="text-[16px] font-semibold text-ink">{step.title}</p>
          <p className="text-[13.5px] text-ink-muted leading-relaxed mt-1">{step.blurb}</p>
          <div className="flex items-center gap-1.5 mt-3.5">
            {steps.map((_, k) => (
              <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-brand-600" : "w-1.5 bg-brand-200"}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-band border-t border-line">
          <button
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i === 0}
            className="pressable text-[13.5px] font-medium text-ink-body disabled:opacity-40 disabled:pointer-events-none"
          >
            Back
          </button>
          <button
            onClick={() => (last ? onClose() : setI((v) => v + 1))}
            className="pressable inline-flex items-center gap-1.5 rounded-lg bg-forest text-white text-[13.5px] font-semibold px-4 py-2 hover:bg-forest-light transition-colors"
          >
            {last ? "Done" : "Next"}
            {!last && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
