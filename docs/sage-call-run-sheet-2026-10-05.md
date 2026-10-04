# SAGE call — run sheet

**Dr. Shashi Kad · Monday 2026-10-05, 11:30–12:00 IST · Google Meet**

Written 2026-10-04, the weekend before. `docs/sage-call-brief.md` is the strategy; **this is the
sheet you actually hold on the day.** Where they differ, this file is later and wins.

---

## 0. Two corrections to the brief, before anything else

**1. The "Deploy before the call" block at the top of `sage-call-brief.md` is DONE. Ignore it.**
It was written 2026-10-02 when production was `7cb0b0c`. Production is now `30388f4`, which
contains `afd233a` — the homepage Scope 2 fix. The grid factor in the repo is **0.710, CEA Version
21.0, FY 2024-25**, and `0.716` survives only where it belongs: in the blog post that names it as
the stale-factor finding, and in a test that stops it coming back. **The one thing on that page
Shashi was most qualified to spot is fixed and shipped.**
⚠️ But nobody in-session has *seen it render* — the container denies `saaksh.co:443`. That is
check #1 below and the only reason the checklist exists.

**2. The brief and the traction doc appear to disagree about "build your tech arm". They don't.**
The brief says drop it; the traction doc says that was wrong. Both then prescribe the **same
behaviour**: do not lead with it, ask where SAGE loses hours first, follow it only if she opens
that door. The disagreement is about how to feel, not what to do. So:

> **Pocket the tech arm. Do not raise it. If she describes repeated manual work, spreadsheets or
> chasing — walk through that door and go hard.**

The traction doc's correction is worth internalising for one reason only: **if she opens that
door, you are not negotiating from weakness.** Selling Saaksh as a product needs retention.
Selling Rahul as the builder does not — she supplies the problem, Saaksh is the portfolio piece.
208 pages, 108 cited disclosures, a working collection system, a six-framework crosswalk,
versioned factors, one person. Say that without flinching if the moment comes.

---

## 1. Click-through checklist

You have to do this — the container can't reach `saaksh.co`. Ordered by **what costs you the call
if it's broken**, not by where it sits in the nav. Budget 25 minutes.

Report back as `#n OK` or `#n` + what you saw. I'll fix anything real.

### Tier A — breaks the call (do these first)

**#1 · Homepage GHG panel grid factor** — `saaksh.co`, scroll to the live Scope 1/2 panel.
- ✅ Expect: **0.710** and a caption naming **CEA Version 21.0** / FY 2024-25.
- 🚨 If it says **0.716** or **CEA v18 (FY24)**: the deploy didn't take the fix. Tell me
  immediately — that's a code fix, not a copy fix, and it is the single highest-stakes string on
  the site for *this* reader.

**#2 · The full demo path, exactly as you'll screen-share it** — `/` → "Start a free report" →
`/start` → `/report`.
- Enter: company `Anonymised — mid-size textile exporter` · industry **Textile & Apparel** ·
  type **Product/Manufacturing** · size **Listed top 1000** · maturity **First-time filing** ·
  export **EU** · filings **PCB (CTE/CTO)** + **Hazardous Waste**.
- ✅ Expect: report renders; header shows the gap stats; left rail has seven views.
- 🚨 Watch for: a blank/spinning `/report`, a readiness gauge reading 0, or the Sections A & B
  card missing from the top of the Action Plan.

**#3 · The three statuses, on screen** — Action Plan tab.
- ✅ Expect a visible mix of **Ready to pull** (emerald) / **Needs verification** (amber) /
  **Collect fresh** (stone) across P1–P9. The PCB + Hazardous Waste selections are what generate
  the green and amber ones — if *everything* is "Collect fresh", the overlap logic didn't fire and
  your demo loses its best beat.

**#4 · One expanded row, end to end** — expand **P6-E1** (or any P6 row).
- ✅ Expect, in order: Pull from · the gap · How to collect · Best practices (India +
  International) · **verbatim SEBI language** · **SEBI source with an ICAI page number** · unit.
- 🚨 If the SEBI wording or the page citation is missing on the row you pick, pick another and
  tell me which one was empty. This row *is* your answer to "what does cited mean".

**#5 · The embedded calculator inside P6-E1** — the one with the grid factor.
- ✅ Same expectation as #1: **0.710 / CEA v21**. Two surfaces, one number. Check both.

### Tier B — you'd want to know before you offer it

**#6 · `/tools/emission-factors`** — shipped 2026-10-03, **never seen rendered by anyone.**
- ✅ Expect: ~34 factors, each with a citation and a version, search works, CSV downloads.
- This is the newest page on the site and the one most likely to be subtly wrong. It's also a
  strong thing to have open in a second tab for a CDP-certified reader.

