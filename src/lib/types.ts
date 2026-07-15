export interface IntakeFormData {
  companyName: string;
  industry: IndustryType;
  sector: SectorType;
  companySize: CompanySize;
  reportingMaturity: ReportingMaturity;
  exportMarkets: ExportMarket[];
  existingFilings: ExistingFiling[];
}

// Whether the client's operations are manufacturing/product-based or service-based.
// Drives suppression of manufacturing-only BRSR disclosures for service firms.
export type SectorType = "manufacturing" | "services";

export type IndustryType =
  | "textile_and_apparel"
  | "food_and_beverage"
  | "cement"
  | "steel_and_metals"
  | "pharmaceuticals"
  | "it_services"
  | "chemicals"
  | "automotive"
  | "power_and_energy"
  | "construction"
  | "other";

export type CompanySize =
  | "listed_top_1000"
  | "listed_outside_1000"
  | "unlisted_supplier"
  | "unlisted_not_in_value_chain";

export type ReportingMaturity =
  | "first_time"
  | "1_to_2_years"
  | "3_plus_years";

export type ExportMarket = "EU" | "USA" | "UK" | "Middle East" | "Southeast Asia" | "None";

export type ExistingFiling =
  | "pcb_cte_cto"
  | "zld"
  | "hazardous_waste"
  | "epr_registration"
  | "factory_act"
  | "pat_scheme"
  | "none";

// BRSR Data Points types
export interface BRSRIndicator {
  id: string;
  label: string;
  unit: string | null;
  measurement_guidance: string;
  page: number | string;
}

export interface BRSRPrinciple {
  id: string;
  name: string;
  sdg_alignment: string;
  essential_indicators: BRSRIndicator[];
  leadership_indicators: BRSRIndicator[];
}

// Checklist item with gap status
export interface ChecklistItem {
  id: string;
  principle: string;
  principleName: string;
  label: string;
  unit: string | null;
  measurement_guidance: string;
  indicator_type: "essential" | "leadership";
  status: "already_tracked" | "partially_tracked" | "new_data_needed" | "not_applicable";
  source_filing?: string;
  gap_note?: string;
  page?: number | string; // ICAI Background Material page reference for SEBI source citation
}

// Section A / B disclosure, entity-level and management-process disclosures.
// Unlike the Section-C principle indicators these are factual / policy items
// collected from the client's own records, not gap-analysed against filings.
export interface SectionDisclosure {
  id: string;
  label: string;
  page?: number | string;
  amendment?: boolean;
}

// Materiality topic with scoring
export interface MaterialityTopic {
  id: string;
  topic: string;
  category: "environment" | "social" | "governance";
  brsr_principles: string[];
  why_material: string;
  stakeholder_importance: number; // 1-5
  business_impact: number; // 1-5
}

// Framework mapping item
export interface FrameworkMapping {
  brsr_id: string;
  brsr_label: string;
  brsr_section: string;
  gri_standard: string;
  gri_label: string;
  tcfd_pillar: string;
  tcfd_detail: string;
  ifrs_reference: string;
  // TNFD (nature-related), only present on the nature-relevant rows; from the
  // indicative tnfd_mappings.json overlay. Undefined where there's no mapping.
  tnfd_pillar?: string;
  tnfd_detail?: string;
  // ESRS (the reporting standards behind the EU's CSRD); from the indicative
  // esrs_mappings.json overlay. Sparse: undefined where we don't claim a clean
  // counterpart. This is a crosswalk only, CSRD applicability depends on EU
  // turnover/headcount thresholds the intake doesn't collect.
  esrs_standard?: string;
  esrs_detail?: string;
  notes: string;
}

// Full report output
import type { RegulatoryReadiness } from "./regulatory-readiness";

export interface ReportOutput {
  companyName: string;
  industry: string;
  selectedFilings: ExistingFiling[];
  generatedAt: string;
  checklist: ChecklistItem[];
  generalDisclosures: { sectionA: SectionDisclosure[]; sectionB: SectionDisclosure[] };
  materialityTopics: MaterialityTopic[];
  frameworkMappings: FrameworkMapping[];
  regulatory: RegulatoryReadiness;
  summary: {
    totalDataPoints: number;
    alreadyTracked: number;
    partiallyTracked: number;
    newDataNeeded: number;
    notApplicable: number;
    materialTopicsCount: number;
    frameworkMappingsCount: number;
  };
}

export const INDUSTRY_LABELS: Record<IndustryType, string> = {
  textile_and_apparel: "Textile & Apparel",
  food_and_beverage: "Food & Beverage",
  cement: "Cement",
  steel_and_metals: "Steel & Metals",
  pharmaceuticals: "Pharmaceuticals",
  it_services: "IT Services",
  chemicals: "Chemicals",
  automotive: "Automotive",
  power_and_energy: "Power & Energy",
  construction: "Construction",
  other: "Other",
};

export const SECTOR_LABELS: Record<SectorType, string> = {
  manufacturing: "Product / Manufacturing",
  services: "Services",
};

// Industries that are service-based by default. Everything else defaults to
// manufacturing. The user can override via the sector toggle (e.g. a service
// firm filed under "Other").
const SERVICE_INDUSTRIES = new Set<IndustryType>(["it_services"]);

export function inferDefaultSector(industry: IndustryType): SectorType {
  return SERVICE_INDUSTRIES.has(industry) ? "services" : "manufacturing";
}

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  listed_top_1000: "Listed, Top 1000 by market cap",
  listed_outside_1000: "Listed, Outside top 1000",
  unlisted_supplier: "Unlisted, Supplier to listed company",
  unlisted_not_in_value_chain: "Unlisted, Not in value chain",
};

export const MATURITY_LABELS: Record<ReportingMaturity, string> = {
  first_time: "First-time filing",
  "1_to_2_years": "1–2 years of filing",
  "3_plus_years": "3+ years, improving quality",
};

export const FILING_LABELS: Record<ExistingFiling, string> = {
  pcb_cte_cto: "PCB (CTE/CTO)",
  zld: "ZLD",
  hazardous_waste: "Hazardous Waste",
  epr_registration: "EPR Registration",
  factory_act: "Factory Act",
  pat_scheme: "PAT Scheme",
  none: "None",
};

export const FILING_TO_JSON_KEY: Record<string, string> = {
  epr_registration: "e_waste_rules_2022",
  pcb_cte_cto: "plastic_waste_epr_2022",
  hazardous_waste: "hazardous_waste_2016",
  pat_scheme: "ghg_intensity_2025",
  zld: "plastic_waste_epr_2022",
};
