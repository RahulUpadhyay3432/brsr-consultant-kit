# BRSR Consultant Kit — Project Context for Claude Code

## What This Is

A free web tool for independent ESG consultants in India who prepare BRSR (Business Responsibility and Sustainability Reporting) reports for their clients. Consultant fills a structured intake form → tool generates a client-specific BRSR readiness report instantly, entirely client-side.

Live: https://brsr-consultant-kit.vercel.app · Repo: https://github.com/RahulUpadhyay3432/brsr-consultant-kit

## The Report Outputs

After the intake form is submitted, `ReportView` shows a header (client identity + gap-analysis stats) and **two tabs**, with a third output as an always-open accordion below them:

1. **Action Plan (BRSR Data Collection Checklist)** — Tab 1. All BRSR disclosure fields (P1–P9, Essential + Leadership), grouped by principle in collapsible sections. The UI surfaces **108 fields**. Each field has a status, auto-derived by cross-referencing the client's selected compliance filings:
   - `already_tracked` → **"Ready to pull"** (emerald) — data exists in an existing filing
   - `partially_tracked` → **"Needs verification"** (amber) — partially covered, one piece missing; the collapsed row shows an inline `Missing: …` note
   - `new_data_needed` → **"Collect fresh"** (stone) — not in any filing
   Filterable by status, principle, and indicator type (Essential/Leadership), plus search. Expandable rows show "Pull from" (source filing), the gap, "How to collect?" guidance, verbatim SEBI language, and unit. Consultants can **"Mark as collected"** to track progress (animated checkmark), with a "Hide collected" toggle. There is **no Source column** — source is shown inside the expanded panel.
2. **Materiality Assessment** — Tab 2. Pre-populated material ESG topics for the client's industry, shown as a **clean card grid grouped by Environment / Social / Governance**. Each card shows the topic, why it's material, and the BRSR principles it maps to. (Note: the earlier interactive SVG scatter plot with 1–5 scoring was **removed** — do not reintroduce it.)
3. **International Framework Mapping** — Below the tabs, **not a tab**. An always-open `AdvancedFrameworks` accordion in `ReportView.tsx` wrapping `FrameworkMapper`. BRSR ↔ GRI ↔ TCFD ↔ IFRS S1/S2 mapping table (~68 mappings) with GRI/TCFD/IFRS count chips in the header, expandable rows, and framework/TCFD-pillar filtering.

## Tech Stack

- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- No component library (custom components)
- No database, no auth, no backend — all report generation is client-side from pre-extracted JSON knowledge base files
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

## Compliance Chat

A separate RAG chatbot (Python, on Hugging Face Spaces, trained on BRSR/CBAM/CCTS regs) is linked via a **"Compliance Chat ↗" button in the header** (`page.tsx`) that opens in a new tab: https://huggingface.co/spaces/sherlockwatson221/climate-compliance — Python can't deploy on Vercel, so native integration (Railway backend + React chat UI) is a planned V2 item.

## Intake Form Fields

1. Client company name (text, optional)
2. Industry (dropdown): Textile & Apparel, Food & Beverage, Cement, Steel & Metals, Pharmaceuticals, IT Services, Chemicals, Automotive, Power & Energy, Construction, Other
3. Company size (radio): Listed top 1000 | Listed outside top 1000 | Unlisted supplier to listed company | Unlisted not in value chain
4. Reporting maturity (radio): First-time filing | 1-2 years | 3+ years improving
5. Export markets (multi-select chips): EU, USA, UK, Middle East, Southeast Asia, None
6. Existing compliance filings (multi-select chips): PCB (CTE/CTO), ZLD, Hazardous Waste, EPR Registration, Factory Act, PAT Scheme, None
7. Primary processes (free text, optional)

## Knowledge Base — 4 JSON Files in `src/data/`

### `brsr_data_points.json`

- Source: ICAI Background Material on BRSR (Revised Edition 2024) + SEBI March 2025 amendments
- Structure: `{ principles: [{ id: "P1", essential_indicators: [{id, label, unit, measurement_guidance}], leadership_indicators: [...] }], section_a_general_disclosures: [...], section_b_management_process_disclosures: [...] }`
- 9 Principles, 72 essential indicators, 40 leadership indicators = 112 data points in the file (the generated checklist surfaces 108 to users)

### `compliance_overlaps.json`

- Maps existing compliance filings to BRSR fields they already cover
- **Inconsistent nesting**: `e_waste_rules_2022` is under `filings.e_waste_rules_2022`, while `plastic_waste_epr_2022`, `hazardous_waste_2016`, `ghg_intensity_2025` are at root level
- Each filing has `data_already_tracked: [{ metric, maps_to_brsr_id, maps_to_brsr_label, coverage: "full"|"partial"|"supplementary", gap }]`

