# Saaksh design learnings — consolidated (June 2026)

All the homepage/UI design learnings in one place, drawn from **8 installed design
skills** + the **competitor screenshot teardown**, so we can decide what to apply.
Nothing here is implemented yet — this is a decision menu.

**Sources synthesised**
- `emil-design-eng` (motion & invisible-detail craft)
- `impeccable` (design language + anti-slop bans)
- `minimalist-ui` (premium utilitarian minimalism)
- `design-taste-frontend` (read-the-room anti-slop)
- `high-end-visual-design` (agency craft — used for its *bans* + restrained essence)
- `ui-ux-pro-max` (UX correctness backbone)
- `visual-iteration` + `redesign-existing-projects` (the *process*)
- `product-design` (JTBD / progressive disclosure)
- `docs/competitor-design-teardown-2026.md` (10 competitor homepages, desktop+mobile)

---

## TL;DR — the convergent verdict

Across all eight skills the message is the same, and it's reassuring: **Saaksh's homepage
is already aligned with the editorial / restraint / calm spine** these skills prescribe —
serif-display + mono-label + sans-body system (Newsreader / IBM Plex Mono / Hanken, the
exact pairing `minimalist-ui` and `design-taste` recommend), hairline near-flat cards,
token-driven color, `useScrollReveal`, the Emil `cubic-bezier` easing, `pressable`,
reduced-motion. We are **not** the AI-slop default.

So the work is **not a redesign** — it's targeted upgrades. The gaps every source
independently lands on:

1. **Social proof is the #1 gap** — and it's a *content/asset* problem (we have no
   testimonial, no client logos), not a design one.
2. **No real product screenshots** — the single most universal competitor move; our
   feature sections are mostly text.
3. **A few copy/hero/eyebrow tightenings** that would remove the last AI-grammar tells.
4. **Craft polish on the *new* slots** (how the testimonial / screenshots enter).

And a strong shared warning: **protect the calm/light/serif/cited identity** — do not
chase Newtral's dark-AI skin or the agency-maximalist gloss. Borrow competitors'
*structure*, never their skin.

---

## The decision menu (tick what to apply)

Each item: the learning, **which skills back it**, the concrete Saaksh action, and a
**priority** + rough **effort**. "Blocked" = needs an asset/content from you.

### A. Social proof & real product screenshots — the measured gap

- [ ] **A1. Named testimonial slot, placed high** (Priya: photo + name + role + firm).
  *Backed by:* teardown (every competitor), `design-taste` (real attribution, quote ≤3
  lines, no em-dash), `minimalist-ui` (no "John Doe"), `product-design` (social proof =
  trust). **HIGH · low effort · BLOCKED on Priya's quote + headshot.** Build the slot now,
  fill when it lands.
- [ ] **A2. 2-3 real product screenshots in light browser chrome** (Action Plan, Collect
  workspace, a calculator) in the feature sections. *Backed by:* teardown (#2 universal
  move), `design-taste` ("div-based fake screenshots banned, hero needs a real visual"),
  `high-end`/`ui-ux-pro-max` (concrete > abstract). **HIGH · medium effort.** I can
  self-screenshot our own product (Playwright) — not blocked.
- [ ] **A3. Do NOT build a fake logo wall.** We have no client logos; faking wordmark
  `<span>`s is the amateur tell. *Backed by:* teardown, `design-taste` (real SVG logos
  only), `impeccable` (no fake badges). **(decision, not work)** Lead with A1 instead.

### B. Hero & copy discipline

- [ ] **B1. Cut hero subtext to ≤20 words.** Current is ~40 words, comma-spliced. *Backed
  by:* `design-taste` ("HERO STACK DISCIPLINE: subtext ≤20 words, ≤4 lines"),
  `product-design` (one idea per screen). **HIGH · trivial.**
- [ ] **B2. Move the trust microline out of the hero.** "Client data never leaves your
  browser · Plain-English AI · Cited to SEBI & ICAI" belongs in the trust strip directly
  below (which we already added) — dedupe. *Backed by:* `design-taste` (microline banned
  inside hero), `impeccable`. **MED · trivial.**