**#7 · `/academy`** — the brief says offer this as a gift. It is live now.
- ✅ Expect: 8 modules, and the line that it **carries no certification or accreditation and is
  not affiliated with any institute**. That disclaimer is what makes it safe to show the
  curriculum lead of a national programme. Confirm it's visible, not buried.

**#8 · FAQ blocks on the tool pages** — check **two** of: `/tools/ghg-calculator`,
`/tools/audit-readiness`, `/tools/xbrl-preflight`. Last section before the footer.
- ✅ Expect: an accordion that opens. Shipped 2026-10-03, never seen rendered.

**#9 · `/tools/audit-readiness`** — she preps clients for BRSR Core assurance; this is the page
she's most likely to go looking for unprompted.
- ✅ Expect: nine principle groups; the **"nine attributes SEBI designated"** wording; SEBI's
  **"assessment or assurance"** phrasing present. All three were corrected in `fa006a1`.

### Tier C — confirm, don't demo

**#10 · `/pricing`** — ✅ confirm it still names **no number**. (It doesn't in the code. Confirm
live.) Your honest line stays *"priced per engagement, onboarded manually."*

**#11 · The `75+ ESG consultants` line** — it's on the homepage twice (hero area + near the final
CTA) and it **undersells you**: the real figure is 241. Don't change it this weekend. If she reads
it aloud, say: *"that's stale — it's 241 now, almost all of them first-time visitors, which is
exactly the problem I want to talk to you about."* **That turns your weakest number into your
opening.**

**#12 · Do NOT open** — Collect with real campaigns · the proposal/fee builder · `/requests/*`
anything · `/brief` · `/jobs` · `/directory` (both empty). And nothing you haven't personally
clicked since the deploy.

---

## 2. The opening — rehearse this

Three beats. Target **90 seconds**, then stop talking.

### Beat 1 — her question, restated (≈15s)

> "Thanks for making the time. You asked one question in your reply — how this tool would be of
> use to you or to anyone. I'd rather show you than describe it, and then I mostly want to be
> corrected."

Why it works: it's her agenda, verbatim, inside the first fifteen seconds. And "corrected" is the
register that earned the same-day reply.

### Beat 2 — the concession, before she finds it (≈40s)

> "Before I share my screen, the honest state of it. 241 people have used the free tool over five
> months — and essentially all of them are first-time visitors. Almost nobody has come back.
>
> I think I know why. A gap analysis is a once-a-year job per client. Even someone who likes it has
> no reason to return next week. The part that actually recurs — chasing the numbers out of a
> client's team — is the part I've built and nobody outside has really run yet.
>
> So I'm not here to tell you it works. I'd like to find out whether I'm right, on something real."

Why it works: this *is* the move that got you the reply. She runs a 90%-referral practice and
guards her reputation; the person who concedes the weakness first is the person who isn't a risk
to it. And it pre-frames the ask so you never have to pitch.

### Beat 3 — hand over, then go quiet (≈15s)

> "Let me show you the first pass on an anonymised textile exporter — about eight minutes — and
> then I'd really like the rest of the time to be you telling me where it gets the balance wrong."

Then share screen. **Beats 1–3 are the last time you talk uninterrupted.**

### Three things to say out loud during the demo — these are the whole thesis

When you reach the end of the walkthrough, name where it **deliberately stops**:

> "Three things it won't do. It doesn't decide materiality — that needs a stakeholder process and
> the tool says so on its own screen. It doesn't claim anything is assured; it's built so a figure
> can be *defended* — source, owner, evidence, factor version — which is a different thing. And it
> doesn't pretend the wider sustainability story is finished just because the disclosures are."

That is your first email's thesis demonstrated instead of asserted, and it's the sentence most
likely to make a GRI/CDP-certified reader trust the rest.

### Rehearsal instruction

Say Beat 2 out loud, timed, **three times** before the call. It contains the two numbers you must
not fumble (**241**, **once a year**) and one phrase you must not soften — *"almost nobody has come
back."* If that lands flat or apologetic, the concession reads as weakness instead of candour.

---

## 3. Your four questions

Print these. In `11–23` you are writing, not talking. **Ask one, then wait.** The silence after is
doing the work.

**Q1. "Where does the first pass get that balance wrong?"**
→ The question you already promised in writing. Ask it first because it's the one you owe her.
→ Listen for: over-weighted environment, missing social nuance, anything that reads as
compliance-first when her position is *"led by ambition, not compliance."*

**Q2. "Where does SAGE collect the same number twice?"**
→ From your second email, still unanswered. **This is the requirements doc for the entire
roadmap.** If you get one good answer all call, you want it to be this one.
→ Push for specifics, not opinions: *"take me through the last difficult metric — where did it
live, what was wrong with it, how many clarification cycles, who signed it off?"*
→ If she describes spreadsheets, re-keying, or chasing the same figure across CDP and BRSR: **that
is the tech-arm door. Walk through it.**

