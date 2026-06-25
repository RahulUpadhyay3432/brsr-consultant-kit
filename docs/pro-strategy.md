# Saaksh — Pro positioning + pricing (founder memo)

Synthesis of two independent analyses (Gemini + ChatGPT) of the consultant
WhatsApp group, read against what we already know and have built. Treat as
**directional** — it's one community's chat, partly a job board, not a survey — but
the two analyses agree on enough that the big calls are safe.

## What the data confirms (both analyses agree)
- **Audience = solo consultants + small/boutique firms.** Price-sensitive, technically
  capable, project-based. Some in-house EHS folks and job-seekers in the mix.
- **Work is bursty and engagement-based, not steady.** "Compliance burst + project
  sprint + panic mode." Your seasonality instinct is right: a flat annual SaaS
  subscription fights the grain of how they work.
- **BRSR is ONE of many frameworks.** GRI, GHG/Scope 1–3, CBAM, CCTS/carbon markets,
  SBTi, ISO 14064, TNFD, IFRS S1/S2, CTE/CTO/EPR all recur. **Multi-framework mapping
  is where the repeated pain concentrates** — both analyses name it. This validates the
  "Pro = compliance workspace, not BRSR-only" reframe.
- **Top recurring pains:** finding work/leads (loudest theme in ChatGPT's read),
  client-side data-collection friction, **template/format hunting** (materiality
  formats, report structures — constant), cross-framework translation, and "how do I do
  this right / make it audit-defensible."
- **Money:** they bill **per project / milestone**; are **highly price-sensitive on
  tools and training** (a $350 course dropped to a ₹999 webinar; a ₹24k course pitched
  as a deal); expect diagnostics, templates and mapping-previews to be **free**; and
  **will pay for hard, immediate ROI** (cutting weeks of manual mapping) or for
  credibility/accreditation that unlocks client bids.
- **Trust is the gate.** Their biggest objection is **defensibility** — will the output
  survive client review, a verifier, a regulator? Cited + evidence-backed wins.
- Both analyses end on the same prescription: **workflow copilot (not enterprise
  monolith), freemium land-and-expand, per-project pricing, multi-framework mapping, a
  client-collection portal, audit-readiness.** That is essentially Saaksh's existing
  thesis — strong validation that you're building the right thing.

## The one divergence — "build it myself"
Gemini saw strong DIY energy (people coding their own micro-tools / prompt wrappers);
ChatGPT saw little of it ("just tell me the right way"). Both are real — it splits by
sub-segment: the technical analysts will tinker, the advisory consultants won't.
**Implication:** the product must be integrated and multi-step enough that a weekend
script isn't worth it (so the tinkerers don't bother), but most of the market just
wants it done correctly for them. Don't price or position for the ~10% who'd build
their own.

(Heads-up: quote #9 in the Gemini brief — "I spent two weeks building a free tool
that..." — is almost certainly **you** posting in the group. So there's already some
awareness in there to build on.)

## Positioning — what Pro is
**Pro = the independent consultant's multi-framework compliance copilot.** Candidate
line: *"Your expertise, our build speed."* It does the spreadsheet archaeology so the
consultant keeps the advisory layer. Four pillars, ordered by how strongly the data
backs them:

1. **The AI "compliance importer" (the wedge).** Upload a client's messy legacy docs
   (last year's BRSR, the annual report, pollution-board filings, energy audits) →
   auto-extract and map into the 108-field matrix as a **reviewable draft**. Both
   analyses call this the single biggest time-sink to eliminate. Your sharpest hook.
2. **Client data collection (Collect — built).** The portal + reminders + attribution +
   draft. Validated as a top pain.
3. **Multi-framework mapping + export (partly built).** BRSR ↔ GRI ↔ GHG ↔ CBAM ↔ TNFD ↔
   IFRS. Where the repetition and pain concentrate.
4. **Template + knowledge library.** Materiality formats, report skeletons, "how to
   answer" guidance. Cheap to provide, constantly demanded.

Running through all of it: **audit-defensibility** — cited, evidence-backed, AI drafts
that a human verifies, never auto-trusted. That's the trust differentiator that answers
their number-one objection.

## Pricing — the model
The data kills the flat-annual-subscription idea and points cleanly at **per
engagement**:

- **Free (the wedge / "land"):** gap analysis, framework-mapping preview, calculators,
  plain-English explanations, sample templates, exports. The stuff they expect free.
  (Already built.)
- **Pro — priced PER CLIENT / per reporting cycle (the "expand"):** unlock Collect, full
  multi-framework mapping/export, the compliance importer, and the full template/
  knowledge library, for that client. Matches how they bill, they only pay when they
  have a paying client, zero off-season waste. Sell as a single client or a **pack**
  (3 / 5 / 10 clients).
- **Optional later — an annual "membership":** templates + knowledge centers + all
  modules + (the interesting one) a **"verified Saaksh consultant" directory with
  lead-routing.** The loudest community need is *finding work*; a membership whose value
  is leads + credibility is genuinely year-round, which is the only honest justification
  for an annual fee in a seasonal market. Distinct, later bet — don't lead with it.

**Number — a hypothesis to TEST, not to set:** a BRSR engagement is worth lakhs to them,
while their tool price-sensitivity is high. So anchor **low per client** — think
**₹2,000–6,000 per client collection** (or a 3-client pack around ₹6,000–9,000) — and
**raise as you prove ROI**. Your first ~5 manual customers *are* the price discovery,
and the webinar Q&A is free research. Don't lock a public number yet.

## Product bets, prioritized
1. **Compliance importer** — highest-leverage wedge, but the heaviest build
   (messy-PDF extraction is genuinely hard) and it touches the **defensibility** nerve.
   Frame it as *"AI drafts the mapping, you verify"* — never auto-trusted. Validate
   demand (webinar + first customers) before building the full version; you already have
   the lightweight "upload last year's report" detection as the seed.
2. **Collect** — built; make it the obvious Pro centerpiece (the new saved-contacts
   directory helps).
3. **Multi-framework export** — extend the mapping you already have into one-click
   cross-framework output.
4. **Template / knowledge library** — cheap, high-demand; seed it (a materiality format,
   report skeletons, P5 guidance) as Pro content.
5. **(Separate growth lever, not core Pro) the consultant directory / lead-routing** —
   the strongest *community* signal in the data. Could be the membership hook later, or a
   standalone growth play. Flag it; don't chase it yet.

## Risks / don't-do
- **Don't auto-trust AI extraction.** Their #1 objection is defensibility; an importer
  that silently miswrites a number destroys trust instantly. Human-in-the-loop, cited,
  reviewable — always.
- **Privacy line on the importer:** parsing a client's documents with AI is a model
  call, so it's a **Pro / backend** feature with consent — it does *not* live in the
  "nothing leaves your browser" free tool. Keep that boundary clean.
- **Don't over-build before validation.** The data says what's *wanted*; it doesn't prove
  they'll pay *you*. Manual onboarding for the first handful, then build what they
  actually pull on.
- **Caveat the data:** two AI reads of one chat, and that chat is partly a job board —
  which likely inflates the "finding work" theme. Directional, not gospel.

## For the webinar + immediate next steps
- Present what's **built** (free tool as the hero + a Collect peek); tease the importer +
  multi-framework as roadmap; **don't pin a price** (§3 of the webinar prep doc covers
  exactly how).
- Use the room to test: *"would you pay per client for the collection + the importer?"*
  and *"what would feel fair?"*
- After the webinar: onboard 2–3 manual Pro customers at a low per-client anchor and let
  them set the real price.
