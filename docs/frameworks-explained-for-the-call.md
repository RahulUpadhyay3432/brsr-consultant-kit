# The four frameworks, what we actually built, and where the line is

Written 2026-10-04 for the SAGE call. **Read this before the run sheet.** Everything here is
plain-language on purpose: no file names, no code.

---

## Part 1 — The four frameworks, in the only terms that matter

Forget the acronyms for a second. The question any of these answers is: **"somebody with power
over this company wants proof about its environmental and social performance — in what format?"**

Four different somebodies, four different formats.

| | **BRSR** | **CDP** | **EcoVadis** | **GRESB** |
|---|---|---|---|---|
| **Who demands it** | **SEBI**, the Indian regulator | **Investors**, and large customers | **Buyers / procurement** — a big customer tells its suppliers to get rated | **Investors in property and infrastructure funds** |
| **Is it optional?** | **No.** Mandatory, top 1,000 listed companies | Voluntary — but refusing an investor's request is a decision | Voluntary — but you can lose the contract | Voluntary — but the fund's investors expect it |
| **What you file** | A section of your annual report, lodged with the stock exchange | An annual online questionnaire | You upload evidence documents | Asset-by-asset data submission |
| **What you get back** | Nothing. Compliance. | **A score, A to D−** | **A score 0–100 and a medal** — Bronze, Silver, Gold, Platinum | **A score out of 100 and a rank** against peers |
| **Who it applies to** | Indian listed companies | Any company, globally | Any supplier, globally | **Real estate and infrastructure only** |
| **The shape of it** | 9 Principles · Sections A, B, C · 108 Section C disclosures | Governance, risk, targets, Scope 1/2/3 emissions, water | **4 themes** (Environment; Labour & Human Rights; Ethics; Sustainable Procurement) across **21 criteria** | **Components** (Management, Performance, Development) made of **Aspects** |

### In one sentence each

- **BRSR** is a **compliance filing**. The regulator says file it; you file it. Nobody scores you.
- **CDP** is an **investor scorecard**, mostly about climate. It asks how you govern climate risk,
  what targets you've set, and what your emissions are.
- **EcoVadis** is a **supplier scorecard**. A European buyer says "all suppliers above €X must
  hold an EcoVadis rating." ⚠️ **Its biggest difference: it rates your management systems, not
  just your numbers** — do you have the policy, did you take actions, can you show results. You
  can have good numbers and a poor EcoVadis score if you can't evidence the system behind them.
- **GRESB** is a **property and infrastructure benchmark**. Irrelevant to a textile mill;
  central to a real-estate fund.

Also mentioned in our crosswalk, so know the names: **GRI** is the oldest and most widely used
voluntary sustainability reporting standard — what most documents titled "Sustainability Report"
follow. **TCFD** and **IFRS S1/S2** are climate and sustainability *financial* disclosure
standards aimed at investors. **ESRS** is the EU's mandatory set under CSRD. **TNFD** is the
nature-and-biodiversity equivalent of TCFD.

---

## Part 2 — The insight the whole product rests on

Here is the thing to understand, because every sentence you say tomorrow depends on it.

**Those four questionnaires ask for the same underlying facts in four different languages.**

Take one number: **the electricity your client bought last year, in kWh.**

- **BRSR** wants it under Principle 6, as part of total energy consumption in joules, plus an
  intensity per rupee of turnover.
- **CDP** wants it as the activity data behind your **Scope 2** emissions figure.
- **EcoVadis** wants it as a **Results** metric under the *Energy consumption & GHGs* criterion —
  and separately wants the policy and the actions around it.
- **GRESB** wants it **per asset**, normalised by floor area or output, under the **Energy**
  aspect.

**One meter reading. Four questionnaires. Four vocabularies. Four deadlines. Four teams asking
the client's facilities manager the same question.**

That is the pain. A consultant like SAGE, running BRSR *alongside* CDP, EcoVadis, GRESB and GRI
for 65+ clients, is doing that translation **by hand, repeatedly, for every client, every year.**

