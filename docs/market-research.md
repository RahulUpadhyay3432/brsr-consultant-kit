# Market research — Indian ESG/BRSR consultant pain points

External research (web + Reddit + LinkedIn + Indian ESG press, June 2026) to validate the
Saaksh roadmap with citable references. Read this alongside `docs/pro-strategy.md` (the
consultant-WhatsApp analysis) — this is the **external corroboration** of that internal read.

## Honest note on source quality (read first)
~26 sources across two research passes. The blunt finding: **first-person Indian-consultant
chatter online is sparse.** A Reddit-targeted search returned essentially nothing; Quora has
BRSR explainers but no rich "how hard is this job" threads. So evidence skews to **(a) vendor /
SaaS blogs** (describing the workflow to sell against it) and **(b) named-practitioner
LinkedIn**. These are reliable on the *workflow* pains and weaker as raw venting.

- **Workflow pains: strong + convergent.** Multiple independent sources name the same things.
- **Business pains (pricing, lead-gen, what a solo actually pays, willingness-to-pay): thin →
  mostly inference.** The online corpus doesn't contain this. **This is the biggest evidence gap
  and exactly what the webinar + 5–10 consultant interviews (Priya et al.) must settle.** Do not
  treat the monetization anchor as validated by this research.

---

## Pain points, ranked by evidence strength

### 1. Data collection from scattered client teams — the #1 time-sink (STRONG, convergent)
ESG data lives with different people, sites, and formats; pulling it together is an onerous,
repeated manual chase. BRSR is "1,200+ data points across departments / silos," consolidation
cycles run 3–6 months, with weak audit traceability.
- Ascentium — BRSR year-one challenges: "fragmented digital data … the onerous task of compiling
  and harmonizing data from diverse sources and formats." https://in.ascentium.com/blog/brsr-reporting-key-challenges-and-insights-from-indias-first-year-experience/
- breatheESG: data "spread across departments, geographies and tools"; BRSR "often took close to
  a year to pull together." https://www.breatheesg.com/resources/brsr-esg-reporting-india
- Pulsora / Novisto on ESG data-collection silos. https://www.pulsora.com/blog/esg-data-collection
- **→ Validates Collect (our paid centrepiece).**

### 2. Multi-framework juggling / duplication of effort (STRONG — named consultant)
Keeping BRSR, GRI, CDP, EcoVadis, SASB, TCFD consistent and non-contradictory.
- Nilesh Potdar (named ESG consultant), LinkedIn: "Ensuring consistency and alignment with …
  other ESG reporting frameworks such as CDP, EcoVadis, GRI, SASB, TCFD to avoid duplication of
  efforts and conflicting data." https://www.linkedin.com/pulse/you-do-really-need-consultant-brsr-disclosure-nilesh-potdar-rqbff
- **→ Validates the cross-framework export (shipped) + the mapping engine.**

### 3. Scope 3 / value-chain supplier data is nearly impossible (STRONG, and growing)
Suppliers (esp. MSMEs) don't track emissions, give unstandardised figures, and have no incentive
to cooperate — forcing generic proxy factors that are hard to defend.
- esg360.in — Scope 3 in reality: "Suppliers may provide basic consumption figures without
  standardisation … challenging to convert into reliable emission estimates." https://esg360.in/2026/04/27/scope-3-in-reality-the-most-misunderstood-and-misreported-part-of-esg/
- India Briefing: "Many Indian suppliers, particularly MSMEs, lack ESG reporting infrastructure
  and don't track GHG emissions or water consumption." https://www.india-briefing.com/news/brsr-reporting-in-india-key-changes-to-esg-disclosures-introduced-by-sebi-36261.html/
- **→ Validates the Scope 3 calculator (roadmap Phase 3) AND a "supplier-lite Collect" use-case.**

### 4. Emission-factor inconsistency + calculation defensibility (STRONG)
No single standardised factor set; wrong factor/unit = regulatory + reputational risk; every
number must survive assurance.
- Ascentium: "Inaccurate emission data … incorrect measurement units … regulatory and
  reputational risks." (same URL as #1)
- esg360.in: "limited standardization in emission factors and calculation methods … hinders
  comparability and accuracy."
- **→ Validates our cited factors + per-input attribution + GHG methodology statement.**

