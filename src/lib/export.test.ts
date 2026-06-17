import { describe, it, expect } from "vitest";
import { csvCell, toCsv, exportFilename } from "./export";

describe("csvCell", () => {
  it("passes plain values through unquoted", () => {
    expect(csvCell("Ready to pull")).toBe("Ready to pull");
    expect(csvCell(42)).toBe("42");
    expect(csvCell(null)).toBe("");
  });

  it("quotes and escapes commas, quotes and newlines (RFC 4180)", () => {
    expect(csvCell("a, b")).toBe('"a, b"');
    expect(csvCell('she said "hi"')).toBe('"she said ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("neutralises spreadsheet formula injection", () => {
    // A leading =,+,-,@ is prefixed with ' so Excel treats it as text, not a formula
    expect(csvCell("=SUM(A1:A9)")).toBe("'=SUM(A1:A9)");
    expect(csvCell("@cmd")).toBe("'@cmd");
    expect(csvCell("-1+1")).toBe("'-1+1");
  });
});

describe("toCsv", () => {
  it("joins rows with CRLF and cells with commas", () => {
    expect(toCsv([["Code", "Status"], ["P6-E1", "Collect, fresh"]]))
      .toBe('Code,Status\r\nP6-E1,"Collect, fresh"');
  });
});

describe("exportFilename", () => {
  it("slugifies the client name and appends .csv", () => {
    expect(exportFilename("BRSR-action-plan", "Tata Motors Ltd")).toBe("BRSR-action-plan-tata-motors-ltd.csv");
    expect(exportFilename("BRSR-action-plan")).toBe("BRSR-action-plan.csv");
    expect(exportFilename("BRSR-action-plan", "  ")).toBe("BRSR-action-plan.csv");
  });
});
