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

## Phased plan (each phase shown before the next)

- [ ] **Phase 1 — Workspace consolidation** (this is the big lever): 3 tabs, merge Frameworks + Ratings into Alignment.
- [ ] **Phase 2 — Expanded row action-first**: tuck reference content; tighten copy.
- [ ] **Phase 3 — Framework grid**: condense the mapping table inside Alignment.
- [ ] **Phase 4 — Depth + hierarchy** (`refactoring-ui`): elevation ramp, stat presence, hierarchy contrast.
- [ ] **Phase 5 — Polish** (`emil-design-eng`) + slop-detector backstop (`impeccable`).

Every change traces to a named principle, so it is defensible, not taste.
