// Copies the pdf.js worker from the installed pdfjs-dist package into /public so
// it can be served as a static file (see src/lib/pdf-extract.ts). Runs as a
// prebuild step so the worker always matches the installed package version.
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = join(root, "public", "pdf.worker.min.mjs");

try {
  if (!existsSync(src)) {
    console.warn(`[copy-pdf-worker] source not found at ${src} — skipping (using committed copy).`);
    process.exit(0);
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log("[copy-pdf-worker] copied pdf.worker.min.mjs to /public");
} catch (err) {
  // Never fail the build over this — a committed copy already exists in /public.
  console.warn("[copy-pdf-worker] copy failed, using committed copy:", err.message);
  process.exit(0);
}
