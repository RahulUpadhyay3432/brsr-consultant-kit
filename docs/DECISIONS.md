# Product Decisions & Feedback Log

> The **why** behind this product. Features here were driven by real feedback from practising ESG/BRSR consultants (LinkedIn + WhatsApp outreach), and decided against the principles in [PRODUCT.md](PRODUCT.md). New contributors: read this to understand *why* things are the way they are before changing them.

## How we decide

- **Build from real consultant pain, not assumptions.** Every feature below traces to specific consultant feedback.
- **Gate against [PRODUCT.md](PRODUCT.md)** — JTBD fit, fits the information architecture, not clutter, trustworthy, client-ready.
- **Trust & accuracy are non-negotiable** — regulatory content is cited; nothing is fabricated; client data never leaves the browser.

## Consistent praise (don't break these)

Across consultants: the **materiality feature**, **navigation/UI** ("10/10"), **speed**, **detailed explanations**, and **user-friendliness**. Protect these when adding features.

---

## Shipped — feedback-driven features

### 1. SEBI source links (per disclosure)
**Asked:** "attach the SEBI guidance link for each gap." **Built:** each disclosure's expanded panel links to the official SEBI BRSR Format (Annexure II, 2023) PDF + an ICAI Background Material page citation.
**Key decision:** SEBI publishes *one consolidated format PDF*, not per-field deep links — so the link is principle-level and the ICAI page carries field-level precision. A fabricated per-field URL would 404 and destroy trust.

### 2. Service-sector differentiation
**Asked:** the tool flagged manufacturing disclosures as gaps for service-sector clients. **Built:** a "Business Type" toggle (smart-defaulted from industry, overridable); for service firms, 11 genuinely manufacturing-only disclosures get a `not_applicable` status instead of being flagged as gaps.
**Key decisions:** (a) a *filing overlap always wins* over N/A — real evidence beats a heuristic; (b) kept energy/water/GHG/e-waste/LCA *applicable* (service firms have those); only suppressed stack emissions, industrial effluent/ZLD, EIAs, PAT, product reclaim, EPR, sensitive-area ops. `MANUFACTURING_ONLY` set lives in `report-generator.ts`.

### 3. Best practices per gap
**Asked:** suggest Indian/international best practices for each gap. **Built:** India + International best practices in each expanded row.
**Key decision:** mapped **per-principle**, not per-field (would be thin/repetitive) or per-sector×principle (huge, redundant). Leading-practice is broadly consistent across sectors; *sector* nuance already lives in the Materiality tab. Clean division for the consultant.

### 4. MSCI + DJSI rating mapping
**Asked:** also map BRSR to MSCI and DJSI ESG ratings. **Built:** a dedicated "ESG Ratings Alignment" accordion.
**Key decision:** kept it a **separate section, not extra columns** on the GRI/TCFD/IFRS table — ratings are conceptually distinct from reporting frameworks, and these ratings assess at the *issue/criterion* level, so a principle-level crosswalk is both more accurate and more readable than a sparse 108-row table.

### 5. "Suggested Materiality" reframe
**Asked:** the materiality tab over-claimed; real materiality is a stakeholder process and priorities differ within a sector. **Built:** renamed to "Suggested Materiality," softened copy to a conversation-starter, added a prominent disclaimer.
**Key decision:** honesty over hype. **Do not re-inflate this into a "completed assessment."** (The earlier 1–5 scatter-plot scoring was removed even earlier — don't reintroduce it.)

### 6. Upload last year's report (auto-detect)
**Asked:** upload the previous report and auto-fill the parts that don't change (policies), then only ask for fresh inputs. **Built:** upload a PDF on the Action Plan → pdf.js extracts text *in the browser* → keyword detection flags already-documented disclosures with a "Last year" badge to confirm.
**Key decision (the big one):** **client-side, in-browser — the file never leaves the device.** The upload is a client's confidential, often pre-publication report; sending it to a server/LLM is a privacy/NDA dealbreaker and a liability. AI extraction is a *future opt-in enhancement*, never the default. (pdf.js worker is served as a static `/public` file to dodge a webpack/Terser issue.)

### 7. Company-name autocomplete
**Asked:** make the company field a searchable dropdown. **Built:** typeahead over ~150 Indian listed companies; picking one also auto-fills industry + business type (overridable).

---

## Architecture decisions

- **100% client-side, no backend.** Privacy (no data stored), zero-setup speed, free to run on Vercel static. This is core identity, not a limitation — protect it.
- **localStorage session persistence** (`src/lib/storage.ts`): report + collected items + upload detection survive a refresh; "New report" clears it. Added *before* the calculator, since calculator inputs must persist.
- **DataChecklist decomposed** (1,118 → 348-line container + `checklist/` module). The field-level `DisclosureRow` and the `useChecklistState` hook are isolated so new field features (e.g. the calculator) slot in without touching a giant file.

---

## Not built yet (intentionally)

- **Embedded GHG / data-collection calculator** — the strongest next candidate (2 independent consultant signals). Recommended MVP: GHG Scope 1 & 2 + energy/water intensity in the P6 rows, client-side, with **transparently-cited India emission factors** (CEA grid factor, IPCC/GHG-Protocol fuel factors); accuracy + annual upkeep of factors is the real catch. Then Scope 3. *Awaiting go-ahead.*
- **Peer/competitor benchmarking** — high value but **gated on sourcing real, cited past BRSR data** by sector. No fabricated numbers.
- **CBAM module** (EU exporters), **client data-request export**, native Compliance Chat integration — on the longer roadmap.
