// Serialize an object for embedding inside a <script type="application/ld+json">.
// JSON.stringify does NOT escape "<", so a literal "</script>" appearing in any
// value would close the tag early (a stored-XSS class bug). Replacing "<" with
// its unicode escape neutralizes that while staying valid JSON that crawlers
// parse identically. Defense-in-depth for all JSON-LD blocks.
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
