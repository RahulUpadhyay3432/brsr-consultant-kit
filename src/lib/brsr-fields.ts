// One record per BRSR Section C disclosure, assembled from the cited knowledge
// base the free tool already runs on. This is what backs the /brsr reference
// pages: 108 disclosures, each with SEBI's own wording, the ICAI page it is
// documented on, a plain-English reading, what a complete answer contains, the
// team that usually holds the data, and whether a services business can
// legitimately mark it not applicable.
//
// Everything here is derived, never invented. If a field is missing an
// explainer or a quality example the page simply omits that block.

import dataPoints from "@/data/brsr_data_points.json";
import explainersData from "@/data/brsr_field_explainers.json";
import qualityData from "@/data/brsr_quality_examples.json";
import plainData from "@/data/brsr_plain_language.json";
import { OWNERS, type OwnerInfo } from "@/lib/brsr-owners";

const explainers = (explainersData as { explainers: Record<string, string> }).explainers;
const quality = (qualityData as { examples?: Record<string, string>; fields?: Record<string, string> });
const QUALITY: Record<string, string> = quality.examples ?? quality.fields ?? {};
const PLAIN = (plainData as { fields: Record<string, string> }).fields;

export type IndicatorType = "Essential" | "Leadership";

export interface BrsrField {
  /** BRSR code, e.g. "P6-E1". */
  id: string;
  /** URL segment, e.g. "p6-e1". */
  code: string;
  /** SEBI's own wording for the disclosure. */
  label: string;
  unit: string;
  /** SEBI/ICAI measurement guidance, verbatim. */
  guidance: string;
  /** Page in the ICAI Background Material on BRSR (Revised Edition 2024). */
  page: number;
  principle: string;
  principleName: string;
  principleFullName: string;
  indicatorType: IndicatorType;
  /** One-line plain reading of the ask. */
  plain?: string;
  /** Longer plain-English explanation of what the field wants and where it comes from. */
  explainer?: string;
  /** What a complete, assurance-ready answer contains. */
  completeAnswer?: string;
  owner: OwnerInfo;
  /** True where a pure services business can legitimately answer "not applicable". */
  manufacturingOnly: boolean;
}

// Short, human principle names. Kept here rather than imported from the
// checklist constants so this module stays free of UI concerns.
const PRINCIPLE_NAMES: Record<string, string> = {
  P1: "Ethics & Transparency",
  P2: "Products & Services",
  P3: "Employee Wellbeing",
  P4: "Stakeholder Engagement",
  P5: "Human Rights",
  P6: "Environment",
  P7: "Policy & Advocacy",
  P8: "Inclusive Growth",
  P9: "Consumer Responsibility",
};

// The eleven disclosures that assume manufacturing operations. A pure services
// business can mark each not applicable, with a written justification. Mirrors
// MANUFACTURING_ONLY in report-generator.ts.
const MANUFACTURING_ONLY = new Set([
  "P2-E3", "P2-E4", "P2-L4", "P2-L5",
  "P6-E2", "P6-E4", "P6-E5", "P6-E6", "P6-E11", "P6-E12", "P6-L3",
]);

// An in-depth guide exists for each principle; field pages link to theirs.
export const PRINCIPLE_GUIDE: Record<string, string> = {
  P1: "/blog/brsr-principle-1-ethics-guide",
  P2: "/blog/brsr-principle-2-products-guide",
  P3: "/blog/brsr-principle-3-employee-wellbeing-guide",
  P4: "/blog/brsr-principle-4-stakeholder-guide",
  P5: "/blog/brsr-principle-5-human-rights-guide",
  P6: "/blog/brsr-principle-6-environment-guide",
  P7: "/blog/brsr-principle-7-policy-advocacy-guide",
  P8: "/blog/brsr-principle-8-inclusive-growth-guide",
  P9: "/blog/brsr-principle-9-consumer-responsibility-guide",
};

interface RawIndicator {
  id: string;
  label: string;
  unit: string;
  measurement_guidance: string;
  page: number;
}
interface RawPrinciple {
  id: string;
  name: string;
  essential_indicators: RawIndicator[];
  leadership_indicators: RawIndicator[];
}

function build(): BrsrField[] {
  const out: BrsrField[] = [];
  for (const p of (dataPoints as unknown as { principles: RawPrinciple[] }).principles) {
    const groups: [RawIndicator[], IndicatorType][] = [
      [p.essential_indicators, "Essential"],
      [p.leadership_indicators, "Leadership"],
    ];
    for (const [list, indicatorType] of groups) {
      for (const ind of list) {
        out.push({
          id: ind.id,
          code: ind.id.toLowerCase(),
          label: ind.label,
          unit: ind.unit,
          guidance: ind.measurement_guidance,
          page: ind.page,
          principle: p.id,
          principleName: PRINCIPLE_NAMES[p.id] ?? p.id,
          principleFullName: p.name,
          indicatorType,
          plain: PLAIN[ind.id],
          explainer: explainers[ind.id],
          completeAnswer: QUALITY[ind.id],
          owner: OWNERS[p.id],
          manufacturingOnly: MANUFACTURING_ONLY.has(ind.id),
        });
      }
    }
  }
  return out;
}

export const BRSR_FIELDS: BrsrField[] = build();

const BY_CODE = new Map(BRSR_FIELDS.map((f) => [f.code, f]));

export function getField(code: string): BrsrField | null {
  return BY_CODE.get(code.toLowerCase()) ?? null;
}

/** Fields grouped by principle, in P1..P9 order, Essential before Leadership. */
export function fieldsByPrinciple(): { principle: string; name: string; fullName: string; fields: BrsrField[] }[] {
  const order = Object.keys(PRINCIPLE_NAMES);
  return order.map((pid) => {
    const fields = BRSR_FIELDS.filter((f) => f.principle === pid);
    return {
      principle: pid,
      name: PRINCIPLE_NAMES[pid],
      fullName: fields[0]?.principleFullName ?? "",
      fields,
    };
  });
}

/** Previous and next disclosure in reading order, for cross-linking. */
export function neighbours(code: string): { prev: BrsrField | null; next: BrsrField | null } {
  const i = BRSR_FIELDS.findIndex((f) => f.code === code.toLowerCase());
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? BRSR_FIELDS[i - 1] : null,
    next: i < BRSR_FIELDS.length - 1 ? BRSR_FIELDS[i + 1] : null,
  };
}

/** Other disclosures under the same principle, excluding this one. */
export function siblings(field: BrsrField, limit = 6): BrsrField[] {
  return BRSR_FIELDS.filter((f) => f.principle === field.principle && f.id !== field.id).slice(0, limit);
}

export const SEBI_FORMAT_URL =
  "https://www.sebi.gov.in/sebi_data/commondocs/may-2021/Business%20responsibility%20and%20sustainability%20reporting%20by%20listed%20entitiesAnnexure2_p.PDF";

export const ICAI_SOURCE = "ICAI Background Material on BRSR, Revised Edition 2024";
