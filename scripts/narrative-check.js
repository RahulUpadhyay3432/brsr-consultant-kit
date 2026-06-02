const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const OUT = 'scripts/screenshots/narrative';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(
    () => [...document.querySelectorAll('button')].some(b => b.textContent && b.textContent.includes('New report')),
    { timeout: 10000 }
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, '01-no-filings-header.png') });

  const checks = await page.evaluate(() => ({
    amberInHeader: [...document.querySelectorAll('.bg-amber-50')].some(el => el.textContent && el.textContent.includes('No compliance filings selected')),
    context108: [...document.querySelectorAll('p')].some(p => p.textContent && p.textContent.includes('108 specific disclosure fields')),
    tourGone: ![...document.querySelectorAll('button')].some(b => b.textContent && b.textContent.includes('What do Step')),
    whereToStart: document.body.innerText.includes('Where to start'),
    goBackInHeader: [...document.querySelectorAll('button')].some(b => b.textContent && b.textContent.includes('Go back and add compliance filings')),
  }));
  console.log('No-filings checks:', JSON.stringify(checks, null, 2));

  await page.locator('button:has-text("Go back and add compliance filings")').click();
  await page.waitForTimeout(300);
  await page.locator('button[type="button"]:has-text("EPR Registration")').click();
  await page.locator('button[type="button"]:has-text("Hazardous Waste")').click();
  await page.locator('button[type="button"]:has-text("PAT Scheme")').click();
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(
    () => [...document.querySelectorAll('button')].some(b => b.textContent && b.textContent.includes('New report')),
    { timeout: 10000 }
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, '02-with-filings-header.png') });

  const nums = await page.evaluate(() =>
    [...document.querySelectorAll('p.text-3xl')].map(p => p.textContent && p.textContent.trim())
  );
  console.log('Numbers shown (should be non-zero):', nums);
  await browser.close();
  console.log('Done');
})().catch(e => console.error(e));
