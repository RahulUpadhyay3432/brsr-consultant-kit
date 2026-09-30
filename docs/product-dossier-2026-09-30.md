# Product research dossier — 30 September 2026

Distilled from a research-to-build dossier supplied by Rahul on 2026-09-30. Kept because it is
the only evidence-graded product research in the repo, and because several of its findings
contradict what `CLAUDE.md` and the marketing copy currently say.

**Evidence grading used throughout:** *Evidence* = cited document, public product claim or dated
research record. *Inference* = interpretation or proposed feature. *Unconfirmed* = the available
evidence does not establish it. **No customer interviews, paid pilots, buyer survey or
willingness-to-pay measurements exist.** Recommendations in here are not validated requirements.

## The five signals

1. **Validation deserves at least as much attention as collection** — units, periods, boundaries,
   missing months, source records, changed figures.
2. **Saaksh already advertises most of the proposed workflow.** Test the real experience before
   adding duplicates. The live site describes AI importing, grounded drafting, multi-client
   workspaces, an assurance ledger, XBRL pre-flight and a proposal/fee builder.
3. **Version-bound approval and explicit missing-data reasons are genuine technical openings** —
   reference mechanisms exist; absence from vendor docs is not proof of a commercial gap.
4. **PDF/XBRL consistency, prior-year revisions and boundary exceptions are concrete jobs.**
5. **Consultant calls are learning, not demand proof.** The next useful step is a narrow measured
   pilot, not building everything below.

## P0 — verify promises before building more

The single most important instruction in the dossier, and the one this repo was ignoring.
Inventory every public promise as *advertised / implemented / tested / used by an adviser /
outcome measured*, then run one synthetic engagement end to end. **A page claim is not a release
acceptance test.**

**Mismatches already found (2026-09-30):**

| Claim | Reality |
|---|---|
| Homepage GHG panel captioned "CEA v18 (FY24)", computing with `0.716` | `emission_factors.json` says **0.710, CEA Version 21.0 (Nov 2025), FY 2024-25**. And `blog-content.tsx` itself warns that using 0.716 instead of 0.710 is the stale-factor error "flagged by an assurer". **Fixed** in `afd233a`: both the arithmetic and the caption now read from the factor file, and the caption states the version and the reporting year it applies to. |
| `CLAUDE.md`: Collect has "No AI narrative (that would risk fabrication)" | `narrative.ts`, `NarrativePanel.tsx` and three `generateNarrative` call sites exist. **Fixed** in `CLAUDE.md`. |
| `CLAUDE.md`: the report has "two tabs, with two more outputs as accordions" | Seven views: overview, checklist, materiality, alignment, beyond-brsr, templates, sources. **Fixed** in `CLAUDE.md`. |

**Still to audit:** whether AI importing, the assurance ledger, XBRL pre-flight, the fee builder
and multi-client workspaces work end to end, are gated, or are partial. Extraction accuracy is
**unverified** (Gemini credits were exhausted). Also label free/on-device versus Pro/backend per
feature — **"nothing leaves your browser" must never describe Pro.**

Exit condition: promises match behaviour, and synthetic wrong data cannot quietly become a
confidently "ready" report.

## P1 — the validation workbench

Rests on the strongest firsthand evidence in the dossier: a practitioner in the r/ESGIndia tool
thread saying collection is painful but **"data validation is most difficult"**, with numbers and
units checked repeatedly and "back and forth with client before it is error free."

Store original **and** normalised values, conversion basis, period, site, entity boundary, source,
owner and status. Distinguish **error / warning / needs clarification / accepted exception**.

Checks worth building:

- Lakhs and crores versus absolute INR; kWh/MWh/GJ; litres/kL/m³; mass units. **Preserve raw input.**
- Financial versus calendar year; missing months; duplicate periods; prior-year comparatives.
- Standalone versus consolidated scope; missing sites; acquisitions and disposals; exclusions.
- Sum-versus-component consistency, duplicate rows, denominator changes, year-on-year outliers.
- Water withdrawal / consumption / discharge kept **separate**. A meter's presence does not
  establish what it measures.
- Factor version and year, with a reviewer-visible change log.
- An owner query carrying the value, the source excerpt, the issue and the evidence requested.

**Never silently default:** missing → zero, unknown → N/A, ten months → twelve, partial sites →
whole company, or a plausible narrative → confirmed fact.

Acceptance test: synthetic inconsistencies must trigger the expected issue, preserve the raw
input, explain the rule, and require a human decision. **A generic AI confidence score is not a
substitute.**

## Three primitives worth stealing from QMS research

Eight commercial QMS vendors were checked. **None publicly documents any of these**, which is
what makes them differentiating rather than table stakes.

1. **Version-bound approval.** Bind review to the metric / source / formula / factor / boundary
   revision, and reopen affected approvals when any of them changes. Canonicalise structurally,
   separately from raw file bytes. A hash proves neither correctness nor authorship.
2. **Reason-bearing absent data.** Model on HL7 FHIR `DataAbsentReason`: not-stated, not-asked,
   asked-unknown, temp-unknown, not-applicable, masked — plus who gave the reason and the next
   action. **Zero is not missing. AI must not invent the reason.**
3. **Block-and-ask.** Hold readiness when a critical unit, period, scope or evidence is missing,
   and raise a precise owner query. Allow a **reviewed exception**, never a forced fabrication.

Plus an **exception lifecycle** (id, source, expected vs actual, severity, owner, evidence,
action, deadline, reviewed closure) which serves ESG clarifications without a full CAPA suite.

Treat a full QMS product as **separate discovery**, not an extension of this workspace.

## Regulatory corrections — enforce these

