// Pure computation for the BRSR P6-L2 Scope 3 screening calculator.
// Activity/distance-based per the GHG Protocol Corporate Value Chain (Scope 3)
// Standard; factors from scope3_factors.json (DEFRA 2024 v1.1, cited per-factor).
// Screening-level, Scope 3 is a BRSR Leadership (voluntary) indicator.
import scope3Data from "@/data/scope3_factors.json";

interface Factor { id: string; label: string; co2e: number; unit: string; display: string; source: string }
interface FactorGroup { category: string; unit: string; note?: string; factors: Factor[] }

// The four activity-based categories, in display order.
const GROUP_KEYS = ["business_travel", "commuting", "freight", "waste"] as const;
export type Scope3GroupKey = (typeof GROUP_KEYS)[number];

const GROUPS: Record<Scope3GroupKey, FactorGroup> = {
  business_travel: scope3Data.business_travel as FactorGroup,
  commuting: scope3Data.commuting as FactorGroup,
  freight: scope3Data.freight as FactorGroup,
  waste: scope3Data.waste as FactorGroup,
};

// Every factor id across all groups is an input key (the activity quantity).
export type Scope3Inputs = Record<string, string>;

// Group metadata for the UI to render inputs from the same source of truth.
export interface Scope3FactorMeta { id: string; label: string; unit: string; display: string }
export interface Scope3GroupMeta { key: Scope3GroupKey; category: string; unit: string; note?: string; factors: Scope3FactorMeta[] }
export const SCOPE3_GROUPS: Scope3GroupMeta[] = GROUP_KEYS.map((key) => ({
  key,
  category: GROUPS[key].category,
  unit: GROUPS[key].unit,
  note: GROUPS[key].note,
  factors: GROUPS[key].factors.map((f) => ({ id: f.id, label: f.label, unit: f.unit, display: f.display })),
}));

export const DEFAULT_SCOPE3_INPUTS: Scope3Inputs = (() => {
  const out: Scope3Inputs = {};
  for (const key of GROUP_KEYS) for (const f of GROUPS[key].factors) out[f.id] = "";
  return out;
})();

function n(s: string | undefined): number {
  return Math.max(0, parseFloat(s ?? "") || 0);
}

export interface Scope3Line {
  label: string;
  qty: number;
  activityUnit: string;  // the input unit (passenger-km / tonne-km / tonne / km)
  factorDisplay: string; // cited factor
  tco2e: number;
}
export interface Scope3CategoryResult {
  key: Scope3GroupKey;
  category: string;
  lines: Scope3Line[];   // only inputs the user actually entered (> 0)
  subtotal_tco2e: number;
}
export interface Scope3Result {
  categories: Scope3CategoryResult[]; // every category, even if empty (subtotal 0)
  total_tco2e: number;
  intensity_per_crore: number | null; // tCO2e per INR crore, if turnover given
  anyInput: boolean;
}

// activityUnit shown to the user: the factor unit is "passenger-km" / "tonne-km" /
// "tonne" / "km" (per the JSON), which is exactly the activity quantity to enter.
export function calcScope3(inputs: Scope3Inputs, turnoverCrore?: string): Scope3Result {
  const categories: Scope3CategoryResult[] = [];
  let total = 0;
  let anyInput = false;

  for (const key of GROUP_KEYS) {
    const g = GROUPS[key];
    const lines: Scope3Line[] = [];
    let subtotal = 0;
    for (const f of g.factors) {
      const qty = n(inputs[f.id]);
      if (qty <= 0) continue;
      anyInput = true;
      const tco2e = (qty * f.co2e) / 1000; // kgCO2e → tonnes
      subtotal += tco2e;
      lines.push({ label: f.label, qty, activityUnit: f.unit, factorDisplay: f.display, tco2e });
    }
    total += subtotal;
    categories.push({ key, category: g.category, lines, subtotal_tco2e: subtotal });
  }

  const t = n(turnoverCrore);
  const intensity_per_crore = t > 0 ? total / t : null;

  return { categories, total_tco2e: total, intensity_per_crore, anyInput };
}
