/**
 * Full skills audit — captures every screen in one run.
 * Skills applied: ux-heuristics, refactoring-ui, emil-design-eng, verification-before-completion
 */
const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const DIR = path.join(__dirname, "screenshots", "audit");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const shot = async (page, name) => {
  await page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: false });
  console.log(`  📸 ${name}`);
};
const shotFull = async (page, name) => {
  await page.screenshot({ path: path.join(DIR, `${name}.png`), fullPage: true });
  console.log(`  📸 ${name} (full)`);
};

async function submitForm(page, { industry = "textile_and_apparel", filings = [] } = {}) {
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(400);
  await page.locator("select").first().selectOption(industry);
  await page.waitForTimeout(200);
  for (const f of filings) {
    await page.locator(`button[type="button"]:has-text("${f}")`).first().click();
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.locator("button[type='submit']").click();
  await page.waitForFunction(
    () => [...document.querySelectorAll("button")].some(b => b.textContent?.includes("New report")),
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

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — INTAKE FORM
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── INTAKE FORM ──────────────────────────────────────────────");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(400);

  // 1a. Default form (Textile chips visible)
  await shot(page, "form-01-default-textile");
  await shotFull(page, "form-01-default-textile-full");

  // 1b. Select some process chips
  await page.locator('button[type="button"]:has-text("Wet processing")').first().click();
  await page.locator('button[type="button"]:has-text("Garment stitching")').first().click();
  await page.waitForTimeout(150);
  await shot(page, "form-02-chips-selected");

  // 1c. Change to Pharmaceuticals — chips should reset
  await page.locator("select").first().selectOption("pharmaceuticals");
  await page.waitForTimeout(300);
  await shot(page, "form-03-pharma-chips-reset");

  // 1d. Change to IT Services
  await page.locator("select").first().selectOption("it_services");
  await page.waitForTimeout(250);
  await shot(page, "form-04-it-services-chips");

  // 1e. Scroll to lower half (company size, maturity, exports, filings)
  await page.locator("select").first().selectOption("textile_and_apparel");
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 500));
  await shot(page, "form-05-lower-half");

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — REPORT SUMMARY (no filings — all 108 collect fresh)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── REPORT SUMMARY (no filings) ──────────────────────────────");
  await submitForm(page, { industry: "textile_and_apparel", filings: [] });
  await shot(page, "report-01-summary-no-filings");

  // 2a. Tour panel — click Step 1 explain
  const step1Explain = page.locator("button:has-text('What does this mean?')").first();
  await step1Explain.click();
  await page.waitForTimeout(400);
  await shot(page, "report-02-tour-step1");

  // 2b. Advance to step 2
  await page.getByRole("button", { name: /Next/i }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "report-03-tour-step2");

  // 2c. Advance to step 3
  await page.getByRole("button", { name: /Next/i }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "report-04-tour-step3");

  // 2d. Close tour
  await page.getByRole("button", { name: /Got it/i }).first().click();
  await page.waitForTimeout(300);
  await shot(page, "report-05-tour-closed");

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — REPORT SUMMARY (with filings — tracked + partial items)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── REPORT SUMMARY (with filings) ────────────────────────────");
  await submitForm(page, {
    industry: "textile_and_apparel",
    filings: ["EPR Registration", "Hazardous Waste", "PAT Scheme"],
  });
  await shot(page, "report-06-summary-with-filings");

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 4 — DATA CHECKLIST (Action Plan tab)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── DATA CHECKLIST ───────────────────────────────────────────");
  await page.getByRole("button", { name: /Action Plan/i }).first().click();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(200);

  // 4a. All sections expanded — status sidebar
  await shot(page, "checklist-01-all-expanded");

  // 4b. Click "Ready to pull" filter in sidebar
  await page.locator("button:has-text('Ready to pull')").first().click();
  await page.waitForTimeout(300);
  await shot(page, "checklist-02-filter-ready-to-pull");

  // 4c. Click "Needs verification" filter
  await page.locator("button:has-text('Needs verification')").first().click();
  await page.waitForTimeout(300);
  await shot(page, "checklist-03-filter-partial");

  // 4d. Back to all, filter by P6 Environment
  await page.locator("button:has-text('All items')").first().click();
  await page.waitForTimeout(200);
  await page.locator("button:has-text('Environment')").first().click();
  await page.waitForTimeout(300);
  await shot(page, "checklist-04-filter-p6-environment");

  // 4e. Collapse P6 section header
  await page.locator("button:has-text('All items')").first().click();
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(200);
  // Find and click P1 section header (contains badge "P1" + "11 items")
  const p1Header = page.locator("button").filter({ hasText: /P1/ }).filter({ hasText: /items/ }).first();
  await p1Header.click();
  await page.waitForTimeout(300);
  await shot(page, "checklist-05-p1-collapsed");

  // 4f. Collapse P2 as well
  const p2Header = page.locator("button").filter({ hasText: /P2/ }).filter({ hasText: /items/ }).first();
  await p2Header.click();
  await page.waitForTimeout(300);
  await shot(page, "checklist-06-p1-p2-collapsed");

  // 4g. Expand a disclosure row (click P3 row to see detail panel)
  const p3Header = page.locator("button").filter({ hasText: /P3/ }).filter({ hasText: /items/ }).first();
  // P3 might be below — scroll
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(200);
  await shot(page, "checklist-07-scroll-mid");

  // 4h. Search interaction
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(200);
  await page.locator('input[placeholder*="Search"]').first().fill("energy");
  await page.waitForTimeout(400);
  await shot(page, "checklist-08-search-energy");

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5 — MATERIALITY MATRIX
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── MATERIALITY MATRIX ───────────────────────────────────────");
  await page.getByRole("button", { name: /Materiality/i }).first().click();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(300);
  await shot(page, "materiality-01-default");
  await shotFull(page, "materiality-01-full");

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6 — FRAMEWORK MAPPER
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n── FRAMEWORK MAPPER ─────────────────────────────────────────");
  await page.getByRole("button", { name: /Framework/i }).first().click();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(300);
  await shot(page, "framework-01-default");
  await shotFull(page, "framework-01-full");

  await ctx.close();
  await browser.close();
  console.log(`\n✅ All screenshots saved → ${DIR}\n`);
})();
