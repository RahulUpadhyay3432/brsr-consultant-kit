/**
 * Visual inspection script — loads the report and takes full-resolution
 * screenshots of each view: top, scrolled into checklist, sidebar filter,
 * row expanded, and the other tabs.
 */

const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE_URL = "http://localhost:3000";
const DIR = path.join(__dirname, "screenshots", "visual");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const shot = async (page, name) => {
  const file = path.join(DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false }); // viewport only for crisp shots
  console.log(`  📸 ${name}.png`);
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Clear localStorage and load
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());

  // Fill form: Textile + all three filings
  await page.locator('input[type="text"]').first().fill("Apex Textiles Ltd");
  await page.locator("select").first().selectOption("textile_and_apparel");
  await page.getByText("Listed — Top 1000 by market cap", { exact: true }).click();
  await page.getByText("First-time filing", { exact: true }).click();
  await page.locator('button[type="button"]:has-text("EU")').first().click();
  await page.waitForTimeout(100);
  await page.locator('button[type="button"]:has-text("EPR Registration")').first().click();
  await page.waitForTimeout(100);
  await page.locator('button[type="button"]:has-text("Hazardous Waste")').first().click();
  await page.waitForTimeout(100);
  await page.locator('button[type="button"]:has-text("PAT Scheme")').first().click();
  await page.waitForTimeout(100);

  // Submit
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report"))
  , { timeout: 10000 });
  await page.waitForTimeout(600);

  // 1. Report top — summary card + tabs
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "01-report-summary");

  // 2. Scroll into the checklist table
  await page.evaluate(() => window.scrollTo(0, 300));
  await shot(page, "02-checklist-table-top");

  // 3. Click sidebar "Ready to pull" filter
  await page.getByText("Ready to pull").first().click();
  await page.waitForTimeout(300);
  await shot(page, "03-sidebar-ready-filter");

  // 4. Click sidebar "Needs verification"
  await page.getByText("Needs verification").first().click();
  await page.waitForTimeout(300);
  await shot(page, "04-sidebar-verify-filter");

  // 5. Back to all, click P6 Environment principle
  await page.getByText("All items").first().click();
  await page.waitForTimeout(200);
  await page.getByText("Environment", { exact: true }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "05-sidebar-p6-environment");

  // 6. Expand a row
  await page.evaluate(() => window.scrollTo(0, 400));
  const firstRow = page.locator("button.w-full.grid").first();
  await firstRow.click();
  await page.waitForTimeout(300);
  await shot(page, "06-row-expanded");

  // 7. Type filter — Leadership only
  await page.getByText("All items").first().click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Leadership" }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "07-leadership-only");

  // 8. Search
  await page.getByRole("button", { name: "All" }).first().click();
  await page.locator('input[placeholder="Search disclosures…"]').fill("GHG");
  await page.waitForTimeout(300);
  await shot(page, "08-search-ghg");

  // 9. Materiality tab
  await page.locator('input[placeholder="Search disclosures…"]').fill("");
  await page.getByText("Materiality").first().click();
  await page.waitForTimeout(400);
  await shot(page, "09-materiality-tab");

  // 10. Framework Map tab
  await page.getByText("Framework Map").first().click();
  await page.waitForTimeout(400);
  await shot(page, "10-framework-map-tab");

  await ctx.close();
  await browser.close();

  console.log(`\n✅ All screenshots saved to: ${DIR}`);
})();
