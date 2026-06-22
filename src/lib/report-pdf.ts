// Client-side "BRSR data request" PDF — a clean, company-facing brief generated
// in code (jsPDF) and downloaded as a finished file. No browser print, so no
// Chrome header/footer and no extension overlays; runs on-device (nothing
// uploaded). It deliberately is NOT the full 108-field dump — it's the gaps,
// grouped by who owns the data and where it comes from, so a company can act on
// it without wading through SEBI jargon. The full detail lives in the CSV export.
import type { ReportOutput } from "@/lib/types";
import { INDUSTRY_LABELS, FILING_LABELS, type IndustryType, type ExistingFiling } from "@/lib/types";

// Each principle → a plain theme + the team that usually owns the data, so the
// brief routes itself to the right person.
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
const MUTED: RGB = [120, 113, 108];
const TEAL: RGB = [0, 116, 90];
const LINE: RGB = [223, 219, 212];

const ptToMm = (pt: number) => pt * 0.3528;

export async function downloadReportPdf(report: ReportOutput): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const M = 16;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const cW = pageW - M * 2;
  let y = M;

  const space = (n: number) => { if (y + n > pageH - M - 4) { doc.addPage(); y = M; } };
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
  function rule() { space(4); doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, y, pageW - M, y); y += 4.5; }

  const date = new Date(report.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const industry = INDUSTRY_LABELS[report.industry as IndustryType] || report.industry;
  const s = report.summary;
  const covered = s.alreadyTracked;

  // ── Header ──────────────────────────────────────────────────────────────────
  write("BRSR CONSULTANT KIT", { size: 8, bold: true, color: TEAL, after: 1 });
  write("BRSR data request", { size: 21, bold: true, after: 1.5 });
  write(`${report.companyName || "Your company"}   ·   ${industry}   ·   FY 2025–26   ·   prepared ${date}`, { size: 9, color: MUTED });
  rule();

  // ── What this is ────────────────────────────────────────────────────────────
  write("What this is", { size: 11, bold: true, after: 1 });
  write(
    `These are the BRSR disclosures we need to prepare your sustainability report. Of 108 disclosures in total, ` +
    `${covered} are already covered by your existing filings, ${s.partiallyTracked} need a quick confirmation, and ` +
    `${s.newDataNeeded} need fresh input from your team. Please gather the items below — estimates are fine where exact figures take time.`,
    { size: 9.5, after: 4 }
  );

  // ── What we need from you ───────────────────────────────────────────────────
  write("What we need from you", { size: 13, bold: true, after: 1 });
  write("Grouped by the team that usually holds each item, so you can forward each section to the right person.", { size: 8.5, color: MUTED, after: 3.5 });

  let anyGaps = false;
  for (const pid of ORDER) {
    const items = report.checklist.filter((i) => i.principle === pid && (i.status === "new_data_needed" || i.status === "partially_tracked"));
    if (!items.length) continue;
    anyGaps = true;
    const o = OWNERS[pid];
    space(18);
    write(o.theme, { size: 11, bold: true, after: 0.5 });
    write(`Usually: ${o.owner}`, { size: 8, color: MUTED, after: 1.8 });
    for (const it of items) {
      const unit = it.unit ? ` (${it.unit})` : "";
      const confirm = it.status === "partially_tracked" ? "   [please confirm — partly on file]" : "";
      write(`•   ${it.label}${unit}${confirm}`, { size: 9, x: M + 2, maxW: cW - 2, after: 0.9 });
    }
    y += 2.5;
  }
  if (!anyGaps) write("Every disclosure appears to be covered by your existing filings — no fresh data needed.", { size: 9.5, color: MUTED, after: 3 });

  // ── Already covered ─────────────────────────────────────────────────────────
  if (covered > 0) {
    const filings = report.selectedFilings.filter((f) => f !== "none");
    space(16);
    write("Already covered — no action needed", { size: 11, bold: true, after: 1 });
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
    doc.setTextColor(150, 145, 138);
    doc.text("Prepared with BRSR Consultant Kit · cited to SEBI BRSR Format & ICAI (2024)", M, pageH - 9);
    doc.text(`${p} / ${pages}`, pageW - M, pageH - 9, { align: "right" });
  }

  const slug = (report.companyName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  doc.save(slug ? `BRSR-data-request-${slug}.pdf` : "BRSR-data-request.pdf");
}
