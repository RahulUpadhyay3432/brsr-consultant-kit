/**
 * BRSR Consultant Kit — Playwright E2E Test Script
 * Run: node scripts/e2e-test.js
 */

const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function shot(page, name) {
  const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  📸 ${path.basename(file)}`);
}

// ─── Exact values from types.ts ───────────────────────────────────────────────
const SIZE_LABELS = {
  listed_top_1000:           "Listed — Top 1000 by market cap",
  listed_outside_1000:       "Listed — Outside top 1000",
  unlisted_supplier:         "Unlisted — supplier to a listed company",
  unlisted_not_in_value_chain: "Unlisted — not in a listed company's value chain",
};
const MATURITY_LABELS = {
  first_time:    "First-time filing",
  "1_to_2_years": "1–2 years of filing",   // em-dash from types.ts
  "3_plus_years": "3+ years — improving quality",
};
const FILING_LABELS = {
  pcb_cte_cto:     "PCB (CTE/CTO)",
  zld:             "ZLD",
  hazardous_waste: "Hazardous Waste",
  epr_registration:"EPR Registration",
  factory_act:     "Factory Act",
  pat_scheme:      "PAT Scheme",
  none:            "None",
};

// ─── Fill the intake form ─────────────────────────────────────────────────────
async function fillForm(page, form) {
  // Company name
  if (form.companyName) {
    await page.locator('input[type="text"]').first().fill(form.companyName);
    console.log(`  · Company name filled`);
  }

  // Industry — native <select>
  if (form.industry) {
    await page.locator("select").first().selectOption(form.industry);
    console.log(`  · Industry selected: ${form.industry}`);
  }

  // Company size — wrapping <label> with sr-only radio inside
  if (form.size && SIZE_LABELS[form.size]) {
    // Click the <span> text inside the label — bubbles up to the label → radio
    await page.locator(`text="${SIZE_LABELS[form.size]}"`).first().click();
    console.log(`  · Size clicked: "${SIZE_LABELS[form.size]}"`);
  }

  // Reporting maturity
  if (form.maturity && MATURITY_LABELS[form.maturity]) {
    await page.locator(`text="${MATURITY_LABELS[form.maturity]}"`).first().click();
    console.log(`  · Maturity clicked: "${MATURITY_LABELS[form.maturity]}"`);
  }

  // Export markets — <button type="button"> chips
  for (const market of (form.exportMarkets || [])) {
    await page.locator(`button[type="button"]:has-text("${market}")`).first().click();
    console.log(`  · Export market: ${market}`);
    await page.waitForTimeout(100);
  }

  // Existing filings — <button type="button"> chips
  for (const filing of (form.filings || [])) {
    const label = FILING_LABELS[filing] || filing;
    await page.locator(`button[type="button"]:has-text("${label}")`).first().click();
    console.log(`  · Filing: ${label}`);
    await page.waitForTimeout(100);
  }
}

// ─── Submit and wait for report view ─────────────────────────────────────────
async function submitAndWaitForReport(page) {
  // Scroll to bottom to make sure button is in viewport
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);

  // Click the submit button (type="submit" is unambiguous)
  await page.locator('button[type="submit"]').click();
  console.log(`  · Submit clicked`);

  // Wait for loading state to appear (spinner shows "Generating Report...")
  await page.waitForTimeout(200);

  // Wait for report view — the "New report" back button only exists in ReportView
  // Timeout 10s should be plenty (600ms delay + render)
  await page.waitForFunction(
    () => {
      // The report view's back button has text "New report"
      const btns = [...document.querySelectorAll("button")];
      return btns.some(b => b.textContent?.includes("New report"));
    },
    { timeout: 10000 }
  );

  // Give React a moment to finish rendering
  await page.waitForTimeout(500);
  console.log(`  · Report view rendered`);
}

// ─── Read summary numbers from the report ────────────────────────────────────
async function inspectReport(page) {
  const result = {};

  // Read numbers from three summary columns (Step 1 / Step 2 / Step 3)
  try {
    // The SummaryColumn renders a <p> with text-3xl — extract all three numbers
    const bigNumbers = page.locator("p.text-3xl, p[class*='text-3xl']");
    const count = await bigNumbers.count();
    const nums = [];
    for (let i = 0; i < count; i++) {
      const txt = await bigNumbers.nth(i).textContent();
      const n = parseInt(txt?.trim() ?? "");
      if (!isNaN(n)) nums.push(n);
    }
    if (nums.length >= 3) {
      [result.tracked, result.partial, result.newData] = nums;
      result.total = nums[0] + nums[1] + nums[2];
    }
    result.rawNums = nums;
  } catch (e) {
    result.numError = e.message;
  }

  // Plain-language headline (in the stone-50 box inside ReportView)
  try {
    // The headline p is inside the card header, not the sticky site header
    const main = page.locator("main");
    result.headline = (
      await main.locator(".bg-stone-50 p").first().textContent()
    )?.trim();
  } catch (_) {}

  // Section headings visible in the checklist tab
  try {
    result.headings = (await page.locator("main h3, main h4").allTextContents())
      .filter(s => s.trim())
      .slice(0, 20);
  } catch (_) {}

  // Active tab text
  try {
    result.activeTab = (
      await page.locator("[class*='border-forest']").first().textContent()
    )?.trim();
  } catch (_) {}

  // Console errors are passed in separately

  return result;
}

// ─── Test scenarios ───────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    name: "textile-epr-hazwaste-pat",
    label: "Textile · EPR + Hazardous Waste + PAT",
    form: {
      companyName: "Apex Textiles Ltd",
      industry: "textile_and_apparel",
      size: "listed_top_1000",
      maturity: "first_time",
      exportMarkets: ["EU", "USA"],
      filings: ["epr_registration", "hazardous_waste", "pat_scheme"],
    },
    expect: { minTracked: 1, minPartial: 1, maxNew: 107 },
  },
  {
    name: "pharma-no-filings",
    label: "Pharma · No existing filings",
    form: {
      companyName: "MedCorp India Pvt Ltd",
      industry: "pharmaceuticals",
      size: "listed_outside_1000",
      maturity: "1_to_2_years",
      exportMarkets: [],
      filings: [],
    },
    expect: {},
  },
  {
    name: "cement-all-filings",
    label: "Cement · ZLD + PCB + Hazardous + PAT",
    form: {
      companyName: "Bharat Cement Works",
      industry: "cement",
      size: "listed_top_1000",
      maturity: "3_plus_years",
      exportMarkets: ["EU"],
      filings: ["pcb_cte_cto", "zld", "hazardous_waste", "pat_scheme"],
    },
    expect: { minTracked: 1, minPartial: 1 },
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("\n🎭 BRSR Consultant Kit — Playwright E2E Tests");
  console.log("=".repeat(60));

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n▶ ${scenario.label}`);

    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await ctx.newPage();

    const consoleErrors = [];
    page.on("console", m => {
      if (m.type() === "error") consoleErrors.push(m.text());
      // Also log warnings for debugging
      if (m.type() === "warning") console.log(`  ⚠️  [browser warn] ${m.text().slice(0, 80)}`);
    });

    try {
      // 1. Load page — clear localStorage first
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => localStorage.clear());
      await page.waitForTimeout(500);
      await shot(page, `${scenario.name}-01-homepage`);
      console.log("  ✅ Homepage loaded");

      // 2. Fill form
      await fillForm(page, scenario.form);
      await shot(page, `${scenario.name}-02-form-filled`);
      console.log("  ✅ Form filled");

      // 3. Submit and wait for report
      await submitAndWaitForReport(page);
      await shot(page, `${scenario.name}-03-report-top`);

      // 4. Scroll and screenshot checklist
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(300);
      await shot(page, `${scenario.name}-04-report-checklist`);

      // 5. Inspect
      const report = await inspectReport(page);

      console.log(`  📊 tracked=${report.tracked} partial=${report.partial} new=${report.newData} total=${report.total}`);
      if (report.rawNums?.length) console.log(`  🔢 Raw numbers found: [${report.rawNums.join(", ")}]`);
      if (report.headline) console.log(`  💬 "${report.headline.slice(0, 100)}"`);
      if (report.headings?.length) {
        console.log(`  📑 Sections: ${report.headings.slice(0, 5).join(" · ")}`);
      }
      if (report.activeTab) console.log(`  🗂️  Active tab: "${report.activeTab}"`);

      // 6. Validate
      const fails = [];
      const e = scenario.expect;
      if (e.minTracked != null && (report.tracked ?? 0) < e.minTracked)
        fails.push(`tracked ≥${e.minTracked} expected, got ${report.tracked}`);
      if (e.minPartial != null && (report.partial ?? 0) < e.minPartial)
        fails.push(`partial ≥${e.minPartial} expected, got ${report.partial}`);
      if (e.maxNew != null && (report.newData ?? 0) > e.maxNew)
        fails.push(`new ≤${e.maxNew} expected, got ${report.newData}`);

      if (consoleErrors.length) {
        console.log(`  ⚠️  JS errors: ${consoleErrors.slice(0, 3).join("; ").slice(0, 200)}`);
      }

      if (fails.length === 0) {
        console.log("  ✅ All expectations met");
        results.push({ scenario: scenario.name, status: "PASS", report });
      } else {
        fails.forEach(f => console.log(`  ❌ ${f}`));
        results.push({ scenario: scenario.name, status: "FAIL", failures: fails, report });
      }

    } catch (err) {
      const msg = err.message.split("\n")[0];
      console.log(`  💥 ERROR: ${msg}`);
      await shot(page, `${scenario.name}-ERROR`).catch(() => {});
      if (consoleErrors.length) {
        console.log(`  ⚠️  JS errors: ${consoleErrors.slice(0, 3).join("; ").slice(0, 200)}`);
      }
      results.push({ scenario: scenario.name, status: "ERROR", error: msg });
    }

    await ctx.close();
  }

  await browser.close();

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("RESULTS");
  console.log("=".repeat(60));
  for (const r of results) {
    const icon = { PASS: "✅", FAIL: "❌", ERROR: "💥" }[r.status] ?? "?";
    console.log(`${icon} ${r.scenario}: ${r.status}`);
    if (r.failures) r.failures.forEach(f => console.log(`    → ${f}`));
    if (r.error) console.log(`    → ${r.error.slice(0, 150)}`);
  }
  const passed = results.filter(r => r.status === "PASS").length;
  console.log(`\n${passed}/${results.length} passed`);
  console.log(`📸 Screenshots → ${SCREENSHOTS_DIR}`);
  console.log("=".repeat(60) + "\n");
  process.exit(results.every(r => r.status === "PASS") ? 0 : 1);
})();
