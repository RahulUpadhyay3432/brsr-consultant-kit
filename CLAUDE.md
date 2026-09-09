# Saaksh (formerly BRSR Consultant Kit) — Project Context for Claude Code

## What This Is

A web tool for independent ESG consultants in India who prepare BRSR (Business Responsibility and Sustainability Reporting) reports for their clients.

**Brand:** the product is now **Saaksh** (Sanskrit *sākṣya*: evidence/witness — the brand soul is defensible, cited data). "BRSR Consultant Kit" was the original name; all user-facing brand strings now read "Saaksh" (the "BK" logo monogram is now "S"). **"BRSR" still refers to the regulation everywhere** — only the product name changed. Positioned as a compliance platform that **starts with BRSR**, with CBAM / CCTS / broader ESG as future modules. (Domain still `brsr-consultant-kit.vercel.app` until a Saaksh domain is purchased.)

**Two parts now (freemium):**
1. **Free readiness tool** (the original) — consultant fills a structured intake form → tool generates a client-specific BRSR readiness report instantly, **entirely client-side, no login, nothing stored**. Lives at `/`.
2. **Collect** — a **login-gated, backend-powered data-collection system** (the intended **paid tier**, validated by practising consultant *Priya*). Lets a consultant chase BRSR data from a client's team, auto-compute emissions, and generate a draft. Lives at `/requests/*`, `/submit/*`, `/login`. See the "Collect" section below.

The "100% on-device / no data stored" framing applies to **(1) only**. Collect deliberately stores data (securely) — that was a pragmatic stance for a free-and-shared tool, not a core vision; commercial + secure removes the need for it.

Live: https://brsr-consultant-kit.vercel.app · Repo: https://github.com/RahulUpadhyay3432/brsr-consultant-kit

## Project Status — last updated 2026-09-09

### ✅ DEPLOY STATE: pushed and live. origin/master == local == saaksh.co

Resolved 2026-09-09. The SEO + AEO sprint below is **live** — 10 commits pushed
(`1ee19da..7cb0b0c`) and deployed to `saaksh.co` (206 pages, clean build). Verified live after
deploy: `/brsr/p6-e1` renders in full, `/llms.txt` now serves the generated route listing every
post plus the 108 disclosures, the glossary and the statistics page, and `robots.txt` carries all
17 named crawler groups including OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
Perplexity-User, Google-Extended, Applebot, Amazonbot and Bingbot.

Deploys ship the WORKING TREE, so run `git status` before deploying. The deploy loop on this
machine is `npx next build` → `git push origin master` →
`$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; vercel --prod --yes`.

### The SEO + AEO sprint (2026-09-08)

Driven by the GA4 finding from 2026-09-04: **AI assistants are now 49% of 28-day sessions but
engage for 28s**, versus 1m24s for organic search. That is people arriving mid-question and not
finding the answer. The site was findable but leaked in specific places.

**What shipped (6 commits, in order):**

