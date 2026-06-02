const { chromium } = require("@playwright/test");
const path = require("path");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(300);
  await page.locator("select").first().selectOption("textile_and_apparel");
  await page.locator('button[type="button"]:has-text("EPR Registration")').first().click();
  await page.locator('button[type="button"]:has-text("Hazardous Waste")').first().click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await page.locator("button[type='submit']").click();
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report")),
    { timeout: 10000 }
  );
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /Action Plan/i }).first().click();
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(200);

  // Full sidebar visible
  await page.screenshot({ path: path.join("scripts/screenshots/audit", "sidebar-01-default.png") });
  console.log("📸 sidebar-01-default");

  // Filtered — "Ready to pull" selected
  await page.locator('button:has-text("Ready to pull")').first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join("scripts/screenshots/audit", "sidebar-02-ready-to-pull.png") });
  console.log("📸 sidebar-02-ready-to-pull");

  // Filter by P6 Environment
  await page.locator('button:has-text("All disclosures")').first().click();
  await page.waitForTimeout(200);
  await page.locator('button:has-text("Environment")').first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join("scripts/screenshots/audit", "sidebar-03-p6-environment.png") });
  console.log("📸 sidebar-03-p6-environment");

  await browser.close();
  console.log("✅ done");
})();
