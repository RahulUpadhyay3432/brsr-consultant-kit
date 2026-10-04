import { describe, it, expect } from "vitest";
import GRESB from "./gresb_mappings.json";
import FRAMEWORKS from "./framework_mappings.json";

// GRESB was named in an outbound email before it existed, and the only safe way
// to close that gap was to build it from the published Assessment structure
// rather than from plausible-sounding guesses. These tests are what make that
// claim checkable: every component and aspect below must come from the sourced
// vocabulary, and the deliberate gaps must stay gaps.
//
// The reader this has to survive is a GRESB practitioner. An invented aspect
// name would be worse than having shipped nothing.

const mappings = (GRESB as { mappings: Record<string, GresbRow> }).mappings;
const meta = (GRESB as { _meta: Record<string, unknown> })._meta;

type GresbRow = { gresb_re?: string; gresb_infra?: string; gresb_detail?: string };

// ── The sourced vocabulary ───────────────────────────────────────────────────
// Real Estate Assessment: 3 Components; Management has 5 Aspects, Performance 10.
const RE_COMPONENTS = ["Management", "Performance", "Development"];
const RE_ASPECTS = [
  // Management
  "Leadership", "Policies", "ESG Reporting", "Risk Management", "Employee Engagement",
  // Performance
  "Reporting Characteristics", "Risk Assessment", "Targets", "Tenants & Community",
  "Energy", "GHG", "Water", "Waste", "Data Monitoring & Review", "Building Certifications",
];

// Infrastructure Asset Assessment: Management has 6 Aspects, Performance 12.
const INFRA_COMPONENTS = ["Management", "Performance"];
const INFRA_ASPECTS = [
  // Management
  "Leadership", "Policies", "Targets", "Reporting", "Risk Management", "Stakeholder Engagement",
  // Performance
  "Implementation", "Output & Impact", "Health & Safety", "Energy", "Greenhouse Gas Emissions",
  "Air Pollution", "Water", "Waste", "Biodiversity & Habitat", "Employees", "Customers",
  "Certifications & Awards",
];

/** Rows are written "Component – Aspect" with an en dash. */
function split(value: string): { component: string; aspect: string } {
  const parts = value.split("–").map((p) => p.trim());
  return { component: parts[0], aspect: parts.slice(1).join(" – ") };
}

const crosswalkIds = new Set((FRAMEWORKS as { mappings: { brsr_id: string }[] }).mappings.map((m) => m.brsr_id));
const rows = Object.entries(mappings) as [string, GresbRow][];

