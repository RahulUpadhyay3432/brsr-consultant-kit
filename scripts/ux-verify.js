const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const OUT = path.join("scripts/screenshots/ux");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(300);

  // Fill form
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

  // 1. Report header with Save as PDF button
  await page.screenshot({ path: path.join(OUT, "01-report-header-pdf-button.png") });
  console.log("📸 01-report-header-pdf-button");

  // 2. Action Plan tab with explainer banner (scroll to see it)
  await page.getByRole("button", { name: /Action Plan/i }).first().click();
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, "02-action-plan-with-explainer.png") });
  console.log("📸 02-action-plan-with-explainer");

  // 3. Materiality tab - full intro
  await page.getByRole("button", { name: /Materiality/i }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "03-materiality-intro.png") });
  console.log("📸 03-materiality-intro");

  // 4. Materiality - scroll down to see the chart
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, "04-materiality-chart.png") });
  console.log("📸 04-materiality-chart");

  // 5. Framework mapper - full intro
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: /Framework Map/i }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "05-framework-intro.png") });
  console.log("📸 05-framework-intro");

  // 6. Framework mapper - expanded row
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, "06-framework-rows.png") });
  console.log("📸 06-framework-rows");

  await browser.close();
  console.log("✅ Done — scripts/screenshots/ux/");
})();
