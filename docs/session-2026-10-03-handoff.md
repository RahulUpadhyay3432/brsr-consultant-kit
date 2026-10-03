# Session handoff — 3 October 2026

Written to end the session cleanly. Everything a fresh chat needs is here or linked from here.

**Read in this order:** `docs/traction-and-strategy-2026-10-02.md` (the numbers and the diagnosis —
it outranks every backlog) → this file → `docs/competitor-parity-plan.md` (the active build
checklist) → `docs/sage-call-brief.md` (the call on Monday 5 October).

## State of the repo

- `master` = **`30388f4`**, pushed. Working tree clean, local and origin identical.
- **Production is `30388f4`** — deployment `dpl_6dVXRQUStK7GedB9KNaATcW2Q8BE`, state READY.
  Auto-deploy from `master` is working; all four of today's pushes shipped on their own.
- Verified on `master`: typecheck clean · **166 tests, 21 files** · `next build` clean ·
  **208 pages**.
- Migrations 001–004 all applied. Nothing in `docs/migrations/` is pending.

⚠️ The deploy was confirmed through the Vercel API, **not by loading the page** — the container's
network policy denies `saaksh.co:443`. Nobody in-session has seen `/tools/emission-factors`
render. Widen Network access in the environment settings if a session needs to check the live
site.

## What shipped today

| Commit | What |
|---|---|
| `21892ee` | First competitor read recorded: the five-name list, what is copyable, and the finding that "open" is not the same as "in demand". |
| `ba939e9` | **`/tools/emission-factors`** — the India emission factor database. 34 factors, each with its primary citation, searchable, CSV export, published as a `Dataset`. |
| `6cf0139` | **`docs/competitor-parity-plan.md`** — the free-feature parity matrix and build order. |
| `30388f4` | **FAQ blocks on all nine tool pages** that lacked one, plus the relayed RSustain pricing and ladder. |

### `/tools/emission-factors`, in one paragraph

`src/lib/emission-factor-index.ts` flattens `emission_factors.json`, `scope3_factors.json` and
`ppp_factor.json` into one searchable index and **restates nothing** — display strings and
citations are carried verbatim, asserted by a test, so the public page and the calculators can
never disagree. Adding a factor to any source file adds a row automatically. The page leads with
the stale-grid-factor error rather than a feature list, because that is the finding an assurer
actually raises on an Indian Scope 2 figure.

### The tool-page FAQs

`src/lib/tool-faq.ts` holds the schema builder (a plain `.ts` on purpose — vitest only transforms
`.ts`, and keeping it out of the `.tsx` is what makes it testable). `ToolFaq.tsx` renders the
accordion and the `FAQPage` JSON-LD **from the same array**. `src/data/tool-faqs.ts` carries the
Q&As. `tool-faqs.test.ts` reads the filesystem, so **a new `/tools/*` page without an FAQ fails
the suite** — it already caught one answer too thin to deserve a rich result.
`brsr-framework-mapping` keeps its own inline FAQ and is exempt from the shared map, not from
having one.

## The finding that matters more than anything shipped

**Two external advisers in two days each recommended work that already existed.** The keyword map
had three already-satisfied items; the second read (Instinct AI) had two of three — standalone
tool landing pages (we have 10) and FAQ-heavy content (35 posts, 137 pairs, 108 disclosure pages).

So Saaksh now has the free-tool funnel, the FAQ-heavy pages, the standalone landing pages and the
consultant angle — **and still has 241 users, 241 of them new, and 2 Pro access requests.**

**The missing piece is not the playbook. It is indexing and authority.** Build parity because it
is cheap and it removes excuses; do not expect it to move retention. **Google Search Console
remains the highest-value open item and is not a build.**

## The competitive picture, corrected

- **ZOEI has no free tier at all** (~$7.91/user/month, no free version, no trial). Nothing to copy.
- **ESGPulse.ai** is a closer free-tier competitor than three of the five originally named, and is
  what `/tools/emission-factors` answers.
- **EcoActive and The Sustainability Cloud** are enterprise; their "free" surface is a demo plus
  generic calculators.
- **RSustain's ladder** (relayed, page-fetched by an external reader, not verified here):
  free readiness check → free tier covering **Section A only** → **₹29,999/yr for Sections B + C**,
  benchmarks and XBRL → premium "with advisory engagement". **The real business is advisory; the
  software is lead generation.**

⚠️ **Two consequences a future session must not lose:**

1. **Our free tier already exceeds their paid tier.** They paywall Sections B and C; our free
   report covers Section A, Section B and all 108 Section C disclosures with SEBI wording and an
   ICAI citation each. Do **not** put a competitor's price in product copy — unverified by us, and
   the standing rule against unprovable comparative claims applies. State what we give away.
2. **This constrains the metered free tier (parity item 7).** RSustain meters by BRSR *section*;
   copying that axis means walling off B and C, which are free today, and breaks the standing
   don't. **Meter the recurring collection loop instead** — gap analysis stays wholly free, the
   allowance is one live collection.

The advisory insight has a Saaksh-shaped version: we cannot sell advisory to a consultant, but
"software is the portfolio piece, revenue is paid build work" **is** the SAGE tech-arm reframe.

## Where to look at today's work

- https://saaksh.co/tools/emission-factors — the only new page
- The FAQ is the last section before the footer on `/tools/ghg-calculator`,
  `/scope3-calculator`, `/brsr-applicability`, `/audit-readiness`, `/xbrl-preflight`,
  `/wellbeing-schedule`, `/materiality`, `/ppp-intensity`, `/emission-factors`
- `/llms.txt` and `/sitemap.xml` list the new page; it is in the header under
  **Filing & audit tools**

## Open, in priority order

1. **Google Search Console** — DNS verification plus sitemap. No first-party connector exists, so
   only Rahul can do it. The only thing that converts SEO guessing into measurement, and the
   conclusion two separate analyses now point at.
2. **Talk to the 2 who requested Pro.** Tiny sample, and 100% of the demand signal.
3. **The free-report → Collect handoff**, shaped as one free live collection. The #1 retention
   build and parity item 7 are the same build. See the metering constraint above.
4. **Parity Tier 1** (data already in the repo): ESG compliance calendar; SASB in the crosswalk.
5. **Parity Tier 2:** policy template library (**3 vs their 42 — the biggest countable gap**);
   pre-assurance validator; ESG readiness score.
   ⚠️ Both of the last two have integrity constraints spelled out in the parity plan — no invented
   sector benchmarks, and no MSCI/Sustainalytics score proxy.
6. **White-labelling** — real gap, about a day, `brsr_orgs` is the natural home.
7. **Row-level hardening** of `updateItem`, `setItemEvidence`, `setContactStatus` — still only
   passcode-gated.
8. **ChatGPT MCP app** — a BRSR reference app, not "Saaksh in ChatGPT". After the SAGE call.

## Still true, and still traps

- **Two `brsr_id` conventions.** `framework_mappings.json` is finer-grained than
  `brsr_data_points.json`. Overlays key off the crosswalk ids; the wrong one resolves to nothing
  rather than erroring.
- **`list_tables` row counts are stale estimates.** Use `select count(*)`.
- **`brsr_` tables share a database** with several other apps. Scope every change to the prefix.
- **No per-person seats exist.** Never say "seats" — SAGE's 17 people would share one passcode.
- **Vitest only transforms `.ts`.** Pure logic that needs a test cannot live in a `.tsx`.
