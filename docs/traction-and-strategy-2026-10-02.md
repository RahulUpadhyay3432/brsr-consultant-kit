# Traction, diagnosis and strategy — 2 October 2026

The numbers that changed the plan, and the reasoning that followed. Written because none of this
existed on disk and it is more consequential than anything in the feature backlog.

Read alongside `docs/product-dossier-2026-09-30.md` (the evidence-graded research) and
`docs/sage-call-brief.md` (the Monday call).

## The numbers

**GA4, 4 May – 2 October 2026 (five months):**

| | |
|---|---|
| Active users | **241** |
| New users | **241** |
| Average engagement time | 5m 08s |
| Event count | 3.4K |
| Bounce on main pages | 36–48% |
| Top city | Bengaluru, 52 |

**Sessions by source:** direct 268 · **chatgpt.com 116** · linkedin 92 · **google/organic 48** ·
reddit 18 · bing 17.

**Supabase, all time:**

| | |
|---|---|
| Pro access requests | **2** |
| Newsletter subscribers | **4** |
| Collections ever created | **9** |
| …all created between | **12 and 27 June 2026** |
| Created since | **none, three months** |
| Data owners invited | 16 |
| Owners who responded | **7 (44%)** |
| Values collected | 23 |

## The diagnosis

**Retention is effectively zero.** 241 active users, 241 of them new, with the returning line flat
from June to October. Everyone who finds Saaksh is a first-timer.

**It is not a UI/UX problem.** Bounce is 36–48%, engagement is minutes, and 3.4K events across 241
users is ~14 interactions each. Usability failures look like high bounce and low events; this is
the inverse. People who land do use it.

**It is a frequency problem.** A BRSR gap analysis is done **once per client, per year**. Even
someone who loves it has no reason to return next week. That cannot be fixed with better UI or
with more one-shot tools.

**The recurring work lives in Collect** — chasing owners, resolving disputed numbers, producing
deliverables — and Collect has been used for two weeks in June and never since, in a pattern that
looks like building and testing rather than running a practice. **2 of 241 users asked for access.**

So: a one-shot free product that 241 people like, a recurring paid product nobody has tried, and
nothing connecting them. **Retention cannot exist until that loop is open.**

⚠️ `CLAUDE.md` says Collect is "validated by practising consultant Priya". She gave feedback that
shaped it; the usage data shows no sustained external use. Those are different claims.

⚠️ The one genuine external signal is **7 of 16 data owners responding (44%) to a cold, no-login
link**. Strong — **but only if those were real client-side people**. All 9 collections sit inside
the June window. Do not cite it externally without checking.

⚠️ The 5m 08s engagement figure is **not** comparable to the earlier "28s for AI assistants,
1m 24s organic" reading. That was 28 days segmented by channel; this is five months aggregate.

## Four product ideas, assessed against the repo

Proposed externally; checked, not accepted.

| Idea | Verdict |
|---|---|
| **White-label report generator** | **The only real gap.** PDF generation already exists (`report-pdf.ts`, `proposal-pdf.ts`, `export.ts`, jspdf/docx across 5+ surfaces); **white-labelling does not** — zero hits for `whiteLabel`/`consultantName`/`firmLogo`. Gap is storing a firm name + logo and stamping existing PDFs: ~a day, and `brsr_orgs` is the natural home now the firm tier exists. |
| **BRSR change tracker** | **Don't.** BRSR does not change quarterly. Half-exists twice already (`regulatory_updates.json`, 8 sourced entries; `/brief`, on the standing-don't list at ~3 users, 0 returning). |
| **Value-chain module** | **Premise is factually wrong.** It conflates the **Core assurance glide path** (150 → 250 → 500 → 1,000, FY23-24 to FY26-27) with **value-chain disclosure, which is voluntary** for the top 250 from FY25-26. No mandate, no hiring wave. And "send request, track responses" **is Collect**. |
| **Assurance evidence checklist** | **Already shipped** as `/tools/audit-readiness` + `audit_readiness.json` (9 principle groups; `kpi`, `core` flag, `evidence`, `location`). |

**Return triggers:** only white-labelling (per engagement) and the validation workbench (per
number) create a reason to come back. The other two create none.

## The keyword map, assessed

Three of its Saaksh recommendations were **already satisfied**: all 10 sector pages exist
(`/brsr-for/[industry]`), the P6 guide is already titled "How to fill BRSR Principle 6
(Environment)", and `/tools/ghg-calculator` already names CEA v21 and P6 — the exact condition it
set. Pages that already match the query still rank nowhere, so **the problem is indexing and
authority, not on-page SEO**.

Its own buried item 6 is the real finding: **Google Search Console**. No first-party connector
exists; it needs DNS verification + sitemap submission and is the only thing that converts guessing
into measurement.

Its proposed homepage title is **~100 characters** against its own ≤60 rule. A workable version:
`Free BRSR Software for Indian ESG Consultants | Saaksh` (53). Hold until GSC exists so the effect
is measurable.

