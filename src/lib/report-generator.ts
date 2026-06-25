import type {
  IntakeFormData,
  ChecklistItem,
  SectionDisclosure,
  MaterialityTopic,
  FrameworkMapping,
  ReportOutput,
  BRSRPrinciple,
} from "./types";

import { assessRegulatory } from "./regulatory-readiness";
import brsrData from "@/data/brsr_data_points.json";
import complianceData from "@/data/compliance_overlaps.json";
import frameworkData from "@/data/framework_mappings.json";
import tnfdData from "@/data/tnfd_mappings.json";
import industryData from "@/data/industry_material_topics.json";

// Normalize compliance overlaps (JSON has inconsistent nesting)
function getAllFilings(): Record<string, any> {
  const filings: Record<string, any> = {};
  const data = complianceData as any;

  // Some filings are under "filings" key, others at top level
  if (data.filings) {
    for (const [key, val] of Object.entries(data.filings)) {
      if (typeof val === "object" && val !== null && "filing_id" in (val as any)) {
        filings[key] = val;
      }
    }
  }

  // Top-level filings
  for (const [key, val] of Object.entries(data)) {
    if (
      key !== "filings" &&
      typeof val === "object" &&
      val !== null &&
      "filing_id" in (val as any)
    ) {
      filings[key] = val;
    }
  }

  return filings;
}

// Map user-selected filings to JSON keys
const FILING_MAP: Record<string, string[]> = {
  epr_registration: ["e_waste_rules_2022", "plastic_waste_epr_2022"],
  pcb_cte_cto: ["plastic_waste_epr_2022"],
  hazardous_waste: ["hazardous_waste_2016"],
  zld: ["hazardous_waste_2016"], // ZLD is part of hazwaste/water compliance
  pat_scheme: ["ghg_intensity_2025"],
  factory_act: [], // No direct BRSR overlap file
  none: [],
};

// BRSR disclosures that are genuinely manufacturing/product-specific and do not
// apply to pure service-sector firms (IT, BFSI, consulting, etc.). For service
// clients these are marked "not_applicable" instead of being flagged as gaps —
// UNLESS an existing filing already covers it (real evidence wins).
// Deliberately conservative: energy, water withdrawal, GHG, waste/e-waste, LCA
// and recycled-input all stay applicable since service firms have those too.
const MANUFACTURING_ONLY = new Set<string>([
  "P2-E3",  // Reclaim processes for products at end of life (needs a physical product)
  "P2-E4",  // EPR applicability (product waste streams)
  "P2-L4",  // Products/packaging reclaimed at end of life
  "P2-L5",  // Reclaimed products as % of products sold
  "P6-E2",  // PAT designated-consumer status (industrial energy scheme)
  "P6-E4",  // Water discharge by destination/treatment (industrial effluent)
  "P6-E5",  // Zero Liquid Discharge
  "P6-E6",  // Air emissions NOx/SOx/PM/VOC (stack emissions)
  "P6-E11", // Operations in ecologically sensitive areas requiring clearances
  "P6-E12", // Environmental Impact Assessments of projects
  "P6-L3",  // Biodiversity impact in ecologically sensitive areas
]);

export function generateReport(formData: IntakeFormData): ReportOutput {
  const checklist = generateChecklist(formData);
  const generalDisclosures = generateGeneralDisclosures();
  const materialityTopics = generateMaterialityTopics(formData);
  const frameworkMappings = generateFrameworkMappings(formData);
  const regulatory = assessRegulatory(formData.industry, formData.exportMarkets);

  const alreadyTracked = checklist.filter((i) => i.status === "already_tracked").length;
  const partiallyTracked = checklist.filter((i) => i.status === "partially_tracked").length;
  const newDataNeeded = checklist.filter((i) => i.status === "new_data_needed").length;
  const notApplicable = checklist.filter((i) => i.status === "not_applicable").length;

  return {
    companyName: formData.companyName || "Your Client",
    industry: formData.industry,
    selectedFilings: formData.existingFilings,
    generatedAt: new Date().toISOString(),
    checklist,
    generalDisclosures,
    materialityTopics,
    frameworkMappings,
    regulatory,
    summary: {
      totalDataPoints: checklist.length,
      alreadyTracked,
      partiallyTracked,
      newDataNeeded,
      notApplicable,
      materialTopicsCount: materialityTopics.length,
      frameworkMappingsCount: frameworkMappings.length,
    },
  };
}

