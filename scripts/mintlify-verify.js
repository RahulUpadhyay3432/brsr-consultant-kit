const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const OUT = path.join("scripts/screenshots/mintlify");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(400);

  // ── 1. Hero / form (above fold) ──────────────────────────────────────────────
  await page.screenshot({ path: path.join(OUT, "01-hero.png") });
  console.log("📸 01-hero");

  // ── 2. Full form (scroll to bottom to see all chips + submit) ────────────────
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "02-form-bottom.png") });
  console.log("📸 02-form-bottom");

  // ── 3. Select some chips to show mint active state ───────────────────────────
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  await page.locator("select").first().selectOption("textile_and_apparel");
  // Select a few process chips
  await page.locator('button[type="button"]:has-text("Spinning")').first().click();
  await page.locator('button[type="button"]:has-text("Weaving")').first().click();
  await page.waitForTimeout(100);
  // Export markets
  await page.locator('button[type="button"]:has-text("EU")').first().click();
  await page.locator('button[type="button"]:has-text("USA")').first().click();
  await page.waitForTimeout(100);
  // Filings
  await page.locator('button[type="button"]:has-text("EPR Registration")').first().click();
  await page.locator('button[type="button"]:has-text("Hazardous Waste")').first().click();
  await page.waitForTimeout(100);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, "03-form-chips-selected.png") });
  console.log("📸 03-form-chips-selected");

  // ── 4. Submit and see report header ─────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);
  await page.locator("button[type='submit']").click();
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report")),
    { timeout: 10000 }
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "04-report-header.png") });
  console.log("📸 04-report-header");

  // ── 5. Active tab (mint underline) ──────────────────────────────────────────
  await page.locator("button:has-text('Materiality')").first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "05-materiality-active-tab.png") });
  console.log("📸 05-materiality-active-tab");

  // ── 6. Framework mapper (3rd tab) ───────────────────────────────────────────
  await page.locator("button:has-text('Framework Map')").first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "06-framework-mapper.png") });
  console.log("📸 06-framework-mapper");

  await browser.close();
  console.log("✅ Done — screenshots in scripts/screenshots/mintlify/");
})();
