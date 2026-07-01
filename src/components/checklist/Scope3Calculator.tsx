"use client";
// Scope 3 screening calculator for the BRSR P6-L2 row. Activity/distance-based per
// the GHG Protocol Scope 3 Standard; DEFRA 2024 v1.1 factors (cited per line). On
// device, nothing leaves the browser. Screening-level: Scope 3 is a BRSR Leadership
// (voluntary) indicator; Category 1 (purchased goods) is intentionally not included.
import { calcScope3, SCOPE3_GROUPS, type Scope3Inputs } from "@/lib/scope3-calculator";
import { fmtNum, fmtIntensity, perInrStr } from "@/lib/emissions-calculator";

interface Props {
  inputs: Scope3Inputs;
  turnoverCrore: string;
  onChange: (key: string, value: string) => void;
}

function Field({
  label, unit, value, onChange,
}: { label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11.5px] font-bold text-brand-800 uppercase tracking-[0.04em] mb-1.5 leading-snug">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="number" min="0" step="any" value={value} placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 h-10 px-3 text-[15px] font-mono text-ink border border-[#CDE2F6] rounded-lg
            bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400
            transition-[border-color,box-shadow] placeholder:text-ink-faint"
        />
        <span className="flex items-center h-10 px-2.5 rounded-lg bg-brand-50 border border-[#CDE2F6]
          text-[12.5px] font-semibold text-brand-800 whitespace-nowrap flex-shrink-0">
          {unit === "passenger-km" ? "p·km" : unit === "tonne-km" ? "t·km" : unit}
        </span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, unit, bold, muted, indent }: {
  label: string; value: string; unit: string; bold?: boolean; muted?: boolean; indent?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-2 ${indent ? "pl-3" : ""}`}>
      <span className={`text-[13px] leading-relaxed ${muted ? "text-ink-faint" : bold ? "text-ink font-semibold" : "text-ink-muted"}`}>
        {label}
      </span>
      <span className={`text-[13px] font-mono tabular-nums whitespace-nowrap ${muted ? "text-ink-faint" : bold ? "text-ink font-semibold" : "text-ink-body"}`}>
        {value} <span className={`font-sans text-[11px] ${bold ? "text-ink-muted font-normal" : "text-ink-faint"}`}>{unit}</span>
      </span>
    </div>
  );
}

export default function Scope3Calculator({ inputs, turnoverCrore, onChange }: Props) {
  const result = calcScope3(inputs, turnoverCrore);

  return (
    <div className="border border-[#CDE2F6] rounded-2xl shadow-[0_1px_6px_rgba(15,30,51,0.08)] overflow-hidden">
      {/* Header band */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#EAF4FE] border-b border-[#CDE2F6]">
        <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-brand-600" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="7.5" r="5.5" />
            <path d="M7.5 4.5v3l1.5 1.5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-ink leading-snug">Scope 3 Screening Calculator</p>
          <p className="text-[11.5px] text-ink-muted leading-snug hidden sm:block">
            Value-chain emissions (tCO₂e) for BRSR P6-L2 · GHG Protocol · DEFRA 2024 factors
          </p>
        </div>
        <span className="text-[10px] font-semibold text-brand-700 bg-white border border-[#CDE2F6] px-2 py-0.5 rounded-full flex-shrink-0">
          Screening
        </span>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Inputs grouped by category */}
        {SCOPE3_GROUPS.map((g) => (
          <div key={g.key}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-brand-700 pb-2 mb-3 border-b border-[#CDE2F6]">
              {g.category}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {g.factors.map((f) => (
                <Field
                  key={f.id}
                  label={f.label}
                  unit={f.unit}
                  value={inputs[f.id] ?? ""}
                  onChange={(v) => onChange(f.id, v)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Cat 1 deferred note */}
        <div className="rounded-xl border border-[#CDE2F6] bg-[#F8FBFE] px-4 py-3">
          <p className="text-[12px] text-ink-muted leading-relaxed">
            <span className="font-semibold text-ink-body">Cat 1 — purchased goods & services</span>{" "}
            is not included. It needs supplier-specific emission intensities or spend-based EEIO factors; add from supplier data for a complete inventory.
          </p>
        </div>

        {/* Results */}
        <div className="border-t border-[#CDE2F6] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-brand-700 mb-2.5">Results</p>
          {!result.anyInput ? (
            <div className="rounded-xl border border-dashed border-[#B9D7F5] bg-[#F8FBFE] px-4 py-4">
              <div className="pb-3 mb-2 border-b border-dashed border-[#CDE2F6] flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-ink-faint tabular-nums leading-none">—</span>
                <span className="text-[14px] font-semibold text-ink-muted">tCO₂e</span>
              </div>
              <p className="text-[12.5px] text-ink-muted leading-relaxed">
                Your BRSR figure will appear here as you fill in the values above.
              </p>
            </div>
          ) : (
            <div className="bg-[#EAF4FE] border border-[#CDE2F6] rounded-xl px-4 py-4 space-y-2">
              {/* Hero total */}
              <div className="pb-3 mb-1 border-b border-[#CDE2F6]">
                <span className="text-[28px] font-bold text-ink tabular-nums leading-none">{fmtNum(result.total_tco2e, 2)}</span>
                <span className="text-[14px] text-ink-muted ml-2">tCO₂e</span>
              </div>

              {result.categories.filter((c) => c.lines.length > 0).map((c) => (
                <div key={c.key} className="space-y-1.5">
                  {c.lines.map((ln, i) => (
                    <ResultRow key={i} label={ln.label} value={fmtNum(ln.tco2e, 2)} unit="tCO₂e" indent muted />
                  ))}
                  <ResultRow label={c.category} value={fmtNum(c.subtotal_tco2e, 2)} unit="tCO₂e" />
                </div>
              ))}

              <div className="border-t border-[#CDE2F6] pt-2 mt-2 space-y-1.5">
                <ResultRow label="Total Scope 3 (screening)" value={fmtNum(result.total_tco2e, 2)} unit="tCO₂e" bold />
                {result.intensity_per_crore !== null && (
                  <div>
                    <ResultRow label="Scope 3 intensity" value={fmtIntensity(result.intensity_per_crore, 4)} unit="tCO₂e / ₹ crore" />
                    <p className="text-[10px] text-ink-faint mt-0.5 leading-snug">
                      BRSR table asks "per rupee of turnover": {perInrStr(result.intensity_per_crore)} tCO₂e/INR
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Methodology footnote */}
        <div className="text-[10.5px] text-ink-faint leading-relaxed space-y-0.5 border-t border-line pt-3">
          <p>
            <span className="font-medium text-ink-muted">Method:</span>{" "}
            GHG Protocol Corporate Value Chain (Scope 3) Standard, activity/distance-based.{" "}
            <span className="font-medium text-ink-muted">Factors:</span>{" "}
            DEFRA/DESNZ 2024 GHG Conversion Factors v1.1. Air includes radiative forcing; freight is direct + well-to-tank.
          </p>
          <p>
            <span className="font-medium text-ink-muted">Covers:</span>{" "}
            business travel (Cat 6), commuting (Cat 7), transport & distribution (Cat 4/9) and waste (Cat 5).
          </p>
          <p className="italic">
            Scope 3 is a BRSR P6 Leadership indicator, voluntary and not under reasonable assurance. This is a screening estimate; a certified GHG auditor should sign off on final disclosures.
          </p>
        </div>
      </div>
    </div>
  );
}
