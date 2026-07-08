// Pure computation for BRSR P6 calculators: GHG Scope 1 & 2, energy intensity, water intensity.
// All emission factors live in emission_factors.json, cited per-factor in EmissionsCalculator UI.
import factorsData from "@/data/emission_factors.json";

export interface CalcInputs {
  // Electricity (P6-E1 energy + P6-E7 Scope 2)
  grid_kwh: string;
  renewable_kwh: string;
  // Fuels (P6-E1 energy + P6-E7 Scope 1)
  diesel_l: string;
  petrol_l: string;
  gas_m3: string;          // CNG / piped natural gas, same emission factor
  lpg_kg: string;
  coal_kg: string;
  furnace_oil_l: string;
  // Fugitive emissions (P6-E7 Scope 1): refrigerant leaked / topped up, in kg
  refrigerant_r134a_kg: string;
  refrigerant_r410a_kg: string;
  refrigerant_r32_kg: string;
  refrigerant_r404a_kg: string;
  sf6_kg: string;
  // Shared intensity denominator
  turnover_crore: string;
  // Water sources (P6-E3)
  water_surface_kl: string;
  water_ground_kl: string;
  water_third_kl: string;
  water_others_kl: string;
}

export const DEFAULT_CALC_INPUTS: CalcInputs = {
  grid_kwh: "", renewable_kwh: "",
  diesel_l: "", petrol_l: "", gas_m3: "", lpg_kg: "", coal_kg: "", furnace_oil_l: "",
  refrigerant_r134a_kg: "", refrigerant_r410a_kg: "", refrigerant_r32_kg: "", refrigerant_r404a_kg: "", sf6_kg: "",
  turnover_crore: "",
  water_surface_kl: "", water_ground_kl: "", water_third_kl: "", water_others_kl: "",
};

const KWH_TO_GJ = 0.0036;

function n(s: string): number { return Math.max(0, parseFloat(s) || 0); }

function fuel(id: string) {
  return factorsData.scope1_fuels.find(f => f.id === id)!;
}

function fugitive(id: string) {
  return factorsData.scope1_fugitive.find(f => f.id === id)!;
}

// Fuel qty → CalcInputs key mapping (ordered for display)
const FUEL_MAP: Array<{ id: string; key: keyof CalcInputs }> = [
  { id: "diesel",      key: "diesel_l"      },
  { id: "petrol",      key: "petrol_l"      },
  { id: "cng",         key: "gas_m3"        },
  { id: "lpg",         key: "lpg_kg"        },
  { id: "coal",        key: "coal_kg"       },
  { id: "furnace_oil", key: "furnace_oil_l" },
];

// Fugitive refrigerant → CalcInputs key mapping. Scope 1, but no calorific value,
// so these are excluded from the energy calculation (calcEnergy uses FUEL_MAP only).
const FUGITIVE_MAP: Array<{ id: string; key: keyof CalcInputs }> = [
  { id: "r134a", key: "refrigerant_r134a_kg" },
  { id: "r410a", key: "refrigerant_r410a_kg" },
  { id: "r32",   key: "refrigerant_r32_kg"   },
  { id: "r404a", key: "refrigerant_r404a_kg" },
  { id: "sf6",   key: "sf6_kg"               },
];

export interface EnergyResult {
  electricity_gj: number;  // grid + renewable
  renewable_gj: number;
  grid_gj: number;
  fuel_gj: number;
  total_gj: number;
  renewable_pct: number;
  intensity_per_crore: number | null; // GJ per INR crore
  fuel_breakdown: Array<{ label: string; gj: number }>;
}

export function calcEnergy(inp: CalcInputs): EnergyResult {
  const grid_gj      = n(inp.grid_kwh)      * KWH_TO_GJ;
  const renewable_gj = n(inp.renewable_kwh) * KWH_TO_GJ;
  const electricity_gj = grid_gj + renewable_gj;

  const fuel_breakdown = FUEL_MAP
    .map(({ id, key }) => ({ label: fuel(id).label, gj: n(inp[key]) * fuel(id).ncv_gj_per_unit }))
    .filter(f => f.gj > 0);
  const fuel_gj = fuel_breakdown.reduce((s, f) => s + f.gj, 0);

  const total_gj = electricity_gj + fuel_gj;
  const renewable_pct = total_gj > 0 ? (renewable_gj / total_gj) * 100 : 0;
  const t = n(inp.turnover_crore);
  const intensity_per_crore = t > 0 ? total_gj / t : null;

  return { electricity_gj, renewable_gj, grid_gj, fuel_gj, total_gj, renewable_pct, intensity_per_crore, fuel_breakdown };
}

export interface GhgResult {
  scope1_tco2e: number;
  scope2_tco2e: number;
  total_tco2e: number;
  intensity_per_crore: number | null; // tCO2e per INR crore
  scope1_breakdown: Array<{ label: string; tco2e: number }>;
}

export function calcGhg(inp: CalcInputs): GhgResult {
  const fuelBreakdown = FUEL_MAP
    .map(({ id, key }) => ({ label: fuel(id).label, tco2e: n(inp[key]) * fuel(id).co2e_per_unit / 1000 }))
    .filter(f => f.tco2e > 0);
  // Fugitive refrigerant emissions: kg leaked × its GWP (kgCO₂e/kg) → tonnes.
  const fugitiveBreakdown = FUGITIVE_MAP
    .map(({ id, key }) => ({ label: fugitive(id).label, tco2e: n(inp[key]) * fugitive(id).co2e_per_unit / 1000 }))
    .filter(f => f.tco2e > 0);
  const scope1_breakdown = [...fuelBreakdown, ...fugitiveBreakdown];
  const scope1_tco2e = scope1_breakdown.reduce((s, f) => s + f.tco2e, 0);

  const scope2_tco2e = n(inp.grid_kwh) * factorsData.scope2_grid.factor_kg_co2_per_kwh / 1000;
  const total_tco2e = scope1_tco2e + scope2_tco2e;

  const t = n(inp.turnover_crore);
  const intensity_per_crore = t > 0 ? total_tco2e / t : null;

  return { scope1_tco2e, scope2_tco2e, total_tco2e, intensity_per_crore, scope1_breakdown };
}

export interface WaterResult {
  by_source: { surface: number; groundwater: number; third_party: number; others: number };
  total_kl: number;
  intensity_per_crore: number | null; // kL per INR crore
}

export function calcWater(inp: CalcInputs): WaterResult {
  const surface     = n(inp.water_surface_kl);
  const groundwater = n(inp.water_ground_kl);
  const third_party = n(inp.water_third_kl);
  const others      = n(inp.water_others_kl);
  const total_kl = surface + groundwater + third_party + others;

  const t = n(inp.turnover_crore);
  const intensity_per_crore = t > 0 ? total_kl / t : null;

  return { by_source: { surface, groundwater, third_party, others }, total_kl, intensity_per_crore };
}

// Display helpers (exported for use in the UI component)
export function fmtNum(x: number, decimals = 1): string {
  if (x === 0) return "0";
  return x.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtIntensity(perCrore: number, decimals = 2): string {
  if (perCrore === 0) return "0";
  const rounded = perCrore < 1 ? perCrore.toPrecision(3) : perCrore.toFixed(decimals);
  return rounded;
}

// Scientific-notation string for BRSR per-INR table entry
export function perInrStr(perCrore: number): string {
  const v = perCrore / 1e7;
  if (v === 0) return "0";
  return v.toExponential(2);
}
