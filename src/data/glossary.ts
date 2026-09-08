// The vocabulary of Indian sustainability reporting, defined once.
//
// Definitional queries are the shape answer engines retrieve most heavily, and
// the terms below are the ones an Indian ESG consultant actually has to explain
// to a client every week. Each definition is written to stand alone when quoted
// out of context: it names the regulator, the number and the year rather than
// gesturing at them.
//
// Facts here are held to the same standard as the rest of the knowledge base.
// Where a value has a version (the CEA grid factor, the ESRS after Omnibus),
// the version is stated. Where the honest answer is "read the circular", the
// definition says so rather than inventing a threshold.

export type GlossaryCategory =
  | "BRSR"
  | "Assurance"
  | "GHG & carbon"
  | "Carbon markets"
  | "Indian compliance"
  | "Global frameworks";

export interface GlossaryTerm {
  /** URL fragment, e.g. "brsr-core". */
  id: string;
  term: string;
  /** Expansion or common alternative name. */
  aka?: string;
  category: GlossaryCategory;
  /** Two to four sentences. Must stand alone when quoted. */
  definition: string;
  /** Related pages on Saaksh. */
  links?: { label: string; href: string }[];
  /** Other glossary term ids worth reading next. */
  see?: string[];
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  "BRSR",
  "Assurance",
  "GHG & carbon",
  "Carbon markets",
  "Indian compliance",
  "Global frameworks",
];

