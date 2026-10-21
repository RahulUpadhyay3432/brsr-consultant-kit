"use client";
// Calculator for BRSR P6 disclosure rows and the /tools/ghg-calculator page.
// Modes: "energy" (P6-E1), "ghg" (P6-E7), "water" (P6-E3).
// Energy + GHG modes share the same fuel/electricity inputs (same CalcInputs keys),
// so entering diesel in P6-E7 is reflected immediately in P6-E1 and vice versa.
// Layouts: "embedded" stacks inputs over results inside its own tinted stage (a report
// row); "page" puts the disclosure figure in a sticky right column so it stays in view
// while typing (the page supplies the stage).
import type { ReactNode } from "react";
import factorsData from "@/data/emission_factors.json";
import {
  calcEnergy, calcGhg, calcWater,
  fmtNum, fmtIntensity, perInrStr,
  FUEL_MAP, FUGITIVE_MAP,
} from "@/lib/emissions-calculator";
import type { CalcInputs } from "@/lib/emissions-calculator";
import {
  CalcPanel, NumberField, ResultList, ResultRow, Citation, FactorLog,
} from "@/components/calc/CalcKit";

type Mode = "energy" | "ghg" | "water";

interface Props {
  mode: Mode;
  inputs: CalcInputs;
  onChange: (key: keyof CalcInputs, value: string) => void;
  layout?: "page" | "embedded";
  /** Extra line under the disclosure figure (the tool page links to its derivation table). */
  resultFooter?: ReactNode;
}

const GRID = factorsData.scope2_grid;
const FUELS = FUEL_MAP.map(({ id, key }) => ({ key, f: factorsData.scope1_fuels.find((x) => x.id === id)! }));
const FUGITIVES = FUGITIVE_MAP.map(({ id, key }) => ({ key, f: factorsData.scope1_fugitive.find((x) => x.id === id)! }));

const WATER_SOURCES: Array<{ key: keyof CalcInputs; label: string; hint: string }> = [
  { key: "water_surface_kl", label: "Surface water",     hint: "Rivers, lakes, canals, harvested rainwater" },
  { key: "water_ground_kl",  label: "Groundwater",       hint: "Borewells and tube wells" },
  { key: "water_third_kl",   label: "Third-party water", hint: "Municipal supply, tankers, industrial parks" },
  { key: "water_others_kl",  label: "Others",            hint: "Seawater, desalinated or any other source" },
];

const SIGN_OFF = "Verify factors against the latest IPCC, CEA and BEE publications each filing year. These figures are indicative; a certified GHG auditor should sign off on final disclosures.";

const DESCRIPTIONS: Record<Mode, string> = {
  ghg:    "Scope 1 & 2 emissions in tCO₂e for BRSR P6-E7. Shares its fuel inputs with the energy calculator.",
  energy: "Total energy in GJ and its intensity for BRSR P6-E1.",
  water:  "Total water withdrawal in kL and its intensity for BRSR P6-E3.",
};

const dash = (has: boolean, s: string) => (has ? s : "—");

