# BRSR Consultant Kit — Project Context for Claude Code

## What This Is

A free web tool for independent ESG consultants in India who prepare BRSR (Business Responsibility and Sustainability Reporting) reports for their clients. Consultant fills a structured intake form → tool generates 3 outputs instantly.

## The 3 Outputs

1. **BRSR Data Collection Checklist** — All BRSR disclosure fields (P1-P9, Essential + Leadership indicators) with gap analysis showing what the client already tracks through existing compliance filings vs what's additionally needed. Status badges: "Tracked" / "Partial" / "New". Filterable by principle, indicator type, status. Expandable rows showing measurement guidance, source filing, and gap notes.
2. **Materiality Assessment Template** — Pre-populated material ESG topics for the client's industry. Interactive SVG scatter plot (Importance to Stakeholders × Impact on Business). Editable 1-5 score buttons per topic that update the chart in real time. Color-coded by category (environment/social/governance).
3. **Cross-Framework Mapper** — BRSR ↔ GRI ↔ TCFD ↔ IFRS S1/S2 mapping table (~68 mappings). Expandable rows with detailed comparison notes. Filterable by framework and TCFD pillar.

## Tech Stack

- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- No component library (custom components)
- No database, no auth, no backend API calls in v1
- All report generation is client-side using pre-extracted JSON knowledge base files
- localStorage caching (keyed by form input hash)
- Deployment target: Vercel free tier

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
- 9 Principles, 72 essential indicators, 40 leadership indicators = 112 total

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
│   ├── fonts/          # Geist fonts (from create-next-app)
│   ├── globals.css     # Tailwind + custom styles (brand colors, badges, grid bg)
│   ├── layout.tsx      # Root layout with metadata
│   └── page.tsx        # Main page — toggles between IntakeForm and ReportView
├── components/
│   ├── IntakeForm.tsx   # 7-field structured form
│   ├── ReportView.tsx   # Container with 3 tabs + header with stats
│   ├── DataChecklist.tsx    # Output 1: checklist with gap analysis
│   ├── MaterialityMatrix.tsx # Output 2: scatter plot + editable table
│   └── FrameworkMapper.tsx   # Output 3: cross-framework mapping
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
2. **Checklist generation**: Iterates all BRSR principles/indicators. Shows leadership indicators only for listed companies or 3+ year maturity. Cross-references selected compliance filings against `compliance_overlaps.json` to find which BRSR fields are already tracked (full/partial). Filing-to-JSON-key mapping handles the user's selected filings → actual JSON keys.
3. **Materiality topics**: Looks up industry in `industry_material_topics.json`. For "other" industry, returns a generic set of 11 universal topics. Auto-scores stakeholder importance and business impact based on industry position, export markets (EU bumps environmental scores), and listing status.
4. **Framework mappings**: Returns all 68 mappings from `framework_mappings.json`. UI handles filtering.

## Design System

- Notion/Linear aesthetic — clean, minimal, professional
- Deep teal/forest green primary: `forest: #1a3a34`, brand palette from teal-50 to teal-900
- Background: stone-50 with subtle CSS grid pattern
- Status badges: emerald (tracked), amber (partial), rose (new)
- Framework badges: blue (GRI), violet (TCFD), emerald (IFRS)
- Font: Geist Sans (from Next.js)
- No emojis in UI except tab icons (📋, ◎, 🔗)

## Footer

"Built by Rahul Upadhyay" with:

- LinkedIn: https://www.linkedin.com/in/rahul-upadhyay26/
- Email: rahulu626@gmail.com

## Future (not in v1)

- Gemini API integration for enhanced gap analysis and "Other" industry handling
- PDF export of reports
- CBAM module, CCTS module
- Document upload for gap analysis against previous year's BRSR
