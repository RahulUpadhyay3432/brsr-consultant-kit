# Saaksh Pro — build roadmap

The ordered plan to turn Pro from "Collect only" into a complete, feature-packed
multi-framework compliance copilot. Every phase is grounded in code that already
exists, so each reuses real plumbing rather than starting from scratch. Build one
phase at a time, each on its own branch → master, each verified before the next.

Companion docs: `docs/pro-strategy.md` (the *why* / positioning + pricing),
`docs/importer-feature.md` (full spec for Phase 1), `docs/pro-pitch.md` (the 1:1
customer pitch).

## Where Pro stands today
- **Live:** the free readiness tool (on-device) + **Collect** (data-request backend:
  multi-owner collection, branded emails, auto-reminders, emissions auto-calc with
  attribution, evidence upload, deterministic + AI-narrative drafts).
- **Advertised but NOT built:** compliance importer, cross-framework export,
  multi-client workspace, proposal & fee builder, consultant network, and the
  beyond-BRSR frameworks (CBAM, CCTS, Scope 3). These are honest "Coming/Future"
  cards on the landing page.

## Locked decisions (2026-06-24)
1. **Compliance importer is built first** (the wedge; best webinar demo; reuses the most).
2. **Keep the shared passcode + manual onboarding for now** — the Supabase-Auth / RLS /
   Razorpay migration is a later phase (Phase 7), not a blocker for anything above it.
3. **CBAM / CCTS ship as lightweight readiness modules first**, not full liability
   calculators (those need regulatory benchmark datasets built + verified first).

## Cross-cutting invariants (every phase obeys these)
- **No fabrication.** AI drafts, a human verifies; every figure is a submitted value or
  a cited-formula computation; unknowns become `[needs your input]` / `[to be completed]`
  (the discipline already enforced in `src/lib/datarequest/narrative.ts`).
