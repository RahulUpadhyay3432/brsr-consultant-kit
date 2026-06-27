// AI compliance importer (server-only). Reads the text of a client's existing
// report (last year's BRSR / annual report) and pre-fills the figures for the
// BRSR fields a campaign is collecting, as REVIEWABLE SUGGESTIONS a human
// verifies, never an auto-write. Same no-fabrication discipline as narrative.ts:
// the model may only return values literally present in the text, each carrying
// the exact source sentence it came from. Paid tier (an AI call ⇒ text leaves the
// browser, so this never lives in the on-device free tool).
import "server-only";
import { groqComplete } from "./groq";
import { geminiComplete } from "./gemini";
import { REQUEST_FIELDS } from "./fields";

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
  "(4) Return STRICT JSON only, a single array, no prose, no markdown fences. Each element is " +
  '{"fieldId": string, "value": string, "source": string, "confidence": "high"|"medium"|"low"}. ' +
  "Keep the value's number and units exactly as written in the text. " +
  "(5) confidence: high = the text explicitly states this field's value; medium = a likely match but the " +
  "wording differs; low = uncertain. When unsure, use low, but still include the source. " +
  "(6) Keep each 'source' to ONE short sentence, under 160 characters. " +
  "(7) Scan the WHOLE provided text and return EVERY field you can find a value for, do not stop early.";

