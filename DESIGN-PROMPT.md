# Redesign brief: two crosswalk surfaces in Saaksh

## Read this first: this is a redesign of shipped UI

Both surfaces below are **already built and live in production** at saaksh.co. They work. Real consultants use them daily. I am not asking you to invent a feature, a framework, or a data model. I am asking you to fix two diagnosed layout failures in existing UI.

Do not redesign the product, the navigation, the brand, or anything outside these two surfaces. A developer will imitate your mockup line by line in a Next.js + Tailwind codebase, so every value you use gets copied into production. Precision matters more than flourish.

**[ATTACH THE SCREENSHOTS HERE.]** They are the current shipped state, captured from production. Do not visit the site instead: the ratings surface renders client-side from browser storage and has no reachable URL, and a fetched page gives you the markup with the styling stripped, which is the opposite of what you need. The screenshots plus the exact tokens below are the whole picture.

| File | What it shows |
|---|---|
| `01-crosswalk-public-hero-1440.png` | The public page: site header, navy hero, the selector. Design language reference. |
| `02-crosswalk-ALL-badge-soup-1440.png` | **Problem 1.** The default resting state, at density. |
| `03-crosswalk-FOCUSED-esrs-1440.png` | The focused single-framework view. This works, do not break it. |
| `04-crosswalk-row-expanded-1440.png` | An expanded row: per-framework blocks, honest "no counterpart" states, the `notes` prose. |
| `05-ratings-top-1440.png` | Ratings: the four scheme cards, the P/A/R band, the count chips, in the report shell. |
| `06-ratings-NESTED-CARDS-1440.png` | **Problem 2.** The repeating per-principle card with a 2x2 grid inside it. |
| `07-ratings-honest-empty-state-1440.png` | The non-negotiable CDP "not covered" state, in context. |
| `08-ratings-mobile-390.png` | Ratings at 390. |
| `09-crosswalk-mobile-390.png` | Crosswalk at 390. The five-column problem on a phone. |
| `10-design-language-report-overview-1440.png` | The report shell: sidebar, tokens, card treatment, in the wild. |

The analytics consent card and the floating help pill are suppressed in these shots. Neither is under redesign; do not reproduce them.

---

## The test this design has to pass

A consultant has a client on the phone. The client asks one of two questions:

1. "We already file BRSR. What is left for us on CSRD?"
2. "Our EcoVadis score is worse than our BRSR completeness. Why?"

The design answers in seconds, or it fails. Everything below is downstream of that.

---

## The product, briefly