### 5. BRSR Core reasonable assurance raises the evidence/traceability bar (STRONG, rising)
Assurance is shifting from "is the number right?" to "show the **evidence trail and named data
owners** behind every KPI" — data governance, documentation, internal controls.
- EcoDrisil — what auditors will expect in 2026: auditors assess "data governance and
  traceability … clear data ownership across functions, complete documentation trails for KPIs,
  and internal controls." https://ecodrisil.com/brsr-core-and-esg-assurance-what-auditors-will-actually-expect-from-indian-companies-in-2026/
- Ascentium — Core assurance: "robust data management systems to withstand reasonable assurance
  scrutiny." https://in.ascentium.com/blog/brsr-core-assurance-in-india-scope-methodology-and-key-challenges/
- **→ We may be UNDER-selling Collect's attribution + evidence as an "assurance audit trail."**

### 6. Regulatory churn — SEBI keeps amending BRSR (MODERATE-STRONG)
Value-chain thresholds, "assessment or assurance" wording, green credits, shifting timelines —
keeping every client current is a tax.
- KPMG First Notes (Jan 2025); Vinod Kothari (value chain eased, Apr 2025); neoimpact (2025
  amendments). https://vinodkothari.com/2025/04/brsr-disclosures-for-value-chain-partners-eased-by-sebi/
- **→ Favours a tool that abstracts SEBI changes so the consultant doesn't re-learn the format.**

### 7. Excel-everything / long cycle times (MODERATE — vendor-sourced, discount)
Manual spreadsheet consolidation; ~a year per BRSR. Every source here is a SaaS vendor with an
incentive to dramatize Excel pain — direction matches #1, magnitude suspect.
- breatheESG ("close to a year"); Sustrack ("software cuts prep 50%+"). https://www.sustrack.com/brsr-reporting/

### 8. Materiality = template hunting + a defensible documented process (MODERATE)
Need a stakeholder-engagement process + a matrix that survives board review and assurance; no
standard template.
- Consultivo: materiality "documented suitable for internal approvals, board review, and
  assurance." https://consultivo.in/social-sustainability/esg-materiality-assessment-strategy-development-solutions/
- NSE published 38 sector-specific BRSR guides precisely because per-parameter guidance is hard
  to find. https://www.nseindia.com/static/resources/research-initiative-corporate-governance-integrated-guide-brsr
- **→ Validates our suggested-materiality shortlist + the "starting point, not a finished
  assessment" honesty.**

### 9. Skills/expertise gap fuels demand (MODERATE — a TAM tailwind, not a workflow pain)
- Ascentium: "75% of Indian companies plan to hire external consultants for BRSR Core."

### 10. CBAM is a separate, harder, installation-level beast (MODERATE — adjacent module)
EU CBAM wants installation-level embedded carbon (not Indian averages); EU-accredited verifiers
scarce in India; UK CBAM (2027) work isn't reusable.
- EnCarbonSys CBAM 2026 guide. https://encarbonsys.com/cbam-blog/cbam-india-exporters-guide-2026.html
- **→ Confirms CBAM/CCTS are real distinct modules; CBAM is a deep build (do readiness first).**

### Business / commercial pains — THIN (flag as inference)
Pricing, scoping, lead-gen, the solo P&L: almost no first-person sourced evidence. No public
benchmark for what a solo charges per BRSR engagement or how they win clients. **This is the
biggest gap → primary research only.** Note the competing narrative "you don't really need a
consultant for BRSR" (Potdar) — a positioning question (our buyer vs an in-house self-serve buyer).

---

## Existing-tool gap landscape (validates freemium + affordable positioning)
Players: Updapt, Lythouse, Accacia (real-estate niche), The Sustainability Cloud, Credibl,
Newtral AI, GroundESG, SAMESG, 4Seer (India); Workiva, Watershed, Greenly, Salesforce Net Zero
Cloud (global). Default for SMEs + solo consultants: **Excel**.

