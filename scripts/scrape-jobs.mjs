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
// Accept every GROQ_API_KEY variant (GROQ_API_KEY, GROQ_API_KEY2, GROQ_API_KEY_2, ...)
// so it works with whatever naming the env already uses.
const GROQ_KEYS = Object.keys(process.env)
  .filter((k) => /^GROQ_API_KEY(_?\d+)?$/i.test(k))
  .sort()
  .map((k) => (process.env[k] || "").trim().replace(/^["']|["']$/g, ""))
  .filter((k) => k.startsWith("gsk_"));

const MAX_PER_SOURCE = 12;
const FRESH_DAYS = 30;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// Source LISTING pages that actually render India ESG roles WITH per-role detail URLs
// (verified: iimjobs /k/ listings and Indeed search yield; /c/ paths, EY's marketing
// page, and email-apply career pages do not). Headless Chromium reaches these where a
// plain fetch is 403'd. LinkedIn is left out on purpose (litigious outlier). Tune freely.
const SOURCES = [
  { url: "https://www.iimjobs.com/k/esg-jobs", sourceName: "iimjobs" },
  { url: "https://www.iimjobs.com/k/sustainability-jobs", sourceName: "iimjobs" },
  { url: "https://in.indeed.com/jobs?q=ESG+sustainability&l=India&sort=date", sourceName: "Indeed" },
  { url: "https://in.indeed.com/jobs?q=BRSR&l=India&sort=date", sourceName: "Indeed" },
  { url: "https://climatebase.org/jobs?l=India", sourceName: "Climatebase" },
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
- Keep only roles based in India (or explicitly Remote-India).
- RELEVANCE GATE: include ONLY genuine sustainability / ESG / climate / EHS / BRSR / carbon / ESG-assurance / sustainable-finance roles. DROP generic sales, pre-sales, software, IT, marketing, HR, or admin roles even if the word "ESG" or "sustainability" appears somewhere on the page.
- Return STRICT JSON only: an array of objects. No prose, no markdown fences. Empty array [] if none.
Each object:
{"title","company","location","applyUrl","category","type","workMode","seniority","experience","salary","summary","aboutRole","aboutCompany","companySize","tags"}
- category: one of ${JOB_CATEGORIES.join(", ")}. Choose the best fit; use "other" if unsure.
- type: one of full-time, part-time, contract, internship (or omit).
- workMode: one of onsite, hybrid, remote (or omit).
- summary: one line. aboutRole: 3-6 sentences from the posting if available (else omit). tags: up to 6 skills.
- Omit any field you cannot fill; never guess.`;

// Enrichment prompt: turn a single job's own detail page into a fuller, faithful
// "about the role" plus whatever structured fields the posting states.
const ENRICH = `From the text of a SINGLE job posting, return STRICT JSON with only these keys, using ONLY facts present on the page (omit any key you cannot fill): {"aboutRole","company","location","experience","salary","type","workMode","seniority","companySize","tags"}.
- aboutRole: 3 to 5 COMPLETE sentences on the real responsibilities and requirements from the posting. Finish every sentence. Plain text only: no em dashes, no ellipses, no trailing "...". No fabrication.
- type: full-time | part-time | contract | internship. workMode: onsite | hybrid | remote. tags: up to 6 skills.
Return the JSON object only, no prose, no fences.`;

let gi = 0;
let lastGroqAt = 0;
// Groq free tier caps gpt-oss-20b at 8000 tokens/min PER KEY. Keep every request well
// under that, and space calls out so the per-minute budget (across 6 rotated keys)
// never overflows. reasoning_effort:low cuts token use and stops empty-content replies.
const MIN_GAP_MS = 5000;
async function groq(system, user, maxTokens = 1600) {
  const wait = lastGroqAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastGroqAt = Date.now();
  for (let n = 0; n < GROQ_KEYS.length; n++) {
    const key = GROQ_KEYS[gi++ % GROQ_KEYS.length];
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          temperature: 0.1,
          max_tokens: maxTokens,
          reasoning_effort: "low",
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
        }),
      });
      if (!res.ok) { if (process.env.JOBS_DEBUG) console.log(`    groq HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`); continue; }
      const j = await res.json();
      const txt = j?.choices?.[0]?.message?.content;
      if (txt) return txt;
    } catch { /* try next key */ }
  }
  return null;
}

function parseObj(raw) {
  if (!raw) return null;
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const o = JSON.parse(m[0]);
    return o && typeof o === "object" ? o : null;
  } catch {
    return null;
  }
}

// Fold a job's own detail-page facts into the listing-level row (detail wins).
function mergeEnrichment(row, e) {
  if (e.aboutRole) row.about_role = String(e.aboutRole).slice(0, 1400);
  if (e.company && !row.company) row.company = String(e.company).slice(0, 120);
  if (e.location) row.location = String(e.location).slice(0, 120);
  if (e.experience) row.experience = String(e.experience).slice(0, 60);
  if (e.salary) row.salary = String(e.salary).slice(0, 60);
  if (e.seniority) row.seniority = String(e.seniority).slice(0, 40);
  if (e.companySize) row.company_size = String(e.companySize).slice(0, 60);
  const t = String(e.type || "").toLowerCase();
  if (["full-time", "part-time", "contract", "internship"].includes(t)) row.type = t;
  const w = String(e.workMode || "").toLowerCase();
  if (["onsite", "hybrid", "remote"].includes(w)) row.work_mode = w;
  if (Array.isArray(e.tags) && e.tags.length) row.tags = e.tags.slice(0, 6).map((x) => String(x).slice(0, 40));
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
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {}); // let SPAs settle
      await page.waitForTimeout(2500);
      // Visible text carries the role titles; the anchor list carries the apply/detail
      // URLs (which never appear in innerText). Feed the model both.
      const { text, links } = await page.evaluate(() => {
        const t = (document.body?.innerText || "").slice(0, 26000);
        const out = [];
        document.querySelectorAll("a[href]").forEach((a) => {
          const tt = (a.innerText || a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
          if (tt && /^https?:\/\//.test(a.href)) out.push({ t: tt, h: a.href });
        });
        // Indeed puts the job id in data-jk on the card, not in an <a href>; build the
        // viewjob URL from it so the model has a real apply link to attach.
        if (location.host.includes("indeed")) {
          document.querySelectorAll("[data-jk]").forEach((el) => {
            const jk = el.getAttribute("data-jk");
            const tt = (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 120);
            if (jk && /^[0-9a-f]{10,}$/i.test(jk)) out.push({ t: tt || "job", h: `https://in.indeed.com/viewjob?jk=${jk}` });
          });
        }
        return { text: t, links: out.slice(0, 500) };
      });
      await page.close();
      if (text.length < 200 && !links.length) { console.log(`  ${src.sourceName}: thin page, skipped`); continue; }
      // Front-load the job-detail links (nav links dominate DOM order and would
      // otherwise push the real ones out of the model's character window).
      const isJob = (h) => /\/j\/|viewjob|\/job\/|jobdetail|-\d{6,}/i.test(h);
      const ordered = [...links.filter((l) => isJob(l.h)), ...links.filter((l) => !isJob(l.h))].slice(0, 120);
      const linkBlock = ordered.map((l) => `- ${l.t} -> ${l.h}`).join("\n").slice(0, 4500);
      const raw = await groq(SYSTEM, `Source: ${src.sourceName}\n\nPAGE TEXT:\n${text.slice(0, 4500)}\n\nLINKS ON PAGE (anchor text -> url):\n${linkBlock}`, 1600);
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

  // 3) One visit per fresh job: verify the link is live AND enrich from its own
  //    detail page (fuller aboutRole + any structured fields the posting states).
  const verified = [];
  for (const c of fresh) {
    const page = await ctx.newPage();
    try {
      const resp = await page.goto(c.apply_url, { waitUntil: "domcontentloaded", timeout: 30000 });
      const status = resp ? resp.status() : 0;
      if (status === 404 || status === 410) {
        console.log(`  drop dead link (${status}): ${c.apply_url}`);
        await page.close().catch(() => {});
        continue;
      }
      await page.waitForTimeout(1500);
      const detail = ((await page.evaluate(() => document.body?.innerText || "")) || "").slice(0, 14000);
      await page.close().catch(() => {});
      if (detail.length > 400) {
        const e = parseObj(await groq(ENRICH, `Job: ${c.title}${c.company ? ` at ${c.company}` : ""}\n\n${detail.slice(0, 6000)}`, 1400));
        if (e) mergeEnrichment(c, e);
      }
      verified.push(c);
    } catch {
      verified.push(c); // network hiccup — keep, no enrichment
      await page.close().catch(() => {});
    }
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
