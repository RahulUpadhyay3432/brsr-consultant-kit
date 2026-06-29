// The canonical "who owns what" map: each BRSR principle → a plain-English theme,
// a short team/role chip, and a "usually found in … forward to …" line. This is the
// single source of truth, used by the company-facing PDF brief (report-pdf.ts), the
// free report's Templates tab (the ownership map + the internal request emails), and
// the CSV export. Pure + client-safe (no server-only imports).

export interface OwnerInfo {
  theme: string;
  chip: string;
  found: string;
}

export const OWNERS: Record<string, OwnerInfo> = {
  P1: { theme: "Governance & ethics", chip: "Company Secretary / Legal", found: "Usually found in board records and compliance registers. Forward to your Company Secretary or Legal team." },
  P2: { theme: "Products & supply chain", chip: "Procurement / Product", found: "Usually found in sourcing, product and lifecycle records. Forward to your Procurement or Product team." },
  P3: { theme: "Workforce & wellbeing", chip: "HR / People team", found: "Usually found in payroll and HR records. Forward this section to your People team." },
  P4: { theme: "Stakeholder engagement", chip: "Sustainability lead", found: "Usually found in stakeholder-engagement records. Forward to your Sustainability lead." },
  P5: { theme: "Human rights", chip: "HR / Legal", found: "Usually found in policy, grievance and due-diligence records. Forward to your HR or Legal team." },
  P6: { theme: "Energy, water & emissions", chip: "Plant / EHS / Energy", found: "Usually found in utility bills, meter readings and fuel logs. Forward to your plant or energy manager." },
  P7: { theme: "Policy advocacy", chip: "Public affairs", found: "Usually found in trade-association and advocacy records. Forward to your Public affairs or Sustainability team." },
  P8: { theme: "Community & inclusive growth", chip: "CSR team", found: "Usually found in CSR spend and project records. Forward to your CSR team." },
  P9: { theme: "Consumer responsibility", chip: "Customer service / Legal", found: "Usually found in complaints and product records. Forward to your Customer service or Legal team." },
};

export const OWNER_ORDER = Object.keys(OWNERS);

// Indian financial year that has most recently completed as of `d` (BRSR is filed
// for the just-closed FY). e.g. any date Apr 2026–Mar 2027 → "FY 2025–26".
export function reportingFy(d: Date): string {
  const m = d.getMonth(); // 0 = Jan
  const endYear = m >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY ${endYear - 1}–${String(endYear).slice(2)}`;
}

// The most common data points each principle covers, named in BRSR codes, so the
// ownership-map CSV says concretely which fields a team should expect to provide.
const PRINCIPLE_CODES: Record<string, string> = {
  P1: "P1 (board composition, fines & penalties, anti-corruption)",
  P2: "P2 (sustainable sourcing, recycled inputs, EPR)",
  P3: "P3 (headcount, wages, benefits, training, safety)",
  P4: "P4 (stakeholder identification & engagement)",
  P5: "P5 (minimum wage, POSH, grievances, human-rights due diligence)",
  P6: "P6 (electricity & fuel → Scope 1 & 2, water, waste, air emissions)",
  P7: "P7 (trade associations, policy advocacy)",
  P8: "P8 (CSR spend, projects, beneficiaries)",
  P9: "P9 (consumer complaints, product recalls, data privacy)",
};

// Rows for the downloadable data-ownership map (one row per principle). Reuses the
// report's formula-safe CSV writer at the call site.
export function ownerMapRows(): string[][] {
  const header = ["Principle", "Theme", "Typical owner / team", "Usually found in", "BRSR codes"];
  const rows: string[][] = [header];
  for (const id of OWNER_ORDER) {
    const o = OWNERS[id];
    rows.push([id, o.theme, o.chip, o.found, PRINCIPLE_CODES[id] ?? id]);
  }
  return rows;
}