function userPrompt(
  candidates: ImportCandidate[],
  chunk: string,
  docTypeLabel?: string,
): string {
  const list = candidates
    .map((c) => `${c.fieldId}, ${c.label}${c.unit ? ` [${c.unit}]` : ""}`)
    .join("\n");
  const docLine = docTypeLabel
    ? `This excerpt is from the client's ${docTypeLabel}. Focus on the figures that document type carries.\n\n`
    : "";
  return (
    docLine +
    `Candidate BRSR fields (id, label [unit]):\n${list}\n\n` +
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
// prose. Returns [] on anything unparseable, never throws.
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

// ─── Bulk import: many documents, the full BRSR skeleton, with a verifier pass ──
// Used by the campaign's bulk-import surface (the consultant uploads one or more of
// the client's existing reports). Same grounded extract-only discipline as above,
// plus an anti-hallucination VERIFIER: a suggestion only survives if its value
// string actually appears in its own source text (digits normalised). Each hit
// carries the document it came from and full BRSR coordinates from REQUEST_FIELDS.

export interface BulkSuggestion {
  fieldId: string;
  section: "A" | "B" | "C";
  principle: string | null;
  label: string;
  unit: string | null;
  value: string;
  source: string;   // the exact sentence/line the value was read from
  sourceDoc: string; // the document name the value came from
  confidence: Confidence;
  verified: boolean; // true only if the value literally appears in `source`
}

export interface BulkImportResult {
  suggestions: BulkSuggestion[];
  truncated: boolean;  // true when any document was longer than we processed
  configured: boolean; // false when no Groq key is set
}

// A per-document content category the consultant tags on upload, so extraction is
// scoped to the BRSR sections that document type plausibly contains, and the model
// is told what it's reading. "auto" / undefined = let the model see all fields.
export type DocCategory =
  | "auto"
  | "brsr"
  | "annual"
  | "energy"
  | "hr"
  | "water"
  | "policies"
  | "other";

export interface BulkDoc {
  name: string;
  text: string;
  category?: DocCategory;
}

// Plain-English name for each category, used in the grounded prompt so the model
// focuses on the figures that document type actually carries.
const CATEGORY_LABEL: Record<DocCategory, string> = {
  auto: "company report",
  brsr: "last year's BRSR report",
  annual: "annual report",
  energy: "energy and fuel bills",
  hr: "HR and headcount records",
  water: "water and waste records",
  policies: "policies and governance document",
  other: "company document",
};

// Look up a field's BRSR coordinates in the full request-field skeleton.
const FIELD_META = new Map(REQUEST_FIELDS.map((f) => [f.id, f]));

// Scope the candidate fields to the BRSR sections/principles a given document type
// plausibly contains, sharpening accuracy + cutting the prompt for narrow uploads.
// BRSR / annual / other / auto stay broad (all fields). Returns the same candidate
// objects (a subset), never empties the list (an empty scope falls back to all).
function scopeCandidates(
  candidates: ImportCandidate[],
  category: DocCategory | undefined,
): ImportCandidate[] {
  if (!category || category === "auto" || category === "brsr" || category === "annual" || category === "other") {
    return candidates;
  }
  const inScope = (fieldId: string): boolean => {
    const meta = FIELD_META.get(fieldId);
    const principle = meta?.principle ?? null;
    if (category === "energy") {
      // Energy & emissions live on Principle 6, incl. the P6-E1-* activity inputs.
      return principle === "P6";
    }
    if (category === "hr") {
      // Headcount / wellbeing / human rights → Principles 3 and 5.
      return principle === "P3" || principle === "P5";
    }
    if (category === "water") {
      // Water & waste are Principle 6 indicators.
      return principle === "P6";
    }
    return true;
  };
  const scoped = candidates.filter((c) => inScope(c.fieldId));
  return scoped.length > 0 ? scoped : candidates;
}

// Normalise a string for the verifier: lower-case, and strip the commas/spaces that
// separate digit groups (so "1,240,000" matches "1240000" and "1 240 000").
function normalizeForMatch(s: string): string {
  return s.toLowerCase().replace(/(?<=\d)[,\s](?=\d)/g, "");
}

// Does the extracted value actually appear in the source text it claims to come
// from? Digit-group separators are ignored so formatting differences don't fail a
// genuine match. A value with no source can't be verified → false.
function valueAppearsInSource(value: string, source: string): boolean {
  if (!value || !source) return false;
  return normalizeForMatch(source).includes(normalizeForMatch(value));
}

interface BulkBest {
  fieldId: string;
  value: string;
  source: string;
  sourceDoc: string;
  confidence: Confidence;
}

// Extract candidate-field values across several documents. For each doc, the text is
// chunked and run through the same grounded extract-only prompt; hits are tagged with
// the doc name. Results are merged across all docs by fieldId, keeping the
// highest-confidence hit. A verifier then DROPS any hit whose value doesn't literally
// appear in its source text. Best-effort: never throws.
export async function extractValuesBulk(
  docs: BulkDoc[],
  candidates: ImportCandidate[]
): Promise<{ suggestions: BulkSuggestion[]; truncated: boolean }> {
  // Dedupe candidates by fieldId for the prompt.
  const byField = new Map<string, ImportCandidate>();
  for (const c of candidates) {
    if (!byField.has(c.fieldId)) byField.set(c.fieldId, c);
  }
  const allCandidates = Array.from(byField.values());

  const best = new Map<string, BulkBest>();
  let truncated = false;

  for (const doc of docs) {
    const text = (doc?.text || "").trim();
    if (!text) continue;
    if (text.length > CHUNK_SIZE * MAX_CHUNKS) truncated = true;

    // Scope candidates + name the document type per this doc's category.
    const category = doc?.category;
    const promptCandidates = scopeCandidates(allCandidates, category);
    const docTypeLabel =
      category && category !== "auto" ? CATEGORY_LABEL[category] : undefined;

    const chunks: string[] = [];
    for (let i = 0; i < text.length && chunks.length < MAX_CHUNKS; i += CHUNK_SIZE) {
      chunks.push(text.slice(i, i + CHUNK_SIZE));
    }

    for (let i = 0; i < chunks.length; i++) {
      const reply = await groqComplete(SYSTEM, userPrompt(promptCandidates, chunks[i], docTypeLabel), {
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
          best.set(fieldId, { fieldId, value, source, sourceDoc: doc.name, confidence: conf });
        }
      }
    }
  }

  // Verifier pass + attach BRSR coordinates. Drop anything that doesn't verify.
  const suggestions: BulkSuggestion[] = [];
  for (const [fieldId, raw] of Array.from(best.entries())) {
    if (!valueAppearsInSource(raw.value, raw.source)) continue; // anti-hallucination
    const meta = FIELD_META.get(fieldId);
    const cand = byField.get(fieldId)!;
    suggestions.push({
      fieldId,
      section: meta?.section ?? "C",
      principle: meta?.principle ?? null,
      label: meta?.label ?? cand.label,
      unit: meta?.unit ?? cand.unit ?? null,
      value: raw.value,
      source: raw.source,
      sourceDoc: raw.sourceDoc,
      confidence: raw.confidence,
      verified: true,
    });
  }
  return { suggestions, truncated };
}

// ─── Per-chunk extraction (whole-document, parallel-friendly) ────────────────
// Pull every complete {...} object out of a model reply, even if the surrounding
// array was truncated (long output) or wrapped in prose/fences. String-aware so a
// brace inside a quoted source can't throw off the nesting. Never throws.
function salvageSuggestions(text: string): RawSuggestion[] {
  const out: RawSuggestion[] = [];
  let depth = 0, start = -1, inStr = false, esc = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") { if (depth === 0) start = i; depth++; }
    else if (ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          const obj = JSON.parse(text.slice(start, i + 1));
          if (obj && typeof obj === "object") out.push(obj as RawSuggestion);
        } catch { /* incomplete / invalid object, skip */ }
        start = -1;
      }
    }
  }
  return out;
}

