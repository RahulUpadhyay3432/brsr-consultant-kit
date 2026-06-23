// One-time generator for the free-tier "In plain English" field explanations.
// Reads the public BRSR Section-C definitions, asks Groq (gpt-oss-20b) for a short
// plain-English explanation of each, and writes them to a STATIC JSON the UI reads
// at runtime — so the feature costs ZERO ongoing tokens and makes no live calls.
//
// Run once (regenerate only missing entries on re-run):
//   $env:NODE_TLS_REJECT_UNAUTHORIZED="0"; node scripts/generate-field-explainers.mjs
//
// Grounded in the official SEBI/ICAI text only — no client data is ever involved.
import { readFileSync, writeFileSync, existsSync } from "fs";

const ROOT = "c:/Users/msi79/brsr-consultant-kit";
const OUT = ROOT + "/src/data/brsr_field_explainers.json";

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
  "You explain BRSR (India's Business Responsibility and Sustainability Report) disclosures in plain English for an ESG consultant. " +
  "Use only what the official text asks for; never add requirements that aren't there. Reply with 2 to 3 short sentences: what the " +
  "disclosure asks for, and where a company usually gets that information. Plain language, no jargon, no preamble, no markdown, no bullet points.";

async function explain(f, salt) {
  const user =
    `BRSR field ${f.id} (Principle ${f.principle}).\n` +
    `Official requirement: ${f.label}\n` +
    `Measurement guidance: ${f.guidance}\n\n` +
    `Explain this disclosure in plain English.`;
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
let explainers = {};
if (existsSync(OUT)) { try { explainers = JSON.parse(readFileSync(OUT, "utf8")).explainers || {}; } catch { /* fresh */ } }

const failed = [];
for (let i = 0; i < fields.length; i++) {
  const f = fields[i];
  if (explainers[f.id]) continue;
  const t = await explain(f, i);
  if (t) explainers[f.id] = t; else failed.push(f.id);
  if ((i + 1) % 10 === 0 || i === fields.length - 1) console.log(`${i + 1}/${fields.length} done (missing: ${failed.length})`);
}

const out = {
  _meta:
    "Plain-English, AI-written explanations of each BRSR Section-C disclosure (Groq openai/gpt-oss-20b), generated once and shipped " +
    "as static data. Surfaced in the Action Plan to help consultants understand each field. Grounded in the public SEBI/ICAI " +
    "definitions; no client data is used; no runtime API calls. Regenerate with scripts/generate-field-explainers.mjs.",
  explainers,
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("wrote", Object.keys(explainers).length, "explainers; failed:", failed.join(",") || "none");
