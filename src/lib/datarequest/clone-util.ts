// Pure date/period helpers for cloning a collection into the next reporting year.
// Extracted from actions.ts because a "use server" module can only export async
// server actions, so these need their own home to stay unit-testable.

// Shift an ISO date (YYYY-MM-DD) forward one year; null-safe, returns null on garbage.
export function bumpYear(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

// Advance a "FY 2024-25" / "2024-25" reporting period by one year; returns the input
// unchanged if it doesn't contain a parseable year range.
export function nextReportingPeriod(p: string | null): string | null {
  if (!p) return null;
  return p.replace(/(\d{4})\s*[-/]\s*(\d{2,4})/, (_m, y1: string, y2: string) => {
    const a = Number(y1) + 1;
    const b = y2.length === 2 ? String((Number(y2) + 1) % 100).padStart(2, "0") : String(Number(y2) + 1);
    return `${a}-${b}`;
  });
}