// Extract candidate-field values from ONE chunk of a document. Gemini first (huge
// context, strong at pulling numbers out of messy table text); Groq as fallback.
// Verifier-gated, never throws. Returns verified BulkSuggestions for this chunk only;
// the caller merges across chunks and across documents.
export async function extractFromChunk(
  chunkText: string,
  candidates: ImportCandidate[],
  category?: DocCategory,
  sourceDoc = "document",
): Promise<BulkSuggestion[]> {
  const text = (chunkText || "").trim();
  if (!text) return [];

  const byField = new Map<string, ImportCandidate>();
  for (const c of candidates) if (!byField.has(c.fieldId)) byField.set(c.fieldId, c);
  const promptCandidates = scopeCandidates(Array.from(byField.values()), category);
  const docTypeLabel = category && category !== "auto" ? CATEGORY_LABEL[category] : undefined;
  const prompt = userPrompt(promptCandidates, text, docTypeLabel);

  // Cap output so generation stays fast and well under the function timeout. Chunks
  // are small enough that this fits their figures; the salvaging parser recovers any
  // complete objects if a dense chunk is truncated.
  let reply = await geminiComplete(SYSTEM, prompt, { maxOutputTokens: 4000 });
  if (!reply) reply = await groqComplete(SYSTEM, prompt, { maxTokens: 1800, temperature: 0 });
  if (!reply) return [];

  const out: BulkSuggestion[] = [];
  const seen = new Set<string>();
  for (const raw of salvageSuggestions(reply)) {
    const fieldId = typeof raw?.fieldId === "string" ? raw.fieldId : "";
    const value = raw?.value != null && raw.value !== "" ? String(raw.value).trim() : "";
    const source = typeof raw?.source === "string" ? raw.source.trim() : "";
    if (!byField.has(fieldId) || !value || seen.has(fieldId)) continue;
    if (!valueAppearsInSource(value, source)) continue; // anti-hallucination (lenient)
    seen.add(fieldId);
    const meta = FIELD_META.get(fieldId);
    const cand = byField.get(fieldId)!;
    out.push({
      fieldId,
      section: meta?.section ?? "C",
      principle: meta?.principle ?? null,
      label: meta?.label ?? cand.label,
      unit: meta?.unit ?? cand.unit ?? null,
      value,
      source,
      sourceDoc,
      confidence: normConfidence(raw?.confidence),
      verified: true,
    });
  }
  return out;
}
