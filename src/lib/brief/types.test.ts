import { describe, it, expect } from "vitest";
import {
  regTagToCategory,
  relativeTime,
  BRIEF_CATEGORIES,
  CATEGORY_DEFINITIONS,
  CATEGORY_BY_SLUG,
} from "./types";

describe("regTagToCategory", () => {
  it("maps curated regulatory tags to Brief categories", () => {
    expect(regTagToCategory("CBAM")).toBe("cbam");
    expect(regTagToCategory("CCTS")).toBe("carbon-markets");
    expect(regTagToCategory("BRSR Core")).toBe("assurance");
    expect(regTagToCategory("SEBI")).toBe("brsr");
    expect(regTagToCategory("BRSR")).toBe("brsr");
    expect(regTagToCategory("GHG")).toBe("brsr");
    expect(regTagToCategory("ESRS")).toBe("global");
    expect(regTagToCategory("CDP")).toBe("global");
  });
});

describe("relativeTime", () => {
  const now = Date.parse("2026-07-20T12:00:00Z");
  it("buckets recent timestamps", () => {
    expect(relativeTime("2026-07-20T11:59:40Z", now)).toBe("just now");
    expect(relativeTime("2026-07-20T11:30:00Z", now)).toBe("30m ago");
    expect(relativeTime("2026-07-20T09:00:00Z", now)).toBe("3h ago");
    expect(relativeTime("2026-07-18T12:00:00Z", now)).toBe("2d ago");
    expect(relativeTime("2026-07-06T12:00:00Z", now)).toBe("2w ago");
  });
  it("falls back to a date for older items", () => {
    expect(relativeTime("2026-05-01T12:00:00Z", now)).toMatch(/May/);
  });
  it("is safe on a bad date", () => {
    expect(relativeTime("not-a-date", now)).toBe("");
  });
});

describe("category config", () => {
  it("has a definition and lookup for every category", () => {
    for (const c of BRIEF_CATEGORIES) {
      expect(CATEGORY_DEFINITIONS[c.slug]).toBeTruthy();
      expect(CATEGORY_BY_SLUG[c.slug]).toBe(c);
      expect(c.gradient).toHaveLength(2);
    }
  });
});
