# Competitor parity plan — match every free feature

Written 2026-10-03 on an explicit decision: **match what the competitors give away for free.**
Not their pricing, not their buyer — their free surface.

This file is the checklist. It is ordered by cost, because the cheap ones are cheap *because the
data is already in the repo* and the expensive ones need data we do not have.

## How this list was built, and what it is worth

Sources are **web-search summaries, not verified page-by-page audits.** The container's network
policy denies outbound HTTPS to competitor domains (`india.rsustain.com`, `filebrsr.com` and the
rest return `403` from the egress proxy), so nothing below was read on the vendor's own site in
this session. Treat every competitor claim here as reported, not confirmed.

**Widen Network access in the environment settings if you want these verified properly** —
cloud environment menu → Edit → either a broader access level or Custom with those hosts added.

Two findings that change the shape of the list:

- **ZOEI has no free tier at all** (reported ~$7.91/user/month, no free version, no free trial).
  There is nothing to copy. It belongs on the list as a competitor, not as a parity target.
- **EcoActive and The Sustainability Cloud are enterprise platforms** whose "free" surface is a
  demo plus generic calculators. Their real differentiators are XBRL filing compatibility and
  BRSR Core value-chain workflows — both of which we already have in some form.
- A sixth name surfaced twice while researching and is a **closer free-tier competitor than three
  of the original five**: **ESGPulse.ai**, which publishes free no-signup calculators and an
  India emission factor database.

So the real parity targets are **RSustain, FileBRSR and ESGPulse.ai.**

### RSustain's actual pages and ladder — relayed 2026-10-03

A second external read (Instinct AI) **did** fetch the vendor pages this session could not, and
reports specifics that correct our record. Relayed, not verified here — the egress block above
still applies — but it is first-hand page data rather than search summary, so it outranks what
the dossier had:

- **₹29,999/year**, which the dossier listed as "not confirmed as current", is reported as the
  live price. More useful than the number is the **shape**: Section A free, **Sections B and C
  behind the paywall**, together with benchmarks and XBRL output. Premium features come "with
  advisory engagement."
- **The ladder:** free readiness check → free tier (Section A) → ₹29,999/yr (B + C, benchmarks,
  XBRL) → advisory. Each rung qualifies the buyer for the next.
- **The real business is advisory.** The software is lead generation and the ₹30k plan is a
  filter.
- **Buyer:** they sell a *filing platform to companies*; we are a *workspace for consultants*.
  Same Google searches, different customer. This matches our own conclusion.

**Two things follow, and the second is the more important.**

**1. Our free tier already exceeds their paid tier.** They charge for Sections B and C; our free
report covers Section A, Section B and all 108 Section C disclosures, with the SEBI wording and
an ICAI page citation on each. That is a real positioning fact and it is checkable.
⚠️ Do **not** put a competitor's price in product copy — we have not verified it ourselves, and
the standing rule against unprovable comparative claims applies. State what we give away; let
the reader compare.

**2. ⚠️ This directly constrains parity item 7, the metered free tier.** FileBRSR meters by
*count* (5 supplier assessments); RSustain meters by *BRSR section* (A free, B+C paid). Copying
RSustain's axis would mean **walling off Sections B and C — which are free today.** That would
destroy the one advantage above and breaks the standing don't ("Don't move the free on-device
modules behind Pro"). Meter the **recurring collection loop** instead: the gap analysis stays
wholly free, and the free allowance is one live collection in Collect.

**3. The advisory insight has a Saaksh-shaped version.** "Software is lead gen for consulting"
cannot be copied straight — our user *is* the consultant, so we cannot sell them advisory. But it
is exactly the SAGE tech-arm reframe in `docs/traction-and-strategy-2026-10-02.md`: Saaksh is the
portfolio piece, and the revenue is paid build work for firms. Same model, one layer up. Worth
holding in mind on Monday.

### Its three recommendations, checked against the repo

Two of the three were **already shipped**, which is now the second time an external adviser has
recommended work that exists (the keyword map did the same — three of its items were already
satisfied). The pattern matters: **our problem is not that we lack the playbook.**