Two findings from it were real and are **fixed in `fa006a1`**: the audit-readiness page called ten
*evidence rows* ten *BRSR Core attributes*, contradicting its own data note ("the nine attributes
SEBI designated"); and SEBI's "assessment or assurance" wording appeared nowhere, which overstated
the obligation.

## SAGE: the tech-arm reframe

An earlier version of the brief argued against leading with "build your tech arm" on the grounds
that 2 Pro requests meant negotiating from weakness. **That was wrong, and the correction matters.**

Two different sales, two different kinds of evidence:

- **Selling Saaksh as a product** → traction and retention matter.
- **Selling Rahul as the builder** → traction is largely irrelevant. *They* supply the problem
  statement. Saaksh is not the thing being sold; it is **the portfolio piece** — 207 pages, 108
  cited disclosures, a working collection system, a six-framework crosswalk, versioned factors,
  built by one person.

**From SAGE's lens:** they have no demand problem (65+ clients, 90% repeat/referral, ten years).
They have a **leverage problem** — revenue scales with hours, hours with headcount. Tech is how a
firm breaks that ceiling, and that has nothing to do with Saaksh's user count. Sharper still:
**FileBRSR charges ₹2,00,000/year for an Assurance-Ready tier**; most of that capability already
exists here, and could be built to SAGE's spec rather than licensed from someone else. Upside
framing: their tech arm could become something they sell to their own clients.

**Zero-risk shapes:** a bounded paid diagnostic (two weeks mapping where SAGE loses hours, they
keep the findings either way) · the problem-statement conversation itself · their five frameworks
(BRSR + CDP + EcoVadis + GRESB + GRI) as a collect-once wedge they would specify.

**Sequencing, which is the one thing to hold:** do not lead with the ask. A pitch before a
diagnosis is a worse pitch. Ask where SAGE loses the most hours first, and her answer writes the
ask for you.

**Four doors — walk through whichever she opens:**

| She mentions | Door |
|---|---|
| repeated manual work, spreadsheets, chasing | tech arm / build to spec — go hard |
| training, curriculum, capability building | Green Skills Academy |
| a specific client's data problem | run one engagement on Collect |
| critique and curiosity about the tool | advisory, stay close |

**Hold firm on one thing only:** do not present Collect as proven. "Built and working, not yet run
at scale, and I'd like it tested on something real" is true, and more compelling to someone who
preps clients for assurance.

## ChatGPT apps — verified, and scoped

**The platform claim is true.** OpenAI launched apps in ChatGPT with an Apps SDK, opened
third-party submissions, built a directory at `chatgpt.com/apps`, and **apps are recommended inside
conversations**. Better-built apps are featured more prominently. Covered 29–30 September 2026.
**The Apps SDK is built on MCP** — the detail that matters most here.

Sources: https://openai.com/index/introducing-apps-in-chatgpt/ ·
https://openai.com/index/developers-can-now-submit-apps-to-chatgpt/ ·
https://techcrunch.com/2026/09/29/openai-expands-chatgpts-plugins-with-app-like-interfaces-and-automations/

**Why it fits Saaksh, on better grounds than the "1.2B users" pitch** (which is weak — the
addressable slice is Indian BRSR practitioners):

1. **ChatGPT is already the #1 non-direct channel** — 116 sessions vs Google's 48. Doubling down on
   a proven channel, not a bet.
2. **Marginal cost is abnormally low.** The SDK is MCP-based and the knowledge base is already
   structured, cited JSON with 145 tests around it. Wrapping beats creating.
3. **The brand fixes what LLMs are worst at** — returning a SEBI page number and a factor version.
4. **It completes the AEO thesis**: ChatGPT *runs* Saaksh rather than paraphrasing it.

**Where the external playbook does not transfer:** "ship 5 and double down" needs horizontal,
high-frequency utilities. Saaksh is one vertical. But **looking things up is weekly** even when the
gap analysis is annual — so the shape is a **BRSR reference app** (108 disclosures, glossary,
factors, crosswalk, answerable with citations), not "Saaksh in ChatGPT".

**Caveats:** it does **not** fix retention — it is more top-of-funnel into a bucket with a hole.
It is a **borrowed audience**; OpenAI controls discovery. And the "2,000% growth" anecdote
circulating is one horizontal product off a small base.

## What the evidence says to do next

1. **Talk to the 2 who requested Pro.** Tiny sample, and 100% of the demand signal.
2. **Ask the community the retention question, not the payment question:** *"what would bring you
   back to a BRSR tool next week?"*
3. **Google Search Console** — the only thing that turns SEO guessing into measurement.
4. **If building one thing: the handoff from the free report into Collect.** A consultant who just
   ran a gap analysis holds the exact list of fields to chase, and today those are two unconnected
   products. That is the cliff where 239 of 241 fall off, and the only build that targets retention
   rather than adding another one-shot tool.
5. **White-labelling** second — real gap, ~a day, creates a per-engagement return trigger.
6. **The ChatGPT MCP app** after the SAGE call — two days, cheap, acquisition not retention.
