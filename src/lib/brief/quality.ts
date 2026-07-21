// Content-quality gate for the Brief ingestion: never let a raw, leaked, or
// off-topic LLM summary reach the feed. Catches the exact sentinels
// (LOW_SIGNAL / OFF_TOPIC), the prose the model sometimes writes instead, banned
// openers, and leaked-prompt boilerplate. (Adapted from Kapyn, ESG-scoped.)

export function isBadSummary(text: string): boolean {
  const t = (text ?? "").trim();
  if (!t) return true;
  const lower = t.toLowerCase();
  if (t.split(/\s+/).filter(Boolean).length < 6) return true; // too short to be useful
  return (
    // Exact sentinels
    t === "LOW_SIGNAL" || lower.startsWith("low_signal") ||
    t === "OFF_TOPIC" || lower.startsWith("off_topic") ||
    // Prose off-topic (model writes it out instead of the sentinel)
    lower.includes("not related to esg") ||
    lower.includes("not related to sustainability") ||
    lower.includes("not about esg") ||
    lower.includes("not about sustainability") ||
    lower.includes("this content is not") ||
    lower.includes("is not relevant") ||
    // Banned openers (the prompt forbids them for real stories)
    lower.startsWith("this article") ||
    lower.startsWith("this post") ||
    lower.startsWith("this blog") ||
    lower.startsWith("this release") ||
    // Leaked prompt / scaffolding
    lower.startsWith("as an ai") ||
    lower.startsWith("i cannot") ||
    lower.startsWith("i'm unable") ||
    lower.startsWith("write a ") ||
    lower.startsWith("summary:") ||
    lower.startsWith("the provided") ||
    lower.includes("summarize this article") ||
    lower.includes("the provided text") ||
    // Changelog / tag boilerplate
    /^release:\s/i.test(t) ||
    /\btags:\s*[\w,\s]+$/.test(t) ||
    /refs\s+\S+#\d+/i.test(t)
  );
}