| Recommendation | Status |
|---|---|
| "Make the calculators standalone landing pages" | **Already done** — 10 standalone `/tools/*` pages, plus 10 sector pages at `/brsr-for/[industry]`. |
| "FAQ-heavy SEO pages" | **Mostly done, one real gap found.** All 35 blog posts carry FAQs (137 Q&A pairs), and the 108 `/brsr/<code>` pages and 10 sector pages emit `FAQPage`. But **only 1 of 10 tool pages had an FAQ** — the pages with the most intent. ✅ **Closed: all 9 now carry grounded FAQs** (`src/data/tool-faqs.ts`), with a test asserting a new tool page cannot ship without one. |
| "The consultant angle they don't cover" | **Already our position** — it is what the whole product is. |

**So the honest conclusion:** we now have the free-tool funnel, the FAQ-heavy pages, the
standalone landing pages and the consultant angle — and still have 241 users, 241 of them new,
and 2 Pro requests. The missing piece is not the playbook, it is **indexing and authority**, which
is what the traction doc already concluded and why **Google Search Console remains the highest-
value open item.** Build parity because it is cheap and it removes excuses; do not expect it to
move retention.

## The parity matrix

| Their free feature | Who | Saaksh today | Verdict |
|---|---|---|---|
| BRSR readiness assessment / maturity scorecard vs ~140 SEBI parameters | RSustain ("BRSR Compass") | `/` free report — 108 Section C + Section A/B, readiness gauge, three statuses | **Have it, arguably better** (per-disclosure citations, not just a score) |
| Carbon footprint calculator, India factors | ESGPulse, EcoActive, TSC | `/tools/ghg-calculator`, `/tools/scope3-calculator` | **Have it** |
| India emission factor database | ESGPulse | **`/tools/emission-factors`** | ✅ **SHIPPED `ba939e9`** |
| XBRL / SEBI digital filing alignment | EcoActive, FileBRSR | `/tools/xbrl-preflight` | **Have it** |
| Framework mapping / multi-framework disclosure | ZOEI, TSC | `/tools/brsr-framework-mapping` — GRI, TCFD, IFRS S1/S2, TNFD, ESRS, + CDP/EcoVadis at P6 | **Have it** |
| No-signup supplier/owner questionnaires | FileBRSR | `/submit/[token]` | **Have the mechanism**, not the free product |
| PDF extraction from last year's report | FileBRSR | AI importer (Pro) + client-side PDF detection (free report) | **Have it** |
| CBAM | TSC | `/tools/` CBAM readiness, `/requests/cbam` | **Have it** |
| ESG training / courses | RSustain Academy (50+ courses, free tier) | `/academy` — 8 modules | **Partial** — no course shell, no progress, no completion |
| **Policy template library (42 ESG policies)** | RSustain | 3 templates (response workbook, materiality grid, stakeholder plan) | ❌ **BIGGEST GAP — 3 vs 42** |
| **Pre-assurance validator (KPIs vs benchmarks)** | RSustain | `/tools/audit-readiness` is an *evidence* checklist; nothing validates a *number* | ❌ **GAP** |
| **ESG score calculator** | ESGPulse (E35/S35/G30), RSustain Matrix | Nothing | ❌ **GAP — and see the integrity note below** |
| **ESG compliance calendar** | RSustain | `regulatory_updates.json` exists (8 sourced entries); no calendar | ❌ **GAP, cheap** |
| **Metered free tier of the paid loop** | FileBRSR (5 free supplier assessments) | Free tool and Collect are unconnected products | ❌ **GAP — and the retention build** |
| SASB mapping | EcoActive | Not in the crosswalk | ❌ Gap, small |
| District/regional climate risk data | RSustain (ResilientPulse, 676 districts) | Nothing | ❌ Gap, needs a dataset we do not have |
| Supplier-profile reuse across buyers | FileBRSR | Nothing | ❌ Gap, needs the supplier product first |

## Build order

### Tier 1 — the data is already in the repo (hours each)

1. ~~**Emission factor database** → `/tools/emission-factors`~~ ✅ **done, `ba939e9`.** 34 factors,
   searchable, CSV, published as a `Dataset`. Doubles as an AEO asset like `/brsr/statistics`.
2. **ESG compliance calendar** → `/tools/esg-calendar`. `regulatory_updates.json` has 8 sourced
   entries and the SEBI glide-path dates are already in `/brsr/statistics`. Needs a dated-deadline
   dataset assembled from what we already cite. ⚠️ Every date must carry its circular — a wrong
   deadline on a compliance calendar is worse than no calendar.
