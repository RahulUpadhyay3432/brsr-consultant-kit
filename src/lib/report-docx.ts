// On-device Word (.docx) export. Turns a header+rows table (the same data the CSV
// export uses) into an editable Word document consultants can drop into a client
// deliverable. docx is dynamically imported so it stays out of the main bundle.
// Nothing leaves the browser, consistent with the free tool's on-device model.

const FOREST = "0F1E33";
const BRAND = "0B6FD4";
const HEADER_BG = "EAF4FE";

// Build + download a Word doc with a title, optional subtitle, and one table.
export async function downloadTableDocx(opts: {
  filename: string;     // without extension
  title: string;
  subtitle?: string;
  rows: string[][];     // [header, ...body]
  footnote?: string;
}): Promise<void> {
  const docx = await import("docx");
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle,
  } = docx;

  const [header, ...body] = opts.rows.length ? opts.rows : [[""]];

  const thinBorder = { style: BorderStyle.SINGLE, size: 2, color: "D8DEE6" };
  const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

  const headerRow = new TableRow({
    tableHeader: true,
    children: header.map((h) =>
      new TableCell({
        shading: { fill: HEADER_BG },
        borders: cellBorders,
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, color: FOREST })] })],
      })
    ),
  });

  const bodyRows = body.map((r) =>
    new TableRow({
      children: header.map((_, i) =>
        new TableCell({
          borders: cellBorders,
          margins: { top: 50, bottom: 50, left: 90, right: 90 },
          children: [new Paragraph({ children: [new TextRun({ text: r[i] ?? "", size: 18, color: "2A2E34" })] })],
        })
      ),
    })
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });

  const children: InstanceType<typeof Paragraph>[] | unknown[] = [
    new Paragraph({
      children: [new TextRun({ text: opts.title, bold: true, size: 32, color: FOREST })],
      spacing: { after: opts.subtitle ? 80 : 200 },
    }),
    ...(opts.subtitle
      ? [new Paragraph({ children: [new TextRun({ text: opts.subtitle, size: 20, color: "5A6470" })], spacing: { after: 220 } })]
      : []),
    table,
    ...(opts.footnote
      ? [new Paragraph({ children: [new TextRun({ text: opts.footnote, size: 16, color: "8A93A0", italics: true })], spacing: { before: 200 } })]
      : []),
    new Paragraph({
      children: [new TextRun({ text: "Prepared with Saaksh · cited to SEBI BRSR Format & ICAI (2024)", size: 15, color: BRAND })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 240 },
    }),
  ];

  const doc = new Document({ sections: [{ children: children as never }] });
  const blob = await Packer.toBlob(doc);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
