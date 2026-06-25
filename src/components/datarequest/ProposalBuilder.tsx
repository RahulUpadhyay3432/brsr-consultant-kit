"use client";
// Proposal & fee builder (Pro). Enter a client's scope + your own rates → a live,
// transparent fee breakdown and a downloadable branded proposal PDF. Fully
// client-side; nothing is stored. Honest: it structures YOUR rates, it does not
// assert a market price.
import { useState } from "react";
import {
  estimateFee, DEFAULT_FEE_INPUTS, SIZE_LABELS, MATURITY_LABELS, FRAMEWORK_LABELS,
  type FeeInputs, type CompanySizeKey, type MaturityKey, type FrameworkKey,
} from "@/lib/proposal";
import { downloadProposalPdf } from "@/lib/proposal-pdf";

const FRAMEWORKS = Object.keys(FRAMEWORK_LABELS) as FrameworkKey[];

function inr(n: number): string { return "₹" + Math.round(n).toLocaleString("en-IN"); }

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11.5px] font-medium text-stone-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors";

function RateField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Labeled label={label}>
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] text-stone-400">₹</span>
        <input type="number" min="0" step="500" value={value} onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="flex-1 min-w-0 h-9 px-2.5 text-[13px] font-mono text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
      </div>
    </Labeled>
  );
}

export default function ProposalBuilder() {
  const [inp, setInp] = useState<FeeInputs>(DEFAULT_FEE_INPUTS);
  const set = <K extends keyof FeeInputs>(k: K, v: FeeInputs[K]) => setInp((p) => ({ ...p, [k]: v }));
  const toggleFw = (f: FrameworkKey) => set("frameworks", inp.frameworks.includes(f) ? inp.frameworks.filter((x) => x !== f) : [...inp.frameworks, f]);

  const fee = estimateFee(inp);

  return (
    <div className="max-w-[920px] mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] text-stone-900 tracking-tight">Proposal &amp; fee builder</h1>
          <p className="text-[13px] text-stone-500 mt-1 max-w-[64ch] leading-relaxed">
            Scope an engagement and produce a client-ready proposal with a transparent fee estimate. It structures
            <strong className="text-stone-600"> your own rates</strong> — it never asserts a market price. Generated on your device.
          </p>
        </div>
        <button
          onClick={() => downloadProposalPdf(inp)}
          className="flex-shrink-0 inline-flex items-center gap-2 bg-forest text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
          Download proposal (PDF)
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        {/* ── Scope inputs ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)] space-y-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">Engagement scope</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Labeled label="Client name"><input className={inputCls} value={inp.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Acme Industries Ltd" /></Labeled>
              <Labeled label="Reporting period"><input className={inputCls} value={inp.reportingPeriod} onChange={(e) => set("reportingPeriod", e.target.value)} placeholder="FY 2025-26" /></Labeled>
            </div>
            <Labeled label="Company size & listing">
              <select className={inputCls} value={inp.size} onChange={(e) => set("size", e.target.value as CompanySizeKey)}>
                {(Object.keys(SIZE_LABELS) as CompanySizeKey[]).map((k) => <option key={k} value={k}>{SIZE_LABELS[k]}</option>)}
              </select>
            </Labeled>
            <Labeled label="Reporting maturity">
              <select className={inputCls} value={inp.maturity} onChange={(e) => set("maturity", e.target.value as MaturityKey)}>
                {(Object.keys(MATURITY_LABELS) as MaturityKey[]).map((k) => <option key={k} value={k}>{MATURITY_LABELS[k]}</option>)}
              </select>
            </Labeled>
            <div>
              <span className="block text-[11.5px] font-medium text-stone-500 mb-1.5">Additional frameworks</span>
              <div className="flex flex-wrap gap-1.5">
                {FRAMEWORKS.map((f) => {
                  const on = inp.frameworks.includes(f);
                  return (
                    <button key={f} type="button" onClick={() => toggleFw(f)}
                      className={`text-[12px] font-medium px-2.5 py-1 rounded-full border transition-colors pressable ${on ? "text-brand-800 bg-brand-50 border-brand-200" : "text-stone-500 bg-white border-stone-200 hover:border-stone-300"}`}>
                      {FRAMEWORK_LABELS[f]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
              {([["scope3", "Scope 3 inventory"], ["valueChain", "Value-chain collection"], ["assurance", "BRSR Core assurance support"]] as [keyof FeeInputs, string][]).map(([k, label]) => (
                <label key={k} className="inline-flex items-center gap-2 text-[12.5px] text-stone-700 cursor-pointer">
                  <input type="checkbox" checked={inp[k] as boolean} onChange={(e) => set(k, e.target.checked as never)} className="accent-[#0E4A36]" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)] space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">Your rates <span className="font-normal normal-case tracking-normal text-stone-400">— set your own numbers</span></p>
            <div className="grid sm:grid-cols-2 gap-3">
              <RateField label="Base BRSR engagement" value={inp.baseFee} onChange={(n) => set("baseFee", n)} />
              <RateField label="Per additional framework" value={inp.perFramework} onChange={(n) => set("perFramework", n)} />
              <RateField label="Scope 3 inventory" value={inp.scope3Fee} onChange={(n) => set("scope3Fee", n)} />
              <RateField label="Value-chain collection" value={inp.valueChainFee} onChange={(n) => set("valueChainFee", n)} />
              <RateField label="Assurance support" value={inp.assuranceFee} onChange={(n) => set("assuranceFee", n)} />
            </div>
          </div>
        </div>

        {/* ── Live fee estimate ────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-4 self-start bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-3">Fee estimate</p>
          <div className="space-y-3">
            {fee.lineItems.map((l, i) => (
              <div key={i} className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 last:border-0">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-stone-800 leading-snug">{l.label}</p>
                  <p className="text-[11px] text-stone-400 leading-snug mt-0.5">{l.note}</p>
                </div>
                <span className="text-[13.5px] font-mono tabular-nums text-stone-700 whitespace-nowrap">{inr(l.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t-2 border-stone-200">
            <span className="text-[14px] font-semibold text-stone-800">Estimated total</span>
            <span className="text-[20px] font-display text-forest tabular-nums">{inr(fee.subtotal)}</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 text-right">per engagement (one reporting cycle)</p>
          <ul className="mt-4 pt-4 border-t border-stone-100 space-y-1.5">
            {fee.assumptions.map((a, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] text-stone-500 leading-relaxed"><span className="mt-1.5 w-1 h-1 rounded-full bg-stone-300 flex-shrink-0" />{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
