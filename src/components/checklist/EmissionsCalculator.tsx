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

// ── Input field ────────────────────────────────────────────────────────────────
function Field({
  label, unit, value, onChange,
}: { label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11.5px] font-bold text-brand-800 uppercase tracking-[0.04em] mb-1.5">
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
          className="flex-1 min-w-0 h-10 px-3 text-[15px] font-mono text-ink border border-[#CDE2F6] rounded-lg
            bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400
            transition-[border-color,box-shadow] placeholder:text-ink-faint"
        />
        <span className="flex items-center h-10 px-2.5 rounded-lg bg-brand-50 border border-[#CDE2F6]
          text-[12.5px] font-semibold text-brand-800 whitespace-nowrap flex-shrink-0">
          {unit}
        </span>
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
      <span className={`text-[13px] leading-relaxed ${muted ? "text-ink-faint" : bold ? "text-ink font-semibold" : "text-ink-muted"}`}>
        {label}
      </span>
      <span className={`text-[13px] font-mono tabular-nums whitespace-nowrap ${muted ? "text-ink-faint" : bold ? "text-ink font-semibold" : "text-ink-body"}`}>
        {value} <span className={`font-sans text-[11px] ${bold ? "text-ink-muted font-normal" : "text-ink-faint"}`}>{unit}</span>
      </span>
    </div>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-brand-700 mb-2.5">
      {children}
    </p>
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

  const showEnergyInputs = mode === "energy" || mode === "ghg";

  const energy  = showEnergyInputs ? calcEnergy(inputs)  : null;
  const ghg     = mode === "ghg"   ? calcGhg(inputs)     : null;
  const water   = mode === "water" ? calcWater(inputs)   : null;

  const hasAnyInput = showEnergyInputs
    ? [inputs.grid_kwh, inputs.renewable_kwh, inputs.diesel_l, inputs.petrol_l,
       inputs.gas_m3, inputs.lpg_kg, inputs.coal_kg, inputs.furnace_oil_l].some(v => parseFloat(v) > 0)
    : [inputs.water_surface_kl, inputs.water_ground_kl,
       inputs.water_third_kl,   inputs.water_others_kl].some(v => parseFloat(v) > 0);

  // Hero value for the results panel
  const heroValue = ghg ? { num: fmtNum(ghg.total_tco2e, 2), unit: "tCO₂e" }
    : energy ? { num: fmtNum(energy.total_gj), unit: "GJ" }
    : water  ? { num: fmtNum(water.total_kl),  unit: "kL" }
    : null;

  return (
    <div className="border border-[#CDE2F6] rounded-2xl shadow-[0_1px_6px_rgba(15,30,51,0.08)] overflow-hidden">

      {/* Header band */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#EAF4FE] border-b border-[#CDE2F6]">
        <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
          {mode === "water" ? (
            <svg className="w-3.5 h-3.5 text-brand-600" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 2C7.5 2 3 7 3 10a4.5 4.5 0 0 0 9 0C12 7 7.5 2 7.5 2z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-brand-600" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="7.5" r="4" />
              <path d="M7.5 5v2.5l1.5 1" />
              <path d="M7.5 1.5v1M13.5 7.5h-1M7.5 13v-1M1.5 7.5h1" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-ink leading-snug">{TITLES[mode]}</p>
          <p className="text-[11.5px] text-ink-muted leading-snug hidden sm:block">{DESCRIPTIONS[mode]}</p>
        </div>
        <span className="text-[10px] font-semibold text-brand-700 bg-white border border-[#CDE2F6] px-2 py-0.5 rounded-full flex-shrink-0">
          Calculator
        </span>
      </div>

      <div className="px-5 py-5 space-y-5">

        {/* ── Electricity inputs ──────────────────────────────────────────────── */}
        {showEnergyInputs && (
          <div>
            <SectionLabel>Electricity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Grid electricity"      unit="kWh" value={inputs.grid_kwh}      onChange={set("grid_kwh")} />
              <Field label="Renewable electricity" unit="kWh" value={inputs.renewable_kwh} onChange={set("renewable_kwh")} />
            </div>
          </div>
        )}

        {/* ── Fuel inputs ─────────────────────────────────────────────────────── */}
        {showEnergyInputs && (
          <div>
            <SectionLabel>
              Fuels <span className="text-ink-faint normal-case tracking-normal font-normal">, enter quantities used (leave others blank)</span>
            </SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Diesel (HSD)" unit="L"  value={inputs.diesel_l}      onChange={set("diesel_l")}      />
              <Field label="Petrol (MS)"  unit="L"  value={inputs.petrol_l}      onChange={set("petrol_l")}      />
              <Field label="CNG / Gas"    unit="m³" value={inputs.gas_m3}        onChange={set("gas_m3")}        />
              <Field label="LPG"          unit="kg" value={inputs.lpg_kg}        onChange={set("lpg_kg")}        />
              <Field label="Coal"         unit="kg" value={inputs.coal_kg}       onChange={set("coal_kg")}       />
              <Field label="Furnace Oil"  unit="L"  value={inputs.furnace_oil_l} onChange={set("furnace_oil_l")} />
            </div>
          </div>
        )}

        {/* ── Water source inputs ─────────────────────────────────────────────── */}
        {mode === "water" && (
          <div>
            <SectionLabel>Water withdrawal by source</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Surface water" unit="kL" value={inputs.water_surface_kl} onChange={set("water_surface_kl")} />
              <Field label="Groundwater"   unit="kL" value={inputs.water_ground_kl}  onChange={set("water_ground_kl")}  />
              <Field label="Third-party"   unit="kL" value={inputs.water_third_kl}   onChange={set("water_third_kl")}   />
              <Field label="Others"        unit="kL" value={inputs.water_others_kl}  onChange={set("water_others_kl")}  />
            </div>
          </div>
        )}

        {/* ── Annual turnover ─────────────────────────────────────────────────── */}
        <div>
          <SectionLabel>
            Annual turnover <span className="text-ink-faint normal-case tracking-normal font-normal">, optional, for intensity</span>
          </SectionLabel>
          <div className="max-w-[220px]">
            <Field label="Turnover" unit="₹ crore" value={inputs.turnover_crore} onChange={set("turnover_crore")} />
          </div>
          <p className="text-[13px] text-ink-muted mt-1.5">
            Shared across energy, GHG, and water intensity calculations, enter once.
          </p>
        </div>

        {/* ── Results ─────────────────────────────────────────────────────────── */}
        <div className="border-t border-[#CDE2F6] pt-4">
          <SectionLabel>Results</SectionLabel>

          {!hasAnyInput ? (
            <div className="rounded-xl border border-dashed border-[#B9D7F5] bg-[#F8FBFE] px-4 py-4">
              <div className="pb-3 mb-2 border-b border-dashed border-[#CDE2F6] flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-ink-faint tabular-nums leading-none">—</span>
                <span className="text-[14px] font-semibold text-ink-muted">
                  {mode === "ghg" ? "tCO₂e" : mode === "water" ? "kL" : "GJ"}
                </span>
              </div>
              <p className="text-[12.5px] text-ink-muted leading-relaxed">
                Your BRSR figure will appear here as you fill in the values above.
              </p>
            </div>
          ) : (
            <div className="bg-[#EAF4FE] border border-[#CDE2F6] rounded-xl px-4 py-4 space-y-2">

              {/* Hero total */}
              {heroValue && (
                <div className="pb-3 mb-1 border-b border-[#CDE2F6]">
                  <span className="text-[28px] font-bold text-ink tabular-nums leading-none">{heroValue.num}</span>
                  <span className="text-[14px] text-ink-muted ml-2">{heroValue.unit}</span>
                </div>
              )}

              {/* Energy results */}
              {energy && mode === "energy" && (
                <>
                  <ResultRow label="Grid electricity"      value={fmtNum(energy.grid_gj)}      unit="GJ" />
                  <ResultRow label="Renewable electricity" value={fmtNum(energy.renewable_gj)} unit="GJ" />
                  {energy.fuel_breakdown.map((f, i) => (
                    <ResultRow key={i} label={f.label} value={fmtNum(f.gj)} unit="GJ" indent muted />
                  ))}
                  {energy.fuel_gj > 0 && (
                    <ResultRow label="Total fuel" value={fmtNum(energy.fuel_gj)} unit="GJ" />
                  )}
                  <div className="border-t border-[#CDE2F6] pt-2 mt-2 space-y-1.5">
                    <ResultRow label="Total energy" value={fmtNum(energy.total_gj)} unit="GJ" bold />
                    {energy.total_gj > 0 && (
                      <ResultRow label="Renewable share" value={fmtNum(energy.renewable_pct, 1)} unit="%" />
                    )}
                    {energy.intensity_per_crore !== null && (
                      <div>
                        <ResultRow label="Energy intensity" value={fmtIntensity(energy.intensity_per_crore)} unit="GJ / ₹ crore" />
                        <p className="text-[10px] text-ink-faint pl-0 mt-0.5 leading-snug">
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
                  <p className="text-[10px] text-ink-faint leading-snug">
                    Fuel combustion only. Refrigerant/fugitive and process emissions are not included, add them to Scope 1 separately if material.
                  </p>
                  <div>
                    <ResultRow label="Scope 2 (grid electricity)" value={fmtNum(ghg.scope2_tco2e, 2)} unit="tCO₂e" />
                    <p className="text-[10px] text-ink-faint mt-0.5 leading-snug">
                      Factor: {factorsData.scope2_grid.factor_display}, {factorsData.scope2_grid.source_short}
                    </p>
                  </div>
                  <div className="border-t border-[#CDE2F6] pt-2 mt-2 space-y-1.5">
                    <ResultRow label="Total Scope 1 + 2" value={fmtNum(ghg.total_tco2e, 2)} unit="tCO₂e" bold />
                    {ghg.intensity_per_crore !== null && (
                      <div>
                        <ResultRow label="GHG intensity" value={fmtIntensity(ghg.intensity_per_crore, 4)} unit="tCO₂e / ₹ crore" />
                        <p className="text-[10px] text-ink-faint mt-0.5 leading-snug">
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
                  <div className="border-t border-[#CDE2F6] pt-2 mt-2 space-y-1.5">
                    <ResultRow label="Total water withdrawal" value={fmtNum(water.total_kl)} unit="kL" bold />
                    {water.intensity_per_crore !== null && (
                      <div>
                        <ResultRow label="Water intensity" value={fmtIntensity(water.intensity_per_crore, 2)} unit="kL / ₹ crore" />
                        <p className="text-[10px] text-ink-faint mt-0.5 leading-snug">
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

        {/* ── Methodology footnote ─────────────────────────────────────────────── */}
        <div className="text-[10.5px] text-ink-faint leading-relaxed space-y-0.5 border-t border-line pt-3">
          {showEnergyInputs && (
            <>
              <p><span className="font-medium text-ink-muted">Scope 1 factors:</span>{" "}IPCC 2006 Guidelines for National GHG Inventories, Vol. 2 (Energy) + GHG Protocol Corporate Standard.</p>
              <p><span className="font-medium text-ink-muted">Scope 2 factor:</span>{" "}CEA CO₂ Baseline Database for the Indian Power Sector, Version 21.0, FY 2024-25.{" "}<span className="italic">Update annually from cea.nic.in before filing.</span></p>
              <p><span className="font-medium text-ink-muted">Energy NCV:</span>{" "}Calorific values from IPCC 2006 Vol. 2 Table 1.2 / CEA/BEE for Indian coal.</p>
            </>
          )}
          {mode === "water" && (
            <p>Water intensity formula: total withdrawal ÷ turnover (per SEBI BRSR P6-E3 format).</p>
          )}
          <p className="italic">Verify emission factors against latest IPCC, CEA, and BEE publications each filing year. These numbers are indicative, a certified GHG auditor should sign off on final disclosures.</p>
        </div>

      </div>
    </div>
  );
}
