# Redesign brief: two crosswalk surfaces in Saaksh

Both surfaces are **already built and live** at saaksh.co. Real consultants use them. I am not asking for a new feature: I am asking you to fix two diagnosed layout failures in shipped UI. Do not touch the product, navigation or brand. A developer will imitate your mockup line by line into Next.js + Tailwind, so every value you use ships. Precision over flourish.

Screenshots are attached and are the current state. Do not try to visit the site: the ratings surface renders client-side from browser storage and has no reachable URL, and a fetched page returns markup with the styling stripped.

**The test:** a consultant has a client on the phone asking either "we already file BRSR, what's left for CSRD?" or "why is our EcoVadis score worse than our BRSR completeness?". The design answers in seconds or it fails.

**Product:** a compliance tool for independent ESG consultants in India who prepare BRSR reports (India's mandatory sustainability disclosure, set by SEBI). Professionals doing billable work, not browsers. Density, precision, citations are the value. The brand's soul is **defensible, cited data**: nothing invented, absence stated plainly. Tone: calm, editorial, dense but legible. Linear and Attio, not consumer SaaS.

**Shell:** both surfaces are sub-tabs of one "Alignment" tab in the report, sharing a header with "Download CSV" / "Download Word" that retarget to the active sub-tab. Surface 1 also has a public twin at `/tools/brsr-framework-mapping` under a site header and navy hero. **Design the content pane only; the content column is ~1120px, not 1440.** A tab strip to switch between your options is a review convenience: mark it with an HTML comment so the developer doesn't ship it.

---

## SURFACE 1: Framework crosswalk

Maps **77 BRSR disclosures** to five frameworks.

| Framework | Rows covered (of 77) | Fields per mapped row |
|---|---|---|
| GRI | 75 | code + label. Code already contains its own "GRI " prefix (`GRI 2-12`), never prepend another. No detail string. |
| TCFD | 37 | pillar (Governance / Strategy / Risk Management / Metrics and Targets) + detail |
| IFRS S1/S2 | 48 | reference only, no detail. Often multiple, semicolon joined: `IFRS S1 Para 26; IFRS S2 Para 5` |
| TNFD | 16 | pillar + detail |
| ESRS (CSRD) | 74 | standard + detail |

**The detail model is asymmetric:** three of five carry a detail string, two do not. Do not design an expand-row assuming a uniform detail line under every cell.

**Real BRSR id space** (the suffix is a per-principle mnemonic, NOT an indicator type; `P3-E2` and `P1-L1` do not exist):

```
P1-G1…G8 (8) Ethics, Transparency and Accountability
P2-S1…S5 (5) Sustainable and Safe Goods and Services
P3-L1…L14 (14) Employee Wellbeing and Safety
P4-Q1…Q3 (3) Stakeholder Engagement
P5-H1…H5 (5) Human Rights
P6-E1…E27 (27) Environment
P7-R1…R3 (3) Policy Advocacy
P8-I1…I5 (5) Inclusive Growth and Equitable Development
P9-C1…C7 (7) Consumer Responsibility          = 77
```

Invent nothing that looks like a citation. If you need filler rows for density, reuse this id pattern with plausible labels and mark the block with an HTML comment saying the strings are placeholder.

Every row carries a **`notes` field**: a sentence of cross-framework caveat prose. Real example on P1-G1: *"BRSR asks whether the highest authority has responsibility for ESG; TCFD and IFRS S2 narrow the lens to climate; GRI covers all sustainability impacts."* This is the most defensible content on the page. Your design needs somewhere to put it.

**Ships today:** a chip selector "Map BRSR to": `All frameworks` · `GRI 75` · `TCFD 37` · `IFRS S1/S2 48` · `TNFD 16` · `ESRS (CSRD) 74`, plus a **search input** and a **TCFD pillar filter** shown only when TCFD or All is in view. Both must survive; a 77-row reference without search is a regression.

- **All frameworks** (default resting state): BRSR id chip + label + up to five colour-coded badges holding the **reference text**, not the framework name (`GRI 305-1`, `TCFD: Metrics and Targets`). Long, variable width.
- **Single framework**: focused two-column crosswalk, label left, reference right, detail beneath. **This works. Do not break it.**
- Rows expand for full detail.

### Problem 1

Variable-width coloured pills across 77 rows: no column to scan, no anchor, no rhythm. It is the default state, so it is the first thing every user sees, and the weakest thing on the page.

**Sparsity is the real constraint.** Three of five columns are substantially blank (TNFD 79% empty, TCFD 52%, IFRS 38%). Rows by how many frameworks they map to: **1 framework: 1 row · 2: 27 · 3: 14 · 4: 22 · 5: 13.** The common row is a **2**, only 13 are full. Design against that distribution, not a full grid with a few gaps. Every row has at least one counterpart, so nothing renders entirely empty.

### Give me two options

**Two structurally distinct resting states**, not one polished answer and not the same layout twice with different padding. Different means different information architecture. Candidates, argue for whichever you take:

- A genuine **table**: 77 rows down, 5 framework columns across, cell holds the reference text not a pill. The eye scans a column, gaps read as gaps.
- A **coverage overview** navigating into detail: sparse frameworks legible as sparse, click through to the focused view.
- **Focused mode as default**: "All" becomes a coverage summary rather than a row dump. SEO tension: the public page ranks on "does BRSR map to GRI", so **all 77 rows must stay in the initial markup** even if one framework is foregrounded. Do not gate content behind a click at the DOM level.

**Colour rule, this is the fix not a suggestion:** in the resting state, framework identity colour appears **at most once per column, in the header. Never once per row.** Five coloured dots per row is the same bug in a different shape. Keep the hues (they are learned), move where they land.

**Show the scaling device**, do not just show 15 rows. Sticky header, grouping, search, pagination: whatever makes 77 survivable must be visible.

---

## SURFACE 2: ESG ratings crosswalk

Report only, so it can be denser and more expert. Maps the **9 BRSR principles** to four **scored** assessment schemes (ratings, not disclosure frameworks: the client gets a grade).

| Scheme | Distinct entries | Covers |
|---|---|---|
| MSCI | 24 key issues (from a 35-issue universe; 7-15 scored per sub-industry) | all 9 |
| DJSI / S&P CSA | 23 criteria | all 9 |
| CDP | 9 disclosure areas | **5 of 9** |
| EcoVadis | 21 criteria | all 9 |

Per principle the data also carries an `msci_pillar`, a `djsi_dimension`, an `ecovadis_theme`, and a **full-sentence `note`**, plus a long closing methodology disclaimer. Design for prose, not just chips.

**EcoVadis themes are compound and break the obvious grouping:** real values include `Environment / Sustainable Procurement`, `Labour and Human Rights / Sustainable Procurement`, `Environment / Ethics`. A principle can straddle two themes, so any layout filing 9 principles under 4 theme headers dies on those rows.

**Ships today:** four definition cards in a 2x2 grid, a Policies/Actions/Results band, count chips, then **one card per principle with another 2x2 grid of four scheme blocks inside each**.

### Problem 2

Nine cards containing four boxes each is thirty-six boxes. A card inside a card is always wrong. The structure does no work; it is a container tax. The eye stops reading by P3 and nothing signals which principle matters. Decide explicitly what happens to the four definition cards: they are the textbook identical card grid. Dissolve, move, or defend them, but do not silently re-render them.

### The differentiator to feature

Most valuable idea on the page, currently a thin band nobody reads:

> **EcoVadis scores every theme on three weighted axes: Policies 25%, Actions 40%, Results 35%. BRSR Section B is policies. BRSR Section C is results. Actions carries the heaviest weight and BRSR gives you no source for it.** That is the systematic score gap: most Indian filers have the policy and the number but never document what they did in between.

Three constraints on how you render it:

1. **P/A/R applies to EcoVadis only.** MSCI, DJSI and CDP score on different axes. Do not restructure all four schemes around it.
2. **The Actions gap is an absence**, which makes this the same design move as the honesty constraint below. Render P/A/R as three cells: Policies traces to Section B, Results traces to Section C, **Actions is visibly unsourced**. The 40% hole is the finding.
3. **Cite the weighting.** Every other number here carries a source. Add: *"Source: EcoVadis Methodology Overview, ratings methodology, weightings vary by theme and sector."* An uncited authoritative-looking number contradicts the brand exactly when it is trying to prove itself.

This surface maps Section C principles only. Do not fabricate a Section-B-to-Policies row-level mapping; it does not exist in the data. P/A/R is an explanatory structure over the surface, not a per-principle data join.

---

## Non-negotiable: honest absence

Read twice. This is the brand.

**CDP is an environmental disclosure system.** It genuinely does not cover four of the nine principles (P3 employee wellbeing, P5 human rights, P8 inclusive growth, P9 consumer responsibility). Those cells render:
> Not covered. CDP is an environmental disclosure system only.

**Three ESRS rows are blank for a citable reason, and it is a differentiator not a hole:** India-specific disclosures with no European counterpart (the PAT energy-efficiency scheme, statutory CSR spend under Companies Act s.135). Render:
> No ESRS counterpart. This is an India-specific disclosure.

**The 61 uncovered TNFD rows:**
> Outside TNFD scope. TNFD covers nature-related disclosures only.

Never invent a mapping. Never hide a column. Never collapse an empty row out of view. Never let a blank cell look like a cell that failed to load. Absence, honestly stated, is why the rest of the data is trustworthy: it is the proof, not the edge case. **If your layout only looks good when every cell is full, it is the wrong layout. Design the blank state first and the full state second.**

---

## Design tokens: exact, from tailwind.config.ts. Do not substitute, approximate, or add a hue.

```css
:root {
  --page: #FBFCFE;  --surface: #FFFFFF;  --band: #EFF3FA;  --tint: #EAF4FE;
  --line: #E5E9F0;       /* card edges, table rules, strongest line */
  --line-soft: #EEF1F6;  /* dividers INSIDE a card, so the card edge stays strongest */
  --forest: #0F1E33;  --forest-light: #1A2B45;   /* token named "forest" for history; it is navy */
  --ondark: #DCE6F2;  --ondark-muted: #AEBED0;  --ondark-faint: #93A4B8;
  --brand-100: #D3E7FD;  --brand-500: #1E9DF2;  --brand-600: #0B6FD4;  --brand-700: #0B5FB0;
  --ember: #F2674A;  --ember-dark: #C24428;  --ember-bg: #FFF1ED;
  --gold: #C2871B;   --gold-dark: #8A6516;   --gold-bg: #F6ECD8;
  --ink: #0F172A;        /* headings. NOT the same hex as --forest */
  --ink-body: #28303B;   --ink-muted: #5B6573;
  --ink-faint: #616A78;  /* ONLY 11px uppercase functional labels */
}
--elev-1: 0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05);
--elev-2: 0 2px 4px rgba(15,30,51,0.05), 0 8px 24px rgba(15,30,51,0.07);
```

Prefer `1px solid var(--line)` over a shadow almost always. `--elev-1` resting card, `--elev-2` popover/sticky header, nothing else.

**Readability rule, enforced in the codebase:** content, secondary and CTA text is **never below 13px** and **never lighter than `--ink-muted`**. `--ink-faint` is reserved for 11px uppercase functional labels. This tool is read for hours.

**Radius:** 8px rows, 12px cards, 16px bands. **Type scale in use:** 11 / 12.5 / 13 / 13.5 / 14 / 15px.

**Fonts.** You cannot fetch fonts, so declare:
```css
font-family: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
/* editorial headings, public surface only: */ font-family: "Newsreader", Georgia, serif;
```
`tabular-nums` on **count chips and numbers only** (77, 75, 37, 48, 16, 74, 25%, 40%). Not on reference codes: `GRI 305-1` is not a numeric column. Reference codes get tinted-pill or plain-sans, no letterspacing, **never a mono family**.

**Established badge colours** (shipped and learned; each chip is bg + text + 1px border):
```
Surface 1:  GRI blue #EFF6FF/#1D4ED8/#DBEAFE   TCFD violet #F5F3FF/#6D28D9/#EDE9FE
            IFRS emerald #ECFDF5/#047857/#D1FAE5   TNFD teal #F0FDFA/#0F766E/#CCFBF1
            ESRS indigo #EEF2FF/#4338CA/#E0E7FF
Surface 2:  MSCI violet (as above)   DJSI amber #FFFBEB/#B45309/#FEF3C7
            CDP emerald (as above)   EcoVadis rose #FFF1F2/#BE123C/#FFE4E6
```
The two sets never share a surface, so the violet/emerald reuse is fine. Low-saturation tinted pills, not saturated fills, not outline-only.

---

## Hard bans. Violating one means the mockup is thrown out.

- **No monospace font, ever.** Not for ids, references, or numbers. Retired product-wide. Tinted pills + tabular-nums instead.
- **No gradient text. No glassmorphism. No frosted blur.**
- **No side-stripe borders** (coloured `border-left` as an accent).
- **No decorative uppercase tracked eyebrow above a section.** Functional column headers and scheme labels are fine and expected.
- **No identical card grids repeated endlessly. Nested cards are always wrong** (that is literally Problem 2). Applies to your own scaffold too.
- **No rationale prose rendered as UI.** Arguments go in HTML comments or the one `<details>` block. A developer imitating exactly will otherwise ship your commentary as product copy.
- **No em dashes in any copy**, including empty states. Commas, colons, periods.
- **No marketing buzzwords.** No "seamless", "powerful", "unlock", "at a glance", "single source of truth". Write like a regulator's reference document.
- **No emoji.** Icons are inline SVG, single colour, 16px, stroke style.
- **Wide content scrolls inside its own `overflow-x: auto` container.** The page body never scrolls sideways at any width.
- **Must work at 1440 and 390.** At 390 a 5-column matrix is a real problem: solve it deliberately (in-container horizontal scroll, stacked per-row view, framework switcher, your call) and state the choice in a comment.

## References, and the lesson from each

1. **EFRAG's ESRS-to-ISSB interoperability index.** A regulator published a crosswalk of exactly this artifact and it is what professionals here already read cold: one row per disclosure, source standard left, target paragraph references right, grouped by topic, **no colour coding at all**, correspondence strength stated in words. Start from that convention; if you depart, have a reason.
2. **Linear.** Calm dense lists, hairlines instead of cards. Structure without colour.
3. **Attio.** Table rows carrying many attributes without noise, expanding to depth without a modal.
4. **Stripe docs.** The gold standard for "map A to B" side-by-side reading. This is why the focused mode already works.
5. **Watershed, Persefoni, Novata, Workiva.** Shipped ESG mapping UIs. Most reach for badge soup or nested cards too: learn from the failure.

---

## Deliverable

**One self-contained HTML file.** All CSS inline in one `<style>` block. No external stylesheets, CDN, fetched fonts, image files, icon libraries or JS libraries. Inline SVG you write yourself. Vanilla JS only where interaction needs it. Clean predictable markup: a developer reimplements it exactly.

1. **Surface 1, option A.** Full resting state at density (**minimum 15 rows** across at least four principles), scaling device visible, search + TCFD pillar filter present, the six-chip selector with exact labels and counts, at least three TNFD-blank rows and one ESRS-blank row in their honest states, one row expanded with its `notes` prose, and the CSV/Word buttons where your layout says they belong.
2. **Surface 1, option B.** Structurally different IA, same density and required states. Not option A with different spacing.
3. **Surface 2.** One redesign. All 9 principles with real names, four schemes with real counts, all four CDP empty states in context, P/A/R load-bearing and cited, nesting gone, somewhere for the per-principle `note` and the closing disclaimer.
4. **A `<details>` block at the very end**, ~200 words to the developer: which resting state you recommend and why, what each option gives up, how you made absence legible, how you handled 390, what you deliberately did not do.

Both Surface 1 options must be complete. Do not stub B to polish A. Show 1440 and 390 deliberately; the content column is ~1120.

I have told you the user, the job, the two problems and the constraints. I have not told you the answer, because I do not have it. The tokens and the bans are exact. The structure is yours.