function generateChecklist(formData: IntakeFormData): ChecklistItem[] {
  const principles = (brsrData as any).principles as BRSRPrinciple[];
  const items: ChecklistItem[] = [];

  const showLeadership =
    formData.companySize === "listed_top_1000" ||
    formData.companySize === "listed_outside_1000" ||
    formData.reportingMaturity === "3_plus_years";

  // Get all tracked metrics from selected filings
  const trackedMetrics = getTrackedMetrics(formData.existingFilings);
  const isServiceSector = formData.sector === "services";

  // Resolve a field's status. A filing overlap (real evidence) always wins.
  // Otherwise, manufacturing-only fields are "not_applicable" for service firms,
  // and everything else that's uncovered is a fresh-collect gap.
  function resolveStatus(indicatorId: string): ChecklistItem["status"] {
    const overlap = findOverlap(indicatorId, trackedMetrics);
    if (overlap) return overlap.coverage;
    if (isServiceSector && MANUFACTURING_ONLY.has(indicatorId)) return "not_applicable";
    return "new_data_needed";
  }

  for (const principle of principles) {
    // Essential indicators — always included
    for (const indicator of principle.essential_indicators) {
      const overlap = findOverlap(indicator.id, trackedMetrics);
      items.push({
        id: indicator.id,
        principle: principle.id,
        principleName: principle.name,
        label: indicator.label,
        unit: indicator.unit,
        measurement_guidance: indicator.measurement_guidance,
        indicator_type: "essential",
        status: resolveStatus(indicator.id),
        source_filing: overlap?.source,
        gap_note: overlap?.gap,
        page: indicator.page,
      });
    }

    // Leadership indicators — conditional
    if (showLeadership) {
      for (const indicator of principle.leadership_indicators) {
        const overlap = findOverlap(indicator.id, trackedMetrics);
        items.push({
          id: indicator.id,
          principle: principle.id,
          principleName: principle.name,
          label: indicator.label,
          unit: indicator.unit,
          measurement_guidance: indicator.measurement_guidance,
          indicator_type: "leadership",
          status: resolveStatus(indicator.id),
          source_filing: overlap?.source,
          gap_note: overlap?.gap,
          page: indicator.page,
        });
      }
    }
  }

  return items;
}

// Section A (general/entity disclosures) + Section B (management & process /
// NGRBC policy architecture). These are the same for every client — they're
// collected from the client's own records, not gap-analysed against filings —
// so they're surfaced verbatim from the knowledge base.
function generateGeneralDisclosures(): ReportOutput["generalDisclosures"] {
  const data = brsrData as any;
  const map = (x: any): SectionDisclosure => ({
    id: x.id,
    label: x.label,
    page: x.page,
    amendment: x.amendment,
  });
  return {
    sectionA: (data.section_a_general_disclosures ?? []).map(map),
    sectionB: (data.section_b_management_process_disclosures ?? []).map(map),
  };
}

interface TrackedMetric {
  brsr_id: string;
  metric: string;
  coverage: "already_tracked" | "partially_tracked";
  gap: string;
  source: string;
}

