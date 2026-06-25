import { chromium } from "playwright";
import { mkdirSync } from "fs";
mkdirSync("form-help", { recursive: true });
const URL = "https://brsr-consultant-kit.vercel.app/";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
const p = await ctx.newPage();
await p.goto(URL, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await p.screenshot({ path: "form-help/1-landing.png" });
console.log("landing CTA present:", (await p.getByRole("button", { name: /Start a free report/i }).count()) > 0);

await p.getByRole("button", { name: /Start a free report/i }).first().click();
await p.waitForTimeout(1300);
await p.screenshot({ path: "form-help/2-form-full.png", fullPage: true });

const genCount = await p.getByRole("button", { name: /Generate BRSR Readiness Report/i }).count();
const filingsCount = await p.getByText(/Existing Compliance Filings/i).count();
console.log("intake form -> Generate button present:", genCount > 0);
console.log("intake form -> Existing Compliance Filings present:", filingsCount > 0);

if (filingsCount > 0) {
  const f = p.getByText(/Existing Compliance Filings/i).first();
  await f.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await p.screenshot({ path: "form-help/3-filings-field.png" });
}
await browser.close();
console.log("DONE");
