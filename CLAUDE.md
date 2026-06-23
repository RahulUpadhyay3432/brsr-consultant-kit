# Saaksh (formerly BRSR Consultant Kit) — Project Context for Claude Code

## What This Is

A web tool for independent ESG consultants in India who prepare BRSR (Business Responsibility and Sustainability Reporting) reports for their clients.

**Brand:** the product is now **Saaksh** (Sanskrit *sākṣya*: evidence/witness — the brand soul is defensible, cited data). "BRSR Consultant Kit" was the original name; all user-facing brand strings now read "Saaksh" (the "BK" logo monogram is now "S"). **"BRSR" still refers to the regulation everywhere** — only the product name changed. Positioned as a compliance platform that **starts with BRSR**, with CBAM / CCTS / broader ESG as future modules. (Domain still `brsr-consultant-kit.vercel.app` until a Saaksh domain is purchased.)

**Two parts now (freemium):**
1. **Free readiness tool** (the original) — consultant fills a structured intake form → tool generates a client-specific BRSR readiness report instantly, **entirely client-side, no login, nothing stored**. Lives at `/`.
2. **Collect** — a **login-gated, backend-powered data-collection system** (the intended **paid tier**, validated by practising consultant *Priya*). Lets a consultant chase BRSR data from a client's team, auto-compute emissions, and generate a draft. Lives at `/requests/*`, `/submit/*`, `/login`. See the "Collect" section below.

The "100% on-device / no data stored" framing applies to **(1) only**. Collect deliberately stores data (securely) — that was a pragmatic stance for a free-and-shared tool, not a core vision; commercial + secure removes the need for it.

Live: https://brsr-consultant-kit.vercel.app · Repo: https://github.com/RahulUpadhyay3432/brsr-consultant-kit

## Project Status — last updated 2026-06-23

**Global help widget + keyword "ask" bot (shipped 2026-06-23):** A persistent floating **Help** button (bottom-right) now appears on **every page** (mounted as `<HelpWidget/>` in `src/app/layout.tsx`; hidden only on `/login`). Its panel has (1) the "How it works" steps and (2) an **ask box** that keyword-matches a curated KB — **no AI, fully on-device**, so it can only surface vetted answers. Files: `src/data/help_topics.json` (~25 entries, `howto` product-usage + `glossary` BRSR-basics), `src/lib/help-search.ts` (pure `searchHelp()` — tokenize + stopword-drop + keyword/title overlap scoring + phrase bonus; `help-search.test.ts`, 8 vitest cases), `src/components/HelpWidget.tsx` (floating button + panel + expandable results + quick-question chips + Compliance-Chat fallback). The report's old top-bar "How it works" button was **removed** (the global widget supersedes it); `WalkthroughModal` was deleted; `Walkthrough.tsx` now exports `StepRow` + `WALKTHROUGH_STEPS` (reused by both the first-run `WalkthroughCard` and the HelpWidget), and the first-run card hint points to the Help button. **Note:** the homepage redesign + color revamp are being done by the user externally (a redesign prompt + palette + reference sites were provided in chat), so this build made **no homepage changes**.

