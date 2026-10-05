# The demo sheet — what to show, in what order, at which URL

**For the call with Dr. Shashi Kad, SAGE Sustainability.** Written 2026-10-05.
Hold this next to you. Everything is a real URL on **saaksh.co**.

---

## ⚠️ READ THIS BOX FIRST — the one thing that can go wrong

**Do NOT open `/requests` (the collections list) on screen-share. Do not click "Dashboard" in the
left sidebar.**

There are **nine collections** in Collect. **Eight of them are named after real companies that are
not your clients** — "Tata Motors", "Tata Motors Ltd" (×3 more), "Tata Steel" (×2). You created
them as tests in June.

**Why this is the single biggest risk on the call:**

- Dr. Kad will read that list as **your client list**. Tata Motors as a BRSR client would be a
  significant account.
- **SAGE's own published client is Hero MotoCorp** — a direct competitor of Tata Motors. She will
  notice, and she may well assume a conflict.
- SAGE is **90% repeat-and-referral**. If it later emerges those were test rows, the damage is not
  to this product — it is to whether you are a person who says accurate things.

**⚠️ And you cannot avoid it by typing the URL directly.** The Collect **left sidebar lists every
collection on every `/requests/*` page**, including the frameworks screen. *(Verified in
`src/app/requests/layout.tsx` → `listCampaigns()` → `CollectNav`.)*

**So do one of these two things before the call — not during it:**

1. **Rename them** (recommended, 10 seconds, reversible — I have the SQL ready, just ask), or
2. **Collapse the sidebar** by demoing at a **narrow browser window** — the rail is `hidden lg:flex`,
   so **below 1024px wide it does not render at all.** Verify this yourself before the call.

---

## Before you share your screen

| # | Do this | Why |
|---|---|---|
| 1 | Open **saaksh.co/notrack** once | Kills the cookie banner for the session |
| 2 | Open **saaksh.co/demo** — then click **"See the sample report"** | Pre-filled sample report, **no typing on the call**. Leave this tab open |
| 3 | Log in at **saaksh.co/login**, then go **straight** to the frameworks URL in step 4 of the demo | So you are not logging in live, and never land on the list |
| 4 | **Check the grid factor reads `0.710`, `CEA Version 21.0`, `FY 2024-25`** | ⚠️ See the verification box below |
| 5 | Close every other tab. Phone on silent. Pen and paper visible | Note-taking is a signal |

### ⚠️ Step 4 is a real verification, not a formality

The **data file is correct** — `src/data/emission_factors.json` holds `0.710`, `CEA Version 21.0`,
`FY 2024-25` (I checked it today). **But no session has ever loaded saaksh.co** — this container's
network policy blocks it. So the number is right *in the repo*; **you are confirming it renders.**

**If it shows anything other than 0.710 / v21.0 / FY 2024-25 — do not open any calculator on
screen.** An out-of-date grid emission factor is the one error Dr. Kad is most qualified to spot
on sight, and the product's entire pitch is citation discipline.

**Where to check:** `/tools/ghg-calculator`, or `/tools/emission-factors` and search "grid".

---

## The demo — five stops, about eight minutes

### Stop 1 — the sample report · `/demo`
**(already open from the pre-call checklist)**

> *"This is a sample, not a client — fictional steel exporter. It's gone through all 108 BRSR
> Section C disclosures and sorted them into what they can pull from filings they already make,
> what's partly there, and what they have to collect fresh. **The value isn't the list of 108 —
> it's knowing which third you don't have to chase.**"*

⚠️ **Say "this is a sample, not a client" out loud.** The company is `Bharat Steel & Alloys Ltd`
and it is invented.

*Why this sample: steel + EU export + 3-plus years maturity, so it shows the Leadership indicators
and a meaningful CBAM readiness view. It is also isolated by design — it never writes to your own
saved session.*

### Stop 2 — one Principle 6 row, expanded · same page, Action Plan tab
**This is the most important three minutes of the call.**

Expand any **P6** row (energy, water or emissions).

> *"Here's what's under one row. The SEBI wording, verbatim. The ICAI page number it's on. Where
> inside the company the data usually lives. And the emission factor — with its version and the
> financial year it applies to. **That last one is why the product exists.** A Scope 2 number
> computed on last year's grid factor still adds up. It's just computed on a basis nobody can
> cite now."*

**Then stop talking.** Citation discipline is her native language. This is where she engages.

