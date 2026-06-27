// Client-side engagement-proposal PDF (jsPDF), generated in code and downloaded, // no browser print, nothing uploaded. Styled to the Evergreen & Ember system, the
// same way report-pdf.ts maps the type roles onto jsPDF's built-in fonts
// (times = serif headings, helvetica = body, courier = mono labels).
import { estimateFee, buildProposalSections, type FeeInputs } from "./proposal";

type RGB = [number, number, number];
const INK: RGB = [20, 32, 27];
const BODY: RGB = [63, 74, 68];
const SECOND: RGB = [91, 102, 96];
const MONOGREY: RGB = [138, 147, 141];
const FOREST: RGB = [14, 74, 54];
const HAIR: RGB = [230, 227, 219];
const CHIPBG: RGB = [227, 247, 240];
const LABELGREEN: RGB = [11, 107, 79];

const SANS = "helvetica", SERIF = "times", MONO = "courier";

function inr(n: number): string {
  return "INR " + Math.round(n).toLocaleString("en-IN");
}

export async function downloadProposalPdf(
  inp: FeeInputs,
  preparedBy?: { name?: string; firm?: string; email?: string; phone?: string }
): Promise<void> {
  const fee = estimateFee(inp);
  const sections = buildProposalSections(inp, fee);

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const M = 16;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const cW = pageW - M * 2;
  let y = M;

  const setColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const draw = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);

  function ensure(space: number) {
    if (y + space > pageH - 20) { footer(); doc.addPage(); y = M; }
  }
  function footer() {
    draw(HAIR); doc.setLineWidth(0.2); doc.line(M, pageH - 14, pageW - M, pageH - 14);
    doc.setFont(MONO, "normal"); doc.setFontSize(7.5); setColor(MONOGREY);
    doc.text("Prepared with Saaksh · saaksh", M, pageH - 9);
    doc.text("A starting estimate from your inputs, adjust to your market.", pageW - M, pageH - 9, { align: "right" });
  }

  // ── Header ──────────────────────────────────────────────────────────────
  fill(FOREST); doc.roundedRect(M, y, 8, 8, 1.5, 1.5, "F");
  doc.setFont(SERIF, "bold"); doc.setFontSize(13); setColor([255, 255, 255]);
  doc.text("S", M + 4, y + 5.7, { align: "center" });
  doc.setFont(SERIF, "normal"); doc.setFontSize(17); setColor(INK);
  doc.text("Saaksh", M + 11, y + 6);
  doc.setFont(MONO, "normal"); doc.setFontSize(8); setColor(MONOGREY);
  doc.text("ENGAGEMENT PROPOSAL", pageW - M, y + 3, { align: "right" });
  doc.setFont(SANS, "normal"); doc.setFontSize(8.5); setColor(SECOND);
  doc.text(`${inp.clientName || "Client"}${inp.reportingPeriod ? "  ·  " + inp.reportingPeriod : ""}`, pageW - M, y + 7.5, { align: "right" });
  y += 11;
  draw(FOREST); doc.setLineWidth(0.5); doc.line(M, y, pageW - M, y);
  y += 9;

  // ── Title ───────────────────────────────────────────────────────────────
  doc.setFont(SERIF, "normal"); doc.setFontSize(22); setColor(INK);
  doc.text("BRSR reporting engagement", M, y);
  y += 9;

  // ── Sections (scope / deliverables / timeline / assumptions) ────────────
  for (const s of sections) {
    ensure(16);
    doc.setFont(MONO, "bold"); doc.setFontSize(8.5); setColor(LABELGREEN);
    doc.text(s.title.toUpperCase(), M, y);
    y += 5.5;
    doc.setFont(SANS, "normal"); doc.setFontSize(9.5); setColor(BODY);
    for (const line of s.body) {
      const wrapped = doc.splitTextToSize(s.title === "Scope" ? line : `•  ${line}`, cW - 2) as string[];
      ensure(wrapped.length * 4.6 + 2);
      doc.text(wrapped, M + (s.title === "Scope" ? 0 : 1), y);
      y += wrapped.length * 4.6 + 1.5;
    }
    y += 4;
  }

  // ── Fee breakdown ───────────────────────────────────────────────────────
  ensure(20);
  doc.setFont(MONO, "bold"); doc.setFontSize(8.5); setColor(LABELGREEN);
  doc.text("FEE ESTIMATE", M, y); y += 6;
  for (const l of fee.lineItems) {
    ensure(11);
    doc.setFont(SANS, "bold"); doc.setFontSize(9.5); setColor(INK);
    doc.text(l.label, M, y);
    doc.text(inr(l.amount), pageW - M, y, { align: "right" });
    y += 4.2;
    doc.setFont(SANS, "normal"); doc.setFontSize(8); setColor(MONOGREY);
    const note = doc.splitTextToSize(l.note, cW - 30) as string[];
    doc.text(note, M, y);
    y += note.length * 3.6 + 2.5;
  }
  // Total
  ensure(12);
  draw(HAIR); doc.setLineWidth(0.3); doc.line(M, y, pageW - M, y); y += 6;
  fill(CHIPBG); doc.roundedRect(pageW - M - 70, y - 4.5, 70, 9, 1.2, 1.2, "F");
  doc.setFont(SANS, "bold"); doc.setFontSize(10.5); setColor(INK);
  doc.text("Estimated total (per engagement)", M, y + 1);
  doc.setFont(SERIF, "bold"); doc.setFontSize(12); setColor(FOREST);
  doc.text(inr(fee.subtotal), pageW - M - 3, y + 1.5, { align: "right" });
  y += 12;

  // ── Prepared by (consultant identity from the on-device profile) ─────────
  if (preparedBy && (preparedBy.name || preparedBy.firm)) {
    ensure(20);
    y += 2;
    draw(HAIR); doc.setLineWidth(0.3); doc.line(M, y, pageW - M, y); y += 6;
    doc.setFont(MONO, "bold"); doc.setFontSize(8.5); setColor(LABELGREEN);
    doc.text("PREPARED BY", M, y); y += 5.5;
    doc.setFont(SANS, "bold"); doc.setFontSize(10.5); setColor(INK);
    doc.text([preparedBy.name, preparedBy.firm].filter(Boolean).join(", "), M, y); y += 4.8;
    const contact = [preparedBy.email, preparedBy.phone].filter(Boolean).join("   ·   ");
    if (contact) {
      doc.setFont(SANS, "normal"); doc.setFontSize(8.5); setColor(SECOND);
      doc.text(contact, M, y); y += 4;
    }
  }

  footer();
  const slug = (inp.clientName || "client").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  doc.save(`saaksh-proposal-${slug || "client"}.pdf`);
}
