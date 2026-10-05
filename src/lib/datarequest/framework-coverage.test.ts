import { describe, it, expect } from "vitest";
import { frameworkCoverage, COVERAGE_SCOPE_NOTE } from "./framework-coverage";
import type { Campaign, Item } from "./types";
import BRIDGE from "@/data/collect_crosswalk_bridge.json";
import FRAMEWORKS from "@/data/framework_mappings.json";
import KB from "@/data/brsr_data_points.json";

// The product claimed a client could collect each number once and have it map
// across BRSR, CDP, EcoVadis and GRESB. The collecting was real; the carrying
// across was not, because the two BRSR numbering conventions collide — P6-E7 is
// greenhouse gases in one and water withdrawal in the other.
//
// collect_crosswalk_bridge.json reconciles them BY HAND, so the only thing
// standing between this feature and a client's GHG figure appearing under a
// water heading is this test file. It checks both sides resolve, and that no
// bridge entry crosses subject matter.

const bridge = (BRIDGE as { bridge: Record<string, { crosswalk_ids: string[]; note: string }> }).bridge;
const unmapped = (BRIDGE as { unmapped: Record<string, string> }).unmapped;
const notReachable = (BRIDGE as { crosswalk_rows_not_reachable: Record<string, string> }).crosswalk_rows_not_reachable;

const crosswalk = new Map(
  (FRAMEWORKS as { mappings: { brsr_id: string; brsr_label: string }[] }).mappings.map((m) => [m.brsr_id, m.brsr_label]),
);

const sectionAIds = new Set(
  (KB as { section_a_general_disclosures: { id: string }[] }).section_a_general_disclosures.map((d) => d.id),
);

const kbLabels = new Map<string, string>();
for (const p of (KB as { principles: { id: string; essential_indicators: { id: string; label: string }[]; leadership_indicators: { id: string; label: string }[] }[] }).principles) {
  for (const i of [...p.essential_indicators, ...p.leadership_indicators]) kbLabels.set(i.id, i.label);
}

/** Crude subject classifier over a label, used only to catch a crossed wire. */
function subjects(label: string): Set<string> {
  const l = label.toLowerCase();
  const s = new Set<string>();
  if (/\bwater|effluent|discharge|zero liquid/.test(l)) s.add("water");
  if (/greenhouse|ghg|scope 1|scope 2|scope 3|tco2|emission intensity|carbon/.test(l)) s.add("ghg");
  if (/energy|electricity|fuel|renewable|joule|pat |designated consumer/.test(l)) s.add("energy");
  if (/waste|hazardous|recycl|landfill|incinerat/.test(l)) s.add("waste");
  if (/biodiversity|ecologically sensitive|national park|sanctuar|wetland/.test(l)) s.add("bio");
  if (/air emission|nox|sox|particulate/.test(l)) s.add("air");
  if (/safety|injur|fatalit|ill health|occupational health/.test(l)) s.add("safety");
  if (/training|career development/.test(l)) s.add("training");
  if (/union|association/.test(l)) s.add("union");
  if (/insurance|retirement|gratuity|provident|maternity|paternity|day care|benefit|well-being|wellbeing/.test(l)) s.add("benefit");
  if (/parental leave|return to work|return-to-work/.test(l)) s.add("parental");
  if (/complaint|grievance/.test(l)) s.add("complaint");
  if (/employees and workers|headcount|turnover rate|women|differently abled/.test(l)) s.add("headcount");
  return s;
}

function item(fieldId: string, label: string, value: string | null): Item {
  // Real enum members, not casts: FieldKind is "value" | "activity" and
  // ContactStatus is "pending" | "partial" | "received".
  return {
    id: `i-${fieldId}`, fieldId, label, unit: "kWh", kind: "value", category: null,
    section: "C", principle: "P6", indicatorType: "essential",
    value, priorValue: null, status: value ? "received" : "pending",
    valueSource: value ? "owner" : null, evidencePath: null, evidenceName: null,
  };
}

function campaign(items: Item[]): Campaign {
  return {
    id: "c1", clientName: "Anonymised Textiles", reportingPeriod: "FY 2025-26",
    deadline: null, createdAt: new Date().toISOString(),
    contacts: [{
      id: "p1", name: "Facilities Manager", email: "f@x.com", token: "t",
      status: "pending", lastEmailedAt: null, remindersSent: 0, receivedAt: null, items,
    }],
  };
}

