"use client";
// CBAM embedded-emissions SCREENING calculator (Pro, client-side).
// Covered-good dropdown + production tonnage + optional override factor →
// a live result card (total embedded tCO₂e + per-tonne intensity) with a cited
// methodology footnote and a prominent honest "screening, not the declaration" note.
// Fully on-device; nothing is stored.
import { useRef, useState } from "react";
import {
  CBAM_GOODS, estimateCbam,
  type CbamGoodId,
} from "@/lib/cbam-calculator";
import { extractPdfText } from "@/lib/pdf-extract";
import { cbamExtractAction } from "@/lib/datarequest/actions";

function fmt(n: number, dp = 2): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export default function CbamCalculator() {
  const [goodId, setGoodId] = useState<CbamGoodId>("iron_steel");
  const [tonnesStr, setTonnesStr] = useState("");
  const [overrideStr, setOverrideStr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [applied, setApplied] = useState<{ source: string; confidence: string; doc: string } | null>(null);
  const [autoMsg, setAutoMsg] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("Reading your document…"); setAutoMsg(null); setApplied(null);
    try {
      const { text } = await extractPdfText(file);
      if (!text.trim()) { setBusy(null); setAutoMsg("That looks like a scanned PDF (no selectable text). Try a text-based PDF."); return; }
      setBusy("Finding the CBAM figures…");
      const { configured, suggestion } = await cbamExtractAction(text);
      setBusy(null);
      if (!configured) { setAutoMsg("AI auto-fill isn't configured on this deployment yet."); return; }
      if (!suggestion) { setAutoMsg("No CBAM covered-good quantity found in this document. Enter it by hand, or try the production / export report."); return; }
      setGoodId(suggestion.goodId as CbamGoodId);
      setTonnesStr(String(suggestion.tonnes));
      if (suggestion.overrideFactor) setOverrideStr(String(suggestion.overrideFactor));
      setApplied({ source: suggestion.source, confidence: suggestion.confidence, doc: file.name });
    } catch {
      setBusy(null); setAutoMsg("Could not read that file. Try a different text-based PDF.");
    }
  }

  const tonnes = parseFloat(tonnesStr);
  const override = parseFloat(overrideStr);
  const est = estimateCbam(
    goodId,
    Number.isFinite(tonnes) ? tonnes : 0,
    overrideStr.trim() !== "" && Number.isFinite(override) ? override : undefined,
  );
  const good = est.good;
  const hasInput = Number.isFinite(tonnes) && tonnes > 0;

  return (
    <div className="bg-white border border-line rounded-xl shadow-[0_1px_2px_rgba(16,33,26,0.05)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-tint border-b border-line">
        <div className="w-7 h-7 rounded-lg bg-brand-700/10 border border-brand-700/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 21h18M5 21V8l4-3 4 3v13M13 21v-6l4-3 4 3v6" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14.5px] font-semibold text-ink leading-snug">Embedded-emissions screening</p>
          <p className="text-[13px] text-ink-body leading-snug">Estimate the CBAM embedded emissions of a covered good from EU default values.</p>
        </div>
        <span className="text-[11.5px] font-semibold text-brand-700 bg-white border border-brand-700/20 px-2 py-0.5 rounded-full flex-shrink-0">
          Screening
        </span>
      </div>

      <div className="p-5 space-y-5">

        {/* Honest note, prominent */}
        <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-3">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 9v4m0 4h.01M10.3 3.86l-8.06 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3l-8.06-14a2 2 0 0 0-3.46 0z" />
          </svg>
          <p className="text-[13.5px] text-amber-900 leading-relaxed">
            <strong className="font-semibold">Screening estimate from EU CBAM default values, not the official CBAM declaration.</strong>{" "}
            The real declaration needs installation-specific, third-party-verified data. Verify with the producing installation&apos;s actual figures before reporting.
          </p>
        </div>

        {/* Auto-fill from a document */}
        <div className="rounded-lg border border-line bg-tint/40 px-3.5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-ink">Auto-fill from a document</p>
              <p className="text-[12.5px] text-ink-body leading-snug">Upload a production or export report, the AI reads the good + quantity. On your device; verify before relying on it.</p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={!!busy}
              className="inline-flex items-center gap-1.5 bg-forest text-white text-[13.5px] font-semibold px-3.5 py-2 rounded-lg hover:bg-forest-light disabled:opacity-60 transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400 flex-shrink-0"
            >
              {busy ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg>
                  {busy}
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                  Choose document
                </>
              )}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="application/pdf" onChange={onFile} className="hidden" />
          {applied && (
            <div className="mt-2.5 flex items-start gap-2 text-[12.5px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
              <span><span className="font-semibold">Filled from {applied.doc}</span> ({applied.confidence} confidence), verify: &ldquo;{applied.source}&rdquo;</span>
            </div>
          )}
          {autoMsg && <p className="mt-2.5 text-[12.5px] text-ink-body leading-relaxed">{autoMsg}</p>}
        </div>

        {/* Inputs */}
        <div className="grid sm:grid-cols-3 gap-3.5">
          <label className="block sm:col-span-1">
            <span className="block text-[12.5px] font-semibold text-ink-muted uppercase tracking-[0.08em] mb-1.5">Covered good</span>
            <select
              value={goodId}
              onChange={(e) => setGoodId(e.target.value as CbamGoodId)}
              className="w-full h-10 px-3 text-[15px] text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400 transition-colors"
            >
              {CBAM_GOODS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-[12.5px] font-semibold text-ink-muted uppercase tracking-[0.08em] mb-1.5">
              Production / export
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min="0" step="any" inputMode="decimal"
                value={tonnesStr}
                onChange={(e) => setTonnesStr(e.target.value)}
                placeholder="0"
                className="flex-1 min-w-0 h-10 px-3 text-[15px] font-mono tabular-nums text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400 transition-colors placeholder:text-ink-muted/50"
              />
              <span className="text-[13.5px] text-ink-body whitespace-nowrap min-w-[32px] text-right">{good.unit}</span>
            </div>
          </label>

          <label className="block">
            <span className="block text-[12.5px] font-semibold text-ink-muted uppercase tracking-[0.08em] mb-1.5">
              Override factor <span className="normal-case tracking-normal font-normal text-ink-muted/70">opt.</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min="0" step="any" inputMode="decimal"
                value={overrideStr}
                onChange={(e) => setOverrideStr(e.target.value)}
                placeholder={fmt(good.defaultFactor, 2)}
                title="Replace the EU default with the installation's verified specific embedded-emissions factor."
                className="flex-1 min-w-0 h-10 px-3 text-[15px] font-mono tabular-nums text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400 transition-colors placeholder:text-ink-muted/50"
              />
              <span className="text-[13.5px] text-ink-body whitespace-nowrap min-w-[64px] text-right">tCO₂e/{good.unit}</span>
            </div>
          </label>
        </div>

        {/* Factor basis */}
        <p className="text-[13px] text-ink-body leading-relaxed -mt-1">
          {est.overridden ? (
            <>Using your override factor <span className="font-mono text-ink">{fmt(est.factor, 3)} tCO₂e/{good.unit}</span> instead of the EU default.</>
          ) : (
            <>EU default: <span className="font-mono text-ink">{good.factorDisplay}</span>, {good.note}</>
          )}
        </p>

        {/* Result */}
        <div className="border-t border-line pt-4">
          {!hasInput ? (
            <p className="text-[14.5px] text-ink-body italic">
              Enter the {good.unit === "MWh" ? "electricity exported" : "tonnes of the good exported to the EU"} above to estimate embedded emissions.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-forest text-white px-4 py-3.5">
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-white/70">Total embedded emissions</p>
                <p className="mt-1.5 font-mono tabular-nums text-[26px] leading-none font-semibold">
                  {fmt(est.embeddedTco2e, 1)}
                  <span className="ml-1.5 text-[14.5px] font-sans font-normal text-white/80">tCO₂e</span>
                </p>
                <p className="mt-2 text-[12.5px] text-white/65 leading-snug">
                  {fmt(est.tonnes, est.tonnes % 1 === 0 ? 0 : 2)} {good.unit} × {fmt(est.perTonne, 3)} tCO₂e/{good.unit}
                </p>
              </div>
              <div className="rounded-xl bg-tint border border-line px-4 py-3.5">
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Per-{good.unit} intensity</p>
                <p className="mt-1.5 font-mono tabular-nums text-[26px] leading-none font-semibold text-ink">
                  {fmt(est.perTonne, 3)}
                  <span className="ml-1.5 text-[14.5px] font-sans font-normal text-ink-body">tCO₂e/{good.unit}</span>
                </p>
                <p className="mt-2 text-[12.5px] text-ink-body leading-snug">
                  {est.overridden ? "Your installation-specific factor." : "EU transitional default, refine with actual data."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Methodology footnote */}
        <div className="text-[12px] text-ink-muted leading-relaxed space-y-1 border-t border-line pt-3">
          <p>
            <span className="font-medium text-ink-body">Method:</span>{" "}
            embedded emissions = quantity × specific embedded-emissions factor. Default factors are the EU&apos;s
            published transitional-period default values for CBAM goods (direct emissions, sector-level, conservative).
          </p>
          <p>
            <span className="font-medium text-ink-body">Source:</span>{" "}
            {good.source}.{" "}
            <a href={good.sourceUrl} target="_blank" rel="noreferrer" className="text-brand-700 underline decoration-brand-700/30 underline-offset-2 hover:decoration-brand-700">
              EU Commission, CBAM
            </a>
            {" · "}Commission Implementing Regulation (EU) 2023/1773.
          </p>
          <p className="italic">
            Default values are a fallback only; CBAM caps their use and defaults to high benchmark figures for
            unverified data. Replace with the producing installation&apos;s third-party-verified emissions before any
            CBAM report. This screening does not compute the certificate cost or financial obligation.
          </p>
        </div>

      </div>
    </div>
  );
}
