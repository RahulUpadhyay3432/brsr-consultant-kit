# Target Experience Blueprint — BRSR Consultant Kit

> The agreed plan for the UX/structure overhaul, so we build once instead of patching repeatedly.
> Driven by **real consultant feedback** (the report feels flat, the expanded row overwhelms, the
> framework mapping is a long scroll, the ESG ratings are buried) and evaluated with the
> `ux-heuristics` skill (Krug + Nielsen) against the JTBD in [PRODUCT.md](PRODUCT.md).

## Which skills, and why (decided 2026-06-10)

We analysed all 21 skills in `.agents/skills/`. Decision:

- **`ux-heuristics`** — drives the *structure/usability* blueprint (this doc). Krug's laws + Nielsen + IA + severity ratings.
- **`refactoring-ui`** — drives *execution* of visual depth/hierarchy (grayscale-first, size/weight/color hierarchy, constrained scales, elevation). The cure for "flat / monotonous."
- **`emil-design-eng`** — final interaction polish ("invisible details").
- **`impeccable`** — demoted to a slop-detector backstop only.
- **Rejected** (wrong register for a restrained compliance tool a consultant shows a client): `high-end-visual-design`, `gpt-taste`, `frontend-design`, `industrial-brutalist-ui`, `design-taste-frontend` (its own scope excludes data tables/product UI). More skills ≠ better; several would actively violate PRODUCT.md's "credibility through restraint."

**True independence** comes from real consultants + the cold-outsider stance, not from any skill (all skills run on the same model). This blueprint goes in front of consultants before we commit.

## Current usability: ~6/10

Strong foundations (plain language, gap stats, smart defaults), dragged down by three Major structural issues.

## Issues (ux-heuristics severity scale 0–4)

- **[3 Major] Two navigation models on one screen.** Report root = 2 tabs (Action Plan, Materiality) **+** 2 stacked accordions (Frameworks, Ratings). Violates Consistency (Nielsen #4) and PRODUCT.md §4 ("never add a 5th stacked accordion, consolidate").
- **[3 Major] ESG Ratings is buried** below a long framework table. Fails the Trunk Test / "you are here." (The author of the feature said they'd have missed it.)
- **[3 Major] Expanded row = wall of text.** Opening a row stacks 8–10 blocks. Krug law 3 ("get rid of half the words") + the named "wall of text" mistake.
- **[2 Minor] Framework Mapping is a long scroll** on the main report; should be condensed.

## Target IA — 4 stacked sections → 3 consistent workspace tabs

```
BEFORE                              AFTER
─ Header (stats)                    ─ Header (stats)
─ Tab: Action Plan                  ─ Tabs: [ Action Plan ] [ Materiality ] [ Alignment ]
─ Tab: Materiality                       ├ Action Plan = the 108-field checklist
─ Accordion: Frameworks  (long)          ├ Materiality = suggested topics
─ Accordion: ESG Ratings (buried)        └ Alignment   = Frameworks + Ratings, together
```

One nav model. Ratings becomes a peer, not a basement. The long framework content only loads when Alignment is chosen, so the main report stays calm. This single move fixes three of the four issues.

**Inside Alignment:** two clear sub-sections — "Reporting frameworks" (GRI/TCFD/IFRS) and "ESG ratings alignment" (MSCI/DJSI), each with its count chips, scannable, no nested accordion.

## The expanded row → action-first

Lead with only what the consultant *does*: the gap, "How to collect," and (for P6) the calculator + "mark collected." Everything reference-y — best practices, verbatim SEBI language, source, unit — tucks behind one "Reference" reveal. The open row leads with the next action, not a regulatory essay.

## The depth pass (after structure is right)

`refactoring-ui`: grayscale-first hierarchy so the eye lands on the action; an elevation ramp so surfaces aren't all on one flat plane; the gap-analysis stats get real presence. `emil-design-eng`: interaction polish. Restraint intact — no glass, no gradients, no flashy SaaS.

## Phased plan

Consultant feedback (2026-06-10) raised the bar from "consolidate" to **point-of-parity with the
professional software they already use** (Vanta, Drata, Thoropass, Watershed, Ramp, Linear). The
common pattern across all of them — a **left-nav app shell + an Overview dashboard** — became the spine.

- [x] **Workspace consolidation** → evolved into a **left-nav app shell** (client context + workspace
  rail + content), replacing stacked tabs/accordions. Frameworks + Ratings merged into one Alignment view.
- [x] **Overview dashboard** (maps to our data, no dummy data): stat cards (Ready / Verify / Collect /
  Total) + a status bar over the 108 + where-to-start. Adapted from Thoropass's "Program Overview."
- [x] **Status pills** on every row; **per-principle status mini-bars** in group headers.
- [x] **Trim verbose cards**; gap-analysis hero; bigger titles.
- [x] **Removed** the redundant 9-principle readiness grid (duplicated the sidebar + mini-bars).
- [ ] **Expanded-row depth**: card-in-card layering (raised action zone, recessed reference).
- [ ] **Densify** the Alignment framework table; broader polish (`refactoring-ui` / `emil-design-eng`).
- [ ] **Consultant retest** once the shell + depth land.

Reference grammar we copy freely (per consultant direction — "copying is fine if it serves the user"):
left-nav shell, stat-card overview, segmented status bars, status pills, dense clean tables, card layering.
We do **not** copy their brand colors or fake charts over data we don't have. Every change maps to a named
pattern or principle.
