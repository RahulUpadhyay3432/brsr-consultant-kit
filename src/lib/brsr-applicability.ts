// BRSR applicability checker, pure, cited logic for a standalone free tool.
// Answers "must this company file BRSR / BRSR Core / value-chain disclosure, and when?"
// from a few inputs. On-device, no fabrication; every verdict carries its reason + source.
//
// Sources:
//  - BRSR mandate: SEBI LODR Reg 34(2)(f), top 1000 listed by market cap (from FY 2022-23).
//  - BRSR Core reasonable-assurance glide path + value chain: SEBI circular 12 Jul 2023
//    (BRSR Core) and SEBI "ease of doing business" circular 28 Mar 2025
//    (SEBI/HO/CFD/CFD-PoD-1/P/CIR/2025/42), which deferred value-chain reporting and
//    changed "assurance" to "assessment or assurance".
//  NOTE: the exact start year of the BRSR Core glide path has been restated by SEBI; verify
//  against the latest circular before relying on a specific year for a specific client.

export const SEBI_BRSR_FORMAT =
  "https://www.sebi.gov.in/sebi_data/commondocs/jul-2023/Annexure_II-Updated-BRSR_p.PDF";
export const SEBI_BRSR_CORE_2023 =
  "https://www.sebi.gov.in/legal/circulars/jul-2023/brsr-core-framework-for-assurance-and-esg-disclosures-for-value-chain_73854.html";
export const SEBI_CIRCULARS = "https://www.sebi.gov.in/legal/circulars/";

export type RankBand =
  | "top150" | "top250" | "top500" | "top1000" | "outside1000" | "not_listed";

export interface ApplicabilityInputs {
  listed: boolean;
  rankBand: RankBand;          // market-cap rank band (only meaningful when listed)
  valueChainPartner: boolean;  // a >=2% value-chain partner of a larger listed company
}

export type Verdict = "applies" | "applies_soon" | "voluntary" | "may_apply" | "unlikely";

export interface ApplicabilityResult {
  id: "brsr" | "core" | "valuechain";
  title: string;
  verdict: Verdict;
  timing: string;
  reason: string;
  sources: { label: string; href: string }[];
}

export const VERDICT_META: Record<Verdict, { label: string; tone: "green" | "amber" | "blue" | "slate" }> = {
  applies:      { label: "Applies",        tone: "green" },
  applies_soon: { label: "Applies soon",   tone: "amber" },
  voluntary:    { label: "Voluntary",      tone: "blue"  },
  may_apply:    { label: "May apply",      tone: "amber" },
  unlikely:     { label: "Unlikely",       tone: "slate" },
};

const IN_TOP_1000: RankBand[] = ["top150", "top250", "top500", "top1000"];
const IN_TOP_250:  RankBand[] = ["top150", "top250"];

const SRC_BRSR  = { label: "SEBI BRSR Format (LODR Reg 34(2)(f))", href: SEBI_BRSR_FORMAT };
const SRC_CORE  = { label: "SEBI BRSR Core circular (12 Jul 2023)", href: SEBI_BRSR_CORE_2023 };
const SRC_MAR25 = { label: "SEBI circular, 28 Mar 2025 (value chain)", href: SEBI_CIRCULARS };

export function assessBrsrApplicability(inp: ApplicabilityInputs): ApplicabilityResult[] {
  const inTop1000 = inp.listed && IN_TOP_1000.includes(inp.rankBand);
  const inTop250  = inp.listed && IN_TOP_250.includes(inp.rankBand);

  // 1) BRSR filing itself
  let brsr: ApplicabilityResult;
  if (inTop1000) {
    brsr = {
      id: "brsr", title: "BRSR report (Section A, B & C)", verdict: "applies",
      timing: "Mandatory now, FY 2025-26",
      reason: "BRSR is mandatory for the top 1000 listed companies by market capitalisation. A company in this band files the full BRSR with its annual report.",
      sources: [SRC_BRSR],
    };
  } else if (inp.listed) {
    brsr = {
      id: "brsr", title: "BRSR report (Section A, B & C)", verdict: "voluntary",
      timing: "Voluntary",
      reason: "BRSR is mandatory only for the top 1000 listed companies by market cap. A listed company outside that band may file voluntarily, and some do to meet investor or lender expectations.",
      sources: [SRC_BRSR],
    };
  } else {
    brsr = {
      id: "brsr", title: "BRSR report (Section A, B & C)", verdict: "unlikely",
      timing: "Not required",
      reason: "BRSR is a SEBI listing obligation, so it does not apply to an unlisted company directly. A voluntary BRSR-style report can still help with lender or supply-chain ESG requests.",
      sources: [SRC_BRSR],
    };
  }

  // 2) BRSR Core (reasonable assurance), glide path by rank band
  let core: ApplicabilityResult;
  if (inp.rankBand === "top150" || inp.rankBand === "top250" || inp.rankBand === "top500") {
    core = {
      id: "core", title: "BRSR Core, reasonable assurance", verdict: "applies",
      timing: "Mandatory now, FY 2025-26 (top 500)",
      reason: "Reasonable assurance of the 9 BRSR Core attributes is mandatory for the top 500 listed companies by market cap in FY 2025-26. Your client needs an assurance provider and an evidence trail for every Core KPI.",
      sources: [SRC_CORE, SRC_MAR25],
    };
  } else if (inp.rankBand === "top1000") {
    core = {
      id: "core", title: "BRSR Core, reasonable assurance", verdict: "applies_soon",
      timing: "From FY 2026-27 (top 1000)",
      reason: "BRSR Core assurance extends to the top 1000 listed companies from FY 2026-27. Start building the data-ownership and evidence trail this year so the first assured cycle is not a scramble.",
      sources: [SRC_CORE, SRC_MAR25],
    };
  } else {
    core = {
      id: "core", title: "BRSR Core, reasonable assurance", verdict: "unlikely",
      timing: "Not required",
      reason: "BRSR Core assurance follows the top-500 / top-1000 glide path. It does not apply to a company outside the top 1000, though voluntary assurance can still strengthen credibility.",
      sources: [SRC_CORE],
    };
  }

  // 3) Value-chain ESG disclosure
  let valuechain: ApplicabilityResult;
  if (inp.valueChainPartner) {
    valuechain = {
      id: "valuechain", title: "Value-chain ESG data request", verdict: "may_apply",
      timing: "Expected from FY 2026-27",
      reason: "As a value-chain partner (>=2% of a listed company's purchases or sales), your client may be asked to supply ESG data so its larger customer can complete value-chain disclosure (capped at 75% of value chain). Being ready protects the contract.",
      sources: [SRC_MAR25],
    };
  } else if (inTop250) {
    valuechain = {
      id: "valuechain", title: "Value-chain ESG disclosure", verdict: "voluntary",
      timing: "Voluntary now, assessed/assured FY 2026-27",
      reason: "Value-chain ESG disclosure (for partners >=2% of purchases/sales, capped at 75%) is voluntary for the top 250 in FY 2025-26 and moves to assessment-or-assurance from FY 2026-27. Begin engaging key suppliers now.",
      sources: [SRC_MAR25],
    };
  } else {
    valuechain = {
      id: "valuechain", title: "Value-chain ESG disclosure", verdict: "unlikely",
      timing: "Not yet required",
      reason: "Mandatory value-chain disclosure is currently scoped to the top 250 listed companies. It is not yet an obligation here, but a large listed customer may still request supplier ESG data.",
      sources: [SRC_MAR25],
    };
  }

  return [brsr, core, valuechain];
}
