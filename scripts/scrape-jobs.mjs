// Free, headless jobs scraper — runs in GitHub Actions (see .github/workflows/jobs-refresh.yml).
// A real Chromium (Playwright) fetches each source page (gets through bot walls that a
// plain fetch is 403'd on, e.g. iimjobs), a grounded Groq pass extracts the individual
// roles, every apply link is verified live, and fresh rows are upserted into Supabase
// `brsr_jobs`. Best-effort throughout: no paid API, never fabricates, drops dead links.
//
// Env (set as GitHub repo secrets): NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL),
// SUPABASE_SERVICE_ROLE_KEY, and GROQ_API_KEY plus optional GROQ_API_KEY2..6.
import { chromium } from "@playwright/test";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const GROQ_KEYS = [
  process.env.GROQ_API_KEY, process.env.GROQ_API_KEY2, process.env.GROQ_API_KEY3,
  process.env.GROQ_API_KEY4, process.env.GROQ_API_KEY5, process.env.GROQ_API_KEY6,
].map((k) => (k || "").trim().replace(/^["']|["']$/g, "")).filter((k) => k.startsWith("gsk_"));

const MAX_PER_SOURCE = 12;
const FRESH_DAYS = 30;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// Source listing/careers pages. Headless Chromium reaches these (incl. iimjobs, which
// plain fetch cannot). Tune freely; LinkedIn is left out on purpose (litigious outlier).
const SOURCES = [
  { url: "https://climatebase.org/jobs?l=India", sourceName: "Climatebase" },
  { url: "https://www.ey.com/en_in/careers/climate-change-sustainability-services", sourceName: "EY careers" },
  { url: "https://www.breatheesg.com/careers", sourceName: "Breathe ESG" },
  { url: "https://www.karbonwise.com/careers", sourceName: "Karbonwise" },
  { url: "https://www.iimjobs.com/c/esg-jobs", sourceName: "iimjobs" },
  { url: "https://www.naukri.com/esg-sustainability-jobs", sourceName: "Naukri" },
];

const JOB_CATEGORIES = [
  "brsr-reporting", "assurance", "carbon-climate", "esg-strategy",
  "sustainability-ops", "ehs", "esg-finance", "other",
];
const VALID_CAT = new Set(JOB_CATEGORIES);

const SYSTEM = `You extract Indian ESG/sustainability JOB LISTINGS from the text of a careers or job-board page, for a curated jobs board.
STRICT RULES:
- Use ONLY the provided text. Never invent a company, title, salary, date, or link.
- Include an entry ONLY if it is a specific role with an ABSOLUTE http(s) apply/detail URL present in the text. Skip anything without a real link. Skip navigation, ads, and "see all jobs" links.
- Keep only roles based in India (or explicitly Remote-India). Drop unrelated roles.
- Return STRICT JSON only: an array of objects. No prose, no markdown fences. Empty array [] if none.
Each object:
{"title","company","location","applyUrl","category","type","workMode","seniority","experience","salary","summary","aboutRole","aboutCompany","companySize","tags"}
- category: one of ${JOB_CATEGORIES.join(", ")}. Choose the best fit; use "other" if unsure.
- type: one of full-time, part-time, contract, internship (or omit).
- workMode: one of onsite, hybrid, remote (or omit).
- summary: one line. aboutRole: 3-6 sentences from the posting if available (else omit). tags: up to 6 skills.
- Omit any field you cannot fill; never guess.`;

let gi = 0;
async function groq(user) {
  for (let n = 0; n < GROQ_KEYS.length; n++) {
    const key = GROQ_KEYS[gi++ % GROQ_KEYS.length];
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          temperature: 0.1,
          max_tokens: 2400,
          messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }],
        }),
      });
      if (!res.ok) continue;
      const j = await res.json();
      const txt = j?.choices?.[0]?.message?.content;
      if (txt) return txt;
    } catch { /* try next key */ }
  }
  return null;
}

