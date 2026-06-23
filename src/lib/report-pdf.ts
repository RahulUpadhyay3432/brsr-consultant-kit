// Client-side "BRSR data request" PDF — a clean, company-facing brief generated
// in code (jsPDF) and downloaded as a finished file. No browser print, so no
// Chrome header/footer and no extension overlays; runs on-device (nothing
// uploaded). It is NOT the 108-field SEBI dump — it's the gaps, in PLAIN English,
// grouped by who owns the data, as a tick-off checklist. The full formal detail
// lives in the CSV export.
import type { ReportOutput } from "@/lib/types";
import { INDUSTRY_LABELS, FILING_LABELS, type IndustryType, type ExistingFiling } from "@/lib/types";
import plainData from "@/data/brsr_plain_language.json";

const PLAIN = (plainData as { fields: Record<string, string> }).fields;

// Each principle → a plain theme + the team that usually owns the data.
const OWNERS: Record<string, { theme: string; owner: string }> = {
  P1: { theme: "Governance & ethics", owner: "Company secretary / Legal — board-approved policies & registers" },
  P2: { theme: "Products & supply chain", owner: "Procurement / Product — sourcing, product & lifecycle records" },
  P3: { theme: "Workforce & wellbeing", owner: "HR — headcount, payroll, training & safety records" },
  P4: { theme: "Stakeholder engagement", owner: "Sustainability lead — engagement records" },
  P5: { theme: "Human rights", owner: "HR / Legal — policies, grievance & due-diligence records" },
  P6: { theme: "Environment — energy, water, waste, emissions", owner: "Plant / EHS / Energy manager — utility & fuel bills, meter readings, waste returns" },
  P7: { theme: "Policy advocacy", owner: "Public affairs / Sustainability" },
  P8: { theme: "Community & inclusive growth", owner: "CSR team — CSR spend & project records" },
  P9: { theme: "Consumer responsibility", owner: "Customer service / Legal — complaints & product records" },
};
const ORDER = Object.keys(OWNERS);

type RGB = [number, number, number];
const INK: RGB = [38, 35, 32];
const MUTED: RGB = [122, 116, 110];
const FAINT: RGB = [150, 145, 138];
const TEAL: RGB = [0, 116, 90];
const LINE: RGB = [223, 219, 212];
const BOXBG: RGB = [243, 241, 234];

const ptToMm = (pt: number) => pt * 0.3528;

export async function downloadReportPdf(report: ReportOutput): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const M = 16;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const cW = pageW - M * 2;
  let y = M;

  const space = (n: number) => { if (y + n > pageH - M - 6) { doc.addPage(); y = M; } };

  function write(str: string, o: { size?: number; bold?: boolean; color?: RGB; x?: number; maxW?: number; after?: number } = {}) {
    const size = o.size ?? 9.5;
    doc.setFont("helvetica", o.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(o.color ?? INK));
    const lh = ptToMm(size) * 1.32;
    for (const ln of doc.splitTextToSize(str, o.maxW ?? cW)) {
      space(lh);
      doc.text(ln, o.x ?? M, y);
      y += lh;
    }
    if (o.after) y += o.after;
  }

  // A tick-box checklist item — small square + plain wrapped text, kept together.
  function checkItem(str: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(str, cW - 7);
    const lh = ptToMm(9.5) * 1.35;
    space(lines.length * lh + 2);
    doc.setDrawColor(175, 170, 163);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y - 2.7, 3.1, 3.1, 0.5, 0.5);
    let ty = y;
    for (const ln of lines) { doc.text(ln, M + 6, ty); ty += lh; }
    y = ty + 2;
  }

  const date = new Date(report.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const industry = INDUSTRY_LABELS[report.industry as IndustryType] || report.industry;
  const s = report.summary;
  const covered = s.alreadyTracked;

  // ── Header ──────────────────────────────────────────────────────────────────
  write("SAAKSH", { size: 8, bold: true, color: TEAL, after: 1 });
  write("BRSR data request", { size: 22, bold: true, after: 1.5 });
  write(`${report.companyName || "Your company"}   ·   ${industry}   ·   FY 2025–26   ·   prepared ${date}`, { size: 9, color: MUTED, after: 3 });

  // ── Where things stand (summary box) ────────────────────────────────────────
  space(17);
  const by = y;
  doc.setFillColor(...BOXBG);
  doc.roundedRect(M, by, cW, 14, 1.6, 1.6, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...INK);
  doc.text("Where things stand", M + 5, by + 5.4);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...MUTED);
  doc.text(`${covered} already covered    ·    ${s.partiallyTracked} to confirm    ·    ${s.newDataNeeded} to provide   (of 108 disclosures)`, M + 5, by + 10.2);
  y = by + 14 + 5;

  // ── Intro ───────────────────────────────────────────────────────────────────
  write(
    "Please provide the items below. We have grouped them by the team that usually has each one, so you can forward " +
    "each section to the right person and tick items off as you gather them. Estimates are fine where exact figures take time.",
    { size: 9.5, color: INK, after: 5 }
  );

  // ── What we need, grouped by team ───────────────────────────────────────────
  let first = true;
  let anyGaps = false;
  for (const pid of ORDER) {
    const items = report.checklist.filter((i) => i.principle === pid && (i.status === "new_data_needed" || i.status === "partially_tracked"));
    if (!items.length) continue;
    anyGaps = true;
    const o = OWNERS[pid];
    space(20);
    if (!first) { doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, y, pageW - M, y); y += 5; }
    first = false;
    write(o.theme, { size: 11.5, bold: true, color: INK, after: 0.4 });
    write(`Usually handled by: ${o.owner}`, { size: 8, color: FAINT, after: 2.5 });
    for (const it of items) {
      const ask = PLAIN[it.id] ?? it.label;
      const confirm = it.status === "partially_tracked" ? "   (you may already have part of this)" : "";
      checkItem(`${ask}${confirm}`);
    }
    y += 3;
  }
  if (!anyGaps) write("Every disclosure appears to be covered by your existing filings — no fresh data needed.", { size: 9.5, color: MUTED, after: 3 });

  // ── Already covered ─────────────────────────────────────────────────────────
  if (covered > 0) {
    const filings = report.selectedFilings.filter((f) => f !== "none");
    space(18);
    doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, y, pageW - M, y); y += 5;
    write("Already covered — no action needed", { size: 11.5, bold: true, after: 1 });
    write(
      `${covered} disclosure${covered === 1 ? " is" : "s are"} already covered by your existing filings` +
      `${filings.length ? ` (${filings.map((f) => FILING_LABELS[f as ExistingFiling]).join(", ")})` : ""}. ` +
      `We will pull these directly, so there is no need to re-gather them.`,
      { size: 9, color: MUTED, after: 2 }
    );
  }

  // ── Footer on every page ────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...FAINT);
    doc.text("Prepared with Saaksh · cited to SEBI BRSR Format & ICAI (2024)", M, pageH - 9);
    doc.text(`${p} / ${pages}`, pageW - M, pageH - 9, { align: "right" });
  }

  const slug = (report.companyName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  doc.save(slug ? `BRSR-data-request-${slug}.pdf` : "BRSR-data-request.pdf");
}
