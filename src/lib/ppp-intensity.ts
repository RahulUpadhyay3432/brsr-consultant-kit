// Pure computation for the PPP-adjusted BRSR intensity tool.
// PPP-adjusted intensity lets a consultant express an emissions/energy intensity
// against PPP-adjusted turnover (international $) instead of raw rupees, so an
// Indian company's figure is comparable with global peers.
//
//   PPP-adjusted revenue (int'l $) = revenue_INR / PPP_factor
//   PPP-adjusted intensity         = metric / PPP-adjusted revenue
//                                   = (metric / revenue_INR) * PPP_factor
//                                   = rupee_intensity * PPP_factor
import pppData from "@/data/ppp_factor.json";

export const PPP_FACTOR = pppData.value;          // 20.45 (2024)
export const PPP_META = pppData._meta;
export const PPP_YEAR = pppData.year;
export const PPP_UNIT = pppData.unit;

export type MetricUnit = "tco2e" | "gj";

export const METRIC_LABEL: Record<MetricUnit, string> = {
  tco2e: "tCO₂e",
  gj: "GJ",
};

export interface PppInputs {
  metric: string;        // emissions (tCO2e) or energy (GJ)
  metricUnit: MetricUnit;
  revenueCrore: string;  // annual turnover in ₹ crore
  pppFactor: string;     // editable, pre-filled from ppp_factor.json
}

export const DEFAULT_PPP_INPUTS: PppInputs = {
  metric: "",
  metricUnit: "tco2e",
  revenueCrore: "",
  pppFactor: String(PPP_FACTOR),
};

function num(s: string): number {
  const v = parseFloat((s || "").replace(/[,\s]/g, ""));
  return isFinite(v) && v > 0 ? v : 0;
}

export interface PppResult {
  revenueInr: number;            // absolute rupees
  pppRevenueIntl: number;        // international $ (PPP)
  rupeeIntensityPerCrore: number | null;   // metric per ₹ crore
  pppIntensityPerMillionIntl: number | null; // metric per million int'l $
  factor: number;
  valid: boolean;                // enough inputs to compute an intensity
}

export function calcPppIntensity(inp: PppInputs): PppResult {
  const metric = num(inp.metric);
  const revenueCrore = num(inp.revenueCrore);
  const factor = num(inp.pppFactor);

  const revenueInr = revenueCrore * 1e7;
  const pppRevenueIntl = factor > 0 ? revenueInr / factor : 0;

  const valid = metric > 0 && revenueCrore > 0 && factor > 0;

  const rupeeIntensityPerCrore = revenueCrore > 0 ? metric / revenueCrore : null;
  // metric per million international $ (a readable scale for the comparison figure)
  const pppIntensityPerMillionIntl =
    pppRevenueIntl > 0 ? metric / (pppRevenueIntl / 1e6) : null;

  return {
    revenueInr,
    pppRevenueIntl,
    rupeeIntensityPerCrore,
    pppIntensityPerMillionIntl,
    factor,
    valid,
  };
}

// Display helpers
export function fmt(x: number, decimals = 2): string {
  if (x === 0) return "0";
  const abs = Math.abs(x);
  const d = abs < 1 ? 4 : decimals;
  return x.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtInt(x: number): string {
  return Math.round(x).toLocaleString("en-IN");
}
