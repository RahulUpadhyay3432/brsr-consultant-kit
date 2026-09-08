// Capture the product's main surfaces as PNGs for design review.
//
// Written so a design tool (or a human) can see the current state of every screen
// that matters without driving the app by hand. The report screens need a real
// client in localStorage first, so the script fills the intake form once and then
// navigates within the generated report.
//
// Usage:  node scripts/shoot-product.mjs            (desktop, 1440x900)
//         node scripts/shoot-product.mjs --mobile   (390x844, adds -mobile suffix)
//
// Requires the dev server on http://localhost:3000. Output: docs/screenshots/

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.SHOOT_BASE ?? "http://localhost:3000";
const MOBILE = process.argv.includes("--mobile");
const OUT = path.resolve("docs/screenshots");
const SUFFIX = MOBILE ? "-mobile" : "";
const VIEWPORT = MOBILE ? { width: 390, height: 844 } : { width: 1440, height: 900 };

fs.mkdirSync(OUT, { recursive: true });

const shots = [];
let n = 0;

async function shoot(page, name, { full = true, wait = 900 } = {}) {
  await page.waitForTimeout(wait);
  const file = path.join(OUT, `${String(++n).padStart(2, "0")}-${name}${SUFFIX}.png`);
  await page.screenshot({ path: file, fullPage: full });
  const kb = Math.round(fs.statSync(file).size / 1024);
  shots.push({ name, file: path.relative(process.cwd(), file), kb });
  console.log(`  ${String(n).padStart(2, "0")}  ${name.padEnd(34)} ${kb} KB`);
}

async function go(page, url, { wait = 1200 } = {}) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 60000 }).catch(async () => {
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  });
  await page.waitForTimeout(wait);
}

/**
 * The consent banner is a first-visit overlay, not part of the steady-state UI,
 * and it sits on top of the content in every shot. /notrack is the product's own
 * opt-out and settles consent before the banner mounts; clicking Decline is the
 * fallback if that ever changes.
 */
