import { describe, it, expect } from "vitest";
import type { Campaign, Contact, Item } from "./types";
import { REQUEST_FIELDS, fieldsByIds } from "./fields";
import { campaignEmissions, emissionInputs } from "./emissions";
import { buildDraft } from "./draft";
import { dueReminder, MAX_REMINDERS } from "./cadence";

// ── fixtures ──────────────────────────────────────────────────────────────────
function item(p: Partial<Item>): Item {
  return {
    id: p.id ?? Math.random().toString(36).slice(2),
    fieldId: p.fieldId ?? "X", label: p.label ?? "Field", unit: p.unit ?? null,
    kind: p.kind ?? "value", category: p.category ?? null,
    section: p.section ?? null, principle: p.principle ?? null, indicatorType: p.indicatorType ?? null,
    value: p.value ?? null, priorValue: p.priorValue ?? null,
    status: p.status ?? "pending", evidencePath: p.evidencePath ?? null, evidenceName: p.evidenceName ?? null,
  };
}
function contact(items: Item[], p: Partial<Contact> = {}): Contact {
  return {
    id: p.id ?? "c1", name: p.name ?? "Owner", email: p.email ?? "o@x.com",
    token: p.token ?? "t", status: p.status ?? "pending",
    lastEmailedAt: p.lastEmailedAt ?? null, remindersSent: p.remindersSent ?? 0, items,
  };
}
function campaign(contacts: Contact[], p: Partial<Campaign> = {}): Campaign {
  return {
    id: "camp", clientName: p.clientName ?? "Client", reportingPeriod: p.reportingPeriod ?? "FY 2025-26",
    deadline: p.deadline ?? null, createdAt: new Date().toISOString(), contacts,
  };
}
const received = (fieldId: string, value: string, extra: Partial<Item> = {}) =>
  item({ fieldId, value, status: "received", ...extra });

// ── the full BRSR field list (Layer 2) ───────────────────────────────────────
describe("brsrRequestFields", () => {
  it("flattens the full BRSR format with the activity inputs", () => {
    const a = REQUEST_FIELDS.filter((f) => f.section === "A").length;
    const b = REQUEST_FIELDS.filter((f) => f.section === "B").length;
    const activity = REQUEST_FIELDS.filter((f) => f.kind === "activity");
    expect(a).toBe(11);
    expect(b).toBe(12);
    // 7 activity inputs: grid electricity + the six Scope-1 fuels
    expect(activity.map((f) => f.id).sort()).toEqual(
      ["P6-E1-cng", "P6-E1-coal", "P6-E1-diesel", "P6-E1-elec", "P6-E1-fo", "P6-E1-lpg", "P6-E1-petrol"]
    );
    // every activity input sits under Section C / Principle 6
    expect(activity.every((f) => f.section === "C" && f.principle === "P6")).toBe(true);
  });

  it("resolves picked ids to fields carrying their coordinates, dropping unknowns", () => {
    const got = fieldsByIds(["SA-22", "P6-E1-elec", "P3-E1", "DOES-NOT-EXIST"]);
    expect(got.map((f) => f.id)).toEqual(["SA-22", "P6-E1-elec", "P3-E1"]);
    expect(got.find((f) => f.id === "SA-22")!.section).toBe("A");
    expect(got.find((f) => f.id === "P6-E1-elec")!.principle).toBe("P6");
  });
});

// ── emissions auto-calc + attribution (all six fuels) ─────────────────────────
describe("campaignEmissions", () => {
  it("computes Scope 2 from grid and Scope 1 from every fuel", () => {
    const c = campaign([contact([
      received("P6-E1-elec", "1000000"),  // 1,000,000 kWh × 0.710 / 1000 = 710 t
      received("P6-E1-diesel", "10000"),  // 10,000 L × 2.68 / 1000 = 26.8 t
      received("P6-E1-petrol", "5000"),   // 5,000 L × 2.31 / 1000 = 11.55 t
    ])]);
    const r = campaignEmissions(c)!;
    expect(r.scope2_tco2e).toBeCloseTo(710, 3);
    expect(r.scope1_tco2e).toBeCloseTo(38.35, 3);
    expect(r.total_tco2e).toBeCloseTo(748.35, 3);
  });

  it("sums the same activity field across owners and matches the attribution total", () => {
    const c = campaign([
      contact([received("P6-E1-diesel", "10000")], { id: "a", name: "Plant A" }),
      contact([received("P6-E1-diesel", "8000")], { id: "b", name: "Plant B" }),
    ]);
    // 18,000 L × 2.68 / 1000 = 48.24 t — both owners counted, not just the last
    expect(campaignEmissions(c)!.scope1_tco2e).toBeCloseTo(48.24, 3);
    const attributionTotal = emissionInputs(c).reduce((s, i) => s + i.tco2e, 0);
    expect(campaignEmissions(c)!.total_tco2e).toBeCloseTo(attributionTotal, 6);
  });

  it("returns null when no activity data has been collected", () => {
    expect(campaignEmissions(campaign([contact([received("P3-E1", "87")])]))).toBeNull();
  });

  it("ignores pending and non-positive values", () => {
    const c = campaign([contact([
      item({ fieldId: "P6-E1-elec", value: "999", status: "pending" }),
      received("P6-E1-diesel", "0"),
    ])]);
    expect(campaignEmissions(c)).toBeNull();
  });
});

