// Pure helpers for the audit-readiness evidence checklist. The data lives in
// audit_readiness.json (per-principle KPI -> evidence document mapping). This
// builds the CSV rows and the principle short-name map the UI renders.
import data from "@/data/audit_readiness.json";

export interface AuditRow {
  kpi: string;
  core: boolean;
  evidence: string;
  location: string;
}

export interface AuditGroup {
  principle: string;
  name: string;
  rows: AuditRow[];
}

export const AUDIT_GROUPS = data.groups as AuditGroup[];
export const AUDIT_META = data._meta;

// Flat CSV: one row per KPI across all principles, with a blank "Collected?"
// column the consultant fills during the engagement.
export function buildAuditReadinessRows(): string[][] {
  const header = [
    "BRSR principle",
    "KPI / disclosure",
    "BRSR Core attribute?",
    "Evidence document an assurer typically requests",
    "Where it usually lives",
    "Collected? (Y/N)",
    "Notes",
  ];
  const rows: string[][] = [header];
  for (const g of AUDIT_GROUPS) {
    for (const r of g.rows) {
      rows.push([
        `${g.principle}, ${g.name}`,
        r.kpi,
        r.core ? "Yes" : "No",
        r.evidence,
        r.location,
        "",
        "",
      ]);
    }
  }
  return rows;
}

export function coreCount(): number {
  return AUDIT_GROUPS.reduce((s, g) => s + g.rows.filter((r) => r.core).length, 0);
}

export function totalCount(): number {
  return AUDIT_GROUPS.reduce((s, g) => s + g.rows.length, 0);
}