1. **`feat(seo)` — foundations.** Canonical URLs on every content route (there were **2 of 34**);
   app surfaces (`/report`, `/requests`, `/login`, `/submit`, `/clients`, `/demo`) set to noindex
   via new thin layouts; `/start` and `/latest` given their own `layout.tsx` with real titles (they
   were client components inheriting the generic root title). `dateModified` (new optional
   `updated` field on `BlogPost` → `lastTouched()`), visible "Updated" line, sitemap
   `lastModified`, `BreadcrumbList`, publisher logo, `articleSection`, `inLanguage` on all posts.
   **`llms.txt` moved from a hand-written `public/llms.txt` (which had rotted to 15 of 30 posts)
   to a generated route at `src/app/llms.txt/route.ts`** built from `BLOG_POSTS` + `INDUSTRY_LABELS`
   — it cannot go stale again, and leads with direct answers to the 8 most-asked questions.
   `robots.txt` rewritten: added OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
   Perplexity-User, Google-Extended, Applebot, Amazonbot; **fixed a group-scoping bug** (a named
   User-agent group does NOT inherit `*`'s rules, so every Disallow list is repeated per group).
2. **`content(blog)` — FAQ backfill.** 15 of 30 posts had no FAQ; now all do. 60 new grounded
   Q&As (117 pairs total), each drawn from what the post already says so page and schema cannot
   disagree. Those 15 posts marked `updated: "2026-09-08"`.
3. **`feat(brsr)` — 108 disclosure reference pages.** New `src/lib/brsr-fields.ts` assembles one
   record per Section C disclosure from data already in the repo (`brsr_data_points.json` +
   `brsr_field_explainers.json` + `brsr_quality_examples.json` + `brsr_plain_language.json` +
   `brsr-owners.ts`). Pages at **`/brsr/<code>`** (e.g. `/brsr/p6-e1`) + a hub at **`/brsr`**.
   Each emits FAQPage, BreadcrumbList and DefinedTerm; 1050–1341 words, none thin.
   **Site went 90 → 199 pages.**
4. **`feat(reference)` — `/glossary` (56 terms, DefinedTermSet, per-term anchors) and
   `/brsr/statistics`** ("BRSR by the numbers": every load-bearing figure with its primary source
   and vintage, emitted as a `Dataset`, explicitly free to quote). Note `/brsr/statistics` is a
   static segment that correctly takes precedence over the `/brsr/[code]` dynamic route.
5. **`content(blog)` — 5 new posts** answering what the consultant WhatsApp group asks and nothing
   on the web answers: `brsr-consulting-fees-india` (refuses to invent a benchmark — none exists —
   and instead gives the method, consistent with the proposal builder's "never assert a market
   price" stance; asks readers to contribute to an anonymous benchmark),
   `csr-funds-carbon-credits-india` (MCA has issued **no** clarification naming carbon credits, so
   the post says so and reasons from the three general CSR tests; the answer turns on who owns the
   credits), `gri-notification-requirement-9`, `iso-14001-45001-document-register`,
   `ccts-accredited-carbon-verifier-india`. All fact-checked via web search against primary
   sources before writing. **206 pages, 35 posts.**
6. **`docs`** — `docs/distribution-playbook.md` + `scripts/shoot-product.mjs` (below).

**Strategic call made deliberately:** did NOT write more BRSR principle guides. 30 posts already
saturate BRSR on our own site. The leverage is in (a) programmatic pages from data we own and
(b) questions with zero competition.

### `scripts/shoot-product.mjs` — repeatable product screenshots

Captures the product's main surfaces for design review. `node scripts/shoot-product.mjs`
(desktop 1440x900, 33 shots) and `--mobile` (390x844, 23 shots) → `docs/screenshots/`.
**The PNGs are gitignored (~100 MB, regenerable); the README indexing them and the script are
tracked.** Requires the dev server. Three things made the report screens fiddly, all commented in
the script: disclosure rows stay in the DOM while their principle section is collapsed; the sticky
principle header intercepts clicks on rows scrolled just beneath it (hence scroll-to-centre +
`force: true`); and section state persists between loop iterations so the toggle must be
conditional on `aria-expanded`. The consent banner is dismissed via the product's own `/notrack`.
**Known gap:** mobile captures the marketing pages, all 9 tools and the report Overview, but NOT
the report's inner tabs or the 4 embedded calculators (the report shell uses different navigation
at phone width).

### In flight: Lovable design exploration

The user is using **Lovable** to generate UI/UX design directions, starting with the calculators,
then possibly a whole-site pass. Workflow: user feeds Lovable screenshots + a prompt, brings the
output back, and **Claude Code reimplements it against the real token system** (Lovable returns
React/Tailwind/shadcn; Saaksh is inline styles + CSS custom properties, so its output is
**direction, not code**). Prompts already supplied in-session: a context primer (what the product
is, who the customer is), a calculator-redesign brief, and a two-step whole-site audit that first
forces Lovable to prove it can actually load saaksh.co (5 verification questions with known
answers) before accepting any audit — the confabulation risk is real.

### Open, in priority order

1. ~~Push + deploy the sprint.~~ **Done 2026-09-09 — it is live.** The next move is to re-run
   the AI-visibility audit in ~30 days (`docs/ai-visibility/saaksh-2026-09-09.md` is the dated
   baseline; the skill runs in delta mode against it) and see whether the five gaps the deploy
   was supposed to close actually closed.
2. **Distribution** — `docs/distribution-playbook.md` is the plan. The 2-hour version: Bing
   Webmaster Tools + sitemap (ChatGPT's search leans on Bing's index), Google Search Console +
   sitemap + request indexing on `/brsr` and `/glossary`, answer the 3 zero-competition Quora
   questions (fees, ACVA, CSR-carbon-credits), change the email ask to a named artifact, mark the
   4 GA4 key events.
3. **Seed the two empty boards** (`/jobs` gigs, `/directory`) — by hand, asking posters. Do NOT
   scrape the WhatsApp group.
4. Lovable output → reimplement against Saaksh tokens.
5. Send the ECS approach (`docs/ECS-proposal.html`, written since July, still not sent).

### AI visibility baseline (2026-09-09)

Ran the `seo-intel` AI-visibility play against nine buyer questions. Saaksh is cited on 2 of 9
(1 of 8 excluding the brand query) — and where it appears it is *cited*, not merely mentioned, and
described accurately, so the failure mode is absence rather than misrepresentation. Five of the
seven misses were content already built and undeployed, which is what triggered the push above.
The two that the deploy does not fix: **BRSR Core assurance** (`/tools/audit-readiness` is live but
lost to nine competitors with dedicated pages — an answer-shape and titling problem, not an
absence) and **the consultant directory** (cannot compete while empty; Upwork and Guru own it).
Dated snapshot and method caveats in `docs/ai-visibility/saaksh-2026-09-09.md`; re-run in delta
mode, do not re-baseline.

The gtm-skills SEO set is now installed alongside the AEO set already present
(`~/.claude/skills/`): `seo-intel`, `seo-topic-research-pipeline` and its seven standalone phases,
and `patent-backed-seo-quick-wins`.

## Project history — moved out of this file

Every earlier "Project Status" block (2026-09-04 back to 2026-06-16 — the GA4 read, the WhatsApp
group analysis, the jobs board, the Brief, Collect, the Pro overhaul, the design system re-themes,
the security hardening, every shipped feature and the reasoning behind it) now lives in
**`docs/HISTORY.md`**. Read it when you need the why behind an existing feature or want to check
whether something was already tried. It was split out on 2026-09-09: this file is auto-loaded into
every session, and at 161k characters it was spending ~40k tokens of context before any work began.

**Backlog beyond the priority list above:** monetization (freemium + Razorpay) · real
per-consultant accounts (Supabase Auth + RLS, replacing the single shared passcode) · verify the
scanned-bill OCR live once Gemini billing is topped up · run the `brsr_jobs` CREATE TABLE SQL to
switch the jobs scraper on · optional `ALTER TABLE brsr_jobs ADD COLUMN IF NOT EXISTS sections
jsonb;` for structured JDs on scraped roles.

**Key docs:** `docs/PRODUCT.md` (product principles + IA + ship-gate) · `docs/DECISIONS.md` (the
*why* behind each feature, from consultant feedback — read before changing things) ·
`docs/HISTORY.md` (everything shipped, newest first) · `docs/distribution-playbook.md` (the
current GTM plan).

> Maintenance note for Claude: keep the Project Status block above current as features ship, and
> keep `[memory]/consultant-feedback-roadmap.md` in sync. When a sprint's entry stops being the
> current state, move it down into `docs/HISTORY.md` rather than letting this file grow — it is
> auto-loaded each session and is the primary way a new chat learns where things stand.

## Pending manual TO-DOs (not in the code — only you can do these)

Carried forward from earlier sessions; each is still open unless you've since done it.

- **Run the `brsr_jobs` CREATE TABLE SQL** in the Supabase SQL editor — the jobs scraper stays dark
  until then (all its GitHub repo secrets are already set). Optional follow-up for structured JDs on
  scraped roles: `ALTER TABLE brsr_jobs ADD COLUMN IF NOT EXISTS sections jsonb;`
- **`ALTER TABLE brsr_contacts ADD COLUMN received_at timestamptz;`** — until then the owner card
  shows the sent date but never a received date.
- **Mark the 4 GA4 key events** (`report_generated`, `pro_access_requested`, `newsletter_subscribed`,
  `gig_submitted`) in GA4 Admin — events have been firing since 2026-09-04.
- **Paste the real WhatsApp invite** into `COMMUNITY_WHATSAPP_URL` (`src/lib/links.ts`) — the join
  CTA renders "Invite link coming soon" while it's an empty placeholder.
- **Drop `public/logos/tata-motors.png`** — the avatar falls back to a monogram without it.
- Optional: build the two Mixpanel funnels (`report_generated`→`pdf_downloaded`,
  `autofill_completed`→`suggestions_applied`).

Schema note: PostgREST can't do DDL, so every migration is SQL you run by hand in Supabase. Code is
written to degrade gracefully before a migration lands, so a missing table or column is never fatal.

## Standing don'ts (decided deliberately — don't quietly undo them)

- **Don't seed `/jobs` gigs or `/directory` from the consultant WhatsApp group.** Those posts carry
  real names and phone numbers and were shared in a private space. Ask the poster.
- **Don't extend `/brief`.** The PWA, swipe feed and web-push build has ~3 users and 0 returning
  (GA4, 2026-09-04). It works; it just has no audience.
- **Don't pitch Discord climate servers** (Climate Town, Zero Waste) — anti-commercial by culture.
  The real audience is the ESG Leader's Forum WhatsApp, NGOBOX consulting groups, AGSP, r/ESGIndia.
- **Don't reintroduce a monospace font** or `var(--font-plex-mono)` (retired product-wide as
  unprofessional; the Tailwind `mono` token deliberately points at the Hanken sans stack).