1. **Price locks out SMEs + solo consultants (the #1 gap).** Indian ESG software ≈ ₹2L–8L/yr
   (mid-market) to ₹15L–60L+/yr (enterprise) + ₹1L–5L implementation; GreenStitch implementation
   alone $10k–$100k+. https://onestopesg.com/esg-resources/best-sustainability-management-software
2. **Pricing opacity** — almost all consultation-gated (only Salesforce discloses). https://netzerocompare.com/software/accacia
3. **Enterprise-only / overkill for the long tail** — the under-1000 segment is told to use a
   consultant before a full licence; spreadsheets collapse, enterprise tools too heavy. https://www.orennow.com/blog/software-vs-consultants
4. **Niche gaps** (Accacia = real-estate only) and **thin independent reviews** (sparse G2/Capterra
   depth → low-trust market a transparent tool can win).
- **→ The white space is affordable, transparent, data-collection-first tooling for the long tail
  that enterprise platforms price out — exactly Saaksh's freemium + Collect.**

---

## Regulatory drivers — dated timeline (the demand tailwind)
- **BRSR base:** FY2022-23 top-1000 listed file BRSR.
- **BRSR Core reasonable assurance glide path** (SEBI circular 12 Jul 2023, **unchanged** by the
  28 Mar 2025 circular): FY23-24 top 150 · FY24-25 top 250 · **FY25-26 top 500** · FY26-27 top
  1,000. The Mar-2025 circular only changed "assurance" → "**assessment OR assurance**." https://www.sebi.gov.in/legal/circulars/jul-2023/brsr-core-framework-for-assurance-and-esg-disclosures-for-value-chain_73854.html
- **BRSR value-chain disclosure:** deferred (SEBI Board 18 Dec 2024). FY25-26 voluntary for top
  250; **FY26-27 assessment/assurance**. Scope narrowed to partners ≥2% of purchases/sales, capped
  at 75%. https://reporting.academy/en/pages/sebi-postpones-mandatory-esg-disclosures-for-value-chain-to-2026/
- **Scope 3:** not in mandatory Core (Core = Scope 1+2); a leadership/voluntary indicator; expected
  via the value-chain track; **no firm mandate date.**
- **CBAM (EU), for Indian exporters:** transitional 1 Oct 2023–31 Dec 2025; **definitive period 1
  Jan 2026** (cement, iron & steel, aluminium, fertilisers, electricity, hydrogen); mandatory
  third-party verification from 2026; certificate sales 1 Feb 2027, first surrender 30 Sep 2027;
  payable share 2.5% (2026) → 100% (2034); penalty €100/excess t. **Omnibus** added a 50 t/yr
  de-minimis (exempts small importers). https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en · https://icapcarbonaction.com/en/news/eu-adopts-simplifications-cbam-rules-ahead-compliance-phase-starting-2026
- **India CCTS** (BEE/Grid-India): 9 GEI-target sectors (Aluminium, Cement, Chlor-Alkali, Pulp &
  Paper, Iron & Steel, Fertiliser, Petrochemicals, Petroleum refinery, Textile); baseline FY23-24;
  compliance FY25-26 & FY26-27; targets notified Oct 2025 (4 sectors) + Jan 2026 (3) = **7 sectors,
  ~490 obligated entities** (~740 once all 9); first CCC trading ~mid-2026. https://icapcarbonaction.com/en/news/compliance-obligations-under-indias-carbon-credit-trading-scheme-enter-force-seven-sectors

---

## New angles for the roadmap (validated here, not yet emphasised)
1. **Headline the assurance audit trail.** Collect already captures who-submitted-what + evidence
   + cited factors. Reframe that as an "assurance-readiness audit trail / data-ownership ledger" —
   it's precisely the rising 2026 buyer pain (#5), and we currently bury it as a draft footnote.
2. **Supplier-lite Collect (value-chain).** A second, simpler submission flow for the client's
   2%+ value-chain partners (MSMEs with no systems). Squarely on the FY26-27 mandatory-assured
   tailwind. Natural Collect extension.
3. **Multi-year repeatability = retention.** "Clone last year's campaign" (pre-filled owners +
   fields, prior-year values) — the recurring re-chase is the can't-stop-using-it lever. The free
   tool's "Last year detection" already gestures at this.
4. **Unit / sanity validation at data entry.** Flag implausible values + enforce units — cheap,
   directly lowers the assurance unit-error risk named in #4. Not yet on the list.

## Bottom line
- **Well-validated:** scattered data collection, cited factors + methodology, evidence/attribution
  for assurance, cross-framework mapping, honest materiality. The roadmap targets real, repeated
  pains.
- **Validated but under-sold:** the assurance audit-trail angle; multi-year repeatability.
- **Unproven → needs interviews:** all *business* pains (pricing, lead-gen, willingness-to-pay).
  The webinar (27 Jun) + first manual customers are the only way to de-risk monetization.
