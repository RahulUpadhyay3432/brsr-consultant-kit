import type { RequestField } from "./types";

// A curated subset of BRSR data points for the MVP send form. The full 108-field
// knowledge base wires in later; this keeps the thin slice focused.
//
// The "activity" fields (grid electricity, diesel) are the emissions hook: the
// recipient supplies raw inputs, and the existing GHG calculators turn them into
// Scope 1/2 + intensity in a later phase. The rest are collected as-is.
export const REQUEST_FIELDS: RequestField[] = [
  // ── Environment ───────────────────────────────────────────────────────────
  {
    id: "P6-E1-elec", label: "Grid electricity consumed (annual)", unit: "kWh",
    category: "Environment", kind: "activity",
    hint: "Energy / utilities manager — annual electricity bills.",
  },
  {
    id: "P6-E1-diesel", label: "Diesel / HSD consumed (DG sets, vehicles)", unit: "litres",
    category: "Environment", kind: "activity",
    hint: "Facilities / admin — fuel purchase logs.",
  },
  {
    id: "P6-E3", label: "Water withdrawn by source", unit: "kL",
    category: "Environment", kind: "value",
    hint: "Plant / EHS team — water meter readings or PCB returns.",
  },
  {
    id: "P6-E9", label: "Total waste generated (hazardous + non-hazardous)", unit: "MT",
    category: "Environment", kind: "value",
    hint: "EHS team — hazardous waste returns / manifests.",
  },

  // ── Social ────────────────────────────────────────────────────────────────
  {
    id: "SA-EMP", label: "Total employees and workers (by gender)", unit: "count",
    category: "Social", kind: "value",
    hint: "HR — headcount as on 31 March.",
  },
  {
    id: "P3-SAFE", label: "Safety incidents / LTIFR for the year", unit: "rate / count",
    category: "Social", kind: "value",
    hint: "EHS / safety officer — incident register.",
  },
  {
    id: "P3-TRAIN", label: "Average training hours per employee", unit: "hours",
    category: "Social", kind: "value",
    hint: "HR / L&D — training records.",
  },

  // ── Governance ────────────────────────────────────────────────────────────
  {
    id: "P1-POL", label: "Anti-corruption / anti-bribery policy in place?", unit: "Yes/No + link",
    category: "Governance", kind: "value",
    hint: "Company secretary / legal — board-approved policy register.",
  },
  {
    id: "P9-COMP", label: "Consumer complaints received & resolved", unit: "count",
    category: "Governance", kind: "value",
    hint: "Customer service / grievance officer.",
  },
];

export function fieldsByIds(ids: string[]): RequestField[] {
  const set = new Set(ids);
  return REQUEST_FIELDS.filter((f) => set.has(f.id));
}
