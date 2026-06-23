"use client";

// The product walkthrough — one source of truth for the sequence a new user
// should follow. WALKTHROUGH_STEPS + StepRow are reused by the first-run
// "Start here" card here and by the always-on Help widget (HelpWidget.tsx).

export interface WalkStep {
  n: number;
  title: string;
  body: string;
}

export const WALKTHROUGH_STEPS: WalkStep[] = [
  {
    n: 1,
    title: "Add their existing filings",
    body:
      "On the intake form, tick the client's existing compliance filings (PCB, EPR, PAT and so on). This is what powers the gap analysis: the tool shows what's already covered so you don't collect it twice.",
  },
  {
    n: 2,
    title: "Work the Action Plan",
    body:
      "Open Action Plan to see all 108 BRSR fields colour-coded — Ready to pull, Needs verification, or Collect fresh. Expand any row for the source, how to collect it, best practices and the SEBI citation. Tick items off as you go.",
  },
  {
    n: 3,
    title: "Check Materiality & Alignment",
    body:
      "Materiality suggests the ESG topics that matter for the client's industry. Alignment maps every BRSR field to GRI, TCFD, IFRS and TNFD, plus MSCI and DJSI, so one round of collection serves every report.",
  },
  {
    n: 4,
    title: "Export and share",
    body:
      "Export CSV for the full working checklist, or Download PDF for a clean, plain-English data-request brief you can send straight to the client's team.",
  },
];

export function StepRow({ step }: { step: WalkStep }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 flex-shrink-0 rounded-full bg-forest text-white flex items-center justify-center text-[12px] font-semibold tabular-nums">
        {step.n}
      </div>
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold text-stone-800 leading-snug">{step.title}</p>
        <p className="text-[12.5px] text-stone-500 leading-relaxed mt-0.5">{step.body}</p>
      </div>
    </div>
  );
}

// ── First-run "Start here" card (Overview) ──────────────────────────────────
export function WalkthroughCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="anim-card rounded-xl border border-brand-200 bg-brand-50/60 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 5.6L20 8.2l-4 4 1 5.8L12 15.3 7 18l1-5.8-4-4 5.6-.6L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-stone-900">New here? Here&apos;s the sequence</p>
            <p className="text-[12px] text-stone-500">Four steps from a blank format to a client-ready plan.</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-[12.5px] font-medium text-stone-500 hover:text-stone-800 px-2.5 py-1 rounded-lg hover:bg-white/70 transition-colors pressable flex-shrink-0"
        >
          Got it
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-5">
        {WALKTHROUGH_STEPS.map((s) => (
          <StepRow key={s.n} step={s} />
        ))}
      </div>
      <p className="text-[11.5px] text-stone-400 mt-5">
        You can reopen this any time from the <span className="font-medium text-stone-500">Help</span> button (bottom-right).
      </p>
    </div>
  );
}