**Rebrand to Saaksh + platform repositioning + first-run help (shipped 2026-06-23):** The product was renamed **BRSR Consultant Kit → Saaksh** across every surface (free-tool + report + Collect headers/sidebars, `/login`, `/submit`, Resend emails, the jsPDF brief footer + header, `layout.tsx` metadata title, two KB-JSON `source` strings; the "BK" monogram → "S"). "BRSR" the regulation is untouched. The **landing page is repositioned** from "a BRSR readiness tool" to "**Saaksh — a compliance platform that starts with BRSR**": the hero subtext signals the platform, and a new **Modules section** (above the final CTA in `LandingPage.tsx`) shows **BRSR = "Available now"** plus **CBAM / CCTS / broader ESG** as desaturated **"Coming soon"** cards. A **first-run help walkthrough** was added so the product is self-explanatory at launch: a dismissible "New here? Here's the sequence" card on the report **Overview** (persisted via `STORAGE_KEYS.walkthroughSeen`, survives "New report") **plus** an always-on **"How it works"** button in the report top bar that reopens the same steps in a modal — both render from `src/components/Walkthrough.tsx` (`WALKTHROUGH_STEPS` + `WalkthroughCard` + `WalkthroughModal`). **Approved-but-not-yet-built:** an **AI narrative draft** feature for the Collect tier (per-principle grounded prose via **Groq**'s OpenAI-compatible API — model `openai/gpt-oss-120b`, endpoint `https://api.groq.com/openai/v1/chat/completions`, rotating across the user's 6 `GROQ_API_KEY*` keys to spread free-tier limits; persisted as a `narrative` JSONB column on `brsr_requests`, a new Groq client mirroring `email.ts`'s best-effort fetch pattern, hard no-fabrication guardrails) — needs the user to set the `GROQ_API_KEY*` env vars + run one SQL line (`ALTER TABLE brsr_requests ADD COLUMN narrative jsonb;`) first; full design in the plan file. (Switched from Anthropic to Groq per the user; note `llama-3.3-70b-versatile` is deprecated on Groq's free tier as of 2026-06-17.) The report-walkthrough modal mentioned below was **superseded the same day by the global HelpWidget** — see the entry above. A **full visual/color revamp is deferred** (user is sourcing color themes; do it as its own pass so work isn't redone twice).

**Free readiness tool (Tab/report side) — shipped & live:** SEBI source links per disclosure · service-sector differentiation (Business Type toggle + `not_applicable` status) · per-principle best practices · MSCI/DJSI ESG Ratings Alignment section · "Suggested Materiality" reframe + shortlist · upload-last-year's-report client-side detection · company-name autocomplete · **localStorage session persistence** · **DataChecklist decomposed** into the `checklist/` module · **embedded GHG Scope 1 & 2 + energy + water calculators** (P6-E1/E7/E3, cited factors) · **Sources & Methodology** reference panel · A & B collected-tracking + last-year detection · **CSV export** ("Export CSV" on the Action Plan = full Section A/B/C with status/gap/how-to-collect/collected flags; **Materiality "Assessment template"** = suggested topics pre-filled with empty scoring/decision columns for the consultant's stakeholder process, honestly framed as a starting format; client-side `src/lib/export.ts`, RFC-4180 + formula-injection guard + UTF-8 BOM, opens in Excel, nothing leaves the browser) · **TNFD (nature) mapping** in the Alignment tab — an indicative BRSR↔TNFD crosswalk over the nature-related disclosures (water/pollution/waste/biodiversity/land), kept in `src/data/tnfd_mappings.json` and merged in `report-generator`; teal pillar badge + filter + stat card alongside GRI/TCFD/IFRS · **"Download PDF"** report export — a **code-generated** (jsPDF, client-side, on-device) **company-facing "BRSR data request" brief**: the gaps grouped by plain theme + the team that usually owns each item (HR/EHS/energy manager/company secretary) with typical sources, plus an "already covered" note when filings are entered. `src/lib/report-pdf.ts` (`downloadReportPdf`); deliberately NOT the 108-field dump (that's the CSV) and NOT browser-print (no Chrome header/footer or extension overlays). Replaced the old `window.print()` + `PrintReport` path (both retired). **Landing page** (`LandingPage.tsx`) is the homepage; "Start a free report" → the intake form (`page.tsx` view state); a saved session restores to the report only on a same-tab refresh (`sessionStorage` flag in `storage.ts`). Product North Star doc at `docs/PRODUCT.md` gates new features.

**Collect / data-request product (the paid backend tier) — shipped & live** (the big new thing; lives behind a passcode at `/requests`): consultant creates a per-client collection → adds multiple data owners (one-at-a-time via an "+ Add owner" button, each assigned their fields) → one-click **branded request email** (Resend) → owner fills a **no-login form** → **tracking dashboard** + **submission alert email to the consultant** → **auto-reminder cadence** (daily Vercel Cron) → **emissions auto-calc** from submitted activity data, with **per-input attribution** (input → factor + source → who submitted) and a **GHG methodology statement** → **draft BRSR responses** (deterministic, printable, no fabrication) → **evidence/document attachment** (owners upload supporting bills/invoices per field → stored in private Supabase Storage bucket `brsr-evidence` → signed-URL view for the consultant on the detail page → listed in the draft under "Supporting evidence (for assurance)" with a BRSR Core reasonable-assurance note). Stack: **Supabase** (Postgres via PostgREST + service_role + Storage REST API) + **Resend** + **Vercel Cron** + **middleware passcode auth**. Validated by consultant *Priya*, who also offered webinars/partnership (see `[memory]/priya-call-feedback.md`).

**Collect UI polish (shipped 2026-06-16):** `CopyLinkButton` component replaces raw owner URLs (copy + open affordance); chasing visibility — reminder cadence surfaced on each owner card ("Emailed N days ago · X reminders sent"); teaching empty state for campaigns with no owners yet; `bg-forest` primary buttons + `pressable` micro-interactions across all Collect screens; em-dash copy scrubbed throughout.

**Reporting period + Layer 2 (shipped 2026-06-17, from Priya's feedback):** (1) **Reporting period** — every collection now carries a BRSR financial year (FY select on create, defaulting to the most recently completed year), shown on the request email, the owner's submission form, the campaign header and the draft. (2) **Layer 2 — collect against the full BRSR format** — the Add-owner picker now offers the **entire BRSR format (Section A + B + C, 133 fields)** flattened from the readiness KB (`brsr_data_points.json`) via `brsrRequestFields()`, replacing the curated 9-field MVP list. Each request field carries its **BRSR coordinates** (`field_section` / `field_principle` / `field_indicator_type` columns on `brsr_request_items`), rendered as **code chips** on owner cards and used to **group the draft by Section → Principle** so collected values map straight back into the report. The picker is searchable/collapsible (Section A, Section B, P1–P9, with Essential/Leadership tags). The two granular **activity inputs** (`P6-E1-elec`, `P6-E1-diesel`) are preserved under P6 so the GHG auto-calc is untouched. Verified end-to-end (picker, code chips, emissions, draft grouping).

**Next up:** monetization (freemium + Razorpay) · real per-consultant accounts (Supabase Auth + RLS, replacing the single passcode) · Scope 3 calculator · CBAM module.

**Key docs:** `docs/PRODUCT.md` (product principles + IA + ship-gate) · `docs/DECISIONS.md` (the *why* behind each feature, from consultant feedback — read before changing things).

> Maintenance note for Claude: keep this block + the rest of CLAUDE.md current as features ship, and keep `[memory]/consultant-feedback-roadmap.md` in sync. This file is auto-loaded each session, so it is the primary way a new chat learns the current state.

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
- **Session persistence** via `localStorage` (`src/lib/storage.ts`): the report restores on refresh (intake form is persisted + regenerated in `page.tsx`); collected items + upload detection persist (in `useChecklistState`); "New report" clears the session. Still 100% on-device.
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
│   └── page.tsx        # Main page — 3 client-side views: LandingPage (default) → IntakeForm ("Start a free report") → ReportView (on submit). Returning visitors with a saved session restore straight to the report.
├── components/
│   ├── LandingPage.tsx         # Marketing homepage (hero + live product panels, sources bar, how-it-works, 3 feature sections, dark Trust + founder note, stats band, final CTA). All on-brand live HTML/CSS, no screenshot assets. "Start a free report" → onStart switches page.tsx to the form view.
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

- Notion/Linear aesthetic — clean, minimal, professional
- Brand tokens (globals.css): `--brand-500: #00d4a4`, `--brand-800: #00745a`, `--forest: #111111` (near-black, logo + primary buttons)
- Background: warm off-white `#F7F6F2` with subtle glow (`.bg-grid`), 1.5px brand-gradient hairline on top
- Status badges: emerald (Ready to pull), amber (Needs verification), stone (Collect fresh), slate (Not applicable)
- Framework badges: blue (GRI), violet (TCFD/MSCI), emerald (IFRS), amber (DJSI); indigo for the "Last year" upload tag
- Fonts: Geist Sans (local) for body, Georgia for `.font-display` headings
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