### `industry_material_topics.json`

- 10 industries (no "other" — that's handled with generic fallback in code)
- Structure: `{ industries: { textile_and_apparel: { environment: [{topic, brsr_principles, why_material}], social: [...], governance: [...] } } }`

### `framework_mappings.json`

- 68 BRSR ↔ GRI ↔ TCFD ↔ IFRS S1/S2 crosswalk mappings
- Structure: `{ mappings: [{ brsr_id, brsr_label, brsr_section, gri_standard, gri_label, tcfd_pillar, tcfd_detail, ifrs_reference, notes }] }`

## File Structure

```
src/
├── app/
│   ├── fonts/          # Geist fonts (local — GeistVF.woff, GeistMonoVF.woff)
│   ├── globals.css     # Tailwind + brand tokens, badges, motion system, micro-interactions
│   ├── layout.tsx      # Root layout — metadata + GA4 + Vercel Analytics
│   └── page.tsx        # Main page — toggles IntakeForm/ReportView; header has Compliance Chat button
├── components/
│   ├── IntakeForm.tsx        # 7-field structured form
│   ├── ReportView.tsx        # Container: header stats + 2 tabs + AdvancedFrameworks accordion
│   ├── DataChecklist.tsx     # Tab 1: checklist with gap analysis + "Mark as collected"
│   ├── MaterialityMatrix.tsx # Tab 2: E/S/G card grid (no scatter plot)
│   └── FrameworkMapper.tsx   # Cross-framework mapping (rendered inside AdvancedFrameworks)
├── data/
│   ├── brsr_data_points.json
│   ├── compliance_overlaps.json
│   ├── framework_mappings.json
│   └── industry_material_topics.json
└── lib/
    ├── types.ts          # All TypeScript interfaces, enums, label maps
    └── report-generator.ts # Core logic: processes form data against JSON files
```

## Core Logic Flow (in `report-generator.ts`)

1. Takes IntakeFormData from the form
2. **Checklist generation**: Iterates all BRSR principles/indicators. Shows leadership indicators only for listed companies or 3+ year maturity. Cross-references selected compliance filings against `compliance_overlaps.json` to set each field's status (`already_tracked` / `partially_tracked` / `new_data_needed`). Filing-to-JSON-key mapping handles the user's selected filings → actual JSON keys.
3. **Materiality topics**: Looks up industry in `industry_material_topics.json`. For "other" industry, returns a generic set of universal topics. (Scoring metadata may exist but the UI no longer renders a scored chart — it's a card grid.)
4. **Framework mappings**: Returns all 68 mappings from `framework_mappings.json`. UI handles filtering.

## Design System

- Notion/Linear aesthetic — clean, minimal, professional
- Brand tokens (globals.css): `--brand-500: #00d4a4`, `--brand-800: #00745a`, `--forest: #111111` (near-black, used for logo + primary buttons)
- Background: warm off-white `#F7F6F2` with a subtle atmospheric glow (`.bg-grid`), 1.5px brand-gradient hairline at the top
- Status badges: emerald (Ready to pull), amber (Needs verification), rose/stone (Collect fresh)
- Framework badges: blue (GRI), violet (TCFD), emerald (IFRS)
- Fonts: Geist Sans (local) for body, Georgia for `.font-display` headings
- **Motion system** (Corporate personality, `cubic-bezier(0.2,0,0,1)`, 160/280/420ms): classes `.anim-up-sm`, `.anim-up-md`, `.anim-up-hero`, `.anim-card` for staggered entrance/reveal choreography
- **Micro-interactions**: `.pressable` (hover lift + active press), `.chip-spring` (elastic toggle chips), `.check-path` (SVG checkmark draw). All respect `prefers-reduced-motion`.
- Tab icons are inline SVGs (no emoji)

## Footer

"Built by Rahul Upadhyay" with:

- LinkedIn: https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/
- Email: rahulu626@gmail.com

## Roadmap (validated by real consultant feedback — prioritized)

1. **SEBI source links** per gap field (quick win — add a `sebi_url` and render in expanded panel)
2. **Product vs. service-sector differentiation** — suppress manufacturing-only disclosures for IT/service clients in `report-generator.ts` (confirmed logic gap)
3. **Best practices by sector** — suggest Indian/international best practices per gap
4. **MSCI + DJSI rating mapping** — extend the framework mapper
5. **Embedded data collection + calculation** (GHG Scope 1/2/3, energy/water intensity) — gated: only build once 3+ consultants independently confirm the need
- Also on Rahul's own roadmap: client-facing data request export, CBAM module (EU exporters), AI-assisted gap analysis from an uploaded compliance document, native Compliance Chat integration.