export const GLOSSARY: GlossaryTerm[] = [
  // ── BRSR ────────────────────────────────────────────────────────────────
  {
    id: "brsr",
    term: "BRSR",
    aka: "Business Responsibility and Sustainability Report",
    category: "BRSR",
    definition:
      "The sustainability disclosure format SEBI mandates for India's top 1000 listed companies by market capitalisation, filed as part of the annual report rather than as a separate document. It has been mandatory since FY 2022-23, replacing the older Business Responsibility Report that had been required since 2012. The format has three sections: A for general disclosures, B for management and process, and C for principle-wise performance across nine principles.",
    links: [
      { label: "All 108 Section C disclosures", href: "/brsr" },
      { label: "BRSR applicability guide", href: "/blog/brsr-applicability-guide" },
    ],
    see: ["section-c", "brsr-core", "ngrbc"],
  },
  {
    id: "brsr-core",
    term: "BRSR Core",
    category: "BRSR",
    definition:
      "A curated sub-set of 42 Key Performance Indicators drawn from the full BRSR format, which SEBI identified as the most material and quantifiable and which require independent third-party verification. Reasonable assurance on BRSR Core became mandatory for the top 500 listed companies from FY 2025-26, and applies to the top 1000 from FY 2026-27. Companies do not file a separate Core report: the 42 KPIs sit inside the normal BRSR and attract their own assurance statement.",
    links: [
      { label: "BRSR Core assurance in FY 2025-26", href: "/blog/brsr-core-assurance-fy2526" },
      { label: "Audit-readiness checklist", href: "/tools/audit-readiness" },
    ],
    see: ["brsr-essential", "reasonable-assurance", "isf"],
  },
  {
    id: "brsr-essential",
    term: "BRSR Essential",
    category: "BRSR",
    definition:
      "The full BRSR reporting format as prescribed by SEBI, covering Sections A, B and C. Every company to which BRSR applies files BRSR Essential. No assurance is mandated for Essential-only filers, though a company may arrange limited assurance voluntarily. BRSR Core is the 42-KPI subset of Essential that must be assured.",
    see: ["brsr-core", "essential-indicator"],
  },
  {
    id: "section-c",
    term: "Section C",
    aka: "Principle-wise performance disclosures",
    category: "BRSR",
    definition:
      "The part of BRSR carrying the principle-wise performance data, and where almost all of the data-collection work sits. It contains 108 indicators across Principles 1 to 9: 68 Essential and 40 Leadership. Section A adds 26 general datapoints and Section B adds 12 on management and process.",
    links: [{ label: "Every Section C disclosure, explained", href: "/brsr" }],
    see: ["essential-indicator", "leadership-indicator"],
  },
  {
    id: "essential-indicator",
    term: "Essential indicator",
    category: "BRSR",
    definition:
      "A BRSR Section C disclosure that is mandatory for every filer. There are 68 of them across the nine principles, and they carry the codes P1-E1 through P9-E-something depending on the principle. All 42 BRSR Core KPIs are drawn from the Essential set.",
    see: ["leadership-indicator", "brsr-core"],
  },
  {
    id: "leadership-indicator",
    term: "Leadership indicator",
    category: "BRSR",
    definition:
      "A voluntary BRSR Section C disclosure, coded with an L rather than an E. There are 40 of them. They apply to companies that have been filing BRSR for three or more years, or that are among the top 1000 listed companies; a first-time filer can leave them out. Scope 3 emissions (P6-L2) is a Leadership indicator, which is why it is voluntary under BRSR.",
    see: ["essential-indicator", "scope-3"],
  },
  {
    id: "ngrbc",
    term: "NGRBC",
    aka: "National Guidelines on Responsible Business Conduct",
    category: "BRSR",
    definition:
      "The nine principles issued by India's Ministry of Corporate Affairs that BRSR is structured around: integrity and ethics (P1), sustainable and safe products (P2), employee wellbeing (P3), stakeholder responsiveness (P4), human rights (P5), environment (P6), responsible policy advocacy (P7), inclusive growth (P8), and consumer value (P9). BRSR Section C reports performance against each in turn.",
    links: [{ label: "The nine principles, disclosure by disclosure", href: "/brsr" }],
  },
  {
    id: "value-chain-disclosure",
    term: "Value chain disclosure",
    category: "BRSR",
    definition:
      "BRSR reporting extended to a listed company's significant suppliers and customers. Partners are in scope if they individually account for 2% or more of total purchases or sales, with aggregate coverage capped at 75%, applying whichever criterion yields fewer partners. SEBI's March 2025 circular made it voluntary for FY 2025-26 and mandatory from FY 2026-27, and in-scope partners disclose against the 42 BRSR Core KPIs rather than the full 108.",
    links: [{ label: "BRSR value chain disclosure", href: "/blog/brsr-value-chain-disclosure" }],
    see: ["brsr-core"],
  },
  {
    id: "materiality-assessment",
    term: "Materiality assessment",
    category: "BRSR",
    definition:
      "The process of identifying which ESG topics matter most to a company and its stakeholders. BRSR does not prescribe a methodology but does require evidence of a process: Principle 4 asks companies to identify material stakeholders and describe how they engage them. A credible assessment involves genuine stakeholder engagement, not a pre-screened topic list.",
    links: [
      { label: "Step-by-step materiality guide", href: "/blog/brsr-materiality-assessment-guide" },
      { label: "Materiality matrix builder", href: "/tools/materiality" },
    ],
    see: ["double-materiality"],
  },
  {
    id: "double-materiality",
    term: "Double materiality",
    category: "BRSR",
    definition:
      "Assessing materiality in both directions: outside-in, meaning which ESG topics could affect the company's financial performance, and inside-out, meaning what impact the company's activity has on the environment and society. The EU's CSRD formalises it as a requirement. BRSR does not mandate it by name, but a defensible BRSR materiality assessment demonstrates both directions.",
    see: ["materiality-assessment", "csrd"],
  },

  // ── Assurance ───────────────────────────────────────────────────────────
  {
    id: "reasonable-assurance",
    term: "Reasonable assurance",
    category: "Assurance",
    definition:
      "A positive assurance opinion: the assurer states that in their opinion the reported figures are free from material misstatement. It carries the same level of confidence as a statutory financial audit and requires correspondingly extensive evidence. This is the bar BRSR Core sets, and the assurer tests data at source level rather than reviewing the final reported figure.",
    see: ["limited-assurance", "isae-3000", "brsr-core"],
  },
  {
    id: "limited-assurance",
    term: "Limited assurance",
    category: "Assurance",
    definition:
      "A negative assurance opinion: nothing came to the assurer's attention to suggest the figures are materially misstated. It requires substantially less evidence than reasonable assurance and is what many companies are used to from voluntary sustainability-report reviews. It does not satisfy the BRSR Core requirement.",
    see: ["reasonable-assurance"],
  },
  {
    id: "brsr-assessment",
    term: "Assessment (BRSR)",
    category: "Assurance",
    definition:
      "A verification pathway SEBI introduced in its circular of 28 March 2025 as an alternative to full reasonable assurance for the 42 BRSR Core KPIs. It evaluates whether the reported KPIs comply with the sector-specific standards published by the Industry Standards Forum in December 2024. It is less onerous than ISAE 3000, but it still requires an independent third party and a structured evidence review, so it is not a self-certification. The eligibility criteria are set out in the circular itself.",
    links: [{ label: "Assurance vs assessment", href: "/blog/brsr-assurance-vs-assessment" }],
    see: ["isf", "reasonable-assurance"],
  },
  {
    id: "isae-3000",
    term: "ISAE 3000",
    category: "Assurance",
    definition:
      "The international standard for assurance engagements other than audits or reviews of historical financial information. It is the standard under which BRSR Core reasonable assurance is performed. Under it, an assurer will ask for meter readings rather than bill totals, site-level data before aggregation, and documentary evidence of every calculation step including the emission factor and its version.",
    see: ["reasonable-assurance"],
  },
  {
    id: "isf",
    term: "ISF",
    aka: "Industry Standards Forum",
    category: "Assurance",
    definition:
      "A body constituted under SEBI's aegis that published sector-specific BRSR Core standards in December 2024. The standards give binding guidance on how each of the 42 Core KPIs should be measured, and they are the criteria an independent evaluator tests against under the lighter assessment pathway.",
    see: ["brsr-assessment", "brsr-core"],
  },

  // ── GHG & carbon ────────────────────────────────────────────────────────
  {
    id: "scope-1",
    term: "Scope 1 emissions",
    category: "GHG & carbon",
    definition:
      "Direct greenhouse gas emissions from sources a company owns or controls. For most Indian manufacturers this means diesel burned in DG sets and company vehicles, LPG in canteens, and process or fugitive emissions such as refrigerants where applicable. It is calculated by multiplying fuel consumption by the fuel's emission factor: diesel is 2.68 kg CO2e per litre under IPCC 2006 Volume 2, Table 2.2.",
    links: [{ label: "Scope 1 & 2 calculator", href: "/tools/ghg-calculator" }],
    see: ["scope-2", "ghg-protocol"],
  },
  {
    id: "scope-2",
    term: "Scope 2 emissions",
    category: "GHG & carbon",
    definition:
      "Indirect greenhouse gas emissions from purchased electricity, steam, heating or cooling. For Indian companies this is almost always grid electricity, calculated location-based by multiplying kWh imported from the grid by the CEA grid emission factor. Self-generated rooftop solar does not offset Scope 2; it reduces it by reducing the volume imported.",
    links: [{ label: "How to calculate Scope 1 and 2 for BRSR", href: "/blog/scope-1-2-ghg-brsr-guide" }],
    see: ["cea-grid-factor", "location-based"],
  },
  {
    id: "scope-3",
    term: "Scope 3 emissions",
    category: "GHG & carbon",
    definition:
      "Indirect emissions across a company's value chain, split into 15 categories by the GHG Protocol, covering purchased goods, business travel, commuting, transport and distribution, waste, and use of sold products among others. Under BRSR, Scope 3 sits at P6-L2, a Leadership indicator, so it is voluntary. Investors, CDP and value-chain partners increasingly ask for it regardless.",
    links: [
      { label: "Scope 3 screening calculator", href: "/tools/scope3-calculator" },
      { label: "Scope 3 for BRSR", href: "/blog/scope-3-brsr-value-chain" },
    ],
    see: ["leadership-indicator", "ghg-protocol"],
  },
  {
    id: "cea-grid-factor",
    term: "CEA grid emission factor",
    category: "GHG & carbon",
    definition:
      "The average carbon intensity of India's electricity grid, published by the Central Electricity Authority in its CO2 Baseline Database and used for location-based Scope 2 calculations. Version 21.0 (2024) gives 0.710 kg CO2e per kWh, and that is the version to use for FY 2025-26 filings. Using a stale version is one of the most common reasons a reported figure has to be restated, so state the version alongside the number.",
    links: [{ label: "Methodology and sources", href: "/methodology" }],
    see: ["scope-2", "location-based"],
  },
  {
    id: "location-based",
    term: "Location-based vs market-based Scope 2",
    category: "GHG & carbon",
    definition:
      "Two accounting methods for purchased electricity. Location-based uses the average grid emission factor for the region, which in India is the CEA factor. Market-based uses the emission factor of the specific electricity a company contracted for, through renewable energy certificates or power purchase agreements. Indian BRSR practice defaults to location-based; a market-based figure, where disclosed, is reported alongside rather than instead of it.",
    see: ["cea-grid-factor", "scope-2"],
  },
  {
    id: "ghg-protocol",
    term: "GHG Protocol",
    category: "GHG & carbon",
    definition:
      "The most widely used international accounting standard for greenhouse gas emissions, which defines the Scope 1, 2 and 3 categories. Its Corporate Value Chain (Scope 3) Standard defines the 15 Scope 3 categories. BRSR's emissions disclosures follow its conventions, and assurers expect calculations to be traceable to it.",
    see: ["scope-1", "scope-3"],
  },
  {
    id: "tco2e",
    term: "tCO2e",
    aka: "Tonnes of carbon dioxide equivalent",
    category: "GHG & carbon",
    definition:
      "The standard unit for reporting greenhouse gas emissions, expressing all gases in terms of the warming effect of an equivalent mass of carbon dioxide. BRSR expects absolute emissions in tCO2e, not kg. Reporting in kilograms, which is the unit emission factors are usually expressed in, is a common and easily caught error: divide by 1,000.",
    see: ["scope-1"],
  },
  {
    id: "emission-intensity",
    term: "Emission intensity",
    category: "GHG & carbon",
    definition:
      "Emissions per unit of economic or physical output, reported alongside absolute emissions in BRSR. The two standard denominators are turnover in rupees crore and physical output in tonnes or units. Use both where the data exists, and keep the denominator consistent between years, or the trend cannot be read.",
    see: ["ppp-intensity"],
  },
  {
    id: "ppp-intensity",
    term: "PPP-adjusted intensity",
    category: "GHG & carbon",
    definition:
      "An intensity ratio restated against purchasing-power-parity-adjusted turnover, so an Indian figure can be compared like-for-like with a global peer's. Without it, rupee-denominated intensity flatters or penalises a company purely because of exchange rates. The World Bank publishes the PPP conversion factor; India's 2024 value is 20.45.",
    links: [{ label: "PPP-adjusted intensity tool", href: "/tools/ppp-intensity" }],
    see: ["emission-intensity"],
  },
  {
    id: "embedded-emissions",
    term: "Embedded emissions",
    category: "GHG & carbon",
    definition:
      "The greenhouse gas emissions associated with producing one unit of a good, typically expressed per tonne of product. CBAM requires EU importers to report them for covered goods, which means the exporting manufacturer must calculate at product level rather than company level. A plant making several products needs an allocation methodology to split site emissions across them.",
    see: ["cbam"],
  },

  // ── Carbon markets ──────────────────────────────────────────────────────
  {
    id: "cbam",
    term: "CBAM",
    aka: "Carbon Border Adjustment Mechanism",
    category: "Carbon markets",
    definition:
      "The EU's mechanism for putting a carbon price on imports from countries without equivalent carbon pricing. EU importers of covered goods must buy CBAM certificates matching the embedded emissions of what they import, at a price tracking the EU Emissions Trading System. It moved out of its transitional phase on 1 January 2026. Covered goods are steel and iron, cement, aluminium, fertilizers, hydrogen and electricity.",
    links: [
      { label: "CBAM for Indian exporters", href: "/blog/cbam-2026-indian-exporters" },
      { label: "CBAM & CCTS readiness checker", href: "/features/cbam-ccts" },
    ],
    see: ["embedded-emissions", "eu-ets"],
  },
  {
    id: "cbam-certificate",
    term: "CBAM certificate",
    category: "Carbon markets",
    definition:
      "The instrument an EU importer surrenders to cover the embedded emissions of a covered good, priced against the EU ETS carbon price. The obligation sits with the EU importer, not the exporter, but the importer can only discharge it accurately with emissions data from the manufacturer. Where no data is supplied, the importer must use EU default values, which are deliberately conservative and therefore expensive.",
    see: ["cbam", "embedded-emissions"],
  },
  {
    id: "eu-ets",
    term: "EU ETS",
    aka: "European Union Emissions Trading System",
    category: "Carbon markets",
    definition:
      "The EU's cap-and-trade carbon market, and the reference price for CBAM certificates. It matters to Indian exporters only indirectly: the higher the EU ETS price, the more a tonne of embedded emissions costs the EU importer of an Indian good, and the greater the commercial pressure to supply real emissions data.",
    see: ["cbam-certificate"],
  },
  {
    id: "ccts",
    term: "CCTS",
    aka: "Carbon Credit Trading Scheme",
    category: "Carbon markets",
    definition:
      "India's national carbon market framework, notified by the Ministry of Environment, Forest and Climate Change under the Energy Conservation (Amendment) Act 2022 and implemented by the Bureau of Energy Efficiency. BEE sets sector-specific greenhouse gas emission intensity targets; entities that beat their target earn tradable Carbon Credit Certificates, and those that miss it must buy them. Nine sectors are obligated, covering roughly 490 entities in the first compliance year.",
    links: [{ label: "CCTS India 2025-26", href: "/blog/ccts-india-2025-26" }],
    see: ["gei", "ccc", "bee"],
  },
  {
    id: "gei",
    term: "GEI",
    aka: "Greenhouse gas emission intensity",
    category: "Carbon markets",
    definition:
      "Emissions per unit of production, measured in tCO2e per tonne or unit of output, and the metric CCTS compliance is assessed on. BEE issues sector-specific GEI Target Orders setting the level each obligated entity must reach. For the FY 2025-26 compliance year, obligated entities must submit a verified GEI report to BEE by 31 July 2026.",
    see: ["ccts", "ccc"],
  },
  {
    id: "ccc",
    term: "CCC",
    aka: "Carbon Credit Certificate",
    category: "Carbon markets",
    definition:
      "The tradable instrument issued under India's CCTS to an obligated entity that beats its BEE-set greenhouse gas emission intensity target. Entities that miss their target must purchase enough certificates to cover the shortfall. Certificates trade on the Indian Carbon Market.",
    see: ["ccts", "gei"],
  },
  {
    id: "bee",
    term: "BEE",
    aka: "Bureau of Energy Efficiency",
    category: "Carbon markets",
    definition:
      "The Indian statutory body that implements CCTS, sets sector GEI targets through Target Orders, and receives the verified emission intensity reports obligated entities must file. It also administers the older PAT scheme. It notified the nine CCTS-obligated sectors in two tranches, four in October 2025 and five in January 2026.",
    see: ["ccts", "pat"],
  },
  {
    id: "vvb",
    term: "Accredited carbon verifier",
    aka: "VVB, validation and verification body",
    category: "Carbon markets",
    definition:
      "An independent body accredited to verify greenhouse gas emission intensity reports and carbon credit claims. Under CCTS, an obligated entity's GEI report must be verified by an accredited verifier before submission to BEE. Empanelment is granted by the scheme administrator, and the criteria and open windows are published by BEE, so check them directly rather than relying on secondary summaries.",
    see: ["ccts", "gei"],
  },

  // ── Indian compliance ───────────────────────────────────────────────────
  {
    id: "lodr",
    term: "LODR Regulation 34(2)(f)",
    category: "Indian compliance",
    definition:
      "The provision of SEBI's Listing Obligations and Disclosure Requirements Regulations that makes BRSR mandatory. It is the statutory basis for the requirement that the top 1000 listed companies by market capitalisation include a BRSR in their annual report.",
    see: ["brsr"],
  },
  {
    id: "epr",
    term: "EPR",
    aka: "Extended Producer Responsibility",
    category: "Indian compliance",
    definition:
      "The obligation on a producer to take responsibility for its products at end of life, covering plastic packaging under the Plastic Waste Management Rules 2022, electronics under the E-Waste Management Rules 2022, and batteries under the Battery Waste Management Rules 2022. Obligated companies register with CPCB and report collection and recycling volumes. BRSR asks for the obligation and the volumes, and the CPCB portal data is the evidence.",
    see: ["cpcb"],
  },
  {
    id: "zld",
    term: "ZLD",
    aka: "Zero Liquid Discharge",
    category: "Indian compliance",
    definition:
      "A wastewater treatment configuration in which no effluent leaves the facility: all water is recovered and reused, and only solid residue remains. It is mandated for certain highly polluting industries in India. For BRSR water disclosures it simplifies the arithmetic, because with no discharge, water consumption equals water withdrawal.",
    links: [{ label: "BRSR water disclosure", href: "/blog/brsr-water-disclosure-calculation" }],
    see: ["water-withdrawal"],
  },
  {
    id: "water-withdrawal",
    term: "Water withdrawal, consumption and discharge",
    category: "Indian compliance",
    definition:
      "Three distinct quantities BRSR asks for separately and that are easily conflated. Withdrawal is the total volume taken from all sources. Discharge is the volume of treated or untreated effluent released. Consumption is what does not return to the source catchment, so consumption equals withdrawal minus discharge. SEBI expects withdrawal and consumption both, not withdrawal alone.",
    links: [{ label: "Calculating BRSR water disclosures", href: "/blog/brsr-water-disclosure-calculation" }],
    see: ["zld"],
  },
  {
    id: "cpcb",
    term: "CPCB and State Pollution Control Board consents",
    aka: "CTE / CTO",
    category: "Indian compliance",
    definition:
      "The Central Pollution Control Board and its state counterparts issue Consent to Establish and Consent to Operate to industrial facilities, along with hazardous-waste authorisations and EPR registrations. These filings already contain much of the environmental data BRSR asks for, which is why a gap analysis that cross-references them typically finds a large share of Principle 6 already documented.",
    links: [{ label: "Find out what your client already has", href: "/start" }],
    see: ["epr"],
  },
  {
    id: "pat",
    term: "PAT scheme",
    aka: "Perform, Achieve and Trade",
    category: "Indian compliance",
    definition:
      "India's energy-efficiency trading scheme for designated consumers in energy-intensive sectors, administered by BEE. Participants have specific energy consumption targets and trade Energy Saving Certificates. PAT returns are a useful source for BRSR Principle 6 energy data, and PAT is the predecessor scheme that CCTS builds on.",
    see: ["bee", "ccts"],
  },
  {
    id: "xbrl",
    term: "XBRL (for BRSR)",
    category: "Indian compliance",
    definition:
      "The structured, machine-readable format in which BRSR data is filed with the exchanges alongside the annual report. The most common rejection causes are scale errors, because Indian reports often state figures in lakh or crore while the taxonomy expects absolute rupees, along with unit and sign mismatches.",
    links: [{ label: "XBRL pre-flight check", href: "/tools/xbrl-preflight" }],
  },
  {
    id: "posh",
    term: "POSH Act",
    aka: "Sexual Harassment of Women at Workplace Act, 2013",
    category: "Indian compliance",
    definition:
      "The Indian law requiring employers to constitute an Internal Committee and report complaints of workplace sexual harassment. BRSR Principle 5 asks for the number of complaints filed, resolved and pending, which comes from the Internal Committee's records rather than the general HR system.",
    see: ["brsr"],
  },
  {
    id: "dpdp",
    term: "DPDP Act",
    aka: "Digital Personal Data Protection Act, 2023",
    category: "Indian compliance",
    definition:
      "India's data protection law, governing how organisations process personal data. It is most relevant to BRSR Principle 9, which asks about consumer data privacy, breaches and complaints. For services and technology companies it is often the most material Principle 9 disclosure.",
    see: ["brsr"],
  },

  // ── Global frameworks ───────────────────────────────────────────────────
  {
    id: "gri",
    term: "GRI",
    aka: "Global Reporting Initiative",
    category: "Global frameworks",
    definition:
      "The most widely adopted international sustainability reporting standard, organised around impact materiality. Many Indian companies report against GRI alongside BRSR, and most BRSR disclosures map onto a GRI standard, which is why collecting once and reporting to both is feasible.",
    links: [
      { label: "BRSR vs GRI", href: "/blog/brsr-vs-gri" },
      { label: "Cross-framework mapping tool", href: "/tools/brsr-framework-mapping" },
    ],
  },
  {
    id: "tcfd",
    term: "TCFD",
    aka: "Task Force on Climate-related Financial Disclosures",
    category: "Global frameworks",
    definition:
      "A climate disclosure framework structured around four pillars: governance, strategy, risk management, and metrics and targets. Its recommendations have been absorbed into the IFRS sustainability standards, so new reporting increasingly happens under IFRS S2 rather than TCFD directly, but the four-pillar structure persists.",
    links: [{ label: "Cross-framework mapping tool", href: "/tools/brsr-framework-mapping" }],
    see: ["ifrs-s1-s2"],
  },
  {
    id: "ifrs-s1-s2",
    term: "IFRS S1 and S2",
    aka: "ISSB standards",
    category: "Global frameworks",
    definition:
      "The sustainability disclosure standards issued by the International Sustainability Standards Board. S1 covers general sustainability-related financial disclosures and S2 covers climate specifically, absorbing the TCFD recommendations. They are investor-focused, concerned with how sustainability affects enterprise value.",
    links: [{ label: "BRSR vs IFRS / ISSB", href: "/blog/brsr-vs-ifrs-issb" }],
    see: ["tcfd"],
  },
  {
    id: "tnfd",
    term: "TNFD",
    aka: "Taskforce on Nature-related Financial Disclosures",
    category: "Global frameworks",
    definition:
      "A disclosure framework for nature and biodiversity, structured on the same four pillars as TCFD. It maps onto the BRSR disclosures that touch water, pollution, waste, biodiversity and land use, which is why a BRSR filer already holds much of the underlying data.",
    links: [{ label: "Cross-framework mapping tool", href: "/tools/brsr-framework-mapping" }],
  },
  {
    id: "csrd",
    term: "CSRD",
    aka: "Corporate Sustainability Reporting Directive",
    category: "Global frameworks",
    definition:
      "The EU directive requiring in-scope companies to report sustainability information under the ESRS standards. After the Omnibus I directive in force from 18 March 2026, it applies to EU undertakings with more than 1,000 employees and turnover above EUR 450 million, with first application pushed to FY2027. Indian groups are pulled in mainly through large EU subsidiaries.",
    links: [{ label: "BRSR vs CSRD / ESRS", href: "/blog/brsr-vs-csrd-esrs" }],
    see: ["esrs", "double-materiality"],
  },
  {
    id: "esrs",
    term: "ESRS",
    aka: "European Sustainability Reporting Standards",
    category: "Global frameworks",
    definition:
      "The twelve standards that give the CSRD its content: two cross-cutting, five environmental (E1 to E5), four social (S1 to S4) and one governance (G1). Omnibus I cut mandatory datapoints by roughly 60 to 70% and deleted the voluntary ones, but left the twelve standards and their topics unchanged, so a topic-level BRSR-to-ESRS crosswalk still holds.",
    links: [{ label: "BRSR to ESRS crosswalk", href: "/blog/brsr-vs-csrd-esrs" }],
    see: ["csrd"],
  },
  {
    id: "msci-djsi",
    term: "MSCI ESG Ratings and DJSI",
    aka: "S&P Global Corporate Sustainability Assessment",
    category: "Global frameworks",
    definition:
      "Two of the ratings that institutional investors read alongside a company's own disclosures. MSCI scores companies on ESG Key Issues weighted by industry; the Dow Jones Sustainability Indices are built on S&P Global's Corporate Sustainability Assessment. Both draw on data a BRSR filer already produces, which is why the BRSR principles map onto their criteria.",
    links: [{ label: "Cross-framework mapping tool", href: "/tools/brsr-framework-mapping" }],
  },
  {
    id: "cdp",
    term: "CDP",
    category: "Global frameworks",
    definition:
      "A global environmental disclosure platform through which companies report climate, water and forests data, most often because a customer or investor requests it. Its questionnaires ask for Scope 3 in more detail than BRSR does, which is one of the main reasons Indian companies screen Scope 3 despite it being voluntary under BRSR.",
    links: [{ label: "BRSR, CDP and EcoVadis", href: "/blog/brsr-cdp-ecovadis" }],
    see: ["scope-3"],
  },
];

export function getTerm(id: string): GlossaryTerm | null {
  return GLOSSARY.find((t) => t.id === id) ?? null;
}
