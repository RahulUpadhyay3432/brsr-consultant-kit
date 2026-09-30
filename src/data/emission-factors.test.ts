import { describe, it, expect } from "vitest";
import FACTORS from "./emission_factors.json";

// The landing-page calculator, the report calculators and the feature pages all
// read their numbers and their citation from this file. It used to be otherwise:
// the homepage panel computed Scope 2 with a hardcoded 0.716 and labelled it
// "CEA v18 (FY24)", while this file said 0.710 from CEA Version 21.0, FY 2024-25
// — and the site's own blog post names using 0.716 instead of 0.710 as the
// stale-factor mistake an assurer will flag. A marketing calculator that
// disagrees with the product's cited basis is the one error a tool selling
// defensible data cannot afford, so the fields the UI depends on are pinned here.

const grid = FACTORS.scope2_grid as {
  factor_kg_co2_per_kwh: number; factor_display: string; version: string; fy: string; source: string;
};
const fuels = FACTORS.scope1_fuels as { label: string; co2e_per_unit: number; co2e_display: string }[];

describe("emission factors: the contract the UI relies on", () => {
  it("exposes the grid factor as a number the calculators can multiply by", () => {
    expect(typeof grid.factor_kg_co2_per_kwh).toBe("number");
    expect(grid.factor_kg_co2_per_kwh).toBeGreaterThan(0);
    // Sanity band for an Indian national grid factor, in kgCO2/kWh. Wide on
    // purpose: this catches a unit slip (0.71 t/MWh written as 710), not a
    // legitimate year-on-year revision.
    expect(grid.factor_kg_co2_per_kwh).toBeLessThan(2);
  });

  it("carries its own vintage, so the UI never has to show a generic 'latest' badge", () => {
    expect(grid.version, "scope2_grid.version").toBeTruthy();
    expect(grid.fy, "scope2_grid.fy").toMatch(/^\d{4}-\d{2}$/);
    expect(grid.source.length).toBeGreaterThan(40);
  });

  it("names its version inside its own source prose", () => {
    // Guards the halves drifting apart: bumping `version` without updating the
    // citation, or vice versa.
    expect(grid.source).toContain(grid.version);
  });

  it("keeps factor_display consistent with the numeric factor", () => {
    const shown = parseFloat(grid.factor_display);
    expect(Number.isNaN(shown)).toBe(false);
    expect(shown).toBeCloseTo(grid.factor_kg_co2_per_kwh, 3);
  });

  it("still has the Diesel entry the landing-page panel looks up by label", () => {
    const diesel = fuels.find((f) => f.label.includes("Diesel"));
    expect(diesel, "a scope1_fuels entry whose label contains 'Diesel'").toBeDefined();
    expect(typeof diesel!.co2e_per_unit).toBe("number");
    expect(diesel!.co2e_per_unit).toBeGreaterThan(0);
  });

  it("gives every Scope 1 fuel a factor and a citation", () => {
    for (const f of fuels) {
      expect(typeof f.co2e_per_unit, f.label).toBe("number");
      expect(f.co2e_per_unit, f.label).toBeGreaterThan(0);
      expect((f as { source?: string }).source, `${f.label} source`).toBeTruthy();
    }
  });
});
