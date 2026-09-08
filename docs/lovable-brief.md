# Lovable design brief

Prompts for generating UI/UX directions in Lovable. Written 2026-09-08.

**How this is used:** feed Lovable a prompt below plus screenshots from `docs/screenshots/`
(regenerate with `node scripts/shoot-product.mjs`), then bring the output back to Claude Code to
reimplement. **Lovable returns React + Tailwind + shadcn; Saaksh is inline styles + CSS custom
properties, so its output is direction — layout, hierarchy, how it treats citations — never code
to port.**

---

## 1. The context primer

Lead with this. It is what makes the difference between a generic dashboard and something built
for the actual user.

> **What Saaksh is**
>
> A free, browser-based tool for independent ESG consultants in India. It helps them produce BRSR
> reports — India's mandatory sustainability disclosure, which SEBI requires from the top 1,000
> listed companies every year. A BRSR has 108 separate data points covering emissions, energy,
> water, workforce, human rights and governance.
>
> **Who uses it**
>
> Not the listed company. The *consultant* the company hires — usually a one-person practice or a
> small firm, juggling three to six clients through the same filing season. They are the customer.
>
> Their hardest problem isn't writing the report. It's the six to twelve weeks of extracting
> numbers from people who don't work for them: meter readings from the plant manager, headcount
> from HR, board minutes from the company secretary, CSR spend from a team that has never heard of
> BRSR. The tool exists to compress that.
>
> **The state of mind to design for**
>
> This is billable professional work, not browsing. Someone is at a desk with a client's utility
> bills open in another window, working against a filing deadline. They come to get a specific
> number and leave. Sessions average six and a half minutes of genuine use.
>
> The output matters more than the experience: whatever figure they take from this goes into a
> regulatory filing that an independent auditor will inspect line by line, and they may have to
> defend where it came from.
>
> **The brand promise**
>
> Saaksh is Sanskrit for *evidence* — a witness. Every emission factor is cited to its published
> source and version. Nothing is estimated, modelled or invented. Everything runs in the browser:
> no account, no upload, client data never leaves the device.
>
> So the register is a precise professional instrument, not a consumer app. Calm, dense where
> density earns its place, and confident about its numbers. Closer to Stripe's documentation or
> Linear than to a wellness app or a fintech dashboard.

**Four-sentence version**, if space is tight:

> Saaksh is a free browser tool for independent ESG consultants in India who prepare BRSR reports —
> India's mandatory 108-field sustainability disclosure for the top 1,000 listed companies. The
> user is a solo consultant doing billable work against a filing deadline, with a client's utility
> bills open in another window; they come for a specific number and leave. Every figure the tool
> produces goes into a regulatory filing an auditor will inspect, so every emission factor is cited
> to its published source and version, and nothing is estimated or invented. Design it as a precise
> professional instrument — calm and confident about its numbers — not a consumer app.

---

## 2. The calculator redesign brief

Attach, in this order:

```
docs/screenshots/12-calc-ghg-scope-1-2.png         ← the anchor
docs/screenshots/13-calc-scope-3.png
docs/screenshots/14-calc-ppp-intensity.png
docs/screenshots/31-calc-embedded-p6-e1-energy.png ← same calculator, embedded in the report
docs/screenshots/23-report-overview.png            ← surrounding product
docs/screenshots/01-home.png                       ← brand reference
```

> **What to redesign**
>
> The Scope 1 & 2 GHG calculator (screenshot 1) is the primary subject. Screenshots 2 and 3 are
> sibling calculators that should end up feeling like the same family. Screenshot 4 is the same
> calculator embedded inside a larger report workspace — whatever you design has to survive in both
> a full-page and an embedded context.
>
> **Specific problems I want solved**
>
> - The calculator occupies a narrow left column while the page is wide, so 14 input fields are
>   cramped into a small box. The right rail is mostly static explainer text. The proportions are
>   inverted — the tool is why people came.
> - Every input is pre-filled with `0`, so you cannot tell what has been entered from what is
>   untouched.
> - The results panel is a large empty box reading "Your BRSR figure will appear here." The single
>   most important output on the page is currently its least prominent element.
> - All 14 fields sit at equal visual weight. Grid electricity is needed by nearly every company;
>   fugitive refrigerant emissions are an edge case. The layout doesn't reflect that.
> - Unit labels (kWh, litres, kg) sit in separate boxes beside each input, visually detached and
>   wasting horizontal space.
> - The methodology and citations — the core brand promise — are rendered as four lines of tiny
>   grey footnote text. This is the most under-designed element relative to its strategic
>   importance. I want citation and provenance treated as a *feature*, not a disclaimer.
> - There is no sense of progress, or of what to fill in first.
>
> **What to preserve**
>
> - The three tabs (Scope 1&2 / Energy / Water) that share the same underlying inputs.
> - The "Factors in play" panel showing live factor values.
> - The deep editorial content below the tool (how each factor is derived, common mistakes, where
>   the numbers go in BRSR). This is a real differentiator; don't strip it.
> - Everything runs client-side. No accounts, no server. Don't design anything requiring login or
>   saved state.
>
> **Design language**
>
> Current tokens: deep navy `#0F1E33`, primary blue `#0B6FD4`, accent blue `#1E9DF2`, coral
> `#F2674A` for status, near-white canvas `#FBFCFE`, pale blue tint `#EAF4FE`. Type is Hanken
> Grotesk with Newsreader for editorial headings. **No monospace anywhere** — use tabular numerals
> for figures instead.
>
> **Do not**
>
> - Use purple-to-blue gradient heroes, glassmorphism, or heavy drop shadows.
> - Use emoji as section markers or icons.
> - Center everything.
> - Reach for default shadcn card-with-rounded-corners on every block — vary the treatment by role.
> - Add decorative stock illustration. Diagrams that explain the calculation are welcome; metaphor
>   art is not.
> - Invent numbers. If you need example values, use realistic Indian manufacturing figures and
>   label them clearly as examples.
>
> **Deliverable**
>
> Build the redesigned Scope 1 & 2 calculator as a working page, with realistic example values
> filled in so I can see it in a real working state rather than empty.
>
> Then tell me, in writing:
> 1. The layout decision you made and why.
> 2. How you handled the results — what makes the output figure feel authoritative.
> 3. How you surfaced citations and factor provenance.
> 4. How the input grid handles the common-case vs edge-case fields.
> 5. What you'd change about the embedded-in-report version (screenshot 4).
>
> I care more about the reasoning than the code, because I'll be reimplementing this in a different
> architecture.

