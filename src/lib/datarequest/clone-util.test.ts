import { describe, it, expect } from "vitest";
import { bumpYear, nextReportingPeriod } from "./clone-util";

describe("bumpYear", () => {
  it("shifts an ISO date forward one year", () => {
    expect(bumpYear("2026-09-30")).toBe("2027-09-30");
  });
  it("handles a leap day by rolling to Feb 28", () => {
    expect(bumpYear("2028-02-29")).toBe("2029-03-01");
  });
  it("is null-safe and rejects garbage", () => {
    expect(bumpYear(null)).toBeNull();
    expect(bumpYear("not a date")).toBeNull();
  });
});

describe("nextReportingPeriod", () => {
  it("advances a FY YYYY-YY label", () => {
    expect(nextReportingPeriod("FY 2024-25")).toBe("FY 2025-26");
  });
  it("advances a bare YYYY-YY range", () => {
    expect(nextReportingPeriod("2024-25")).toBe("2025-26");
  });
  it("advances a full YYYY-YYYY range", () => {
    expect(nextReportingPeriod("2024-2025")).toBe("2025-2026");
  });
  it("rolls the century boundary", () => {
    expect(nextReportingPeriod("FY 2099-00")).toBe("FY 2100-01");
  });
  it("returns input unchanged when there's no parseable year", () => {
    expect(nextReportingPeriod("this year")).toBe("this year");
    expect(nextReportingPeriod(null)).toBeNull();
  });
});
