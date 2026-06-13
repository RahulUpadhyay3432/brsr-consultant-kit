// Turns collected "activity" data points (grid electricity, diesel) into a GHG
// figure using the existing, cited calculator (CEA grid factor + IPCC fuel
// factors). This is the "emission / calculation" half Priya described: the
// recipients submit raw activity; the consultant sees Scope 1 & 2 computed.
import { calcGhg, DEFAULT_CALC_INPUTS, type CalcInputs, type GhgResult } from "@/lib/emissions-calculator";
import factors from "@/data/emission_factors.json";
import type { Campaign } from "./types";

// Map our request field ids → the calculator's input keys.
const FIELD_TO_INPUT: Partial<Record<string, keyof CalcInputs>> = {
  "P6-E1-elec": "grid_kwh",
  "P6-E1-diesel": "diesel_l",
};

// ─── Attribution: trace each computed figure back to its input, factor + source,
//     and the person who submitted it. Same factors as calcGhg, so totals agree.
const GRID = factors.scope2_grid;
const DIESEL = factors.scope1_fuels.find((f) => f.id === "diesel")!;

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
      } else if (item.fieldId === "P6-E1-diesel") {
        out.push({
          fieldLabel: item.label,
          rawValue: `${fmtInt(v)} ${item.unit ?? "litres"}`,
          scope: 1,
          factor: `IPCC 2006 · ${DIESEL.co2e_display}`,
          tco2e: (v * DIESEL.co2e_per_unit) / 1000,
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

  for (const contact of campaign.contacts) {
    for (const item of contact.items) {
      const key = FIELD_TO_INPUT[item.fieldId];
      if (key && item.status === "received" && item.value && parseFloat(item.value) > 0) {
        inputs[key] = item.value;
        any = true;
      }
    }
  }

  return any ? calcGhg(inputs) : null;
}
