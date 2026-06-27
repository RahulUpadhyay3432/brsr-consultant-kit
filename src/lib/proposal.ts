// Proposal & fee builder (Pro). Helps a consultant scope + price a BRSR engagement.
// IMPORTANT honesty stance: there is no public benchmark for Indian consultant fees,
// so this NEVER asserts a market price. It is a structuring aid, the consultant sets
// their own base + add-on rates (editable); the rubric applies transparent multipliers
// for scope. Every number traces to the consultant's own input. Pure functions.

export type CompanySizeKey = "listed_top_1000" | "listed_outside_1000" | "unlisted_supplier" | "unlisted_other";
export type MaturityKey = "first_time" | "1_to_2_years" | "3_plus_years";
export type FrameworkKey = "gri" | "tcfd" | "ifrs" | "cbam" | "ccts";

export interface FeeInputs {
  clientName: string;
  reportingPeriod: string;
  size: CompanySizeKey;
  maturity: MaturityKey;
  frameworks: FrameworkKey[]; // additional frameworks beyond BRSR
  scope3: boolean;            // Scope 3 inventory
  valueChain: boolean;        // value-chain / supplier data collection
  assurance: boolean;         // BRSR Core assurance support
  // Editable rates (the consultant's own numbers; INR). Defaults are placeholders.
  baseFee: number;            // base BRSR readiness + reporting engagement
  perFramework: number;       // per additional framework mapped/reported
  scope3Fee: number;
  valueChainFee: number;
  assuranceFee: number;
}

export const DEFAULT_FEE_INPUTS: FeeInputs = {
  clientName: "",
  reportingPeriod: "",
  size: "listed_top_1000",
  maturity: "first_time",
  frameworks: [],
  scope3: false,
  valueChain: false,
  assurance: false,
  baseFee: 150000,
  perFramework: 25000,
  scope3Fee: 40000,
  valueChainFee: 60000,
  assuranceFee: 50000,
};

export const SIZE_LABELS: Record<CompanySizeKey, string> = {
  listed_top_1000: "Listed · top 1000",
  listed_outside_1000: "Listed · outside top 1000",
  unlisted_supplier: "Unlisted · value-chain supplier",
  unlisted_other: "Unlisted · other",
};
export const MATURITY_LABELS: Record<MaturityKey, string> = {
  first_time: "First-time filing",
  "1_to_2_years": "1–2 years of filing",
  "3_plus_years": "3+ years, improving",
};
export const FRAMEWORK_LABELS: Record<FrameworkKey, string> = {
  gri: "GRI",
  tcfd: "TCFD",
  ifrs: "IFRS S1/S2",
  cbam: "CBAM readiness",
  ccts: "CCTS readiness",
};

// Complexity multiplier on the base fee, larger / more-scrutinised entities are
// more work. Transparent and editable only via the labelled factors below.
const SIZE_MULT: Record<CompanySizeKey, number> = {
  listed_top_1000: 1.0,
  listed_outside_1000: 0.8,
  unlisted_supplier: 0.55,
  unlisted_other: 0.5,
};
// First-time filing is materially more work than a repeat cycle.
const MATURITY_MULT: Record<MaturityKey, number> = {
  first_time: 1.4,
  "1_to_2_years": 1.1,
  "3_plus_years": 1.0,
};

export interface FeeLine { label: string; amount: number; note: string }
export interface FeeEstimate { lineItems: FeeLine[]; subtotal: number; assumptions: string[] }

function round(n: number): number {
  return Math.max(0, Math.round(n / 500) * 500); // tidy to the nearest ₹500
}

export function estimateFee(inp: FeeInputs): FeeEstimate {
  const sizeMult = SIZE_MULT[inp.size];
  const matMult = MATURITY_MULT[inp.maturity];
  const lines: FeeLine[] = [];

  const baseAdjusted = round(inp.baseFee * sizeMult * matMult);
  lines.push({
    label: "BRSR readiness & reporting",
    amount: baseAdjusted,
    note: `Base ₹${inp.baseFee.toLocaleString("en-IN")} × ${sizeMult.toFixed(2)} (${SIZE_LABELS[inp.size]}) × ${matMult.toFixed(1)} (${MATURITY_LABELS[inp.maturity]})`,
  });

  for (const f of inp.frameworks) {
    lines.push({ label: `${FRAMEWORK_LABELS[f]} mapping & reporting`, amount: round(inp.perFramework), note: "Additional framework" });
  }
  if (inp.scope3) lines.push({ label: "Scope 3 inventory", amount: round(inp.scope3Fee), note: "Value-chain emissions (screening + categories)" });
  if (inp.valueChain) lines.push({ label: "Value-chain data collection", amount: round(inp.valueChainFee), note: "Chasing 2%+ value-chain partners" });
  if (inp.assurance) lines.push({ label: "BRSR Core assurance support", amount: round(inp.assuranceFee), note: "Evidence trail + assurer liaison" });

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);

  const assumptions = [
    "A starting estimate built from the rates you entered, adjust to your market and the specific engagement.",
    "Excludes third-party assurer fees, travel, and statutory/government charges.",
    inp.maturity === "first_time"
      ? "Assumes a first-time filing (more setup than a repeat cycle)."
      : "Assumes systems/data from a prior filing can be reused.",
    "Quoted per engagement (one reporting cycle), not an annual retainer.",
  ];

  return { lineItems: lines, subtotal, assumptions };
}

export interface ProposalSection { title: string; body: string[] }

export function buildProposalSections(inp: FeeInputs, fee: FeeEstimate): ProposalSection[] {
  const deliverables = [
    "BRSR readiness gap analysis across all 108 Section-C disclosures plus Sections A & B.",
    "Data-collection plan grouped by owner, with a fill-in response workbook.",
    "GHG (Scope 1 & 2) + energy + water figures with cited factors.",
  ];
  if (inp.scope3) deliverables.push("Scope 3 screening inventory (business travel, commuting, transport, waste).");
  for (const f of inp.frameworks) deliverables.push(`${FRAMEWORK_LABELS[f]} alignment / readiness.`);
  if (inp.valueChain) deliverables.push("Value-chain (2%+ partner) data collection.");
  if (inp.assurance) deliverables.push("BRSR Core assurance-readiness pack, evidence trail + data-ownership ledger.");
  deliverables.push("Draft BRSR responses for review and filing.");

  const timeline = inp.maturity === "first_time"
    ? ["Weeks 1–2: scoping, materiality, gap analysis.", "Weeks 3–6: data collection across teams.", "Weeks 7–9: calculations, drafting, internal review.", "Weeks 10–12: finalisation" + (inp.assurance ? " and assurance support." : ".")]
    : ["Weeks 1–2: refresh scope + materiality, gap analysis.", "Weeks 3–5: data collection (reusing prior systems).", "Weeks 6–8: calculations, drafting, review" + (inp.assurance ? ", assurance support." : ".")];

  return [
    { title: "Scope", body: [`BRSR reporting engagement for ${inp.clientName || "the client"}${inp.reportingPeriod ? ` (${inp.reportingPeriod})` : ""}, ${SIZE_LABELS[inp.size]}, ${MATURITY_LABELS[inp.maturity].toLowerCase()}.`] },
    { title: "Deliverables", body: deliverables },
    { title: "Indicative timeline", body: timeline },
    { title: "Assumptions", body: fee.assumptions },
  ];
}