// The compliance JSON was authored against an older / BRSR-Core numbering that
// differs from the full BRSR in brsr_data_points.json. This table is the
// authoritative translation from every compliance ID → the correct full-BRSR ID.
// Anything not listed here is either already correct or should be skipped.
const COMPLIANCE_ID_REMAP: Record<string, string> = {
  // ── P6 GHG: compliance used E3/E4; full BRSR uses E7/E8 ─────────────────
  "P6-E3":    "P6-E7",   // Scope 1 + Scope 2 GHG emissions & intensity
  "P6-E4":    "P6-E8",   // GHG reduction projects / targets

  // ── P6 Air emissions: compliance E5 → full BRSR E6 ───────────────────────
  "P6-E5":    "P6-E6",   // Air emissions: NOx, SOx, PM, VOC, HAP

  // ── P6 Spills: compliance E6 → waste management section (E9) ────────────
  "P6-E6":    "P6-E9",   // Significant spills (covered inside waste disclosures)

  // ── P6 Waste: compliance E7x/E8x/E9x → full BRSR E9/E10 ─────────────────
  "P6-E7a":   "P6-E9",   // Total waste generated by type
  "P6-E7b":   "P6-E10",  // Waste management practices (narrative)
  "P6-E8a":   "P6-E9",   // Waste diverted from disposal (recycling/recovery)
  "P6-E8b":   "P6-E9",   // Waste directed to disposal (incineration/landfill)
  "P6-E9a":   "P6-E9",   // E-waste generated / recycled
  "P6-E9b":   "P6-E9",   // E-waste disposed
  "P6-E9c":   "P6-E10",  // E-waste management practices

  // ── P6 Environmental compliance: compliance E10/E11/E12 → full BRSR E13 ──
  "P6-E10":   "P6-E13",  // Show-cause / fines / penalties → env law compliance
  "P6-E11":   "P6-E13",  // Environmental penalties
  "P6-E12":   "P6-E13",  // EPR applicability (covered under E13 env compliance)

  // ── P6 BRSR Core EI/LI format (plastic_waste_epr uses these) ─────────────
  "P6-EI-5a": "P6-E9",   // Plastic waste generated
  "P6-EI-5b": "P6-E9",   // Plastic waste recovered
  "P6-EI-5c": "P6-E9",   // Plastic waste disposed
  "P6-EI-6":  "P6-E13",  // Environmental law compliance
  "P6-EI-7":  "P6-E13",  // EPR applicability (env law compliance)

  // ── P6 Leadership ─────────────────────────────────────────────────────────
  "P6-L1":    "P2-L1",   // Lifecycle assessment / resource efficiency → P2-L1 (LCA)
  "P6-L2":    "P6-E8",   // Carbon credits → P6-E8 (GHG projects, asks for carbon credits)
  "P6-L3":    "P2-L4",   // Reclaimed products at end-of-life → P2-L4
  "P6-LI-3":  "P2-L3",   // Recycled/reused input material % → P2-L3

  // ── P3 H&S system: compliance E3 → full BRSR E10 ─────────────────────────
  "P3-E3":    "P3-E10",  // Workers covered by OHS system → P3-E10 (OHS management system)
};

function normalizeComplianceId(rawId: string): string | null {
  // Skip Section-A disclosures — they don't map to P1–P9 indicators
  if (/^Section/i.test(rawId)) return null;

  // Look up the remap table first (handles all known numbering differences)
  if (rawId in COMPLIANCE_ID_REMAP) return COMPLIANCE_ID_REMAP[rawId];

  // If not in the table the ID is assumed to already match the full-BRSR format
  return rawId;
}

function getTrackedMetrics(selectedFilings: string[]): TrackedMetric[] {
  if (selectedFilings.includes("none") || selectedFilings.length === 0) return [];

  const allFilings = getAllFilings();
  const metrics: TrackedMetric[] = [];

  for (const filing of selectedFilings) {
    const jsonKeys = FILING_MAP[filing] || [];
    for (const key of jsonKeys) {
      const filingData = allFilings[key];
      if (!filingData?.data_already_tracked) continue;

      for (const tracked of filingData.data_already_tracked) {
        const rawId = tracked.maps_to_brsr_id;
        if (!rawId) continue;

        const brsr_id = normalizeComplianceId(rawId);
        if (!brsr_id) continue; // Section-A or unresolvable ID — skip

        // "full" and "direct" both mean the filing fully covers this indicator.
        // "partial", "supplementary", "indirect" all count as partially tracked.
        const coverage: "already_tracked" | "partially_tracked" =
          tracked.coverage === "full" || tracked.coverage === "direct"
            ? "already_tracked"
            : "partially_tracked";

        metrics.push({
          brsr_id,
          metric: tracked.metric,
          coverage,
          gap: tracked.gap || "",
          source: filingData.filing_name,
        });
      }
    }
  }

  return metrics;
}

