// Pure builder for the P3 employee well-being expenditure schedule. Maps each
// welfare head to the P&L / ledger line a consultant pulls it from, so the
// "spending on well-being as % of revenue" BRSR Core KPI can be assembled from
// the audited accounts. Maps to ledger lines only, never to emissions.

export interface WellbeingRow {
  head: string;        // welfare head
  relevance: string;   // BRSR P3 relevance
  ledger: string;      // typical P&L / ledger line
  notes: string;
}

export const WELLBEING_ROWS: WellbeingRow[] = [
  {
    head: "Group health / mediclaim insurance",
    relevance: "P3, health insurance coverage & well-being spend",
    ledger: "Staff welfare, group mediclaim premium",
    notes: "Take annual premium from the insurer's policy schedule; split employees vs workers if the format asks.",
  },
  {
    head: "Group personal-accident / term-life insurance",
    relevance: "P3, accident & life insurance coverage",
    ledger: "Staff welfare, insurance",
    notes: "Premium invoices; coverage % of headcount.",
  },
  {
    head: "Maternity & paternity benefit",
    relevance: "P3, parental benefits, return-to-work",
    ledger: "Salaries & wages, statutory (Maternity Benefit Act)",
    notes: "Paid-leave cost + any crèche cost recognised separately.",
  },
  {
    head: "Day-care / crèche facility",
    relevance: "P3, crèche availability",
    ledger: "Staff welfare, crèche",
    notes: "Own-facility running cost or third-party reimbursement.",
  },
  {
    head: "Mental-health / employee-assistance programme",
    relevance: "P3, well-being measures beyond insurance",
    ledger: "Staff welfare, wellness / EAP",
    notes: "Counselling, wellness-platform subscriptions.",
  },
  {
    head: "Retirement benefits (PF, gratuity, superannuation)",
    relevance: "P3, retirement benefits coverage",
    ledger: "Contribution to provident & other funds / Gratuity (Ind AS 19)",
    notes: "Employer contribution + actuarial gratuity charge.",
  },
  {
    head: "ESI contribution",
    relevance: "P3, statutory health cover for eligible workers",
    ledger: "Statutory contributions, ESI",
    notes: "Employer ESIC contribution from challans.",
  },
  {
    head: "Canteen / subsidised meals",
    relevance: "P3, well-being facilities",
    ledger: "Staff welfare, canteen subsidy",
    notes: "Net employer subsidy after recoveries.",
  },
  {
    head: "Employee transport",
    relevance: "P3, well-being facilities",
    ledger: "Staff welfare, transport",
    notes: "Bus / cab facility net cost.",
  },
  {
    head: "Training & skill development",
    relevance: "P3, human-capital development",
    ledger: "Staff welfare, training & development",
    notes: "External + internal training spend; also feeds P3 training disclosures.",
  },
  {
    head: "PPE & occupational safety",
    relevance: "P3, safe working conditions",
    ledger: "Staff welfare, safety / PPE",
    notes: "Safety gear, health check-ups; also feeds P3 safety disclosures.",
  },
];

export function buildWellbeingScheduleRows(): string[][] {
  const header = [
    "Welfare head",
    "BRSR P3 relevance",
    "Typical P&L / ledger line to pull from",
    "FY amount (₹)",
    "Prior FY amount (₹)",
    "% of total employees covered",
    "Notes",
  ];
  const rows: string[][] = [header];
  for (const r of WELLBEING_ROWS) {
    rows.push([r.head, r.relevance, r.ledger, "", "", "", r.notes]);
  }
  rows.push([
    "TOTAL well-being spend",
    "P3, spending on well-being as % of revenue (BRSR Core)",
    "Sum of the lines above",
    "",
    "",
    "",
    "Divide by revenue from operations to get the BRSR Core % figure.",
  ]);
  return rows;
}
