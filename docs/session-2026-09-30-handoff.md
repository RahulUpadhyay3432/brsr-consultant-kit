# Session handoff — 2026-09-30

Written to end a long session cleanly. Everything a fresh chat needs is here or linked from here.

**Read in this order:** this file → `docs/sage-call-2026-10-05.md` (the call this work serves) →
`docs/product-dossier-2026-09-30.md` (the research that should drive the backlog).

## State of the repo

- `master` = **`afd233a`**, 8 commits ahead of what is deployed.
- **Production is `7cb0b0c`** (2026-09-09). **Nothing from this session is live.**
- Verified on `master`: typecheck clean · **138 tests, 18 files** · `next build` clean · **207 pages**.
- `master` and `claude/busy-curie-ij42lc` point at the same tree (master then took 3 more commits).

## What shipped

| Commit | What |
|---|---|
| `1ab9764` | **Firm tier.** `listCampaigns()` ran `select *` with **no WHERE clause** and one shared passcode, so any consultant who signed in saw every other consultant's clients, contacts, values and evidence. Campaign-level queries now filter by `org_id`. |
| `e65b6c8` | Default firm resolves **by slug**, so a live secret never lands in a table. Migrations 001 + 002 applied. SAGE context persisted. |
| `3026453` | **P6 → CDP/EcoVadis** field-level mapping, 26 of 27 rows, zero invented vocabulary. |
| `668a3b9` | **`/academy`** — an eight-module BRSR teaching pack generated from existing reference data. |
| `b083a22` | Records that **pushing to `master` does not deploy**. |
| `4c1e0f3` | Memoised the firm lookup (was 2+ Supabase round trips per render). |
| `afd233a` | **Homepage was computing Scope 2 with the wrong emission factor.** See below. |

## Done outside the repo

- **Migrations 001 + 002 applied** to Supabase project `girogiauxecthlxxspyi`. 9 campaigns, **0
  unadopted**, all in the `saaksh` firm. `brsr_contacts.received_at` now exists.
- **SAGE firm row created** (`slug='sage'`).
- **`CONSULTANT_PASSCODES` set on Vercel production** as a *sensitive* variable.

## The one blocking action

Only Rahul can do this. The Vercel project has **no Git link**, so nothing deploys on push:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; vercel --prod --yes
```

Until then: the firm tier is not live, the SAGE passcode does not work, `/academy` is not
published, and the emission-factor fix is not out.

**After deploying**, re-run the adoption statement in `docs/migrations/001-firm-tier-orgs.sql` —
it is idempotent (`where org_id is null`) and re-adopts any collection created on the live site
while old code was still inserting without `org_id`.

## The two real bugs found by auditing rather than building

Both passed typecheck, tests and build cleanly. Neither was visible to any static check.

1. **Homepage computed Scope 2 with `0.716` captioned "CEA v18 (FY24)"**, while
   `emission_factors.json` said **0.710, CEA Version 21.0, FY 2024-25**. The site's *own* blog post
   names using 0.716 instead of 0.710 as the stale-factor error "flagged by an assurer". Fixed by
   making both the arithmetic and the caption read from the factor file, and by showing the
   version plus the reporting year it applies to instead of a "latest factor" badge.
2. **Duplicate firm lookups** — layout and page both resolved the org unmemoised.

This is the argument for doing the dossier's **P0 audit** before more features.

## Still open, roughly in priority order

1. **Deploy** (above).
2. **Finish the P0 audit** — `docs/product-dossier-2026-09-30.md` lists what is verified and what
   is not. AI importing, the assurance ledger, XBRL pre-flight, the fee builder and multi-client
   workspaces are all **advertised but unverified end to end**.
3. **Runtime-verify the firm tier.** It has **never served an HTTP request** — all confidence is
   static. After deploying, drive `saaksh.co` with Playwright and the SAGE passcode: sign in,
   confirm the rail reads SAGE, confirm the client list is empty and separate from the 9.
4. **Row-level hardening.** `updateItem`, `setItemEvidence`, `setContactStatus` are still only
   passcode-gated and would accept another firm's id. Reaching one needs an unguessable uuid that
   no scoped listing hands out, but it is not true isolation. **If asked how client data is
   separated, say: firm-level separation on collections is in; row-level hardening is next.**
5. **The validation workbench** (dossier P1) plus the three QMS primitives.
6. **The Sunday call brief** (was owed 2026-10-04 for the Monday call).
7. **Per-person seats.** SAGE's 17 people would share one passcode. **Never say "seats" — they do
   not exist.**
8. `.env.local` on Rahul's machine still lacks `CONSULTANT_PASSCODES` (production has it).

## Traps that cost time in this session

- **Two `brsr_id` conventions.** `framework_mappings.json` is finer-grained than
  `brsr_data_points.json` — 27 P6 rows versus 13 essential + 8 leadership. In the data-points
  convention **P6-E1 is energy and P6-E7 is GHG**; in the crosswalk those numbers mean different
  disclosures. Overlays key off the **crosswalk** ids. The wrong one resolves to nothing rather
  than erroring.
- **`list_tables` row counts are stale planner estimates.** It reported 0 campaigns when there
  were 9. Use `select count(*)` whenever the number matters.
- **Git metadata on a Vercel deployment proves nothing** about a GitHub integration — the CLI
  writes `githubCommitRef` and `githubCommitSha` from the local checkout.
- **`brsr_requests` has an unused `consultant_id uuid`** (0 of 9 populated, referenced nowhere).
  Left alone deliberately; it is the natural home for per-person attribution when seats land.
- The `brsr_` tables share a database with several of Rahul's other apps. **Always scope changes to
  `brsr_`-prefixed tables.**

## Not Saaksh, but worth surfacing again

Supabase's advisor flags **11 tables with RLS disabled** in that shared database — `startups`,
`investors`, `funding_rounds`, `round_investors`, `community_signals`, `user_tech_stack`,
`ingestion_log`, `ecosystem_signals`, `ecosystem_insights`, `vp_maintenance_log`,
`seller_pulse_state` — readable and writable by anyone holding the anon key. **No `brsr_` table is
affected.** Also `fbx_feed` is SECURITY DEFINER and 9 SECURITY DEFINER functions are `anon`
-callable. Deliberately not fixed: enabling RLS without policies would break those apps.