function findOverlap(
  indicatorId: string,
  trackedMetrics: TrackedMetric[]
): TrackedMetric | null {
  // After normalizeComplianceId all brsr_ids in trackedMetrics are clean
  // full-BRSR IDs, so most matches will be direct.
  const direct = trackedMetrics.find((m) => m.brsr_id === indicatorId);
  if (direct) return direct;

  // Fallback: compliance sometimes uses "P6-E9" for multiple sub-rows that all
  // point to the same BRSR indicator — still a direct match after remapping,
  // but we keep a safety net for any edge cases we missed.
  const sub = trackedMetrics.find((m) => {
    if (!m.brsr_id.startsWith(indicatorId)) return false;
    // Only match if the very next character is a lowercase letter (e.g. P6-E9a)
    // to avoid P6-E1 matching P6-E10, P6-E11, P6-E12.
    const next = m.brsr_id[indicatorId.length];
    return next !== undefined && /[a-z]/.test(next);
  });
  if (sub) return { ...sub, coverage: "partially_tracked" };

  return null;
}

// Remove internal sourcing/provenance markers (e.g. "[from_guide]") that were
// authored into the knowledge base but must never appear in client-facing text.
function cleanRationale(text: string): string {
  return (text || "").replace(/\s*\[from[_\s][^\]]*\]/gi, "").replace(/\s+/g, " ").trim();
}

function generateMaterialityTopics(formData: IntakeFormData): MaterialityTopic[] {
  const industries = (industryData as any).industries;
  const industryKey = formData.industry;

  if (industryKey === "other" || !industries[industryKey]) {
    // Return a generic set for "Other"
    return getGenericMaterialityTopics();
  }

  const industryTopics = industries[industryKey];
  const topics: MaterialityTopic[] = [];
  let idx = 0;

  for (const category of ["environment", "social", "governance"] as const) {
    const categoryTopics = industryTopics[category] || [];
    for (const topic of categoryTopics) {
      idx++;
      // Auto-score based on position and export markets
      const hasEU = formData.exportMarkets.includes("EU");
      const hasUSA = formData.exportMarkets.includes("USA");
      const isListed =
        formData.companySize === "listed_top_1000" ||
        formData.companySize === "listed_outside_1000";

      let stakeholderBase = category === "environment" ? 4 : category === "social" ? 3.5 : 3;
      let businessBase = category === "governance" ? 4 : category === "environment" ? 3.5 : 3;

      // Export market bumps
      if (hasEU && category === "environment") {
        stakeholderBase = Math.min(5, stakeholderBase + 0.5);
        businessBase = Math.min(5, businessBase + 0.5);
      }
      if ((hasEU || hasUSA) && category === "social") {
        stakeholderBase = Math.min(5, stakeholderBase + 0.5);
      }
      if (isListed) {
        stakeholderBase = Math.min(5, stakeholderBase + 0.5);
      }

      // Add slight variation based on position
      const variation = (idx % 3 - 1) * 0.3;

      topics.push({
        id: `MT-${idx}`,
        topic: topic.topic,
        category,
        brsr_principles: topic.brsr_principles,
        // Strip internal provenance tags (e.g. "[from_guide]") so they never
        // surface in the client-facing materiality rationale.
        why_material: cleanRationale(topic.why_material),
        stakeholder_importance: Math.round(Math.min(5, Math.max(1, stakeholderBase + variation)) * 10) / 10,
        business_impact: Math.round(Math.min(5, Math.max(1, businessBase - variation * 0.5)) * 10) / 10,
      });
    }
  }

  return topics;
}

