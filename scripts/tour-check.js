const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const DIR = path.join(__dirname, "screenshots", "tour");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: false });
  console.log(`  📸 ${name}`);
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Load report with filings
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(400);
  await page.locator("select").first().selectOption("textile_and_apparel");
  await page.locator('button[type="button"]:has-text("EPR Registration")').first().click();
  await page.waitForTimeout(80);
  await page.locator('button[type="button"]:has-text("Hazardous Waste")').first().click();
  await page.waitForTimeout(80);
  await page.locator('button[type="button"]:has-text("PAT Scheme")').first().click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report")),
    { timeout: 10000 }
  );
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  // 1. Default view — "What do Step 1, 2, 3 mean?" link visible
  await shot(page, "01-default-with-link");

  // 2. Click "What does this mean?" on Step 1 column
  await page.getByText("What does this mean?").first().click();
  await page.waitForTimeout(400);
  await shot(page, "02-tour-step1-open");

  // 3. Click Next → Step 2
  await page.getByRole("button", { name: /Next/i }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "03-tour-step2");

  // 4. Click Next → Step 3
  await page.getByRole("button", { name: /Next/i }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "04-tour-step3");

  // 5. Click "Got it" → tour closes
  await page.getByRole("button", { name: /Got it/i }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "05-tour-closed");

  // 6. Open tour from the "What do Step 1, 2, 3 mean?" bottom link
  await page.getByText("What do Step 1, 2, 3 mean?").first().click();
  await page.waitForTimeout(400);
  await shot(page, "06-tour-from-bottom-link");

  await ctx.close();
  await browser.close();
  console.log("Done —", DIR);
})();
