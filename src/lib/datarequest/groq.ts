// Groq client (server-only) for the AI narrative draft. Uses Groq's
// OpenAI-compatible endpoint via raw fetch — same SDK-free, best-effort,
// never-throws posture as email.ts/db.ts. The API key never leaves the server.
import "server-only";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
// gpt-oss-20b: cheapest current model with faithful grounded output (validated).
// Override with GROQ_MODEL if needed.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

// All configured keys, in order. Rotating across them spreads Groq's per-key
// free-tier rate limits (the user provisioned six).
function keys(): string[] {
  return [
    process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2, process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4, process.env.GROQ_API_KEY_5, process.env.GROQ_API_KEY_6,
  ]
    // Trim stray whitespace + strip wrapping quotes before validating — env values
    // pasted from a table can carry a leading space or quotes, which would otherwise
    // fail the gsk_ check and silently disable every AI feature.
    .map((k) => k?.trim().replace(/^["']|["']$/g, ""))
    .filter((k): k is string => !!k && k.startsWith("gsk_"));
}

export function groqConfigured(): boolean {
  return keys().length > 0;
}

// Best-effort chat completion. Tries keys starting at `salt` so a free-tier 429 on
// one key falls through to the next. Never throws — returns the assistant text, or
// null if no key produced output (caller treats null as "skip / not configured").
export async function groqComplete(
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number; salt?: number } = {}
): Promise<string | null> {
  const ks = keys();
  if (ks.length === 0) return null;
  const start = (((opts.salt ?? 0) % ks.length) + ks.length) % ks.length;

  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: opts.maxTokens ?? 350,
    temperature: opts.temperature ?? 0.3,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  // gpt-oss reasons internally and those tokens count toward output. We want
  // grounded prose, not analysis, so keep reasoning minimal — cheaper, and it
  // stops the visible answer being starved of tokens.
  if (MODEL.includes("gpt-oss")) body.reasoning_effort = "low";
  const payload = JSON.stringify(body);

  for (let i = 0; i < ks.length; i++) {
    const key = ks[(start + i) % ks.length];
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: payload,
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        return typeof text === "string" && text.trim() ? text.trim() : null;
      }
      // 429 rate-limited / 401-403 bad key → just try the next key. Log anything else.
      if (![429, 401, 403].includes(res.status)) {
        // eslint-disable-next-line no-console
        console.error(`[groq] ${res.status}: ${(await res.text().catch(() => "")).slice(0, 160)}`);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[groq] error:", e instanceof Error ? e.message : e);
    }
  }
  return null;
}
