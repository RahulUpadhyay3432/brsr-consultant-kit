import { describe, it, expect } from "vitest";
import overlay from "@/data/cdp_ecovadis_mappings.json";
import ratings from "@/data/esg_ratings_mapping.json";
import crosswalk from "@/data/framework_mappings.json";

// The overlay's whole claim is that it invents nothing: every CDP area and
// EcoVadis criterion is drawn from the principle-level sets already sourced in
// esg_ratings_mapping.json, and every key resolves against the crosswalk. Those
// are exactly the properties that rot quietly when someone edits one file, so
// they are asserted here rather than trusted.

type Row = {
  cdp_area?: string; cdp_detail?: string;
  ecovadis_theme?: string; ecovadis_criterion?: string; ecovadis_detail?: string;
};
const rows = (overlay as { mappings: Record<string, Row> }).mappings;
const entries = Object.entries(rows);

const sourcedCdp = new Set(
  (ratings as { mappings: { cdp_areas?: string[] }[] }).mappings.flatMap((m) => m.cdp_areas ?? []),
);
const sourcedEcovadis = new Set(
  (ratings as { mappings: { ecovadis_criteria?: string[] }[] }).mappings
    .flatMap((m) => m.ecovadis_criteria ?? []),
);
const crosswalkIds = new Set(
  (crosswalk as { mappings: { brsr_id: string }[] }).mappings.map((m) => m.brsr_id),
);

describe("cdp_ecovadis_mappings overlay", () => {
  it("invents no CDP vocabulary", () => {
    const invented = entries
      .filter(([, r]) => r.cdp_area && !sourcedCdp.has(r.cdp_area))
      .map(([id, r]) => `${id}: ${r.cdp_area}`);
    expect(invented).toEqual([]);
  });

  it("invents no EcoVadis vocabulary", () => {
    const invented = entries
      .filter(([, r]) => r.ecovadis_criterion && !sourcedEcovadis.has(r.ecovadis_criterion))
      .map(([id, r]) => `${id}: ${r.ecovadis_criterion}`);
    expect(invented).toEqual([]);
  });

  it("keys every row to a real framework_mappings.json disclosure", () => {
    expect(entries.filter(([id]) => !crosswalkIds.has(id)).map(([id]) => id)).toEqual([]);
  });

  it("stays inside Principle 6, which is its declared scope", () => {
    expect(entries.filter(([id]) => !id.startsWith("P6-")).map(([id]) => id)).toEqual([]);
  });

  it("never leaves a mapping without its reasoning", () => {
    const unexplained = entries
      .filter(([, r]) => (r.cdp_area && !r.cdp_detail) || (r.ecovadis_criterion && !r.ecovadis_detail))
      .map(([id]) => id);
    expect(unexplained).toEqual([]);
  });

  it("pairs an EcoVadis criterion with its theme", () => {
    const themeless = entries
      .filter(([, r]) => Boolean(r.ecovadis_criterion) !== Boolean(r.ecovadis_theme))
      .map(([id]) => id);
    expect(themeless).toEqual([]);
  });

  it("carries at least one framework per row, never an empty shell", () => {
    const empty = entries.filter(([, r]) => !r.cdp_area && !r.ecovadis_criterion).map(([id]) => id);
    expect(empty).toEqual([]);
  });

  // Sparseness is the honest part of the design, so assert it survives: waste
  // has no CDP module, and scenario analysis / carbon pricing have no EcoVadis
  // criterion. If a later edit "completes the grid", these fail.
  it("keeps waste rows free of a CDP area", () => {
    for (const id of ["P6-E17", "P6-E18", "P6-E19"]) {
      expect(rows[id]?.cdp_area, id).toBeUndefined();
      expect(rows[id]?.ecovadis_criterion, id).toBe("Materials, chemicals & waste");
    }
  });

  it("keeps scenario analysis and carbon pricing free of an EcoVadis criterion", () => {
    for (const id of ["P6-E26", "P6-E27"]) {
      expect(rows[id]?.ecovadis_criterion, id).toBeUndefined();
      expect(rows[id]?.cdp_area, id).toBe("Business strategy");
    }
  });

  it("does not claim a mapping for environmental non-compliances", () => {
    // P6-E24 (penalties) has no clean counterpart in either framework.
    expect(rows["P6-E24"]).toBeUndefined();
  });
});
