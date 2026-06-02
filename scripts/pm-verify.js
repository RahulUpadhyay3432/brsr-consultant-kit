const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const OUT = path.join("scripts/screenshots/pm");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // ── SCENARIO A: No filings selected ────────────────────────────────────────
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(300);
  await page.locator("select").first().selectOption("textile_and_apparel");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await page.locator("button[type='submit']").click();
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report")),
    { timeout: 10000 }
  );
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "01-report-header-tabs.png") });
  console.log("📸 01-report-header-tabs (no filings — shows 3-card output overview)");

  await page.getByRole("button", { name: /Action Plan/i }).first().click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "02-no-filings-warning.png") });
  console.log("📸 02-no-filings-warning (amber callout visible)");

  // ── SCENARIO B: With filings selected ──────────────────────────────────────
  // Clear cache and go back
  await page.locator("button:has-text('New report')").first().click();
  await page.waitForTimeout(300);
  await page.evaluate(() => localStorage.clear());

  // Fill with filings
  await page.locator("select").first().selectOption("textile_and_apparel");
  await page.locator('button[type="button"]:has-text("EPR Registration")').first().click();
  await page.locator('button[type="button"]:has-text("Hazardous Waste")').first().click();
  await page.locator('button[type="button"]:has-text("EU")').first().click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await page.locator("button[type='submit']").click();
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report")),
    { timeout: 10000 }
  );
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "03-report-with-filings.png") });
  console.log("📸 03-report-with-filings (Step 1/2 should show non-zero counts)");

  await page.getByRole("button", { name: /Action Plan/i }).first().click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "04-checklist-with-ready-to-pull.png") });
  console.log("📸 04-checklist-with-ready-to-pull (Ready to pull should be selectable)");

  // ── SCENARIO C: Form with filings prompt ────────────────────────────────────
  await page.locator("button:has-text('New report')").first().click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "05-form-filings-prompt.png") });
  console.log("📸 05-form-filings-prompt (star callout near filings section)");

  await browser.close();
  console.log("✅ Done — scripts/screenshots/pm/");
})();
