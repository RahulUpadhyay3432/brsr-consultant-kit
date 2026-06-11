# BRSR Consultant Kit — Project Context for Claude Code

## What This Is

A free web tool for independent ESG consultants in India who prepare BRSR (Business Responsibility and Sustainability Reporting) reports for their clients. Consultant fills a structured intake form → tool generates a client-specific BRSR readiness report instantly, entirely client-side.

Live: https://brsr-consultant-kit.vercel.app · Repo: https://github.com/RahulUpadhyay3432/brsr-consultant-kit

## Project Status — last updated 2026-06-10

**Shipped & live** (all deployed to production): SEBI source links per disclosure · service-sector differentiation (Business Type toggle + `not_applicable` status) · per-principle best practices · MSCI/DJSI ESG Ratings Alignment section · "Suggested Materiality" reframe + disclaimer · upload-last-year's-report client-side detection · company-name autocomplete with industry/sector auto-fill · **localStorage session persistence** (report + collected + detection survive refresh) · **DataChecklist decomposed** into the `checklist/` module (was 1,118 lines) · **embedded GHG Scope 1 & 2 + energy + water intensity calculators** in P6 rows (P6-E1, P6-E7, P6-E3) with cited India emission factors. Product North Star doc at `docs/PRODUCT.md` gates new features.

**Next up:** peer/competitor benchmarking (gated on sourcing real cited BRSR data by sector), CBAM module, client data-request export, native Compliance Chat integration.

**Key docs:** `docs/PRODUCT.md` (product principles + IA + ship-gate) · `docs/DECISIONS.md` (the *why* behind each feature, from consultant feedback — read before changing things).

> Maintenance note for Claude: keep this block + the rest of CLAUDE.md current as features ship, and keep `[memory]/consultant-feedback-roadmap.md` in sync. This file is auto-loaded each session, so it is the primary way a new chat learns the current state.

## The Report Outputs

After the intake form is submitted, `ReportView` shows a header (client identity + gap-analysis stats) and **two tabs**, with two more outputs as accordions below them:

1. **Action Plan (BRSR Data Collection Checklist)** — Tab 1. Covers the **full BRSR**: a **Sections A & B card** at the top (collapsible "Section A · General disclosures" + "Section B · Management & process" — the ~23 entity/policy disclosures from `brsr_data_points.json`, rendered verbatim with SEBI page citations and a "where to collect" hint; these are *not* gap-analysed and are **excluded from the readiness gauge / status counts**, and hidden when a gap filter is active), then the **Section C** principle-wise gap analysis (P1–P9, Essential + Leadership), grouped by principle in collapsible sections. The UI surfaces **108 Section-C fields**. Each Section-C field has a status:
   - `already_tracked` → **"Ready to pull"** (emerald) — data exists in an existing filing
   - `partially_tracked` → **"Needs verification"** (amber) — partially covered, one piece missing; the collapsed row shows an inline `Missing: …` note
   - `new_data_needed` → **"Collect fresh"** (stone) — not in any filing
   - `not_applicable` → **"Not applicable"** (slate) — manufacturing-only disclosure suppressed for **service-sector** clients (see below); excluded from gap stats
   Filterable by status, principle, and indicator type (Essential/Leadership), plus search. **Expanded rows** show, in order: a "Found in last year's report" block (if a PDF was uploaded — see Upload feature), "Pull from" (source filing), the gap, "How to collect?" guidance, **Best practices** (India + International, per principle), verbatim **SEBI language**, **SEBI source** (link to the official BRSR Format PDF + ICAI page citation), and unit. Consultants can **"Mark as collected"** (animated checkmark) with a "Hide collected" toggle. No Source column — source lives in the expanded panel.
   - **Upload last year's report** (privacy-safe, client-side): a card at the top of this tab lets the consultant upload last year's BRSR/policy PDF. pdf.js extracts the text **in the browser** (file never leaves the device), keyword heuristics flag already-documented disclosures with a **"Last year"** badge + matched-text snippet, plus a "show found only" filter and "mark all detected as collected".