### Stop 3 — where it deliberately stops · 90 seconds, do not skip
Stay on the same screen; the **Materiality** tab carries its own disclaimer.

> *"Three things it won't do. It doesn't decide materiality — that needs a stakeholder process,
> and the tool says so on its own screen. It doesn't claim anything is assured; it's built so a
> figure can be **defended** — source, owner, evidence, factor version — which is a different
> thing. And it doesn't pretend the wider sustainability story is finished just because the
> disclosures are."*

**That last sentence is her own article's argument, demonstrated instead of asserted.**

### Stop 4 — Collect, in her language · `/requests/df6bb338-0b9e-476d-9ae0-012305e7fe7f`

**This is the "Sample — Acme Manufacturing (demo)" collection.** It is the only one that is both
safely named and actually full of data.

> *"You assign the BRSR fields to the people inside the client who actually hold them —
> electricity to facilities, headcount to HR. Each person gets their own link, no login, showing
> only their fields. They type their numbers and attach the bill. It chases them on a schedule.
> And every figure comes back with **who it came from**, and **whether a person typed it or a
> document was read for it**.*
>
> *The reason I think it might fit SAGE: **it's a handover mechanism.** Your guided traverse to
> independent traverse — that's the shape I've been building without having a name for it."*

⚠️ **"Guided traverse → independent traverse" is SAGE's own published method.** Use her words.

### Stop 5 — the frameworks screen · `/requests/df6bb338-0b9e-476d-9ae0-012305e7fe7f/frameworks`
**⚠️ THIS IS THE SCREEN YOUR EMAIL BOUGHT YOU THE MEETING TO SEE. Never skip it. If you are
running short, cut Stop 3, not this.**

You will see **7 collected figures**, reaching **all six frameworks** — GRI, TCFD, IFRS S1/S2,
CDP, EcoVadis, GRESB. *(I verified the exact output against the live database today.)*

**Point at the electricity row — 4,200,000 kWh:**

> *"This is the part my email was about, and it's built **for energy, water and people** — the
> three I named. The facilities manager submitted this figure once. Here is every framework
> question it already answers: **GRI 302-1**. **TCFD Metrics and Targets**. **IFRS S2 Para
> 29(a)**. **CDP's climate change performance module**. **EcoVadis' Energy consumption and GHGs
> criterion**, under Environment. And the **Energy aspect in both GRESB Assessments** — Real
> Estate and Infrastructure named separately, because the aspect vocabularies differ."*

**Then point at the bordered panel at the top of the screen and read it out:**

> *"And that panel is the product telling you what it doesn't cover. **Seven of the nine
> principles aren't carried across** — ethics, products, stakeholders, human rights, advocacy,
> community, consumers. The crosswalk exists as reference; a collected figure doesn't flow into
> it yet."*

**Then the refusals — the strongest thirty seconds in the whole demo:**

> *"The reason this took a day and not an evening: the product had **two BRSR numbering systems
> and they collide.** `P6-E7` is greenhouse gases in one and **water withdrawal** in the other.
> Only **nineteen of a hundred and eight** codes appear in both, and the shared ones mean
> different disclosures. Matching by code would have shown you a client's **GHG number under a
> water heading**. So I reconciled it by hand — **27 mappings and 17 places I wrote down a
> refusal.** A business continuity plan isn't climate scenario analysis. Green Credits aren't
> carbon offsets. Premises accessibility isn't a count of differently abled employees.*
>
> ***I'd rather show you the refusals than the coverage.***"*

⚠️ **This story is worth more to her than the feature.** She is certified in GRI and CDP and has
seen tools assert mappings that were not true.

**Then stop:**
> *"That's the tour. Where does the first pass get that balance wrong — between the required part
> and the fuller story a company should be telling?"*

---

## What NOT to open

| Don't open | Why |
|---|---|
| **`/requests`** and the sidebar **"Dashboard"** | The eight real-company test names. See the box at the top |
| The other eight collections | Same |
| **`/requests/proposal`** (fee builder) | Pricing. You have no validated price and must not imply one |
| The **free report's** framework crosswalk accordion | Generic table with no client data — it muddles the point Stop 5 just made |
| **`/brief`** | ~3 users, 0 returning. Don't invite questions about it |
| **`/directory`** and **`/jobs`** | Both empty |
| Any calculator, **if the grid factor is wrong** | See the verification box |
| **Anything you have not clicked that morning** | |

---

