# Free distribution playbook

_Written 2026-09-08. Companion to `docs/market-research.md` (who the buyer is) and
`docs/pro-roadmap.md` (what to build). This one is only about getting people to arrive._

---

## The premise

The product is not the problem. GA4, 1 May to 4 Sep 2026:

| Figure | Value | What it says |
|---|---|---|
| Users | 175 | Four months. This is the constraint. |
| Sessions | 434 | |
| Avg engagement | **6m 31s** | People who arrive use the thing properly. That is a strong number. |
| New users | 175 of 175 | Essentially nobody returns. |
| `/report` engagement | 4m 06s | The core output holds attention. |
| Subscribers in DB | **2** | The email ask is broken, not the traffic-to-report path. |
| Pro access requests | **1** | |

And the channel mix over 28 days:

| Channel | Sessions | Share | Engagement |
|---|---|---|---|
| **AI Assistant** | 25 | **49%** | **28s** |
| Organic Search | 18 | 35% | 1m 24s |
| Direct | 7 | 14% | |
| Organic Social | 1 | 2% | |

Two conclusions drive everything below.

**1. Answer engines are already the biggest channel and they bounce in 28 seconds.**
People arrive mid-question and leave without the answer. Being *in the index* is not
the same as being *in the answer*. The Sep 2026 site work (108 disclosure pages, the
glossary, FAQ on all 35 posts, a self-generating `llms.txt`) fixed the "can they find
an answer once here" half. This playbook is the other half: getting cited in the first
place.

**2. The funnel leaks at the ask, not at the tool.** 41 `form_start` → 59 reports, so
the intake works fine. Then 2 subscribers and 1 Pro request in four months. That is a
copy problem, not a traffic problem, and it is the cheapest fix on this page.

---

## Lane 1 — Be indexable by the engines that already send traffic

**~2 hours, one time. Do this first; everything else assumes it.**

Nothing here is optional and none of it is clever. It is the plumbing.

- [ ] **Google Search Console** — verify `saaksh.co`, submit `https://saaksh.co/sitemap.xml`.
- [ ] **Bing Webmaster Tools** — verify and submit the same sitemap. *Do not skip this
      because Bing traffic looks irrelevant.* ChatGPT's web search leans on Bing's index.
      This is the single highest-leverage 20 minutes for AEO on the page.
- [ ] **Request indexing** in GSC for the new hubs specifically: `/brsr`, `/glossary`,
      `/brsr/statistics`, and 3–4 of the `/brsr/<code>` pages so the pattern gets picked up.
- [ ] **Confirm `https://saaksh.co/llms.txt` resolves** after the next deploy. It moved
      from a static file to a generated route; if it 404s, the route did not ship.
- [ ] **Rich Results Test** (`search.google.com/test/rich-results`) on one blog post, one
      `/brsr/<code>` page and `/glossary`. Confirm FAQPage, BreadcrumbList and DefinedTerm parse.
- [ ] **Mark the four GA4 key events** — `report_generated`, `pro_access_requested`,
      `newsletter_subscribed`, `gig_submitted`. They have been firing since 2026-09-04.
      Until they are marked, every GA4 report reads "Key events: 0.00".
- [ ] **IndexNow** (optional, 15 min) — Bing/Yandex ping on publish. Only worth it if
      publishing cadence goes weekly or faster.

---

## Lane 2 — Get cited, not just crawled

**The highest-leverage lane, and the one almost nobody does. Ongoing, ~2 hours a week.**

Large language models retrieve heavily from Reddit and Quora, because that is where
real questions get real answers. A genuinely useful answer on a question thread can be
quoted back by ChatGPT for years. This is how you become the source rather than a
search result.

**The rule that makes it work, and breaks it if ignored:** answer the question
completely *in the comment itself*. The comment must be worth reading by someone who
never clicks. Then link once, at the end, only where it genuinely adds something.
Leading with a link, or answering thinly to drive a click, gets you downvoted, removed,
and — worse — not quoted.

- [ ] **r/ESGIndia launch post.** Draft has been sitting in the plan file since July.
      Post it. Position as already-shipped and free, not as a launch.
- [ ] **Comment on the competitor thread** (`reddit.com/r/ESGIndia/comments/1tgrkuo`) —
      someone is building the same thing. Be useful, not territorial.
- [ ] **r/IndianCA / r/CAIndia** — the most underexploited audience you have. CAs
      *perform BRSR Core assurance*. They ask exactly the questions `/brsr/<code>` and the
      audit-readiness tool answer, and nobody is answering them.