- **Privacy boundary stays crisp.** The **free tool is 100% on-device** ("client data
  never leaves your browser"). Any feature that makes an AI / server call is **Pro /
  backend** and lives under `/requests/*` (already authenticated, server-side).
  Display-only, no-AI features (e.g. cross-framework export) *can* also ship in the free
  report because they stay on-device.
- **Defensibility is the product.** Cited (SEBI / ICAI / CEA / IPCC / GHG Protocol),
  evidence-backed, reviewable. Defensibility is consultants' #1 objection.
- **Build / deploy constraints (this machine):** verify with `npx next build`; deploy with
  `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; vercel --prod --yes`; **never** use
  `next/font/google`; pipe secrets to Vercel, never echo them; `master == production`.
- **Reuse before adding:** `groqComplete()` (`src/lib/datarequest/groq.ts`),
  `extractPdfText()` (`src/lib/pdf-extract.ts`), `toCsv()` / `downloadCsv()`
  (`src/lib/export.ts`), the jsPDF brief (`src/lib/report-pdf.ts`), the calculator pattern
  (`src/lib/emissions-calculator.ts` + `src/components/checklist/EmissionsCalculator.tsx`),
  and the `DisclosureRow.tsx` "Last year" review UI.

---

## Build-order summary
| # | Phase | Why here | Effort | Surface |
|---|-------|----------|--------|---------|
| 1 | **Compliance importer** | The wedge; best demo; reuses everything | Medium | Pro (AI) |
| 2 | Cross-framework export | Cheapest win; data already exists | Low | Free + Pro |
| 3 | Scope 3 calculator | Extends the existing calculator | Medium | Free + Pro |
| 4 | CBAM + CCTS readiness | Platform story; lightweight first | Low–Med | Pro |
| 5 | Template / knowledge library | Cheap, constant demand | Low | Pro |
| 6 | Proposal & fee builder | Wins work, not just does it | Medium | Pro |
| 7 | Accounts + billing + workspace | Monetization foundation (deferred) | High | Pro |

---

## Phase 1 — Compliance importer (the wedge) · BUILD FIRST

**Job story:** *When I take on a client, I want to point the tool at their existing
reports and have the numbers pre-filled (for me to verify), so I skip the copy-paste
and go straight to the judgement work.*

Today's free "upload last year's report" only flags *which* disclosures appear
(keyword match → "Last year" badge). The importer extracts the actual *values* and maps
them to BRSR field ids as **reviewable suggestions**. Full spec: `docs/importer-feature.md`.

**Where it lives:** inside **Collect** (`/requests/[id]`) — it makes an AI call (text
leaves the browser ⇒ Pro / backend). It pre-fills a campaign's items for the consultant
to verify, cutting what they have to chase from data owners.

**Reuse:** `extractPdfText()` (client-side, in the panel) → server action →
`groqComplete()` grounded prompt → the existing review-row pattern from
`DisclosureRow.tsx`. Field grounding from `brsr_data_points.json` +
`brsr_field_explainers.json` + `brsr_plain_language.json`.

**New files / changes:**
- `src/lib/datarequest/importer.ts` — `extractValues(text, candidateFields)`: chunk the
  text, call `groqComplete()` with a grounded, extract-only prompt → returns
  `[{ fieldId, value, unit, sourceSnippet, confidence }]`. Never-throws (mirror
  `narrative.ts`); low-confidence / absent → omitted or `[needs your input]`.
- `src/components/datarequest/ImportPanel.tsx` (client) — "Import from an existing report"
  on the campaign detail page: file upload → `extractPdfText()` → POST extracted text to
  the action → render suggestions (value + **source sentence** + confidence) with
  confirm / edit per row.
- `src/lib/datarequest/actions.ts` — `importDocumentAction(campaignId, extractedText)`:
  `requireConsultant()` first; build the candidate-field list (the campaign's assigned
  items, else the full BRSR format via `brsrRequestFields()`); call `extractValues()`;
  return suggestions. A second confirm action writes accepted values via the existing
  `db.updateItem()` (value + status `received`) or `db.setItemPrior()` (year-on-year
  `prior_value`).
- `src/app/requests/[id]/page.tsx` — mount `<ImportPanel>` with the owners list.

**Defensibility:** extract-only (never estimate / round); every suggestion shows the
exact source sentence; nothing auto-applies — the consultant confirms each; grounded
`gpt-oss-20b` at low temperature. Scanned / image PDFs return no text → detect and tell
the user (no OCR in the MVP).

**Verify:** run 2–3 *real* client BRSR / annual-report PDFs through it; check that
suggested numbers + source sentences are correct on the high-value numeric fields
(energy kWh, diesel L, water kL, Scope 1/2 tCO₂e, headcount, training %). Build clean.
This is also the webinar demo, so polish the review UI.

---

## Phase 2 — Cross-framework export · CHEAP WIN

**Job:** *Collect once, report many* — emit the client's BRSR data mapped across
GRI / TCFD / IFRS / TNFD / MSCI / DJSI without re-keying. All the mapping data already
exists and is **display-only** today (`framework_mappings.json` 68 rows,
`tnfd_mappings.json` 16, `esg_ratings_mapping.json` 9 + MSCI / DJSI). No AI, on-device ⇒
can ship in the **free report** too.

**New files / changes:**
- `src/lib/framework-export.ts` — flatten the mappings into one wide table keyed by BRSR
  id (columns: BRSR id, label, GRI standard, TCFD pillar, IFRS ref, TNFD pillar, MSCI
  issues, DJSI criteria, + the client's current **status / value** from the generated
  report). Reuse `toCsv()` / `downloadCsv()` from `src/lib/export.ts` (RFC-4180 +
  formula-injection guard already there).
- `src/components/FrameworkMapper.tsx` (+ the Alignment accordion in `ReportView.tsx`) —
  add an **"Export mapping (CSV)"** button. Optional: a per-framework jsPDF sheet via
  `report-pdf.ts`.

**Verify:** export from a generated report; open in Excel; confirm every BRSR row carries
its GRI / TCFD / IFRS / TNFD columns and the client's status.

---

## Phase 3 — Scope 3 calculator · EXTENDS EXISTING PATTERN

**Job:** a screening-level Scope 3 estimate (BRSR P6-L2; BRSR Core phases it in from FY25
for the top 150 by market cap). Today only Scope 1 + 2 exist (`calcGhg()`); there is no
Scope 3 data or logic.

**New files / changes:**
- `src/data/scope3_factors.json` — spend-based / activity-based factors for the
  high-value categories (Cat 1 purchased goods, Cat 4/9 transport, Cat 6 business travel,
  Cat 7 commuting), **each cited** (GHG Protocol Scope 3 Standard, DEFRA / India sources).
  Mirror the shape + citation rigor of `emission_factors.json`.
- `src/lib/emissions-calculator.ts` — add `calcScope3(inputs)` alongside
  `calcEnergy` / `calcGhg` / `calcWater`, returning per-category tCO₂e + total + a method tag.
- `src/components/checklist/EmissionsCalculator.tsx` — a Scope 3 sub-panel on the P6-L2
  row, same input / persist pattern as Scope 1/2.

**Defensibility:** label clearly as a **screening estimate** (spend-based), with method +
source on every line; not assurance-grade. **Verify:** sanity-check totals against a
worked GHG-Protocol example.

---

## Phase 4 — CBAM & CCTS readiness modules · LIGHTWEIGHT (no calculators yet)

**Job:** answer "does this regulation hit my client, and what must they do?" — the
"compliance platform that starts with BRSR" promise. Today both are pure landing-page
labels (zero data / logic).

**New files / changes:**
- `src/data/cbam_readiness.json` — covered goods (iron & steel, aluminium, cement,
  fertiliser, hydrogen, electricity), what an EU exporter must report (embedded emissions;
  default vs actual values), key dates / phase-in, cited.
- `src/data/ccts_readiness.json` — India CCTS obligated sectors, the baseline-intensity-
  target concept, an MRV checklist, cited.
- A readiness surface (a report section or a `/requests`-side module page) that **flags
  applicability** — CBAM gated on the intake "EU" export-market selection; CCTS gated on
  sector / size — then shows a cited checklist + plain-English guidance. **No liability math.**

**Defensibility:** clearly "readiness / exposure," cited, with a "full quantification
coming" note. **Verify:** a steel exporter to the EU triggers the CBAM checklist; an
obligated-sector client triggers CCTS. Full liability calculators are a **deferred** later
phase.

---

## Phase 5 — Template & knowledge library · CHEAP, HIGH-DEMAND

**Job:** stop the 11pm hunt for materiality formats, report skeletons, and "how do I
actually answer P5 / human rights." Both consultant analyses named template-hunting as a
constant pain.

**New files / changes:**
- `src/data/pro_library.json` — curated, cited entries: a materiality assessment format, a
  BRSR report skeleton, P5 human-rights guidance, etc. (seed a handful; grow over time).
- A simple library list UI under `/requests/*`, each item downloadable via the existing
  CSV / PDF export machinery.

**Verify:** open + download each template.

---

## Phase 6 — Proposal & fee builder · WIN-THE-WORK TOOL

**Job:** *what should I quote, and how do I present this engagement?* — both analyses
flagged scoping / pricing as a recurring stress nobody tools. Input the client scope
(industry, size, frameworks in play, first-filing?) → generate a branded proposal
document + a **transparent, editable** fee estimate.

**New files / changes:**
- `src/lib/proposal.ts` — a **transparent rubric** (base by size / complexity ×
  frameworks × first-filing multiplier), fully editable by the consultant — not a
  black-box number.
- A proposal-input form (reuse the `IntakeForm` pattern) + a jsPDF proposal output (reuse
  `report-pdf.ts`).

**Defensibility / honesty:** the fee is a *starting estimate the consultant adjusts*,
shown with its rubric, not a quote we invent.

---

## Phase 7 — Accounts + billing + multi-client workspace · MONETIZATION FOUNDATION (deferred)

**Decision:** keep the shared passcode + **manual onboarding** until a few consultants are
paying; then do this once. It is the foundation that multi-client and self-serve billing
both need.

**Migration (when triggered):**
- **Auth:** replace `CONSULTANT_PASSCODE` (in `src/middleware.ts`,
  `src/lib/datarequest/auth.ts`, `src/lib/datarequest/guard.ts`) with **Supabase Auth**
  (email / OTP). Session JWT → `Authorization: Bearer` on the PostgREST calls.
- **Ownership + RLS:** add `consultant_id` to `brsr_requests`; per-user RLS policies on
  `brsr_requests` and (via `request_id`) `brsr_contacts` / `brsr_request_items` /
  `brsr_company_contacts`. `listCampaigns()` then auto-filters by owner (no query change);
  `createCampaign()` stamps `consultant_id`.
- **Billing:** Razorpay **per-engagement** checkout (matches seasonal billing) + a webhook
  that unlocks a client / campaign. New env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`; new
  `/api/payments/*` routes.
- **Multi-client workspace:** with real accounts, the `/requests` list becomes a
  per-consultant dashboard across all their clients; optionally a `companies` entity above
  campaigns.

Schema changes run as SQL by the user in the Supabase editor (PostgREST can't DDL).

---

## Out of scope (for now)
Full CBAM / CCTS liability calculators; finalizing a public price; the auth / Razorpay
migration (Phase 7 stays deferred until manual customers exist). Each phase is built and
verified on its own branch → master, on its own day.