**Q3. "Could these disclosure guides work as learning material for Green Skills Academy?"**
→ Also already asked, and the biggest long-term prize: Saaksh as the practical layer of a national
BRSR curriculum. Offer `/academy` here — *"I built this for trainers generally; I'd like your view
on whether it's any use to you"* — a gift, not a pitch.

**Q4. "What would you have to stop doing to use something like this?"**
→ The one that separates polite interest from real intent. A warm answer with no displaced
activity means no engagement, however nice the call was. Ask it even if you're running short —
**drop Q3 before you drop Q4.**

### The ask, when the moment comes (minute 28–30)

> "Is there one client where SAGE is chasing BRSR data right now? I'll set the collection up
> myself, free. You keep the relationship and the output — I get to watch where it breaks."

**Win condition: one named client and a date.** Critique + warmth with no client is still a decent
outcome. Don't manufacture a bigger yes.

### Guard rails you may not cross, however well it's going

- **Never say "seats"** — per-person accounts don't exist; her 17 people would share one passcode.
- **Never say "GRESB"** — it's in blog and glossary copy only, nowhere in the product.
- **Never state a price.** *"Priced per engagement, onboarded manually."*
- **Never say "only" or "first"** — FileBRSR, SustainableX and RSustain overlap on all of it.
- **Never put a competitor's price in your mouth** — ₹29,999 is relayed, not verified by you.
- **Never apply "nothing leaves your browser" to anything in Collect.** True of the free tool only;
  the importer, OCR, CBAM auto-fill and narrative drafter all send extracted *text* out.
- **Do not cite "7 of 16 owners responded"** unless those were real client-side people. All nine
  collections sit in one two-week window in June, which looks like testing. With her specifically,
  that is the claim that costs everything if it surfaces later.
- Don't name the homepage sample company as a customer (fictional), any other consultancy, or the
  other six firms you emailed.
- **Isolation question, if asked:** *"Firm-level separation on collections is in — each firm owns
  its campaigns and every campaign query filters by it. Row-level hardening on individual field
  writes is the next commit."* Exactly that. She'll respect the precision more than confidence.

---

## 4. The thank-you email

Send it **the same day.** One agreed thing, and nothing else. Resist attaching anything she didn't
ask for — a long email undoes a good call.

### Version A — she named a client (the win)

> Subject: **Thank you — and the collection for [client]**
>
> Dr. Kad,
>
> Thank you for the half hour, and particularly for [the one specific correction she made]. You
> were right that [restate it in her words, not yours] — I'd been [what you'd been doing instead].
>
> As agreed: I'll set up the data collection for [client] myself, at no cost, and send you the
> owner links to review before anything goes out. [Day] works on my side — tell me who the data
> owners are and I'll take it from there.
>
> You keep the relationship and the output. I get to watch where it breaks, which is the part I
> actually need.
>
> Rahul

### Version B — a good critique, no client

> Subject: **Thank you**
>
> Dr. Kad,
>
> Thank you for the half hour, and for being direct about [the correction]. [One sentence on what
> you're changing because of it — specific, and something you will actually do.]
>
> You said [her line about where the same number gets collected twice / the handoff / whatever she
> flagged]. That's the clearest statement of the problem I've had from anyone, and it changes what
> I build next.
>
> No ask attached. If a client comes up where SAGE is mid-chase on BRSR data, the offer stands —
> I'll set the collection up myself and you keep the output.
>
> Rahul

### Version C — Academy was the live door

> Subject: **Thank you — the modules for Green Skills Academy**
>
> Dr. Kad,
>
> Thank you for the half hour. [One line of specific gratitude for a correction she made.]
>
> As discussed, the eight disclosure modules are at saaksh.co/academy. They name no institute and
> claim no certification — deliberately, so they're yours to shape rather than something to adopt.
> If one module is worth testing with a cohort, tell me which and I'll rebuild it to your
> curriculum structure rather than mine.
>
> Rahul

### Rules for all three

- **One agreed action. No feature list, no deck, no roadmap.**
- Quote her own correction back in **her** words — it proves you were writing, not waiting.
- No price, no "only/first", no "seats", no GRESB, no response-rate statistic.
- Send it the same day, before the call fades for her. Within four hours beats polished.

---

## 5. What is NOT in scope this weekend

No features. No UI polish. The only code work is fixing what the checklist turns up.
`docs/competitor-parity-plan.md` waits until after Monday.

**And the highest-value open item on the whole project is still not a build:** Google Search
Console — DNS verification plus sitemap submission. Only you can do it. Two separate external
analyses now point at the same conclusion, from opposite directions: Saaksh already has the
playbook, and still has 241 users who never return. **The missing piece is indexing and authority.**
Do it the day after the call, not before — it needs 20 minutes and a clear head, and Monday needs
neither.