async function sb(path, init) {
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };
  if (init?.prefer) headers.Prefer = init.prefer;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text().catch(() => "")}`);
  return res;
}

function parseArray(raw) {
  if (!raw) return [];
  const m = raw.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[0]);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function toRow(e, sourceName) {
  const applyUrl = (e.applyUrl || "").trim();
  const title = (e.title || "").trim();
  if (!title || !/^https?:\/\//.test(applyUrl)) return null;
  const cat = (e.category || "").toLowerCase();
  return {
    title,
    company: (e.company || "").trim() || null,
    location: (e.location || "").trim() || null,
    category: VALID_CAT.has(cat) ? cat : "other",
    apply_url: applyUrl,
    posted_date: new Date().toISOString().slice(0, 10),
    type: e.type?.toLowerCase() || null,
    work_mode: e.workMode?.toLowerCase() || null,
    seniority: e.seniority || null,
    experience: e.experience || null,
    salary: e.salary || null,
    summary: e.summary || null,
    about_role: e.aboutRole || null,
    about_company: e.aboutCompany || null,
    company_size: e.companySize || null,
    tags: Array.isArray(e.tags) ? e.tags.slice(0, 6) : null,
    source_name: sourceName,
  };
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log("Supabase env not set — skipping (no-op).");
    return;
  }
  if (!GROQ_KEYS.length) {
    console.log("No Groq keys set — skipping (no-op).");
    return;
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, locale: "en-IN", viewport: { width: 1280, height: 900 } });

  // 1) Scrape + extract per source.
  const candidates = [];
  for (const src of SOURCES) {
    const page = await ctx.newPage();
    try {
      await page.goto(src.url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(3500);
      const text = ((await page.evaluate(() => document.body?.innerText || "")) || "").slice(0, 40000);
      await page.close();
      if (text.length < 200) { console.log(`  ${src.sourceName}: thin page (${text.length} chars), skipped`); continue; }
      const raw = await groq(`Source: ${src.sourceName}\n\n${text}`);
      const rows = parseArray(raw).slice(0, MAX_PER_SOURCE).map((e) => toRow(e, src.sourceName)).filter(Boolean);
      console.log(`  ${src.sourceName}: extracted ${rows.length}`);
      candidates.push(...rows);
    } catch (e) {
      console.log(`  ${src.sourceName}: ${e.message}`);
      await page.close().catch(() => {});
    }
  }

  // 2) Dedup within run + against stored.
  const seen = new Set();
  const unique = candidates.filter((c) => (seen.has(c.apply_url) ? false : (seen.add(c.apply_url), true)));
  let known = new Set();
  try {
    const inList = unique.map((c) => `"${c.apply_url.replace(/"/g, "")}"`).join(",");
    if (inList) {
      const res = await sb(`brsr_jobs?apply_url=in.(${encodeURIComponent(inList)})&select=apply_url`);
      known = new Set((await res.json()).map((r) => r.apply_url));
    }
  } catch (e) { console.log("existing-url check failed:", e.message); }
  const fresh = unique.filter((c) => !known.has(c.apply_url));

  // 3) Verify each apply link is live (real browser navigation).
  const verified = [];
  for (const c of fresh) {
    const page = await ctx.newPage();
    try {
      const resp = await page.goto(c.apply_url, { waitUntil: "domcontentloaded", timeout: 30000 });
      const status = resp ? resp.status() : 0;
      if (status !== 404 && status !== 410) verified.push(c);
      else console.log(`  drop dead link (${status}): ${c.apply_url}`);
    } catch {
      verified.push(c); // network hiccup — don't drop a possibly-good link
    }
    await page.close().catch(() => {});
  }

  await browser.close();

  // 4) Upsert + prune.
  let inserted = 0;
  if (verified.length) {
    try {
      const res = await sb("brsr_jobs?on_conflict=apply_url", {
        method: "POST",
        prefer: "resolution=ignore-duplicates,return=representation",
        body: JSON.stringify(verified),
      });
      inserted = (await res.json()).length;
    } catch (e) { console.log("insert failed:", e.message); }
  }
  try {
    const cutoff = new Date(Date.now() - FRESH_DAYS * 86400000).toISOString();
    await sb(`brsr_jobs?created_at=lt.${cutoff}`, { method: "DELETE" });
  } catch (e) { console.log("prune failed:", e.message); }

  console.log(`\nSources ${SOURCES.length} · extracted ${candidates.length} · fresh ${fresh.length} · verified ${verified.length} · inserted ${inserted}`);
}

main().catch((e) => { console.error("scrape-jobs fatal:", e.message); process.exit(0); });
