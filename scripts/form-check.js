const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const DIR = path.join(__dirname, "screenshots", "form");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: false });
  console.log(`  📸 ${name}.png`);
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(500);

  // 1. Default form (Textile)
  await shot(page, "01-default-textile");

  // 2. Select a few processes
  await page.locator('button[type="button"]:has-text("Wet processing")').first().click();
  await page.waitForTimeout(100);
  await page.locator('button[type="button"]:has-text("Garment stitching")').first().click();
  await page.waitForTimeout(100);
  await page.locator('button[type="button"]:has-text("Washing & effluent")').first().click();
  await page.waitForTimeout(200);
  await shot(page, "02-processes-selected");

  // 3. Change industry to Pharmaceuticals — processes should reset
  await page.locator("select").first().selectOption("pharmaceuticals");
  await page.waitForTimeout(300);
  await shot(page, "03-industry-changed-pharma");

  // 4. Change to IT Services
  await page.locator("select").first().selectOption("it_services");
  await page.waitForTimeout(300);
  await shot(page, "04-industry-it-services");

  // 5. Change to Power & Energy
  await page.locator("select").first().selectOption("power_and_energy");
  await page.waitForTimeout(300);
  await shot(page, "05-industry-power-energy");

  // 6. Scroll down to see full form
  await page.locator("select").first().selectOption("textile_and_apparel");
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 400));
  await shot(page, "06-form-lower-half");

  await ctx.close();
  await browser.close();
  console.log("\n✅ Done —", DIR);
})();
