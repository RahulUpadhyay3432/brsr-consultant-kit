# Session handoff — 4–5 October 2026

Written to end a long session. **Read `docs/THE-ONLY-DOC-YOU-NEED.md` first** (or the PDF built
from it); this file is the engineering record behind it.

## State of the repo

- `master` = **`0d073a2`**, pushed to both `master` and `claude/busy-curie-ij42lc`.
- Typecheck clean · **196 tests, 23 files** · `next build` clean · **208 pages**.
- Production auto-deploys from `master`.
- Migrations 001–004 applied; nothing pending.

⚠️ The container's network policy **denies `saaksh.co:443`**, so nothing shipped this session has
been seen rendering. Every "it works" below means tests and build, not a loaded page.

## ⚠️ The thing a new session most needs to understand about this user

Rahul **did not write the emails that won the SAGE meeting** — an agent did, from a different
Claude Code project. He **does not know this domain**: he asked "what is EcoVadis, I have no idea."
He **told Dr. Kad he had read her article and he has not.**

Three consequences:

1. **Never assume he knows a term.** Spell out every acronym the first time. He was rightly angry
   when a framework briefing explained what CDP *does* without once saying what the letters stand
   for.
2. **Never leave a status ambiguous.** He was angrier about a document that said "half built" in
   one place and "built" in another than about the gap itself. **Say BUILT or NOT BUILT, and make
   every artifact agree.**
3. **He asks for a TLDR after every message**, carrying all the important points.

## What shipped

| Commit | What |
|---|---|
| `ebea4db` | Audited all 13 claims in the SAGE emails against the repo. 12 true, GRESB false. |
| `f98ebea` | **GRESB crosswalk built** — 40 of 77 rows, Real Estate and Infrastructure separately. |
| `3be322e` | Framework explainer, and the **measurement** of why collect-once was not wired. |
| `b5d9f80` | Every acronym spelled out, and the three that must not be. |
| `fd81103` | `THE-ONLY-DOC-YOU-NEED.md` — one self-contained document from zero. |
| `a3e9d4e` | **The bridge: a collected figure carries into other frameworks.** P6. |
| `16acd38` | The briefing as a designed 26-page PDF (`docs/SAGE-call-briefing.pdf`). |
| `0d073a2` | **People bridged** (P3 + Section A), and the PDF contradiction fixed. |

## The central engineering finding — do not lose this

**The product carries two BRSR numbering conventions and they collide.**

- `brsr_data_points.json` follows **SEBI's own question numbering**. `P6-E7` = greenhouse gases.
- `framework_mappings.json` splits questions into metrics and **renumbers**. `P6-E7` = water
  withdrawal. `P3-L1` = total employees by gender, where SEBI's `P3-L1` is life insurance.

**Measured: only 19 of 108 ids appear in both, and the shared ones mean different disclosures.**
Joining by id renders a client's GHG figure under a water heading.

`src/data/collect_crosswalk_bridge.json` reconciles them **by hand**, read label by label. It is
the only thing standing between this feature and a confidently wrong number on screen.
`framework-coverage.test.ts` includes a **subject-matter crossing check** that fails if a water
question ever feeds a GHG metric. **Never generate or infer bridge entries.**

## What "collect once, map across frameworks" now means

The email promised a workspace where a client collects each number once "(energy, water, people)"
and it maps across BRSR, CDP, EcoVadis and GRESB.

| | Status |
|---|---|
| **Energy** (P6) | ✅ built |
| **Water** (P6) | ✅ built |
| **People** (P3 + Section A) | ✅ built — ⚠️ **headcount and turnover live in Section A, not P3** |
| Also built in P6 | Emissions (Scope 1/2/3), waste, air pollution, biodiversity |
| P1, P2, P4, P5, P7, P8, P9 | ❌ **crosswalk exists, pipe does not.** The screen says so. |

**27 bridge entries, 17 documented refusals.** Scope comes from the bridge file, not from a
hard-coded filter — **adding a principle is a data change plus hand reconciliation**, not a code
change.

