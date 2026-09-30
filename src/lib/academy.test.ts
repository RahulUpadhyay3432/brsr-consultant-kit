import { describe, it, expect } from "vitest";
import { ACADEMY_MODULES, moduleFields, coveredDisclosureCount, totalHours } from "./academy";
import { BRSR_FIELDS } from "./brsr-fields";
import { GLOSSARY } from "@/data/glossary";

// The pack is a set of pointers into content that lives elsewhere, so the thing
// that breaks it is a pointer that stops resolving — a disclosure id that does
// not exist, a glossary anchor that was renamed, a tool that moved. None of
// those fail the build; they just render a module that teaches nothing. So they
// are asserted here.
//
// The disclosure ids matter especially: two brsr_id conventions exist in this
// repo, and the wrong one resolves to nothing rather than to an error.

const fieldIds = new Set(BRSR_FIELDS.map((f) => f.id));
const termIds = new Set(GLOSSARY.map((t) => t.id));

describe("academy pack", () => {
  it("resolves every explicitly covered disclosure id", () => {
    const unresolved = ACADEMY_MODULES.flatMap((m) =>
      (m.covers ?? []).filter((id) => !fieldIds.has(id)).map((id) => `${m.slug}: ${id}`),
    );
    expect(unresolved).toEqual([]);
  });

  it("resolves every glossary anchor", () => {
    const unresolved = ACADEMY_MODULES.flatMap((m) =>
      m.glossary.filter((id) => !termIds.has(id)).map((id) => `${m.slug}: ${id}`),
    );
    expect(unresolved).toEqual([]);
  });

  it("names a real principle wherever a module is principle-shaped", () => {
    const principles = new Set(BRSR_FIELDS.map((f) => f.principle));
    const unknown = ACADEMY_MODULES.flatMap((m) =>
      (m.principles ?? []).filter((p) => !principles.has(p)).map((p) => `${m.slug}: ${p}`),
    );
    expect(unknown).toEqual([]);
  });

  it("gives every module something concrete to teach", () => {
    // A module may legitimately cover no Section C disclosure (applicability,
    // Sections A and B, the crosswalk), but it must still carry glossary terms
    // and assessment questions, or there is nothing to run.
    for (const m of ACADEMY_MODULES) {
      expect(m.glossary.length, `${m.slug} glossary`).toBeGreaterThan(0);
      expect(m.assessment.length, `${m.slug} assessment`).toBeGreaterThanOrEqual(2);
      expect(m.objective.length, `${m.slug} objective`).toBeGreaterThan(20);
      expect(m.rationale.length, `${m.slug} rationale`).toBeGreaterThan(20);
      expect(m.minutes, `${m.slug} minutes`).toBeGreaterThan(0);
    }
  });

  it("keeps slugs unique", () => {
    const slugs = ACADEMY_MODULES.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("points practise links at real tool routes", () => {
    // Guards a renamed or removed tool, which would otherwise 404 mid-course.
    const known = new Set([
      "/tools/audit-readiness", "/tools/brsr-applicability", "/tools/brsr-framework-mapping",
      "/tools/ghg-calculator", "/tools/materiality", "/tools/ppp-intensity",
      "/tools/scope3-calculator", "/tools/wellbeing-schedule", "/tools/xbrl-preflight",
    ]);
    const bad = ACADEMY_MODULES
      .filter((m) => m.practise && !known.has(m.practise.href))
      .map((m) => `${m.slug}: ${m.practise?.href}`);
    expect(bad).toEqual([]);
  });

  it("resolves principle-shaped modules to actual fields", () => {
    const people = ACADEMY_MODULES.find((m) => m.slug === "people-and-rights")!;
    const fields = moduleFields(people);
    expect(fields.length).toBeGreaterThan(0);
    expect(new Set(fields.map((f) => f.principle))).toEqual(new Set(["P3", "P5"]));
  });

  it("preserves the module's own ordering for explicit covers", () => {
    const energy = ACADEMY_MODULES.find((m) => m.slug === "energy-and-emissions")!;
    expect(moduleFields(energy).map((f) => f.id)).toEqual(energy.covers);
  });

  it("reports coverage and duration without inventing them", () => {
    const covered = coveredDisclosureCount();
    expect(covered).toBeGreaterThan(0);
    // Cannot claim more coverage than the reference set holds.
    expect(covered).toBeLessThanOrEqual(BRSR_FIELDS.length);
    expect(totalHours()).toBeGreaterThan(0);
  });
});