- [ ] **Answer 10 Reddit questions** from the appendix below.
- [ ] **Answer 10 Quora questions** from the appendix below. Quora ranks well in Google
      *and* is retrieved by assistants — it does double duty.
- [ ] **r/sustainability, r/climate, r/IndiaInvestments** — lower yield, but the BRSR
      investor angle plays on the last one.
- [ ] **Wikipedia** — the BRSR and Indian-ESG articles are thinly sourced. Add *citations
      to primary sources* (SEBI circulars, ICAI material) where claims are unsourced. Do
      **not** add links to Saaksh; that is spam and gets reverted. The gain is that a
      better-sourced article is what assistants read about BRSR.

---

## Lane 3 — Free directory listings

**One afternoon. Permanent backlinks; do it once and forget it.**

Each of these is a crawled, high-authority page pointing at `saaksh.co`, and several
are themselves retrieved by assistants answering "what software does X".

- [ ] G2 (free vendor listing)
- [ ] Capterra / GetApp / Software Advice (one Gartner submission covers all three)
- [ ] SaaSHub
- [ ] AlternativeTo — list against the Indian ESG SaaS incumbents
- [ ] Product Hunt — pick a Tuesday; the launch itself matters less than the permanent page
- [ ] Crunchbase
- [ ] F6S
- [ ] Startup India (national registry, strong domain, India-relevant)
- [ ] "There's An AI For That" / Toolify — only if you lead with the AI importer

Use the same one-paragraph description everywhere so the entity is consistent across
sources. Assistants build a picture of what Saaksh *is* from the agreement between
these listings.

---

## Lane 4 — LinkedIn

**3–4 posts a week. Priya's #1 channel and where the junior data-collection crowd is.**

- [ ] **Set the cadence and keep it.** Consistency beats quality here; three ordinary
      posts a week outperform one good post a month.
- [ ] **Use the Brief as the content engine.** Every item in the Saaksh Brief is a post:
      the regulatory change, one sentence on what it means for a consultant, one line of
      practical advice. That is the whole format.
- [ ] **Mine the 108 disclosure pages.** "The BRSR field everyone gets wrong: P3-E1"
      writes itself, and links to a real page.
- [ ] **Tag Priya** where relevant — she has agreed to endorse and amplify.
- [ ] **Comment more than you post.** 30 minutes a day commenting substantively on other
      people's ESG posts reaches more of the right people than posting does, and costs less.
- [ ] Benefit-led captions, not feature-led. "Stop hand-copying last year's BRSR"
      beats "now with AI document extraction".

---

## Lane 5 — Fix the ask

**The cheapest win on this page. 2 subscribers in 4 months is a copy problem.**

The evidence is in your own WhatsApp group: one offer of training material drew **nine
emails in nine minutes**. Saaksh's "subscribe for updates" drew two in four months.
The difference is not the audience. It is that one names a specific thing you receive.

- [ ] **Replace "subscribe for updates" everywhere** with a named artifact.
- [ ] **Pick the artifact.** Strongest candidates, in order:
      1. The **ISO 14001 / 45001 document register** as a filled checklist (the new blog
         post is the landing page for it, and it maps to BRSR evidence).
      2. The **BRSR response workbook** — all 108 fields, blank, ready to fill. Already
         built and downloadable from the Templates tab; it just is not being *offered* as
         a named thing.
      3. The **engagement timeline** — 12 or 20-week plan to a filed BRSR.
- [ ] **Gate the fee benchmark on contributing to it.** The pricing post asks
      practitioners to submit anonymously; everyone who does gets the aggregate. That is
      a reason to hand over an email that "updates" can never be.

---

## Lane 6 — The assets only you have

**Compounding. Slow to start, impossible for a competitor to copy.**

- [ ] **Seed `/jobs` freelance gigs** — 3–4, by hand. The board is live and empty, and an
      empty board teaches nobody anything.
- [ ] **Seed `/directory`** — 5–6 consultants who agree to be listed.
- [ ] ⚠️ **Do not scrape the WhatsApp group for either.** Those posts carry real names and
      phone numbers and were shared in a private space. Ask each poster individually.
- [ ] **Run the fee survey.** No public benchmark for Indian BRSR fees exists. If you
      publish the first one, you own the most-asked question in the market permanently,
      and it is the kind of original data assistants and journalists cite by name.
- [ ] **Run a webinar.** An EcoVadis session in this community drew 100 registrations off
      nothing more than a Google Form. Untried by Saaksh. One session on "what changed in
      BRSR for FY 2025-26" would do it.
