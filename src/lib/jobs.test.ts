import { describe, expect, it } from "vitest";
import { deDash, realCompany, sortJobs, type Job, type JobSort } from "./jobs";

function job(p: Partial<Job>): Job {
  return {
    id: p.id ?? "x",
    title: p.title ?? "Role",
    company: p.company ?? "Co",
    location: p.location ?? "India",
    category: p.category ?? "other",
    applyUrl: p.applyUrl ?? "https://example.com/j/1",
    postedDate: p.postedDate ?? "2026-01-01",
    ...p,
  } as Job;
}

describe("sortJobs", () => {
  const a = job({ id: "a", company: "Zeta", postedDate: "2026-09-01" });
  const b = job({ id: "b", company: "Alpha", postedDate: "2026-08-01" });
  const c = job({ id: "c", company: "mango", postedDate: "2026-09-03" });
  const featuredOld = job({ id: "f", company: "Beta", postedDate: "2026-07-01", featured: true });
  const all = [b, a, c, featuredOld];
  const ids = (s: JobSort) => sortJobs(all, s).map((j) => j.id);

  it("puts the newest first by default, with featured pinned above", () => {
    expect(ids("newest")).toEqual(["f", "c", "a", "b"]);
  });

  it("reverses cleanly for oldest first, featured included in date order", () => {
    // f 2026-07-01, b 2026-08-01, a 2026-09-01, c 2026-09-03
    expect(ids("oldest")).toEqual(["f", "b", "a", "c"]);
  });

  it("sorts by company name without case tripping it up", () => {
    // "mango" must land between Beta and Zeta, not after them.
    expect(ids("company")).toEqual(["b", "f", "c", "a"]);
  });

  it("ignores the featured pin once an explicit sort is chosen", () => {
    // A pinned card in an A-Z list reads as a bug, so featured must not win here.
    expect(ids("company")[0]).toBe("b");
  });

  it("sends roles with no named employer to the end of an A-Z list", () => {
    const anon = job({ id: "anon", company: "", postedDate: "2026-09-02" });
    expect(sortJobs([anon, ...all], "company").map((j) => j.id)).toEqual(["b", "f", "c", "a", "anon"]);
  });

  it("does not mutate the array it is given", () => {
    const original = [...all];
    sortJobs(all, "company");
    expect(all).toEqual(original);
  });
});

describe("deDash", () => {
  it("replaces a spaced dash used as punctuation with a spaced hyphen", () => {
    expect(deDash("Assistant Manager – Environment")).toBe("Assistant Manager - Environment");
    expect(deDash("Lead — Sustainability")).toBe("Lead - Sustainability");
  });

  it("keeps an unspaced dash tight, so compounds and ranges still read right", () => {
    expect(deDash("Mid–Senior")).toBe("Mid-Senior");
    expect(deDash("3–5 years")).toBe("3-5 years");
    expect(deDash("12–18 LPA")).toBe("12-18 LPA");
  });

  it("leaves ordinary hyphens and clean text alone", () => {
    expect(deDash("Full-time")).toBe("Full-time");
    expect(deDash("Head of ESG")).toBe("Head of ESG");
  });

  it("collapses the double spacing a dash swap can leave behind", () => {
    expect(deDash("Lead  —  ESG")).toBe("Lead - ESG");
  });

  it("passes empty and missing values straight through", () => {
    expect(deDash("")).toBe("");
    expect(deDash(undefined)).toBeUndefined();
  });
});

describe("realCompany", () => {
  it("treats the model's placeholder answers as no company at all", () => {
    // Real values seen on the live board.
    for (const p of ["Unknown", "(Unnamed)", "(Company not specified in text)", "N/A", "None", "Confidential", "Not specified"]) {
      expect(realCompany(p)).toBeUndefined();
    }
  });

  it("keeps real employers whose name merely starts with one of those words", () => {
    // Matching on a prefix would have discarded these.
    expect(realCompany("NA Consulting")).toBe("NA Consulting");
    expect(realCompany("Nonesuch Consulting")).toBe("Nonesuch Consulting");
    expect(realCompany("Northern Arc")).toBe("Northern Arc");
    expect(realCompany("Unknown Ventures Pvt Ltd")).toBe("Unknown Ventures Pvt Ltd");
  });

  it("tidies dashes in the names it keeps, and handles blanks", () => {
    expect(realCompany("Tata – Steel")).toBe("Tata - Steel");
    expect(realCompany("")).toBeUndefined();
    expect(realCompany(undefined)).toBeUndefined();
  });
});
