import { describe, it, expect } from "vitest";
import {
  FACTOR_GROUPS, ALL_FACTORS, FACTOR_COUNT, SCOPES, countByScope,
  METHODOLOGY, PPP_FACTOR, matchesQuery, factorCsvRows,
} from "./emission-factor-index";
import FACTORS from "@/data/emission_factors.json";
import SCOPE3 from "@/data/scope3_factors.json";

// The point of this index is that the public factor page and the calculators
// read the same numbers. These tests pin that: every row must trace back to a
// source file, carry a citation, and never restate a figure the data file
// already formatted. A page that quietly rounds or relabels a factor is worse
// than no page, because it invites someone to cite the wrong basis.

describe("emission factor index", () => {
  it("flattens every factor in the source files and loses none", () => {
    const expected =
      1 + // scope2_grid
      (FACTORS.scope1_fuels as unknown[]).length +
      (FACTORS.scope1_fugitive as unknown[]).length +
      Object.entries(SCOPE3)
        .filter(([k]) => k !== "_meta")
        .reduce((n, [, v]) => n + ((v as { factors?: unknown[] }).factors?.length ?? 0), 0);

    expect(FACTOR_COUNT).toBe(expected);
    expect(ALL_FACTORS).toHaveLength(expected);
  });

  it("gives every factor a citation, a unit and a usable number", () => {
    for (const f of ALL_FACTORS) {
      expect(f.source, `${f.label} source`).toBeTruthy();
      expect(f.source.length, `${f.label} source is too short to be a citation`).toBeGreaterThan(15);
      expect(f.per, `${f.label} per-unit`).toBeTruthy();
      expect(typeof f.value, `${f.label} value`).toBe("number");
      expect(f.value, `${f.label} value`).toBeGreaterThan(0);
      expect(f.display, `${f.label} display`).toBeTruthy();
      expect(f.usedBy.length, `${f.label} usedBy`).toBeGreaterThan(0);
    }
  });

  it("keys every row uniquely, so React lists and CSV rows cannot collide", () => {
    const keys = ALL_FACTORS.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("carries the grid factor's version and financial year, not a 'latest' badge", () => {
    const grid = ALL_FACTORS.find((f) => f.key === "s2-grid");
    expect(grid).toBeDefined();
    expect(grid!.value).toBe(FACTORS.scope2_grid.factor_kg_co2_per_kwh);
    expect(grid!.display).toBe(FACTORS.scope2_grid.factor_display);
    // The stale-factor error this page exists to prevent is only catchable if
    // the vintage travels with the number.
    expect(grid!.note).toContain(FACTORS.scope2_grid.version);
    expect(grid!.note).toContain(FACTORS.scope2_grid.fy);
  });

  it("does not restate any figure — display strings come from the data files verbatim", () => {
    const fromFile = new Set<string>([
      FACTORS.scope2_grid.factor_display,
      ...(FACTORS.scope1_fuels as { co2e_display: string }[]).map((f) => f.co2e_display),
      ...(FACTORS.scope1_fugitive as { co2e_display: string }[]).map((f) => f.co2e_display),
      ...Object.entries(SCOPE3)
        .filter(([k]) => k !== "_meta")
        .flatMap(([, v]) => ((v as { factors?: { display: string }[] }).factors ?? []).map((f) => f.display)),
    ]);
    for (const f of ALL_FACTORS) {
      expect(fromFile.has(f.display), `${f.label} display was rewritten`).toBe(true);
    }
  });

  it("assigns every factor to one of the three scopes, and counts add up", () => {
    const total = SCOPES.reduce((n, s) => n + countByScope(s), 0);
    expect(total).toBe(FACTOR_COUNT);
    for (const s of SCOPES) expect(countByScope(s)).toBeGreaterThan(0);
  });

  it("groups are non-empty and each group holds a single scope", () => {
    expect(FACTOR_GROUPS.length).toBeGreaterThan(3);
    for (const g of FACTOR_GROUPS) {
      expect(g.entries.length, `${g.title} is empty`).toBeGreaterThan(0);
      expect(g.blurb.length, `${g.title} blurb`).toBeGreaterThan(40);
      for (const f of g.entries) expect(f.scope, `${f.label} in ${g.title}`).toBe(g.scope);
    }
  });

  it("surfaces the methodology statements the page cites", () => {
    for (const [k, v] of Object.entries(METHODOLOGY)) {
      expect(v, `METHODOLOGY.${k}`).toBeTruthy();
    }
    expect(METHODOLOGY.scope3SourceUrl).toMatch(/^https:\/\//);
    expect(PPP_FACTOR.value).toBeGreaterThan(0);
    expect(PPP_FACTOR.year).toBeGreaterThan(2015);
  });

  it("searches by label, unit and source text", () => {
    const diesel = ALL_FACTORS.find((f) => f.label.includes("Diesel"))!;
    expect(matchesQuery(diesel, "diesel")).toBe(true);
    expect(matchesQuery(diesel, "DIESEL")).toBe(true);
    expect(matchesQuery(diesel, "")).toBe(true);
    expect(matchesQuery(diesel, "   ")).toBe(true);
    expect(matchesQuery(diesel, "ipcc")).toBe(true);
    expect(matchesQuery(diesel, "zzzznotathing")).toBe(false);

    // Source text is searchable, which is how "CEA" finds the grid factor.
    const grid = ALL_FACTORS.find((f) => f.key === "s2-grid")!;
    expect(matchesQuery(grid, "central electricity authority")).toBe(true);
  });

  it("exports a CSV with a header and one cited row per factor", () => {
    const rows = factorCsvRows();
    expect(rows).toHaveLength(FACTOR_COUNT + 1);
    expect(rows[0]).toContain("Primary source");
    expect(rows[0]).toHaveLength(9);
    for (const r of rows.slice(1)) {
      expect(r).toHaveLength(9);
      expect(r[7], "every CSV row carries its citation").toBeTruthy();
    }
  });

  it("exports only the rows it is handed, for the filtered download", () => {
    const two = ALL_FACTORS.slice(0, 2);
    expect(factorCsvRows(two)).toHaveLength(3);
  });
});
