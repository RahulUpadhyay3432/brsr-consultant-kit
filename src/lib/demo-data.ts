import type { IntakeFormData } from "@/lib/types";

// A hardcoded sample client for the /demo route, so a visitor can explore a real,
// fully-generated report without filling the intake form. Chosen to show a
// realistic mix of statuses (Ready / Verify / Collect), industry-specific
// materiality, and a meaningful "Beyond BRSR" tab:
//   - listed top-1000 + 3+ years → the full 108-field (leadership) view
//   - steel_and_metals → a real, industry-specific materiality set
//   - EU export → CBAM applies (Beyond BRSR is meaningful)
//   - PAT + Hazardous Waste + EPR filings → some fields come back Ready/Verify,
//     not all Collect, so the gap analysis reads like a genuine engagement.
// Every value is drawn from the string unions in types.ts, so generateReport
// accepts it exactly like a real submission.
export const SAMPLE_FORM: IntakeFormData = {
  companyName: "Bharat Steel & Alloys Ltd",
  industry: "steel_and_metals",
  sector: "manufacturing",
  companySize: "listed_top_1000",
  reportingMaturity: "3_plus_years",
  exportMarkets: ["EU"],
  existingFilings: ["pat_scheme", "hazardous_waste", "epr_registration"],
};
