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
