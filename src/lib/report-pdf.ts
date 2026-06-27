// Client-side "BRSR data request" PDF — a clean, company-facing brief generated
// in code (jsPDF) and downloaded as a finished file. No browser print, so no
// Chrome header/footer and no extension overlays; runs on-device (nothing
// uploaded). It is NOT the 108-field SEBI dump — it's the gaps, in PLAIN English,
// grouped by who owns the data, as a tick-off checklist. The full formal detail
// lives in the CSV export.
//
// Styled to the Evergreen & Ember "BRSR DATA REQUEST" design. jsPDF can't embed
// Newsreader / Hanken / IBM Plex on this machine, so we map the design's type
// roles onto the built-in PDF fonts: times (serif headings), helvetica (body),
// courier (mono labels). Same hierarchy, zero bundle weight.
import type { ReportOutput } from "@/lib/types";
import { FILING_LABELS, type ExistingFiling } from "@/lib/types";
import plainData from "@/data/brsr_plain_language.json";

const PLAIN = (plainData as { fields: Record<string, string> }).fields;

// Each principle → a plain serif heading, a short mono team chip, and a
// "usually found in … forward to …" subtitle. Sections with no gaps are skipped,
// so a real brief shows only the few teams that actually owe data.
const OWNERS: Record<string, { theme: string; chip: string; found: string }> = {
  P1: { theme: "Governance & ethics", chip: "Company Secretary / Legal", found: "Usually found in board records and compliance registers. Forward to your Company Secretary or Legal team." },
  P2: { theme: "Products & supply chain", chip: "Procurement / Product", found: "Usually found in sourcing, product and lifecycle records. Forward to your Procurement or Product team." },
  P3: { theme: "Workforce & wellbeing", chip: "HR / People team", found: "Usually found in payroll and HR records. Forward this section to your People team." },
  P4: { theme: "Stakeholder engagement", chip: "Sustainability lead", found: "Usually found in stakeholder-engagement records. Forward to your Sustainability lead." },
  P5: { theme: "Human rights", chip: "HR / Legal", found: "Usually found in policy, grievance and due-diligence records. Forward to your HR or Legal team." },
  P6: { theme: "Energy, water & emissions", chip: "Plant / EHS / Energy", found: "Usually found in utility bills, meter readings and fuel logs. Forward to your plant or energy manager." },
  P7: { theme: "Policy advocacy", chip: "Public affairs", found: "Usually found in trade-association and advocacy records. Forward to your Public affairs or Sustainability team." },
  P8: { theme: "Community & inclusive growth", chip: "CSR team", found: "Usually found in CSR spend and project records. Forward to your CSR team." },
  P9: { theme: "Consumer responsibility", chip: "Customer service / Legal", found: "Usually found in complaints and product records. Forward to your Customer service or Legal team." },
};
const ORDER = Object.keys(OWNERS);

type RGB = [number, number, number];
const PAPER: RGB = [248, 250, 249];   // #F8FAF9 near-white
const INK: RGB = [15, 23, 42];        // #0F172A
const BODY: RGB = [63, 74, 68];       // #3F4A44
const SECOND: RGB = [91, 102, 96];    // #5B6660
const MONOGREY: RGB = [138, 147, 141]; // #8A938D
const FOREST: RGB = [15, 30, 51];     // #0F1E33 navy
const LABELGREEN: RGB = [11, 95, 176]; // #0B5FB0 blue
const MINT: RGB = [30, 157, 242];     // #1E9DF2 blue accent
const GOLD: RGB = [194, 135, 27];     // #C2871B
const EMBER: RGB = [242, 103, 74];    // #F2674A coral
const CHIPBG: RGB = [234, 244, 254];  // #EAF4FE
const CALLBORDER: RGB = [205, 226, 246]; // #CDE2F6
const HAIR: RGB = [230, 227, 219];    // #E6E3DB
const DIVIDER: RGB = [240, 238, 231]; // #F0EEE7
const WHITE: RGB = [255, 255, 255];
const NOTEBG: RGB = [247, 245, 239];

const SANS = "helvetica", SERIF = "times", MONO = "courier";
const ptToMm = (pt: number) => pt * 0.3528;

