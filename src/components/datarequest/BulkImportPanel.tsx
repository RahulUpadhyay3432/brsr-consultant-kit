"use client";

// Headline "Auto-fill from your documents" surface (Collect / paid tier).
// The consultant uploads the client's existing documents (last year's BRSR,
// the annual report, bills, policies). Each file's text is extracted IN THE
// BROWSER (pdf.js — the file never leaves the device); only that text is sent
// to a grounded server action that returns figure suggestions across the whole
// BRSR skeleton, each with its source line + source document. The consultant
// verifies + edits, then applies the ones they trust — nothing is saved until
// they do, and the model never invents a number.

import { useRef, useState, useTransition } from "react";
import { extractPdfText } from "@/lib/pdf-extract";
import type {
  BulkSuggestion,
  BulkImportResult,
} from "@/lib/datarequest/importer";

type Confidence = BulkSuggestion["confidence"];

const CONF_META: Record<Confidence, { label: string; cls: string }> = {
  high: { label: "High", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  medium: { label: "Medium", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  low: { label: "Low", cls: "text-slate-500 bg-slate-100 border-slate-200" },
};

const SECTION_META: Record<BulkSuggestion["section"], string> = {
  A: "Section A · General disclosures",
  B: "Section B · Management & process",
  C: "Section C · Principle-wise performance",
};

const SECTION_ORDER: BulkSuggestion["section"][] = ["A", "B", "C"];

// A stable key per suggestion (fieldId is the join key for apply).
function rowKey(s: BulkSuggestion) {
  return s.fieldId;
}

export default function BulkImportPanel({
  campaignId,
  bulkAction,
  applyAction,
}: {
  campaignId: string;
  bulkAction: (
    campaignId: string,
    docs: { name: string; text: string }[],
  ) => Promise<BulkImportResult>;
  applyAction: (
    campaignId: string,
    accepted: { fieldId: string; value: string }[],
  ) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<BulkSuggestion[] | null>(null);
  const [truncated, setTruncated] = useState(false);
  // ticked rows + per-row edited values, keyed by fieldId
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setSuggestions(null);
    setTruncated(false);
    setTicked({});
    setValues({});
    setCollapsed({});
    setMsg(null);
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) e.target.value = ""; // allow re-selecting the same file later
    if (!files.length) return;
    reset();
    try {
      const docs: { name: string; text: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        setBusy(
          files.length === 1
            ? "Reading your document…"
            : `Reading document ${i + 1} of ${files.length}…`,
        );
        const { text } = await extractPdfText(files[i]);
        if (text.trim()) docs.push({ name: files[i].name, text });
      }
      if (!docs.length) {
        setBusy(null);
        setMsg(
          "These look like scanned PDFs (no selectable text found). Upload text-based PDFs — ones you can select text in.",
        );
        return;
      }
      setBusy("Filling the BRSR skeleton from your documents…");
      const result = await bulkAction(campaignId, docs);
      setBusy(null);
      if (!result.configured) {
        setMsg("AI auto-fill isn't configured on this deployment yet.");
        return;
      }
      if (result.suggestions.length === 0) {
        setMsg(
          "The AI didn't find any BRSR figures in these documents. Try a report that contains the numbers (last year's BRSR or the annual report work best), or enter values by hand.",
        );
        return;
      }
      const initTicked: Record<string, boolean> = {};
      const initValues: Record<string, string> = {};
      for (const s of result.suggestions) {
        initTicked[s.fieldId] = s.confidence !== "low";
        initValues[s.fieldId] = s.value;
      }
      setTicked(initTicked);
      setValues(initValues);
      setSuggestions(result.suggestions);
      setTruncated(result.truncated);
    } catch {
      setBusy(null);
      setMsg("Could not read one of those files. Please try different PDFs.");
    }
  }

  function selectAllHigh() {
    if (!suggestions) return;
    setTicked((prev) => {
      const next = { ...prev };
      for (const s of suggestions) {
        if (s.confidence === "high") next[s.fieldId] = true;
      }
      return next;
    });
  }

  function apply() {
    if (!suggestions) return;
    const accepted = suggestions
      .filter((s) => ticked[s.fieldId])
      .map((s) => ({ fieldId: s.fieldId, value: values[s.fieldId] ?? s.value }));
    if (!accepted.length) return;
    startTransition(async () => {
      await applyAction(campaignId, accepted);
      // applyAction redirects server-side on success.
    });
  }

  const acceptedCount = suggestions
    ? suggestions.filter((s) => ticked[s.fieldId]).length
    : 0;

  // Group suggestions: Section → Principle, preserving input order within each.
  const grouped: Record<
    string,
    { principle: string; rows: BulkSuggestion[] }[]
  > = {};
  if (suggestions) {
    for (const sec of SECTION_ORDER) grouped[sec] = [];
    for (const s of suggestions) {
      const bucket = grouped[s.section] ?? (grouped[s.section] = []);
      const pname = s.principle ?? "General";
      let g = bucket.find((x) => x.principle === pname);
      if (!g) {
        g = { principle: pname, rows: [] };
        bucket.push(g);
      }
      g.rows.push(s);
    }
  }

  return (
    <div className="bg-white border border-line rounded-xl p-6 shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-tint text-brand-700 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[19px] font-bold text-ink leading-tight">
            Auto-fill from your documents
          </h2>
          <p className="text-[13px] text-ink-body mt-1 leading-relaxed">
            Already have the client&apos;s documents? Upload last year&apos;s BRSR,
            the annual report, bills or policies and the AI fills the BRSR
            skeleton for you to verify. Files stay in your browser; the AI only
            suggests values it finds, with the source shown.
          </p>
        </div>
      </div>

      {/* Upload control */}
      {!suggestions && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={!!busy}
            className="inline-flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest/90 disabled:opacity-60 transition-colors duration-200 pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {busy ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
                {busy}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
                Choose PDFs
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={onFiles}
            className="hidden"
          />
          <p className="mt-2.5 text-[12px] text-ink-muted leading-relaxed">
            You can select several PDFs at once. Each is read locally in your browser before anything is sent.
          </p>
          {msg && (
            <p className="mt-3 text-[12.5px] text-ink-body leading-relaxed">{msg}</p>
          )}
        </div>
      )}

      {/* Review surface */}
      {suggestions && (
        <div className="mt-5">
          {/* Amber verify banner */}
          <div className="flex items-start gap-2.5 text-[12px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 leading-relaxed">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            <span>
              <span className="font-semibold">Verify before applying</span> — the AI
              only suggests values found in your documents, with the source shown.
              Nothing is saved until you apply.
            </span>
          </div>

          {truncated && (
            <p className="mt-3 text-[11.5px] text-ink-muted leading-relaxed">
              Note: these are long documents — only the first part of each was
              scanned. For anything missing, upload the specific section or enter
              it by hand.
            </p>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mt-4 mb-2">
            <p className="text-[12.5px] text-ink-muted">
              <span className="font-semibold text-ink">{suggestions.length}</span>{" "}
              {suggestions.length === 1 ? "suggestion" : "suggestions"} ·{" "}
              <span className="font-semibold text-brand-700 tabular-nums">{acceptedCount}</span>{" "}
              ticked
            </p>
            <button
              type="button"
              onClick={selectAllHigh}
              className="text-[12px] font-semibold text-brand-700 hover:text-brand-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 rounded px-1"
            >
              Select all high-confidence
            </button>
          </div>

          {/* Grouped rows */}
          <div className="space-y-4">
            {SECTION_ORDER.filter((sec) => (grouped[sec]?.length ?? 0) > 0).map((sec) => {
              const principles = grouped[sec];
              const secCount = principles.reduce((n, g) => n + g.rows.length, 0);
              const secCollapsed = collapsed[`sec_${sec}`];
              return (
                <div key={sec} className="border border-line rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((p) => ({ ...p, [`sec_${sec}`]: !p[`sec_${sec}`] }))
                    }
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-tint hover:bg-tint/70 transition-colors duration-150 text-left focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <span className="text-[12.5px] font-semibold text-ink">
                      {SECTION_META[sec]}
                    </span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] font-mono text-ink-muted tabular-nums">{secCount}</span>
                      <svg
                        className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${secCollapsed ? "" : "rotate-180"}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {!secCollapsed && (
                    <div className="divide-y divide-line">
                      {principles.map((g) => (
                        <div key={g.principle}>
                          <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                              {g.principle}
                            </span>
                            <span className="text-[10px] font-mono text-ink-muted tabular-nums">
                              ({g.rows.length})
                            </span>
                          </div>
                          <div className="px-2 pb-2 space-y-1">
                            {g.rows.map((s) => {
                              const key = rowKey(s);
                              return (
                                <label
                                  key={key}
                                  className="flex items-start gap-3 px-2.5 py-2.5 rounded-lg hover:bg-page transition-colors duration-150 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!ticked[s.fieldId]}
                                    onChange={(e) =>
                                      setTicked((p) => ({ ...p, [s.fieldId]: e.target.checked }))
                                    }
                                    className="mt-1 accent-[#0E4A36] focus:outline-none focus:ring-2 focus:ring-brand-400 rounded"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10.5px] font-mono font-semibold text-ink-muted">
                                        {s.fieldId}
                                      </span>
                                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${CONF_META[s.confidence].cls}`}>
                                        {CONF_META[s.confidence].label} confidence
                                      </span>
                                    </span>
                                    <span
                                      className="block text-[12.5px] text-ink-body leading-snug mt-0.5"
                                      title={s.label}
                                    >
                                      {s.label}
                                    </span>
                                    {s.source && (
                                      <span
                                        className="block text-[11px] text-ink-muted italic leading-snug mt-1 line-clamp-2"
                                        title={s.source}
                                      >
                                        &ldquo;{s.source}&rdquo;
                                      </span>
                                    )}
                                    {s.sourceDoc && (
                                      <span className="flex items-center gap-1 text-[10.5px] text-ink-muted mt-1" title={s.sourceDoc}>
                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                          <path d="M14 2v6h6" />
                                        </svg>
                                        <span className="truncate max-w-[180px]">{s.sourceDoc}</span>
                                      </span>
                                    )}
                                  </span>
                                  <span
                                    className="flex items-center gap-1.5 flex-shrink-0"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <input
                                      value={values[s.fieldId] ?? ""}
                                      onChange={(e) =>
                                        setValues((p) => ({ ...p, [s.fieldId]: e.target.value }))
                                      }
                                      className="w-24 h-8 px-2 text-[13px] text-ink text-right tabular-nums bg-white border border-line rounded-md focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400 transition-colors duration-150"
                                    />
                                    {s.unit && (
                                      <span
                                        className="text-[11px] text-ink-muted whitespace-nowrap w-10 truncate"
                                        title={s.unit}
                                      >
                                        {s.unit}
                                      </span>
                                    )}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Apply bar */}
          <div className="flex items-center gap-3 pt-4 mt-2 border-t border-line">
            <button
              type="button"
              onClick={apply}
              disabled={acceptedCount === 0 || isPending}
              className="inline-flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Applying…
                </>
              ) : (
                <>Apply {acceptedCount > 0 ? acceptedCount : ""} {acceptedCount === 1 ? "value" : "values"} →</>
              )}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={isPending}
              className="text-[12.5px] text-ink-muted hover:text-ink-body disabled:opacity-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 rounded px-1"
            >
              Upload different files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