**Follow-up, to get a second option worth comparing:**

> Now show me a second version that ignores the existing design language entirely. Same content,
> same user, same constraints about citation and client-side operation — but assume I'll rebuild
> the visual identity from scratch. Take a real position. Then tell me what the second version does
> better than the first, and what it gives up.

---

## 3. Whole-site audit, in two messages

Lovable will not volunteer that it cannot browse. It will produce a confident, invented audit
instead, which is worse than none. Message 1 exists to catch that.

### Message 1 — verify, then observe

> Go to https://saaksh.co and look at it properly, including these pages: `/`, `/pricing`,
> `/tools/ghg-calculator`, `/tools/scope3-calculator`, `/jobs`, `/blog`, and the flow from `/start`
> through to the report.
>
> **Before any advice, confirm you can actually see the site by answering these five questions. If
> you cannot load it, say so plainly rather than guessing — an invented audit is worse than none.**
>
> 1. What are the top-level navigation items, in order?
> 2. What are the three tabs on the GHG calculator at `/tools/ghg-calculator`?
> 3. What grid emission factor value is shown on that page, and which source is it attributed to?
> 4. What does the footer say about where client data goes?
> 5. What happens after you submit the form at `/start` — what does the resulting screen show?
>
> Once you've answered those, describe what you observe about the site's design as it is today: the
> layout patterns it reuses, the type and colour system, how dense or sparse it feels, and where the
> visual language is inconsistent between sections. Describe, don't prescribe. No recommendations
> yet.

**Correct answers** — if it gets 3+ wrong, it isn't seeing the site; fall back to screenshots only.

| # | Answer |
|---|---|
| 1 | Tools ▾ · Pro ▾ · Pricing · Community · Jobs · Resources ▾, then a "Start free" button |
| 2 | Scope 1 & 2 GHG · Energy · Water |
| 3 | 0.710 kgCO₂e/kWh, CEA CO₂ Baseline Database Version 21.0 |
| 4 | "Client data never leaves your browser · Cited to SEBI & ICAI" |
| 5 | A workspace with a left sidebar and tabs — Overview, Action Plan, Materiality, Alignment, Beyond BRSR |

### Message 2 — after it passes

> Now rank the site's screens by how much a redesign would improve the experience for the actual
> user: an independent ESG consultant in India doing billable client work, usually with a client's
> utility bills or last year's filing open beside them.
>
> Give me a ranked list of at most six screens. For each: what specifically is wrong, what the user
> is trying to do there, and what you'd change. Be concrete — "the results panel is the least
> prominent element on a page whose entire purpose is producing that number" is useful; "improve
> visual hierarchy" is not.
>
> Rank by user impact, not by how fun it is to redesign. Tell me explicitly which screens you'd
> leave alone, and why.
>
> Then build only your number one.

---

## Best 10 screenshots, if capped

Covers every distinct layout archetype in the product.

| # | File | Archetype |
|---|---|---|
| 1 | `01-home.png` | Marketing long-scroll |
| 2 | `12-calc-ghg-scope-1-2.png` | Calculator, full page |
| 3 | `31-calc-embedded-p6-e1-energy.png` | Calculator embedded — the hard case |
| 4 | `23-report-overview.png` | App workspace with sidebar |
| 5 | `24-report-action-plan.png` | Dense filterable list, 108 rows |
| 6 | `21-intake-form-empty.png` | Form-first screen |
| 7 | `20-tool-framework-mapping.png` | Data table |
| 8 | `04-blog-post.png` | Long-form editorial |
| 9 | `02-pricing.png` | Conversion page |
| 10 | `01-home-mobile.png` | Mobile |

Swap 9 and 10 for `09-jobs-board.png` and `05-brsr-hub-108-disclosures.png` if you'd rather cover
those.

---

## Caveat that expires once the site is deployed

As of 2026-09-08, `saaksh.co` is **6 commits behind local**. Browsing it will not show `/brsr`,
the 108 disclosure pages, `/glossary`, `/brsr/statistics`, or the 5 newest blog posts. Every
calculator, tool, and the whole report flow are accurate. Delete this section once the deploy has
gone out.
