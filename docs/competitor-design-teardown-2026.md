# Competitor website design teardown (June 2026)

A visual design study of 10 competitor homepages (desktop + mobile), captured with a
real browser. The earlier `docs/market-research-2026-competitive.md` covered *features
and positioning* (from page text); this covers **UI/UX and layout** (from screenshots) to
inform Saaksh's own homepage (`src/components/LandingPage.tsx`).

Reference screenshots live in `docs/competitor-design/` (`<site>-desktop.jpeg` /
`<site>-mobile.jpeg`). Folder is ~18 MB and removable once we've absorbed the lessons.

> Capture notes: **Lythouse** desktop failed to render (a ~31,800px lazy-loading SPA that
> painted as loading placeholders) — excluded from visual analysis; rely on the feature
> research for it. **Oren** had several lazy-loaded sections render blank. Greenly/Persefoni/
> Sweep/breatheESG showed cookie banners over part of the hero (normal).

---

## Per-site notes (the one move worth remembering)

- **Watershed** (`watershed-*`): light editorial hero, short 2-line headline + a real
  product-UI panel as the hero visual; **customer logo wall (FedEx, Dell, Shopify,
  Walmart, BlackRock) immediately under the hero**; alternating light/dark full-bleed
  sections with big product screenshots; Verdantix Leader mention; gradient final CTA.
- **Greenly** (`greenly-*`): card feature rows (one image card + text cards); **dark stat
  section**; product **chat-UI screenshots**; **G2 Leader badge**; "Greenly vs Watershed /
  vs Persefoni" SEO comparison pages in the footer. (Literal-green palette = the cliché.)
- **Sweep** (`sweep-*`): the most *layered social proof* — logo wall + **Verdantix Leader
  card** + case-study cards + partner-logo cards, plus a 16-cell **"solutions for every
  industry" grid**. Real photography on benefit tiles. Blue accent (close to ours).
- **Persefoni** (`persefoni-*`): warm **coral/peach gradient** palette (notably NOT green —
  near our ember); a **massive "1000+ companies" logo wall** under the hero; alternating
  feature rows pairing copy with product screenshots + branded gradient blocks; **Forrester
  Leader** badge; testimonial quote card. Premium, airy.
- **Plan A** (`plana-*`): product screenshots embedded *inside* feature cards; an explicit
  **certification-badge row** (GHG Protocol, ISO, B-Corp, Climate Pledge); real photography
  with product-UI overlays; **advisory-board credibility** section; stat band; green CTA.
- **Newtral** (`newtral-*`) — THE standout, and our direct BRSR threat: **all-dark
  terminal/AI aesthetic**, huge **two-tone headline** ("Compliance, on Autopilot." white +
  muted gray), mono eyebrows, subtle grid bg; **real product screenshots** (a "BRSR FY26
  data extraction" table with status pills); "Six jobs. One agent." punchy feature cards;
  testimonial quote + cards; dark stat band; **"SOC 2 Type II · ISO 27001 · status:
  operational" in the footer.** Linear/Vercel-class craft.
- **Updapt** (`updapt-*`): "Trusted by clients worldwide" logo wall (Cipla, Sun Pharma,
  HCLTech); a dedicated **Security section** (AWS diagram + ISO/GDPR badges); **investor
  (Accenture) + partnership (UN, WWF, PRI) logos**; named Tata Power testimonial with
  photo. Solid credibility-stacking; **isometric 3D illustrations feel dated**.
- **Oren** (`oren-*`): dark-teal photographic hero + product dashboard shot; "Your ESG data
  lives in spreadsheets" framing; very tall/enterprise; dark testimonial cards. Execution
  looser than the global set.
- **breatheESG** (`breatheesg-*`): real product screenshots in benefit cards; dark stat
  band (50% / 1000+ / Unlimited); testimonial; integration diagram (SAP/Oracle → product);
  an **FAQ accordion**; dark final CTA. Green accent, clean.
- **Lythouse**: capture failed (see note above).

---

## Cross-cutting patterns worth stealing (recur across the best sites)

1. **A customer logo wall immediately under the hero.** *Every single site* does this —
   it's the #1 universal trust move. Saaksh has **none**.
2. **Real product-UI screenshots as the hero visual and throughout** — actual dashboards,
   tables, charts, often in browser/device chrome. Concrete > abstract. Saaksh uses a live
   HTML mock panel (good) but the rest of the page is mostly text/abstract.
3. **Hero formula:** short bold headline (often two-tone or one highlighted word) + 1-2
   line sub + exactly one primary + one secondary CTA. Saaksh already nails this.
4. **Section rhythm with ≥1 dark full-bleed section + a dark final CTA.** Saaksh has the
   dark "AI" section + forest CTA — already good.
5. **A big-number stat band.** Saaksh has one — good.
6. **Layered social proof, stacked:** logo wall → named testimonials (photo + role +
   company) → analyst badges (Verdantix / Forrester / G2) → certification badges (ISO /
   SOC 2 / GHG Protocol) → investor/partner logos. Saaksh has the founder note only.
7. **Named testimonials** with face, name, title, company (not anonymous). Saaksh: none yet.
8. **Trust/security signalled explicitly** — Plan A's cert row, Updapt's security section,
   Newtral's "SOC 2 · ISO · status operational" footer. Saaksh now leads on *transparency*
   (the trust strip + /privacy /security /methodology pages) but shows no badges/logos.
9. **FAQ accordion** near the bottom (breatheESG) to pre-answer buyer objections.

## What NOT to copy (protect Saaksh's identity)

- **Newtral's all-dark theme** — gorgeous, but chasing it would erase our calm, light,
  editorial Evergreen identity. Our light/serif look is a *differentiator* against the
  dark-AI monoculture; keep it. Borrow Newtral's *structure* (real screenshots, two-tone
  headline, footer trust line), not its skin.