**That is the "real hours" your email promised to save.** You were right about the problem. The
only question tomorrow is how much of the solution exists.

---

## Part 3 — What we have actually built, in plain language

Three things. Say them in this order; it is the order of how finished they are.

### 1. The free readiness check — finished, live, no login

A consultant answers seven questions about a client (industry, size, listed or not, what filings
they already make). The tool then goes through **all 108 BRSR Section C disclosures** and sorts
each one into:

- **Ready to pull** — the client already produces this for some other filing
- **Needs verification** — partly there, one piece missing
- **Collect fresh** — nothing exists, start from zero

Open any row and you get: the **exact SEBI wording**, the **ICAI page number** it comes from,
where inside the company that data usually lives, what a complete answer contains, and — for
emissions — the **emission factor with its version and the financial year it applies to**.

**Why a consultant cares:** the value isn't the list of 108. It's knowing which third you don't
have to chase.

### 2. Collect — built, working, untested outside

A workspace for the chasing itself. You pick which BRSR fields belong to which person inside the
client — electricity to facilities, headcount to HR — and each person gets **their own link with
no login**, showing only their fields. They type their numbers, attach the bill or the invoice,
and it comes back to you. It chases them on a schedule. Emissions compute automatically from
cited factors. Every figure carries **who it came from and whether a person typed it or a
document was read for it.** Then it produces a printable draft.

**138 fields are requestable** — all of Section A, B and C.

⚠️ **The honest state: nine collections exist, all created in a two-week window in June, all by
me testing. No outside practice has ever run a real client through it.** That is the sentence
that makes everything else you say believable.

### 3. The crosswalk — built, and this is the part your email was about

A reference table. For each BRSR disclosure, it tells you **which item in each other framework
asks for the same thing**: GRI, TCFD, IFRS S1/S2, TNFD, ESRS, **CDP, EcoVadis** — and, as of
today, **GRESB**.

GRESB maps **40 of 77** rows, separately for its Real Estate and Infrastructure Assessments
because their vocabularies differ. And **a third of BRSR maps nowhere in GRESB** — it has no
human-rights aspect and no statutory-CSR aspect, so those rows are deliberately empty.

---

## Part 4 — ⚠️ The honest answer to your own question

You wrote:

> *"Next I am building a shared workspace where a client collects each number once (energy, water,
> people) and it maps across BRSR, CDP, EcoVadis and GRESB, instead of being chased separately
> for every framework."*

**You were right to be suspicious. Here is exactly where the line is.**

| Half of the claim | Status |
|---|---|
| "a shared workspace where a client collects each number once (energy, water, people)" | ✅ **TRUE.** That is Collect. 138 requestable fields; energy, water and people are all genuinely in there. |
| "and it maps across BRSR, CDP, EcoVadis and GRESB" | ⚠️ **The knowledge exists. The plumbing does not.** |

**What that means concretely.** The crosswalk can tell you *which CDP question your client's
energy number answers.* It cannot yet *take the number your client submitted in Collect and place
it into a CDP answer.* The map is drawn; the pipe between the collected number and the other
framework's response is not built.

**The sentence to say, close to verbatim:**

> "I should be precise about one thing, because it's the sentence you booked this call on. The
> workspace collects each number once — that part is real and working. The mapping across CDP,
> EcoVadis and GRESB exists as knowledge: I can tell you which CDP question your client's
> electricity figure answers, and which EcoVadis criterion it sits under. What I **cannot** yet
> do is take the number your team submitted and hand you a filled-in CDP response. The map is
> drawn. The pipe isn't built. That's the next thing, and it's why I'd rather test on something
> real before building more of it."

**Your email said "Next I am building."** Future tense. **You are not caught out** — you just
have to say where the line falls, and saying it precisely is worth more than the feature.

### Why I am not building that pipe tonight — a real technical reason, not timidity

I tried. **The product carries two different numbering systems for BRSR disclosures**, and they
collide.

