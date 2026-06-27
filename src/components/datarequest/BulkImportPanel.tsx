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
  DocCategory,
} from "@/lib/datarequest/importer";

type Confidence = BulkSuggestion["confidence"];

// Per-PDF content category the consultant tags before extracting, so the AI is
// scoped to (and told about) the right BRSR sections — sharper, more accurate hits.
const CATEGORY_OPTIONS: { value: DocCategory; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: "brsr", label: "Last year's BRSR" },
  { value: "annual", label: "Annual report" },
  { value: "energy", label: "Energy & fuel bills" },
  { value: "hr", label: "HR & headcount" },
  { value: "water", label: "Water & waste" },
  { value: "policies", label: "Policies & governance" },
  { value: "other", label: "Other" },
];

// The category-FIRST picker shown before a file is chosen: the meaningful document
// types, each with a one-line "what the AI reads" hint so the consultant tags up
// front (the choice scopes which BRSR fields the AI extracts — sharper, more accurate).
const CATEGORY_PICKS: { value: DocCategory; label: string; hint: string }[] = [
  { value: "brsr",     label: "Last year's BRSR",      hint: "Every section — the richest source" },
  { value: "annual",   label: "Annual report",         hint: "Financials, governance, energy use" },
  { value: "energy",   label: "Energy & fuel bills",   hint: "Electricity & diesel → your Scope 1 & 2 calc" },
  { value: "hr",       label: "HR & headcount",        hint: "Workforce & diversity (P3, P5)" },
  { value: "water",    label: "Water & waste",         hint: "Consumption & discharge (P6)" },
  { value: "policies", label: "Policies & governance", hint: "Section B policies, board oversight" },
  { value: "auto",     label: "Not sure / mixed",      hint: "Scan the document for any BRSR figures" },
];

