import type { FaqItem } from "@/lib/tool-faq";

// FAQ blocks for the free tool pages, one entry per /tools/* route.
//
// Why these live in one file: the questions are the informational searches
// people make BEFORE they are ready to use anything ("is BRSR mandatory for
// my company", "which CEA emission factor do I use", "why did my BRSR XBRL
// get rejected"). We already answered that class of question across 35 blog
// posts and the 108 disclosure pages, but the tool pages — the ones with
// actual intent — carried an FAQ on exactly one of ten. Keeping them together
// makes the coverage checkable by a test instead of by memory.
//
// AUTHORING RULE, enforced by tool-faqs.test.ts: every answer must be true of
// the page it sits on and derivable from what that page already says or
// computes. No answer may promise a capability to win a query. Where a
// question has a regulatory answer, it comes from the circular, not from a
// competitor's description of the circular.

export const TOOL_FAQS: Record<string, FaqItem[]> = {
  "brsr-applicability": [
    {
      q: "Is BRSR mandatory for my company?",
      a: "BRSR is mandatory for the top 1,000 listed entities by market capitalisation, and has been since FY 2022-23. It is not mandatory for an unlisted company simply because it supplies a listed one — a supplier may be asked for data by its customer as part of that customer's value-chain disclosure, which is a contractual ask, not a filing obligation of its own. Answer the three questions on this page for a cited verdict on your client's specific position.",
    },
    {
      q: "When does BRSR Core assurance start applying?",
      a: "SEBI's glide path phases reasonable assurance of the BRSR Core attributes by market-cap cohort: the top 150 listed entities from FY 2023-24, the top 250 from FY 2024-25, the top 500 from FY 2025-26 and the top 1,000 from FY 2026-27. The 28 March 2025 circular allows an assessment or an assurance depending on the cohort and year, so confirm which applies before scoping the engagement.",
    },
    {
      q: "Is value-chain disclosure mandatory?",
      a: "No. Value-chain ESG disclosure is voluntary for the top 250 listed entities from FY 2025-26. It is a common misreading to fold it into the BRSR Core assurance glide path, which is a separate requirement on a separate timetable. This tool gives the financial year each obligation actually starts.",
    },
    {
      q: "Does this tool store my client's details?",
      a: "No. It runs entirely in your browser — the three answers are never sent anywhere and nothing is stored. There is no signup.",
    },
    {
      q: "Is this legal advice on BRSR applicability?",
      a: "No. It is a readiness check that cites the SEBI circular behind each verdict so you can read the source yourself. Scope conclusions for a filing should be confirmed against the current circular and, where the position is marginal, with counsel.",
    },
  ],

  "ghg-calculator": [
    {
      q: "Which emission factor should I use for grid electricity in India?",
      a: "The Central Electricity Authority's CO2 Baseline Database for the Indian power sector, using the location-based approach. This calculator uses Version 21.0, which is 0.710 kgCO₂ per kWh and applies to FY 2024-25. The version matters as much as the number: carrying forward an older factor is one of the most common findings raised on an Indian Scope 2 figure, because the arithmetic is right and the basis is stale.",
    },
    {
      q: "What is the difference between Scope 1 and Scope 2 for BRSR?",
      a: "Scope 1 is emissions from sources the company owns or controls — diesel in generators, fuel in company vehicles, gas in boilers, and refrigerant leakage. Scope 2 is emissions from electricity the company buys. BRSR Principle 6 asks for both, and both fall inside the BRSR Core attributes, so both need to be defensible.",
    },
    {
      q: "Where do the fuel factors come from?",
      a: "The IPCC 2006 Guidelines for National Greenhouse Gas Inventories, Volume 2 (Energy), combined with the GHG Protocol Corporate Standard, using IPCC AR5 100-year global warming potentials. Each fuel also carries its net calorific value, because BRSR asks for energy consumption in joules alongside emissions. Every factor and its citation is listed on the emission factor database page.",
    },
    {
      q: "Does my data leave my browser?",
      a: "No. This calculator runs on your device: the activity figures you type are never sent anywhere, never stored, and there is no signup or account. That matters because the inputs are a client's energy and fuel consumption, which most consultants are contractually barred from putting into a third-party system without permission.",
    },
    {
      q: "Can I use this figure in an assured BRSR filing?",
      a: "You can use it to assemble and sanity-check the figure, but an assured disclosure needs the underlying records — meter readings, fuel invoices, refrigerant logs — not a calculator output. The value here is that the factors are cited and versioned, so the basis of the number is defensible when an assurer asks what it used.",
    },
  ],

  "scope3-calculator": [
    {
      q: "Is Scope 3 mandatory under BRSR?",
      a: "No. Scope 3 GHG emissions sit in Principle 6 as a Leadership indicator, which makes them voluntary, and they are not among the BRSR Core attributes under reasonable assurance. Many companies report them anyway because customers, investors and frameworks such as CDP ask for them.",
    },
    {
      q: "Which Scope 3 categories does this cover?",
      a: "The categories that are computable from physical activity data: Category 4 and 9 (upstream and downstream transportation), Category 5 (waste generated in operations), Category 6 (business travel) and Category 7 (employee commuting). Category 1, purchased goods and services, is recorded from supplier-reported figures rather than estimated, because a spend-based factor for Indian purchasing would be invented rather than cited.",
    },
    {
      q: "Where do the Scope 3 factors come from?",
      a: "The UK Government (DEFRA/DESNZ) Greenhouse Gas Reporting Conversion Factors 2024, applied under the GHG Protocol Corporate Value Chain (Scope 3) Standard. Air travel and air freight factors include radiative forcing, and freight factors are combined direct plus well-to-tank, which is the full value-chain basis Scope 3 expects. Every line names the DEFRA entry it came from.",
    },
    {
      q: "Why use UK factors for an Indian company?",
      a: "Because India publishes no equivalent national conversion-factor set for travel, freight and waste, and DEFRA's is the set most widely used and most clearly documented. That is a limitation to state in the disclosure rather than hide: the basis is named on every line so a reviewer can see exactly which factor was applied.",
    },
    {
      q: "Is this a full Scope 3 inventory?",
      a: "No — it is a screening estimate. It covers the categories derivable from activity data you are likely to have, which is the right first pass, and it deliberately does not model the categories that would need assumptions we cannot cite.",
    },
  ],

  "emission-factors": [
    {
      q: "What is the current CEA grid emission factor for India?",
      a: "Version 21.0 of the Central Electricity Authority's CO2 Baseline Database gives 0.710 kgCO₂ per kWh, applicable to FY 2024-25, on the location-based approach. Quote the version with the number — a factor without its vintage cannot be assured, and an older value such as 0.716 is a recognised finding when it is carried forward into a later year.",
    },
    {
      q: "Are these emission factors free to use and quote?",
      a: "Yes. Every row carries its primary source — IPCC, CEA, DEFRA or the IPCC AR5 GWP table — so you can cite the original rather than us, and the whole set downloads as a CSV. We ask only that you carry the version or vintage alongside the figure.",
    },
    {
      q: "How often do these factors change?",
      a: "The CEA grid factor is revised roughly annually, and the DEFRA conversion factors are published annually. That is precisely why each row states its version and the period it applies to: a workbook that hardcoded a factor two years ago still computes cleanly, it just computes on a basis nobody can cite now.",
    },
    {
      q: "Why are there only a few dozen factors and not thousands?",
      a: "Because these are the exact factors the Saaksh calculators compute with, not a padded reference library. If a factor is not here, it is not in our tools either. We would rather publish a narrow set we can defend than a large one we have not checked.",
    },
    {
      q: "What factor should I use for refrigerant leakage?",
      a: "A global warming potential, not a combustion factor: multiply the kilograms leaked or topped up during the year by the gas's 100-year GWP from IPCC AR5. The common refrigerants and SF₆ in switchgear are listed here. Fugitive emissions are the Scope 1 line most often omitted entirely, and an assurer looks for them.",
    },
  ],

  "audit-readiness": [
    {
      q: "What is BRSR Core?",
      a: "BRSR Core is the subset of BRSR attributes SEBI designated for assurance, introduced by its circular of 12 July 2023. Those attributes carry an assurance or assessment requirement phased by market-cap cohort, which is why they are the ones to prepare evidence for first.",
    },
    {
      q: "What evidence does a BRSR Core assurer actually ask for?",
      a: "Source documents, not spreadsheets: meter readings and utility bills for energy and water, fuel invoices and logs for Scope 1, payroll and HR records for the Principle 3 figures, consent and monitoring reports for pollution data, and board or committee minutes for the governance disclosures. This page lists the expected evidence per KPI, grouped by principle, with where each item usually lives.",
    },
    {
      q: "Is it an assurance or an assessment?",
      a: "Either, depending on the client's cohort and year — SEBI's 28 March 2025 circular allows an assessment or an assurance rather than requiring reasonable assurance in every case. Confirm which applies before scoping, because the evidence expectations differ in depth.",
    },
    {
      q: "Is this the official SEBI evidence list?",
      a: "No. It is an illustrative, consultant-facing checklist to prepare with. The assurance or assessment provider's own evidence request governs the engagement, and this page says so.",
    },
    {
      q: "Can I share this checklist with my client?",
      a: "Yes — download the whole thing as a CSV and hand it over. Giving the client one consolidated list up front is the single biggest reason an assurance engagement runs shorter.",
    },
  ],

  "xbrl-preflight": [
    {
      q: "Why did my BRSR XBRL filing get rejected?",
      a: "Most rejections are human data-entry errors rather than taxonomy problems. The recurring ones are figures entered in lakhs or crores where the taxonomy expects absolute rupees, percentages entered as whole numbers where a decimal is expected, blanks where a zero is required, mismatched totals between related fields, and dates outside the reporting period. This page lists the seven that most often fail validation, each cited.",
    },
    {
      q: "Does BRSR XBRL need figures in rupees, lakhs or crores?",
      a: "Absolute rupees. A turnover of ₹450 crore is filed as 4500000000, not 450. This is the single most common scale error, and the converter on this page turns a lakh or crore figure into the value the taxonomy expects.",
    },
    {
      q: "Is this a full XBRL taxonomy validator?",
      a: "No, and it does not claim to be. It catches the common human errors before you upload to the BSE or NSE utility. The exchange's own validator remains the authority on whether an instance document is accepted.",
    },
    {
      q: "Do I need taxonomy software to use this?",
      a: "No. It runs in your browser with nothing to install and nothing uploaded. Use it alongside whatever tool prepares your instance document, right before the exchange upload.",
    },
  ],

  "wellbeing-schedule": [
    {
      q: "How is employee well-being spending calculated for BRSR?",
      a: "BRSR Principle 3 asks for spending on employee well-being as a percentage of revenue, and it is a BRSR Core attribute, so the number has to come out of the audited accounts rather than an estimate. This page maps each of the 11 welfare heads BRSR recognises to the P&L or ledger line it sits in, so the figure is assembled from the books.",
    },
    {
      q: "Which costs count as employee well-being?",
      a: "The heads BRSR names — health insurance, accident insurance, maternity and paternity benefits, day-care facilities, and the statutory welfare items — each of which corresponds to a specific ledger line. The mappings on this page are cited to the SEBI BRSR format and to the underlying labour law, so the inclusion of each head is defensible.",
    },
    {
      q: "Is well-being spend assured under BRSR Core?",
      a: "Yes, it is among the BRSR Core attributes, which is why it should be traceable to the audited accounts. A figure assembled from an HR estimate rather than the ledger is the kind of number that does not survive review.",
    },
    {
      q: "Can I download the schedule?",
      a: "Yes — a ready-to-fill schedule with a total and a prior-year column, as a CSV. It maps welfare heads to ledger lines only; it does not convert spend into emissions.",
    },
  ],

  "materiality": [
    {
      q: "How do I do a materiality assessment for BRSR?",
      a: "A BRSR-compliant materiality assessment needs a stakeholder-engagement process: identify the stakeholder groups, engage them, and reach a determination that reflects both business impact and stakeholder concern. A topic list cannot substitute for that. This tool gives you the industry-typical starting topics to take into that process, which is the step before the assessment, not the assessment itself.",
    },
    {
      q: "Is this a finished materiality assessment?",
      a: "No, and it deliberately does not claim to be. It is a shortlist — a working selection of topics to carry into a stakeholder process. Presenting a suggested topic list as a determination is a misstatement a reviewer will pick up.",
    },
    {
      q: "Which ESG topics are material for my industry?",
      a: "It depends on the sector, and the starting sets here are organised by industry and grouped into Environment, Social and Governance, with the BRSR principles each topic maps to and a note on why it typically matters. Pick the industry closest to your client, then shortlist and export.",
    },
    {
      q: "Can I export the shortlist?",
      a: "Yes, as a CSV, to seed the stakeholder process or a client workshop. Everything runs on your device and nothing is stored.",
    },
  ],

  "ppp-intensity": [
    {
      q: "Why adjust emissions intensity for purchasing power parity?",
      a: "A BRSR intensity is reported per rupee of turnover, which makes an Indian company's figure look different from a global peer's for reasons that have nothing to do with emissions — the same physical output converts to a different revenue figure at market exchange rates. Restating turnover on a PPP basis puts the two on a like-for-like footing.",
    },
    {
      q: "Does this replace the rupee intensity I file under BRSR?",
      a: "No. BRSR requires the rupee figure, and this sits alongside it as an optional comparison view, typically for a parent group or an investor question. Filing a PPP-adjusted figure in place of the rupee one would be a departure from the format.",
    },
    {
      q: "Where does the PPP conversion factor come from?",
      a: "The World Bank's PPP conversion factor for India, pre-filled and cited on the page and editable if you need a different year. The year is shown with the factor, because a PPP factor without its vintage is as unciteable as an emission factor without its version.",
    },
    {
      q: "Can I use this for CDP or an ESG rating submission?",
      a: "It is a useful comparison for those conversations, but check each framework's own instruction first — several specify the exact turnover basis they want. Use it to explain a gap to a peer, not to restate a figure a framework has defined.",
    },
  ],
};

export const TOOL_FAQ_SLUGS = Object.keys(TOOL_FAQS);
