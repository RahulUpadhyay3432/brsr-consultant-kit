// Turns collected "activity" data points (grid electricity, diesel) into a GHG
// figure using the existing, cited calculator (CEA grid factor + IPCC fuel
// factors). This is the "emission / calculation" half Priya described: the
// recipients submit raw activity; the consultant sees Scope 1 & 2 computed.
import { calcGhg, DEFAULT_CALC_INPUTS, type CalcInputs, type GhgResult } from "@/lib/emissions-calculator";
import factors from "@/data/emission_factors.json";
import type { Campaign } from "./types";

// Collect activity-field id → the calculator's input key + (for fuels) the
// factor id. Covers Scope 2 grid electricity and all six Scope 1 fuels the
// calculator supports, so Collect's auto-calc is at parity with the readiness
// calculator (cited IPCC 2006 / CEA factors throughout).
const GRID = factors.scope2_grid;
const FUEL_FIELDS: Record<string, { input: keyof CalcInputs; fuelId: string }> = {
  "P6-E1-diesel": { input: "diesel_l", fuelId: "diesel" },
  "P6-E1-petrol": { input: "petrol_l", fuelId: "petrol" },
  "P6-E1-cng": { input: "gas_m3", fuelId: "cng" },
  "P6-E1-lpg": { input: "lpg_kg", fuelId: "lpg" },
  "P6-E1-coal": { input: "coal_kg", fuelId: "coal" },
  "P6-E1-fo": { input: "furnace_oil_l", fuelId: "furnace_oil" },
};

function fuelFactor(fuelId: string) {
  return factors.scope1_fuels.find((f) => f.id === fuelId)!;
}

// The methodology statement surfaced wherever a computed emissions figure shows.
// Accurate to what the calculator actually does — and honest about its limits.
export const GHG_METHODOLOGY =
  "Calculated per the GHG Protocol Corporate Standard — Scope 1 from IPCC 2006 (Vol. 2) fuel factors, " +
  "Scope 2 from the CEA grid factor (location-based), IPCC AR5 GWPs. Covers Scope 1 & 2 only; " +
  "refresh the CEA factor each filing year.";

export interface EmissionInput {
  fieldLabel: string;
  rawValue: string;     // e.g. "1,240,000 kWh"
  scope: 1 | 2;
  factor: string;       // human-readable factor + source citation
  tco2e: number;        // this input's contribution
  submittedBy: string;  // owner name or email
}

function fmtInt(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function emissionInputs(campaign: Campaign): EmissionInput[] {
  const out: EmissionInput[] = [];
  for (const contact of campaign.contacts) {
    const who = contact.name || contact.email;
    for (const item of contact.items) {
      if (item.status !== "received" || !item.value) continue;
      const v = parseFloat(item.value);
      if (!(v > 0)) continue;

      if (item.fieldId === "P6-E1-elec") {
        out.push({
          fieldLabel: item.label,
          rawValue: `${fmtInt(v)} ${item.unit ?? "kWh"}`,
          scope: 2,
          factor: `CEA grid factor ${GRID.factor_display} · ${GRID.source_short}`,
          tco2e: (v * GRID.factor_kg_co2_per_kwh) / 1000,
          submittedBy: who,
        });
      } else if (FUEL_FIELDS[item.fieldId]) {
        const f = fuelFactor(FUEL_FIELDS[item.fieldId].fuelId);
        out.push({
          fieldLabel: item.label,
          rawValue: `${fmtInt(v)} ${item.unit ?? f.unit}`,
          scope: 1,
          factor: `IPCC 2006 · ${f.co2e_display}`,
          tco2e: (v * f.co2e_per_unit) / 1000,
          submittedBy: who,
        });
      }
    }
  }
  return out;
}

// Returns a GHG result if any activity data has been collected, else null.
export function campaignEmissions(campaign: Campaign): GhgResult | null {
  const inputs: CalcInputs = { ...DEFAULT_CALC_INPUTS };
  let any = false;

  // Accumulate (not overwrite): the same activity field can be collected from
  // several owners (e.g. one plant manager each), and the total must include
  // all of them so it matches the per-input attribution from emissionInputs().
  const add = (key: keyof CalcInputs, raw: string) => {
    inputs[key] = String((parseFloat(inputs[key]) || 0) + parseFloat(raw));
    any = true;
  };

  for (const contact of campaign.contacts) {
    for (const item of contact.items) {
      if (item.status !== "received" || !item.value || !(parseFloat(item.value) > 0)) continue;
      if (item.fieldId === "P6-E1-elec") add("grid_kwh", item.value);
      else if (FUEL_FIELDS[item.fieldId]) add(FUEL_FIELDS[item.fieldId].input, item.value);
    }
  }

  return any ? calcGhg(inputs) : null;
}