Surface: **`/requests/[id]/frameworks`**, linked from the campaign workspace and `CollectNav`.

## Two process errors worth not repeating

1. **In the claim audit I asked the wrong question.** I checked "does a CDP/EcoVadis/GRESB mapping
   exist?" and ticked it, instead of "does the collect-once workflow work end to end?" The real gap
   surfaced only when Rahul pushed. **Audit the promise as a user would experience it, not as a
   data file.**
2. **The PDF contradicted itself** — contents said "half built", Part 7 said built, because the
   contents line predated the build. **When a status changes, grep every artifact for the old
   wording.**

## Deliberate refusals, all documented in the data files

- **GRESB was NOT faked.** Its vocabulary was sourced from the published Assessment structure first;
  research corrected two of my own guesses (**Employee Engagement**, not "Stakeholder Engagement";
  **ESG Reporting**, not "Reporting").
- **Business continuity plan ≠ climate scenario analysis.**
- **Green Credits ≠ carbon offsets.**
- **Premises accessibility ≠ count of differently abled employees.**
- **Statutory dues ≠ minimum wage.**
- **P2, P5, P7, P8 map nowhere in GRESB** — it has no product-lifecycle, human-rights, advocacy or
  statutory-CSR aspect.

## The SAGE call

**It was Monday 5 October, 11:30 IST. Rahul said it got shifted and has not given the new time.**
Ask for it.

- Her: **Dr. Shashi Kad**, she/her, PhD Earth Sciences, Oxford, certified in **GRI, SBTi, CDP,
  Integrated Reporting**, leads **Green Skills Academy** (NSDC-backed). **SAGE** is a B Corp,
  Bengaluru, ~17 people, 65+ clients, **90% repeat or referral**.
- **The pitch is a test, not the product:** one live SAGE engagement run through Collect, free.
- Their method is **"guided traverse → independent traverse"** and **Collect is a handover
  mechanism** — use her words.
- **Never say:** seats · any price · "only"/"first" · a competitor's price · "nothing leaves your
  browser" about Collect · that Collect is validated · the 7-of-16 response rate · the fictional
  homepage sample company.
- **GRESB is no longer a never-say** — it is built. But it was named in the email *before* it
  existed, which is what triggered the whole audit.

**Still outstanding and not a build: Rahul has to read her article.** Ten minutes, one agreement
and one question written down.

## Open, in priority order

1. **Google Search Console** — DNS verify + sitemap. Only Rahul can. Two independent analyses point
   at indexing and authority, not features. **Highest-value open item, and not a build.**
2. **Verify the live site** — `/requests/[id]/frameworks`, and the homepage grid factor reading
   **0.710 / CEA v21.0 / FY 2024-25**. No session can see it.
3. **Talk to the 2 Pro requesters** — 100% of the demand signal.
4. **Bridge more principles** — each needs hand reconciliation. P9 (consumers) and P1 (ethics) are
   the next most useful.
5. **Row-level hardening** of `updateItem`, `setItemEvidence`, `setContactStatus` — still only
   passcode-gated.
6. **Parity backlog** — `docs/competitor-parity-plan.md`. Policy templates (3 vs 42) is the biggest
   countable gap.

## Traps that still bite

- **Two `brsr_id` conventions** (above). The single most dangerous thing in this repo.
- **`list_tables` row counts are stale estimates.** Use `select count(*)`.
- **`brsr_` tables share a database** with other apps. Scope every change to the prefix.
- **Vitest only transforms `.ts`** — pure logic that needs a test cannot live in a `.tsx`.
- **ReportLab/Helvetica is WinAnsi.** `ā ṣ → −` render as **solid black boxes**. Use `<sub>` tags,
  never Unicode subscripts. `scripts/build-sage-briefing-pdf.py` rebuilds the PDF.
- **No per-person seats exist.** Never say "seats".
- **Plain `git push` can report "up-to-date" wrongly** when HEAD is on the feature branch; push with
  an explicit refspec and verify with `git ls-remote`.
