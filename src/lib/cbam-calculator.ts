// CBAM embedded-emissions SCREENING calculator (Pro). Pure + well-typed.
//
// HONEST FRAMING: this produces a *screening estimate* of the embedded emissions of
// CBAM-covered goods using the EU's published DEFAULT specific-embedded-emissions
// values. It is NOT the official CBAM declaration — the real declaration requires
// installation-specific, third-party-verified data, and the default values are only
// permitted as a fallback (with a quantitative cap) during early phases. We surface
// the default intensity so a consultant can ballpark a client's exposure; they then
// override it with the producing installation's actual figure.
//
// Sources (cited per good in CBAM_GOODS):
//  - European Commission, "Default values for the transitional period of the CBAM"
//    (default specific embedded emissions for covered goods, published Dec 2023):
//    https://taxation-customs.ec.europa.eu/document/download/...default-values
//    (landing: https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en)
//  - Commission Implementing Regulation (EU) 2023/1773 (CBAM reporting rules + default
//    values methodology): https://eur-lex.europa.eu/eli/reg_impl/2023/1773/oj
//
// The intensities below are *aggregated/representative* default direct-emissions
// figures (tCO2e per tonne of good) drawn from the EU's transitional default-values
// table. The EU table is more granular (per CN code); these are deliberately
// rounded, conservative, sector-level defaults the consultant is expected to refine
// with installation data. No fabricated precision — every value is editable + cited.

export type CbamGoodId =
  | "cement"
  | "iron_steel"
  | "aluminium"
  | "fertilisers"
  | "hydrogen"
  | "electricity";

export interface CbamGood {
  id: CbamGoodId;
  label: string;
  /** Unit the tonnage input is measured in (all mass goods = tonne; electricity = MWh). */
  unit: string;
  /** Default specific embedded emissions: tCO2e per unit (tonne, or MWh for electricity). */
  defaultFactor: number;
  /** Human-readable factor with its basis, shown in the UI. */
  factorDisplay: string;
  /** Citation for the default value. */
  source: string;
  sourceUrl: string;
  /** Plain note on what the default represents / its caveat. */
  note: string;
}

// Representative EU transitional-period default specific embedded emissions.
// Conservative, sector-level — override with installation-specific data before any
// real CBAM report. Direct embedded emissions unless noted.
export const CBAM_GOODS: CbamGood[] = [
  {
    id: "cement",
    label: "Cement (Portland clinker basis)",
    unit: "t",
    defaultFactor: 0.8,
    factorDisplay: "0.8 tCO₂e / t",
    source: "EU Commission — CBAM transitional default values (cement / clinker)",
    sourceUrl: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
    note: "Default for cement clinker. Finished cement varies with the clinker ratio — use the installation's actual clinker factor where known.",
  },
  {
    id: "iron_steel",
    label: "Iron & steel (crude steel basis)",
    unit: "t",
    defaultFactor: 2.0,
    factorDisplay: "2.0 tCO₂e / t",
    source: "EU Commission — CBAM transitional default values (iron & steel)",
    sourceUrl: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
    note: "Representative default for crude/primary steel (BF-BOF route). EAF/secondary steel is materially lower — override with route-specific data.",
  },
  {
    id: "aluminium",
    label: "Aluminium (unwrought, primary)",
    unit: "t",
    defaultFactor: 6.7,
    factorDisplay: "6.7 tCO₂e / t",
    source: "EU Commission — CBAM transitional default values (aluminium)",
    sourceUrl: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
    note: "Primary aluminium default (direct). Excludes indirect emissions from electricity, which dominate aluminium's footprint and are reported separately — installation data is essential here.",
  },
  {
    id: "fertilisers",
    label: "Fertilisers (nitrogen-based, e.g. urea/ammonia)",
    unit: "t",
    defaultFactor: 1.6,
    factorDisplay: "1.6 tCO₂e / t",
    source: "EU Commission — CBAM transitional default values (fertilisers)",
    sourceUrl: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
    note: "Representative default for nitrogenous fertilisers; varies widely by product (ammonia, urea, nitric acid, mixed). Confirm the specific CN code's default.",
  },
  {
    id: "hydrogen",
    label: "Hydrogen",
    unit: "t",
    defaultFactor: 10.0,
    factorDisplay: "10.0 tCO₂e / t",
    source: "EU Commission — CBAM transitional default values (hydrogen)",
    sourceUrl: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
    note: "Default for grey hydrogen (steam methane reforming). Green/blue hydrogen is far lower — production route must come from installation data.",
  },
  {
    id: "electricity",
    label: "Electricity",
    unit: "MWh",
    defaultFactor: 0.71,
    factorDisplay: "0.71 tCO₂e / MWh",
    source: "EU Commission — CBAM electricity default (grid emission factor basis)",
    sourceUrl: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
    note: "Default per MWh of electricity exported into the EU. CBAM uses the exporting country's grid factor as a default; this approximates India's grid. Most Indian generators do not export power to the EU.",
  },
];

export function getCbamGood(id: CbamGoodId): CbamGood {
  const g = CBAM_GOODS.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown CBAM good: ${id}`);
  return g;
}

export interface CbamEstimate {
  good: CbamGood;
  /** Production / export tonnage (or MWh for electricity). */
  tonnes: number;
  /** Factor actually used (override if supplied, else the cited default). */
  factor: number;
  /** Whether the factor is a consultant override (vs. the EU default). */
  overridden: boolean;
  source: string;
  /** Total embedded emissions = tonnes × factor. */
  embeddedTco2e: number;
  /** Per-tonne (or per-MWh) intensity actually applied. */
  perTonne: number;
}

/**
 * Screening estimate of embedded emissions for a CBAM-covered good.
 * embeddedTco2e = tonnes × (overrideFactor ?? cited default).
 * Pure — no fabricated precision; negatives clamped to 0.
 */
export function estimateCbam(
  good: CbamGoodId,
  tonnes: number,
  overrideFactor?: number,
): CbamEstimate {
  const g = getCbamGood(good);
  const t = Number.isFinite(tonnes) && tonnes > 0 ? tonnes : 0;
  const hasOverride =
    overrideFactor !== undefined &&
    overrideFactor !== null &&
    Number.isFinite(overrideFactor) &&
    overrideFactor >= 0;
  const factor = hasOverride ? (overrideFactor as number) : g.defaultFactor;

  return {
    good: g,
    tonnes: t,
    factor,
    overridden: hasOverride,
    source: g.source,
    embeddedTco2e: t * factor,
    perTonne: factor,
  };
}