// Indian financial year that has most recently completed as of `d` (BRSR is filed
// for the just-closed FY). e.g. any date Apr 2026–Mar 2027 → "FY 2025–26".
function reportingFy(d: Date): string {
  const m = d.getMonth(); // 0 = Jan
  const endYear = m >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY ${endYear - 1}–${String(endYear).slice(2)}`;
}

export async function downloadReportPdf(report: ReportOutput): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const M = 15;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const cW = pageW - M * 2;
  const BOTTOM = 18; // reserved footer band
  let y = M;

  const d = new Date(report.generatedAt);
  const fy = reportingFy(d);
  const prepared = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const client = report.companyName || "Your company";
  const s = report.summary;
  const total = s.totalDataPoints || 108;

  // ── low-level helpers ───────────────────────────────────────────────────────
  function font(family: string, style: string, size: number, color: RGB) {
    doc.setFont(family, style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  }
  function paintPage() {
    doc.setFillColor(...PAPER);
    doc.rect(0, 0, pageW, pageH, "F");
  }
  // Compact "continued" header for pages 2+; returns the y to start content at.
  function contdHeader(): number {
    logo(M, 12, 7);
    font(SERIF, "normal", 12.5, INK);
    doc.text("Saaksh", M + 9.5, 15.4);
    const sx = M + 9.5 + doc.getTextWidth("Saaksh") + 3;
    doc.setDrawColor(...HAIR); doc.setLineWidth(0.3); doc.line(sx, 11.5, sx, 16.5);
    font(MONO, "normal", 7.5, MONOGREY);
    doc.text("BRSR DATA REQUEST · CONTINUED", sx + 3, 15.2);
    font(SANS, "normal", 9, SECOND);
    doc.text(`${client} · ${fy}`, pageW - M, 15.2, { align: "right" });
    doc.setDrawColor(...HAIR); doc.setLineWidth(0.3); doc.line(M, 20, pageW - M, 20);
    return 27;
  }
  function newPage() {
    doc.addPage();
    paintPage();
    y = contdHeader();
  }
  function space(h: number) {
    if (y + h > pageH - BOTTOM) newPage();
  }
  // Forest rounded-square logo with a white serif "S".
  function logo(x: number, yTop: number, size: number) {
    doc.setFillColor(...FOREST);
    doc.roundedRect(x, yTop, size, size, 1.6, 1.6, "F");
    font(SERIF, "bold", size * 0.62, WHITE);
    doc.text("S", x + size / 2, yTop + size * 0.68, { align: "center" });
  }
  // Right-aligned mono pill (team chip) ending at xRight, top at yTop.
  function chip(label: string, xRight: number, yTop: number) {
    font(MONO, "normal", 7.5, LABELGREEN);
    const tw = doc.getTextWidth(label);
    const padX = 2.6, h = 5.6, w = tw + padX * 2;
    const x = xRight - w;
    doc.setFillColor(...CHIPBG);
    doc.roundedRect(x, yTop, w, h, 2.8, 2.8, "F");
    font(MONO, "normal", 7.5, LABELGREEN);
    doc.text(label, x + padX, yTop + 3.8);
  }
  // A small mint check mark with its lower vertex near (x, vy).
  function tick(x: number, vy: number, color: RGB) {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.55);
    doc.line(x, vy - 1.1, x + 1.1, vy);
    doc.line(x + 1.1, vy, x + 3.3, vy - 3);
  }

  // ── Header (page 1) ─────────────────────────────────────────────────────────
  paintPage();
  logo(M, M, 10);
  font(SERIF, "normal", 17, INK);
  doc.text("Saaksh", M + 13, M + 5);
  font(MONO, "normal", 8, FOREST);
  doc.text("BRSR DATA REQUEST", M + 13, M + 9.6);
  // right block
  font(SANS, "bold", 12.5, INK);
  doc.text(client, pageW - M, M + 4, { align: "right" });
  font(MONO, "normal", 8.5, SECOND);
  doc.text(`Reporting year ${fy}`, pageW - M, M + 9, { align: "right" });
  font(MONO, "normal", 8.5, MONOGREY);
  doc.text(`Prepared ${prepared}`, pageW - M, M + 13.2, { align: "right" });
  // forest rule
  y = M + 17;
  doc.setDrawColor(...FOREST); doc.setLineWidth(0.8); doc.line(M, y, pageW - M, y);
  y += 7;

  // ── Where things stand (summary card) ───────────────────────────────────────
  {
    const H = 22;
    space(H + 2);
    const top = y;
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...HAIR); doc.setLineWidth(0.3);
    doc.roundedRect(M, top, cW, H, 2.2, 2.2, "FD");
    const midBase = top + H / 2 + 1.2;
    font(MONO, "normal", 8, MONOGREY);
    doc.text("WHERE THINGS STAND", M + 7, midBase);

    // a count: dot + bold number + label; returns end x
    const count = (x: number, base: number, color: RGB, n: number, label: string): number => {
      doc.setFillColor(...color); doc.circle(x + 1, base - 1, 1.1, "F");
      let cx = x + 3.6;
      font(SANS, "bold", 10.5, INK); doc.text(String(n), cx, base); cx += doc.getTextWidth(String(n)) + 1.6;
      font(SANS, "normal", 9.5, BODY); doc.text(label, cx, base); cx += doc.getTextWidth(label);
      return cx;
    };
    const cx0 = M + 58;
    const r1 = top + 8.4, r2 = top + 15.4;
    const e = count(cx0, r1, MINT, s.alreadyTracked, "already covered");
    font(SANS, "normal", 9.5, MONOGREY); doc.text("·", e + 3, r1);
    count(e + 6, r1, GOLD, s.partiallyTracked, "to confirm");
    count(cx0, r2, EMBER, s.newDataNeeded, "to provide");
    font(MONO, "normal", 8.5, MONOGREY);
    doc.text(`of ${total} disclosures`, pageW - M - 7, midBase, { align: "right" });
    y = top + H + 6;
  }

  // ── Intro ───────────────────────────────────────────────────────────────────
  font(SANS, "normal", 10, BODY);
  {
    const lines = doc.splitTextToSize(
      "Please provide the items below for this year's Business Responsibility & Sustainability Report. " +
      "We've grouped them by the team that usually holds each one, so you can forward each section to the " +
      "right person. Estimates are fine where exact figures take time, just mark them as estimates.",
      cW
    );
    const lh = ptToMm(10) * 1.45;
    for (const ln of lines) { space(lh); doc.text(ln, M, y + 3); y += lh; }
    y += 5;
  }

  // ── A single tick-box row ────────────────────────────────────────────────────
  function checkItem(label: string, unit: string | null) {
    const unitStr = unit ? unit : "";
    font(MONO, "normal", 8.5, MONOGREY);
    const unitW = unitStr ? doc.getTextWidth(unitStr) : 0;
    font(SANS, "normal", 10, INK);
    const labelMaxW = cW - 7 - (unitW ? unitW + 6 : 0);
    const lines = doc.splitTextToSize(label, labelMaxW);
    const lh = ptToMm(10) * 1.32;
    const rowH = Math.max(lines.length * lh, 5.4) + 4.2;
    space(rowH);
    const top = y;
    // checkbox
    doc.setDrawColor(...INK); doc.setLineWidth(0.45); doc.setFillColor(...WHITE);
    doc.roundedRect(M, top + 0.1, 4.3, 4.3, 1.1, 1.1, "FD");
    // label
    font(SANS, "normal", 10, INK);
    let ty = top + 3.4;
    for (const ln of lines) { doc.text(ln, M + 7, ty); ty += lh; }
    // unit (first line, right)
    if (unitStr) { font(MONO, "normal", 8.5, MONOGREY); doc.text(unitStr, pageW - M, top + 3.4, { align: "right" }); }
    // bottom hairline
    const bottom = top + rowH - 1.6;
    doc.setDrawColor(...DIVIDER); doc.setLineWidth(0.3); doc.line(M, bottom, pageW - M, bottom);
    y = top + rowH;
  }

  // ── What we need, grouped by team ───────────────────────────────────────────
  let first = true;
  let anyGaps = false;
  for (const pid of ORDER) {
    const items = report.checklist.filter(
      (i) => i.principle === pid && (i.status === "new_data_needed" || i.status === "partially_tracked")
    );
    if (!items.length) continue;
    anyGaps = true;
    const o = OWNERS[pid];
    // header block height estimate (heading + subtitle)
    space(20);
    if (!first) y += 3;
    first = false;
    const top = y;
    font(SERIF, "normal", 15, FOREST);
    doc.text(o.theme, M, top + 4.5);
    chip(o.chip, pageW - M, top + 0.2);
    font(SANS, "normal", 9, SECOND);
    const subLines = doc.splitTextToSize(o.found, cW);
    let sy = top + 10;
    for (const ln of subLines) { doc.text(ln, M, sy); sy += ptToMm(9) * 1.32; }
    y = sy + 2.5;
    for (const it of items) {
      const ask = PLAIN[it.id] ?? it.label;
      const note = it.status === "partially_tracked" ? "  (you may already have part of this)" : "";
      checkItem(`${ask}${note}`, it.unit);
    }
    y += 3;
  }
  if (!anyGaps) {
    font(SANS, "normal", 10, SECOND);
    doc.text("Every disclosure appears to be covered by your existing filings, so there's no fresh data to gather.", M, y + 3);
    y += 8;
  }

  // ── Already covered (mint callout) ──────────────────────────────────────────
  const coveredItems = report.checklist
    .filter((i) => i.status === "already_tracked")
    .map((i) => PLAIN[i.id] ?? i.label);
  if (coveredItems.length > 0) {
    const shown = coveredItems.slice(0, 6);
    const filings = report.selectedFilings.filter((f) => f !== "none");
    const intro = filings.length
      ? `We'll pull these from your existing filings (${filings.map((f) => FILING_LABELS[f as ExistingFiling]).join(", ")}), so there's nothing to send for them.`
      : "We'll pull these from the filings already on record, so there's nothing to send for them.";

    // measure callout height — items wrap on a single column (no truncation)
    const lineH = ptToMm(9) * 1.32;
    const gapPer = 1.8;
    font(SANS, "normal", 9, BODY);
    const introLines = doc.splitTextToSize(intro, cW - 16);
    const introH = introLines.length * ptToMm(9) * 1.4;
    const itemW = cW - 16 - 5;
    const wrapped = shown.map((l) => doc.splitTextToSize(l, itemW) as string[]);
    const listLines = wrapped.reduce((a, w) => a + w.length, 0);
    const listH = listLines * lineH + (shown.length - 1) * gapPer;
    const H = 17.5 + introH + 3.5 + listH + 6;
    space(H + 4);
    const top = y;
    doc.setFillColor(...CHIPBG);
    doc.setDrawColor(...CALLBORDER); doc.setLineWidth(0.3);
    doc.roundedRect(M, top, cW, H, 2.6, 2.6, "FD");
    // heading: filled mint circle + white check + serif title
    doc.setFillColor(...MINT); doc.circle(M + 9, top + 9.5, 3, "F");
    doc.setDrawColor(...WHITE); doc.setLineWidth(0.6);
    doc.line(M + 7.6, top + 9.5, M + 8.6, top + 10.5); doc.line(M + 8.6, top + 10.5, M + 10.5, top + 8.1);
    font(SERIF, "normal", 13, FOREST);
    doc.text("Already covered — no action needed", M + 15, top + 11);
    // intro line
    font(SANS, "normal", 9, BODY);
    let iy = top + 17.5;
    for (const ln of introLines) { doc.text(ln, M + 8, iy); iy += ptToMm(9) * 1.4; }
    // single-column list, each item fully wrapped
    let ly = iy + 3.5;
    for (const w of wrapped) {
      tick(M + 8, ly, MINT);
      font(SANS, "normal", 9, BODY);
      let ty = ly + 0.8;
      for (const ln of w) { doc.text(ln, M + 13, ty); ty += lineH; }
      ly = ty + gapPer;
    }
    y = top + H + 6;
  }

  // ── Closing note ────────────────────────────────────────────────────────────
  {
    font(SANS, "normal", 9.5, SECOND);
    const note = "Once each team has filled in their section, send everything back to your Saaksh consultant. " +
      "If anything is unclear, note it next to the item, a rough answer is more useful than a blank. Thank you.";
    const lines = doc.splitTextToSize(note, cW - 14);
    const H = lines.length * ptToMm(9.5) * 1.42 + 9;
    space(H + 2);
    const top = y;
    doc.setFillColor(...NOTEBG);
    doc.setDrawColor(...HAIR); doc.setLineWidth(0.3);
    doc.roundedRect(M, top, cW, H, 2.2, 2.2, "FD");
    font(SANS, "normal", 9.5, SECOND);
    let ty = top + 5.6;
    for (const ln of lines) { doc.text(ln, M + 7, ty); ty += ptToMm(9.5) * 1.42; }
    y = top + H + 4;
  }

  // ── Footer on every page ────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    font(MONO, "normal", 7.5, MONOGREY);
    doc.text("Prepared with Saaksh · cited to SEBI BRSR Format & ICAI (2024)", M, pageH - 9);
    doc.text(`Page ${p} of ${pages}`, pageW - M, pageH - 9, { align: "right" });
  }

  const slug = (report.companyName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  doc.save(slug ? `BRSR-data-request-${slug}.pdf` : "BRSR-data-request.pdf");
}