- [ ] **Send the ECS approach.** `docs/ECS-proposal.html` has been written and committed
      since July; the WhatsApp intro to Mayuri Ganguly has not been sent. GTM is the
      bottleneck, not features.

---

## Appendix A — 20 questions to answer

Answer fully in the comment. Link once, at the end, only where the link genuinely adds
something. The right-hand column is where the link goes.

### Reddit (r/ESGIndia, r/IndianCA, r/CAIndia, r/sustainability, r/IndiaInvestments)

| # | Question shape | Link to |
|---|---|---|
| 1 | Is BRSR mandatory for my company / which companies must file? | `/blog/brsr-applicability-guide` |
| 2 | What is the difference between BRSR and BRSR Core? | `/blog/brsr-core-vs-essential` |
| 3 | How do I calculate Scope 2 emissions in India? | `/tools/ghg-calculator` |
| 4 | Which emission factor for Indian grid electricity? | `/glossary#cea-grid-factor` |
| 5 | Does CBAM affect Indian exporters, and how? | `/blog/cbam-2026-indian-exporters` |
| 6 | Is Scope 3 mandatory in India? | `/blog/scope-3-brsr-value-chain` |
| 7 | BRSR for an IT/services company — what is "not applicable"? | `/blog/brsr-for-it-services` |
| 8 | What is CCTS and does it apply to us? | `/blog/ccts-india-2025-26` |
| 9 | Who can perform BRSR Core assurance? | `/blog/brsr-core-assurance-fy2526` |
| 10 | What does BRSR field P6-E1 / P3-E1 actually ask for? | `/brsr/p6-e1`, `/brsr/p3-e1` |

### Quora (ESG, Sustainability, India, Corporate Governance spaces)

| # | Question shape | Link to |
|---|---|---|
| 11 | How much do ESG / BRSR consultants charge in India? | `/blog/brsr-consulting-fees-india` |
| 12 | How do I start a career in ESG in India? | `/jobs` |
| 13 | Is ESG a good career in India? | `/jobs`, `/directory` |
| 14 | What does a BRSR consultant actually do day to day? | `/blog/brsr-data-collection-guide` |
| 15 | GRI or BRSR — which should an Indian company report against? | `/blog/brsr-vs-gri` |
| 16 | How long does a BRSR filing take? | `/blog/brsr-data-collection-guide` |
| 17 | Do unlisted companies have to do BRSR? | `/blog/brsr-applicability-guide` |
| 18 | How do I get into carbon verification in India? | `/blog/ccts-accredited-carbon-verifier-india` |
| 19 | Can CSR funds be spent on carbon-credit projects? | `/blog/csr-funds-carbon-credits-india` |
| 20 | How do I collect ESG data from a client's team? | `/features/collect` |

Questions 11, 18 and 19 are the valuable ones: each is asked repeatedly in the
community and answered nowhere. Post those first.

---

## Appendix B — What was shipped on the site, 2026-09-08

Context for why the lanes above are now worth running. Before this, sending traffic at
the site would have leaked.

- **Canonical URLs** on every content route (previously 2 of 34); app surfaces set to
  noindex; `/start` and `/latest` given their own titles.
- **`llms.txt` generated from source data** — the hand-written one had drifted to 15 of
  30 posts. It now leads with direct answers to the eight most-asked questions.
- **`robots.txt` rewritten** — added `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`,
  `Perplexity-User`, `Applebot` and others; fixed a group-scoping bug.
- **Freshness signals** — `dateModified`, sitemap `lastModified`, visible "Updated" line,
  plus BreadcrumbList and publisher metadata on all posts.
- **FAQ on all 35 posts** (15 had none) — 117 Q&A pairs, all emitting FAQPage.
- **108 disclosure pages** at `/brsr/<code>` plus the `/brsr` hub — site went 90 → 206 pages.
- **`/glossary`** — 56 terms with DefinedTerm schema and per-term anchors.
- **`/brsr/statistics`** — every load-bearing figure with its source, emitted as a
  `Dataset` and explicitly free to quote.
- **5 new posts** answering questions the community asks and nothing on the web answers:
  consulting fees, CSR money vs carbon credits, GRI Requirement 9, the ISO 14001/45001
  document register, and CCTS verifier accreditation.

---

## What to do if you only have two hours

1. Bing Webmaster Tools + sitemap (20 min). Biggest AEO return of anything here.
2. Google Search Console + sitemap + request indexing on `/brsr` and `/glossary` (20 min).
3. Post questions 11, 18 and 19 answers to Quora (40 min). Zero competition.
4. Change the email ask to a named artifact (20 min).
5. Mark the four GA4 key events (10 min).
