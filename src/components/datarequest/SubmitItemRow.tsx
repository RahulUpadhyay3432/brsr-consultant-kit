"use client";
import { useState } from "react";
import { validateItemValue } from "@/lib/datarequest/validation";

export interface SubmitItem {
  id: string;
  label: string;
  unit: string | null;
  kind: string;
  value: string | null;
  priorValue: string | null;
  evidenceName: string | null;
}

// One field on the owner's no-login submission form. Adds two things over a plain
// input: (a) last year's figure shown inline with a one-tap "Same" to reuse it, and
// (b) a gentle live sanity warning (e.g. "12x last year") that never blocks submit.
export default function SubmitItemRow({
  item,
  thisYearLabel,
  prevYearLabel,
}: {
  item: SubmitItem;
  thisYearLabel: string;
  prevYearLabel: string;
}) {
  const [cur, setCur] = useState(item.value ?? "");
  const [prior, setPrior] = useState(item.priorValue ?? "");
  const [touched, setTouched] = useState(false);

  const sanity = validateItemValue(item, cur, prior);
  const showWarning = touched && cur.trim() !== "" && sanity.level === "warn";

  return (
    <div className="bg-white border border-line rounded-xl px-4 py-3.5">
      <span className="block text-[13.5px] font-semibold text-ink">
        {item.label}
        {item.unit && <span className="text-stone-500 font-normal"> ({item.unit})</span>}
      </span>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[11px] font-medium text-stone-500 mb-1">{thisYearLabel}</span>
          <input
            name={`f_${item.id}`}
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Enter value"
            className={`w-full h-10 px-3 text-[13.5px] text-stone-800 bg-stone-50 border rounded-lg transition-colors
              focus:outline-none focus:bg-white focus:ring-2 ${
                showWarning
                  ? "border-amber-300 focus:border-amber-400 focus:ring-amber-100"
                  : "border-stone-200 focus:border-brand-400 focus:ring-brand-100"
              }`}
          />
          {item.priorValue && (
            <span className="mt-1 flex items-center gap-1.5 text-[11.5px] text-stone-500">
              Last year: <span className="font-medium text-stone-700">{item.priorValue}</span>
              <button
                type="button"
                onClick={() => { setCur(item.priorValue ?? ""); setTouched(true); }}
                className="text-brand-700 hover:text-brand-800 underline decoration-stone-300 hover:decoration-brand-500 transition-colors"
              >
                Same
              </button>
            </span>
          )}
        </label>

        <label className="block">
          <span className="block text-[11px] text-stone-500 mb-1">{prevYearLabel} (optional)</span>
          <input
            name={`pf_${item.id}`}
            value={prior}
            onChange={(e) => setPrior(e.target.value)}
            placeholder="Last year"
            className="w-full h-10 px-3 text-[13.5px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg
              focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
          />
        </label>
      </div>

      {showWarning && (
        <p className="mt-2 flex items-start gap-1.5 text-[12px] text-amber-700 leading-snug">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-px text-amber-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 1.5l6.5 11.5h-13L8 1.5z" /><path d="M8 6.5v3M8 11.5h.01" />
          </svg>
          {sanity.message} You can still submit if it&apos;s right.
        </p>
      )}

      {/* Optional supporting document, backs the figure for assurance. */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <input
          type="file"
          name={`file_${item.id}`}
          accept=".pdf,image/*,.xlsx,.xls,.csv"
          aria-label={`Attach the supporting bill or invoice for ${item.label}`}
          className="block max-w-full text-[12px] text-stone-500 cursor-pointer
            file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-stone-200
            file:text-[12px] file:font-medium file:text-stone-600 file:bg-stone-50 hover:file:bg-stone-100
            file:cursor-pointer file:transition-colors"
        />
        {item.evidenceName ? (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-emerald-700">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
            {item.evidenceName} attached
          </span>
        ) : (
          <span className="text-[11.5px] text-stone-500">Attach the bill / invoice (optional)</span>
        )}
      </div>
    </div>
  );
}
