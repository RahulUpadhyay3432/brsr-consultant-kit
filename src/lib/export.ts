// Client-side CSV export. Generates a working spreadsheet from the report data
// in the browser, no upload, nothing stored, consistent with the free tool's
// "100% on-device" model. Opens directly in Excel / Google Sheets.

type Cell = string | number | null | undefined;

// RFC-4180 quoting + a guard against CSV/formula injection: a cell beginning
// with = + - @ (or tab/CR) is prefixed with a single quote so Excel/Sheets
// treat it as text, not a formula.
export function csvCell(value: Cell): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function toCsv(rows: Cell[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

// Triggers a download of the rows as a UTF-8 CSV (BOM so Excel reads accents
// and the ₂/₃ glyphs correctly).
export function downloadCsv(filename: string, rows: Cell[][]): void {
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// "BRSR-action-plan" + "Tata Motors Ltd" → "BRSR-action-plan-tata-motors-ltd.csv"
export function exportFilename(base: string, clientName?: string): string {
  const slug = (clientName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug ? `${base}-${slug}.csv` : `${base}.csv`;
}