- [ ] **B3. Ration section eyebrows to ≤1 per 3 sections.** We use the `<Eyebrow>` mono
  kicker on most sections ("What BRSR actually takes", "Suggested materiality",
  "Cross-framework alignment", "Free and Pro", "Saaksh Pro"…) plus many mono-uppercase
  micro-labels. *Backed by:* `impeccable` (eyebrow-on-every-section = AI grammar; "one
  named kicker as a deliberate system is voice"), `design-taste` (9.F: "#1 violated rule,
  max 1 per 3 sections"). **MED · low.** *Judgement call: is our mono-label system
  deliberate brand voice or scaffolding? Lean to thinning it.*
- [ ] **B4. Ration the middle-dot `·` and decorative `<Dot/>` glyphs** (max ~1 per line;
  drop non-semantic dots). *Backed by:* `design-taste` (9.F). **LOW · low.**
- [ ] **B5. Copy scrub — zero em-dashes, no AI-cliché verbs** (Elevate/Seamless/Unleash/
  Next-Gen/Game-changer/Delve), active voice, sentence case, no aphoristic cadence.
  *Backed by:* `impeccable`, `design-taste` (binary em-dash ban), `minimalist-ui`,
  `redesign` (cliché-copy list), `product-design`. **MED · low.** (We've scrubbed before;
  keep new copy clean.)

### C. Typography & hierarchy

- [ ] **C1. Hierarchy via weight, not just size** (headings 600-700, body 400, labels
  500); `tabular-nums` on *all* stat figures (extend beyond `AnimatedNumber`). *Backed by:*
  `ui-ux-pro-max`, `high-end`, `redesign`. **MED · low.**
- [ ] **C2. Contrast audit on muted labels.** The `#5B6660` / `#8A938D` grays on white
  must clear 4.5:1 (body) / 3:1 (large). *Backed by:* `impeccable` (the #1 readability
  failure), `ui-ux-pro-max` (`contrast-readability`). **MED · low.**
- [ ] **C3. Keep our fonts.** Ignore `high-end`'s "ban Inter, use Clash Display" dogma —
  Hanken + Newsreader + IBM Plex is already premium and *owned*. **(decision)**

### D. Color & surfaces

- [ ] **D1. Lock blue as the single accent; coral/ember strictly semantic** (status/CTA
  pop only, never a second decorative accent). *Backed by:* `minimalist-ui`,
  `design-taste` ("COLOR CONSISTENCY LOCK"), `ui-ux-pro-max`, `redesign`, teardown
  (blue+coral is our differentiator vs the green/dark monoculture). **MED · low.**
- [ ] **D2. One shadow/elevation scale** (e.g. `shadow-sm` cards + one lifted step for
  hero panel/modals), never ad-hoc; keep shadows tinted + ultra-diffuse (<0.05). *Backed
  by:* `ui-ux-pro-max` (`elevation-consistent`), `high-end`, `redesign`. **MED · low.**
- [ ] **D3. Keep cards hairline + faint `tint` + `shadow-sm`** (the *calm* essence of the
  Double-Bezel); optional single `inset 0 1px rgba(255,255,255,.6)` top highlight. *Backed
  by:* `high-end` (restrained extraction), `minimalist-ui`. **LOW · low.**
- [ ] **D4. Tokenize stray hex** (`#5B6660`, `#8A938D`, etc. in `LandingPage.tsx`) into
  semantic tokens. *Backed by:* `ui-ux-pro-max` (`color-semantic`), `redesign`. **LOW · med.**

### E. Spacing & layout rhythm

- [ ] **E1. Codify a spacing rhythm** (4/8 base; section tiers 16/24/32/48; cards ~16px,
  primary 20-22) applied consistently. *Backed by:* `ui-ux-pro-max`, `high-end`,
  `minimalist-ui`. **MED · med.**
- [ ] **E2. Vary section layouts** (≥4 distinct layout families; max 2 consecutive
  image+text zigzags). *Backed by:* `design-taste` (Section-Layout-Repetition ban),
  `redesign`, `impeccable` (no identical card grids). **MED · med.** *Audit needed.*
- [ ] **E3. Cap whitespace at `py-16/24`** — do NOT chase `py-40` (reads as a thin agency
  portfolio, not a dense compliance tool). *Backed by:* `high-end` (capped), `ui-ux-pro-max`
  (consistency > variance). **(decision)**

### F. Motion & micro-interactions (we already have the infra)

- [ ] **F1. Scale-on-press on every CTA.** Audit that every `<button>`/`<Link>` carries
  `pressable` + `--ease-out`; replace bare `transition-colors`/`transition:all` with named
  properties. *Backed by:* `emil` (#1 rule), `ui-ux-pro-max`, `redesign`. **MED · low.**
- [ ] **F2. Clip-path image reveals for the new screenshots/testimonial** (`inset(0 0 100%
  0)` → `inset(0 0 0 0)` on scroll-in, `once:true`); never animate from `scale(0)` — start
  `scale(0.95)`+opacity. *Backed by:* `emil`. **MED · low** (do it when building A1/A2).
- [ ] **F3. Stagger logo/source rows** 30-50ms per item (the trust-strip sources, any
  future row). *Backed by:* `emil`, `ui-ux-pro-max`. **LOW · low.**
- [ ] **F4. FAQ accordion uses ease-out** (never ease-in), transition not keyframe, exit
  faster than enter. *Backed by:* `emil`, `ui-ux-pro-max`. **(applies to G1).**
- [ ] **F5. Calm motion only** — reserve overshoot/`chip-spring` for small playful chips;
  no bounce on hero/section/CTA; no delight motion on high-frequency in-app actions
  (checklist expand, filters). *Backed by:* `emil` (match motion to mood), teardown
  (trust = no wiggle). **(principle)**

### G. Conversion / UX

- [ ] **G1. FAQ accordion before the final CTA** — 4 objection-answering Q&As: "Is the
  readiness tool really free?", "Does client data leave my browser?", "How is the AI kept
  from inventing numbers?", "What does Collect cost?". *Backed by:* teardown (breatheESG),
  `minimalist-ui` (accordion spec: hairline-separated, `+`/`-`), `product-design`
  (answer objections). **MED · low.** (Reuse the Templates-tab accordion pattern.)
- [ ] **G2. Keep one primary CTA per screen** (Start a free report) + one subordinate
  secondary. *Backed by:* `product-design`, `ui-ux-pro-max` (`primary-action`),
  `impeccable`. **(already satisfied — protect it.)**

---

## What NOT to do — protect the identity (every source agrees)

- **Don't chase Newtral's all-dark / glass "AI" skin**, mesh gradients, glowing orbs,
  `backdrop-blur` Vantablack cards. It erases our near-white editorial canvas and joins the
  monoculture we differentiate against. *(teardown, `high-end` reject-list, `impeccable`)*
- **No literal green** (Greenly/Plan A/breatheESG cliché) — blue+coral is more
  distinctive; Persefoni proves warm-coral can be premium (plays to our ember).
- **No isometric 3D illustrations** (Updapt) — dated.
- **No enterprise mega-clutter** (Oren's 12,000px) — calm/affordable is our asset.
- **No fake or aspirational badges** (Verdantix/SOC 2/ISO we can't claim) — the amateur
  tell. Honest "on the roadmap" lives on `/security` only.
- **No fake logo wall** of text wordmarks (see A3).
- **No double-bezel nesting, rotated cards, `py-40`, "never the same layout twice"
  variance mandate** (`high-end` maximalist skin) — fights calm + legibility.
- **No em-dashes, no emoji-as-icons, no AI-cliché copy, no AI-purple/blue gradient
  fingerprint, no pure-black slabs, no generic 1px-gray-border + harsh-dark-shadow cards,
  no Lucide/Feather-default icons + cliché metaphors (rocket/shield), no Title Case.**
- **The "lone dark section" trap:** keep our dark AI section + forest CTA reading as
  *deliberate rhythm*, not a copy-paste accident (`redesign`).

---

## Cross-skill agreement (why to trust the priorities)

| Learning | emil | impeccable | minimalist | taste | high-end | ui-ux-pro | redesign | teardown |
|---|---|---|---|---|---|---|---|---|
| Real product screenshots | ✓ |  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Named testimonial (real attribution) |  | ✓ | ✓ | ✓ |  | ✓ |  | ✓ |
| Ration eyebrows |  | ✓ | ✓ | ✓ |  |  | ✓ |  |
| Tighter hero / ≤20-word sub |  | ✓ | ✓ | ✓ |  | ✓ |  | ✓ |
| One accent locked (coral semantic) |  | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| One shadow scale / hairline cards | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| Scale-on-press, ease-out, no bounce | ✓ | ✓ |  | ✓ | ✓ | ✓ | ✓ |  |
| No em-dash / AI-cliché copy |  | ✓ | ✓ | ✓ |  | ✓ | ✓ |  |
| Don't chase dark-AI / keep identity |  | ✓ | ✓ | ✓ | ✓ |  | ✓ | ✓ |
| FAQ accordion |  |  | ✓ |  |  |  | ✓ | ✓ |

---

## The recommended *process* (from `visual-iteration` + `redesign-existing-projects`)

When we do apply changes, run an **audit-first + screenshot-verify loop**, not a blind
batch:
1. `npm run dev` (TLS bypass), Playwright full-page screenshot of `/` at **1280px + 375px**
   = "before".
2. Benchmark each Saaksh section against (a) craft refs — Linear/Attio/Vercel/Stripe — and
   (b) the domain refs in `docs/competitor-design/*.jpeg` (Newtral structure, Persefoni
   warm-premium, Watershed logo-wall-under-hero).
3. Fix **one finding at a time** (smallest change: token value → class), **re-screenshot,
   compare, keep or revert.** Never report done without seeing the corrected state.
4. Fix order (risk ladder): copy/font → color/tokens → states/motion → layout/spacing →
   new components (testimonial, screenshots, FAQ) → final type polish.
5. Mobile pass at 375px; guardrail re-scan top-to-bottom; confirm identity preserved.
*(Saaksh uses Tailwind utilities + the token layer — so "fix the CSS custom property" maps
to tuning `tailwind.config.ts`/`globals.css` + classes, not an inline-style rewrite.)*

---

## Suggested first cut (if you want a recommendation)

A single, low-risk **"homepage polish" pass** bundling the cheap high-agreement wins:
**B1 (tighten hero), B2 (move trust microline), B3 (thin eyebrows), B5 (copy scrub),
C2 (contrast), D1 (accent lock), F1 (press feedback), G1 (FAQ)** — all inside
`LandingPage.tsx`, no new assets, verified with the screenshot loop. Then a second,
**asset-dependent pass** for **A1 (Priya testimonial)** + **A2 (real product
screenshots)** + their **F2 reveal craft** — the items that actually close the measured
competitive gap, once we have Priya's quote/photo (I can produce the product screenshots
myself).
