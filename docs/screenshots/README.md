# Product screenshots

Current-state captures of every screen that matters, for design review — feeding
screenshots to a design tool, briefing a designer, or diffing a redesign against
what shipped.

**Captured 2026-09-08** from `localhost:3000` against the working tree.

Regenerate with the dev server running:

```bash
rm -rf .next                                    # this machine corrupts .next after a build
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
node scripts/shoot-product.mjs                  # desktop 1440x900, 33 shots
node scripts/shoot-product.mjs --mobile         # mobile 390x844, 23 shots
```

Full-page captures at `deviceScaleFactor: 2`, so they are retina-sharp and safe to
crop into. The analytics consent banner is dismissed via the product's own
`/notrack` route, since it is a first-visit overlay rather than part of the
steady-state UI.

---

## Desktop, 1440×900

### Marketing and reference

| # | File | Screen |
|---|---|---|
| 01 | `01-home.png` | Homepage, full scroll |
| 02 | `02-pricing.png` | Pricing, Free vs Pro |
| 03 | `03-blog-index.png` | Blog index |
| 04 | `04-blog-post.png` | A blog post, long-form reading layout |
| 05 | `05-brsr-hub-108-disclosures.png` | `/brsr` hub, all 108 disclosures |
| 06 | `06-brsr-field-page.png` | A single disclosure reference page (P6-E1) |
| 07 | `07-glossary.png` | Glossary, 56 terms |
| 08 | `08-brsr-statistics.png` | BRSR by the numbers |
| 09 | `09-jobs-board.png` | Jobs board, master-detail |
| 10 | `10-consultant-directory.png` | Consultant directory (currently empty) |
| 11 | `11-latest-updates.png` | Latest regulatory updates feed |

### Calculators and tools, standalone pages

| # | File | Screen |
|---|---|---|
| 12 | `12-calc-ghg-scope-1-2.png` | **Scope 1 & 2 GHG calculator** |
| 13 | `13-calc-scope-3.png` | **Scope 3 screening calculator** |
| 14 | `14-calc-ppp-intensity.png` | **PPP-adjusted intensity calculator** |
| 15 | `15-calc-xbrl-preflight.png` | **XBRL pre-flight**, Lakh/Crore converter |
| 16 | `16-tool-applicability.png` | BRSR applicability checker |
| 17 | `17-tool-audit-readiness.png` | Audit-readiness checklist |
| 18 | `18-tool-wellbeing-schedule.png` | P3 wellbeing expense schedule |
| 19 | `19-tool-materiality.png` | Materiality matrix builder |
| 20 | `20-tool-framework-mapping.png` | Cross-framework mapping |

### The free tool, intake to report

| # | File | Screen |
|---|---|---|
| 21 | `21-intake-form-empty.png` | Intake form, empty |
| 22 | `22-intake-form-filled.png` | Intake form, filled (Tata Steel, Steel & Metals, listed top 1000, 3+ years, EU exports) |
| 23 | `23-report-overview.png` | Report Overview, readiness gauge and stats |
| 24 | `24-report-action-plan.png` | Action Plan, principle sections collapsed |
| 25 | `25-report-materiality.png` | Suggested Materiality |
| 26 | `26-report-alignment.png` | Cross-framework Alignment |
| 27 | `27-report-beyond-brsr.png` | Beyond BRSR, CBAM and CCTS readiness |
| 28 | `28-report-templates.png` | Templates, emails and guides |
| 29 | `29-report-sources.png` | Sources and methodology |

### Calculators embedded in the Action Plan

These only render inside an expanded disclosure row, so the script filters the
checklist to the code, opens the Principle 6 section, and expands the row.

| # | File | Screen |
|---|---|---|
| 30 | `30-calc-embedded-p6-e7-ghg-scope-1-2.png` | **GHG Scope 1 & 2**, on row P6-E7 |
| 31 | `31-calc-embedded-p6-e1-energy.png` | **Energy consumption**, on row P6-E1 |
| 32 | `32-calc-embedded-p6-e3-water.png` | **Water**, on row P6-E3 |
| 33 | `33-calc-embedded-p6-l2-scope-3.png` | **Scope 3 screening**, on row P6-L2 |

---

## Mobile, 390×844

Files 01–23 with a `-mobile` suffix, covering every marketing page, all nine
standalone tools and calculators, the intake form, and the report Overview.

**Not captured on mobile:** the report's inner tabs (Action Plan, Materiality,
Alignment, Beyond BRSR, Templates, Sources) and the four embedded calculators.
The report shell uses a different navigation at phone width, so the desktop tab
selectors do not apply. Use the desktop shots for those screens, or extend
`scripts/shoot-product.mjs` with a mobile navigation path if mobile versions are
needed.

---

## Known capture artifact

In some full-page desktop shots the sticky sidebar and top bar appear rendered
partway down the image rather than pinned. That is the standard interaction
between full-page capture and `position: fixed`, not a layout bug in the product.
The viewport-height shots and the live app are unaffected.
