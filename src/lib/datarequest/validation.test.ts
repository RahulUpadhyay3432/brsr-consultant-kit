import { describe, it, expect } from "vitest";
import { validateItemValue, parseLooseNumber } from "./validation";

const elec = { unit: "kWh", kind: "activity" };
const text = { unit: null, kind: "value" };

describe("parseLooseNumber", () => {
  it("strips Indian comma grouping", () => {
    expect(parseLooseNumber("1,02,000")).toBe(102000);
  });
  it("strips a trailing percent and spaces", () => {
    expect(parseLooseNumber(" 82 %")).toBe(82);
  });
  it("returns NaN for non-numbers and empty", () => {
    expect(Number.isNaN(parseLooseNumber(""))).toBe(true);
    expect(Number.isNaN(parseLooseNumber("Yes"))).toBe(true);
    expect(Number.isNaN(parseLooseNumber(null))).toBe(true);
  });
});

describe("validateItemValue", () => {
  it("ignores free-text (no-unit) fields entirely", () => {
    expect(validateItemValue(text, "anything goes", null).level).toBe("ok");
  });
  it("passes a sane figure with no prior", () => {
    expect(validateItemValue(elec, "1,00,000", null).level).toBe("ok");
  });
  it("passes a figure within a normal range of prior", () => {
    expect(validateItemValue(elec, "1,10,000", "1,00,000").level).toBe("ok");
  });
  it("warns when a number is 10x+ the prior year", () => {
    const r = validateItemValue(elec, "12,00,000", "1,00,000");
    expect(r.level).toBe("warn");
    expect(r.message).toMatch(/last year/i);
  });
  it("warns when a number collapses to <=10% of prior", () => {
    expect(validateItemValue(elec, "8,000", "1,00,000").level).toBe("warn");
  });
  it("warns on a negative value", () => {
    expect(validateItemValue(elec, "-50", null).level).toBe("warn");
  });
  it("warns when a unit field gets non-numeric text", () => {
    expect(validateItemValue(elec, "lots", null).level).toBe("warn");
  });
  it("treats empty current value as ok", () => {
    expect(validateItemValue(elec, "", "1,00,000").level).toBe("ok");
  });
});
