import { describe, it, expect } from "vitest";
import type { Campaign, Contact, Item } from "./types";
import { buildAssuranceLedger, assuranceStats } from "./assurance";
import { VALUE_SOURCE_LABEL } from "./brsr-meta";

// The assurance ledger is the artifact handed to an assurance provider, so the
// thing under test is not formatting but honesty: a figure the AI importer read out
// of a document must never appear as one the named data owner submitted.

function item(p: Partial<Item>): Item {
  return {
    id: p.id ?? Math.random().toString(36).slice(2),
    fieldId: p.fieldId ?? "P6-E1", label: p.label ?? "Total energy consumption",
    unit: p.unit ?? "GJ", kind: p.kind ?? "value", category: p.category ?? null,
    section: p.section ?? "C", principle: p.principle ?? "P6", indicatorType: p.indicatorType ?? "essential",
    value: p.value ?? null, priorValue: p.priorValue ?? null,
    status: p.status ?? "pending",
    evidencePath: p.evidencePath ?? null, evidenceName: p.evidenceName ?? null,
    valueSource: p.valueSource ?? null,
  };
}
function contact(items: Item[], p: Partial<Contact> = {}): Contact {
  return {
    id: p.id ?? "c1", name: p.name ?? "Priya Sharma", email: p.email ?? "priya@acme.example",
    token: "t", status: p.status ?? "received", lastEmailedAt: null, remindersSent: 0,
    receivedAt: null, items,
  };
}
function campaign(contacts: Contact[]): Campaign {
  return {
    id: "camp", clientName: "Acme", reportingPeriod: "FY 2025-26", deadline: null,
    createdAt: new Date().toISOString(), contacts,
  };
}

const SOURCE_COL = 7; // index of "Value source" in the header

describe("assurance ledger provenance", () => {
  it("puts a Value source column where an assurer will see it", () => {
    const [header] = buildAssuranceLedger(campaign([]));
    expect(header[SOURCE_COL]).toBe("Value source");
  });

  it("labels an owner-submitted figure as owner-submitted", () => {
    const rows = buildAssuranceLedger(
      campaign([contact([item({ value: "21450", status: "received", valueSource: "owner" })])])
    );
    expect(rows[1][SOURCE_COL]).toBe(VALUE_SOURCE_LABEL.owner);
  });

  it("never attributes an AI-imported figure to the named owner", () => {
    // The exact regression: the importer overwrote an item assigned to a real person,
    // so the ledger emitted an AI-extracted number under that person's name.
    const rows = buildAssuranceLedger(
      campaign([contact([item({ value: "21450", status: "received", valueSource: "import" })])])
    );
    const row = rows[1];
    expect(row[SOURCE_COL]).toBe(VALUE_SOURCE_LABEL.import);
    expect(row[SOURCE_COL]).toMatch(/AI-extracted/);
    // The owner column still names who the disclosure is assigned to, which is why
    // the source column has to disambiguate it rather than replace it.
    expect(row[8]).toBe("Priya Sharma");
  });

  it("says 'not recorded' rather than guessing for rows written before migration 003", () => {
    const rows = buildAssuranceLedger(
      campaign([contact([item({ value: "21450", status: "received", valueSource: null })])])
    );
    expect(rows[1][SOURCE_COL]).toBe(VALUE_SOURCE_LABEL.unrecorded);
    expect(rows[1][SOURCE_COL]).not.toBe(VALUE_SOURCE_LABEL.owner);
  });

  it("explains every source label in the footnote, so the CSV stands alone", () => {
    const rows = buildAssuranceLedger(
      campaign([contact([item({ value: "1", status: "received", valueSource: "owner" })])])
    );
    const note = rows[rows.length - 1][0];
    for (const label of Object.values(VALUE_SOURCE_LABEL)) {
      expect(note).toContain(label);
    }
    // It must not claim the older, now-false blanket assurance.
    expect(note).not.toMatch(/Every figure above is a value an owner submitted/);
  });

  it("only ledgers received items that carry a value", () => {
    const rows = buildAssuranceLedger(
      campaign([
        contact([
          item({ fieldId: "P6-E1", value: "1", status: "received", valueSource: "owner" }),
          item({ fieldId: "P6-E3", value: null, status: "pending" }),
          item({ fieldId: "P6-E7", value: "", status: "received" }),
        ]),
      ])
    );
    // header + one data row + spacer + note
    expect(rows.length).toBe(4);
    expect(rows[1][0]).toBe("P6-E1");
  });
});

describe("assuranceStats", () => {
  it("counts collected, evidenced and contributing owners from real items only", () => {
    const stats = assuranceStats(
      campaign([
        contact([
          item({ value: "1", status: "received", valueSource: "owner", evidenceName: "bill.pdf" }),
          item({ value: "2", status: "received", valueSource: "import" }),
          item({ value: null, status: "pending" }),
        ]),
        contact([item({ value: null, status: "pending" })], { id: "c2", email: "b@x.com", name: "Arjun" }),
      ])
    );
    expect(stats).toEqual({ collected: 2, total: 4, withEvidence: 1, owners: 1 });
  });
});