async function dismissConsent(page) {
  await page.goto(`${BASE}/notrack`, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const decline = page.getByRole("button", { name: /decline/i }).first();
  if (await decline.isVisible({ timeout: 1500 }).catch(() => false)) {
    await decline.click().catch(() => {});
    await page.waitForTimeout(400);
  }
}

/** Click the first element matching any of the given texts. Returns true if clicked. */
async function clickAny(page, texts, { timeout = 2500 } = {}) {
  for (const t of texts) {
    const el = page.getByText(t, { exact: false }).first();
    try {
      if (await el.isVisible({ timeout })) {
        await el.click({ timeout });
        return true;
      }
    } catch { /* try the next candidate */ }
  }
  return false;
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("   ! page error:", e.message.slice(0, 120)));

  console.log(`\nShooting ${MOBILE ? "MOBILE 390x844" : "DESKTOP 1440x900"} → ${OUT}\n`);

  await dismissConsent(page);

  // ── Marketing + reference surfaces ───────────────────────────────────────
  console.log("Marketing & reference");
  await go(page, "/");                      await shoot(page, "home");
  await go(page, "/pricing");               await shoot(page, "pricing");
  await go(page, "/blog");                  await shoot(page, "blog-index");
  await go(page, "/blog/brsr-consulting-fees-india"); await shoot(page, "blog-post");
  await go(page, "/brsr");                  await shoot(page, "brsr-hub-108-disclosures");
  await go(page, "/brsr/p6-e1");            await shoot(page, "brsr-field-page");
  await go(page, "/glossary");              await shoot(page, "glossary");
  await go(page, "/brsr/statistics");       await shoot(page, "brsr-statistics");
  await go(page, "/jobs");                  await shoot(page, "jobs-board");
  await go(page, "/directory");             await shoot(page, "consultant-directory");
  await go(page, "/latest");                await shoot(page, "latest-updates");

  // ── Standalone calculators ───────────────────────────────────────────────
  console.log("\nStandalone calculators & tools");
  await go(page, "/tools/ghg-calculator");        await shoot(page, "calc-ghg-scope-1-2");
  await go(page, "/tools/scope3-calculator");     await shoot(page, "calc-scope-3");
  await go(page, "/tools/ppp-intensity");         await shoot(page, "calc-ppp-intensity");
  await go(page, "/tools/xbrl-preflight");        await shoot(page, "calc-xbrl-preflight");
  await go(page, "/tools/brsr-applicability");    await shoot(page, "tool-applicability");
  await go(page, "/tools/audit-readiness");       await shoot(page, "tool-audit-readiness");
  await go(page, "/tools/wellbeing-schedule");    await shoot(page, "tool-wellbeing-schedule");
  await go(page, "/tools/materiality");           await shoot(page, "tool-materiality");
  await go(page, "/tools/brsr-framework-mapping");await shoot(page, "tool-framework-mapping");

  // ── The intake form, then the report ─────────────────────────────────────
  console.log("\nIntake form");
  await go(page, "/start");
  await shoot(page, "intake-form-empty");

  // Fill it as a listed steel manufacturer with EU exports, so the report has
  // gaps, calculators, CBAM in scope and Leadership indicators switched on.
  const nameInput = page.locator('input[type="text"]').first();
  await nameInput.click();
  await nameInput.fill("Tata Steel");
  await page.waitForTimeout(700);
  await page.keyboard.press("Escape");           // dismiss the autocomplete dropdown

  const select = page.locator("select").first();
  if (await select.count()) {
    await select.selectOption("steel_and_metals").catch(async () => {
      await select.selectOption({ label: "Steel & Metals" });
    });
  }
  await page.waitForTimeout(300);

  // The radios are visually-hidden inputs inside styled labels, so click the
  // label; the export-market and filing chips are plain buttons.
  for (const value of ["manufacturing", "listed_top_1000", "3_plus_years"]) {
    const input = page.locator(`input[type="radio"][value="${value}"]`).first();
    if (await input.count()) {
      await input.locator("xpath=ancestor::label[1]").click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(150);
    }
  }
  for (const chip of ["EU", "PCB (CTE/CTO)", "Factory Act", "PAT Scheme"]) {
    await page.getByRole("button", { name: chip, exact: true }).first()
      .click({ timeout: 3000 })
      .catch(() => console.log(`   ! chip not clicked: ${chip}`));
    await page.waitForTimeout(150);
  }

  await shoot(page, "intake-form-filled");

  await page.locator('button[type="submit"]').first().click({ timeout: 5000 }).catch((e) => {
    console.log("   ! submit click failed:", e.message.slice(0, 80));
  });
  await page.waitForURL(/\/report/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3500);

  const url = page.url();
  console.log(`\nReport workspace  (at ${url.replace(BASE, "") || "/"})`);

  if (!url.includes("/report")) {
    console.log("   ! did not reach /report — skipping report + embedded calculators");
  } else {
    await shoot(page, "report-overview");

    // Each tab in the report sidebar.
    const tabs = [
      ["Action Plan", "report-action-plan"],
      ["Materiality", "report-materiality"],
      ["Alignment", "report-alignment"],
      ["Beyond BRSR", "report-beyond-brsr"],
      ["Templates", "report-templates"],
      ["Sources", "report-sources"],
    ];
    for (const [label, name] of tabs) {
      const ok = await clickAny(page, [label], { timeout: 2500 });
      if (ok) { await page.waitForTimeout(1100); await shoot(page, name); }
      else console.log(`   ! tab not found: ${label}`);
    }

    // The calculators are rendered inside an expanded Action Plan row, and the
    // rows sit inside collapsible principle sections. CALC_MODES in
    // DisclosureRow.tsx puts them on P6-E1 (energy), P6-E7 (Scope 1 & 2 GHG),
    // P6-E3 (water); the Scope 3 screening calculator is on P6-L2.
    console.log("\nEmbedded calculators (inside the Action Plan)");
    const embedded = [
      ["P6-E7", "calc-embedded-p6-e7-ghg-scope-1-2"],
      ["P6-E1", "calc-embedded-p6-e1-energy"],
      ["P6-E3", "calc-embedded-p6-e3-water"],
      ["P6-L2", "calc-embedded-p6-l2-scope-3"],
    ];
    for (const [code, name] of embedded) {
      await clickAny(page, ["Action Plan"], { timeout: 2500 });
      await page.waitForTimeout(800);
      try {
        // Rows live inside collapsed principle sections and stay in the DOM
        // while hidden, so reaching for one directly waits forever. Searching
        // for the code filters the list down to that single row instead, which
        // also frames the shot on the calculator rather than a 20,000px page.
        // Note the two search boxes: the workspace-wide one in the top bar and
        // the checklist's own. Only the latter filters the disclosure list.
        const search = page.getByPlaceholder("Search fields…", { exact: true }).first();
        await search.scrollIntoViewIfNeeded({ timeout: 5000 });
        await search.fill(code);
        await page.waitForTimeout(1200);

        // Filtering narrows the list to one row but leaves its principle
        // section collapsed. Toggle Environment open only when it is closed:
        // section state persists between loop iterations, so an unconditional
        // click closes it again on the next pass.
        const section = page.getByText("Environment", { exact: true }).first();
        const sectionBtn = section.locator("xpath=ancestor::button[1]");
        await section.evaluate((el) => el.scrollIntoView({ block: "center" }));
        await page.waitForTimeout(400);
        if ((await sectionBtn.getAttribute("aria-expanded")) === "false") {
          await sectionBtn.click({ timeout: 5000, force: true });
          await page.waitForTimeout(900);
        }

        // Centre the row before clicking: the principle header is sticky and
        // intercepts pointer events on anything scrolled to just under it.
        const chip = page.getByText(code, { exact: true }).first();
        await chip.evaluate((el) => el.scrollIntoView({ block: "center" }));
        await page.waitForTimeout(500);
        await chip.locator("xpath=ancestor::button[1]").click({ timeout: 5000, force: true });
        await page.waitForTimeout(1500);

        await chip.evaluate((el) => el.scrollIntoView({ block: "center" }));
        await page.waitForTimeout(400);
        await shoot(page, name, { full: true, wait: 300 });

        await search.fill("");
        await page.waitForTimeout(500);
      } catch (e) {
        console.log(`   ! could not expand ${code}: ${e.message.slice(0, 70)}`);
      }
    }
  }

  await browser.close();

  console.log(`\n${shots.length} screenshots → ${OUT}\n`);
  const manifest = shots.map((s) => `${s.file}  (${s.kb} KB)`).join("\n");
  fs.writeFileSync(path.join(OUT, `MANIFEST${SUFFIX}.txt`), manifest + "\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
