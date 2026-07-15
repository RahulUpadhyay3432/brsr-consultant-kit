import { describe, it, expect } from "vitest";
import { isMapped, NO_MAPPING } from "./types";
import { buildFrameworkExportRows } from "./framework-export";
import { generateFrameworkMappings } from "./report-generator";

// Regression cover for a bug that shipped for ~5 weeks: the product-wide em-dash
// copy scrub (c0b089a) rewrote every `=== "—"` guard into `=== ", "`, so the
// crosswalk stopped recognising its own "no counterpart" placeholder. Unmapped
// rows were then counted and rendered as mapped, and the UI claimed 77 TCFD
// mappings when only 37 exist. These tests pin the sentinel and the real counts
// so a future copy pass over the source fails loudly instead of silently.

describe("isMapped", () => {
  it("treats the em-dash placeholder as unmapped", () => {
    expect(isMapped(NO_MAPPING)).toBe(false);
    expect(isMapped("—")).toBe(false);
  });

  it("treats empty, whitespace and nullish as unmapped", () => {
    expect(isMapped("")).toBe(false);
    expect(isMapped("   ")).toBe(false);
    expect(isMapped(null)).toBe(false);
    expect(isMapped(undefined)).toBe(false);
  });

  it("treats the comma the em-dash scrub left behind as unmapped", () => {
    // Defensive: if a scrub ever rewrites the sentinel again, the comma form
    // must not read as a real mapping.
    expect(isMapped(", ")).toBe(false);
    expect(isMapped(",")).toBe(false);
  });

  it("treats a real reference as mapped", () => {
    expect(isMapped("GRI 2-12")).toBe(true);
    expect(isMapped("Governance")).toBe(true);
    expect(isMapped("IFRS S1 Para 26; IFRS S2 Para 5")).toBe(true);
    expect(isMapped("ESRS E1")).toBe(true);
  });
});

describe("the sentinel itself", () => {
  it("is an em-dash, not a comma", () => {
    // If this flips, a copy scrub has been run over the source again.
    expect(NO_MAPPING).toBe("—");
    expect(NO_MAPPING).not.toBe(", ");
  });
});

describe("framework coverage counts reflect real mappings", () => {
  const rows = generateFrameworkMappings();

  it("has the full 77-row crosswalk", () => {
    expect(rows).toHaveLength(77);
  });

  it("counts only real counterparts, never the placeholder", () => {
    const n = (pred: (m: (typeof rows)[number]) => boolean) => rows.filter(pred).length;
    // Verified against framework_mappings.json + the two sparse overlays.
    expect(n((m) => isMapped(m.gri_standard))).toBe(75);
    expect(n((m) => isMapped(m.tcfd_pillar))).toBe(37);
    expect(n((m) => isMapped(m.ifrs_reference))).toBe(48);
    expect(n((m) => isMapped(m.tnfd_pillar))).toBe(16);
    expect(n((m) => isMapped(m.esrs_standard))).toBe(74);
  });

  it("never claims coverage it does not have", () => {
    // The pre-fix bug: naive truthiness counted the em-dash rows as mapped.
    const naive = rows.filter((m) => !!m.tcfd_pillar).length;
    const real = rows.filter((m) => isMapped(m.tcfd_pillar)).length;
    expect(naive).toBe(77);
    expect(real).toBeLessThan(naive);
  });

  it("still gives every disclosure at least one counterpart", () => {
    const orphans = rows.filter(
      (m) =>
        !isMapped(m.gri_standard) && !isMapped(m.tcfd_pillar) && !isMapped(m.ifrs_reference) &&
        !isMapped(m.tnfd_pillar) && !isMapped(m.esrs_standard)
    );
    expect(orphans).toEqual([]);
  });

  it("does not double the GRI prefix, the data already carries it", () => {
    const gri = rows.filter((m) => isMapped(m.gri_standard));
    expect(gri.length).toBeGreaterThan(0);
    for (const m of gri) {
      expect(m.gri_standard).toMatch(/^GRI /);
      expect(m.gri_standard).not.toMatch(/^GRI GRI /);
    }
  });
});

describe("CSV export blanks unmapped cells", () => {
  const [header, ...body] = buildFrameworkExportRows(generateFrameworkMappings());

  it("exports an empty cell, not a stray em-dash", () => {
    const tcfdCol = header.indexOf("TCFD pillar");
    const esrsCol = header.indexOf("ESRS standard");
    expect(tcfdCol).toBeGreaterThan(-1);
    expect(esrsCol).toBeGreaterThan(-1);
    for (const row of body) {
      expect(row[tcfdCol]).not.toBe("—");
      expect(row[esrsCol]).not.toBe("—");
    }
    // ...and the placeholder appears nowhere in the sheet at all.
    expect(body.flat().filter((c) => c === "—")).toEqual([]);
  });

  it("still exports the real references", () => {
    const tcfdCol = header.indexOf("TCFD pillar");
    expect(body.filter((r) => r[tcfdCol] !== "").length).toBe(37);
  });
});