In Collect, `P6-E7` means **greenhouse gas emissions**. In the crosswalk, `P6-E7` means **water
withdrawal**. `P6-E1` is **total energy** in one and **electricity** in the other. Of 108 ids,
only 19 appear in both — **and the ones that do appear in both mean different things.**

So a pipe built tonight by matching those ids would confidently display **your client's GHG
number under a water heading.** On screen. To someone certified in CDP and GRI.

Fixing it properly means hand-reconciling 108 disclosures against 77 crosswalk rows, each one
checked. That is a day of careful work, not an evening. **A wrong mapping is worse than an honest
gap** — the same reason I pushed back on faking GRESB, and the same reason your product's whole
promise is "cited, or not claimed."

---

## Part 5 — The ten sentences you must be able to say

Read these aloud. If any feels shaky, that's where to spend your remaining time.

1. "BRSR is a compliance filing with SEBI. CDP is an investor scorecard. EcoVadis is a supplier
   scorecard a buyer makes you get. GRESB is for real estate and infrastructure only."
2. "The same meter reading answers a question in all four, in four different vocabularies."
3. "EcoVadis is the odd one out — it rates your management system, not just your numbers. Policy,
   actions, results."
4. "The free check sorts all 108 Section C disclosures into ready, verify and collect, with the
   SEBI wording and the ICAI page on every row."
5. "The value isn't the list. It's knowing which third you don't have to chase."
6. "Collect assigns fields to the people who hold them, each gets a no-login link, it chases
   them, and every figure comes back with its source."
7. "Nine collections exist and they're all mine from June. No outside practice has run it."
8. "The crosswalk tells you which CDP question your BRSR number answers. It doesn't yet hand you
   a filled CDP response."
9. "GRESB maps 40 of 77 rows, and a third of BRSR maps nowhere in GRESB — no human-rights
   aspect, no statutory-CSR aspect. Those rows are empty on purpose."
10. "Every emission factor carries its version and the year it applies to, because a Scope 2
    number on last year's grid factor still adds up — it's just computed on a basis nobody can
    cite now."

---

## Part 6 — When she asks something you don't know

**This will happen, and it is survivable. The wrong move is guessing.**

Use one of these three, then move on:

> "I don't know. Let me check and put it in the note I send today."

> "I don't know that well enough to answer usefully — that's the kind of thing I was hoping to
> learn from you."

> "I know the shape of it but not the detail, and I'd rather not guess at a regulatory fact in
> front of you."

⚠️ **Never guess at a number, a deadline, a threshold or a framework requirement.** She is
certified in **GRI, SBTi, CDP and Integrated Reporting**. A confident wrong answer costs you the
relationship; "I don't know" costs you nothing. Her own practice sells defensible data — not
knowing is a position she will recognise and respect.

**And remember the actual aim.** You are not there to pass an exam on four frameworks. You are
there to show one honest thing, hear where it's wrong, and ask for one engagement to test it on.
**She knows these frameworks better than you ever will. That is why you want her, and it is
fine to say so:**

> "You've worked across all four of these for ten years. I've built a tool that assumes things
> about how they overlap. I'd mostly like to find out which of my assumptions are wrong."

---

## Part 7 — Should we build more before the call?

**No, and this is a considered answer rather than a time excuse.**

- **The feature that would matter — the pipe from a collected number into a CDP or EcoVadis
  answer — cannot be built safely tonight.** The id collision above means a rushed version shows
  wrong data on screen.
- **Nothing else moves the needle.** She booked on a roadmap sentence, not a feature list. Another
  surface is another place to be wrong in front of the one person most qualified to notice.
- **What is actually missing is the thing you just identified: you knowing what this is.** That
  gap closes by reading, not by building. An hour on Parts 1–5 is worth more tomorrow than any
  feature I could ship tonight.
- **And the gap itself is an asset.** "The map is drawn, the pipe isn't built, and I'd like to
  test on something real before building more" is a *better* thing to say than a demo of a pipe
  built the night before. It asks for exactly what you want, and it is true.
