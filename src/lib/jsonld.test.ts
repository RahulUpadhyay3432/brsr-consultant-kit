import { describe, it, expect } from "vitest";
import { jsonLdHtml } from "./jsonld";

describe("jsonLdHtml", () => {
  it("escapes < so a value can't break out of a <script> tag", () => {
    const out = jsonLdHtml({ x: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
  });

  it("stays valid JSON that parses back identically", () => {
    const obj = { a: "<b>hi</b>", n: 1, nested: { u: "https://x.co/</script>" } };
    expect(JSON.parse(jsonLdHtml(obj))).toEqual(obj);
  });
});