- **Literal green** (Greenly / Plan A / breatheESG) — we deliberately moved to blue + coral;
  it's more distinctive. Persefoni proves warm-coral can be premium — that plays to our ember.
- **Isometric 3D illustrations** (Updapt) — dated; avoid.
- **Enterprise "mega-everything" clutter** (Oren) — our calm/affordable positioning is an
  asset; don't bury it under 12,000px of sections.
- **Fake or aspirational badges.** We can't claim Verdantix/SOC 2/ISO yet — showing them
  would be the amateur tell the research flagged. Put "on the roadmap" honesty on /security,
  not fake badges on the homepage.

---

## Saaksh-specific recommendations (mapped to `LandingPage.tsx`), prioritized

The honest headline: our **biggest gap vs all 10 is social proof** (logos + testimonials +
badges) — and that's mostly a *content/asset* problem (we need real customers and quotes),
not a design problem. The design moves we can make now:

**HIGH**
1. **A named testimonial block, placed high** (right after the trust strip or hero). Use
   **Priya** (the validating consultant) with photo + name + role + firm. Every competitor
   has this; we have only the founder note. *Blocked on getting her quote + a headshot —
   build the slot now, fill when ready.*
2. **Richer real product screenshots in the feature sections.** Today our hero
   `ReadinessPanel` is a nice live mock, but the "What BRSR takes" / Action-plan / Collect
   sections are largely text. Add 1-3 actual screenshots (the Action Plan, the Collect
   workspace, a calculator) framed in light browser chrome — the single most common move
   across all 10. We can self-screenshot our own product (Playwright) and embed.

**MEDIUM**
3. **A "Built for" / proof row near the top** that's honest given we have no client logos
   yet: e.g. frame the ~150 companies in our autocomplete as "Built for BRSR filers like
   Tata Steel, Infosys, …" as *coverage* proof (not implying they're customers), OR lead
   with the Priya testimonial as the single proof point. Avoid a fake logo wall.
4. **Keep elevating the trust pages we already have** — the new trust strip is the right
   instinct; consider a compact "Privacy-first · Cited · On-device" treatment that stays
   visible (we partly did this). Honest ISO-27001-coming lives on /security only.

**LOW**
5. **FAQ accordion** before the final CTA (breatheESG pattern): "Is the readiness tool
   really free?", "Does my client's data leave my browser?", "How is the AI kept from
   inventing numbers?", "What does Collect cost?" — pre-answers the objections, reinforces
   trust, and is cheap to build (we have an accordion pattern in the report Templates tab).

**Keep (our edge the competitors lack):** on-device/privacy, cited/no-fabrication,
consultant-as-user, genuinely free entry. We already lead with these; don't trade them for
enterprise gloss.

---

## Suggested next step (separate, approvable)

A focused homepage pass implementing the HIGH items: (a) a testimonial slot (Priya), and
(b) 2-3 real product screenshots in the feature sections — both inside the existing
`LandingPage.tsx` structure and on-brand. The MEDIUM/LOW items can follow. This teardown is
analysis only; no homepage code was changed.
