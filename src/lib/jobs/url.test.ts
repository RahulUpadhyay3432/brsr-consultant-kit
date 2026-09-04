import { describe, expect, it } from "vitest";
import { canonicalUrl } from "./url";

describe("canonicalUrl", () => {
  it("collapses the same iimjobs posting seen at different listing positions", () => {
    // Real URLs taken from the live board, where this role was stored nine times.
    const seen = [
      "https://www.iimjobs.com/j/rlg-systems-head-csr-and-esg-1715022?ref=kp_br&jobPos=20",
      "https://www.iimjobs.com/j/rlg-systems-head-csr-and-esg-1715022?ref=kp_br&jobPos=19",
      "https://www.iimjobs.com/j/rlg-systems-head-csr-and-esg-1715022?ref=kp_br&jobPos=8",
    ];
    const unique = new Set(seen.map(canonicalUrl));
    expect(unique.size).toBe(1);
    expect([...unique][0]).toBe(
      "https://www.iimjobs.com/j/rlg-systems-head-csr-and-esg-1715022"
    );
  });

  it("keeps a query param that actually identifies the job", () => {
    // Indeed addresses the posting by `jk` — stripping it would break the link.
    const url = "https://in.indeed.com/viewjob?jk=0aea20fe2600bf0e";
    expect(canonicalUrl(url)).toBe(url);
  });

  it("keeps the identifying param and drops the tracking one alongside it", () => {
    expect(canonicalUrl("https://in.indeed.com/viewjob?jk=abc123def456&from=serp")).toBe(
      "https://in.indeed.com/viewjob?jk=abc123def456&from=serp"
    );
    expect(canonicalUrl("https://in.indeed.com/viewjob?jk=abc123def456&utm_source=nl")).toBe(
      "https://in.indeed.com/viewjob?jk=abc123def456"
    );
  });

  it("strips utm campaign tags", () => {
    expect(canonicalUrl("https://x.com/j/a-1?utm_source=nl&utm_campaign=z")).toBe(
      "https://x.com/j/a-1"
    );
  });

  it("normalises trailing slashes and fragments", () => {
    expect(canonicalUrl("https://www.breatheesg.com/careers/")).toBe(
      "https://www.breatheesg.com/careers"
    );
    expect(canonicalUrl("https://x.com/j/a-1#apply")).toBe("https://x.com/j/a-1");
  });

  it("is idempotent", () => {
    const once = canonicalUrl("https://www.iimjobs.com/j/role-1715022?ref=kp&jobPos=3");
    expect(canonicalUrl(once)).toBe(once);
  });

  it("passes through unparseable input rather than throwing", () => {
    expect(canonicalUrl("not a url")).toBe("not a url");
    expect(canonicalUrl("")).toBe("");
    expect(canonicalUrl(null)).toBe("");
    expect(canonicalUrl(undefined)).toBe("");
  });
});
