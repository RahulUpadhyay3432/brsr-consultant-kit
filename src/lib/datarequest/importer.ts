// AI compliance importer (server-only). Reads the text of a client's existing
// report (last year's BRSR / annual report) and pre-fills the figures for the
// BRSR fields a campaign is collecting — as REVIEWABLE SUGGESTIONS a human
// verifies, never an auto-write. Same no-fabrication discipline as narrative.ts:
// the model may only return values literally present in the text, each carrying
// the exact source sentence it came from. Paid tier (an AI call ⇒ text leaves the
// browser, so this never lives in the on-device free tool).
import "server-only";
import { groqComplete } from "./groq";

export type Confidence = "high" | "medium" | "low";

export interface ImportCandidate {
  itemId: string;
  fieldId: string;
  label: string;
  unit: string | null;
}

export interface ImportSuggestion {
  itemId: string;
  fieldId: string;
  label: string;
  unit: string | null;
  value: string;
  source: string; // the exact sentence/line the value was read from
  confidence: Confidence;
}

export interface ImportResult {
  suggestions: ImportSuggestion[];
  truncated: boolean;  // true when the document was longer than we processed
  configured: boolean; // false when no Groq key is set
}

// Bound how much text we send so a long report stays within free-tier limits.
// Honest about the cap (see `truncated`) rather than silently dropping the tail.
const CHUNK_SIZE = 9000;
const MAX_CHUNKS = 6; // ≈ 54k characters processed

const SYSTEM =
  "You extract reported figures from a company sustainability or annual report to pre-fill " +
  "a BRSR data sheet for a human to verify. Rules you MUST follow without exception: " +
  "(1) Extract ONLY values that are literally present in the provided text. Never infer, estimate, " +
  "calculate, or round. If a field's value is not clearly stated in the text, omit that field entirely. " +
  "(2) For every value you return, copy the EXACT sentence or line it came from, verbatim, as the source. " +
  "(3) Map each value to the closest field id from the provided candidate list. Use ONLY ids from that list; " +
  "if nothing in the text matches a candidate, do not return it. " +
  "(4) Return STRICT JSON only — a single array, no prose, no markdown fences. Each element is " +
  '{"fieldId": string, "value": string, "source": string, "confidence": "high"|"medium"|"low"}. ' +
  "Keep the value's number and units exactly as written in the text. " +
  "(5) confidence: high = the text explicitly states this field's value; medium = a likely match but the " +
  "wording differs; low = uncertain. When unsure, use low — but still include the source.";

function userPrompt(candidates: ImportCandidate[], chunk: string): string {
  const list = candidates
    .map((c) => `${c.fieldId} — ${c.label}${c.unit ? ` [${c.unit}]` : ""}`)
    .join("\n");
  return (
    `Candidate BRSR fields (id — label [unit]):\n${list}\n\n` +
    `Report text (excerpt):\n"""\n${chunk}\n"""\n\n` +
    `Return the JSON array of figures you can find for these fields in this excerpt.`
  );
}

interface RawSuggestion {
  fieldId: string;
  value: string;
  source: string;
  confidence: Confidence;
}

// Pull a JSON array out of the model's reply, tolerating ```json fences or stray
// prose. Returns [] on anything unparseable — never throws.
function parseArray(text: string): RawSuggestion[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? (parsed as RawSuggestion[]) : [];
  } catch {
    return [];
  }
}

const RANK: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };

function normConfidence(c: unknown): Confidence {
  return c === "high" || c === "medium" || c === "low" ? c : "low";
}

// Extract candidate-field values from `text`. Best-effort: returns whatever it can
// find, with the source sentence + a confidence per value. Nothing is written here.
export async function extractValues(
  text: string,
  candidates: ImportCandidate[]
): Promise<{ suggestions: ImportSuggestion[]; truncated: boolean }> {
  // Dedupe by fieldId for the prompt; keep fieldId → itemId[] so one extracted
  // value can pre-fill every item that asked for that field (e.g. two owners).
  const byField = new Map<string, ImportCandidate>();
  const itemsByField = new Map<string, string[]>();
  for (const c of candidates) {
    if (!byField.has(c.fieldId)) byField.set(c.fieldId, c);
    const ids = itemsByField.get(c.fieldId) ?? [];
    ids.push(c.itemId);
    itemsByField.set(c.fieldId, ids);
  }
  const promptCandidates = Array.from(byField.values());

  const truncated = text.length > CHUNK_SIZE * MAX_CHUNKS;
  const chunks: string[] = [];
  for (let i = 0; i < text.length && chunks.length < MAX_CHUNKS; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  // Best per fieldId across all chunks (keep the highest-confidence hit).
  const best = new Map<string, RawSuggestion>();
  for (let i = 0; i < chunks.length; i++) {
    const reply = await groqComplete(SYSTEM, userPrompt(promptCandidates, chunks[i]), {
      maxTokens: 1200,
      temperature: 0,
      salt: i,
    });
    if (!reply) continue;
    for (const raw of parseArray(reply)) {
      const fieldId = typeof raw?.fieldId === "string" ? raw.fieldId : "";
      const value = typeof raw?.value === "string" ? raw.value.trim() : "";
      const source = typeof raw?.source === "string" ? raw.source.trim() : "";
      if (!byField.has(fieldId) || !value) continue; // unknown id or empty → drop
      const conf = normConfidence(raw?.confidence);
      const cur = best.get(fieldId);
      if (!cur || RANK[conf] > RANK[cur.confidence]) {
        best.set(fieldId, { fieldId, value, source, confidence: conf });
      }
    }
  }

  // Expand each fieldId hit to one suggestion per item that requested it.
  const suggestions: ImportSuggestion[] = [];
  for (const [fieldId, raw] of Array.from(best.entries())) {
    const meta = byField.get(fieldId)!;
    for (const itemId of itemsByField.get(fieldId) ?? []) {
      suggestions.push({
        itemId,
        fieldId,
        label: meta.label,
        unit: meta.unit,
        value: raw.value,
        source: raw.source,
        confidence: raw.confidence,
      });
    }
  }
  return { suggestions, truncated };
}