export default function EmissionsCalculator({ mode, inputs, onChange, layout = "embedded", resultFooter }: Props) {
  const set = (key: keyof CalcInputs) => (v: string) => onChange(key, v);
  const page = layout === "page";
  const level = page ? 2 : 3;
  const compact = !page;

  const showEnergyInputs = mode === "energy" || mode === "ghg";
  const energy = showEnergyInputs ? calcEnergy(inputs) : null;
  const ghg    = mode === "ghg"   ? calcGhg(inputs)   : null;
  const water  = mode === "water" ? calcWater(inputs) : null;

  const has = (k: keyof CalcInputs) => parseFloat(inputs[k]) > 0;
  const hasAnyInput = showEnergyInputs
    ? ["grid_kwh", "renewable_kwh", ...FUELS.map((x) => x.key), ...(mode === "ghg" ? FUGITIVES.map((x) => x.key) : [])]
        .some((k) => has(k as keyof CalcInputs))
    : WATER_SOURCES.some((w) => has(w.key));

  // ── Inputs ────────────────────────────────────────────────────────────────────
  const electricityPanel = (
    <CalcPanel level={level} compact={compact}
      title={mode === "ghg" ? "Scope 2 — purchased electricity (location-based)" : "Electricity"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Grid electricity purchased" unit="kWh" value={inputs.grid_kwh} onChange={set("grid_kwh")}
          hint={mode === "ghg" ? GRID.factor_display : "1 kWh = 3.6 MJ"} />
        <NumberField label="Renewable electricity consumed" unit="kWh" value={inputs.renewable_kwh} onChange={set("renewable_kwh")}
          hint={mode === "ghg" ? "Zero Scope 2; reported, not netted off grid" : "1 kWh = 3.6 MJ"} />
      </div>
      {mode === "ghg" && (
        <div className="mt-4">
          <Citation source={`CEA CO₂ Baseline Database for the Indian Power Sector, ${GRID.source_short}. Location-based national grid average; CEA republishes it every year, so update it before filing.`} />
        </div>
      )}
    </CalcPanel>
  );

  const fuelPanel = (
    <CalcPanel level={level} compact={compact}
      title={mode === "ghg" ? "Scope 1 — stationary and mobile combustion" : "Fuels"}>
      <div className="grid gap-4 sm:grid-cols-2">
        {FUELS.map(({ key, f }) => (
          <NumberField key={key} label={f.label} unit={f.unit} value={inputs[key]} onChange={set(key)}
            hint={mode === "ghg" ? f.co2e_display : `NCV ${f.ncv_display}`} />
        ))}
      </div>
      <p className="mt-4 text-[12.5px] text-ink-muted leading-relaxed">
        {mode === "ghg"
          ? "Gensets, boilers, furnaces and owned vehicles. Enter the fuels the client used and leave the rest blank."
          : "BRSR asks for energy in joules. Net calorific values are IPCC 2006 Vol. 2 Table 1.2 defaults (Indian coal from CEA/BEE); substitute supplier-certified NCVs where the client has them, and say so in the disclosure."}
      </p>
    </CalcPanel>
  );

  const fugitivePanel = (
    <CalcPanel level={level} compact={compact} title="Scope 1 — fugitive refrigerants and SF₆">
      <div className="grid gap-4 sm:grid-cols-2">
        {FUGITIVES.map(({ key, f }) => (
          <NumberField key={key} label={f.label} unit={f.unit} value={inputs[key]} onChange={set(key)} hint={f.co2e_display} />
        ))}
      </div>
      <p className="mt-4 text-[12.5px] text-ink-muted leading-relaxed">
        Enter the top-up quantity for the year, not the installed charge. Installed charge only becomes an emission when it leaks.
      </p>
    </CalcPanel>
  );

  const waterPanel = (
    <CalcPanel level={level} compact={compact} title="Water withdrawal by source — BRSR P6-E3">
      <div className="grid gap-4 sm:grid-cols-2">
        {WATER_SOURCES.map((w) => (
          <NumberField key={w.key} label={w.label} unit="kL" value={inputs[w.key]} onChange={set(w.key)} hint={w.hint} />
        ))}
      </div>
    </CalcPanel>
  );

  // ── Disclosure figure ─────────────────────────────────────────────────────────
  const turnoverField = (
    <div className="mt-2 border-t border-[#D6E6F7] pt-4">
      <NumberField label="Turnover, for intensity" unit="₹ crore" value={inputs.turnover_crore} onChange={set("turnover_crore")}
        hint="Optional. Shared across energy, GHG and water intensity, so enter it once." />
    </div>
  );

  const intensityRow = (perCrore: number | null, decimals: number, unit: string, perInrUnit: string, label: string) =>
    perCrore !== null && (
      <div className="mt-1">
        <ResultList>
          <ResultRow label={label} value={fmtIntensity(perCrore, decimals)} unit={unit}
            note={`BRSR table asks "per rupee of turnover": ${perInrStr(perCrore)} ${perInrUnit}`} />
        </ResultList>
      </div>
    );

  let resultTitle = "";
  let resultBody: ReactNode = null;
  let resultNote: ReactNode = null;

  if (ghg) {
    const fuelLines = ghg.scope1_breakdown.filter((l) => FUELS.some((x) => x.f.label === l.label));
    const fugLines = ghg.scope1_breakdown.filter((l) => FUGITIVES.some((x) => x.f.label === l.label));
    resultTitle = "Disclosure figure";
    resultBody = (
      <>
        <ResultList>
          <ResultRow label="Scope 1 — combustion" value={dash(hasAnyInput, fmtNum(ghg.scope1_fuel_tco2e, 2))} unit="tCO₂e" />
          {fuelLines.length > 1 && fuelLines.map((l) => (
            <ResultRow key={l.label} label={l.label} value={fmtNum(l.tco2e, 2)} unit="tCO₂e" muted indent />
          ))}
          <ResultRow label="Scope 1 — fugitive" value={dash(hasAnyInput, fmtNum(ghg.scope1_fugitive_tco2e, 2))} unit="tCO₂e" />
          {fugLines.length > 1 && fugLines.map((l) => (
            <ResultRow key={l.label} label={l.label} value={fmtNum(l.tco2e, 2)} unit="tCO₂e" muted indent />
          ))}
          <ResultRow label="Scope 2 — location-based" value={dash(hasAnyInput, fmtNum(ghg.scope2_tco2e, 2))} unit="tCO₂e"
            note={`Grid factor ${GRID.factor_display}, ${GRID.source_short}`} />
          <ResultRow label="Total Scope 1 + 2" sub="tCO₂e · BRSR P6-E7" value={dash(hasAnyInput, fmtNum(ghg.total_tco2e, 2))} strong />
        </ResultList>
        {turnoverField}
        {intensityRow(ghg.intensity_per_crore, 4, "tCO₂e / ₹ crore", "tCO₂e/INR", "GHG intensity")}
      </>
    );
    resultNote = "Process emissions (cement calcination, welding gases and similar) are not modelled; add them to Scope 1 separately if material.";
  } else if (energy) {
    resultTitle = "Energy disclosure";
    resultBody = (
      <>
        <ResultList>
          <ResultRow label="Renewable — electricity" value={dash(hasAnyInput, fmtNum(energy.renewable_gj))} unit="GJ" />
          <ResultRow label="Non-renewable — grid electricity" value={dash(hasAnyInput, fmtNum(energy.grid_gj))} unit="GJ" />
          <ResultRow label="Non-renewable — fuels" value={dash(hasAnyInput, fmtNum(energy.fuel_gj))} unit="GJ" />
          {energy.fuel_breakdown.length > 1 && energy.fuel_breakdown.map((f) => (
            <ResultRow key={f.label} label={f.label} value={fmtNum(f.gj)} unit="GJ" muted indent />
          ))}
          <ResultRow label="Total energy consumed" sub="GJ · BRSR P6-E1" value={dash(hasAnyInput, fmtNum(energy.total_gj))} strong />
          <ResultRow label="Renewable share" value={energy.total_gj > 0 ? fmtNum(energy.renewable_pct, 1) : "—"} unit="%" />
        </ResultList>
        {turnoverField}
        {intensityRow(energy.intensity_per_crore, 2, "GJ / ₹ crore", "GJ/INR", "Energy intensity")}
      </>
    );
    resultNote = "If the client is a designated consumer under PAT, the Form A return already carries this figure. Reconcile to it rather than building a parallel number; an assurer will compare the two.";
  } else if (water) {
    resultTitle = "Water disclosure";
    resultBody = (
      <>
        <ResultList>
          <ResultRow label="Surface water" value={dash(hasAnyInput, fmtNum(water.by_source.surface))} unit="kL" />
          <ResultRow label="Groundwater" value={dash(hasAnyInput, fmtNum(water.by_source.groundwater))} unit="kL" />
          <ResultRow label="Third-party water" value={dash(hasAnyInput, fmtNum(water.by_source.third_party))} unit="kL" />
          <ResultRow label="Others" value={dash(hasAnyInput, fmtNum(water.by_source.others))} unit="kL" />
          <ResultRow label="Total water withdrawal" sub="kL · BRSR P6-E3" value={dash(hasAnyInput, fmtNum(water.total_kl))} strong />
        </ResultList>
        {turnoverField}
        {intensityRow(water.intensity_per_crore, 2, "kL / ₹ crore", "kL/INR", "Water intensity")}
      </>
    );
    resultNote = "Water intensity is total withdrawal divided by turnover, per the SEBI BRSR P6-E3 format.";
  }

  const resultPanel = (
    <CalcPanel level={level} compact={compact} title={resultTitle}>
      {!hasAnyInput && (
        <p className="-mt-3 mb-2 text-[12.5px] text-ink-muted leading-relaxed">
          Fills in as you enter values.
        </p>
      )}
      {resultBody}
      <div className="mt-4 space-y-2 border-t border-[#D6E6F7] pt-3 text-[12px] text-ink-muted leading-relaxed">
        {resultNote && <p>{resultNote}</p>}
        {mode !== "water" && <p>{SIGN_OFF}</p>}
        {resultFooter}
      </div>
    </CalcPanel>
  );

  // ── Factor log (embedded only; the tool page carries a full derivation table) ──
  const factorItems = mode === "ghg"
    ? [
        { key: "grid", label: "Grid electricity", value: GRID.factor_display, source: GRID.source },
        ...FUELS.map(({ f }) => ({ key: f.id, label: f.label, value: f.co2e_display, source: f.source })),
        ...FUGITIVES.map(({ f }) => ({ key: f.id, label: f.label, value: f.co2e_display, source: f.source })),
      ]
    : mode === "energy"
    ? [
        { key: "kwh", label: "Electricity", value: "3.6 MJ/kWh", source: "SI definition: 1 kWh = 3.6 MJ exactly." },
        ...FUELS.map(({ f }) => ({ key: f.id, label: f.label, value: f.ncv_display, source: f.source })),
      ]
    : [];

  const inputPanels = (
    <>
      {showEnergyInputs && electricityPanel}
      {showEnergyInputs && fuelPanel}
      {mode === "ghg" && fugitivePanel}
      {mode === "water" && waterPanel}
    </>
  );

  if (page) {
    return (
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">{inputPanels}</div>
        <div className="lg:sticky lg:top-24">{resultPanel}</div>
      </div>
    );
  }

  return (
    <div className="calc-stage rounded-3xl p-3 sm:p-4 space-y-3">
      <div className="px-2 pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Calculator · runs on this device</p>
        <p className="text-[12.5px] text-ink-body leading-snug mt-0.5">{DESCRIPTIONS[mode]}</p>
      </div>
      {inputPanels}
      {resultPanel}
      {factorItems.length > 0 && (
        <FactorLog collapsible items={factorItems} />
      )}
    </div>
  );
}