## Safe extras — only if she asks, or if you have spare time

| URL | What it is | When to use it |
|---|---|---|
| **`/tools/emission-factors`** | **34 emission factors, every one cited and version-stamped.** Searchable, CSV download | **The best spare-time page by far.** It is your brand premise made literal |
| **`/brsr/p6-e1`** | A full reference page for one disclosure — one of **108** | If she asks about the teaching angle |
| **`/brsr`** | The hub for all 108 | Same |
| **`/academy`** | An **8-module teaching pack** | ⚠️ **Open this if Green Skills Academy comes up.** This is the long-game prize |
| **`/glossary`** | 56 defined terms | If she asks what's public |
| **`/methodology`** | How the product sources and cites | A good answer to "where do your numbers come from" |
| **`/tools/brsr-applicability`** | Who has to file, and when | If the glide path comes up |
| **`/tools/audit-readiness`** | Evidence checklist for assurance | If BRSR Core assurance comes up |
| **`/tools/scope3-calculator`** | Scope 3 | ⚠️ Only if she raises Scope 3. **BRSR Scope 3 is voluntary** |

**All nine tools are free and need no login.** That is deliberate, and it is worth one sentence:
*"the free half is the funnel — understand and prepare, on your own device. The workspace is the
part that does the work."*

---

## If she asks for a URL to look at later

Send **one**: **`saaksh.co/tools/emission-factors`**.

It needs no login, it is useful in ten seconds, and it is the page that best argues the brand —
every factor, with its source and its version. **Don't send a list.** The restraint is the message.

---

## Status, in one table — never say these ambiguously

| Thing | Status |
|---|---|
| Free readiness check, all 108 disclosures | ✅ **BUILT**, live, no login |
| Nine free tools, 108 reference pages, glossary, academy | ✅ **BUILT**, live |
| Collect — assign, chase, submit, evidence, emissions, draft | ✅ **BUILT**. ⚠️ **Nine collections, all yours, all from June. No outside practice has ever run it** |
| Collect-once → carries across frameworks, **energy** | ✅ **BUILT** |
| Collect-once → carries across frameworks, **water** | ✅ **BUILT** |
| Collect-once → carries across frameworks, **people** | ✅ **BUILT** (Principle 3 **+ the Section A employee rows**, because BRSR asks for headcount and turnover in Section A) |
| Also carried: emissions, waste, air pollution, biodiversity | ✅ **BUILT** |
| P1 ethics, P2 products, P4 stakeholders, P5 human rights, P7 advocacy, P8 community, P9 consumers | ❌ **NOT BUILT.** Crosswalk yes, pipe no. **The screen says so** |
| A filled-in, submittable CDP or EcoVadis response | ❌ **NOT BUILT**, and may never be. You still answer in their own portals |
| Per-person seats inside a firm | ❌ **NOT BUILT.** SAGE's 17 people would share one passcode. **Never say "seats"** |
| Firm-level data separation between consultancies | ✅ **BUILT**. ⚠️ Row-level hardening on individual field writes is **NOT** done — say so if asked |

⚠️ **Every single time you say the mapping is built, say "for energy, water and people."** Dropping
the qualifier turns a true statement into the same kind of overclaim the email already cost you.

---

## The five things not to say

1. **"Seats"** — they don't exist.
2. **Any price, or any range** — *"priced per engagement, onboarded manually."*
3. **"Only" or "first"** — FileBRSR, SustainableX and RSustain all overlap.
4. **A competitor's price** — you have verified none of them yourself.
5. **"Nothing leaves your browser" about Collect** — true of the **free tool only**. The importer
   and the narrative drafter send extracted **text** to an AI provider. The *file* stays local;
   the text does not.

Plus: **never say Collect is "validated."** Priya Ranjan **shaped** it. No outside practice has
run it. Different claims.

**Traction, if asked:** *"More than 220 users, mostly independent consultants. No firm is a
customer yet."*

---

## And the one thing that is not a build

⚠️ **Read her article before the call.** Ten minutes. Write down **one thing you agreed with** and
**one thing you'd push back on.** The second is worth more.

She replied to your first email partly *because* it opened by referencing her piece. If she asks
"what resonated?" — a vague answer is the one thing that would make her doubt everything else you
say, **including the honest parts.** No screen in this document substitutes for it.

⚠️ **Her line "led by ambition, not compliance" is hers, and your second email already quoted it
back to her. Do not quote it a second time.** Let her say it.
