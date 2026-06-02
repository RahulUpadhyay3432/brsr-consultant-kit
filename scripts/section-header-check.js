const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const DIR = path.join(__dirname, "screenshots", "section-headers");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
const shot = async (page, name) => {
  await page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: false });
  console.log(`  📸 ${name}`);
};

// Click the section header in the MAIN TABLE area (not the sidebar nav)
// Section headers contain a mono badge like "P1" and the principle name
async function clickSectionHeader(page, principleCode) {
  // The section header button has the principle code badge text + name text
  // It lives in the right panel (flex-1), not the sidebar
  const btn = page.locator("button").filter({ hasText: principleCode })
                  .filter({ has: page.locator(`text=/\\d+ items?/i`) })
                  .first();
  await btn.click();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(400);
  await page.locator("select").first().selectOption("textile_and_apparel");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(150);
  await page.locator("button[type=\"submit\"]").click();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report")),
    { timeout: 10000 }
  );
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  await page.getByRole("button", { name: /Action Plan/i }).first().click();
  await page.waitForTimeout(500);

  // 1. Default — all sections expanded, chevrons pointing down
  await shot(page, "01-all-expanded");

  // 2. Collapse P1
  await clickSectionHeader(page, "P1");
  await page.waitForTimeout(300);
  await shot(page, "02-p1-collapsed");

  // 3. Collapse P2 as well
  await clickSectionHeader(page, "P2");
  await page.waitForTimeout(300);
  await shot(page, "03-p1-p2-both-collapsed");

  // 4. Re-expand P1
  await clickSectionHeader(page, "P1");
  await page.waitForTimeout(300);
  await shot(page, "04-p1-re-expanded");

  await ctx.close();
  await browser.close();
  console.log("Done —", DIR);
})();