describe("the bridge between Collect and the crosswalk", () => {
  it("resolves every key against what Collect can actually ask for", () => {
    for (const id of Object.keys(bridge)) {
      // Section A ids are grouped ("SA-20 to SA-21") and live outside the
      // principles array, so they are checked against the request fields.
      const known = kbLabels.has(id) || sectionAIds.has(id);
      expect(known, `${id} is neither an indicator nor a Section A disclosure`).toBe(true);
    }
  });

  it("stays inside the principles it claims to cover", () => {
    // Environment, people, and the Section A rows that carry headcount. Adding
    // another principle means reconciling it by hand first.
    for (const id of Object.keys(bridge)) {
      const ok = id.startsWith("P6-") || id.startsWith("P3-") || id.startsWith("SA-");
      expect(ok, `${id} is outside the declared scope (P6, P3, Section A)`).toBe(true);
    }
  });

  it("resolves every target against the crosswalk", () => {
    for (const [id, entry] of Object.entries(bridge)) {
      expect(entry.crosswalk_ids.length, `${id} maps to nothing`).toBeGreaterThan(0);
      for (const target of entry.crosswalk_ids) {
        expect(crosswalk.has(target), `${id} → ${target} is not a crosswalk row`).toBe(true);
      }
    }
  });

  it("NEVER crosses subject matter — the whole point of the file", () => {
    // This is the test that stops a client's GHG figure rendering under a water
    // heading. If a Collect question is about water, every crosswalk row it
    // feeds must also be about water.
    for (const [id, entry] of Object.entries(bridge)) {
      const label = kbLabels.get(id);
      if (!label) continue; // grouped Section A row; label text is a summary, not a metric
      const from = subjects(label);
      if (from.size === 0) continue; // narrative or unclassifiable; nothing to assert
      for (const target of entry.crosswalk_ids) {
        const to = subjects(crosswalk.get(target)!);
        if (to.size === 0) continue;
        const shared = Array.from(from).some((s) => to.has(s));
        expect(
          shared,
          `${id} ("${kbLabels.get(id)}") → ${target} ("${crosswalk.get(target)}") — subjects ${Array.from(from)} vs ${Array.from(to)} do not overlap`,
        ).toBe(true);
      }
    }
  });

  it("documents a reason for every unmapped question, and never both maps and excuses one", () => {
    for (const [id, reason] of Object.entries(unmapped)) {
      expect(kbLabels.has(id), `${id} is not a real indicator`).toBe(true);
      expect(reason.length, `${id} reason is too short`).toBeGreaterThan(40);
      expect(bridge[id], `${id} is both bridged and listed as unmapped`).toBeUndefined();
    }
    for (const [id, reason] of Object.entries(notReachable)) {
      expect(crosswalk.has(id), `${id} is not a crosswalk row`).toBe(true);
      expect(reason.length).toBeGreaterThan(30);
    }
  });

  it("accounts for every P6 and P3 question — bridged or explained, never silently dropped", () => {
    for (const prefix of ["P6-", "P3-"]) {
      const ids = Array.from(kbLabels.keys()).filter((k) => k.startsWith(prefix));
      const missing = ids.filter((id) => !bridge[id] && !unmapped[id]);
      expect(missing, `${prefix} questions neither bridged nor explained`).toEqual([]);
    }
  });
});

