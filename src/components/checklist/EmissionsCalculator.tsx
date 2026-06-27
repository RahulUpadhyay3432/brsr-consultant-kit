"use client";
// Embedded calculator for BRSR P6 disclosure rows.
// Modes: "energy" (P6-E1), "ghg" (P6-E7), "water" (P6-E3).
// Energy + GHG modes share the same fuel/electricity inputs (same CalcInputs keys),
// so entering diesel in P6-E7 is reflected immediately in P6-E1 and vice versa.
import factorsData from "@/data/emission_factors.json";
import {
  calcEnergy, calcGhg, calcWater,
  fmtNum, fmtIntensity, perInrStr,
} from "@/lib/emissions-calculator";
import type { CalcInputs } from "@/lib/emissions-calculator";

type Mode = "energy" | "ghg" | "water";

interface Props {
  mode: Mode;
  inputs: CalcInputs;
  onChange: (key: keyof CalcInputs, value: string) => void;
}

// ── Primitive input ────────────────────────────────────────────────────────────
function Field({
  label, unit, value, onChange,
}: { label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-[0.08em] mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          className="flex-1 min-w-0 px-2.5 py-2 text-sm font-mono border border-stone-200 rounded
            bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400
            transition-[border-color,box-shadow] placeholder:text-stone-300"
        />
        <span className="text-[11px] text-stone-400 whitespace-nowrap min-w-[32px] text-right">{unit}</span>
      </div>
    </div>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────
function ResultRow({ label, value, unit, bold, muted, indent }: {
  label: string; value: string; unit: string; bold?: boolean; muted?: boolean; indent?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-2 ${indent ? "pl-3" : ""}`}>
      <span className={`text-[13px] leading-relaxed ${muted ? "text-stone-400" : bold ? "text-stone-800 font-semibold" : "text-stone-600"}`}>
        {label}
      </span>
      <span className={`text-[13px] font-mono tabular-nums whitespace-nowrap ${muted ? "text-stone-400" : bold ? "text-stone-800 font-semibold" : "text-stone-700"}`}>
        {value} <span className={`font-sans ${bold ? "font-normal text-stone-500" : "text-stone-400"} text-[11px]`}>{unit}</span>
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function EmissionsCalculator({ mode, inputs, onChange }: Props) {
  const set = (key: keyof CalcInputs) => (v: string) => onChange(key, v);

  const TITLES: Record<Mode, string> = {
    energy: "Energy Consumption Calculator",
    ghg:    "GHG Emissions Calculator",
    water:  "Water Withdrawal Calculator",
  };
  const DESCRIPTIONS: Record<Mode, string> = {
    energy: "Calculates total energy (GJ) and intensity for BRSR P6-E1.",
    ghg:    "Calculates Scope 1 & 2 emissions (tCO₂e) for BRSR P6-E7. Uses same fuel inputs as the energy calculator.",
    water:  "Calculates total water withdrawal (kL) and intensity for BRSR P6-E3.",
  };

  // Shared electricity + fuel inputs (energy + ghg modes)
  const showEnergyInputs = mode === "energy" || mode === "ghg";

  const energy  = showEnergyInputs ? calcEnergy(inputs)  : null;
  const ghg     = mode === "ghg"   ? calcGhg(inputs)     : null;
  const water   = mode === "water" ? calcWater(inputs)   : null;

  const hasAnyInput = showEnergyInputs
    ? [inputs.grid_kwh, inputs.renewable_kwh, inputs.diesel_l, inputs.petrol_l,
       inputs.gas_m3, inputs.lpg_kg, inputs.coal_kg, inputs.furnace_oil_l].some(v => parseFloat(v) > 0)
    : [inputs.water_surface_kl, inputs.water_ground_kl,
       inputs.water_third_kl,   inputs.water_others_kl].some(v => parseFloat(v) > 0);

  return (
    <div className="border border-emerald-200 rounded-md overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border-b border-emerald-200">
        <div className="w-5 h-5 rounded bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
          {mode === "water" ? (
            <svg className="w-3 h-3 text-emerald-700" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7.5 2C7.5 2 3 7 3 10a4.5 4.5 0 0 0 9 0C12 7 7.5 2 7.5 2z" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-emerald-700" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="4" />
              <path d="M7.5 5v2.5l1.5 1" />
              <path d="M7.5 1.5v1M13.5 7.5h-1M7.5 13v-1M1.5 7.5h1" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-emerald-800 leading-snug">{TITLES[mode]}</p>
          <p className="text-[11px] text-emerald-700/70 leading-snug hidden sm:block">{DESCRIPTIONS[mode]}</p>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
          Calculator
        </span>
      </div>

      <div className="p-3 space-y-4">

        {/* ── Electricity inputs (energy + ghg modes) ──────────────────────── */}
        {showEnergyInputs && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">
              Electricity
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Grid electricity" unit="kWh" value={inputs.grid_kwh} onChange={set("grid_kwh")} />
              <Field label="Renewable electricity" unit="kWh" value={inputs.renewable_kwh} onChange={set("renewable_kwh")} />
            </div>
          </div>
        )}

        {/* ── Fuel inputs (energy + ghg modes) ─────────────────────────────── */}
        {showEnergyInputs && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">
              Fuels <span className="text-stone-400 normal-case tracking-normal font-normal">, enter quantities for fuels used (leave others blank)</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Field label="Diesel (HSD)" unit="L"  value={inputs.diesel_l}      onChange={set("diesel_l")}      />
              <Field label="Petrol (MS)"  unit="L"  value={inputs.petrol_l}      onChange={set("petrol_l")}      />
              <Field label="CNG / Gas"    unit="m³" value={inputs.gas_m3}        onChange={set("gas_m3")}        />
              <Field label="LPG"          unit="kg" value={inputs.lpg_kg}        onChange={set("lpg_kg")}        />
              <Field label="Coal"         unit="kg" value={inputs.coal_kg}       onChange={set("coal_kg")}       />
              <Field label="Furnace Oil"  unit="L"  value={inputs.furnace_oil_l} onChange={set("furnace_oil_l")} />
            </div>
          </div>
        )}

        {/* ── Water source inputs ───────────────────────────────────────────── */}
        {mode === "water" && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">
              Water withdrawal by source
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Surface water"   unit="kL" value={inputs.water_surface_kl} onChange={set("water_surface_kl")} />
              <Field label="Groundwater"     unit="kL" value={inputs.water_ground_kl}  onChange={set("water_ground_kl")}  />
              <Field label="Third-party"     unit="kL" value={inputs.water_third_kl}   onChange={set("water_third_kl")}   />
              <Field label="Others"          unit="kL" value={inputs.water_others_kl}  onChange={set("water_others_kl")}  />
            </div>
          </div>
        )}

        {/* ── Turnover (intensity denominator, shared across all modes) ──────── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">
            Annual turnover <span className="text-stone-400 normal-case tracking-normal font-normal">, optional, for intensity</span>
          </p>
          <div className="max-w-[200px]">
            <Field label="Turnover" unit="₹ crore" value={inputs.turnover_crore} onChange={set("turnover_crore")} />
          </div>
          <p className="text-[10px] text-stone-400 mt-1">
            Shared across energy, GHG, and water intensity calculations, enter once.
          </p>
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <div className="border-t border-stone-200 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-700 mb-2">
            Results
          </p>

          {!hasAnyInput ? (
            <p className="text-[13px] text-stone-400 italic">
              Enter quantities above to calculate your BRSR figures.
            </p>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-md px-3 py-2.5 space-y-1.5">

              {/* Energy results */}
              {energy && mode === "energy" && (
                <>
                  <ResultRow label="Grid electricity"  value={fmtNum(energy.grid_gj)}      unit="GJ" />
                  <ResultRow label="Renewable electricity" value={fmtNum(energy.renewable_gj)} unit="GJ" />
                  {energy.fuel_breakdown.map((f, i) => (
                    <ResultRow key={i} label={f.label} value={fmtNum(f.gj)} unit="GJ" indent muted />
                  ))}
                  {energy.fuel_gj > 0 && (
                    <ResultRow label="Total fuel" value={fmtNum(energy.fuel_gj)} unit="GJ" />
                  )}
                  <div className="border-t border-stone-200 pt-1.5 mt-1.5 space-y-1.5">
                    <ResultRow label="Total energy" value={fmtNum(energy.total_gj)} unit="GJ" bold />
                    {energy.total_gj > 0 && (
                      <ResultRow label="Renewable share" value={fmtNum(energy.renewable_pct, 1)} unit="%" />
                    )}
                    {energy.intensity_per_crore !== null && (
                      <div>
                        <ResultRow label="Energy intensity" value={fmtIntensity(energy.intensity_per_crore)} unit="GJ / ₹ crore" />
                        <p className="text-[10px] text-stone-400 pl-0 mt-0.5 leading-snug">
                          BRSR table asks "per rupee of turnover": {perInrStr(energy.intensity_per_crore)} GJ/INR
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* GHG results */}
              {ghg && mode === "ghg" && (
                <>
                  {ghg.scope1_breakdown.length > 0 && (
                    <>
                      {ghg.scope1_breakdown.map((f, i) => (
                        <ResultRow key={i} label={f.label} value={fmtNum(f.tco2e, 2)} unit="tCO₂e" indent muted />
                      ))}
                      <ResultRow label="Scope 1 (fuel combustion)" value={fmtNum(ghg.scope1_tco2e, 2)} unit="tCO₂e" />
                    </>
                  )}
                  {ghg.scope1_breakdown.length === 0 && (
                    <ResultRow label="Scope 1" value="0.00" unit="tCO₂e" muted />
                  )}
                  <div>
                    <ResultRow label="Scope 2 (grid electricity)" value={fmtNum(ghg.scope2_tco2e, 2)} unit="tCO₂e" />
                    <p className="text-[10px] text-stone-400 pl-0 mt-0.5 leading-snug">
                      Factor: {factorsData.scope2_grid.factor_display}, {factorsData.scope2_grid.source_short}
                    </p>
                  </div>
                  <div className="border-t border-stone-200 pt-1.5 mt-1.5 space-y-1.5">
                    <ResultRow label="Total Scope 1 + 2" value={fmtNum(ghg.total_tco2e, 2)} unit="tCO₂e" bold />
                    {ghg.intensity_per_crore !== null && (
                      <div>
                        <ResultRow label="GHG intensity" value={fmtIntensity(ghg.intensity_per_crore, 4)} unit="tCO₂e / ₹ crore" />
                        <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                          BRSR table asks "per rupee of turnover": {perInrStr(ghg.intensity_per_crore)} tCO₂e/INR
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Water results */}
              {water && mode === "water" && (
                <>
                  {water.by_source.surface     > 0 && <ResultRow label="Surface water"  value={fmtNum(water.by_source.surface)}     unit="kL" />}
                  {water.by_source.groundwater > 0 && <ResultRow label="Groundwater"    value={fmtNum(water.by_source.groundwater)} unit="kL" />}
                  {water.by_source.third_party > 0 && <ResultRow label="Third-party"    value={fmtNum(water.by_source.third_party)} unit="kL" />}
                  {water.by_source.others      > 0 && <ResultRow label="Others"         value={fmtNum(water.by_source.others)}      unit="kL" />}
                  <div className="border-t border-stone-200 pt-1.5 mt-1.5 space-y-1.5">
                    <ResultRow label="Total water withdrawal" value={fmtNum(water.total_kl)} unit="kL" bold />
                    {water.intensity_per_crore !== null && (
                      <div>
                        <ResultRow label="Water intensity" value={fmtIntensity(water.intensity_per_crore, 2)} unit="kL / ₹ crore" />
                        <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                          BRSR table asks "per rupee of turnover": {perInrStr(water.intensity_per_crore)} kL/INR
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          )}
        </div>

        {/* ── Methodology footnote ─────────────────────────────────────────── */}
        <div className="text-[10px] text-stone-400 leading-relaxed space-y-0.5 border-t border-stone-100 pt-2">
          {showEnergyInputs && (
            <>
              <p>
                <span className="font-medium text-stone-500">Scope 1 factors:</span>{" "}
                IPCC 2006 Guidelines for National GHG Inventories, Vol. 2 (Energy) + GHG Protocol Corporate Standard.
              </p>
              <p>
                <span className="font-medium text-stone-500">Scope 2 factor:</span>{" "}
                CEA CO₂ Baseline Database for the Indian Power Sector, Version 21.0, FY 2024-25.{" "}
                <span className="italic">Update annually from cea.nic.in before filing.</span>
              </p>
              <p>
                <span className="font-medium text-stone-500">Energy NCV:</span>{" "}
                Calorific values from IPCC 2006 Vol. 2 Table 1.2 / CEA/BEE for Indian coal.
              </p>
            </>
          )}
          {mode === "water" && (
            <p>Water intensity formula: total withdrawal ÷ turnover (per SEBI BRSR P6-E3 format).</p>
          )}
          <p className="italic">
            Verify emission factors against latest IPCC, CEA, and BEE publications each filing year.
            These numbers are indicative, a certified GHG auditor should sign off on final disclosures.
          </p>
        </div>

      </div>
    </div>
  );
}
