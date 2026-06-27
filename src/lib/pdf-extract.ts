// Client-side PDF text extraction. The document never leaves the browser, // pdf.js parses the file locally and we only ever keep the extracted text in
// memory. pdf.js is dynamically imported so it stays out of the main bundle and
// only loads when the consultant actually uploads a file.

export interface ExtractedPdf {
  text: string;
  pages: string[];   // per-page text, so chunking can respect page boundaries
  pageCount: number;
}

export async function extractPdfText(file: File): Promise<ExtractedPdf> {
  const pdfjsLib = await import("pdfjs-dist");

  // Worker is served as a static file from /public (copied from pdfjs-dist,
  // version pinned in package.json). Serving it directly avoids webpack/Terser
  // choking on the ESM worker, and keeps it local, no CDN dependency.
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }

  return { text: pages.join("\n"), pages, pageCount: pdf.numPages };
}
