// CBAM document extractor (server-only). Mirrors the BRSR importer's posture:
// extract-ONLY (never infer), grounded in Groq, returns a single best suggestion for
// the screening calculator (which covered good + the production/export quantity, plus
// a specific factor if one is literally stated). Best-effort — never throws.
import "server-only";
import { groqComplete } from "./groq";
import { CBAM_GOODS } from "@/lib/cbam-calculator";

export interface CbamSuggestion {
  goodId: string;
  goodLabel: string;
  unit: string;
  tonnes: number;
  overrideFactor: number | null;
  source: string;
  confidence: "high" | "medium" | "low";
}

const SYSTEM = [
  "You extract ONE figure from a company document to pre-fill a CBAM embedded-emissions screening, for a human to verify.",
  "CBAM covered goods and their ids: " + CBAM_GOODS.map((g) => `${g.id} (${g.label}, measured in ${g.unit})`).join("; ") + ".",
  "Find the production OR EU-export QUANTITY of ONE covered good stated in the text.",
  "Rules you MUST follow: (1) Extract ONLY a value literally present — never infer, estimate, or calculate. (2) Copy the exact sentence it came from, verbatim, as the source. (3) goodId MUST be one of the listed ids. (4) tonnes = the quantity number only (digits, no units, no thousands separators). (5) If a specific embedded-emissions factor (tCO2e per unit) is explicitly stated for that good, return it as factor; otherwise omit factor. (6) confidence: high = explicitly stated; medium = likely; low = uncertain.",
  'Return STRICT JSON only — {"goodId":string,"tonnes":number,"factor":number|null,"source":string,"confidence":"high"|"medium"|"low"} — or {} if no covered-good quantity is present. No prose, no markdown fences.',
].join(" ");

function parseObj(reply: string): Record<string, unknown> | null {
  try {
    const s = reply.indexOf("{");
    const e = reply.lastIndexOf("}");
    if (s < 0 || e < s) return null;
    return JSON.parse(reply.slice(s, e + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Returns the single best covered-good quantity found, or null. Scans the first part
// of the document (screening — not an exhaustive parse).
export async function extractCbam(text: string, salt = 0): Promise<CbamSuggestion | null> {
  const chunk = (text || "").slice(0, 14000);
  if (!chunk.trim()) return null;
  const user = `Document text:\n"""\n${chunk}\n"""\n\nReturn the JSON for the one covered-good quantity you can find.`;
  const reply = await groqComplete(SYSTEM, user, { maxTokens: 250, temperature: 0, salt });
  if (!reply) return null;
  const obj = parseObj(reply);
  if (!obj) return null;

  const g = CBAM_GOODS.find((x) => x.id === String(obj.goodId || ""));
  const tonnes = Number(obj.tonnes);
  if (!g || !Number.isFinite(tonnes) || tonnes <= 0) return null;

  const factorRaw = Number(obj.factor);
  const overrideFactor = Number.isFinite(factorRaw) && factorRaw > 0 ? factorRaw : null;
  const conf = ["high", "medium", "low"].includes(String(obj.confidence))
    ? (obj.confidence as CbamSuggestion["confidence"])
    : "low";

  return {
    goodId: g.id,
    goodLabel: g.label,
    unit: g.unit,
    tonnes,
    overrideFactor,
    source: String(obj.source || ""),
    confidence: conf,
  };
}
