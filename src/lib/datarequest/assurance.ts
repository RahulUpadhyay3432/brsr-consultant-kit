// Assurance-readiness pack: a "data-ownership ledger" of the collected data.
// BRSR Core reasonable assurance increasingly asks not just "is the number right?"
// but "show the evidence trail and the named owner behind every KPI." Collect
// already captures all of that (who submitted what, the attached document, and the
// cited factor behind any computed figure) — this turns it into one exportable
// artifact the consultant hands to the assurance provider. Pure: no DB, no fabrication.
import type { Campaign } from "./types";
import { emissionInputs, GHG_METHODOLOGY } from "./emissions";

// One row per RECEIVED data point (the data that's actually assurable), with the
// owner who submitted it, the supporting document, and the cited calculation basis.
export function buildAssuranceLedger(campaign: Campaign): string[][] {
  // Cited factor per computed figure, keyed by field + who submitted it (the same
  // activity field can come from several owners, each its own assurable line).
  const basis = new Map<string, string>();
  for (const inp of emissionInputs(campaign)) {
    basis.set(`${inp.fieldId}|${inp.submittedBy}`, inp.factor);
  }

  const header = [
    "BRSR code", "Disclosure", "Section", "Principle",
    "Value", "Unit", "Prior year",
    "Data owner", "Owner email",
    "Evidence document", "Evidence attached",
    "Calculation basis",
  ];

  const rows: string[][] = [];
  for (const c of campaign.contacts) {
    const owner = c.name || c.email;
    for (const it of c.items) {
      if (it.status !== "received" || !it.value) continue;
      rows.push([
        it.fieldId,
        it.label,
        it.section ?? "",
        it.principle ?? "",
        it.value,
        it.unit ?? "",
        it.priorValue ?? "",
        owner,
        c.email,
        it.evidenceName ?? "",
        it.evidenceName ? "Yes" : "No",
        basis.get(`${it.fieldId}|${owner}`) ?? "",
      ]);
    }
  }

  // Trailing methodology + no-fabrication note (one cell, so it reads as a footnote
  // row in the spreadsheet).
  const note = [
    `Methodology: ${GHG_METHODOLOGY} Every figure above is a value an owner submitted or computed from one via a cited factor; nothing is estimated.`,
  ];

  return [header, ...rows, [], note];
}

export interface AssuranceStats {
  collected: number;   // received items with a value
  total: number;       // all assigned items
  withEvidence: number;// received items that have a supporting document
  owners: number;      // distinct contacts who submitted at least one value
}

export function assuranceStats(campaign: Campaign): AssuranceStats {
  let collected = 0, total = 0, withEvidence = 0, owners = 0;
  for (const c of campaign.contacts) {
    let contributed = false;
    for (const it of c.items) {
      total++;
      if (it.status === "received" && it.value) {
        collected++;
        contributed = true;
        if (it.evidenceName) withEvidence++;
      }
    }
    if (contributed) owners++;
  }
  return { collected, total, withEvidence, owners };
}