From the **SEBI circular of 28 March 2025** (primary source, re-read 2026-09-30):

- **Core assessment-or-assurance glide path:** top 150 in FY 2023-24, top 250 in FY 2024-25,
  top 500 in FY 2025-26, top 1,000 in FY 2026-27.
- **Value-chain disclosures are voluntary** for the top 250 from FY 2025-26; assessment or
  assurance of that information is voluntary from FY 2026-27. Partners individually representing
  **2% or more** of purchases or sales are in scope, with an option to limit coverage to 75%.

Things not to say:

- **XBRL is not a new FY 2025-26 obligation.** NSE's FAQ (updated 10 May 2024) already required
  BRSR in PDF and XBRL on the same day as the annual report.
- **Value-chain reporting is not universally mandatory in FY 2026-27.**
- **Do not equate our 108 Section C fields** with a competitor's 216 questions or 337 datapoints —
  scopes and counting units differ.
- **Unlisted MSMEs are not automatically mandatory filers.** Do not manufacture a legal deadline
  for an unlisted supplier.
- KPMG's Feb 2026 report narrates "March 2024" for the assurance change. **The regulator's date is
  March 2025** — use the regulator.
- A sample choosing reasonable assurance does not remove the assessment option. (KPMG analysed 94
  NIFTY100 companies' FY 2024-25 disclosures: **45 revised a prior-year figure, 22 reported
  boundary exclusions**, all chose reasonable assurance — that sample, not all filers.)

## Competition — stop claiming uniqueness

Advertised prices, checked 2026-09-30. Entry prices and features, not tested products.

| Vendor | Public pricing |
|---|---|
| **FileBRSR** (closest overlap) | Free tier = 5 supplier assessments · Growth **₹49,999/yr** · Assurance-Ready from **₹2,00,000/yr**. Markets buyer/supplier assessment, no-signup supplier questionnaires, PDF extraction, mapping, emissions, XBRL, supplier-profile reuse. Its value-chain rule description **conflicts with the SEBI 2025 circular** — use the regulator for law. |
| **SustainableX** | ₹3,499 one-time starter · ₹6,499/mo Basic · ₹74,999/mo Pro · ₹1,79,999/mo Enterprise |
| **RSustain** | Basic Autopilot workflow now **free**, premium via advisory. The older ₹29,999/yr figure is **not confirmed as current.** |

Others researched: Oren, Newtral, Credibl, Updapt, Snowkap, StepChange.

**Do not claim** "only free tool", "only no-login workflow", "only AI importer" or "only evidence
pack". Offers already overlap. **Consultant economics and trustworthy review are better
hypotheses than generic AI speed.** Possible position: *less back-and-forth before a number is
ready to defend* — and prove it with corrected total handling time, evidence completeness and
fewer repeated queries. Fluency must not decide readiness.

Company-direct prices do not prove what an adviser pays per engagement. Earlier ₹25,000–75,000
suggestions were **hypotheses**. Neither the top-1,000 filing cohort nor a vendor's "50,000
suppliers" figure is a verified paying-customer count.

## Not justified by this research alone

A giant narrative generator · autonomous filing · arbitrary ESG badges · universal certification ·
**every framework export** · full ERP/QMS replacement · sensor operations · marketplace at scale ·
automated community harvesting.

Note honestly: the **P6 CDP/EcoVadis field mapping shipped on 2026-09-30 (`3026453`) sits close to
"every framework export."** It was built to serve the SAGE conversation, not because research
identified it as the bottleneck. The firm tier (`1ab9764`) is defensible on its own terms — it
closed a real cross-consultant data-exposure hole.

## Buyer notes

ICP package (26 Sep) holds 35 people across 13 firms — 30 consultant-side, 5 supplier-side. **A
prospect pool, not 35 qualified buyers.** Typical client count, engagement economics, preferred
pricing, support burden, white-label demand and who actually buys are all **unconfirmed**.

Keep two jobs separate: a supplier answering a customer's questionnaire has a different entry
point from a listed company preparing its own BRSR. **A supplier need not be asked to prepare an
entire BRSR.**

Demand ladder: complaint → recognisable workflow → discussion → trial → repeat use → budget owner.
**Current research mostly reaches the first three.** No paid conversion or repeat retention is
confirmed.

## What the next research round should measure

8–12 advisers plus small permissioned one-metric pilots. Ask to see **the last difficult metric and
the actual handoffs**, not opinions on a feature list: where was the source, what was wrong, how
many clarification cycles, who approved it, what changed, what tool would they stop using.

Measure **corrected total time**, not extraction speed. A faster draft that adds reviewer cleanup
is not a win. Track negative outcomes too — no need, sheets good enough, privacy objection,
importer cleanup, reviewer rejection, economics that do not fit. Those are constraints, not
objections to hide.

## Venue and channel caveats

- **ICSI ESG Catalyst** (`esgsb@icsi.edu`) invites inputs, but guest-article and product-promotion
  acceptance is **not established**.
- CII-CESD and TERI are training leads, not free discussion communities. ESGVoices' forums were
  stale. Datamaran Harbor is restricted to its in-house audience.
- **London Reporting Academy's terms restrict solicitation and competitive reuse — do not mine its
  resources to build a competing product.** Movement host terms restrict automated member-content
  collection.
- Sustainability Stack Exchange requires AI-content disclosure and restricts promotion.
- Review/directory routes exist (Capterra, G2, SoftwareSuggest, OneStop ESG, howtoesg, Earth5R) but
  existence proves neither eligibility nor lead quality. **CDP/EcoVadis accreditation is not a
  free-directory shortcut, and not an endorsement Saaksh can claim.**
- No membership count is a buying signal.
