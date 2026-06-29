// Lightweight sanity checks for owner-submitted values. WARNS, never blocks and
// never fabricates, the owner can always submit anyway (an estimate may be right).
// Pure + dependency-free so it runs identically in the browser (live, on blur) and,
// later, on the server. Only numeric fields are checked; free-text BRSR answers are
// left alone.

export interface SanityResult {
  level: "ok" | "warn";
  message?: string;
}

// Parse an Indian/Western formatted figure: strips commas, spaces and a trailing
// unit symbol. Returns NaN if there's no number in there.
export function parseLooseNumber(raw: string | null | undefined): number {
  if (raw == null) return NaN;
  const cleaned = String(raw).replace(/,/g, "").replace(/\s/g, "").replace(/%$/, "").trim();
  if (cleaned === "") return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n: number): string {
  // Round to a readable multiplier, e.g. 12.4 or 0.08.
  return n >= 10 ? Math.round(n).toString() : n.toFixed(1).replace(/\.0$/, "");
}

// Fields we treat as numeric: anything with a unit, or a tagged activity input.
export function isNumericField(field: { unit?: string | null; kind?: string }): boolean {
  return !!field.unit || field.kind === "activity";
}

export function validateItemValue(
  field: { unit?: string | null; kind?: string },
  currentRaw: string | null | undefined,
  priorRaw: string | null | undefined
): SanityResult {
  if (!isNumericField(field)) return { level: "ok" };

  const current = parseLooseNumber(currentRaw);
  if (Number.isNaN(current)) {
    // Empty is fine; a non-number where a number is expected is worth a gentle nudge.
    if (currentRaw && currentRaw.trim() !== "") {
      return { level: "warn", message: `This field usually takes a number${field.unit ? ` (${field.unit})` : ""}.` };
    }
    return { level: "ok" };
  }

  if (current < 0) {
    return { level: "warn", message: "That's a negative value, please double-check." };
  }

  const prior = parseLooseNumber(priorRaw);
  if (!Number.isNaN(prior) && prior > 0) {
    const ratio = current / prior;
    if (ratio >= 10) {
      return { level: "warn", message: `That's about ${fmt(ratio)}× last year's figure, please double-check the value and unit.` };
    }
    if (ratio <= 0.1) {
      return { level: "warn", message: `That's only about ${fmt(ratio * 100)}% of last year's figure, please double-check.` };
    }
  }

  return { level: "ok" };
}
