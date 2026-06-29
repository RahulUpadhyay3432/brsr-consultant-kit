// One-time generator for "what a complete answer looks like" guidance for each
// BRSR Section-C disclosure. Reads the public BRSR definitions, asks Groq for
// a short completeness-focused description per field, and writes a STATIC JSON
// that the Templates tab reads at runtime — zero ongoing tokens, no live calls.
//
// Run once (regenerate only missing entries on re-run):
//   $env:NODE_TLS_REJECT_UNAUTHORIZED="0"; node scripts/generate-quality-examples.mjs
//
// Grounded in the official SEBI/ICAI requirements only; no client data involved.
import { readFileSync, writeFileSync, existsSync } from "fs";

const ROOT = "c:/Users/msi79/brsr-consultant-kit";
const OUT = ROOT + "/src/data/brsr_quality_examples.json";

// --- keys (KEY=value in .env.local) ---
const env = readFileSync(ROOT + "/.env.local", "utf8");
const KEYS = [];
for (const l of env.split(/\r?\n/)) {
  const m = l.match(/^\s*GROQ_API_KEY(?:_\d+)?=(.+)$/);
  if (m) { const v = m[1].replace(/^["']|["']$/g, "").trim(); if (v.startsWith("gsk_")) KEYS.push(v); }
}
console.log("groq keys:", KEYS.length);
if (!KEYS.length) { console.error("no GROQ keys in .env.local"); process.exit(1); }

// --- fields: all Section-C indicators ---
const kb = JSON.parse(readFileSync(ROOT + "/src/data/brsr_data_points.json", "utf8"));
const fields = [];
for (const p of kb.principles) {
  for (const ind of [...(p.essential_indicators || []), ...(p.leadership_indicators || [])]) {
    fields.push({ id: ind.id, principle: p.id, label: ind.label, guidance: ind.measurement_guidance || "" });
  }
}
console.log("section-C fields:", fields.length);

const SYSTEM =
  "You advise ESG consultants on BRSR (India's Business Responsibility and Sustainability Report). " +
  "For each Section-C disclosure, describe what a complete, assurance-ready answer typically includes: " +
  "the level of data granularity expected, the specific data points that assurers look for, and one " +
  "common gap consultants miss. 2-3 sentences max. Do NOT invent specific company names or actual " +
  "figures. Describe the structure and completeness of a strong answer, not a fabricated example. " +
  "No preamble, no markdown, no bullet points.";

async function generate(f, salt) {
  const user =
    `BRSR field ${f.id} (Principle ${f.principle}).\n` +
    `Official requirement: ${f.label}\n` +
    `Measurement guidance: ${f.guidance}\n\n` +
    `What does a complete, assurance-ready answer to this disclosure typically include?`;
  const body = JSON.stringify({
    model: "openai/gpt-oss-20b", max_tokens: 200, temperature: 0.2, reasoning_effort: "low",
    messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }],
  });
  for (let i = 0; i < KEYS.length; i++) {
    const key = KEYS[(salt + i) % KEYS.length];
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body, cache: "no-store",
      });
      if (r.ok) { const d = await r.json(); const t = d?.choices?.[0]?.message?.content; if (t && t.trim()) return t.trim(); }
      else if (![429, 401, 403].includes(r.status)) console.error(f.id, r.status, (await r.text().catch(() => "")).slice(0, 120));
    } catch (e) { console.error(f.id, "err", e.message); }
  }
  return null;
}

// Resume: keep any already-generated entries, only fill the gaps.
let examples = {};
if (existsSync(OUT)) { try { examples = JSON.parse(readFileSync(OUT, "utf8")).examples || {}; } catch { /* fresh */ } }

const failed = [];
for (let i = 0; i < fields.length; i++) {
  const f = fields[i];
  if (examples[f.id]) continue;
  const t = await generate(f, i);
  if (t) examples[f.id] = t; else failed.push(f.id);
  if ((i + 1) % 10 === 0 || i === fields.length - 1) console.log(`${i + 1}/${fields.length} done (missing: ${failed.length})`);
}

const out = {
  _meta:
    "Guidance on what a complete, assurance-ready BRSR Section-C answer looks like, generated once via " +
    "Groq (openai/gpt-oss-20b) and shipped as static data in the free Templates tab. Describes completeness " +
    "and data granularity expected by assurers; no specific companies or actual figures are named. " +
    "Regenerate with scripts/generate-quality-examples.mjs.",
  examples,
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("wrote", Object.keys(examples).length, "examples; failed:", failed.join(",") || "none");