function getGenericMaterialityTopics(): MaterialityTopic[] {
  return [
    { id: "MT-1", topic: "GHG Emissions (Scope 1 & 2)", category: "environment", brsr_principles: ["P6"], why_material: "Universal reporting requirement under BRSR Core", stakeholder_importance: 4.5, business_impact: 4 },
    { id: "MT-2", topic: "Energy Consumption & Efficiency", category: "environment", brsr_principles: ["P6"], why_material: "Directly impacts operational costs and BRSR P6 essential indicators", stakeholder_importance: 4, business_impact: 4.5 },
    { id: "MT-3", topic: "Water Management", category: "environment", brsr_principles: ["P6"], why_material: "India-specific water stress makes this material across most sectors", stakeholder_importance: 4, business_impact: 3.5 },
    { id: "MT-4", topic: "Waste Generation & Management", category: "environment", brsr_principles: ["P6"], why_material: "BRSR requires detailed waste categorization and disposal methods", stakeholder_importance: 3.5, business_impact: 3 },
    { id: "MT-5", topic: "Employee Health & Safety", category: "social", brsr_principles: ["P3"], why_material: "Universal BRSR essential indicator with quantitative metrics", stakeholder_importance: 4.5, business_impact: 4 },
    { id: "MT-6", topic: "Diversity & Equal Opportunity", category: "social", brsr_principles: ["P3", "P5"], why_material: "Gender diversity at board and workforce level is a BRSR Core KPI", stakeholder_importance: 4, business_impact: 3.5 },
    { id: "MT-7", topic: "Human Rights & Labour Practices", category: "social", brsr_principles: ["P5"], why_material: "BRSR Principle 5 covers child labour, forced labour, and POSH compliance", stakeholder_importance: 4, business_impact: 3 },
    { id: "MT-8", topic: "Community Engagement & CSR", category: "social", brsr_principles: ["P8"], why_material: "Section 135 CSR compliance feeds directly into BRSR Principle 8", stakeholder_importance: 3.5, business_impact: 3 },
    { id: "MT-9", topic: "Ethics, Anti-Corruption & Transparency", category: "governance", brsr_principles: ["P1"], why_material: "BRSR Principle 1 mandates policy disclosure, training coverage, and penalty details", stakeholder_importance: 4, business_impact: 4.5 },
    { id: "MT-10", topic: "Data Privacy & Cybersecurity", category: "governance", brsr_principles: ["P9"], why_material: "BRSR Principle 9 requires breach disclosure; DPDP Act 2023 amplifies this", stakeholder_importance: 3.5, business_impact: 4 },
    { id: "MT-11", topic: "Supply Chain Sustainability", category: "governance", brsr_principles: ["P1", "P2"], why_material: "BRSR value chain disclosure expanding to top 500 from FY 2025-26", stakeholder_importance: 3.5, business_impact: 3.5 },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateFrameworkMappings(_formData: IntakeFormData): FrameworkMapping[] {
  const mappings = (frameworkData as any).mappings as FrameworkMapping[];
  const tnfd = (tnfdData as any).mappings as Record<string, { pillar: string; detail: string }>;

  // Return all mappings — the UI will handle filtering. Attach the indicative
  // TNFD crosswalk where the disclosure is nature-related.
  return mappings.map((m) => ({
    brsr_id: m.brsr_id,
    brsr_label: m.brsr_label,
    brsr_section: m.brsr_section,
    gri_standard: m.gri_standard,
    gri_label: m.gri_label,
    tcfd_pillar: m.tcfd_pillar,
    tcfd_detail: m.tcfd_detail,
    ifrs_reference: m.ifrs_reference,
    tnfd_pillar: tnfd[m.brsr_id]?.pillar,
    tnfd_detail: tnfd[m.brsr_id]?.detail,
    notes: m.notes,
  }));
}
