# Call brief — Dr. Shashi Kad, SAGE Sustainability

**Monday 2026-10-05, 11:30–12:00 IST · Google Meet · 30 minutes**

Read this the night before. Background and strategy are in `docs/sage-call-2026-10-05.md`; this is
the call itself. Written 2026-10-02.

---

## Do this before the call

**Deploy.** Production is still `7cb0b0c` from 2026-09-09 — nothing from the last three days is
live.

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; vercel --prod --yes
```

**Why it matters on this specific call, more than on any other:** the live homepage GHG panel
multiplies grid electricity by **0.716** and captions it **"CEA v18 (FY24)"**. The correct current
basis is **0.710, CEA Version 21.0, FY 2024-25** — and the site's own blog post names using 0.716
instead of 0.710 as the stale-factor error "flagged by an assurer". **Shashi is certified in CDP
and GRI.** A wrong grid factor on the homepage of a product called *evidence* is the one thing on
that page she is most qualified to spot. It is already fixed in code (`afd233a`) and only needs the
deploy.

If you cannot deploy before the call: **do not open the homepage calculator on screen-share**, and
do not promise `/academy` or the SAGE login — neither is live.

After deploying, re-run the adoption statement in `docs/migrations/001-firm-tier-orgs.sql`. It is
idempotent and re-adopts any collection created while the old code was still inserting without
`org_id`.

---

## The aim — revised 2026-10-02, after reading the analytics

Earlier versions of this brief aimed at "a good critique plus one small next step". The numbers
have since sharpened it.

**241 active users over five months. 241 of them new. 2 Pro access requests. 4 newsletter
subscribers. 9 collections ever created in Collect, all between 12 and 27 June, none since.**

What Saaksh lacks is not features, traffic or polish. It is **one practice actually running the
recurring loop** — real clients, real data owners, real chasing. SAGE is close to exactly that
practice: ten years old, ~17 people, 65+ clients, running BRSR alongside CDP, EcoVadis, GRESB and
GRI.

**So aim at one live engagement. Not a sale, not a partnership.**

The line to build the call around, close to verbatim:

> "241 people have used the free tool and almost none have come back. I think that is because a gap
> analysis is a once-a-year job — and the part that actually recurs, chasing the numbers out of a
> client's team, is the part nobody has tried yet. I'd like to find out whether I'm right, on one of
> your engagements."

It answers the exact question she asked ("how will that tool be of use to us or anyone") with *I am
not certain yet, and you are the person who could tell me*. It concedes the weakness before she
finds it, which is the move that earned a same-day reply. And it maps onto SAGE's own
**guided traverse → independent traverse** model, because Collect *is* a handover mechanism.

**The ask:** *"Is there one client where SAGE is chasing BRSR data right now? I'll set the
collection up myself, free. You keep the relationship and the output — I get to watch where it
breaks."*

⚠️ **One honesty check.** The only external signal in the dataset is **16 data owners invited, 7
responded (44%)** to a cold no-login link. Use it **only if those were real client-side people**.
All 9 collections fall inside a two-week window in June, which looks like building and testing.
If they were test contacts, do not cite the number — with her, that is exactly the thing that
costs everything if it surfaces later.

**Drop the "build your tech arm" framing.** With 2 Pro requests and flat retention, pitching
yourself as a product partner to a ten-year-old firm negotiates from weakness. Pocket it; follow it
only if she raises tooling frustration herself.

**Green Skills Academy stays as the second ask** — still the biggest long-term prize, still free to
offer, still her territory. It just does not fix retention, so it is no longer the primary aim.

**Revised win condition: one named client, and a date to set it up.** A critique and warmth without
a client is a decent outcome. An Academy conversation is a bonus on a different timeline.

## Her, in sixty seconds

**Dr. Shashi Kad — she/her.** Founder & Chief Sustainability Strategist, SAGE Sustainability
(B Corp, Bengaluru, 2016, ~17 people, 65+ clients, 90% repeat or referral). Geologist by training,
PhD Earth Sciences, Oxford alumna, ~20 years across India, UK and Japan. **Certified in GRI, SBTi,
CDP and Integrated Reporting.**

**The thing that matters most:** she is **curriculum lead and principal trainer of Green Skills
Academy**, a national NSDC-supported climate-literacy initiative. She trains your exact ICP, at
national scale, with a government-backed certificate attached.

SAGE's signature approach is **"guided traverse → independent traverse"**: heavy co-creation up
front, then deliberately handing the disclosure cycle to the client and reviewing from the
background. Use their language, not yours.

Her line, worth echoing once and not twice: voluntary disclosure works because it is
*"led by ambition, not compliance."*

---

## What she is expecting

Your first email (28 Sep) promised two specific things:

1. **To show her an anonymised example** first-pass report.
2. **To hear where the first pass gets the balance wrong** — you invited her critique.

Her reply asked exactly one question: *"how that tool will be of use to us or anyone."*

So the call is: show the thing, answer that question honestly, and let her correct you.

---

## The thirty minutes

| Time | What |
|---|---|
| 0–3 | Thanks, and her question restated. "You asked how it's useful. Let me show you rather than describe it, and then I mostly want to be corrected." |
| 3–11 | **The anonymised first pass.** The thing you promised. |
| 11–23 | **Her critique, and your two questions.** This is the valuable part. Shut up and write. |
| 23–28 | **Where it's going** — collect once, map across frameworks. Framed as in progress, because it is. |
| 28–30 | **One next step.** Pick from the ladder below based on what she responded to. |

**The register that won the reply:** you read her work and conceded a limitation before she could
find it. Keep that. She runs a 90%-referral practice and guards her reputation; anyone arriving
needing a transaction will feel like a risk to it.

---

## What to show

**The anonymised report. It needs no code and no login.** Company name is optional on the intake
form — type `Anonymised — mid-size textile exporter` and run it. Then show, in this order:

1. **The three statuses** — Ready to pull / Needs verification / Collect fresh across the 108
   Section C disclosures. This is the "first pass" your email described.
2. **One expanded row** — the SEBI wording, the ICAI page citation, where the data lives, what a
   complete answer contains. This is what "cited" means in practice.
3. **Where it deliberately stops.** Say this out loud: it does not decide materiality, it does not
   claim assurance, and it does not make the wider sustainability story look finished. That is
   your email's thesis, demonstrated rather than asserted.

**If deployed**, you can also show `/academy` — the eight-module teaching pack built from the
disclosure pages, glossary and tools. **It names no institute and claims no certification**, so
introduce it as *"I built this for trainers generally; I'd like your view on whether it's any use
to Green Skills Academy."* That is a gift, not a pitch.

**Do not show:** Collect with real campaigns in it, the proposal/fee builder, or anything you
have not personally clicked through since the deploy.

---

## Ask her these

1. **"Where does the first pass get that balance wrong?"** — the question you already promised.
2. **"Where does SAGE collect the same number twice?"** — from your second email, still unanswered.
   Her answer is the requirements doc for the whole roadmap.
3. **"Could these disclosure guides work as learning material for Green Skills Academy?"** — also
   already asked. This is the biggest prize on the table.
4. **"What would you have to stop doing to use something like this?"** — the question that
   distinguishes polite interest from real intent.

Ask to see **the last difficult metric** and the actual handoffs: where was the source, what was
wrong, how many clarification cycles, who approved it. Not opinions on a feature list.

---

## The ask ladder — stack them, let her pick

1. **Green Skills Academy pilot** — one co-branded module, zero cost, her name on it. Easiest yes,
   biggest long-term prize: Saaksh as the practical layer of a national BRSR curriculum.
2. **Anchor firm partnership** — a free pilot on one live engagement, in exchange for requirements,
   a case study and the reference logo.
3. **Tech partnership** — paid, equity, or revenue-share. **Not a salary.**
4. **Advisory** — she advises Saaksh formally.

Any one of these is a real takeaway. All four are things an owner asks for.

---

## Never say

- **"Seats."** Per-person accounts do not exist. SAGE's 17 people would share one passcode.
- **"GRESB."** It appears nowhere in the product but blog and glossary copy.
- **"Only free tool" / "only no-login workflow" / "only AI importer" / "only evidence pack."**
  FileBRSR, SustainableX and RSustain overlap on all of it.
- **Any price.** There is no public pricing and none has been validated. "Priced per engagement,
  onboarded manually" is the honest line.
- **"Nothing leaves your browser"** about anything in Pro. True of the free tool only. The AI
  importer, OCR reader, CBAM auto-fill and narrative drafter all send extracted **text** to Groq or
  Gemini — the file stays local, the text does not.
- **The homepage sample company as a customer.** It is fictional.
- Any other consultancy, or the other six firms you emailed.

**Traction line if asked:** "more than 220 users" (your own figure, 2026-09-25). The homepage says
75+, which undersells it — do not inflate past what you can stand behind.

---

## If she asks

**"How is one client's data separated from another's?"**
Firm-level separation on collections is in: each firm owns its campaigns and every campaign query
filters by it. Row-level hardening on individual field writes is the next commit. Say exactly that
— she preps clients for BRSR Core assurance and will respect the precision far more than a
confident "it's secure."

**"Do you have per-user accounts?"**
No. One passcode per firm today; real per-person accounts with attribution are the next build.

**"Does it map to CDP and EcoVadis?"**
At field level for Principle 6 — the environment figures clients get asked for repeatedly. Every
other principle is principle-level only. Nothing invented: the vocabulary comes from the sourced
CDP questionnaire areas and EcoVadis' 21 criteria.

**"Is the data assured?"**
No, and the product never claims it. It is built so that a figure can be defended — source, owner,
evidence, factor version — which is a different thing from being assured.

**"Who else is using it?"**
More than 220 users, mostly independent consultants. No firm is a customer yet. **SAGE would be the
first**, which is precisely why a pilot is worth more to you than a licence fee.

**"Did you build this alone?"**
With a practising ESG consultant, Priya Ranjan. Keep that phrasing — it is what you wrote.

---

## The win condition

She gives a real critique, and says yes to one small next step. That is it. Pilot, partnership and
anything larger come from calls two, three and four — and only if this one earns them.

Send a short thank-you the same day with the one thing you agreed, and nothing else.
