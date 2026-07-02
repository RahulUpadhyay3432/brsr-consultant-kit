// One-time: download the design's Google Fonts as local woff2 files so the app can
// self-host them (this machine can't use next/font/google at build time — SSL).
// Run once:  $env:NODE_TLS_REJECT_UNAUTHORIZED="0"; node scripts/fetch-fonts.mjs
import { writeFileSync, mkdirSync } from "fs";

const OUT = "c:/Users/msi79/brsr-consultant-kit/src/app/fonts";
mkdirSync(OUT, { recursive: true });
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// (family, css2 axis query, output filename). Google returns several @font-face
// blocks per request (one per unicode subset); the latin subset is last.
const JOBS = [
  ["Newsreader", "wght@400", "Newsreader-400.woff2"],
  ["Newsreader", "wght@500", "Newsreader-500.woff2"],
  ["Newsreader", "wght@600", "Newsreader-600.woff2"],
  ["Newsreader", "ital,wght@1,400", "Newsreader-400italic.woff2"],
  ["Hanken Grotesk", "wght@400", "HankenGrotesk-400.woff2"],
  ["Hanken Grotesk", "wght@500", "HankenGrotesk-500.woff2"],
  ["Hanken Grotesk", "wght@600", "HankenGrotesk-600.woff2"],
  ["Hanken Grotesk", "wght@700", "HankenGrotesk-700.woff2"],
];

let ok = 0;
for (const [fam, q, file] of JOBS) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:${q}&display=swap`;
  try {
    const css = await (await fetch(cssUrl, { headers: { "User-Agent": UA } })).text();
    const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
    if (!urls.length) { console.error("NO woff2:", file, "|", css.slice(0, 120)); continue; }
    const buf = Buffer.from(await (await fetch(urls[urls.length - 1], { headers: { "User-Agent": UA } })).arrayBuffer());
    writeFileSync(`${OUT}/${file}`, buf);
    console.log("saved", file, buf.length, "bytes");
    ok++;
  } catch (e) {
    console.error("FAILED", file, e.message);
  }
}
console.log(`\n${ok}/${JOBS.length} fonts saved to src/app/fonts/`);