describe("framework coverage over a campaign", () => {
  it("turns one submitted energy figure into answers across several frameworks", () => {
    const c = campaign([item("P6-E1", "Details of total energy consumption", "1250000")]);
    const cov = frameworkCoverage(c);

    expect(cov.covered).toHaveLength(1);
    const row = cov.covered[0];
    expect(row.value).toBe("1250000");
    // SEBI's single energy table splits into five crosswalk metrics.
    expect(row.metrics.length).toBe(5);
    // And it should reach several frameworks, including the assessments.
    expect(cov.frameworksReached.length).toBeGreaterThan(2);
    expect(cov.frameworksReached).toContain("GRI");
    for (const a of row.answers) expect(a.reference, `${a.framework} reference`).toBeTruthy();
  });

  it("carries provenance through, so an imported figure is never shown as owner-submitted", () => {
    const i = item("P6-E7", "Provide details of greenhouse gas emissions", "4210");
    i.valueSource = "import";
    const cov = frameworkCoverage(campaign([i]));
    expect(cov.covered[0].valueSource).toBe("import");
    expect(cov.covered[0].ownerName).toBe("Facilities Manager");
  });

  it("reports an unanswered field as awaiting, not as covered", () => {
    const cov = frameworkCoverage(campaign([item("P6-E1", "Total energy consumption", null)]));
    expect(cov.covered).toHaveLength(0);
    expect(cov.awaiting).toHaveLength(1);
  });

  it("treats a blank string as unanswered", () => {
    const cov = frameworkCoverage(campaign([item("P6-E1", "Total energy consumption", "   ")]));
    expect(cov.covered).toHaveLength(0);
    expect(cov.awaiting).toHaveLength(1);
  });

  it("reports a collected-but-unmapped value with its reason instead of hiding it", () => {
    const cov = frameworkCoverage(campaign([item("P6-L8", "How many Green Credits", "500")]));
    expect(cov.covered).toHaveLength(0);
    expect(cov.collectedButUnmapped).toHaveLength(1);
    expect(cov.collectedButUnmapped[0].reason).toMatch(/Green Credit/);
  });

  it("ignores principles that have not been reconciled yet", () => {
    // P5 (human rights) is not bridged, so a value there must not appear at all
    // rather than appear with a guessed mapping.
    const cov = frameworkCoverage(campaign([item("P5-E1", "Human rights training coverage", "88")]));
    expect(cov.covered).toHaveLength(0);
    expect(cov.awaiting).toHaveLength(0);
    expect(cov.collectedButUnmapped).toHaveLength(0);
  });

  it("carries a PEOPLE figure across frameworks — the third thing the email named", () => {
    const cov = frameworkCoverage(campaign([
      item("P3-E11", "Details of safety related incidents", "3"),
    ]));
    expect(cov.covered).toHaveLength(1);
    // The safety-incident table feeds both injuries and ill-health metrics.
    expect(cov.covered[0].metrics.length).toBe(2);
    expect(cov.frameworksReached.length).toBeGreaterThan(0);
  });

  it("reaches headcount through Section A, where BRSR actually asks for it", () => {
    const cov = frameworkCoverage(campaign([
      item("SA-20 to SA-21", "Employees and Workers: details by type, by gender", "1240"),
    ]));
    expect(cov.covered).toHaveLength(1);
    expect(cov.covered[0].metrics.length).toBe(3);
  });

  it("resolves the GHG calculator's suffixed activity inputs to their BRSR question", () => {
    // P6-E1-elec / P6-E1-diesel exist for the emissions calc and must not be
    // dropped just because the id carries a suffix.
    const cov = frameworkCoverage(campaign([item("P6-E1-elec", "Grid electricity purchased", "980000")]));
    expect(cov.covered).toHaveLength(1);
    expect(cov.covered[0].metrics.length).toBe(5);
  });

  it("never repeats the same framework reference twice for one value", () => {
    // P6-L1 feeds three water metrics that share GRI standards; duplicates would
    // make the view look padded.
    const cov = frameworkCoverage(campaign([item("P6-L1", "Water withdrawal in areas of water stress", "12000")]));
    const refs = cov.covered[0].answers.map((a) => `${a.framework}|${a.reference}`);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it("always states the P6-only scope so a partial view is never read as full", () => {
    const cov = frameworkCoverage(campaign([]));
    expect(cov.scopeNote).toBe(COVERAGE_SCOPE_NOTE);
    expect(cov.scopeNote).toMatch(/Principle 6/);
    expect(cov.scopeNote).toMatch(/Principle 3/);
    expect(cov.scopeNote).toMatch(/Section A/);
    expect(cov.scopeNote, "must name what is NOT covered").toMatch(/not yet carried across/);
    expect(cov.covered).toEqual([]);
  });

  it("handles a campaign with no contacts without throwing", () => {
    const c: Campaign = { ...campaign([]), contacts: [] };
    expect(() => frameworkCoverage(c)).not.toThrow();
  });
});
