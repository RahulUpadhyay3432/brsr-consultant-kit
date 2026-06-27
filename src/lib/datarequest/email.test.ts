import { describe, it, expect } from "vitest";
import { buildRequestEmail } from "./email";

describe("buildRequestEmail, HTML escaping (XSS)", () => {
  const { html, subject } = buildRequestEmail(
    {
      clientName: "<script>alert(1)</script>",
      contactName: "<img src=x onerror=alert(2)>",
      contactEmail: "x@example.com",
      deadline: null,
      reportingPeriod: "FY <b>2025</b>",
      items: [{ label: "Total energy", unit: "GJ" }],
      token: "tok",
    },
    "https://example.com/submit/tok"
  );

  it("escapes a malicious client name in the HTML body", () => {
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("escapes a malicious contact name and reporting period", () => {
    expect(html).not.toContain("<img src=x onerror=alert(2)>");
    expect(html).toContain("&lt;img src=x onerror=alert(2)&gt;");
    expect(html).toContain("FY &lt;b&gt;2025&lt;/b&gt;");
  });

  it("leaves the plain-text subject unescaped (subjects aren't HTML)", () => {
    expect(subject).toContain("<script>alert(1)</script>");
  });
});
