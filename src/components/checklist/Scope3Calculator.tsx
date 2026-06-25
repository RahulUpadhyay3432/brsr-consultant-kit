"use client";
// Scope 3 screening calculator for the BRSR P6-L2 row. Activity/distance-based per
// the GHG Protocol Scope 3 Standard; DEFRA 2024 v1.1 factors (cited per line). On
// device — nothing leaves the browser. Screening-level: Scope 3 is a BRSR Leadership
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
      <label className="block text-[11px] font-medium text-stone-600 mb-1 leading-snug">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number" min="0" step="any" value={value} placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2.5 py-2 text-sm font-mono border border-stone-200 rounded
            bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400
            transition-[border-color,box-shadow] placeholder:text-stone-300"
        />
        <span className="text-[10px] text-stone-400 whitespace-nowrap min-w-[58px] text-right">{unit}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, unit, bold, muted, indent }: {
  label: string; value: string; unit: string; bold?: boolean; muted?: boolean; indent?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-2 ${indent ? "pl-3" : ""}`}>
      <span className={`text-[13px] leading-relaxed ${muted ? "text-stone-400" : bold ? "text-stone-800 font-semibold" : "text-stone-600"}`}>{label}</span>
      <span className={`text-[13px] font-mono tabular-nums whitespace-nowrap ${muted ? "text-stone-400" : bold ? "text-stone-800 font-semibold" : "text-stone-700"}`}>
        {value} <span className={`font-sans ${bold ? "font-normal text-stone-500" : "text-stone-400"} text-[11px]`}>{unit}</span>
      </span>
    </div>
  );
}

export default function Scope3Calculator({ inputs, turnoverCrore, onChange }: Props) {
  const result = calcScope3(inputs, turnoverCrore);

  return (
    <div className="border border-emerald-200 rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border-b border-emerald-200">
        <div className="w-5 h-5 rounded bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-emerald-700" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="7.5" cy="7.5" r="4" /><path d="M7.5 5v2.5l1.5 1" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-emerald-800 leading-snug">Scope 3 Screening Calculator</p>
          <p className="text-[11px] text-emerald-700/70 leading-snug hidden sm:block">Value-chain emissions (tCO₂e) for BRSR P6-L2, from activity data. GHG Protocol Scope 3 · DEFRA 2024 factors.</p>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.5 rounded-full flex-shrink-0">Screening</span>
      </div>

      <div className="p-3 space-y-4">
        {/* Inputs, grouped by Scope 3 category */}
        {SCOPE3_GROUPS.map((g) => (
          <div key={g.key}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">{g.category}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {g.factors.map((f) => (
                <Field
                  key={f.id}
                  label={f.label}
                  unit={f.unit === "passenger-km" ? "p·km" : f.unit === "tonne-km" ? "t·km" : f.unit}
                  value={inputs[f.id] ?? ""}
                  onChange={(v) => onChange(f.id, v)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Results */}
        <div className="border-t border-stone-200 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-700 mb-2">Results</p>
          {!result.anyInput ? (
            <p className="text-[13px] text-stone-400 italic">Enter activity quantities above to estimate Scope 3 emissions.</p>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-md px-3 py-2.5 space-y-1.5">
              {result.categories.filter((c) => c.lines.length > 0).map((c) => (
                <div key={c.key} className="space-y-1.5">
                  {c.lines.map((ln, i) => (
                    <ResultRow key={i} label={ln.label} value={fmtNum(ln.tco2e, 2)} unit="tCO₂e" indent muted />
                  ))}
                  <ResultRow label={c.category} value={fmtNum(c.subtotal_tco2e, 2)} unit="tCO₂e" />
                </div>
              ))}
              <div className="border-t border-stone-200 pt-1.5 mt-1.5 space-y-1.5">
                <ResultRow label="Total Scope 3 (screening)" value={fmtNum(result.total_tco2e, 2)} unit="tCO₂e" bold />
                {result.intensity_per_crore !== null && (
                  <div>
                    <ResultRow label="Scope 3 intensity" value={fmtIntensity(result.intensity_per_crore, 4)} unit="tCO₂e / ₹ crore" />
                    <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                      BRSR table asks "per rupee of turnover": {perInrStr(result.intensity_per_crore)} tCO₂e/INR
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Methodology + honest caveats */}
        <div className="text-[10px] text-stone-400 leading-relaxed space-y-1 border-t border-stone-100 pt-2">
          <p>
            <span className="font-medium text-stone-500">Method:</span> GHG Protocol Corporate Value Chain (Scope 3) Standard — activity/distance-based.
            <span className="font-medium text-stone-500"> Factors:</span> DEFRA/DESNZ 2024 GHG Conversion Factors v1.1. Air includes radiative forcing; freight is direct + well-to-tank.
          </p>
          <p>
            <span className="font-medium text-stone-500">Covers</span> business travel (Cat 6), commuting (Cat 7), transport &amp; distribution (Cat 4/9) and waste (Cat 5).
            <span className="font-medium text-stone-500"> Not included:</span> purchased goods &amp; services (Cat 1) — it needs supplier-specific or spend data; add it from supplier data for a complete inventory.
          </p>
          <p className="italic">
            Scope 3 is a BRSR Principle 6 Leadership indicator — voluntary and not under reasonable assurance. This is a screening estimate; a certified GHG auditor should sign off on final disclosures.
          </p>
        </div>
      </div>
    </div>
  );
}
