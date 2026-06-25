"use client";

// Compliance importer (Collect / paid tier). Upload a client's existing report;
// the text is extracted IN THE BROWSER (pdf.js — the file never leaves the device),
// then only that text is sent to a grounded server action that returns figure
// suggestions mapped to this campaign's fields, each with its source sentence. The
// consultant verifies + edits, then applies the ones they trust — nothing is saved
// until they do, and the model never invents a number.

import { useRef, useState } from "react";
import { extractPdfText } from "@/lib/pdf-extract";
import type { ImportResult, ImportSuggestion, Confidence } from "@/lib/datarequest/importer";

const CONF_META: Record<Confidence, { label: string; cls: string }> = {
  high: { label: "High", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  medium: { label: "Medium", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  low: { label: "Low", cls: "text-stone-500 bg-stone-100 border-stone-200" },
};

export default function ImportPanel({
  importAction,
  applyAction,
  hasItems,
}: {
  importAction: (text: string) => Promise<ImportResult>;
  applyAction: (formData: FormData) => void | Promise<void>;
  hasItems: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ImportSuggestion[] | null>(null);
  const [truncated, setTruncated] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setMsg(null);
    setSuggestions(null);
    setTruncated(false);
    try {
      setBusy("Reading the document…");
      const { text } = await extractPdfText(file);
      if (!text.trim()) {
        setBusy(null);
        setMsg("This looks like a scanned PDF (no text found). Upload a text-based PDF — one you can select text in.");
        return;
      }
      setBusy("Finding figures…");
      const result = await importAction(text);
      setBusy(null);
      if (!result.configured) {
        setMsg("AI import isn't configured on this deployment yet.");
        return;
      }
      if (result.suggestions.length === 0) {
        setMsg("No figures in this document matched the fields you're collecting. Try a report that contains the numbers, or add the fields to a data owner first.");
        return;
      }
      setSuggestions(result.suggestions);
      setTruncated(result.truncated);
    } catch {
      setBusy(null);
      setMsg("Could not read that file. Please try a different PDF.");
    }
  }

  if (!open) {
    if (!hasItems) {
      return (
        <p className="text-[12px] text-stone-400 text-center px-4 py-2 leading-relaxed">
          Tip: add a data owner with their fields first, then you can import an existing report to pre-fill those figures.
        </p>
      );
    }
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13.5px] font-semibold
          text-stone-600 bg-white border border-dashed border-stone-300 hover:border-brand-400 hover:text-brand-700
          hover:bg-brand-50/40 transition-colors pressable"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
        Import figures from an existing report
      </button>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-stone-800">Import from an existing report</p>
        <button
          onClick={() => { setOpen(false); setSuggestions(null); setMsg(null); setBusy(null); }}
          className="text-[12.5px] text-stone-400 hover:text-stone-600 transition-colors"
        >
          Cancel
        </button>
      </div>
      <p className="text-[12px] text-stone-500 mt-0.5 mb-4 leading-relaxed">
        Upload last year's BRSR or annual report. The figures it can find are pre-filled below for you to verify —
        the file is read in your browser, and the AI only suggests numbers that appear in the document, with the source line shown. Nothing is invented.
      </p>

      {/* Upload control */}
      {!suggestions && (
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={!!busy}
            className="inline-flex items-center gap-2 bg-forest text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg hover:bg-forest-light disabled:opacity-60 transition-colors pressable"
          >
            {busy ?? "Choose a PDF"}
          </button>
          <input ref={fileRef} type="file" accept="application/pdf" onChange={onFile} className="hidden" />
          {msg && <p className="mt-3 text-[12.5px] text-stone-600 leading-relaxed">{msg}</p>}
        </div>
      )}

      {/* Review surface */}
      {suggestions && (
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Imported — verify before applying. Nothing is saved until you apply; numbers are never invented.
          </div>
          {truncated && (
            <p className="mb-3 text-[11.5px] text-stone-500 leading-relaxed">
              Note: this is a long document — only the first part was scanned. For anything missing, upload the specific section or enter it by hand.
            </p>
          )}

          <form action={applyAction} className="space-y-2">
            {suggestions.map((s) => (
              <label
                key={s.itemId}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50/60 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="apply"
                  value={s.itemId}
                  defaultChecked={s.confidence !== "low"}
                  className="mt-1 accent-[#0E4A36]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10.5px] font-mono font-semibold text-stone-500">{s.fieldId}</span>
                    <span className={`text-[9px] font-semibold px-1 py-0.5 rounded-full border ${CONF_META[s.confidence].cls}`}>
                      {CONF_META[s.confidence].label} confidence
                    </span>
                  </span>
                  <span className="block text-[12.5px] text-stone-700 leading-snug mt-0.5">{s.label}</span>
                  {s.source && (
                    <span className="block text-[11px] text-stone-400 italic leading-snug mt-1 line-clamp-2" title={s.source}>
                      “{s.source}”
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1.5 flex-shrink-0">
                  <input
                    name={`value_${s.itemId}`}
                    defaultValue={s.value}
                    onClick={(e) => e.preventDefault()}
                    className="w-24 h-8 px-2 text-[13px] text-stone-800 text-right tabular-nums bg-white border border-stone-200 rounded-md focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
                  />
                  {s.unit && <span className="text-[11px] text-stone-400 whitespace-nowrap w-10 truncate" title={s.unit}>{s.unit}</span>}
                </span>
              </label>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable"
              >
                Apply ticked figures →
              </button>
              <button
                type="button"
                onClick={() => { setSuggestions(null); setMsg(null); }}
                className="text-[12.5px] text-stone-500 hover:text-stone-700 transition-colors"
              >
                Import a different file
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