Saaksh is a compliance tool for independent ESG consultants in India. They prepare BRSR reports (India's mandatory sustainability disclosure format, set by the securities regulator SEBI). Users are professionals doing billable work. They arrived with a question; they are not browsing. Density, precision and citations are the value.

The brand's soul is **defensible, cited data**. Every claim traces to a source. Nothing is invented. Absence is stated plainly. That drives a hard constraint below.

Tone: calm, editorial, dense but legible. Linear and Attio, not consumer SaaS.

---

## Both surfaces live in one shell

This matters and the existing screenshots will show it. The two surfaces are **sub-tabs of a single "Alignment" tab** inside the consultant's report, sharing one header that carries a **"Download CSV"** and a **"Download Word"** button, both of which retarget to whichever sub-tab is active. Surface 1 additionally has a **public twin** at `/tools/brsr-framework-mapping` (same component, cold SEO traffic, sits under a site header and a navy hero, above a footer).

**Container widths, real:** the public page content column is **1120px max**. The report version sits inside a left sidebar rail that eats roughly 240px, so at a 1440 viewport the content column is around **1150px**. Design to ~1120, not to 1440. A 5-column matrix at 1120 is a different problem than at 1440.

Design the **content pane only**. Assume the shell exists. Your file may use a simple tab strip to let me switch between your options; that strip is a review convenience and must not be imitated by the developer. Say so in an HTML comment.

---

## SURFACE 1: Framework crosswalk

### What it is

Maps each of **77 BRSR disclosures** to its counterpart in five frameworks.

| Framework | Rows covered (of 77) | Fields present per mapped row |
|---|---|---|
| GRI | 75 | standard code + label. The code already contains its own "GRI " prefix (`GRI 2-12`), do not prepend another. No detail string. |
| TCFD | 37 | pillar (one of Governance / Strategy / Risk Management / Metrics and Targets) + detail |
| IFRS S1/S2 | 48 | reference only, no detail. Often **multiple, semicolon joined**: `IFRS S1 Para 26; IFRS S2 Para 5` |
| TNFD | 16 | pillar + detail |
| ESRS (CSRD) | 74 | standard + detail |

**The detail model is asymmetric.** Three of five frameworks carry a detail string, two do not. Do not design an expand-row that assumes a uniform detail line under every cell.

**BRSR ids are not what you would guess.** The suffix letter is a per-principle mnemonic, not an indicator type. The real id space, with real counts:

```
P1-G1 … P1-G8   (8)   Ethics, Transparency and Accountability
P2-S1 … P2-S5   (5)   Sustainable and Safe Goods and Services
P3-L1 … P3-L14  (14)  Employee Wellbeing and Safety
P4-Q1 … P4-Q3   (3)   Stakeholder Engagement
P5-H1 … P5-H5   (5)   Human Rights
P6-E1 … P6-E27  (27)  Environment
P7-R1 … P7-R3   (3)   Policy Advocacy
P8-I1 … P8-I5   (5)   Inclusive Growth and Equitable Development
P9-C1 … P9-C7   (7)   Consumer Responsibility
                 = 77
```

Use these. `P3-E2` and `P1-L1` do not exist. Invent nothing that looks like a citation: if you need filler rows to reach density, reuse the id pattern above with plausible labels and mark the block with an HTML comment saying the strings are placeholder.

Every row also carries a **`notes` field**: a full sentence of cross-framework caveat prose. Real example on P1-G1: *"BRSR asks whether the highest authority has responsibility for ESG; TCFD and IFRS S2 narrow the lens to climate; GRI covers all sustainability impacts."* This is the most defensible content on the page. Your design must have somewhere to put it.

### What ships today

A chip selector, "Map BRSR to": `All frameworks` · `GRI 75` · `TCFD 37` · `IFRS S1/S2 48` · `TNFD 16` · `ESRS (CSRD) 74`. Plus a **search input** (searches id, label and every framework field) and a **TCFD pillar filter** that appears only when TCFD or All is in view. Both exist today and must survive; a 77 row reference with no search is a regression.

- **All frameworks** (the default, the resting state): each row shows the BRSR id chip, the disclosure label, then up to five colour-coded badges. The badges contain the **reference text**, not the framework name: `GRI 305-1`, `TCFD: Metrics and Targets`, `IFRS S2 29(a)`. They are long and variable width.
- **Single framework**: a focused two-column crosswalk. BRSR label left, that framework's reference right, detail beneath. **This works. Do not break it.**
- Rows expand for full detail.

### The problem

**Five variable-width coloured pills times 77 rows is 385 coloured objects on one page.** The variable width is the soup: there is no column to scan, no anchor, no rhythm. It is the default state, so it is the first thing every user sees, and it is the weakest thing on the page.

**Sparsity is the whole design constraint, and it is worse than one column.** Of 77 rows: TNFD covers 16 (a column 79% empty), TCFD 37 (52% empty), IFRS 48 (38% empty), GRI 75, ESRS 74. Three of the five columns are substantially blank.

Rows by how many of the five frameworks they map to: **1 framework: 1 row · 2: 27 rows · 3: 14 rows · 4: 22 rows · 5: 13 rows.** So the common row is a 2, only 13 rows are full, and exactly one row is nearly bare. Design against that distribution, not against a full grid with a few gaps. Every row does have at least one counterpart, so nothing renders entirely empty.

### Give me two options

I want **two structurally distinct resting states**, not one polished answer, and not the same layout twice with different padding. Different means different information architecture. Candidate directions, argue for whichever you take:

- A genuine **table**: 77 rows down, 5 framework columns across, the cell holds the reference text, not a pill. The eye scans a column. Gaps read as gaps.
- A **coverage overview** that navigates into detail: a compact density view of which principles are covered where, sparse frameworks legible as sparse, click through to the focused view.
- **Focused mode as default**: pick a framework first, "All" becomes a coverage summary rather than a row dump. Legitimate; if you take it, show the landing state. Note the SEO tension: the public page ranks on queries like "does BRSR map to GRI", so **all 77 rows must remain in the initial markup** even if only one framework's column is visually foregrounded. Do not gate content behind a click at the DOM level.

**Colour rule, and this is the fix, not a suggestion:** in the resting state, framework identity colour appears **at most once per column, in the header**. Never once per row. Five coloured dots per row is 385 colour events in a different shape, which is the same bug. Keep the hues (they are learned), move where they land.

**Show the scaling device, do not just show 15 rows.** Sticky header, grouping by principle, search, pagination, virtualization: whatever makes 77 survivable must be visible in the mockup, not implied.

---

## SURFACE 2: ESG ratings crosswalk

Report only. Not publicly reachable. The audience is a paying user, so it can be denser and more expert than the public page.

### What it is

Maps each of the **9 BRSR principles** to four **scored** assessment schemes. Different in kind from Surface 1: these are ratings, not disclosure frameworks. The client gets a grade.

| Scheme | Distinct entries mapped | Coverage of the 9 principles |
|---|---|---|
| MSCI | 24 key issues (drawn from a 35 issue universe; 7 to 15 scored per sub-industry) | all 9 |
| DJSI / S&P CSA | 23 criteria | all 9 |
| CDP | 9 disclosure areas | **5 of 9** |
| EcoVadis | 21 criteria | all 9 |

Per principle, the data also carries: an `msci_pillar`, a `djsi_dimension`, an `ecovadis_theme`, and a **full-sentence `note`** (P1's runs three clauses and explains why the anti-corruption policy is effectively the whole EcoVadis Ethics theme). Plus a long closing methodology disclaimer for the surface. Design for prose, not just chips.

**EcoVadis themes are compound and this breaks the obvious grouping.** Real values include `Environment / Sustainable Procurement`, `Labour and Human Rights / Sustainable Procurement`, `Environment / Ethics`. A principle can straddle two themes. Any layout that files the 9 principles under 4 theme headers dies on those rows.

### What ships today

Four definition cards in a 2x2 grid. Then a Policies/Actions/Results insight band. Then count chips. Then **one card per principle**, and **inside each of those nine cards, another 2x2 grid of four "SchemeBlock"s** (label + chips, or an empty state).

### The problem

**Nine cards containing four boxes each is thirty-six boxes.** A card inside a card is always wrong. The structure is doing no work; it is a container tax. The eye stops reading by P3, and nothing signals which principle matters or where the interesting information is.

Decide explicitly what happens to the four scheme definition cards. They are the textbook identical card grid. Dissolve them, move them, or defend them, but do not silently re-render them.

### The differentiator to feature

This is the most valuable idea on the page and today it is a thin band nobody reads:

> **EcoVadis scores every theme on three weighted axes: Policies 25%, Actions 40%, Results 35%.**
> **BRSR Section B is policies. BRSR Section C is results. Actions carries the heaviest weight and BRSR gives you no source for it. That is the systematic score gap: most Indian filers have the policy and the number, but never document what they did in between.**

Paid ESG masterclasses charge to teach this. It should be visually load-bearing, something a consultant screenshots and sends to a client.

Three things constrain how you render it:

1. **P/A/R applies to EcoVadis only.** MSCI, DJSI and CDP score on entirely different axes. Do not restructure all four schemes around P/A/R.
2. **The Actions gap is an absence, which makes this the same design move as the honesty constraint below.** Render P/A/R as three cells: Policies traces to Section B, Results traces to Section C, Actions is visibly unsourced. The 40% hole is the finding.
3. **Cite the weighting.** Every other number in this product carries a source. Render the 25/40/35 with an attribution line reading: *"Source: EcoVadis Methodology Overview, ratings methodology, weightings vary by theme and sector."* An uncited authoritative-looking number contradicts the brand at the exact moment it is trying to prove it.

The ratings surface maps Section C principles only. Do not fabricate a Section B to Policies row-level mapping; it does not exist in the data. P/A/R is an explanatory structure over the surface, not a per-principle data join.

---

## The non-negotiable constraint: honest absence

Read this twice. It is the brand.

**CDP is an environmental disclosure system.** It genuinely does not cover four of the nine principles: **P3 employee wellbeing, P5 human rights, P8 inclusive growth, P9 consumer responsibility.** Those four cells render:

> Not covered. CDP is an environmental disclosure system only.

**The three blank ESRS rows are blank for a citable reason**, and it is a differentiator, not a hole: they are India-specific disclosures with no European counterpart (the PAT energy-efficiency scheme, statutory CSR spend under Companies Act s.135). Render:

> No ESRS counterpart. This is an India-specific disclosure.

**The 61 uncovered TNFD rows** render:

> Outside TNFD scope. TNFD covers nature-related disclosures only.

Never invent a mapping. Never hide a column. Never collapse an empty row out of view. Never let a blank cell look like a cell that failed to load. Absence, honestly stated, is why the rest of the data is trustworthy: it is the proof, not the edge case. **If your layout only looks good when every cell is full, it is the wrong layout.** Design the blank state first and the full state second.

---

## Design tokens: exact, copied from tailwind.config.ts

Use these. Do not substitute, do not approximate, do not add a hue.

```css
:root {
  /* Surfaces */
  --page:        #FBFCFE;  /* page canvas */
  --surface:     #FFFFFF;  /* cards, panels */
  --band:        #EFF3FA;  /* recessed section band, for separation without a card */
  --tint:        #EAF4FE;  /* whisper-blue fill, subtle emphasis */

  /* Lines. Two of them, and the distinction is load bearing. */
  --line:        #E5E9F0;  /* card edges, table rules, the strongest line */
  --line-soft:   #EEF1F6;  /* dividers INSIDE a card, so the card edge stays strongest */

  /* Dark surfaces. Token is named "forest" for historical reasons. It is navy. */
  --forest:       #0F1E33;
  --forest-light: #1A2B45;
  --ondark:       #DCE6F2;  /* body text on navy */
  --ondark-muted: #AEBED0;
  --ondark-faint: #93A4B8;

  /* Brand blue */
  --brand-100:   #D3E7FD;  /* header fills, table zebra */
  --brand-500:   #1E9DF2;  /* vivid accent */
  --brand-600:   #0B6FD4;  /* primary buttons, links */
  --brand-700:   #0B5FB0;  /* contrast safe blue text on light */

  /* Warm coral */
  --ember:       #F2674A;
  --ember-dark:  #C24428;
  --ember-bg:    #FFF1ED;

  /* Gold */
  --gold:        #C2871B;
  --gold-dark:   #8A6516;
  --gold-bg:     #F6ECD8;

  /* Ink scale. Note: --ink is NOT the same hex as --forest. */
  --ink:         #0F172A;  /* headings */
  --ink-body:    #28303B;  /* body copy */
  --ink-muted:   #5B6573;  /* secondary text, 13px and up */
  --ink-faint:   #616A78;  /* ONLY for 11px uppercase functional labels */
}
```

**Elevation, verbatim. Two-layer, navy tinted:**
```css
--elev-1: 0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05);
--elev-2: 0 2px 4px rgba(15,30,51,0.05), 0 8px 24px rgba(15,30,51,0.07);
```
Prefer a `1px solid var(--line)` over a shadow in almost every case. `--elev-1` for a resting card, `--elev-2` for a popover or sticky header. Nothing else.

**Readability rule, enforced in the codebase:** content, secondary and CTA text is **never below 13px** and **never lighter than `--ink-muted`**. `--ink-faint` is reserved for functional labels at 11px uppercase. This tool is read for hours. Do not build a design that depends on 11px grey body text.

**Radius convention:** `8px` rows, `12px` cards, `16px` bands.
**Type scale in use:** 11 / 12.5 / 13 / 13.5 / 14 / 15px.

**Fonts.** Hanken Grotesk everywhere. A serif, Newsreader, exists for large editorial headings only (`.font-editorial`), and the public page uses it for its H2s; product UI inside the report uses the sans. You cannot fetch fonts, so declare:

```css
font-family: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
/* editorial headings on the public surface only: */
font-family: "Newsreader", Georgia, serif;
```

`font-variant-numeric: tabular-nums` on **count chips and numbers only** (77, 75, 37, 48, 16, 74, 25%, 40%). Not on reference codes: `GRI 305-1` is not a numeric column and tabular-nums does nothing for it. Reference codes get tinted-pill or plain-sans treatment, no letterspacing, **never a mono family**.

### Established badge colours

These are shipped and learned. Real values are Tailwind defaults; here they are explicitly. Each chip is `bg` + `text` + a `1px solid border`.

```
Surface 1, frameworks:
GRI          blue     bg #EFF6FF  text #1D4ED8  border #DBEAFE
TCFD         violet   bg #F5F3FF  text #6D28D9  border #EDE9FE
IFRS S1/S2   emerald  bg #ECFDF5  text #047857  border #D1FAE5
TNFD         teal     bg #F0FDFA  text #0F766E  border #CCFBF1
ESRS (CSRD)  indigo   bg #EEF2FF  text #4338CA  border #E0E7FF

Surface 2, ratings schemes:
MSCI         violet   bg #F5F3FF  text #6D28D9  border #EDE9FE
DJSI / CSA   amber    bg #FFFBEB  text #B45309  border #FEF3C7
CDP          emerald  bg #ECFDF5  text #047857  border #D1FAE5
EcoVadis     rose     bg #FFF1F2  text #BE123C  border #FFE4E6
```

The two sets never appear on the same surface, so the violet and emerald reuse is fine. Low-saturation tinted pills. Not saturated fills, not outline-only.

Product status semantics, if you need a state colour: green ready, amber needs verification, coral (`--ember`) collect fresh, slate not applicable.

---

## Hard bans

These come from the project's design constitution. Violating one means the mockup is thrown out.

- **No monospace font, ever.** Not for ids, not for references, not for numbers. Retired product-wide. Tinted pills and tabular-nums instead.
- **No gradient text. No glassmorphism. No frosted blur.**
- **No side-stripe borders** (a coloured `border-left` as an accent device).
- **No decorative uppercase tracked eyebrow above a section.** Functional column headers and scheme labels are fine and expected; a tiny tracked label whose only job is to announce the next heading is not.
- **No identical card grids repeated endlessly. Nested cards are always wrong.** That is literally the Surface 2 bug. This applies to your own scaffold too: any index or option label is plain rules and headings, never a card wrapping a card.
- **No rationale prose rendered as UI.** Your arguments go in HTML comments or one `<details>` block at the end of the file. A developer imitating exactly will otherwise ship your commentary as product copy.
- **No em dashes in any copy**, including the empty states. Commas, colons, periods.
- **No marketing buzzwords.** No "seamless", "powerful", "unlock", "at a glance", "single source of truth". Write like a regulator's reference document.
- **No emoji.** Icons are inline SVG, single colour, 16px, stroke style.
- **Wide content scrolls inside its own `overflow-x: auto` container.** The page body never scrolls sideways at any width.
- **Must work at 1440 and 390.** At 390, a 5-column matrix is a real design problem. Solve it deliberately (horizontal scroll in-container, stacked per-row view, framework switcher, your call) and state the choice in a comment. Do not let the desktop layout collapse.

---

## References, and the specific lesson from each

You cannot browse, so here is what to take rather than a homework list.

1. **EFRAG's ESRS to ISSB interoperability index.** A regulator published a crosswalk of exactly this artifact, and it is the layout professionals in this field already read cold. Its structure: one row per disclosure, source standard on the left, target paragraph references on the right, grouped by topic, **no colour coding at all**, correspondence strength stated in words. Start from that convention. If you depart from it, have a reason.
2. **Linear.** Calm, dense lists, hairlines instead of cards. Proof that structure does not require colour.
3. **Attio.** Table rows carrying many attributes without noise, and expanding to depth without a modal.
4. **Stripe docs.** The gold standard for "map A to B" side-by-side reference reading. This is why the focused mode already works.
5. **Watershed, Persefoni, Novata, Workiva.** Shipped ESG framework-mapping UIs. Useful for what to avoid: most reach for badge soup or nested cards too. Learn from the failure.

---

## Deliverable

**One self-contained HTML file.** All CSS inline in a single `<style>` block. No external stylesheets, no CDN, no fetched fonts, no image files, no icon libraries, no JS libraries. Inline SVG you write yourself. Vanilla JS only where interaction genuinely needs it (tab switch, row expand, filter chips). Clean, predictable markup: a developer reimplements it exactly.

Contents, in order:

1. **Surface 1, option A.** Full resting state, at scaling density (**minimum 15 rows** spanning at least four different principles), with its scaling device visible, the search and TCFD pillar filter present, the six-chip selector with exact labels and counts, at least three TNFD-blank rows and one ESRS-blank row rendered in their honest states, one row shown expanded with its `notes` prose, and the CSV/Word export buttons placed where your layout says they belong.
2. **Surface 1, option B.** Structurally different IA. Same density and same required states. Not option A with different spacing.
3. **Surface 2.** One redesign, not options. All 9 principles with their real names. All four schemes with the real counts. All four CDP empty states in context. The P/A/R structure load-bearing and cited. Nesting gone. Somewhere for the per-principle `note` prose and the closing methodology disclaimer.
4. **A `<details>` block at the very end**, roughly 200 words, addressed to the developer: which resting state you recommend and why, what each option gives up, how you made absence legible, how you handled 390, and what you deliberately did not do.

Both Surface 1 options must be complete. Do not stub B to polish A.

Show 1440 and 390 deliberately. Remember the content column is ~1120, not 1440.

I have told you the user, the job, the two problems and the constraints. I have not told you the answer, because I do not have it. The tokens and the bans are exact. The structure is yours.