// Static BRSR display metadata, deliberately free of heavy imports (no KB JSON),
// so it's safe to import into client components without bloating the bundle.

export const SECTION_LABELS: Record<"A" | "B" | "C", string> = {
  A: "Section A · General disclosures",
  B: "Section B · Policy & management",
  C: "Section C · Principle-wise performance",
};

// Short, scannable principle names (the KB stores the full NGRBC sentence).
export const PRINCIPLE_LABELS: Record<string, string> = {
  P1: "Ethics & transparency",
  P2: "Product responsibility",
  P3: "Employee wellbeing",
  P4: "Stakeholder engagement",
  P5: "Human rights",
  P6: "Environment",
  P7: "Policy advocacy",
  P8: "Inclusive growth",
  P9: "Consumer responsibility",
};

export const PRINCIPLE_ORDER = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"];

// How a collected figure came to be recorded, for the Data tab and the assurance
// ledger. An assurer (and the consultant) needs to know whose word a number rests
// on, so the import case names itself rather than hiding behind the owner the
// disclosure happens to be assigned to. "unrecorded" covers rows written before
// migration 003 added brsr_request_items.value_source.
export const VALUE_SOURCE_LABEL: Record<"owner" | "import" | "unrecorded", string> = {
  owner: "Owner-submitted",
  import: "Document import (AI-extracted, consultant-accepted)",
  unrecorded: "Not recorded",
};