// A file staged for import: the local File + its extracted text + chosen category.
interface StagedDoc {
  name: string;
  text: string;
  category: DocCategory;
}

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
    docs: { name: string; text: string; category?: DocCategory }[],
  ) => Promise<BulkImportResult>;
  applyAction: (
    campaignId: string,
    accepted: { fieldId: string; value: string }[],
  ) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [staged, setStaged] = useState<StagedDoc[]>([]);
  // The category chosen at the picker, applied to the next file(s) selected.
  const [pendingCategory, setPendingCategory] = useState<DocCategory>("auto");
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
    setStaged([]);
    setTruncated(false);
    setTicked({});
    setValues({});
    setCollapsed({});
    setMsg(null);
    setWarn(null);
  }

  // Step 1 — read the chosen PDFs locally and stage them with a default category.
  // Nothing is sent yet; the consultant tags each file's type, then runs the fill.
  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) e.target.value = ""; // allow re-selecting the same file later
    if (!files.length) return;
    setMsg(null);
    setWarn(null);
    try {
      const docs: StagedDoc[] = [];
      for (let i = 0; i < files.length; i++) {
        setBusy(
          files.length === 1
            ? "Reading your document…"
            : `Reading document ${i + 1} of ${files.length}…`,
        );
        const { text } = await extractPdfText(files[i]);
        if (text.trim()) docs.push({ name: files[i].name, text, category: pendingCategory });
      }
      setBusy(null);
      if (!docs.length) {
        setMsg(
          "These look like scanned PDFs (no selectable text found). Upload text-based PDFs — ones you can select text in.",
        );
        return;
      }
      // Append to any already-staged files so several batches can be tagged together.
      setStaged((prev) => [...prev, ...docs]);
    } catch {
      setBusy(null);
      setMsg("Could not read one of those files. Please try different PDFs.");
    }
  }

  function setCategory(idx: number, category: DocCategory) {
    setStaged((prev) => prev.map((d, i) => (i === idx ? { ...d, category } : d)));
  }

  function removeStaged(idx: number) {
    setStaged((prev) => prev.filter((_, i) => i !== idx));
  }

  // Step 2 — send the tagged documents (name + text + category) for grounded extraction.
  async function runFill() {
    if (!staged.length) return;
    setMsg(null);
    setWarn(null);
    setBusy("Filling the BRSR skeleton from your documents…");
    try {
      const result = await bulkAction(
        campaignId,
        staged.map((d) => ({ name: d.name, text: d.text, category: d.category })),
      );
      setBusy(null);
      if (!result.configured) {
        setMsg("AI auto-fill isn't configured on this deployment yet.");
        return;
      }
      if (result.suggestions.length === 0) {
        // Soft wrong-document warning rather than a hard error.
        setWarn(
          "No BRSR figures found in this document — is it the right report? Try a clearer text-based PDF or the correct document (last year's BRSR or the annual report work best). You can also enter values by hand.",
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
          <h2 className="font-display text-[21px] font-bold text-ink leading-tight">
            Auto-fill from your documents
          </h2>
          <p className="text-[14.5px] text-ink-body mt-1 leading-relaxed">
            Already have the client&apos;s documents? Upload last year&apos;s BRSR,
            the annual report, bills or policies — you tag each file&apos;s type and the
            AI fills the BRSR skeleton for you to verify. Files stay in your browser;
            the AI only suggests values it finds, with the source shown.
          </p>
        </div>
      </div>

      {/* Category-FIRST upload: pick what the document is, then choose the PDF */}
      {!suggestions && (
        <div className="mt-5">
          {/* What this does — auto-fill IS collection, surfaced in Data + Readiness */}
          <p className="text-[13px] text-ink-body bg-tint border border-brand-100 rounded-lg px-3.5 py-2.5 leading-relaxed">
            Values you apply become this client&apos;s <span className="font-semibold text-ink">collected data</span> —
            they fill the <span className="font-semibold text-ink">Data</span> tab and move your{" "}
            <span className="font-semibold text-ink">Readiness</span> %.
          </p>

          {/* Documents added so far — each tagged (retaggable) + removable */}
          {staged.length > 0 && (
            <div className="mt-4">
              <p className="text-[14.5px] font-semibold text-ink mb-2">
                {staged.length} {staged.length === 1 ? "document" : "documents"} ready
              </p>
              <div className="space-y-2">
                {staged.map((d, idx) => (
                  <div
                    key={`${d.name}-${idx}`}
                    className="flex items-center gap-3 px-3.5 py-2.5 bg-page border border-line rounded-lg"
                  >
                    <svg className="w-4 h-4 flex-shrink-0 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    <span className="min-w-0 flex-1 text-[13.5px] text-ink-body truncate" title={d.name}>
                      {d.name}
                    </span>
                    <label className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[12px] text-ink-muted">Type</span>
                      <select
                        value={d.category}
                        onChange={(e) => setCategory(idx, e.target.value as DocCategory)}
                        className="h-8 px-2 text-[13px] text-ink bg-white border border-line rounded-md focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400 transition-colors duration-150"
                      >
                        {CATEGORY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeStaged(idx)}
                      className="flex-shrink-0 text-ink-muted hover:text-ember transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 rounded p-1"
                      title="Remove this file"
                      aria-label={`Remove ${d.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* The category picker — the FIRST decision. Pick a type → file dialog opens for it. */}
          <div className="mt-4">
            <p className="text-[14.5px] font-semibold text-ink mb-1">
              {staged.length ? "Add another document" : "What are you uploading?"}
            </p>
            <p className="text-[13px] text-ink-muted mb-3 leading-relaxed">
              Pick the document type, then choose the PDF. Tagging it tells the AI which BRSR fields to read — far more accurate. Files are read in your browser; nothing is sent until you apply.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CATEGORY_PICKS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  disabled={!!busy}
                  onClick={() => { setPendingCategory(c.value); fileRef.current?.click(); }}
                  className="text-left px-4 py-3 rounded-xl border border-line bg-white hover:border-brand-300 hover:bg-tint/50 transition-colors duration-150 pressable focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-60"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                    </svg>
                    <span className="text-[14px] font-semibold text-ink">{c.label}</span>
                  </span>
                  <span className="block text-[12.5px] text-ink-muted mt-1 leading-snug">{c.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={onFiles}
            className="hidden"
          />

          {busy && (
            <p className="mt-3 flex items-center gap-2 text-[13.5px] text-ink-body">
              <svg className="w-4 h-4 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              {busy}
            </p>
          )}

          {/* Fill CTA — the bottom action once at least one document is staged */}
          {staged.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line">
              <button
                type="button"
                onClick={runFill}
                disabled={!!busy}
                className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-light disabled:opacity-60 transition-colors duration-200 pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                Fill from {staged.length} {staged.length === 1 ? "document" : "documents"} →
              </button>
              <button
                type="button"
                onClick={() => setStaged([])}
                disabled={!!busy}
                className="text-[13px] text-ink-muted hover:text-ink-body disabled:opacity-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 rounded px-1"
              >
                Clear all
              </button>
            </div>
          )}

          {msg && (
            <p className="mt-3 text-[13.5px] text-ink-body leading-relaxed">{msg}</p>
          )}
          {warn && (
            <div className="mt-3 flex items-start gap-2.5 text-[13px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 leading-relaxed">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
              <span>{warn}</span>
            </div>
          )}
        </div>
      )}

      {/* Review surface */}
      {suggestions && (
        <div className="mt-5">
          {/* Amber verify banner */}
          <div className="flex items-start gap-2.5 text-[13px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 leading-relaxed">
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
            <p className="mt-3 text-[13px] text-ink-muted leading-relaxed">
              Note: these are long documents — only the first part of each was
              scanned. For anything missing, upload the specific section or enter
              it by hand.
            </p>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mt-4 mb-2">
            <p className="text-[13.5px] text-ink-body">
              <span className="font-semibold text-ink">{suggestions.length}</span>{" "}
              {suggestions.length === 1 ? "suggestion" : "suggestions"} ·{" "}
              <span className="font-semibold text-brand-700 tabular-nums">{acceptedCount}</span>{" "}
              ticked
            </p>
            <button
              type="button"
              onClick={selectAllHigh}
              className="text-[13px] font-semibold text-brand-700 hover:text-brand-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 rounded px-1"
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
                    <span className="text-[13.5px] font-semibold text-ink">
                      {SECTION_META[sec]}
                    </span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[12.5px] font-mono text-ink-body tabular-nums">{secCount}</span>
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
                            <span className="text-[12.5px] font-semibold uppercase tracking-wide text-ink-body">
                              {g.principle}
                            </span>
                            <span className="text-[11.5px] font-mono text-ink-muted tabular-nums">
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
                                    className="mt-1 accent-[#0B6FD4] focus:outline-none focus:ring-2 focus:ring-brand-400 rounded"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[12px] font-mono font-semibold text-ink-body">
                                        {s.fieldId}
                                      </span>
                                      <span className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full border ${CONF_META[s.confidence].cls}`}>
                                        {CONF_META[s.confidence].label} confidence
                                      </span>
                                    </span>
                                    <span
                                      className="block text-[13.5px] text-ink leading-snug mt-0.5"
                                      title={s.label}
                                    >
                                      {s.label}
                                    </span>
                                    {s.source && (
                                      <span
                                        className="block text-[12.5px] text-ink-body italic leading-snug mt-1 line-clamp-2"
                                        title={s.source}
                                      >
                                        &ldquo;{s.source}&rdquo;
                                      </span>
                                    )}
                                    {s.sourceDoc && (
                                      <span className="flex items-center gap-1 text-[12px] text-ink-muted mt-1" title={s.sourceDoc}>
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
                                      className="w-24 h-8 px-2 text-[14px] text-ink text-right tabular-nums bg-white border border-line rounded-md focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400 transition-colors duration-150"
                                    />
                                    {s.unit && (
                                      <span
                                        className="text-[12px] text-ink-muted whitespace-nowrap w-10 truncate"
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
              className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
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
              className="text-[13.5px] text-ink-muted hover:text-ink-body disabled:opacity-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 rounded px-1"
            >
              Upload different files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
