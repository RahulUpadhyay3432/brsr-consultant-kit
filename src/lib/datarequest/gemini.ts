// Gemini client (server-only) for whole-document extraction. Gemini Flash has a huge
// context window, so a large chunk (or a whole report) goes in one call. Same SDK-free,
// best-effort, never-throws posture as groq.ts. Keys never leave the server.
import "server-only";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const endpoint = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

// All configured Gemini keys, in order. Trim stray whitespace / wrapping quotes (env
// values pasted from a table can carry them), and require a plausible length.
function keys(): string[] {
  return [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3]
    .map((k) => k?.trim().replace(/^["']|["']$/g, ""))
    .filter((k): k is string => !!k && k.length > 20);
}

export function geminiConfigured(): boolean {
  return keys().length > 0;
}

// Best-effort JSON completion. Rotates keys from `salt` so a rate-limited key falls
// through to the next. Returns the model text (JSON), or null if none produced output.
export async function geminiComplete(
  system: string,
  user: string,
  opts: { maxOutputTokens?: number; salt?: number } = {}
): Promise<string | null> {
  const ks = keys();
  if (ks.length === 0) return null;
  const start = (((opts.salt ?? 0) % ks.length) + ks.length) % ks.length;

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: opts.maxOutputTokens ?? 8192,
      responseMimeType: "application/json",
    },
  });

  for (let i = 0; i < ks.length; i++) {
    const key = ks[(start + i) % ks.length];
    try {
      const res = await fetch(endpoint(key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts;
        const text = Array.isArray(parts)
          ? parts.map((p: { text?: string }) => p?.text || "").join("")
          : "";
        if (text && text.trim()) return text;
        // empty (safety block / no content) → try the next key
        continue;
      }
      // 429 rate-limited / 400 / 403 / 5xx → try the next key. Log anything else.
      if (![429, 400, 403, 500, 503].includes(res.status)) {
        // eslint-disable-next-line no-console
        console.error(`[gemini] ${res.status}: ${(await res.text().catch(() => "")).slice(0, 160)}`);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[gemini] error:", e instanceof Error ? e.message : e);
    }
  }
  return null;
}