3. **SASB in the crosswalk.** Follows the existing sparse-overlay pattern (TNFD, ESRS,
   CDP/EcoVadis). ⚠️ Invent no vocabulary: SASB codes come from the published standards or the row
   stays empty.

### Tier 2 — real builds (a day or two each)

4. **Policy template library** → `/templates/policies`. The biggest countable gap: **3 vs 42.**
   BRSR Section B asks for a policy per principle, so the generator has a natural spine:
   `brsr_data_points.json` Section B + `best_practices.json` (which already names ISO 14001/45001/
   37001/27001/20400, UNGPs, DPDP Act, GHG Protocol, AA1000, SROI) + the per-principle SEBI
   wording. Target the nine principle policies first, then the standard adjacent set
   (anti-bribery, whistleblower, grievance redressal, supplier code, human rights, DEI, POSH,
   data privacy, environment, OHS).
   ⚠️ **Hard constraint:** these are drafting skeletons with the SEBI wording they answer, not
   legally reviewed policies. Say so on every one, in the download and on the page. Nothing else
   in the product claims legal review and these must not be the first thing that does.
5. **Pre-assurance validator** → `/tools/assurance-validator`. The honest version of RSustain's.
   It checks the things an assurer actually raises and that we can defend:
   stale grid factor vs the current CEA version · intensity outliers against the company's own
   prior year · unit-scale slips (the `/tools/xbrl-preflight` rupee-scale logic generalised) ·
   Scope 1 fugitive lines left empty · missing evidence against `audit_readiness.json` ·
   boundary gaps.
   ⚠️ **We cannot do "vs sector benchmarks"** — we have no sector dataset, and fabricating one
   contradicts the whole product. Build the checks we can source and say plainly that
   peer-benchmarking needs data we do not have yet.
6. **ESG score calculator** → `/tools/esg-score`. ⚠️ **The one item on this list with a real
   integrity problem.** ESGPulse weights E 35% / S 35% / G 30% and cites "MSCI and Sustainalytics
   methodologies"; neither publishes a replicable weighting, so any such score is invented. Saaksh
   has spent its whole build refusing to invent numbers — a fake MSCI proxy on `saaksh.co` is the
   single most expensive copy on this list, and it is exactly what a CDP/GRI-certified reader
   spots.
   **Build it as a BRSR disclosure-readiness score instead:** computed only from the client's own
   answers, with the formula printed on the page, named so nobody mistakes it for a rating, and
   explicitly not comparable to MSCI or Sustainalytics. That matches the competitor's *function*
   (a number you get instantly and want to improve) without the claim we cannot stand behind.

### Tier 3 — larger, and already on the roadmap for other reasons

7. **Metered free tier** — one live collection, free. This is FileBRSR's shape and independently
   the #1 retention build in `docs/traction-and-strategy-2026-10-02.md`. Two routes, same build.
   ⚠️ **Meter the collection loop, never the BRSR sections.** RSustain puts Sections B and C
   behind ₹29,999/yr; those are free here, and that is the advantage. See the relayed read above.
8. **Academy course shell** — turn the 8 `/academy` modules into enrollable units with progress.
   ⚠️ Claim no certification. RSustain's free tier works because a paid certificate sits behind it;
   ours has nothing behind it yet, and `/academy` deliberately names no institute.
9. **Supplier-facing product** (self-serve questionnaire + profile reuse) — a different buyer from
   the consultant. Worth scoping separately, not bolted onto Collect.
10. **District climate risk** — skip. Needs a dataset we would have to build or license, and it is
    the furthest thing on this list from a BRSR filing.

## What we are deliberately not copying

- **Their buyer.** All of them sell to the reporting company. Our research says the
  consultant-workspace angle is the open one — unproven, but it is the position the whole product
  is built around.
- **Their prices.** Company-direct pricing says nothing about what a consultant pays per
  engagement.
- **"Autopilot" as a claim.** Saaksh does not file, and must never imply it. The lesson worth
  taking is naming the *workflow* rather than the artifact.
- **Padded factor and template counts.** Our counts stay honest even where theirs are bigger.
