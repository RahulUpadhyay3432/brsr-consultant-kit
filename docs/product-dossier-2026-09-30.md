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

### Second pass — the five unverified features (audited 2026-09-30)

Each was read end to end against what the site advertises. Verified statically: typecheck clean,
**145 tests, 19 files**, `next build` clean at 207 pages. **Nothing was runtime-verified** — this
container has no `.env.local`, so no Supabase, Groq or Gemini key. Extraction *accuracy* remains
unverified, as before.

| Feature | Verdict |
|---|---|
| **XBRL pre-flight** | **Matches.** Pure on-device conversion (`lakh 1e5`, `crore 1e7`), 7 cited checks, and it explicitly says "not a full taxonomy validator". Cites the **May 2024** NSE/BSE circulars, so it does not imply XBRL is a new FY 2025-26 obligation. No action. |
| **Multi-client workspaces** | **Matches.** `/requests` is a real cross-client dashboard whose tiles are computed from live data, scoped by `listCampaigns(org.id)`. `/clients` is a separate free, genuinely on-device list. No action. |
| **Proposal / fee builder** | **Works.** Pure functions, client-side PDF, profile in `localStorage`, so "generated on your device" is true. **One mismatch:** it claims it "never asserts a market price" while shipping a pre-filled rate card (₹1,50,000 base, ₹25,000/framework…). A consultant who never edits it gets a proposal we priced. **Fixed:** the rate card now says the numbers are placeholders to replace, not a benchmark. |
| **AI importing** | **Real and better-built than advertised** — grounded extract-only prompt, and a verifier that *drops* any suggestion whose value does not literally appear in its own source text. Gemini primary, Groq fallback, per-chunk, never auto-writes. **Two mismatches, both fixed** (below). |
| **Assurance ledger** | **Real and honest as a pure function** (one row per received item, owner + evidence + cited basis + methodology footnote) — but it was **emitting AI-extracted figures under a named person's name**. Fixed. |

**The substantive bug — false provenance in the assurance ledger.**
`applyBulkImportAction` looked up an existing item for the accepted `fieldId` and called
`db.updateItem()`, which writes the value **and flips `status` to `received`**. When that item
belonged to a real data owner, the AI-extracted figure landed on **that owner's** item, so the
assurance ledger — the one artifact built to be handed to an assurance provider — printed it under
their name and email, the Data tab labelled it "Submitted by: <person>", and the printed draft said
"every figure below is your client's submitted value". Nothing in the schema could tell the two
apart. This is precisely the exit condition below, and no static check could have caught it.

Fixed by recording provenance rather than by blocking the write (the importer is the product's best
feature; the defect was the silence):

- **Migration `003-item-value-source.sql`** adds `brsr_request_items.value_source`. Reads are
  best-effort and the write path retries without the column, so it degrades before the migration runs.
- Every write site is now tagged: `'owner'` for a submission through the owner's own link, `'import'`
  for an importer value the consultant accepted.
- The ledger carries a **"Value source"** column and a footnote defining each label. Rows predating
  the migration read **"Not recorded"** — deliberately *not* "Owner-submitted", because any value
  imported before this fix is indistinguishable from a submission in the old data. **No backfill is
  possible.**
- The Data tab shows an **"Imported"** tag on the row and "Assigned to" (not "Submitted by") in the
  detail panel; the printed draft no longer calls every figure a submitted value.
- `assurance.test.ts` (7 tests) pins the regression, including that an imported row never reads
  "Owner-submitted".

**Two false privacy claims — "on your device" describing a Pro AI feature (both fixed).**

| Where | Claimed | Reality |
|---|---|---|
| `BulkImportPanel.tsx` | "Each is read in your browser; **nothing is sent until you apply**." | The *file* stays local (pdf.js), but the extracted **text is sent to Gemini/Groq at extraction time**, long before "apply". Only *saving* waits for apply. The file's own header comment had it right; the user-facing line did not. |
| `/requests/cbam` + `CbamCalculator` | "**Fully on your device**, nothing is stored", and the AI auto-fill labelled "On your device". | The estimate is on-device, but `cbamExtractAction` sends the uploaded document's text to Groq. |

Checked and **correct**, for the record: the sub-processor list already names Groq and Gemini with
the Pro scoping; `PricingTable` keeps "on your device / nothing stored" strictly in the Free column;
the free `/features/cbam-ccts` page has no AI path; `/clients`, the profile and the proposal builder
are genuinely `localStorage`.

**Still not verified, and not verifiable from here:** extraction *accuracy* (needs live Gemini/Groq
credit), and every Collect path against a real database — the firm tier still **has never served an
HTTP request**. Both need the deploy plus a driven session.

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

### Second competitor read — 2026-10-03, and what is actually copyable

An external list arrived naming **RSustain (closest), ZOEI, Sustainability Cloud, EcoActive,
FileBRSR**, with the hypothesis that they are *"mostly built for companies doing their own
reporting — the consultant-workspace angle looks open."*

**The hypothesis agrees with our own research and is still unproven.** `docs/market-research.md`
reached the same conclusion from a different angle (enterprise pricing locks out the long tail;
the default tool for solos is Excel). But **"open" is not the same as "in demand"** — and our own
numbers are the counter-evidence: 241 users, 2 Pro requests, no Collect use since 27 June. A niche
can be open because nobody has built it, or open because the buyer does not pay for it. Nothing in
a competitor list distinguishes those two, and only talking to the 2 Pro requesters does.

**Worth copying — three things, in order:**

1. **The free-tool funnel as a deliberate acquisition machine, not a feature set.** RSustain's
   Basic Autopilot is free and monetised through advisory; FileBRSR's free tier is **5 supplier
   assessments** — a quantity limit on the *paid* workflow, not a separate lesser product. We have
   nine free tools and a free report, but the free tier and Collect are **two unconnected
   products**. The copyable move is FileBRSR's shape: make the free tier a metered slice of the
   paid loop (e.g. one live collection free) so using the free thing is already using Collect.
   This is the same build the traction doc ranks #4, arrived at independently.
2. **"Autopilot" as the packaging verb.** Their framing sells an outcome ("it files") where ours
   sells an artifact ("a readiness report"). We should **not** copy the claim — Saaksh does not
   file and must not imply it — but the lesson holds: name the workflow, not the document.
3. **Supplier/value-chain as a distinct, cheaper entry point.** FileBRSR markets no-signup
   supplier questionnaires separately from full BRSR preparation. We already have the mechanism
   (`/submit/[token]`, no login) but market it only as part of consultant-led collection. A
   supplier answering one customer's questionnaire is a different job, and a cheaper first yes.
   ⚠️ Keep the regulatory line straight: value-chain disclosure is **voluntary** for the top 250
   from FY25-26. FileBRSR's own description of the rule conflicts with the SEBI 2025 circular.

**Not worth copying:** their buyer. All five sell to the reporting company. Copying that puts us
against funded platforms on their ground, and abandons the one position our own research supports.
Also do not copy their pricing — company-direct prices say nothing about what a consultant pays
per engagement.

⚠️ **ZOEI, EcoActive and Sustainability Cloud were not researched for this entry** beyond
Sustainability Cloud already appearing in `docs/market-research.md`'s player list. Prices and
features above are FileBRSR's and RSustain's, checked 2026-09-30 and not re-checked. Do not cite
the three unresearched names as analysed competitors.

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