describe("emissionInputs (attribution)", () => {
  it("traces each figure to its factor, scope and submitter", () => {
    const c = campaign([contact([
      received("P6-E1-elec", "1000000"),
      received("P6-E1-cng", "2000"),
    ], { name: "Anita" })]);
    const inputs = emissionInputs(c);
    expect(inputs).toHaveLength(2);
    const elec = inputs.find((i) => i.scope === 2)!;
    expect(elec.tco2e).toBeCloseTo(710, 3);
    expect(elec.factor).toContain("CEA");
    expect(elec.submittedBy).toBe("Anita");
    const cng = inputs.find((i) => i.scope === 1)!;
    expect(cng.tco2e).toBeCloseTo(2000 * 1.96 / 1000, 5);
    expect(cng.factor).toContain("IPCC 2006");
  });
});

// ── deterministic draft (grouping + codes + prior year) ───────────────────────
describe("buildDraft", () => {
  it("groups by Section then Principle, carries codes and prior-year values", () => {
    const c = campaign([contact([
      received("SA-22", "12", { section: "A", label: "Turnover rate", priorValue: "10" }),
      received("P6-E1-elec", "1000000", { section: "C", principle: "P6", label: "Grid electricity", unit: "kWh" }),
      received("P3-E1", "87", { section: "C", principle: "P3", label: "Wellbeing %", unit: "%" }),
      item({ fieldId: "P5-E1", label: "Human rights training", section: "C", principle: "P5", status: "pending" }),
    ])]);
    const d = buildDraft(c);

    // Section A before P3 before P6
    expect(d.sections.map((s) => s.title)).toEqual([
      "Section A · General disclosures", "P3 · Employee wellbeing", "P6 · Environment",
    ]);
    const sa = d.sections[0].lines[0];
    expect(sa.code).toBe("SA-22");
    expect(sa.value).toBe("12");
    expect(sa.prior).toBe("10");

    // emissions computed + a pending field surfaced, nothing fabricated
    expect(d.emissions).not.toBeNull();
    expect(d.collectedCount).toBe(3);
    expect(d.pending).toContain("Human rights training");
  });
});

// ── reminder cadence rule ─────────────────────────────────────────────────────
describe("dueReminder", () => {
  const now = new Date("2026-06-17T00:00:00Z");
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();

  it("never chases a contact that already responded", () => {
    const c = contact([], { status: "received", lastEmailedAt: daysAgo(30), remindersSent: 0 });
    expect(dueReminder(c, campaign([]), now).send).toBe(false);
  });

  it("waits for the interval and caps the count", () => {
    expect(dueReminder(contact([], { lastEmailedAt: daysAgo(1) }), campaign([]), now).send).toBe(false);
    expect(dueReminder(contact([], { lastEmailedAt: daysAgo(4), remindersSent: MAX_REMINDERS }), campaign([]), now).send).toBe(false);
    const ok = dueReminder(contact([], { lastEmailedAt: daysAgo(4), remindersSent: 0 }), campaign([]), now);
    expect(ok).toEqual({ send: true, reminderNo: 1, final: false });
  });

  it("marks the last allowed reminder, or a near deadline, as final", () => {
    const last = dueReminder(contact([], { lastEmailedAt: daysAgo(4), remindersSent: 2 }), campaign([]), now);
    expect(last.final).toBe(true);
    const nearDeadline = dueReminder(
      contact([], { lastEmailedAt: daysAgo(4), remindersSent: 0 }),
      campaign([], { deadline: daysAgo(-1).slice(0, 10) }), // ~tomorrow
      now,
    );
    expect(nearDeadline.final).toBe(true);
  });
});