2. **Suggested Materiality** — Tab 2. A **suggested shortlist** of material ESG topics for the client's industry, as a card grid grouped by Environment / Social / Governance. Each card shows the topic, why it's material, and the BRSR principles it maps to. **Framed as a starting point, not a finished assessment** — there is a prominent disclaimer that a BRSR-compliant materiality assessment requires a stakeholder-engagement process. (The earlier interactive SVG scatter plot with 1–5 scoring was **removed** — do not reintroduce it. Do not re-inflate the "assessment" claim.)
3. **International Framework Mapping** — Accordion below the tabs (not a tab). `AdvancedFrameworks` in `ReportView.tsx` wrapping `FrameworkMapper`. BRSR ↔ GRI ↔ TCFD ↔ IFRS S1/S2 mapping table (~68 mappings) with count chips, expandable rows, framework/TCFD-pillar filtering. Open by default.
4. **ESG Ratings Alignment — MSCI & DJSI** — Second accordion below the framework mapper (`EsgRatingsSection` → `EsgRatingsMapper`). Principle-level crosswalk mapping each BRSR principle to MSCI ESG Key Issues (violet) and S&P Global CSA / DJSI criteria (amber). Closed by default to keep the report scannable.

## Tech Stack

- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- No component library (custom components)
- No database, no auth, no backend — all report generation is client-side from pre-extracted JSON knowledge base files
- **Session persistence** via `localStorage` (`src/lib/storage.ts`): the report restores on refresh (intake form is persisted + regenerated in `page.tsx`); collected items + upload detection persist (in `useChecklistState`); "New report" clears the session. Still 100% on-device.
- **Client-side PDF extraction**: `pdfjs-dist` (v4). Used only for the "upload last year's report" feature; dynamically imported so it stays out of the main bundle. The worker is served as a static file from `/public/pdf.worker.min.mjs` (a prebuild step copies it from node_modules — see below).
- Analytics: Google Analytics 4 (`G-GJBBQ6YPZL`) via `@next/third-parties/google`, plus `@vercel/analytics`
- Deployed on Vercel free tier (static)

## Deployment & Local-Machine Constraints (IMPORTANT)

This dev machine has an SSL cert issue (`UNABLE_TO_VERIFY_LEAF_SIGNATURE` on outbound HTTPS). Two consequences:

1. **Vercel CLI must run with the TLS check disabled** (PowerShell):
   ```powershell
   $env:NODE_TLS_REJECT_UNAUTHORIZED = "0"; vercel --prod --yes
   ```
2. **Do not use `next/font/google`** — it fetches at build time and fails the same way (caused an internal server error). Fonts are local only: Geist via `next/font/local`; the display font is **Georgia** set directly in `.font-display` in globals.css.

These are local-only issues — builds on Vercel's servers succeed. Standard loop: `npx next build` → commit/push → `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; vercel --prod --yes`.

**pdf.js worker gotcha**: pdfjs-dist v4 ships an ESM `.mjs` worker that webpack/Terser can't process via `new URL(...)`. The fix is to serve it as a static `/public/pdf.worker.min.mjs` and set `GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"`. `scripts/copy-pdf-worker.mjs` runs as the `prebuild` npm script to keep the public copy in sync with the pinned package version (a committed copy is the fallback if the copy ever fails).

## Compliance Chat

A separate RAG chatbot (Python, on Hugging Face Spaces, trained on BRSR/CBAM/CCTS regs) is linked via a **"Compliance Chat ↗" button in the header** (`page.tsx`) that opens in a new tab: https://huggingface.co/spaces/sherlockwatson221/climate-compliance — Python can't deploy on Vercel, so native integration (Railway backend + React chat UI) is a planned V2 item.

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
- 9 Principles, 72 essential + 40 leadership = 112 data points (checklist surfaces 108). `page` = ICAI Background Material page, surfaced as the SEBI source citation.

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
│   └── page.tsx        # Main page — toggles IntakeForm/ReportView; header has Compliance Chat button + "No data stored" badge
├── components/
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
- ✅ **Embedded GHG + energy + water calculators** — Scope 1 & 2 + intensity inside P6-E1, P6-E7, P6-E3 rows. CEA grid factor, IPCC/GHG-Protocol fuel factors, all cited. Inputs persist via localStorage. Shared state: fuel inputs entered in P6-E7 carry over to P6-E1 and vice versa. Scope 3 is next.

**Roadmap:** peer/competitor benchmarking (gated on sourcing real cited BRSR data), Scope 3 calculator expansion, client data-request export, CBAM module (EU exporters), native Compliance Chat integration.

**Calculator files:** `src/data/emission_factors.json` (factors + citations) · `src/lib/emissions-calculator.ts` (pure calc functions) · `src/components/checklist/EmissionsCalculator.tsx` (UI, ~280 lines). `CalcInputs` is stored in `useChecklistState` and persisted under the existing `session.checklist` localStorage key.
