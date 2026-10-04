# Claim audit — every factual statement in the SAGE emails, checked against the repo

Run 2026-10-04, the night before the call, because the emails were sent by an agent and the
claims in them had never been verified against the build. **Every line below was checked by
reading the code or the data, not from memory.**

**Verdict: of thirteen checkable claims, twelve are true. One is false: GRESB.**

---

## The audit

| # | Claim, as sent | Verified against | Verdict |
|---|---|---|---|
| 1 | "I'm building Saaksh (https://saaksh.co)" | — | **TRUE** |
| 2 | "with a practising ESG consultant" | Priya Ranjan, named in `CLAUDE.md` and `docs/DECISIONS.md` | **TRUE** — and it is the phrasing she has already seen. Keep it. |
| 3 | "free, no-login first check" | `src/middleware.ts` matcher is `["/requests", "/requests/:path*"]` only — `/`, `/start` and `/report` are ungated | **TRUE** |
| 4 | "sorts **108** BRSR Section C disclosures" | `brsr_data_points.json`: 68 essential + 40 leadership = **108** | **TRUE, exactly** |
| 5 | "into ready, verify and collect" | `checklist/constants.ts`: `"Ready to pull"` / `"Needs verification"` / `"Collect fresh"` | **TRUE** — on screen the labels are longer; point at them using the screen's words |
| 6 | "with source citations" | `SEBI_BRSR_FORMAT_URL` + per-field ICAI `page`, rendered in every expanded row | **TRUE** |
| 7 | "a cited first gap view across the 108 … what is ready, what needs verifying and what is missing" | Same as 4–6 | **TRUE** |
| 8 | "**Next I am building** a shared workspace where a client collects each number once (energy, water, people)" | `REQUEST_FIELDS` = **138** requestable fields (Section A + B + C). Labels mentioning energy 1, electricity 1, diesel 1, water 4, employee 18, wages 4 | **TRUE** — and correctly hedged as *next I am building*. Energy, water and people are all genuinely requestable. |
| 9 | "instead of being chased separately for every framework" | Aspiration consistent with 8 | **TRUE as stated** |
| 10 | "maps across BRSR, CDP, EcoVadis **and GRESB**" | `cdp_ecovadis_mappings.json` = 26 rows, **Principle 6 only**, field level. Other principles are principle-level via `esg_ratings_mapping.json`. **GRESB: zero occurrences anywhere in `src/`** | ❌ **THE ONE FALSE CLAIM.** CDP and EcoVadis are real but P6-only at field level. **GRESB is not built at any level.** |
| 11 | "For a practice like SAGE … that is where **I hope** it saves real hours" | Hedged | **TRUE as stated** |
| 12 | "voluntary disclosure works because it is led by ambition, not compliance" | Her own line, quoted accurately | **TRUE** — ⚠️ already used; do not quote it a second time on the call |
| 13 | "**these disclosure guides** could work as learning material" | `/brsr/[code]` = 108 reference pages; `/academy` = an eight-module teaching pack, both live | **TRUE** — the guides exist and are substantial |

### One correction to our own notes

`CLAUDE.md` says GRESB "appears nowhere but blog and glossary copy." **That is wrong, in the
harmless direction:** a case-insensitive search across every `.ts`, `.tsx`, `.json` and `.md`
under `src/` returns **nothing**. GRESB appears only in `CLAUDE.md` and the SAGE planning docs.
So there is no stray public copy to worry about, and nothing to take down.

---

## Why we are NOT building GRESB tonight

The instinct — *I promised it, so build it* — is the wrong call here, and not because of time.

1. **It would break the product's single most important rule.** Every crosswalk in Saaksh
   "invents no vocabulary" — CDP and EcoVadis terms are drawn verbatim from sourced sets, and
   `cdp-ecovadis-mappings.test.ts` asserts it. A GRESB file written tonight would be **invented
   vocabulary**, because we do not have the GRESB Standards in the repo and this container cannot
   fetch them (egress is blocked for most domains).
2. **She is a GRESB practitioner.** If she opens an invented mapping and the aspect names are
   wrong, that is catastrophic and unrecoverable. *"I named it too early"* is merely honest.
   **The fake costs more than the gap.**
3. **It is not even the valuable gap.** GRESB is a real-estate and infrastructure benchmark.
   Most BRSR filers — and most of SAGE's BRSR work — are not in its scope.
4. **The risk profile is the worst available.** Shipping an unverifiable file to production the
   night before, when no session can load `saaksh.co` to check it rendered, is how you turn one
   honest sentence into a live defect she finds on screen.

**The fix is fifteen seconds of ownership, not a night of building.** It is already written into
Beat 1 of `docs/sage-call-run-sheet-2026-10-05.md`: *"GRESB I named too early."*

---

## What this actually means for the call

**You are in far better shape than the panic suggests.** The email made one overclaim inside a
four-item list, and hedged every forward-looking statement correctly (*"Next I am building"*,
*"I hope"*). There is no second landmine — this audit looked for one and did not find it.

**And the one overclaim converts into the strongest moment of the call** if you raise it first,
unprompted, in the first thirty seconds. In front of someone certified in GRI, SBTi, CDP and
Integrated Reporting, a founder who audits his own claim before being asked is more persuasive
than any demo. Her finding it in minute twenty is the only version that hurts.

**Nothing else in the thread needs defending.** If she asks about any claim other than GRESB,
the honest answer and the flattering answer are the same answer.

---

## The process fix, for after the call

The real exposure was never GRESB. It was that **product claims went out in your name without a
build-state check.** That will recur, because the agent will keep drafting.

One rule closes it: **before any outbound email containing a product claim, run this audit** —
every factual sentence, checked against the code, in a table like the one above. It took about
twenty minutes here. It is the cheapest insurance in the business, and it is the same discipline
the product itself sells: a claim is only worth what its citation is worth.