- **Don't reintroduce the materiality scatter plot** or re-inflate "shortlist" into "assessment".
- **Don't move the free on-device modules behind Pro** (Scope 3, cross-framework export, CBAM/CCTS
  readiness, templates). Free = understand & prepare on your device; Pro = the workspace that does
  the work. The free modules are the funnel and cost nothing to serve.
- **Don't commit** the untracked root `*.png`/`*.jpeg` screenshots or a temp `_shoot.mjs`.

## The Report Outputs

After the intake form is submitted, `ReportView` shows a header (client identity + gap-analysis stats) and **two tabs**, with two more outputs as accordions below them:

1. **Action Plan (BRSR Data Collection Checklist)** — Tab 1. Covers the **full BRSR**: a **Sections A & B card** at the top (collapsible "Section A · General disclosures" + "Section B · Management & process" — the ~23 entity/policy disclosures from `brsr_data_points.json`, rendered verbatim with SEBI page citations and a "where to collect" hint; these are *not* gap-analysed and are **excluded from the readiness gauge / status counts**, and hidden when a gap filter is active — but they **do** carry a per-row **"mark collected"** toggle and, for **Section B policies**, the same **"Last year"** detection as Section C (policies recur year-to-year, so they're the strongest auto-detect case; `SB-*` signals live in `report-extractor.ts`). The card header shows collected + last-year counts, and the **Overview** surfaces an "General disclosures · A & B" progress card (collected / detected — read from the persisted checklist state, framed as collection progress, **not** folded into the Section-C readiness gauge)), then the **Section C** principle-wise gap analysis (P1–P9, Essential + Leadership), grouped by principle in collapsible sections. The UI surfaces **108 Section-C fields**. Each Section-C field has a status:
   - `already_tracked` → **"Ready to pull"** (emerald) — data exists in an existing filing
   - `partially_tracked` → **"Needs verification"** (amber) — partially covered, one piece missing; the collapsed row shows an inline `Missing: …` note
   - `new_data_needed` → **"Collect fresh"** (stone) — not in any filing
   - `not_applicable` → **"Not applicable"** (slate) — manufacturing-only disclosure suppressed for **service-sector** clients (see below); excluded from gap stats
   Filterable by status, principle, and indicator type (Essential/Leadership), plus search. **Expanded rows** show, in order: a "Found in last year's report" block (if a PDF was uploaded — see Upload feature), "Pull from" (source filing), the gap, "How to collect?" guidance, **Best practices** (India + International, per principle), verbatim **SEBI language**, **SEBI source** (link to the official BRSR Format PDF + ICAI page citation), and unit. Consultants can **"Mark as collected"** (animated checkmark) with a "Hide collected" toggle. No Source column — source lives in the expanded panel.
   - **Upload last year's report** (privacy-safe, client-side): a card at the top of this tab lets the consultant upload last year's BRSR/policy PDF. pdf.js extracts the text **in the browser** (file never leaves the device), keyword heuristics flag already-documented disclosures with a **"Last year"** badge + matched-text snippet, plus a "show found only" filter and "mark all detected as collected".
2. **Suggested Materiality** — Tab 2. A **suggested shortlist** of material ESG topics for the client's industry, as a card grid grouped by Environment / Social / Governance. Each card shows the topic, why it's material, and the BRSR principles it maps to, plus an **"Add to shortlist"** toggle: the consultant *selects* (not "collects") the topics to carry into the client's stakeholder process — a **working note, deliberately not an assessment**. The shortlist persists client-side (`STORAGE_KEYS.materiality`, cleared on "New report"), with a count summary + a "show shortlist only" filter. **Framed as a starting point, not a finished assessment** — there is a prominent disclaimer that a BRSR-compliant materiality assessment requires a stakeholder-engagement process. (The earlier interactive SVG scatter plot with 1–5 scoring was **removed** — do not reintroduce it. Do not re-inflate the "assessment" claim — "shortlist" is a working selection, not a determination.)
3. **International Framework Mapping** — Accordion below the tabs (not a tab). `AdvancedFrameworks` in `ReportView.tsx` wrapping `FrameworkMapper`. BRSR ↔ GRI ↔ TCFD ↔ IFRS S1/S2 mapping table (~68 mappings) with count chips, expandable rows, framework/TCFD-pillar filtering. Open by default.
4. **ESG Ratings Alignment — MSCI & DJSI** — Second accordion below the framework mapper (`EsgRatingsSection` → `EsgRatingsMapper`). Principle-level crosswalk mapping each BRSR principle to MSCI ESG Key Issues (violet) and S&P Global CSA / DJSI criteria (amber). Closed by default to keep the report scannable.

## Tech Stack

- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- No component library (custom components)
- **Free readiness tool is client-side** — all report generation runs in the browser from pre-extracted JSON knowledge base files; no DB/auth/backend for that half.
- **Collect tier has a backend** (added on top, doesn't touch the free tool): **Supabase** Postgres accessed via its PostgREST REST API with the `service_role` key (server-only; see `src/lib/datarequest/db.ts` — no `@supabase/*` SDK, just `fetch`); **Resend** for transactional email (`src/lib/datarequest/email.ts`, REST, Resend-or-stub, best-effort); **Vercel Cron** for the daily reminder job (`vercel.json` → `/api/cron/reminders`, `CRON_SECRET`-gated); **Next.js server actions** for mutations; **middleware passcode auth** (`src/middleware.ts`) gating `/requests/*`. Supabase tables are `brsr_`-prefixed and **RLS-locked** (only the server's service_role can touch them).
- **Session persistence** via `localStorage` (`src/lib/storage.ts`): the intake form is persisted and the report is regenerated from it by the `/report` route (so a refresh/bookmark of `/report` just rebuilds it); collected items + upload detection persist (in `useChecklistState`); "New report" (`clearReportSession()`) clears the session. The URL now decides which view (landing/form/report), so the old per-tab `sessionStorage` "active session" flag was removed. Still 100% on-device.
- **Client-side PDF extraction**: `pdfjs-dist` (v4). Used only for the "upload last year's report" feature; dynamically imported so it stays out of the main bundle. The worker is served as a static file from `/public/pdf.worker.min.mjs` (a prebuild step copies it from node_modules — see below).
- Analytics: Google Analytics 4 (`G-GJBBQ6YPZL`) via `@next/third-parties/google`, plus `@vercel/analytics`
- Deployed on Vercel free (Hobby) tier — the free tool is static; Collect adds dynamic server-rendered routes + server actions + a daily cron (Hobby cron is once-per-day max)

## Deployment & Local-Machine Constraints (IMPORTANT)

This dev machine has an SSL cert issue (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` on outbound HTTPS). Two consequences:

1. **Vercel CLI must run with the TLS check disabled** (PowerShell):
   ```powershell
   $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"; vercel --prod --yes
   ```
2. **Do not use `next/font/google`** — it fetches at build time and fails the same way (caused an internal server error). Fonts are local only: Geist via `next/font/local`; the display font is **Georgia** set directly in `.font-display` in globals.css.

These are local-only issues — builds on Vercel's servers succeed. Standard loop: `npx next build` → commit/push → `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; vercel --prod --yes`.

**Collect needs env vars** (all in `.env.local`, gitignored; the same names set on Vercel **production** via `vercel env add`, value piped so it's never echoed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `APP_BASE_URL` (the deployed URL, so email links are absolute), `CONSULTANT_PASSCODE` (the `/requests` gate), `CRON_SECRET`, `CONSULTANT_NOTIFY_EMAIL` (where submission alerts go). **Local dev that exercises Collect must run with the TLS bypass too** (it makes outbound HTTPS to Supabase/Resend): `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npm run dev`. **Resend caveat:** until a sending domain is verified, Resend only delivers to the account's own inbox — fine for the demo, and sends are best-effort so non-deliverable recipients never error.

**Two more local-machine gotchas (both cost a session to rediscover):** running `next build` and then
`npm run dev` on this Windows machine **corrupts `.next`** (a `webpack.js` ENOENT 500 on `/report`) —
`rm -rf .next` before `npm run dev` fixes it. And `next build` has **OOM'd under RAM pressure** here;
`NODE_OPTIONS="--max-old-space-size=4096" npx next build` fixes that.

**AI provider limits that shape the code:** Groq free tier is **8000 TPM per key**, so a big request
413s — hence small prompts, `reasoning_effort: low`, ~5s spacing and rotation across the 6
`GROQ_API_KEY*` keys. And a PostgREST dedup filter `in.(...)` holding hundreds of long URLs
**overflows the request line and silently fails** — the jobs scraper and the Brief both fetch the
stored-URL set and intersect locally instead. **⚠️ Gemini keys were credit-exhausted (429) when the
scanned-bill OCR shipped, so its extraction accuracy is UNVERIFIED — and Gemini is also the text
importer's PRIMARY path (`extractFromChunk`; Groq is only the fallback), so check Gemini billing
before trusting either.**

**pdf.js worker gotcha**: pdfjs-dist v4 ships an ESM `.mjs` worker that webpack/Terser can't process via `new URL(...)`. The fix is to serve it as a static `/public/pdf.worker.min.mjs` and set `GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"`. `scripts/copy-pdf-worker.mjs` runs as the `prebuild` npm script to keep the public copy in sync with the pinned package version (a committed copy is the fallback if the copy ever fails).

## Compliance Chat

A separate RAG chatbot (Python, on Hugging Face Spaces, trained on BRSR/CBAM/CCTS regs) is linked via a **"Compliance Chat ↗" button in the header** (`page.tsx`) that opens in a new tab: https://huggingface.co/spaces/sherlockwatson221/climate-compliance — Python can't deploy on Vercel, so native integration (Railway backend + React chat UI) is a planned V2 item.

## Collect — the data-request product (paid tier, backend)

The killer feature from Priya's feedback: collecting BRSR data from a client's team is the consultant's #1 time-sink (different numbers live with different people; manual email/WhatsApp chasing). Collect turns that into: **request → alert-on-submit → auto-reminders → collect → emissions calc (attributed) → draft.**

**Auth (MVP):** a single shared passcode (`CONSULTANT_PASSCODE`) gates `/requests/*` via `src/middleware.ts` (httpOnly cookie, `/login` page). The free tool (`/`) and the recipient pages (`/submit/*`) stay public. Real per-consultant accounts (Supabase Auth + per-user RLS) are the planned replacement, arriving with monetization.

**Data model (Supabase, `brsr_`-prefixed, RLS-locked):** `brsr_requests` (a campaign = one client; has `reporting_period`) → `brsr_contacts` (data owners; each has a unguessable `token`, `status`, `last_emailed_at`, `reminders_sent`) → `brsr_request_items` (the fields assigned to a contact: `field_id/label/unit/kind/category`, the BRSR coordinates `field_section/field_principle/field_indicator_type`, `value`, `status`, `evidence_path/evidence_name`). Schema changes are run by the user as SQL in the Supabase SQL editor (PostgREST can't DDL).

**Flow & files** (all under `src/lib/datarequest/` + `src/app/requests|submit|api`):
- **Consultant** logs in → `/requests` (collections list) → `/requests/new` (create campaign) → `/requests/[id]` (detail). On the detail page: an **"+ Add a data owner"** panel (`components/datarequest/AddOwnerPanel.tsx`, client; reveals the form, one owner per send), the **owners list** (status + per-owner secure link), the **emissions panel** (dark, with attribution + methodology), and a **"Generate draft"** button.
- **`addContactAction`** inserts the contact + items, timestamps `last_emailed_at`, and sends the **branded request email** (`email.ts` → `sendRequestEmail`, reusing `buildRequestEmail`).
- **Recipient** opens `/submit/[token]` (no login), fills values → **`submitDataAction`** writes them, sets contact status, and fires **`sendSubmissionAlert`** to `CONSULTANT_NOTIFY_EMAIL`.
- **Reminders:** `/api/cron/reminders` (GET, `CRON_SECRET`-gated; `vercel.json` runs it daily) iterates campaigns; `cadence.ts → dueReminder()` decides (3-day interval, max 3, "final" near deadline); sends a reminder variant and `markReminded()`.
- **Emissions:** `emissions.ts` — `campaignEmissions()` (totals via the existing cited `calcGhg`) + `emissionInputs()` (per-input **attribution**: value → factor + source → who submitted) + `GHG_METHODOLOGY` (the statement surfaced under every figure). Only Scope 1 (diesel) + Scope 2 (grid electricity) are wired so far (fields `P6-E1-diesel`, `P6-E1-elec`).
- **Draft:** `draft.ts → buildDraft()` + `/requests/[id]/draft` — a **deterministic, printable** draft of BRSR responses from collected data (grouped by section + the emissions block with basis + a "nothing is invented" disclaimer). No AI narrative (that would risk fabrication; it'd be a clearly-labelled opt-in later).
- **Shell:** `/requests/*` are wrapped in `src/app/requests/layout.tsx` (+ `components/datarequest/CollectNav.tsx`) so Collect uses the same sidebar/chrome as the report — one product. `/submit` and `/login` keep standalone layouts.

**Invariants:** drafts/calcs never fabricate (every figure is a submitted value or computed from one via cited factors); email is **best-effort** (never throws — Vercel FS is read-only, Resend rejects unverified recipients); the request-field list is the **full BRSR format** built by `brsrRequestFields()` in `fields.ts` (flattened from `brsr_data_points.json` — Section A + B + C, 133 fields, each with its coordinates), with the two `P6-E1-elec` / `P6-E1-diesel` activity inputs preserved for the GHG calc. Static display labels (principle short names, section labels) live in `brsr-meta.ts` so the client picker imports them without pulling in the KB JSON.

## Intake Form Fields (in `IntakeForm.tsx`)

1. **Client company name** — autocomplete typeahead (`CompanyAutocomplete` + `companies.json`). Typing filters ~150 Indian listed companies; picking one fills the name and **auto-selects its industry + business type** (overridable). Free text allowed for any company. Optional.
2. **Industry** (dropdown): Textile & Apparel, Food & Beverage, Cement, Steel & Metals, Pharmaceuticals, IT Services, Chemicals, Automotive, Power & Energy, Construction, Other
3. **Business Type** (radio): Product/Manufacturing | Services. Smart-defaulted from the industry via `inferDefaultSector()` (it_services → services; all else → manufacturing) and overridable. Drives the `not_applicable` suppression of manufacturing-only disclosures.
4. **Company size** (radio): Listed top 1000 | Listed outside top 1000 | Unlisted supplier to listed company | Unlisted not in value chain
5. **Reporting maturity** (radio): First-time filing | 1-2 years | 3+ years improving
6. **Export markets** (multi-select chips): EU, USA, UK, Middle East, Southeast Asia, None
7. **Existing compliance filings** (multi-select chips): PCB (CTE/CTO), ZLD, Hazardous Waste, EPR Registration, Factory Act, PAT Scheme, None

## Knowledge Base — JSON files in `src/data/`

### `brsr_data_points.json`
- Source: ICAI Background Material on BRSR (Revised Edition 2024) + SEBI March 2025 amendments
- Structure: `{ principles: [{ id, essential_indicators: [{id, label, unit, measurement_guidance, page}], leadership_indicators: [...] }], section_a_…, section_b_… }`
- 9 Principles, 68 essential + 40 leadership = 108 data points (all surfaced in the checklist). `page` = ICAI Background Material page, surfaced as the SEBI source citation. (Section A = 26 datapoints in 11 grouped rows; Section B = 12.)

### `compliance_overlaps.json`
- Maps existing compliance filings to BRSR fields they already cover
- **Inconsistent nesting**: `e_waste_rules_2022` is under `filings.e_waste_rules_2022`; `plastic_waste_epr_2022`, `hazardous_waste_2016`, `ghg_intensity_2025` are at root level
- Each filing: `data_already_tracked: [{ metric, maps_to_brsr_id, maps_to_brsr_label, coverage, gap }]`

### `industry_material_topics.json`
- 10 industries (no "other" — generic fallback in code). `{ industries: { <industry>: { environment: [{topic, brsr_principles, why_material}], social, governance } } }`

### `framework_mappings.json`
- 68 BRSR ↔ GRI ↔ TCFD ↔ IFRS S1/S2 crosswalk mappings. `{ mappings: [{ brsr_id, brsr_label, brsr_section, gri_standard, gri_label, tcfd_pillar, tcfd_detail, ifrs_reference, notes }] }`

### `best_practices.json`
- Per-principle India + International best practices (named standards: SBTi, ISO 14001/45001/37001/27001/20400, ZLD, UNGPs, DPDP Act, GHG Protocol, AA1000, SROI…). `{ best_practices: { P1: { name, india: [...], international: [...] }, … } }`. Imported directly in `DataChecklist`, keyed by principle.

### `esg_ratings_mapping.json`
- Principle-level BRSR → MSCI Key Issues + S&P CSA/DJSI criteria crosswalk. `{ ratings: {...}, mappings: [{ brsr_principle, principle_name, msci_pillar, msci_key_issues, djsi_dimension, djsi_criteria, note }] }`. Imported directly in `EsgRatingsMapper`.

### `companies.json`
- ~150 curated Indian listed companies (BRSR filers). `{ companies: [{ name, industry, sector }] }`. `industry: "other"` for banks/NBFCs/insurers/telecom/retail/diversified that don't map to the 11 industries. Powers the company-name autocomplete + industry/sector auto-fill.

## File Structure

```
src/
├── app/
│   ├── fonts/          # Geist fonts (local — GeistVF.woff, GeistMonoVF.woff)
│   ├── globals.css     # Tailwind + brand tokens, badges, motion system, micro-interactions
│   ├── layout.tsx      # Root layout — metadata + GA4 + Vercel Analytics
│   ├── page.tsx        # Landing route (/) — renders <LandingPage>; surfaces a resume banner if a saved form exists.
│   ├── start/page.tsx  # Intake-form route (/start) — the form chrome + <IntakeForm>; onSubmit saves the form and pushes /report.
│   └── report/page.tsx # Report route (/report) — loads the saved form → generateReport → <ReportView> (regenerated on-device; redirects home if no saved form).
├── components/
│   ├── LandingPage.tsx         # Marketing homepage (hero + live product panels, sources bar, how-it-works, 3 feature sections, dark Trust + founder note, stats band, final CTA). All on-brand live HTML/CSS, no screenshot assets. "Start a free report" → onStart (the / route pushes /start).
│   ├── IntakeForm.tsx          # Structured intake form (company autocomplete, business-type toggle, etc.)
│   ├── CompanyAutocomplete.tsx # Typeahead for company name → auto-fills industry + sector
│   ├── ReportView.tsx          # Container: header stats + 2 tabs + 2 accordions
│   ├── DataChecklist.tsx       # Tab 1 CONTAINER — composes the checklist/ module below
│   ├── checklist/              # Decomposed Action Plan (was a 1,118-line DataChecklist)
│   │   ├── constants.ts        #   PRINCIPLES, STATUS_META, plain(), SEBI consts, BEST_PRACTICES
│   │   ├── useChecklistState.ts#   All state (filters/collected/upload/detection) + localStorage persistence
│   │   ├── UploadCard.tsx      #   "Upload last year's report" card (presentational)
│   │   ├── DisclosureRow.tsx   #   A row + expanded panel (field-level features slot in here)
│   │   ├── PrincipleSection.tsx#   Collapsible principle group
│   │   └── NavItem.tsx         #   Sidebar filter item
│   ├── MaterialityMatrix.tsx   # Tab 2: "Suggested Materiality" E/S/G card grid + disclaimer (no scatter plot)
│   ├── FrameworkMapper.tsx     # GRI/TCFD/IFRS crosswalk (inside AdvancedFrameworks)
│   └── EsgRatingsMapper.tsx    # MSCI/DJSI ratings alignment (inside EsgRatingsSection)
├── data/
│   ├── brsr_data_points.json
│   ├── compliance_overlaps.json
│   ├── framework_mappings.json
│   ├── industry_material_topics.json
│   ├── best_practices.json
│   ├── esg_ratings_mapping.json
│   └── companies.json
└── lib/
    ├── types.ts            # All TS interfaces, enums, label maps, inferDefaultSector()
    ├── report-generator.ts # Core logic: form data → checklist / materiality / framework mappings
    ├── pdf-extract.ts      # Client-side pdf.js text extraction (dynamic import)
    ├── report-extractor.ts # Keyword detection of documented disclosures from extracted text
    └── storage.ts          # SSR-safe localStorage helpers (session persistence)
public/pdf.worker.min.mjs   # pdf.js worker (served statically; kept in sync by scripts/copy-pdf-worker.mjs)
scripts/copy-pdf-worker.mjs # prebuild: copies the worker from node_modules → public
```

### Collect (paid tier) file map

```
src/
├── middleware.ts                       # passcode gate for /requests/*
├── components/
│   ├── SourcesPanel.tsx                # "Sources & Methodology" panel (in the report)
│   └── datarequest/
│       ├── CollectNav.tsx              #   sidebar nav for the Collect shell (client)
│       ├── AddOwnerPanel.tsx           #   "+ Add a data owner" → form (client)
│       ├── CopyLinkButton.tsx          #   copy + open affordance for the owner's secure link (client)
│       └── PrintButton.tsx             #   Save-as-PDF on the draft (client)
├── lib/datarequest/
│   ├── types.ts        # Campaign → Contact → Item domain types (Item has evidencePath + evidenceName)
│   ├── db.ts           # Supabase PostgREST access (service_role, server-only); setItemEvidence()
│   ├── actions.ts      # server actions: create campaign, add owner, submit data (evidence upload best-effort)
│   ├── auth.ts         # passcode login/logout server actions
│   ├── email.ts        # Resend-or-stub send; request + reminder + submission-alert emails
│   ├── cadence.ts      # pure dueReminder() reminder rule
│   ├── emissions.ts    # campaignEmissions + emissionInputs (attribution) + GHG_METHODOLOGY
│   ├── draft.ts        # buildDraft() — deterministic BRSR draft from collected data (includes evidence list)
│   ├── storage.ts      # Supabase Storage REST API (private bucket brsr-evidence); uploadEvidence + signedEvidenceUrl + signCampaignEvidence
│   ├── fields.ts       # brsrRequestFields() — full BRSR format (A+B+C, 133) flattened from the KB
│   └── brsr-meta.ts    # static section/principle display labels (no KB import — safe for the client picker)
└── app/
    ├── login/page.tsx
    ├── requests/
    │   ├── layout.tsx              # Collect app-shell (sidebar/topbar)
    │   ├── page.tsx                # collections list
    │   ├── new/page.tsx            # create campaign
    │   └── [id]/page.tsx           # campaign detail (owners + emissions + add-owner)
    │       └── draft/page.tsx      # printable draft
    ├── submit/[token]/page.tsx     # recipient form (no login)
    └── api/cron/reminders/route.ts # daily reminder cron (CRON_SECRET-gated)
vercel.json                         # Vercel Cron schedule
```

## Core Logic Flow (in `report-generator.ts`)

1. Takes `IntakeFormData` from the form.
2. **Checklist generation**: Iterates all BRSR principles/indicators. Leadership indicators only for listed companies or 3+ year maturity. Status resolution per field (`resolveStatus`): a compliance-filing overlap (real evidence) wins → `already_tracked`/`partially_tracked`; else if the client is **services** and the indicator is in `MANUFACTURING_ONLY` → `not_applicable`; else `new_data_needed`. Threads `page` through for the SEBI citation. `MANUFACTURING_ONLY` = P2-E3, P2-E4, P2-L4, P2-L5, P6-E2, P6-E4, P6-E5, P6-E6, P6-E11, P6-E12, P6-L3.
3. **Materiality topics**: Looks up industry in `industry_material_topics.json`; generic fallback for "other". (Scoring metadata may exist but the UI renders a card grid, not a chart.)
4. **Framework mappings**: Returns all 68; UI filters.
- **Best practices** and **ESG ratings** are static and imported directly in their components (`DataChecklist` / `EsgRatingsMapper`), not routed through `report-generator`.

## Design System

> **CURRENT palette — Vivid Blue + Coral (2026-06-27 re-theme).** The product UI now uses a vivid-blue accent (`brand-500 #1E9DF2`, primary `brand-600 #0B6FD4`), deep-navy dark surfaces (`forest #0F1E33` — rail / dark cards / dark sections), warm-coral status + pops (`ember #F2674A`), a near-white canvas (`page #FBFCFE`) with whisper-blue card tint (`tint #EAF4FE`), and **bold Hanken sans** for `.font-display` (the Newsreader serif is retired from product UI). The token NAMES (`forest`, `brand`, `ember`, `tint`) are unchanged — only their values — so the "Evergreen & Ember" notes below are accurate on structure but the green hexes they cite are **historical**; trust the values in `tailwind.config.ts` + `globals.css`.

- **Evergreen & Ember** — premium, editorial, calm (Vanta/Watershed/Linear-class)
- Brand tokens (tailwind.config.ts + globals.css): `--brand-500: #18C39A` (mint accent), `--brand-800/forest: #0E4A36` (deep evergreen — logo + primary buttons + dark sections); `brand` scale is mint→green, `brand-700 #0B6B4F` is the contrast-safe label-green; `ember #D9682E` + `gold #C2871B` for warm accents/statuses
- Background: cream paper `#FAF8F3` with subtle glow (`.bg-grid`), 1.5px evergreen hairline on top
- Status badges: green (Ready to pull), amber (Needs verification), **ember/orange** (Collect fresh), slate (Not applicable)
- Framework badges: blue (GRI), violet (TCFD/MSCI), emerald (IFRS), amber (DJSI); the "Last year" upload tag is now brand (was indigo)
- Fonts (self-hosted in `src/app/fonts/`): **Hanken Grotesk** body + display, **Newsreader** serif for `.font-editorial` big headings. **No monospace typeface** — the product uses zero mono (user found it unprofessional; retired 2026-07-03). The Tailwind `mono` token in `tailwind.config.ts` is deliberately repointed to the Hanken sans stack, so the ~200 legacy `font-mono` class usages (eyebrows/labels/code chips/numbers) all render Hanken; the IBM Plex Mono webfont + `--font-plex-mono` loader were removed. Don't reintroduce a mono font or `var(--font-plex-mono)`. For code/data chips use tinted-pill styling + `tabular-nums`, not a mono family.
- **Motion system** (`cubic-bezier(0.2,0,0,1)`, 160/280/420ms): `.anim-up-sm`, `.anim-up-md`, `.anim-up-hero`, `.anim-card`
- **Micro-interactions**: `.pressable`, `.chip-spring`, `.check-path`. All respect `prefers-reduced-motion`.
- Tab icons are inline SVGs (no emoji)

## Footer

"Built by Rahul Upadhyay" — LinkedIn: https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/ · Email: rahulu626@gmail.com

## Roadmap

The originally-validated top-5 consultant requests are now **shipped** (1–4 + materiality reframe + upload + autocomplete):

- ✅ **SEBI source links** — link to the official SEBI BRSR Format PDF + ICAI page, in each expanded row.
- ✅ **Product vs. service-sector differentiation** — Business Type toggle + `not_applicable` status for manufacturing-only disclosures.
- ✅ **Best practices by principle** — India + International, in each expanded row.
- ✅ **MSCI + DJSI rating mapping** — the ESG Ratings Alignment accordion.
- ✅ **Suggested Materiality reframe** — honest "starting point" framing + disclaimer.
- ✅ **Upload last year's report** — client-side PDF detection of already-documented disclosures.
- ✅ **Company-name autocomplete** — typeahead + industry/sector auto-fill.
- ✅ **Embedded GHG + energy + water calculators** — Scope 1 & 2 + intensity inside P6-E1, P6-E7, P6-E3 rows. CEA grid factor, IPCC/GHG-Protocol fuel factors, all cited. Inputs persist via localStorage. Shared state: fuel inputs entered in P6-E7 carry over to P6-E1 and vice versa.
- ✅ **Collect — the data-request product** (the paid backend tier): multi-owner collection, branded request + auto-reminder + submission-alert emails, no-login owner submission, emissions auto-calc with per-input attribution + a GHG-methodology statement, and deterministic printable drafts. Validated by consultant Priya. See the **Collect** section above.

- ✅ **Evidence/document attachment** (owners upload the supporting bill/invoice → assurance-readiness; private `brsr-evidence` Storage bucket + signed-URL view + draft "Supporting evidence" list).
- ✅ **Reporting period + Layer 2** (Priya's feedback): per-collection BRSR financial year; Collect now requests against the **full BRSR format** (Section A+B+C, 133 coded fields) with Section/Principle-grouped drafts. See the Project Status block.

**Roadmap:** monetization (freemium + **Razorpay**), real per-consultant accounts (**Supabase Auth + RLS**, replacing the single passcode), tie collections to a saved client, Scope 3 calculator expansion, peer/competitor benchmarking (gated on cited data), CBAM module, native Compliance Chat integration.

**Calculator files:** `src/data/emission_factors.json` (factors + citations) · `src/lib/emissions-calculator.ts` (pure calc functions) · `src/components/checklist/EmissionsCalculator.tsx` (UI, ~280 lines). `CalcInputs` is stored in `useChecklistState` and persisted under the existing `session.checklist` localStorage key.
