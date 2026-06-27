// Beyond-BRSR regulatory readiness: a cited applicability check for the EU CBAM
// and India's CCTS, derived from the client's intake (industry + export markets).
// Lightweight + on-device, who is in scope and what to prepare. NOT a liability
// calculator (embedded-emissions / GEI-gap quantification is a deferred step).
import cbamData from "@/data/cbam_readiness.json";
import cctsData from "@/data/ccts_readiness.json";
import type { IndustryType, ExportMarket } from "./types";

export type RegVerdict = "applies" | "may_apply" | "unlikely";

export interface RegTimelineItem { date: string; event: string; source: string }
export interface RegChecklistItem { task: string; detail: string }
export interface RegSource { label: string; url: string }

export interface RegAssessment {
  key: "cbam" | "ccts";
  name: string;
  what: string;
  verdict: RegVerdict;
  reason: string;
  statusNote: string;
  timeline: RegTimelineItem[];
  checklist: RegChecklistItem[];
  sources: RegSource[];
}

export interface RegulatoryReadiness {
  cbam: RegAssessment;
  ccts: RegAssessment;
}

interface CbamMap { covered: boolean; partial?: boolean; goods: string[]; note?: string }
interface CctsMap { obligated: boolean; partial?: boolean; sectors: string[]; note?: string }

const CBAM = cbamData as unknown as {
  _meta: { name: string; what: string; status_note: string; primary_sources: RegSource[] };
  industry_map: Partial<Record<string, CbamMap>>;
  timeline: RegTimelineItem[];
  checklist: RegChecklistItem[];
};
const CCTS = cctsData as unknown as {
  _meta: { name: string; what: string; status_note: string; primary_sources: RegSource[] };
  industry_map: Partial<Record<string, CctsMap>>;
  timeline: RegTimelineItem[];
  checklist: RegChecklistItem[];
};

// CBAM bites only when a covered-good producer actually exports to the EU.
export function assessCbam(industry: IndustryType, exportMarkets: ExportMarket[]): RegAssessment {
  const map = CBAM.industry_map[industry];
  const exportsToEU = exportMarkets.includes("EU");

  let verdict: RegVerdict;
  let reason: string;
  if (map?.covered && exportsToEU) {
    verdict = "applies";
    reason = `Your sector produces CBAM-covered goods (${map.goods.join(", ")}) and you export to the EU, so CBAM reporting${map.partial ? ", if the specific goods are covered," : ""} applies at the EU border.`;
  } else if (map?.covered && !exportsToEU) {
    verdict = "may_apply";
    reason = `Your sector produces CBAM-covered goods (${map.goods.join(", ")}), but no EU export market is selected. CBAM bites only on goods entering the EU, watch this if you begin (or already do) export to the EU.`;
  } else if (!map?.covered && exportsToEU) {
    verdict = "may_apply";
    reason = "You export to the EU, but your sector isn't among the six CBAM-covered goods (cement, iron & steel, aluminium, fertilisers, electricity, hydrogen). Confirm none of your specific products fall under a covered category.";
  } else {
    verdict = "unlikely";
    reason = "Your sector isn't among the six CBAM-covered goods and no EU export is selected, so CBAM is unlikely to apply. Re-check if your product mix or export markets change.";
  }

  return {
    key: "cbam",
    name: CBAM._meta.name,
    what: CBAM._meta.what,
    verdict,
    reason,
    statusNote: CBAM._meta.status_note,
    timeline: CBAM.timeline,
    checklist: CBAM.checklist,
    sources: CBAM._meta.primary_sources,
  };
}

// CCTS obligation is sector-based (India's domestic compliance carbon market).
export function assessCcts(industry: IndustryType): RegAssessment {
  const map = CCTS.industry_map[industry];

  let verdict: RegVerdict;
  let reason: string;
  if (map?.obligated && !map.partial) {
    verdict = "applies";
    reason = `${map.sectors.join(" / ")} is a notified CCTS GEI-target sector, so installations in this sector are obligated entities (confirm the specific plant is on the obligated list).`;
  } else if (map?.obligated && map.partial) {
    verdict = "may_apply";
    reason = `Parts of your sector are notified under CCTS (${map.sectors.join(", ")})${map.note ? `, ${map.note}` : ""}. Confirm whether the specific plant is an obligated entity.`;
  } else {
    verdict = "unlikely";
    reason = "Your sector isn't among the nine notified CCTS GEI-target sectors (aluminium, cement, chlor-alkali, pulp & paper, iron & steel, fertiliser, petrochemicals, petroleum refinery, textile), so CCTS obligation is unlikely.";
  }

  return {
    key: "ccts",
    name: CCTS._meta.name,
    what: CCTS._meta.what,
    verdict,
    reason,
    statusNote: CCTS._meta.status_note,
    timeline: CCTS.timeline,
    checklist: CCTS.checklist,
    sources: CCTS._meta.primary_sources,
  };
}

export function assessRegulatory(industry: IndustryType, exportMarkets: ExportMarket[]): RegulatoryReadiness {
  return { cbam: assessCbam(industry, exportMarkets), ccts: assessCcts(industry) };
}
