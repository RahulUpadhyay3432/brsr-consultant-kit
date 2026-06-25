// Cross-framework export. Flattens the on-device crosswalk data the Alignment tab
// already shows into downloadable CSV rows — "collect once, report many." Pure row
// builders; the actual download uses downloadCsv() from export.ts. No AI, nothing
// leaves the browser. Consistent with the free tool's 100% on-device model.

import type { FrameworkMapping } from "./types";

// Crosswalk cells use an em-dash placeholder for "no mapping"; blank it for export.
function dash(v: string | null | undefined): string {
  return !v || v === "—" ? "" : v;
}

// BRSR ↔ GRI ↔ TCFD ↔ IFRS ↔ TNFD — one row per mapping, every framework column.
export function buildFrameworkExportRows(mappings: FrameworkMapping[]): string[][] {
  const header = [
    "BRSR ID", "BRSR disclosure", "BRSR section",
    "GRI standard", "GRI label",
    "TCFD pillar", "TCFD detail",
    "IFRS S1/S2",
    "TNFD pillar", "TNFD detail",
    "How the frameworks compare",
  ];
  const rows = mappings.map((m) => [
    m.brsr_id,
    m.brsr_label,
    m.brsr_section,
    dash(m.gri_standard),
    dash(m.gri_label),
    dash(m.tcfd_pillar),
    dash(m.tcfd_detail),
    dash(m.ifrs_reference),
    dash(m.tnfd_pillar),
    dash(m.tnfd_detail),
    dash(m.notes),
  ]);
  return [header, ...rows];
}

// Principle-level MSCI / S&P CSA (DJSI) ratings crosswalk. Mirrors the shape
// EsgRatingsMapper renders; list fields are semicolon-joined for the spreadsheet.
export interface RatingMappingRow {
  brsr_principle: string;
  principle_name: string;
  msci_pillar: string;
  msci_key_issues: string[];
  djsi_dimension: string;
  djsi_criteria: string[];
  note: string;
}

export function buildRatingsExportRows(ratings: RatingMappingRow[]): string[][] {
  const header = [
    "BRSR principle", "Principle name",
    "MSCI pillar", "MSCI Key Issues",
    "DJSI dimension", "DJSI / CSA criteria",
    "Note",
  ];
  const rows = ratings.map((r) => [
    r.brsr_principle,
    r.principle_name,
    r.msci_pillar,
    r.msci_key_issues.join("; "),
    r.djsi_dimension,
    r.djsi_criteria.join("; "),
    r.note,
  ]);
  return [header, ...rows];
}
