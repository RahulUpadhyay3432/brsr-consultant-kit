// Leading "Filing & audit tools" category, the consultant-facing pieces that
// get a filing accepted and an assurance passed. Kept as its own group so it
// reads as built-for-ESG-consultants, separate from the general Tools menu.
export const FILING_AUDIT_ITEMS: { label: string; sub: string; href: string }[] = [
  { label: "XBRL pre-flight check",      sub: "Rupee-scale converter + why filings get rejected",   href: "/tools/xbrl-preflight" },
  { label: "Audit-readiness checklist",  sub: "Evidence a BRSR Core assurer asks for, per KPI",      href: "/tools/audit-readiness" },
  { label: "PPP-adjusted intensity",     sub: "Intensity comparable with global peers, WB PPP cited", href: "/tools/ppp-intensity" },
  { label: "Well-being expense schedule", sub: "P3 welfare heads mapped to P&L lines, CSV",          href: "/tools/wellbeing-schedule" },
];

export const FREE_NAV_ITEMS: { label: string; sub: string; href: string; badge?: string }[] = [
  { label: "BRSR gap analysis",        sub: "108-field instant readiness report",             href: "/start",                    badge: "Start free" },
  { label: "BRSR applicability checker", sub: "Must your client file, and by when?",           href: "/tools/brsr-applicability" },
  { label: "GHG & emissions calculator", sub: "Scope 1 & 2, energy, water, CEA & IPCC cited", href: "/tools/ghg-calculator" },
  { label: "Scope 3 screening",         sub: "Activity-based Cat 4–9, GHG Protocol + DEFRA", href: "/tools/scope3-calculator" },
  { label: "Materiality matrix builder", sub: "Impact × stakeholder grid, CSV export",        href: "/tools/materiality" },
  { label: "Templates & workbooks",     sub: "BRSR workbook, materiality grid, stakeholder plan", href: "/features/templates" },
  { label: "Cross-framework mapping",   sub: "BRSR ↔ GRI, TCFD, IFRS, TNFD, MSCI/DJSI",    href: "/features/alignment" },
  { label: "CBAM & CCTS checker",       sub: "Are you in scope for new regulations?",         href: "/features/cbam-ccts" },
  { label: "Materiality topics",        sub: "Suggested material topics by industry",           href: "/features/materiality" },
  { label: "Methodology & sources",     sub: "How we calculate, every figure cited",            href: "/methodology" },
];

export const PRO_NAV_ITEMS: { label: string; sub: string; href: string }[] = [
  { label: "Collect",                sub: "Chase data from the client's team, auto-reminders",           href: "/requests" },
  { label: "AI compliance importer", sub: "Upload docs, AI fills all 108 fields with source lines",      href: "/requests" },
  { label: "Proposal & fee builder", sub: "Scope and price an engagement in minutes",                    href: "/requests/proposal" },
  { label: "Multi-client workspace", sub: "Every client's engagement in one dashboard",                  href: "/requests" },
];
