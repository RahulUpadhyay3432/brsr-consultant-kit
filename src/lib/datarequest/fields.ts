import type { RequestField } from "./types";
import brsrData from "@/data/brsr_data_points.json";

// Layer 2: the request-field list is the FULL BRSR format, flattened from the
// same knowledge base the readiness tool uses (brsr_data_points.json) — Section
// A (general), Section B (policy/management), Section C (108 principle-wise
// indicators). Every field carries its BRSR coordinates so collected values map
// straight back into the report. The two "activity" inputs (grid kWh, diesel
// litres) are finer than any single indicator and feed the GHG calculator
// (emissions.ts keys off their exact ids), so they're slotted under P6 rather
// than replacing the formal P6-E1 / P6-E7 fields. (Static display labels live in
// brsr-meta.ts so the picker can import them without pulling in the KB JSON.)

// Granular activity inputs that feed the GHG calculator. Scope 2 = grid
// electricity; Scope 1 = the six fuels the calculator already supports (cited
// IPCC 2006 factors). emissions.ts keys off these exact ids.
const ACTIVITY_FIELDS: RequestField[] = [
  {
    id: "P6-E1-elec", label: "Grid electricity consumed (annual)", unit: "kWh",
    kind: "activity", section: "C", principle: "P6", indicatorType: "essential",
    hint: "Energy / utilities manager — annual electricity bills.",
  },
  {
    id: "P6-E1-diesel", label: "Diesel / HSD consumed (DG sets, vehicles)", unit: "litres",
    kind: "activity", section: "C", principle: "P6", indicatorType: "essential",
    hint: "Facilities / admin — fuel purchase logs.",
  },
  {
    id: "P6-E1-petrol", label: "Petrol / MS consumed (vehicles, equipment)", unit: "litres",
    kind: "activity", section: "C", principle: "P6", indicatorType: "essential",
    hint: "Facilities / fleet — fuel purchase logs.",
  },
  {
    id: "P6-E1-cng", label: "CNG / piped natural gas consumed", unit: "m³",
    kind: "activity", section: "C", principle: "P6", indicatorType: "essential",
    hint: "Energy manager — gas utility bills / meter readings.",
  },
  {
    id: "P6-E1-lpg", label: "LPG consumed (canteen, process heating)", unit: "kg",
    kind: "activity", section: "C", principle: "P6", indicatorType: "essential",
    hint: "Admin / EHS — LPG cylinder or bulk purchase records.",
  },
  {
    id: "P6-E1-coal", label: "Coal consumed (boilers, furnaces)", unit: "kg",
    kind: "activity", section: "C", principle: "P6", indicatorType: "essential",
    hint: "Plant / utilities — coal purchase and consumption logs.",
  },
  {
    id: "P6-E1-fo", label: "Furnace oil / HFO consumed (boilers, DG)", unit: "litres",
    kind: "activity", section: "C", principle: "P6", indicatorType: "essential",
    hint: "Plant / utilities — furnace oil purchase logs.",
  },
];

interface KbIndicator { id: string; label: string; unit: string | null }
interface KbPrinciple {
  id: string; name: string;
  essential_indicators: KbIndicator[];
  leadership_indicators: KbIndicator[];
}
interface KbDisclosure { id: string; label: string }

function buildBrsrRequestFields(): RequestField[] {
  const data = brsrData as unknown as {
    section_a_general_disclosures: KbDisclosure[];
    section_b_management_process_disclosures: KbDisclosure[];
    principles: KbPrinciple[];
  };
  const out: RequestField[] = [];

  for (const d of data.section_a_general_disclosures) {
    out.push({ id: d.id, label: d.label, kind: "value", section: "A", principle: null, indicatorType: null });
  }
  for (const d of data.section_b_management_process_disclosures) {
    out.push({ id: d.id, label: d.label, kind: "value", section: "B", principle: null, indicatorType: null });
  }
  for (const p of data.principles) {
    for (const ind of p.essential_indicators) {
      out.push({ id: ind.id, label: ind.label, unit: ind.unit ?? undefined, kind: "value", section: "C", principle: p.id, indicatorType: "essential" });
    }
    for (const ind of p.leadership_indicators) {
      out.push({ id: ind.id, label: ind.label, unit: ind.unit ?? undefined, kind: "value", section: "C", principle: p.id, indicatorType: "leadership" });
    }
    if (p.id === "P6") out.push(...ACTIVITY_FIELDS); // keep the calc inputs with their principle
  }
  return out;
}

export const REQUEST_FIELDS: RequestField[] = buildBrsrRequestFields();

const BY_ID = new Map(REQUEST_FIELDS.map((f) => [f.id, f]));

export function fieldsByIds(ids: string[]): RequestField[] {
  return ids.map((id) => BY_ID.get(id)).filter((f): f is RequestField => !!f);
}