describe("BRSR → GRESB overlay", () => {
  it("invents no vocabulary: every Real Estate component and aspect is a published one", () => {
    for (const [id, row] of rows) {
      if (!row.gresb_re) continue;
      const { component, aspect } = split(row.gresb_re);
      expect(RE_COMPONENTS, `${id} Real Estate component "${component}"`).toContain(component);
      expect(RE_ASPECTS, `${id} Real Estate aspect "${aspect}"`).toContain(aspect);
    }
  });

  it("invents no vocabulary: every Infrastructure component and aspect is a published one", () => {
    for (const [id, row] of rows) {
      if (!row.gresb_infra) continue;
      const { component, aspect } = split(row.gresb_infra);
      expect(INFRA_COMPONENTS, `${id} Infrastructure component "${component}"`).toContain(component);
      expect(INFRA_ASPECTS, `${id} Infrastructure aspect "${aspect}"`).toContain(aspect);
    }
  });

  it("puts each aspect under the component that actually owns it", () => {
    // The two Assessments disagree about where Targets and risk live, and that
    // disagreement is the single easiest thing to get wrong in this file.
    const RE_MGMT = new Set(["Leadership", "Policies", "ESG Reporting", "Risk Management", "Employee Engagement"]);
    const INFRA_MGMT = new Set(["Leadership", "Policies", "Targets", "Reporting", "Risk Management", "Stakeholder Engagement"]);

    for (const [id, row] of rows) {
      if (row.gresb_re) {
        const { component, aspect } = split(row.gresb_re);
        if (RE_MGMT.has(aspect) && aspect !== "Risk Management") {
          expect(component, `${id}: Real Estate "${aspect}" is a Management aspect`).toBe("Management");
        }
      }
      if (row.gresb_infra) {
        const { component, aspect } = split(row.gresb_infra);
        if (INFRA_MGMT.has(aspect) && aspect !== "Risk Management") {
          expect(component, `${id}: Infrastructure "${aspect}" is a Management aspect`).toBe("Management");
        }
      }
    }
  });

  it("pins the two places the Assessments genuinely diverge", () => {
    // Targets: Performance in Real Estate, Management in Infrastructure.
    expect(mappings["P6-E15"].gresb_re).toBe("Performance – Targets");
    expect(mappings["P6-E15"].gresb_infra).toBe("Management – Targets");
    // Climate risk: Performance Risk Assessment vs Management Risk Management.
    expect(mappings["P6-E25"].gresb_re).toBe("Performance – Risk Assessment");
    expect(mappings["P6-E25"].gresb_infra).toBe("Management – Risk Management");
    // And GHG carries a different aspect NAME in each Assessment.
    expect(mappings["P6-E11"].gresb_re).toBe("Performance – GHG");
    expect(mappings["P6-E11"].gresb_infra).toBe("Performance – Greenhouse Gas Emissions");
  });

  it("keys every row against the crosswalk, so none resolves to nothing", () => {
    // The trap recorded in CLAUDE.md: framework_mappings.json is finer-grained
    // than brsr_data_points.json, and overlays must key off the crosswalk ids.
    for (const [id] of rows) {
      expect(crosswalkIds.has(id), `${id} is not a framework_mappings.json brsr_id`).toBe(true);
    }
  });

  it("gives every row at least one aspect and a reason", () => {
    for (const [id, row] of rows) {
      expect(
        Boolean(row.gresb_re || row.gresb_infra),
        `${id} has neither Assessment mapped — delete the row instead`,
      ).toBe(true);
      expect(row.gresb_detail, `${id} detail`).toBeTruthy();
      expect(row.gresb_detail!.length, `${id} detail is too short to be a reason`).toBeGreaterThan(40);
    }
  });

  it("keeps the deliberate gaps: GRESB has no P2, P5, P7 or P8 aspect", () => {
    // Product lifecycle, human rights, policy advocacy and statutory CSR are
    // genuinely absent from GRESB. Mapping them would be the invention this
    // whole file exists to avoid.
    for (const principle of ["P2", "P5", "P7", "P8"]) {
      const leaked = rows.filter(([id]) => id.startsWith(`${principle}-`)).map(([id]) => id);
      expect(leaked, `${principle} must stay unmapped`).toEqual([]);
    }
  });

  it("keeps the India-specific and penalty disclosures unmapped", () => {
    // PAT scheme and Zero Liquid Discharge are Indian regimes; environmental
    // penalties, single-use plastic and internal carbon pricing have no GRESB
    // aspect. P6-E24 is also unmapped in the CDP/EcoVadis overlay — same reason.
    for (const id of ["P6-E6", "P6-E10", "P6-E23", "P6-E24", "P6-E27", "P6-E21"]) {
      expect(mappings[id], `${id} must carry no GRESB mapping`).toBeUndefined();
    }
  });

  it("maps air pollution and biodiversity to Infrastructure ONLY", () => {
    // Real Estate has no aspect for either. A mapping appearing on the Real
    // Estate side would be fabricated.
    expect(mappings["P6-E20"].gresb_re).toBeUndefined();
    expect(mappings["P6-E20"].gresb_infra).toBe("Performance – Air Pollution");
    expect(mappings["P6-E22"].gresb_re).toBeUndefined();
    expect(mappings["P6-E22"].gresb_infra).toBe("Performance – Biodiversity & Habitat");
  });

  it("maps Tenants & Community to Real Estate ONLY", () => {
    // The mirror case: Infrastructure has Customers instead.
    expect(mappings["P9-C1"].gresb_re).toBe("Performance – Tenants & Community");
    expect(mappings["P9-C1"].gresb_infra).toBe("Performance – Customers");
    for (const [id, row] of rows) {
      if (row.gresb_infra?.includes("Tenants & Community")) {
        throw new Error(`${id}: Tenants & Community does not exist in the Infrastructure Assessment`);
      }
    }
  });

  it("stays sparse — well under half the crosswalk", () => {
    // If this ever approaches full coverage, someone has started guessing.
    expect(rows.length).toBeGreaterThan(30);
    expect(rows.length).toBeLessThan(crosswalkIds.size * 0.6);
  });

  it("carries the applicability warning and its sources", () => {
    // The honesty that makes the overlay safe to publish: GRESB is a real-estate
    // and infrastructure benchmark, so it is irrelevant to most BRSR filers.
    const warn = String(meta.applicability_warning);
    expect(warn.toUpperCase()).toContain("REAL ESTATE");
    expect(warn).toMatch(/infrastructure/i);
    expect(warn).toMatch(/not a general-purpose/i);

    expect(String(meta.status)).toMatch(/not a certified equivalence/i);
    expect(String(meta.granularity)).toMatch(/not indicator codes/i);
    expect(String(meta.deliberate_gaps)).toMatch(/Principles 2, 5, 7 and 8 are mapped NOWHERE/);
    // The row count is stated in prose, so pin it: a stale "40 of the 77" is
    // exactly the kind of uncited number this product exists to refuse.
    expect(String(meta.deliberate_gaps)).toContain(`${rows.length} of the ${crosswalkIds.size} crosswalk rows`);

    const sources = meta.sources as string[];
    expect(sources.length).toBeGreaterThanOrEqual(4);
    for (const s of sources) expect(s).toMatch(/gresb\.com/);
  });
});
