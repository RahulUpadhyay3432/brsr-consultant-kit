# Session handoff — 21 October 2026

## The short version

- **Shipped and live:** the calculators have the "depth" look from the user's Lovable design.
  Live commits: `1c2dc48`, then the font fix `4e040b7`.
- **Font decision, reversed the same day:** Fraunces went onto every site title, and the user
  rejected it on seeing it live. Site titles are now Apple-style sans (Hanken semibold, tight
  tracking). Fraunces lives **only** inside the calculator panels.
- **Next:** roll the same depth surfaces out to the rest of the product. The user chose
  "calculators first, the rest after review".

## What was built

**Source.** The Lovable export at `~/Downloads/eco-shine-tracker.zip` is the same "Frost
Editorial" project as `Visual Review Hub.zip`. Read it with `unzip -p`; it doesn't need extracting.
The parts that matter are `src/styles.css` (the `frost`, `spec` and `field-shell` utilities),
`src/components/site/SiteShell.tsx` (the `Backdrop` orbs) and `src/components/site/CalcBits.tsx`.

**Why the depth works:** glass only reads as glass when something sits behind it. On our flat
white page a translucent card just looks grey. Three layers do the work:
1. A tinted stage behind the cards.
2. Translucent white panels with a *white* rim rather than a grey hairline.
3. A long, brand-tinted shadow with a negative spread (`0 24px 60px -28px`), so it pools *under*
   the panel. An inset 1px top highlight finishes it.

**Code:**
- `src/app/globals.css` adds these classes (all additive):
  - `.calc-stage`: static radial gradients; no blur filters, no animation.
  - `.glass`: opaque fallback without backdrop-filter; flattened to white in print.
  - `.glass-soft`.
  - `.glass-sheen`: a background layer, so it paints under the label.
  - `.field-glass`.
  - `.font-serif-display`: Fraunces.
- `src/components/calc/CalcKit.tsx` is new and replaces three duplicated Field/ResultRow copies:
  - `CalcPanel`.
  - `NumberField`: the unit sits inside the field and the factor prints under it. It's
    `type="text"` with `inputMode="decimal"`, sanitised to digits and one dot, so the mouse wheel
    can't change values and `e` is rejected.
  - `ResultList`, `ResultRow`, `Citation`.
  - `FactorLog`: collapsible inside the report.
  - `SegmentedTabs`.
- `EmissionsCalculator` and `Scope3Calculator` take `layout="page" | "embedded"`.
  - **page:** the "Disclosure figure" sits in a sticky right column, and the page supplies the
    stage.
  - **embedded:** everything stacks inside its own rounded stage well in the report row.
  - Panels are titled by GHG category. Electricity comes first because every client has it.
- `calcGhg` now also returns `scope1_fuel_tco2e` and `scope1_fugitive_tco2e`. This is additive;
  the totals are unchanged.
- Pages changed: `/tools/ghg-calculator`, `/tools/scope3-calculator`, `/tools/ppp-intensity` and
  `/tools/xbrl-preflight`, plus the report rows P6-E1, P6-E3, P6-E7 and P6-L2.
  - On the GHG page, the old explainer rail is gone. The scope diagram moved into "What Scope 1, 2
    and 3 mean", and the result panel links to `#factors`, the derivation table.
- **Fonts:**
  - `Fraunces-var.woff2` is self-hosted via `scripts/fetch-fonts.mjs` (which now skips existing
    files) and is not preloaded.
  - `.font-editorial` is now Hanken. The class name is historical.
  - The blog uses Newsreader exactly as before.

**Deliberately not copied from Lovable:**
- Its palette: the depth is tinted with our own blue and navy.
- The animated drifting orbs.
- The glossy gradient CTA.
- Inter and shadcn.

**Verified:**
- 12/12 Playwright functional checks:
  - 1000 L diesel + 10,000 kWh gives 9.78 tCO₂e, and turnover 100 gives intensity 0.0978.
  - Diesel entered in P6-E7 shows in P6-E1 and survives a reload.
  - `1.2.3e-5` becomes `1.235`.
  - The mouse wheel doesn't change a value.
  - The factor log lists 12 sources.
  - Scope 3 domestic air: 1000 pkm gives 0.27 t.
- Other checks:
  - No horizontal overflow at 390px on all 4 pages.
  - Muted text on glass is about 5:1 contrast at worst.
  - 200/200 tests pass.
  - 208-page build is clean.

## Deploy facts learned today

- **Pushing to `master` auto-deploys**, but Vercel's GitHub webhook lagged **about 15 minutes**
  before the deployment started.
- **saaksh.co serves a "Vercel Security Checkpoint"** (`X-Vercel-Mitigated: challenge`) to `curl`
  and to headless Playwright, so the live HTML can't be checked from scripts.
  - Verify through GitHub instead:
    `gh api repos/RahulUpadhyay3432/brsr-consultant-kit/commits/<sha>/statuses` (the "Vercel"
    context), and `.../deployments` (the environment should be Production).
- ⚠️ **Open:** confirm the bot checkpoint isn't also blocking Googlebot, Bingbot and the AI
  crawlers (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot). That would quietly undo the SEO/AEO
  sprint. Check it in Vercel → Firewall.
- Origin was **40 commits ahead** of this machine, from other sessions. Always
  `git fetch && git log HEAD..origin/master` before pushing, and rebase rather than force-push.
  The first rebase attempt failed on a transient Windows file lock; abort and retry, and it works.

## Open follow-ups, in order

1. **Roll the depth surfaces out to the rest of the product** (landing, report, pricing and
   others). Reuse `.calc-stage`, `.glass` and `CalcKit`; don't build a second card system. Keep
   site titles sans.
2. **Phone layout:** the result sits below 13 inputs. A sticky total bar would help.
3. **Water discharge and consumption (P6-E4)**, which Lovable added, was skipped because it
   changes the persisted `CalcInputs` shape. That needs a decision.
4. Check the Vercel bot checkpoint against search and AI crawlers (see above).
