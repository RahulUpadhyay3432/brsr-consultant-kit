const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const DIR = path.join(__dirname, "screenshots", "headline");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: false });
  console.log(`  📸 ${name}`);
};

async function fillAndSubmit(page, { industry, filings }) {
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(400);
  await page.locator("select").first().selectOption(industry);
  for (const f of filings) {
    await page.locator(`button[type="button"]:has-text("${f}")`).first().click();
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report")),
    { timeout: 10000 }
  );
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Case 1: With filings selected
  await fillAndSubmit(page, { industry: "textile_and_apparel", filings: ["EPR Registration", "Hazardous Waste", "PAT Scheme"] });
  await shot(page, "01-with-filings");

  // Case 2: No filings
  await fillAndSubmit(page, { industry: "pharmaceuticals", filings: [] });
  await shot(page, "02-no-filings");

  await ctx.close();
  await browser.close();
  console.log("Done —", DIR);
})();
