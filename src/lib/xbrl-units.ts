// Pure unit conversion for the XBRL pre-flight helper. The BRSR XBRL taxonomy
// expects monetary values in absolute rupees; consultants routinely hold figures
// in Lakhs or Crores, which is the most common digit-scaling rejection.

export type Scale = "absolute" | "lakh" | "crore";

export const SCALE_FACTOR: Record<Scale, number> = {
  absolute: 1,
  lakh: 1e5,
  crore: 1e7,
};

export const SCALE_LABEL: Record<Scale, string> = {
  absolute: "Absolute ₹",
  lakh: "₹ Lakhs",
  crore: "₹ Crores",
};

// Parse a possibly-formatted number string (strips grouping commas / spaces).
export function parseAmount(s: string): number {
  const cleaned = (s || "").replace(/[,\s₹]/g, "");
  const v = parseFloat(cleaned);
  return isFinite(v) ? v : 0;
}

// Convert an amount at a given scale to absolute rupees.
export function toAbsoluteInr(amount: number, scale: Scale): number {
  return amount * SCALE_FACTOR[scale];
}

// Indian-grouped absolute-rupee string, no decimals (XBRL monetary entry form).
export function formatInr(value: number): string {
  if (!isFinite(value)) return "0";
  return Math.round(value).toLocaleString("en-IN");
}

// Full sentence form for the result caption, e.g. "5,00,00,000".
export function formatInrWords(value: number): string {
  return formatInr(value);
}
