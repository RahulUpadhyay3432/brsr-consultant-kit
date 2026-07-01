import React from "react";

// Reading serif for long-form body — Newsreader (loaded app-wide), Georgia fallback.
const SERIF: React.CSSProperties = { fontFamily: "var(--font-newsreader), Georgia, 'Times New Roman', serif" };
// Display serif for editorial headings.
const SERIF_DISPLAY: React.CSSProperties = { fontFamily: "var(--font-newsreader), Georgia, serif" };

function slugId(text: React.ReactNode): string {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/^\d+\.\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function H2({ children }: { children: React.ReactNode }) {
  const id = slugId(children as string) || undefined;
  return (
    <h2
      id={id}
      data-toc="true"
      className="text-[#0F172A] leading-tight tracking-[-0.012em] scroll-mt-28"
      style={{ ...SERIF_DISPLAY, fontWeight: 600, fontSize: "1.7rem", marginTop: "3.25rem", marginBottom: "1rem" }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-[#0F172A] leading-snug"
      style={{ ...SERIF_DISPLAY, fontWeight: 600, fontSize: "1.28rem", marginTop: "2rem", marginBottom: "0.6rem" }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...SERIF, fontSize: "17.5px", lineHeight: "1.88", color: "#1C2533", marginBottom: "1.35rem" }}>
      {children}
    </p>
  );
}

function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ marginBottom: "1.4rem", paddingLeft: "0" }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            ...SERIF,
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "17px",
            lineHeight: "1.78",
            color: "#1C2533",
            marginBottom: "0.65rem",
          }}
        >
          <svg style={{ width: "16px", height: "16px", color: "#1E9DF2", flexShrink: 0, marginTop: "4px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OL({ items }: { items: React.ReactNode[] }) {
  return (
    <ol style={{ marginBottom: "1.4rem", paddingLeft: "0", counterReset: "ol-counter" }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            ...SERIF,
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            fontSize: "17px",
            lineHeight: "1.78",
            color: "#1C2533",
            marginBottom: "0.65rem",
          }}
        >
          <span style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', monospace", fontSize: "12px", fontWeight: 700, color: "#1E9DF2", flexShrink: 0, marginTop: "5px", minWidth: "20px" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Callout({ title, children, color = "blue" }: { title: string; children: React.ReactNode; color?: "blue" | "amber" | "green" | "red" }) {
  const styles = {
    blue:  { border: "#AFD2FB", bg: "#EAF4FE", title: "#0B5FB0", body: "#1A3A6A", icon: "ℹ" },
    amber: { border: "#EAD8B0", bg: "#F6ECD8", title: "#8A6516", body: "#5C3D06", icon: "⚠" },
    green: { border: "#BFE6D8", bg: "#E3F7F0", title: "#0E7A56", body: "#0A4A34", icon: "✓" },
    red:   { border: "#F8C9BD", bg: "#FFF1ED", title: "#B83021", body: "#7A1E0F", icon: "!" },
  }[color];
  return (
    <div style={{ borderRadius: "14px", border: `1.5px solid ${styles.border}`, backgroundColor: styles.bg, padding: "18px 20px", margin: "1.75rem 0" }}>
      <p style={{ fontFamily: "var(--font-hanken), system-ui, sans-serif", fontWeight: 700, fontSize: "13px", color: styles.title, marginBottom: "6px" }}>{title}</p>
      <div style={{ ...SERIF, fontSize: "15.5px", lineHeight: "1.72", color: styles.body }}>{children}</div>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', monospace", fontSize: "14px", backgroundColor: "#EFF3FA", color: "#0B5FB0", padding: "2px 6px", borderRadius: "5px" }}>
      {children}
    </code>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "1.75rem 0", borderRadius: "14px", border: "1px solid #E5E9F0" }}>
      <table style={{ width: "100%", fontSize: "14.5px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#EFF3FA", borderBottom: "1px solid #E5E9F0" }}>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FBFCFE" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "10px 16px", color: "#28303B", borderTop: "1px solid #EEF1F6", ...SERIF, fontSize: "14.5px", lineHeight: "1.6" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyTakeaways({ items }: { items: string[] }) {
  return (
    <div style={{ borderRadius: "16px", border: "2px solid #1E9DF2", backgroundColor: "#EAF4FE", padding: "22px 24px", margin: "2rem 0" }}>
      <p style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', monospace", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#0B5FB0", marginBottom: "14px" }}>
        Key takeaways
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", fontWeight: 700, color: "#0B6FD4", flexShrink: 0, marginTop: "3px", minWidth: "22px" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ ...SERIF, fontSize: "15.5px", lineHeight: "1.7", color: "#1A3A6A" }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FAQ({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div style={{ borderRadius: "16px", border: "1px solid #E5E9F0", overflow: "hidden", margin: "2.5rem 0" }}>
      <div style={{ backgroundColor: "#EFF3FA", padding: "12px 20px", borderBottom: "1px solid #E5E9F0", display: "flex", alignItems: "center", gap: "8px" }}>
        <svg style={{ width: "15px", height: "15px", color: "#1E9DF2", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p style={{ fontFamily: "var(--font-hanken), system-ui, sans-serif", fontWeight: 700, fontSize: "13.5px", color: "#0F172A" }}>
          Frequently asked questions
        </p>
      </div>
      <div>
        {items.map((item, i) => (
          <details
            key={i}
            style={{ borderTop: i > 0 ? "1px solid #EEF1F6" : "none" }}
          >
            <summary
              style={{
                fontFamily: "var(--font-hanken), system-ui, sans-serif",
                fontWeight: 600,
                fontSize: "15px",
                color: "#0F172A",
                padding: "14px 20px",
                cursor: "pointer",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {item.q}
              <svg style={{ width: "14px", height: "14px", color: "#5B6573", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div style={{ ...SERIF, fontSize: "15.5px", lineHeight: "1.76", color: "#28303B", padding: "4px 20px 18px" }}>
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function ImagePlaceholder({ alt, prompt }: { alt: string; prompt: string }) {
  return (
    <figure style={{ margin: "2.25rem 0" }}>
      <div style={{ borderRadius: "14px", border: "2px dashed #D0D5DD", backgroundColor: "#F8FAFC", padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <svg style={{ width: "24px", height: "24px", color: "#94A3B8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
        </svg>
        <p style={{ fontFamily: "var(--font-hanken), system-ui, sans-serif", fontWeight: 600, fontSize: "13px", color: "#5B6573", textAlign: "center" }}>
          {alt}
        </p>
        <p style={{ fontFamily: "ui-monospace, 'IBM Plex Mono', monospace", fontSize: "11px", color: "#94A3B8", textAlign: "center", maxWidth: "480px", lineHeight: "1.6" }}>
          <strong>AI image prompt:</strong> {prompt}
        </p>
      </div>
    </figure>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

export const BLOG_CONTENT: Record<string, React.ReactNode> = {

  /* ── Post 1: What's new in BRSR for FY 2025-26 ────────────────────────── */
  "brsr-fy2526-changes": (
    <>
      <P>
        BRSR has never been static. Each year SEBI refines the format, and FY 2025-26 brought the most
        significant changes since BRSR replaced the old BRR format in 2022. If you are preparing a
        client's filing this year, three things demand your immediate attention.
      </P>

      <H2>1. BRSR Core is mandatory for the top 500</H2>
      <P>
        BRSR Core is a sub-set of 42 Key Performance Indicators drawn from BRSR Essential. For FY 2025-26,
        SEBI has made reasonable assurance on these 42 KPIs compulsory for the top 500 listed companies by
        market capitalisation. The top 1000 companies join the Core assurance requirement from FY 2026-27.
      </P>
      <Callout title="What 'reasonable assurance' means in practice" color="blue">
        A SEBI-registered independent assurance provider (typically a practising CA firm or a specialist ESG
        assurer) must review the 42 Core KPIs and issue a reasonable assurance report. This is a higher bar
        than the limited assurance many companies are used to from financial audits of ESG data.
      </Callout>
      <P>
        The 42 Core KPIs span all 9 BRSR principles, but lean heavily on P6 (Environment) and P3 (Employees).
        For your clients, this means the GHG, water, energy, and workforce data must be audit-grade, with
        documented methodologies, conversion factors cited by version, and a clear data trail.
      </P>

      <H2>2. Value-chain disclosures are voluntary now, expected by FY 2026-27</H2>
      <P>
        SEBI's BRSR format includes a Section on value-chain disclosures (Principle 2, Leadership indicators).
        For FY 2025-26 these remain voluntary, but SEBI has signalled that the top 250 listed companies will
        be required to report them from FY 2026-27. If your client is in the top 250, now is the year to start
        mapping their supply chain and briefing 2-3 key Tier-1 suppliers.
      </P>
      <UL items={[
        "Identify the suppliers that account for 2% or more of purchases by value.",
        "Check if those suppliers file BRSR themselves or have any ESG data available.",
        "Start a Scope 3 Category 1 (purchased goods) screening — even a high-level estimate establishes a baseline.",
        "Document the methodology, because the assurer will ask.",
      ]} />

      <H2>3. SEBI's March 2025 amendments</H2>
      <P>
        SEBI issued a circular in March 2025 clarifying several long-debated points in the BRSR format. The
        key clarifications relevant to consultants:
      </P>
      <UL items={[
        "Reporting period is the financial year (April-March), not the calendar year.",
        "Absolute figures must be reported alongside intensity ratios — not instead of them.",
        "For P6-E1 (GHG), both Scope 1 and Scope 2 are required; Scope 3 remains voluntary.",
        "The \"well-being\" disclosures in P3 must cover all workers, not just permanent employees.",
        "Section A disclosures updated to include the company's BRSR contact person and their designation.",
      ]} />

      <H2>What to tell your clients this year</H2>
      <P>
        Brief the board early. Reasonable assurance on the Core KPIs is not a box-ticking exercise; it
        requires an assurance provider to spend time with your data team, and that takes planning. Companies
        that wait until Q3 find themselves racing the September deadline with incomplete data and an assurer
        who has no time to issue a clean report.
      </P>
      <Callout title="Saaksh checks BRSR Core applicability automatically" color="green">
        When you generate a readiness report in Saaksh, it detects whether your client falls in the top 500
        or top 1000 and flags the Core KPIs that require assurance. The engagement timeline generator can
        set milestones around the assurance window.
      </Callout>

      <FAQ items={[
        {
          q: "Is BRSR Core mandatory for all listed companies in FY 2025-26?",
          a: "No. For FY 2025-26, BRSR Core reasonable assurance is mandatory only for the top 500 listed companies by market capitalisation. The top 1000 companies join from FY 2026-27. All top 1000 companies still file the full BRSR Essential format."
        },
        {
          q: "What is the filing deadline for BRSR for FY 2025-26?",
          a: "BRSR is filed as part of the Annual Report, which must be submitted within 60 days of the AGM. For most listed companies, this means by late September or October 2026. The exact deadline depends on your client's AGM date."
        },
        {
          q: "If my client is outside the top 500, do they still need BRSR Core?",
          a: "Companies ranked 501-1000 must file BRSR Essential (the full format) but do not need BRSR Core reasonable assurance in FY 2025-26. They should prepare for it by FY 2026-27, when Core assurance becomes mandatory for all top 1000 companies."
        },
        {
          q: "When do value-chain disclosures become mandatory?",
          a: "Value-chain ESG disclosures are voluntary for FY 2025-26 and FY 2026-27 is when SEBI expects the top 250 companies to begin reporting them. The scope covers partners who individually account for 2% or more of total purchases or sales, capped at 75% in aggregate."
        },
        {
          q: "What did SEBI's March 2025 amendments actually change?",
          a: "The March 2025 circular clarified several grey areas: the reporting period is April to March (not a calendar year), absolute GHG figures are required alongside intensity ratios, the well-being disclosures in P3 must cover all workers including contract workers, and Section A now requires the company's designated BRSR contact person."
        },
      ]} />
    </>
  ),

  /* ── Post 2: Scope 1 & 2 GHG for BRSR ────────────────────────────────── */
  "scope-1-2-ghg-brsr-guide": (
    <>
      <P>
        The P6-E1 GHG disclosure is the single disclosure that generates the most revision rounds on most
        BRSR filings. The format asks for Scope 1 and Scope 2 emissions in absolute tonnes of CO2-equivalent
        (tCO2e), plus intensity ratios. The methodology sounds straightforward, but three recurring mistakes
        cause most of the problems.
      </P>

      <H2>Scope 1: direct emissions from sources you control</H2>
      <P>
        Scope 1 covers GHG released from sources owned or controlled by the company. For most manufacturers
        this means diesel consumed in DG sets and company vehicles, LPG in canteens, and process gases
        (methane, refrigerants) where applicable.
      </P>
      <P>The standard approach is activity-based calculation:</P>
      <UL items={[
        <>Collect fuel consumption in litres (diesel), kg (LPG), or m³ (PNG) from purchase records.</>,
        <>Multiply by the appropriate emission factor.<br/><span className="text-[14px] text-[#5B6573]">Diesel: 2.68 kg CO2e/litre (IPCC 2006, Vol.2, Table 2.2). LPG: 1.56 kg CO2e/kg. PNG/CNG: 1.89 kg CO2e/m³.</span></>,
        <>Convert to tonnes by dividing by 1,000.</>,
        <>Sum across all sources and sites.</>,
      ]} />
      <Callout title="Always cite the factor version" color="amber">
        SEBI, and increasingly assurers, expect the emission factor version to be stated alongside the figure.
        For diesel, say "2.68 kg CO2e/litre, IPCC 2006 Vol.2 Table 2.2." Undocumented factors are a common
        reason assurers issue qualified opinions.
      </Callout>

      <H2>Scope 2: purchased electricity</H2>
      <P>
        Scope 2 is the electricity your client buys from the grid. The standard approach is location-based,
        using the Central Electricity Authority (CEA) grid emission factor for India.
      </P>
      <Table
        headers={["CEA Version", "Grid Factor (kg CO2e/kWh)", "Year", "Source"]}
        rows={[
          ["Version 19.0", "0.716", "2022", "CEA CO2 Baseline"],
          ["Version 20.0", "0.716", "2023", "CEA CO2 Baseline"],
          ["Version 21.0", "0.710", "2024", "CEA CO2 Baseline"],
        ]}
      />
      <P>
        Use version 21.0 (0.710 kg CO2e/kWh) for FY 2025-26 filings. The calculation is:
      </P>
      <P>
        <Mono>Electricity purchased (kWh) × 0.710 ÷ 1,000 = Scope 2 (tCO2e)</Mono>
      </P>
      <P>
        If your client has solar on the roof and imports less from the grid, use only the grid imports.
        Renewable electricity self-generated is Scope 1-neutral; it neither adds to nor offsets Scope 2.
      </P>

      <H2>Intensity ratios</H2>
      <P>
        BRSR requires intensity ratios alongside absolute figures. The two standard denominators are
        turnover (₹ crore) and physical output (tonnes, units). Use both where available. For
        service-sector companies that have no physical output, turnover-only is acceptable.
      </P>

      <H2>The three common mistakes</H2>
      <UL items={[
        <>Missing Scope 2 entirely — many first-time filers report only Scope 1 from diesel and omit electricity.</>,
        <>Using a stale CEA factor — Version 19.0 or 20.0 instead of the current 21.0 (0.710 vs 0.716 kg CO2e/kWh — a small difference that will be flagged by an assurer).</>,
        <>Reporting in kg instead of tCO2e — divide by 1,000 after multiplying by the emission factor.</>,
      ]} />
      <Callout title="Saaksh's built-in GHG calculator handles all of this" color="green">
        The P6-E1 calculator in Saaksh uses the current CEA factor (v21.0, 0.710) and IPCC 2006 diesel
        factor, cites them by version in the output, and computes both absolute figures and intensity ratios.
        It runs entirely in your browser — no data leaves your device.
      </Callout>

      <FAQ items={[
        {
          q: "Which emission factor should I use for grid electricity in FY 2025-26?",
          a: "Use CEA Version 21.0, which gives 0.710 kg CO2e/kWh for India's national grid. This is the most current published factor. Always cite it as 'CEA CO2 Baseline Database v21.0 (2024)' in the methodology section of the BRSR."
        },
        {
          q: "Does BRSR require Scope 3 emissions reporting?",
          a: "Scope 3 is voluntary under BRSR Essential. BRSR Core requires assurance on Scope 1 and Scope 2 for the top 500 companies; Scope 3 is still voluntary. However, ESG analysts and proxy advisors increasingly expect top-1000 companies to at minimum disclose Scope 3 Category 1 (purchased goods) and Category 11 (use of sold products)."
        },
        {
          q: "My client has multiple manufacturing sites. Do we report emissions separately or in aggregate?",
          a: "BRSR P6-E1 requires consolidated Scope 1 and Scope 2 figures across all sites operated by the company (or its consolidated group for listed companies). Individual site breakdowns are a best practice addition but not mandatory."
        },
        {
          q: "What is the difference between Scope 1 and Scope 2?",
          a: "Scope 1 covers direct emissions from sources your client owns or controls: diesel in generators and vehicles, LPG in canteens, process gases. Scope 2 covers indirect emissions from purchased electricity. Both are required under BRSR P6-E1 for the reporting year."
        },
        {
          q: "Can my client use renewable energy certificates (RECs) to reduce Scope 2?",
          a: "Under market-based accounting, RECs can offset Scope 2 emissions. However, BRSR currently requires location-based Scope 2 (using the CEA grid factor) as the primary disclosure. Market-based figures can be reported as supplementary information. Confirm the assurer's stance if your client is claiming market-based Scope 2 reductions."
        },
      ]} />
    </>
  ),

  /* ── Post 3: BRSR Core vs Essential ───────────────────────────────────── */
  "brsr-core-vs-essential": (
    <>
      <P>
        Ask three BRSR practitioners what "BRSR Core" means and you will get three different answers.
        The terminology is genuinely confusing, and SEBI's own circulars have not always used the terms
        consistently. Here is a clear breakdown.
      </P>

      <H2>BRSR Essential: the full format</H2>
      <P>
        BRSR Essential refers to the full BRSR reporting format as prescribed by SEBI in its 2021 circular
        (as amended). It covers all three sections:
      </P>
      <UL items={[
        "Section A: General disclosures (company details, products, operations, employees).",
        "Section B: Management and process disclosures (policies, targets, governance).",
        "Section C: Principle-wise performance disclosures (108 indicators across P1-P9, split into Essential and Leadership indicators).",
      ]} />
      <P>
        All companies to which BRSR applies must file BRSR Essential in their Annual Report. No assurance
        is mandated for Essential-only filers — though companies can voluntarily arrange limited assurance.
      </P>

      <H2>BRSR Core: the 42 KPIs that need assurance</H2>
      <P>
        BRSR Core is a curated sub-set of 42 Key Performance Indicators drawn from the full BRSR Essential
        format. SEBI identified these 42 KPIs as the most material and quantifiable disclosures across
        the 9 BRSR principles.
      </P>
      <Callout title="BRSR Core ≠ a separate report" color="blue">
        Companies do not file a separate "BRSR Core report." They file the standard BRSR as part of their
        Annual Report, but the 42 Core KPIs within that filing must be independently assured. The assurer
        then issues a separate Assurance Statement covering those 42 indicators.
      </Callout>
      <Table
        headers={["", "BRSR Essential", "BRSR Core"]}
        rows={[
          ["Scope", "Full format, all 108 Section C indicators", "42 KPIs drawn from Section C"],
          ["Assurance", "Not mandated", "Reasonable assurance required"],
          ["Mandatory for", "Top 1000 listed companies (since FY 2022-23)", "Top 500 (FY 2025-26); top 1000 (FY 2026-27)"],
          ["Who assures", "N/A (voluntary)", "SEBI-registered assurance provider"],
        ]}
      />

      <H2>What reasonable assurance requires</H2>
      <P>
        Reasonable assurance is a high bar. The assurer must obtain sufficient evidence to express a positive
        opinion: "In our opinion, the 42 Core KPIs are free from material misstatement." This contrasts with
        limited assurance, which is a negative opinion ("nothing came to our attention to suggest...").
      </P>
      <P>To support a reasonable assurance engagement, your client will typically need:</P>
      <UL items={[
        "Primary source data for each KPI (meter readings, HR system exports, purchase invoices).",
        "Documented calculation methodology with emission factor citations.",
        "An internal sign-off trail: who compiled the data, who approved it.",
        "Evidence of the data at a site level before aggregation to company level.",
      ]} />

      <H2>Practical advice for consultants</H2>
      <P>
        If your client is in the top 500, raise the assurance requirement in your kickoff meeting. Build
        the data trail from day one — it costs almost nothing extra during data collection but can save
        weeks of rework if the assurer asks for evidence later. And choose the assurer early: SEBI-registered
        ESG assurers have limited capacity and are booking out months in advance as the Core mandate expands.
      </P>

      <FAQ items={[
        {
          q: "How many KPIs are in BRSR Core?",
          a: "42 Key Performance Indicators, selected by SEBI from across the 9 BRSR principles. They span GHG, energy, water, waste, workforce, human rights, and governance. The full list is in SEBI's circular dated 6 July 2023 (SEBI/HO/CFD/PoD-1/P/CIR/2023/112)."
        },
        {
          q: "Does BRSR Essential require independent assurance?",
          a: "No. BRSR Essential (the full format) does not require assurance for companies outside the top 1000. For top 1000 companies, assurance on the 42 BRSR Core KPIs is being phased in: top 500 from FY 2025-26, top 1000 from FY 2026-27."
        },
        {
          q: "Are Leadership indicators mandatory for all top-1000 companies?",
          a: "Leadership indicators are required for top-1000 listed companies and for companies with 3 or more years of BRSR filing history. First-time filers and companies outside the top 1000 only need to complete Essential indicators in Section C."
        },
        {
          q: "Where can I find the official list of BRSR Core KPIs?",
          a: "SEBI's circular dated 6 July 2023 (SEBI/HO/CFD/PoD-1/P/CIR/2023/112) defines the 42 BRSR Core KPIs. The ICAI Background Material on BRSR (Revised 2024) includes an annotated version with guidance on each KPI's measurement methodology."
        },
      ]} />
    </>
  ),

  /* ── Post 4: 5 BRSR fields that trip up manufacturers ─────────────────── */
  "5-brsr-fields-manufacturers-struggle": (
    <>
      <P>
        Certain BRSR disclosures consistently generate confusion, data gaps, and revision rounds across
        manufacturing clients. These are not necessarily the most complex disclosures — they are the ones
        where the data is scattered, the format is ambiguous, or the underlying concept is misunderstood.
        Here are the five that come up most often.
      </P>

      <H2>1. P6-E1: GHG emissions — Scope confusion</H2>
      <P>
        The most common mistake is reporting Scope 1 (diesel, LPG) but omitting Scope 2 (grid electricity).
        Both are required under P6-E1. A second common mistake is reporting in kg CO2e rather than tCO2e —
        divide by 1,000. Third: using a stale CEA factor. Use version 21.0 (0.710 kg CO2e/kWh) for
        FY 2025-26.
      </P>

      <H2>2. P3-E1: Total workforce — contractor headcount</H2>
      <P>
        P3-E1 asks for total workforce including contractual workers, part-time workers, and workers from
        staffing agencies. Most HR systems track only permanent and direct-hire contract employees.
        The contractors from third-party staffing agencies (security, housekeeping, logistics) are almost
        always missed. Ask for the third-party contractor headcount from the facilities or admin team,
        not just HR.
      </P>
      <Callout title="What to collect" color="amber">
        For each worker category (permanent employees, other-than-permanent employees, permanent workers,
        other-than-permanent workers), collect: total count, male/female split, and whether they are
        differently-abled. Separately collect the part-time and on-call headcount.
      </Callout>

      <H2>3. P2-E3 & P2-E4: Extended Producer Responsibility</H2>
      <P>
        EPR covers plastic packaging (Plastic Waste Management Rules 2022), e-waste (E-Waste Management
        Rules 2022), and battery waste (Battery Waste Management Rules 2022). Manufacturing companies that
        use plastic packaging or sell electronics/batteries need an EPR registration with CPCB. The disclosure
        asks for the EPR obligations and how much was collected/recycled.
      </P>
      <P>
        Many companies either do not have EPR registration (where required), or have it but cannot produce
        the CPCB portal data. This is a compliance risk beyond just the BRSR filing.
      </P>

      <H2>4. P6-E7: Energy intensity — wrong denominator</H2>
      <P>
        P6-E7 asks for energy intensity. The format allows turnover (₹ crore) or physical output (units/tonnes)
        as the denominator. Most manufacturers use turnover — which is fine — but common mistakes include:
        using gross revenue before returns/discounts, or using the previous year's turnover for the current
        year's intensity figure. Use net revenue for the same financial year.
      </P>

      <H2>5. P5-E4 & P5-E5: Wages paid to women and minimum wage</H2>
      <P>
        P5-E4 asks whether the company pays wages above the minimum wage — and separately asks for the
        wages paid to women as a percentage of total wages. The minimum wage comparison is often done at
        company level rather than by state (minimum wage is state-specific in India), which can give a
        misleading picture. The gender wage ratio is frequently unavailable because payroll is not broken
        out by gender.
      </P>
      <UL items={[
        "Pull payroll data segmented by gender from the HR system.",
        "Compare against the applicable state minimum wage for each location, not a national average.",
        "If the company operates in multiple states, use a weighted average minimum wage.",
      ]} />
      <Callout title="Saaksh flags these exact fields" color="green">
        When you generate a BRSR readiness report for a manufacturing client in Saaksh, all five of these
        fields are flagged as high-attention items, with practical guidance on what data to collect
        and from which team.
      </Callout>

      <FAQ items={[
        {
          q: "Why do manufacturers struggle more with BRSR than service companies?",
          a: "Manufacturing companies have more complex data requirements: physical energy and water inputs, waste streams, process emissions, worker safety incidents across sites, and supplier dependencies. Service companies have fewer mandatory disclosures and can mark several manufacturing-specific fields as not applicable."
        },
        {
          q: "Which team is usually responsible for P6-E1 GHG data in a manufacturing company?",
          a: "P6-E1 is typically owned by the EHS (Environment, Health and Safety) team or the Plant Engineering team. Fuel consumption records usually sit with the procurement or engineering department, while electricity data comes from the utilities or accounts team."
        },
        {
          q: "How detailed does the waste data need to be for P6-E3?",
          a: "BRSR P6-E3 requires total waste generated (in metric tonnes), broken down by hazardous and non-hazardous, with disposal method (recycled, incinerated, landfilled, co-processed). For PCB-consented or Schedule H waste, the quantity figures should match the CPCB/State PCB records."
        },
        {
          q: "What is the minimum wage comparison for P3?",
          a: "BRSR asks whether the company pays all workers at least the applicable state minimum wage. The comparison must be against the state minimum wage notified by the state government for the relevant category and location, not a national average. Multi-state manufacturers need this data for each location."
        },
      ]} />
    </>
  ),

  /* ── Post 5: CBAM 2026 for Indian exporters ───────────────────────────── */
  "cbam-2026-indian-exporters": (
    <>
      <P>
        The EU Carbon Border Adjustment Mechanism moved out of its transitional phase on 1 January 2026.
        For Indian manufacturers exporting to the EU, this is no longer a future concern — CBAM
        obligations are live, and the first annual report (covering calendar year 2026) will be due in
        May 2027. Here is what you need to know.
      </P>

      <H2>What CBAM is</H2>
      <P>
        CBAM is the EU's mechanism for putting a carbon price on imports of goods from countries that do
        not have equivalent carbon pricing. EU importers of covered goods must purchase CBAM certificates
        equivalent to the embedded emissions in the goods they import. The certificate price tracks the
        EU ETS (European Union Emissions Trading System) carbon price.
      </P>
      <P>
        The obligation sits with the EU importer, not the Indian exporter. But the EU importer can only
        discharge their CBAM obligation if they have accurate embedded-emission data from the manufacturer.
        That data must come from you — the Indian exporter.
      </P>

      <H2>Covered goods (as of 2026)</H2>
      <Table
        headers={["Sector", "CN Codes", "What's covered"]}
        rows={[
          ["Iron & steel", "CN 72, 73", "Pig iron, DRI, flat-rolled products, tubes, pipes"],
          ["Cement", "CN 2523", "Portland cement, clinker, aluminous cement"],
          ["Aluminium", "CN 76", "Unwrought aluminium, profiles, foil, wire"],
          ["Fertilizers", "CN 28, 31", "Ammonia, nitric acid, urea, mixed fertilizers"],
          ["Hydrogen", "CN 2804 10", "Electrolytic and reforming hydrogen"],
          ["Electricity", "CN 2716", "Electricity imports into the EU"],
        ]}
      />

      <H2>What Indian exporters need to provide</H2>
      <P>
        EU importers will ask their Indian suppliers for the "embedded emissions" per tonne of product.
        This means the Scope 1 and Scope 2 GHG emissions associated with producing one tonne of the
        exported good, calculated using the CBAM methodology (which broadly follows the GHG Protocol
        corporate accounting standards).
      </P>
      <Callout title="The CBAM methodology and BRSR GHG are closely aligned" color="blue">
        The good news: if your manufacturing client already calculates Scope 1 and Scope 2 GHG for BRSR
        (P6-E1), you have most of the data CBAM needs. The key difference is that CBAM requires the
        calculation at product level (per tonne of steel, not total company emissions), which requires
        an allocation methodology if the plant makes multiple products.
      </Callout>

      <H2>Steps for Indian exporters this year</H2>
      <UL items={[
        "Check if your products fall under the covered CN codes — the CBAM Regulation Annex I is the reference.",
        "Identify which of your EU customers will be affected (importers with annual imports above the de minimis threshold).",
        "Calculate or commission a calculation of embedded emissions per tonne of each CBAM-covered product you export.",
        "Prepare a data package: production data, fuel and electricity consumption, emission factors (with versions cited), allocation methodology.",
        "Register to provide embedded emission data to your EU customer via the CBAM Transitional Registry or a certified third-party verifier.",
      ]} />

      <H2>What happens if you do not comply</H2>
      <P>
        If an Indian exporter cannot provide embedded emission data, the EU importer must use CBAM default
        values set by the EU Commission — which are based on the average EU production carbon intensity and
        are deliberately conservative (punishing) to incentivise real data. EU importers working with
        suppliers who cannot provide data will face either higher CBAM costs or will shift to suppliers who
        can. The commercial pressure from EU buyers will drive compliance more than any regulatory penalty.
      </P>
      <Callout title="Saaksh's CBAM readiness check" color="green">
        In Saaksh's free BRSR report, the Beyond BRSR tab runs an in-scope check for CBAM based on the
        company's sector and export markets. If your client exports to the EU and operates in a covered
        sector, the check flags CBAM as applicable and lists the data preparation steps.
      </Callout>

      <FAQ items={[
        {
          q: "Which Indian sectors are covered by CBAM?",
          a: "The six sectors currently covered by CBAM are steel and iron, cement, aluminium, fertilisers, electricity, and hydrogen. India's exports of steel and aluminium to the EU are the most directly affected. Chemicals and polymers are under review for future inclusion."
        },
        {
          q: "When is the first CBAM annual report due?",
          a: "The first annual CBAM report (covering calendar year 2026) is due by 31 May 2027. The EU importer is responsible for submitting the report, but they need embedded emission data from the Indian exporter by early 2027."
        },
        {
          q: "What embedded emissions data do Indian exporters need to provide?",
          a: "The EU importer needs the direct embedded emissions per tonne of product, calculated using the EU's prescribed methodology (Commission Implementing Regulation (EU) 2023/1773). This requires production volume, direct fuel and electricity consumption, and process emissions for the specific product category."
        },
        {
          q: "Does CBAM apply to all Indian exporters or only large ones?",
          a: "CBAM applies based on the product and destination, not the size of the exporter. Any Indian company exporting covered goods to the EU, regardless of size, is subject to CBAM data obligations. However, the compliance burden falls on the EU importer to purchase CBAM certificates, making their data request to the Indian supplier an indirect pressure."
        },
      ]} />
    </>
  ),

  /* ── Post 6: BRSR applicability guide ─────────────────────────────────── */
  "brsr-applicability-guide": (
    <>
      <P>
        The most common question from new clients is also the most basic: does BRSR apply to us, and if so,
        which parts? The answer depends on market capitalisation rank, filing history, and whether the company
        is listed at all. This post gives you a precise answer for each company type you are likely to advise.
      </P>

      <H2>The statutory basis</H2>
      <P>
        BRSR is mandatory under SEBI's Listing Obligations and Disclosure Requirements (LODR) Regulations,
        specifically Regulation 34(2)(f). SEBI first made BRSR compulsory for the top 1000 listed companies
        by market capitalisation starting from FY 2022-23. The format replaced the old Business Responsibility
        Report (BRR) that had been required since 2012. BRSR is filed as part of the Annual Report, not as a
        separate document, and is typically due three months after the financial year ends. For FY 2025-26,
        that means the Annual Report containing the BRSR is expected by late September or October 2026.
      </P>

      <H2>The BRSR structure: three sections, 108 Section-C indicators</H2>
      <P>
        All BRSR filers complete the same format. Section A covers general disclosures: corporate identity,
        products and services, employee count, subsidiaries, and CSR details. Section B covers management and
        process disclosures: policies adopted for each of the 9 National Guidelines on Responsible Business
        Conduct (NGRBC) principles, and governance structures. Section C covers principle-wise performance
        disclosures. It contains 68 Essential indicators and 40 Leadership indicators across P1 through P9,
        totalling 108 indicators in all.
      </P>
      <Callout title="Leadership indicators are not required for all companies" color="amber">
        Leadership indicators are required only for companies that have been filing BRSR for three or more
        years, or that are among the top 1000 companies. A first-time filer needs only Essential indicators.
        Make this clear to the client in the kickoff meeting so the data collection scope is correct.
      </Callout>

      <H2>BRSR Core: the assurance sub-set</H2>
      <P>
        BRSR Core is a curated sub-set of 42 KPIs from BRSR Essential that require independent assurance.
        SEBI introduced the BRSR Core glide path to progressively raise the assurance bar across the top
        1000 companies. The schedule is as follows:
      </P>
      <Table
        headers={["Financial Year", "Companies in scope for BRSR Core assurance", "Assurance level"]}
        rows={[
          ["FY 2023-24", "Top 150 listed companies by market cap", "Reasonable assurance"],
          ["FY 2024-25", "Top 500 listed companies by market cap", "Reasonable assurance"],
          ["FY 2025-26", "Top 500 listed companies by market cap", "Reasonable assurance"],
          ["FY 2026-27", "Top 1000 listed companies by market cap", "Reasonable assurance"],
        ]}
      />

      <H2>Value chain: voluntary now, mandatory from FY 2026-27</H2>
      <P>
        SEBI's March 2025 circular deferred mandatory value chain ESG disclosure to FY 2026-27. In FY
        2025-26, disclosure for value chain partners is voluntary. When it becomes mandatory, the scope
        covers partners that individually account for 2% or more of the company's total purchases or sales,
        capped at 75% in aggregate. This 2% threshold meaningfully narrows the scope compared to what was
        originally anticipated, but for large listed companies it still typically captures 10 to 20 key
        suppliers or customers.
      </P>

      <H2>Unlisted companies and suppliers</H2>
      <P>
        Unlisted companies are not required to file BRSR. However, many unlisted companies file voluntarily,
        either because their promoters value the discipline, or because they are preparing for a future IPO.
        From FY 2026-27, unlisted suppliers to listed companies that meet the 2% value-chain threshold will
        receive ESG data requests from their listed customers. Proactively preparing these suppliers is a
        growing advisory opportunity.
      </P>

      <H2>Quick-reference applicability table</H2>
      <Table
        headers={["Company type", "BRSR required?", "BRSR Core assurance?", "Value chain disclosure?"]}
        rows={[
          ["Top 1000 listed (by market cap)", "Yes, since FY 2022-23", "Yes, from FY 2026-27 (top 500: FY 2024-25)", "Voluntary FY 2025-26; mandatory FY 2026-27"],
          ["Top 500 listed (subset of top 1000)", "Yes", "Yes, since FY 2024-25", "Voluntary FY 2025-26; mandatory FY 2026-27"],
          ["Listed outside top 1000", "No (but can volunteer)", "No", "No"],
          ["Unlisted company", "No (but can volunteer)", "No", "No (but may receive requests from listed customers)"],
          ["Unlisted supplier to listed company", "No", "No", "Data requests from clients from FY 2026-27"],
        ]}
      />

      <H2>Key takeaways for consultants</H2>
      <UL items={[
        "Confirm your client's market-cap rank at the start of every engagement. BSE/NSE publish periodic lists of top 1000 companies by market cap.",
        "First-time filers need only Essential indicators in Section C. Clarify this upfront to avoid over-scoping the data collection.",
        "Top 500 clients require reasonable assurance on 42 BRSR Core KPIs for FY 2025-26. Appoint the assurer early.",
        "Value-chain work is voluntary this year but advisable for top-250 companies. Starting now avoids a rush next year.",
        "BRSR is filed inside the Annual Report (not a separate submission). Coordinate with the company secretary on the Annual Report timeline.",
      ]} />

      <FAQ items={[
        {
          q: "How does SEBI define the top 1000 listed companies?",
          a: "The top 1000 is based on average market capitalisation over the preceding financial year, as published by BSE and NSE. The list is updated annually, so a company's position can change year to year. It is important to check the current-year list at the start of each engagement rather than assuming the prior year's status."
        },
        {
          q: "Do unlisted subsidiaries of listed companies need to file BRSR?",
          a: "No. BRSR is a disclosure requirement for listed companies under SEBI's LODR Regulations. Unlisted subsidiaries are not required to file. However, their data is often consolidated into the parent company's BRSR, particularly for GHG and workforce disclosures."
        },
        {
          q: "If a company was listed mid-year, when does the BRSR requirement start?",
          a: "The BRSR requirement applies from the first full financial year after listing. A company listed in, say, December 2024 would not be required to file BRSR for FY 2024-25, but would be expected to file from FY 2025-26 onwards if they fall within the top 1000."
        },
      ]} />
    </>
  ),

  /* ── Post 7: BRSR Core assurance FY 2025-26 ───────────────────────────── */
  "brsr-core-assurance-fy2526": (
    <>
      <P>
        FY 2025-26 is the second year that reasonable assurance on BRSR Core KPIs is mandatory for the
        top 500 listed companies. If you are advising any of these companies, or are being asked to prepare
        them for their assurance engagement, this guide covers what the assurer will actually check and how
        to build the right evidence trail from day one of data collection.
      </P>

      <H2>What BRSR Core actually is</H2>
      <P>
        BRSR Core is a sub-set of 42 KPIs drawn from the full BRSR format. These 42 KPIs map to 9 broad
        attribute areas that SEBI considers the most material and quantifiable: GHG intensity, energy
        intensity, water intensity, waste generated, complaints on essential indicators, openness of
        business, gender-wise pay ratio, inclusive development, and CSR spend. BRSR Core is not a separate
        report. Companies file their standard BRSR as part of the Annual Report, and the 42 Core KPIs
        within that filing are independently assured.
      </P>

      <H2>Reasonable assurance under ISAE 3000</H2>
      <P>
        Reasonable assurance is the same level of confidence as a statutory financial audit. The assurer
        must obtain sufficient appropriate evidence to express a positive opinion: "In our opinion, the
        42 Core KPIs are presented fairly and free from material misstatement." This contrasts with limited
        assurance (a negative opinion: "nothing came to our attention to suggest material misstatement"),
        which requires substantially less evidence.
      </P>
      <Callout title="What ISAE 3000 reasonable assurance requires in practice" color="blue">
        The assurer will test the data at source level, not just review the final reported figure. Expect
        them to ask for meter readings (not just the electricity bill total), site-level data before
        aggregation to company level, and documentary evidence of every calculation step including the
        emission factor and its version.
      </Callout>

      <H2>The ISF sector-specific standards</H2>
      <P>
        The Industry Standards Forum (ISF), a body constituted under SEBI's aegis, published sector-specific
        BRSR Core Standards in December 2024. These standards provide binding guidance on how each of the
        42 KPIs should be measured, sector by sector. They are the authoritative reference for assurers
        reviewing BRSR Core data, and your measurement methodology should align with them. The standards
        are available on the SEBI website and are worth reviewing before your client's data collection begins.
      </P>

      <H2>SEBI March 2025: assessment as an alternative pathway</H2>
      <P>
        SEBI's March 28, 2025 circular introduced "assessment" as a lighter alternative pathway alongside
        full ISAE 3000 reasonable assurance. Assessment is an evaluation under the sector-specific ISF
        standards, conducted by an independent evaluator, but is less onerous than a full reasonable
        assurance engagement. The criteria for which companies can choose assessment versus which must
        complete full assurance are specified in the circular and depend on factors such as market-cap
        rank and filing history. If your client is considering the assessment pathway, read the March 2025
        circular directly. Do not rely on secondary interpretations, including this post, to make that
        determination.
      </P>
      <Table
        headers={["Pathway", "Standard", "Opinion type", "Evidence level", "Who signs off"]}
        rows={[
          ["Reasonable assurance", "ISAE 3000", "Positive (fair presentation)", "Audit-grade (site visits, source data)", "SEBI-registered assurance provider"],
          ["Assessment", "ISF sector standards", "Evaluation (compliance with ISF standard)", "Structured review, less than audit-grade", "Independent evaluator per ISF criteria"],
        ]}
      />

      <H2>Five preparation steps that determine whether assurance goes smoothly</H2>
      <UL items={[
        <>Assign a named data owner per KPI. The assurer will ask who is responsible for each figure. Without a named owner, the evidence trail goes cold.</>,
        <>Document your calculation basis. For every GHG, energy, and water figure, write down the formula used, the source data, and the emission or conversion factor with version number.</>,
        <>Collect evidence at site level before aggregation. If the company has three plants, collect electricity bills for each plant separately, then sum them. Do not start from an aggregated number.</>,
        <>Keep the original source documents. Fuel purchase invoices, electricity bills, sub-meter readings, HR system exports. These are the assurer's primary source material.</>,
        <>Appoint the assurer early. SEBI-registered ESG assurance providers have limited capacity and are booking up months in advance as the Core mandate expands to the top 1000 from FY 2026-27.</>,
      ]} />

      <H2>Common failure modes</H2>
      <P>
        The most common reason for a qualified assurance opinion on BRSR Core KPIs is not a factual error
        in the reported number; it is a missing evidence trail. Data that was estimated, extrapolated, or
        back-calculated without a documented methodology is very difficult to assure to a reasonable level.
        Second most common: using data that cannot be traced to a primary source (for example, a number
        pulled from a management report rather than the underlying HR system export or utility bill).
      </P>
      <Callout title="Saaksh Collect builds the data-ownership trail automatically" color="green">
        When you use Saaksh Collect to request data from a client's team, each submitted value is
        attributed to the named data owner who submitted it, timestamped, and linked to any evidence
        document they upload. The assurance pack export gives you a CSV ledger ready for the assurer.
        This is the Pro tier feature that turns a data collection exercise into an audit-ready package.
      </Callout>

      <H2>Key takeaways</H2>
      <UL items={[
        "BRSR Core covers 42 KPIs across 9 attribute areas. Companies do not file a separate report; the KPIs are within the standard BRSR Annual Report filing.",
        "Reasonable assurance under ISAE 3000 is the default standard for FY 2025-26 for the top 500.",
        "SEBI March 2025 introduced an assessment pathway as an alternative. Read the circular to determine which pathway applies to your client.",
        "ISF sector-specific standards (December 2024) govern how each KPI is measured. Align your methodology to them before data collection starts.",
        "The most common assurance failure is a missing evidence trail, not a wrong number. Build the trail from day one.",
      ]} />

      <FAQ items={[
        {
          q: "How long does a BRSR Core assurance engagement typically take?",
          a: "A well-prepared top-500 company should budget 6 to 10 weeks for the full assurance engagement, including data submission to the assurer, queries and responses, and the final report. Companies with poor data documentation can take 12 to 16 weeks. Starting the assurer appointment by April of the reporting year is strongly recommended."
        },
        {
          q: "Which SEBI-registered bodies can provide BRSR Core assurance?",
          a: "SEBI allows assurance to be provided by SEBI-registered credit rating agencies, practicing CAs or CMAs with ESG assurance expertise, or SEBI-registered ESG rating providers. The assurer must be independent and cannot be the company's statutory auditor for certain engagements."
        },
        {
          q: "What is the difference between reasonable assurance and limited assurance?",
          a: "Reasonable assurance provides a positive conclusion ('the data is, in all material respects, accurate') based on extensive evidence gathering, similar to a financial audit. Limited assurance provides a negative conclusion ('nothing has come to our attention that suggests the data is incorrect') based on lighter procedures. BRSR Core requires reasonable assurance, which is more rigorous and costly."
        },
        {
          q: "Can the assurer be the same firm as the statutory auditor?",
          a: "SEBI's BRSR Core circular does not explicitly prohibit this, but the assurer must be independent. Many companies and audit committees prefer to appoint a separate firm to avoid independence concerns. Confirm with your client's audit committee before recommending a combined appointment."
        },
      ]} />
    </>
  ),

  /* ── Post 8: BRSR data collection guide ───────────────────────────────── */
  "brsr-data-collection-guide": (
    <>
      <P>
        Collecting BRSR data from a client's team is consistently the most time-consuming part of any BRSR
        engagement. The problem is not that the data does not exist; it almost always does. The problem is
        that it lives with different people across different departments, none of whom have been briefed
        on what BRSR requires or why the request is urgent. This guide gives you a practical workflow for
        getting the right numbers from the right people in the shortest possible time.
      </P>

      <H2>Who owns what: the department map</H2>
      <P>
        The first step before sending any request is mapping each BRSR principle to the internal team that
        holds the relevant data. Getting this wrong means your request lands with someone who will forward
        it three times before it reaches the right person, losing a week each time.
      </P>
      <Table
        headers={["BRSR Principle(s)", "Data owner team", "What they hold"]}
        rows={[
          ["P1 (Ethics)", "Company Secretary / Legal", "Board policies, complaints, regulatory fines, advocacy positions"],
          ["P2 (Products & lifecycle)", "Procurement / R&D / EHS", "EPR registrations, packaging data, recycled-input %"],
          ["P3 (Employees)", "HR", "Headcount by type/gender, wages, training hours, H&S incidents, turnover rate"],
          ["P4 (Stakeholders)", "Company Secretary / Corp Affairs", "Stakeholder groups, engagement mechanisms, CSR policy"],
          ["P5 (Human rights)", "HR / Legal", "Gender wage ratio, maternity/paternity, equal-opportunity policy, POSH data"],
          ["P6 (Environment)", "EHS / Plant / Energy Manager", "Fuel consumption, electricity units, water withdrawal, waste, air emissions"],
          ["P7 (Policy advocacy)", "Company Secretary / Government Affairs", "Trade association memberships, advocacy positions"],
          ["P8 (Inclusive development)", "CSR Team", "CSR spend, programmes, beneficiaries, social impact data"],
          ["P9 (Responsible consumption)", "Plant / EHS / Customer service", "Complaints about products, returns, environmental impact of products"],
        ]}
      />

      <H2>Why generic spreadsheet requests fail</H2>
      <P>
        The standard approach of sending one large Excel spreadsheet with all 108 BRSR fields to "whoever
        handles compliance" rarely works. The person who receives it does not know which fields they own,
        the context for why each number is needed, or what unit SEBI expects. The spreadsheet sits in
        an inbox for two weeks, then comes back with ten fields filled and eighty-eight blank, requiring
        multiple follow-up rounds.
      </P>
      <Callout title="Send one focused request per team, not one giant spreadsheet to everyone" color="amber">
        Break the BRSR data collection into five or six targeted requests, one per team, each containing
        only the fields that team owns. Include a clear explanation of what each field means and
        where the team would typically find the data (HR system, EHS register, utility bills). This
        eliminates the "I don't know what you're asking" problem and makes it easy for the recipient to
        forward to a specific sub-team.
      </Callout>

      <H2>What to put in the HR request</H2>
      <P>
        HR typically owns <Mono>P3</Mono> (workforce) and <Mono>P5</Mono> (human rights). A good HR
        request asks for: permanent employees and workers, segmented by male/female and differently-abled;
        contract employees and third-party contractor headcount (this is often missed because staffing-agency
        workers are not in the HRMS); wages paid to permanent employees by gender (total annual payroll,
        not per-person average); training hours per employee per year; occupational health and safety
        incidents including fatalities, injuries, and cases of occupational disease; turnover rate for
        permanent employees.
      </P>
      <P>
        Specify the reporting period (April 2025 to March 2026 for FY 2025-26) explicitly. HR teams
        sometimes default to the calendar year or the most recent quarterly data they have available.
      </P>

      <H2>What to put in the EHS/Plant request</H2>
      <P>
        EHS and plant managers own <Mono>P6</Mono>, which is the most data-intensive section of BRSR.
        Ask for: fuel consumption by type (diesel in litres, LPG in kg, coal in tonnes, furnace oil in
        kL) with monthly breakdowns; grid electricity purchased in kWh, with separate figures for each
        site; water withdrawal by source (groundwater borewell, surface water, municipal supply, rainwater
        harvesting) in kiloliters or megalitres; water discharged (volume and treatment method); hazardous
        waste generated and disposed by route (landfill, incineration, recycling); non-hazardous waste
        totals; air emissions for large stacks (if any consent-to-operate requires monitoring); any
        environmental fines or regulatory notices received during the year.
      </P>
      <P>
        The EHS manager will typically have this data in their CPCB/SPCB compliance registers. Offer to
        extract it yourself if they share the registers — this is faster than waiting for them to compile a
        summary.
      </P>

      <H2>What to put in the Company Secretary request</H2>
      <P>
        The Company Secretary typically holds the Board-level governance data: policies adopted for each of
        the 9 BRSR principles (yes/no, policy document), the process for identifying stakeholders, the
        list of pending regulatory investigations or fines, memberships in trade associations or chambers
        of commerce (P7 policy advocacy), and the CSR annual report (which is already a statutory document
        and contains most of P8 data directly).
      </P>

      <H2>Setting deadlines and sending reminders</H2>
      <P>
        Give each team a specific deadline that is three to four weeks before your own internal deadline
        for producing the draft BRSR. Build in two reminder touchpoints: one at the midpoint and one
        five days before the deadline. The reminder at the midpoint is the most valuable one; it catches
        teams that have not started yet while there is still time to recover.
      </P>
      <UL items={[
        "Use a named point of contact in each team (not the generic info@ or compliance@ mailbox).",
        "Reference the exact BRSR indicator code in each request so the team knows where the data appears.",
        "For top-500 companies requiring BRSR Core assurance, note which fields will be independently verified. This raises the perceived urgency.",
        "Follow up by phone or WhatsApp if email reminders go unanswered for more than three business days.",
      ]} />

      <H2>Key takeaways</H2>
      <UL items={[
        "Map BRSR principles to internal teams before sending any request. The department map above is a starting point.",
        "Send focused, team-specific requests rather than one large spreadsheet. Include context and source hints for each field.",
        "Ask HR for contractor headcount separately from HRMS data. It is almost always missed otherwise.",
        "Ask EHS for monthly utility data, not annual summaries, so you can verify the totals.",
        "Build reminders into your project timeline, not as afterthoughts.",
      ]} />

      <FAQ items={[
        {
          q: "How far in advance should a consultant start data collection for a September BRSR deadline?",
          a: "Start data collection in April or May of the reporting year. This gives 4 to 5 months for the full cycle: collection, review, error-correction, and then BRSR draft preparation. Companies requiring BRSR Core assurance need an even earlier start to allow for the assurance engagement."
        },
        {
          q: "What is the most reliable way to collect energy data from plant teams?",
          a: "Ask for utility meter readings (electricity from EB bills, diesel from fuel purchase records) on a monthly basis. Do not accept annual summaries — they are often rough estimates. Monthly records allow verification: any month that deviates significantly from the average can be investigated before it goes into the BRSR."
        },
        {
          q: "How should a consultant handle a client team that does not respond to data requests?",
          a: "Escalate early to the CFO or Company Secretary. BRSR is an Annual Report compliance obligation, and the responsibility ultimately sits with the board. A single escalation email from the CS to department heads typically resolves weeks of non-response. Framing it as a regulatory obligation, not an advisory project, helps."
        },
      ]} />
    </>
  ),

  /* ── Post 9: BRSR assurance vs assessment ─────────────────────────────── */
  "brsr-assurance-vs-assessment": (
    <>
      <P>
        SEBI's March 28, 2025 circular introduced a significant change to the BRSR Core verification
        framework: "assessment" now exists alongside full "reasonable assurance" as a pathway for
        independently verifying the 42 BRSR Core KPIs. For consultants advising top-500 companies,
        understanding the difference between these two pathways, and which companies can opt for which,
        is essential before your client appoints a verifier.
      </P>

      <H2>Before March 2025: one pathway, one bar</H2>
      <P>
        Before SEBI's March 2025 circular, the only permitted pathway for BRSR Core verification was
        reasonable assurance under ISAE 3000. ISAE 3000 (Assurance Engagements Other than Audits or
        Reviews of Historical Financial Information) is the international standard for non-financial
        assurance. Reasonable assurance under ISAE 3000 requires the assurer to obtain sufficient evidence
        to express a positive opinion, equivalent to a statutory financial audit in terms of the evidence
        burden. This is a high bar, and it was the only option available.
      </P>

      <H2>What the March 2025 circular changed</H2>
      <P>
        SEBI's circular dated March 28, 2025 introduced "assessment" as an alternative pathway. Assessment
        is an evaluation of whether the reported BRSR Core KPIs comply with the sector-specific standards
        published by the Industry Standards Forum (ISF) in December 2024. It is less onerous than ISAE
        3000 reasonable assurance but still requires an independent evaluator and a structured evidence
        review. Assessment is not a self-certification; it requires an independent third party.
      </P>
      <Callout title="An important note on this post" color="amber">
        The specific criteria for which companies can opt for assessment versus which must complete full
        reasonable assurance are detailed in the SEBI circular of March 28, 2025. This post explains the
        framework. Before making a pathway decision for a client, read the circular directly. The circular
        is available on SEBI's website under the ESG/BRSR section.
      </Callout>

      <H2>What assessment involves in practice</H2>
      <P>
        Under the assessment pathway, the independent evaluator reviews whether the company has measured
        each of the 42 Core KPIs in accordance with the relevant ISF sector standard. This includes
        reviewing the measurement methodology, the calculation approach, and whether the reported boundary
        (which sites and activities are included) matches the ISF standard requirements. The evaluator
        issues an assessment report, which is included in the Annual Report alongside the BRSR.
      </P>

      <H2>What full reasonable assurance involves in practice</H2>
      <P>
        Full reasonable assurance under ISAE 3000 goes further. The assurer tests the data at source
        level through site visits, reviews primary documents (utility bills, HR system exports, sub-meter
        readings), traces data from site level to company-level aggregation, evaluates internal controls
        over ESG data, and issues a positive opinion. The scope of work is materially larger than an
        assessment engagement.
      </P>
      <Table
        headers={["", "Assessment", "Reasonable assurance"]}
        rows={[
          ["Standard", "ISF sector-specific standards (December 2024)", "ISAE 3000"],
          ["Opinion type", "Evaluation (compliance with ISF standard)", "Positive opinion (fair presentation)"],
          ["Evidence level", "Methodology review, structured evidence check", "Audit-grade: source data, site visits, controls review"],
          ["Who can perform it", "Independent evaluator per ISF criteria", "SEBI-registered assurance provider"],
          ["How it appears in the Annual Report", "Assessment report", "Assurance Statement (positive opinion)"],
          ["Time to complete", "Typically shorter (4-8 weeks)", "Typically longer (8-16 weeks)"],
        ]}
      />

      <H2>The ISF sector standards: what they are</H2>
      <P>
        The Industry Standards Forum published sector-specific BRSR Core Standards in December 2024.
        These are binding guidance documents that specify how each of the 42 Core KPIs should be
        measured for each sector covered. They address sector-specific issues such as whether GHG
        intensity should be per tonne of product or per unit of energy for a given sector, and how
        water intensity denominators should be defined for water-intensive industries. The ISF standards
        are published on the SEBI website. Reviewing them before data collection begins will save
        significant rework later.
      </P>

      <H2>Timeline for preparation</H2>
      <P>
        Regardless of which pathway your client chooses, start preparation for BRSR Core verification
        at least four to six months before the Annual Report filing deadline. For FY 2025-26, with Annual
        Reports typically due by September or October 2026, that means starting by April 2026 at the
        latest. Companies that approach the assurer or assessment agency in August with incomplete data
        and undocumented methodologies will either miss the deadline or receive a qualified opinion.
      </P>
      <UL items={[
        "By April 2026: data collection launched, named data owners assigned per KPI, ISF sector standard reviewed.",
        "By June 2026: primary source data collected, calculation methodology documented, assurer or assessor appointed.",
        "By July 2026: assurer begins field work or evidence review.",
        "By August 2026: assurance statement or assessment report drafted and reviewed.",
        "By September 2026: opinion finalised, included in draft Annual Report.",
      ]} />

      <H2>Key takeaways</H2>
      <UL items={[
        "SEBI March 2025 introduced assessment as an alternative to full ISAE 3000 reasonable assurance for BRSR Core KPIs.",
        "Assessment is based on ISF sector-specific standards published in December 2024. It requires an independent evaluator but is less onerous than full assurance.",
        "The criteria for who can choose assessment vs must do full assurance are in the SEBI March 28, 2025 circular. Read it before advising a client on pathway choice.",
        "Start verification preparation four to six months before the Annual Report deadline regardless of pathway.",
        "The ISF standards are the reference document for measurement methodology under either pathway.",
      ]} />

      <FAQ items={[
        {
          q: "Can a company choose assessment over full assurance even if they are in the top 500?",
          a: "SEBI's March 2025 circular introduced conditions under which the assessment pathway is available. Whether a specific top-500 company qualifies depends on criteria in that circular. Read the March 28, 2025 SEBI circular carefully or consult a SEBI-registered assurer before advising on pathway selection."
        },
        {
          q: "What is the ISF and why do its standards matter for BRSR Core?",
          a: "ISF stands for IFRS Sustainability Disclosure Standards-related body (or, in this context, SEBI's designated ISF framework body). The ISF sector-specific standards published in December 2024 define exactly how each of the 42 BRSR Core KPIs should be measured. Assurers use these standards as the criteria for their work, so data collection and methodology must be aligned to them from the start."
        },
        {
          q: "How is BRSR assurance different from a financial audit?",
          a: "Financial audits are governed by ISA (International Standards on Auditing) and produce an opinion on whether financial statements present a true and fair view. BRSR Core assurance follows ISAE 3000 (non-financial assurance) and produces an opinion on whether the 42 ESG KPIs are materially accurate. The standards of evidence and procedures are analogous in rigour but the subject matter and specialists differ."
        },
      ]} />
    </>
  ),

  /* ── Post 10: BRSR for IT services companies ───────────────────────────── */
  "brsr-for-it-services": (
    <>
      <P>
        IT and software services companies have a complicated relationship with BRSR. Many of the format's
        most data-intensive sections assume a manufacturing context: smokestacks, effluent treatment plants,
        hazardous waste disposal. But "not applicable" is not a blanket permission to skip half the format.
        Used incorrectly, it invites SEBI scrutiny. Used correctly, it simplifies the filing without
        misrepresenting the company's profile. Here is a precise guide to what is and is not applicable
        for IT services filers.
      </P>

      <H2>Which disclosures IT companies can legitimately mark not applicable</H2>
      <P>
        Eleven Section-C indicators in BRSR are specific to manufacturing operations. For a company that
        is purely a services business (no manufacturing, no physical product, no factory operations),
        each of these can be marked "not applicable" with a brief written justification. The indicators are:
      </P>
      <UL items={[
        <><Mono>P2-E3</Mono>: EPR registration for plastic waste — applies to producers of plastic-packaged goods, not software companies.</>,
        <><Mono>P2-E4</Mono>: Extended Producer Responsibility for e-waste — applies to manufacturers of electronic products.</>,
        <><Mono>P2-L4</Mono>: Producer responsibility for products — manufacturing-specific.</>,
        <><Mono>P2-L5</Mono>: Reclaimable products and packaging — manufacturing-specific.</>,
        <><Mono>P6-E2</Mono>: Air emissions from stacks and fugitive sources — applies to plants with industrial combustion or process emissions.</>,
        <><Mono>P6-E4</Mono>: Volume of effluent generated — applies to wet-process manufacturing.</>,
        <><Mono>P6-E5</Mono>: Zero Liquid Discharge compliance — applies to process industries.</>,
        <><Mono>P6-E6</Mono>: Water body impacts — applies to companies with industrial effluent discharge.</>,
        <><Mono>P6-E11</Mono>: Environmental fines for manufacturing violations — not applicable to non-manufacturers.</>,
        <><Mono>P6-E12</Mono>: Environmental Impact Assessment — required for factory expansions, not office IT operations.</>,
        <><Mono>P6-L3</Mono>: Biodiversity management plan — applies to companies with operations near sensitive ecological areas, typically manufacturers.</>,
      ]} />
      <Callout title="Not applicable requires a written justification" color="amber">
        SEBI does not permit a blank field or a bare "N/A" for these indicators. Each "not applicable"
        must be accompanied by a one-line written justification stating that the company is a services
        business and does not engage in the relevant manufacturing activity. Include the Business Type
        (Services) declaration in Section A as the anchor reference.
      </Callout>

      <H2>What IS applicable and often under-reported by IT companies</H2>
      <P>
        The not-applicable list covers only eleven indicators. The remaining 97 Section-C indicators
        apply to IT companies just as much as to manufacturers. Several of these are consistently
        under-reported or mis-scoped by IT filers:
      </P>
      <Table
        headers={["Indicator", "What IT companies often miss", "Correct approach"]}
        rows={[
          ["P3-E1 Workforce", "Omitting third-party contractors (security, facility management)", "Include all workers on site regardless of employment type"],
          ["P6-E1 GHG (Scope 2)", "Treating office electricity as negligible", "Large IT campuses and data centers can have very significant Scope 2 emissions"],
          ["P6-E7 Energy intensity", "Marking as N/A because there is no physical output", "Use turnover (₹ crore) as the denominator. This indicator is fully applicable."],
          ["P5-E4 Gender wage ratio", "Not extracting payroll by gender from HRMS", "Run a payroll report segmented by gender. This data exists in every HRMS."],
          ["P4-E1 Stakeholder engagement", "Filing a generic list with no evidence of actual engagement", "Document the mechanism (town halls, grievance portal, customer surveys) with frequency"],
        ]}
      />

      <H2>Scope 2 emissions for IT companies: larger than you think</H2>
      <P>
        For a large IT company with multiple campuses and data centers, Scope 2 GHG emissions from grid
        electricity can be the dominant environmental disclosure. A campus consuming 10 million kWh per
        year generates 7,100 tCO2e at the current CEA grid factor of 0.710 kg CO2e/kWh (CEA Version
        21.0). A data center running 24/7 can consume far more. The calculation is straightforward:
      </P>
      <P>
        <Mono>Grid electricity purchased (kWh) × 0.710 ÷ 1,000 = Scope 2 (tCO2e)</Mono>
      </P>
      <P>
        If your client has on-site solar panels, use only the grid import figure (not total consumption)
        for Scope 2. Renewable electricity generated on-site is not counted as Scope 2 under the
        location-based method.
      </P>

      <H2>Energy intensity: the correct denominator for IT</H2>
      <P>
        <Mono>P6-E7</Mono> requires energy intensity: total energy consumed (in gigajoules) divided by
        an appropriate denominator. For IT services companies with no physical output, turnover in
        ₹ crore is the standard denominator. Convert electricity from kWh to GJ using the factor
        3.6 MJ/kWh (1 kWh = 0.0036 GJ). If your client also uses diesel for DG sets, add the diesel
        energy content (approximately 38.65 MJ/litre, per IPCC 2006) before dividing by turnover.
      </P>

      <H2>P3 workforce data: the contractor gap</H2>
      <P>
        IT companies typically have large pools of contract workers: security personnel, cleaning and
        facility management staff, cafeteria workers, and sometimes on-site logistics. These workers
        are usually employed by a third-party contractor and are not tracked in the company's HRMS.
        BRSR <Mono>P3-E1</Mono> requires disclosure of all workers on site, including "other-than-permanent
        workers" sourced from third parties. Collect this headcount from the Facilities or Admin team,
        not HR, and segment it by male/female where possible.
      </P>

      <H2>Key takeaways</H2>
      <UL items={[
        "Eleven Section-C indicators are genuinely not applicable to pure IT services companies. Each requires a written justification, not just a blank.",
        "Scope 2 GHG from office and data center electricity is fully applicable and can be material for large IT companies.",
        "P6-E7 energy intensity uses turnover as the denominator for IT. It is not a manufacturing-only indicator.",
        "Third-party contractor headcount (security, facility management) must be included in P3 workforce disclosures.",
        "Gender wage ratio (P5-E4) requires a payroll report segmented by gender. This data exists in any modern HRMS.",
      ]} />

      <FAQ items={[
        {
          q: "Do IT services companies need to report Scope 1 emissions if they have no manufacturing?",
          a: "Yes, where applicable. IT companies typically have minimal Scope 1, but diesel from backup DG sets and company vehicles are Scope 1 sources. If your client has a fleet, those emissions belong in P6-E1. If they genuinely have zero Scope 1, the BRSR allows reporting zero with a note."
        },
        {
          q: "How should IT companies handle P2 (Products) disclosures?",
          a: "P2 focuses on sustainable products, recycled materials, and waste from product end-of-life. For IT services, most P2 Essential indicators are marked not applicable. P2-E1 (percentage of inputs sourced sustainably) is not applicable to a services company that has no physical inputs. Document the rationale clearly."
        },
        {
          q: "What does 'not applicable' actually mean in BRSR, and how should it be documented?",
          a: "For manufacturing-specific indicators, a services company must mark the field as 'Not Applicable' and provide a brief written justification (e.g., 'Company is a pure IT services provider and does not operate manufacturing facilities or handle physical products'). A blank response without justification is treated as non-disclosure, which is different from a documented not-applicable."
        },
      ]} />
    </>
  ),

  /* ── Post 11: BRSR for textile companies ──────────────────────────────── */
  "brsr-for-textile-companies": (
    <>
      <P>
        Textile companies filing BRSR for FY 2025-26 face a more complex compliance landscape than most
        other sectors. Two major frameworks converge this year: BRSR Core reasonable assurance (if the
        company is in the top 500 by market cap) and the first compliance year of India's Carbon Credit
        Trading Scheme (CCTS), which notified textile companies as an obligated sector in January 2026.
        This guide covers how to manage both obligations without duplicating work.
      </P>

      <H2>Why textile is a high-stakes BRSR sector</H2>
      <P>
        Textile manufacturing generates significant environmental impacts across all three major BRSR
        environmental indicators: energy (heat-intensive dyeing and finishing), water (among the most
        water-intensive manufacturing processes in India), and waste/effluent (dyeing wastewater often
        carries high chemical oxygen demand and colour). Simultaneously, the sector employs a large,
        predominantly female, often contract-heavy workforce, making <Mono>P3</Mono> and <Mono>P5</Mono>
        disclosures especially material. Analysts and ESG rating agencies scrutinise textile BRSR filings
        closely on all of these dimensions.
      </P>

      <H2>The CCTS obligation for textile companies</H2>
      <P>
        India's Carbon Credit Trading Scheme (CCTS), administered by the Bureau of Energy Efficiency
        (BEE), notified textile as one of nine GEI-obligated sectors in January 2026. Obligated textile
        companies must measure their actual GHG emission intensity (GEI, measured in tCO2e per unit of
        production) for FY 2025-26 and submit a verified GHG emission intensity report to BEE by
        July 31, 2026. This is the first compliance year; obligated companies that beat their BEE-set
        GEI target earn Carbon Credit Certificates (CCCs), while those that miss the target must purchase
        CCCs.
      </P>
      <Callout title="CCTS and BRSR P6-E1 use substantially the same underlying data" color="blue">
        The GHG emission intensity data collected for CCTS (fuel consumption, electricity units,
        production volume) is largely the same data required for BRSR <Mono>P6-E1</Mono>. If you
        set up a single data collection workflow that captures monthly fuel and electricity data by
        unit, you can satisfy both obligations from the same source dataset. Do not run two parallel
        data collection exercises.
      </Callout>

      <H2>GHG calculation for textile: what the numbers look like</H2>
      <P>
        For a typical spinning or weaving unit, Scope 1 comes from coal or biomass in boilers and
        diesel in DG sets. Scope 2 comes from grid electricity for looms, dyeing machines, and
        air-conditioning. Standard calculation approach:
      </P>
      <Table
        headers={["Energy source", "Typical unit", "Emission factor", "Source"]}
        rows={[
          ["Coal (thermal)", "Tonnes", "2.27 tCO2e/tonne (94.6 kg CO2/GJ × 0.024 GJ/kg)", "IPCC 2006, Vol.2, Table 2.2"],
          ["Diesel (DG sets)", "Litres", "2.68 kg CO2e/litre", "IPCC 2006, Vol.2, Table 2.2"],
          ["LPG", "kg", "1.56 kg CO2e/kg", "IPCC 2006, Vol.2, Table 2.2"],
          ["Grid electricity", "kWh", "0.710 kg CO2e/kWh", "CEA CO2 Baseline v21.0 (2024)"],
        ]}
      />
      <P>
        Convert all figures to tCO2e (divide kg CO2e by 1,000) before summing. GHG intensity for
        BRSR and CCTS is expressed as tCO2e per tonne of fabric or yarn produced, depending on the
        unit specified in the BEE Target Order for textile.
      </P>

      <H2>Water: the most scrutinised textile disclosure</H2>
      <P>
        Textile dyeing and finishing consumes large volumes of water. <Mono>P6-E3</Mono> requires
        disclosure of total water withdrawal by source (groundwater, surface water, municipal supply,
        rainwater harvesting) in megalitres (ML), along with water intensity (kL per tonne of output or
        per ₹ crore of turnover). Water discharge volume and the treatment method (effluent treatment
        plant, ZLD) are required under <Mono>P6-E4</Mono>. If your client holds a Zero Liquid Discharge
        certification from the State Pollution Control Board, this significantly simplifies the effluent
        disclosure and strengthens the BRSR Core assurance position.
      </P>

      <H2>Workforce: P3 and P5 for a contract-heavy sector</H2>
      <P>
        Textile factories typically have a workforce that is predominantly female at the operator level
        and contract-heavy in certain functions. <Mono>P3-E1</Mono> requires a complete headcount
        segmented by employment type (permanent employees, permanent workers, other-than-permanent
        employees, other-than-permanent workers) and by gender. <Mono>P5-E4</Mono> requires the
        gender wage ratio. This requires payroll data segmented by gender, which HR teams in labour-intensive
        textile factories do not always maintain in an easily extractable format. Budget extra time for
        this extraction.
      </P>

      <H2>Key documentation for BRSR Core assurance in textile</H2>
      <UL items={[
        "Monthly fuel purchase invoices (coal deliveries, diesel receipts) for the full FY 2025-26.",
        "Monthly electricity bills for each unit or sub-meter (separate bills for spinning, weaving, finishing if separately metered).",
        "Monthly production records (tonnes of yarn, fabric, or garment by product type).",
        "Effluent monitoring reports from the CETP or in-house ETP (required quarterly by most PCBs).",
        "Water withdrawal records by source (borewell water flow meter readings, municipal water invoices).",
        "ZLD certification if held (PCB order).",
        "HR system export for headcount and payroll by gender.",
      ]} />

      <H2>Key takeaways</H2>
      <UL items={[
        "Textile companies face both BRSR Core assurance and CCTS obligations in FY 2025-26. Use a single data collection workflow for both.",
        "CCTS requires a verified GHG emission intensity report to BEE by July 31, 2026. Start data collection immediately.",
        "GHG calculation uses IPCC 2006 factors for coal and diesel, and CEA v21.0 (0.710 kg CO2e/kWh) for electricity.",
        "Water and effluent disclosures are material for textile. ZLD certification helps significantly.",
        "P3 and P5 workforce disclosures require payroll segmented by gender. Allow extra time to extract this from HR systems.",
      ]} />

      <FAQ items={[
        {
          q: "Are all textile companies subject to CCTS, or only the largest ones?",
          a: "CCTS applies to approximately 490 designated consumers (DCs) across high energy-intensity sectors, including textiles. Inclusion is based on energy consumption thresholds set by BEE. Not all textile companies are DCs. Your client needs to check with BEE or their state-level energy office to confirm if they are a designated consumer."
        },
        {
          q: "What is the penalty for not meeting a CCTS target?",
          a: "Under the Energy Conservation Act 2022, designated consumers that do not meet their GHG emission intensity targets must either purchase carbon credits from the ICM (Indian Carbon Market) to cover the gap, or face penalties under the act. BEE sets the exact penalty structure in the compliance rules."
        },
        {
          q: "Is water ZLD certification mandatory for BRSR filing?",
          a: "ZLD certification is not mandatory for BRSR filing. However, it helps significantly with the P6-E3 water disclosures because it provides independently verified water consumption and treatment data. Textile companies without ZLD face more scrutiny on effluent quality disclosures."
        },
      ]} />
    </>
  ),

  /* ── Post 12: BRSR value chain disclosure ─────────────────────────────── */
  "brsr-value-chain-disclosure": (
    <>
      <P>
        Value chain disclosure is the next major frontier in BRSR. After two years of building the
        internal BRSR reporting discipline, listed companies are now expected to extend that discipline
        to their key suppliers and customers. SEBI's March 2025 circular clarified the scope,
        timeline, and mechanics in ways that significantly affect how consultants should be advising
        clients this year.
      </P>

      <H2>The timeline: what changed in March 2025</H2>
      <P>
        Before SEBI's March 2025 circular, value chain ESG disclosures were expected to follow a
        "comply-or-explain" approach for FY 2024-25. The March 2025 circular changed this: value chain
        disclosure is now purely voluntary for FY 2025-26 and will become mandatory from FY 2026-27.
        This one-year extension gives listed companies time to prepare and gives their supply chain
        partners time to build ESG data collection capability before the mandatory deadline arrives.
      </P>
      <Table
        headers={["Financial Year", "Value chain ESG disclosure status"]}
        rows={[
          ["FY 2024-25", "Expected on comply-or-explain basis (before March 2025 circular)"],
          ["FY 2025-26", "Voluntary (SEBI March 2025 circular changed the expectation)"],
          ["FY 2026-27", "Mandatory for companies required to file BRSR Core"],
        ]}
      />

      <H2>Which value chain partners are in scope</H2>
      <P>
        SEBI's March 2025 circular provides a specific and important clarification on scope. Value chain
        partners are in scope if they individually account for 2% or more of the company's total purchases
        or sales. The aggregate coverage is capped at 75%: once you have identified enough partners to
        cover 75% of total purchases and sales, you stop even if there are more partners above the 2%
        threshold individually. You apply whichever of the two criteria results in the smaller number
        of partners.
      </P>
      <P>
        This 2% threshold meaningfully narrows the scope compared to what was originally feared. For
        a large manufacturer, it typically captures between 8 and 20 key Tier-1 suppliers and the same
        number of large customers, not the entire supply chain.
      </P>
      <Callout title="What 'disclosure' means for value chain partners" color="blue">
        In-scope value chain partners do not need to file a full 108-indicator BRSR. The expectation
        is disclosure against the BRSR Core KPIs (42 indicators) under the assessment framework,
        not full reasonable assurance. This is a more manageable ask for MSME suppliers who have
        never produced an ESG report.
      </Callout>

      <H2>Who collects the data</H2>
      <P>
        The listed company is responsible for collecting ESG data from its in-scope value chain partners
        and disclosing it in its own BRSR. This does not mean the listed company generates or certifies
        the partner's data: the partner provides the data, the listed company reports it (with a note
        on how it was collected and verified), and the listed company's assurer may review the
        collection methodology as part of the BRSR Core assurance engagement.
      </P>
      <P>
        This creates a direct advisory opportunity. The listed company needs to brief its key suppliers
        on what data is required, in what format, and by what deadline. Suppliers who have never
        produced ESG data need hand-holding through the first collection cycle. That is consulting work.
      </P>

      <H2>The green credits addition from March 2025</H2>
      <P>
        SEBI's March 2025 circular added a <Mono>P6</Mono> Leadership indicator requiring companies
        to disclose green credits generated by their top 10 value chain partners by procurement value.
        For companies that choose to disclose voluntarily in FY 2025-26, this indicator is part of the
        scope. For the consultant, this means identifying whether any key suppliers have earned green
        credits under India's Green Credit Programme (GCP) or the CCTS, and collecting that data as
        part of the value chain ESG exercise.
      </P>

      <H2>Why starting in FY 2025-26 (voluntarily) is worth advising</H2>
      <P>
        The companies that will struggle most with mandatory value chain disclosure in FY 2026-27 are
        those that do nothing in FY 2025-26 and then have to simultaneously identify in-scope partners,
        educate them on BRSR, build data collection workflows, chase submissions, and have the data
        reviewed by their assurer, all in one year. The companies that use FY 2025-26 to run a pilot
        with three to five key suppliers will enter FY 2026-27 with a tested workflow, educated partners,
        and a baseline dataset.
      </P>
      <UL items={[
        "In Q1 FY 2025-26: map your client's top suppliers and customers by purchase/sales value. Identify the 2% threshold partners.",
        "In Q2: brief those partners on what ESG data will be requested from FY 2026-27. Share a simple data request template.",
        "In Q3: run a voluntary pilot data collection with two or three willing partners to test the workflow.",
        "In Q4: use the pilot experience to refine the process for the mandatory FY 2026-27 run.",
      ]} />

      <H2>Key takeaways</H2>
      <UL items={[
        "Value chain disclosure is voluntary in FY 2025-26 and mandatory from FY 2026-27 for BRSR Core companies.",
        "In-scope partners are those individually at 2% or more of purchases or sales, capped at 75% aggregate.",
        "Partners disclose against BRSR Core KPIs under the assessment framework, not the full 108-indicator BRSR.",
        "The listed company collects and reports the partner data in its own BRSR.",
        "Use FY 2025-26 as a voluntary pilot year to build the workflow before it becomes mandatory.",
      ]} />

      <FAQ items={[
        {
          q: "Who exactly counts as a value-chain partner under BRSR?",
          a: "SEBI defines value-chain partners as suppliers and customers that individually account for 2% or more of the listed company's total purchases or sales in a financial year, with the total scope capped at 75% of aggregate purchases or sales. The partners who cross the 2% threshold but would push coverage above 75% are excluded."
        },
        {
          q: "What if a key supplier refuses to provide ESG data?",
          a: "The BRSR format allows the listed company to note that a partner did not provide data. However, persistent non-response from a major supplier can become a business risk: large listed companies with sustainability commitments are starting to make ESG data availability a supplier qualification criterion. The Saaksh Collect feature is designed to make the data request process as easy as possible for suppliers to respond to."
        },
        {
          q: "Does value chain disclosure require the supplier to file BRSR themselves?",
          a: "No. The supplier does not need to file a standalone BRSR. They only need to provide the data required by the listed company's BRSR Core KPIs. The listed company collects and reports this data as part of its own BRSR filing."
        },
      ]} />
    </>
  ),

  /* ── Post 13: BRSR water disclosure calculation ────────────────────────── */
  "brsr-water-disclosure-calculation": (
    <>
      <P>
        Water is one of the three headline environmental KPIs in BRSR Core assurance, alongside GHG and
        energy. Yet water disclosures consistently generate the most revision rounds during data
        collection, partly because the format distinguishes between withdrawal, consumption, and discharge
        in ways that are easy to conflate, and partly because water data is often scattered across utility
        invoices, borewell logs, and ETP records that no single team maintains in one place. This guide
        walks through the calculation, the common mistakes, and a worked example.
      </P>

      <H2>The relevant BRSR indicators</H2>
      <P>
        Water disclosures appear in two Essential indicators and one Leadership indicator in Section C:
        <Mono>P6-E3</Mono> requires total water withdrawal by source and total water consumption, along
        with water intensity (Essential). <Mono>P6-E4</Mono> covers effluent generation and treatment
        (Essential). <Mono>P6-L1</Mono> covers water discharge quality parameters (Leadership, required
        only for companies with three or more years of BRSR filing or in the top 1000).
      </P>

      <H2>Withdrawal vs consumption vs discharge: the distinction that matters</H2>
      <P>
        BRSR follows the Water Footprint Network and GHG Protocol water accounting approach. Water
        withdrawal is the total volume of water taken from all sources. Water consumption is the volume
        of water that does not return to the source catchment (it is incorporated into the product,
        evaporated, or otherwise not discharged). Water discharge is the volume of treated or untreated
        effluent released. The relationship is:
      </P>
      <P>
        <Mono>Water consumption = Water withdrawal minus Water discharged</Mono>
      </P>
      <P>
        Many first-time filers report only withdrawal and omit consumption, or conflate withdrawal with
        consumption. SEBI expects both figures. For Zero Liquid Discharge certified facilities,
        consumption equals withdrawal (no discharge), which simplifies the calculation.
      </P>

      <H2>Water sources to disclose</H2>
      <Table
        headers={["Source", "How to measure", "Common mistake"]}
        rows={[
          ["Groundwater (borewells)", "Flow meter readings on borewell pumps; monthly log maintained by EHS/facility", "Omitting borewell volumes because they are not billed"],
          ["Surface water (rivers/lakes)", "Consent-to-Operate water allocation; flow meter at intake point", "Using the allocation limit rather than actual withdrawal"],
          ["Third-party supply (MIDC/municipal)", "Monthly utility invoices (kL or m³)", "Treating this as the only source and ignoring groundwater"],
          ["Rainwater harvested", "Volume stored in harvesting structures; maintenance records", "Reporting capacity of the structure, not actual volume harvested"],
          ["Seawater / desalinated water", "Meter on intake or desalination plant output", "Typically applicable only to coastal industrial units"],
        ]}
      />

      <H2>Unit conversions to get right</H2>
      <P>
        BRSR typically expresses water volumes in megalitres (ML). Utility invoices are often in
        kiloliters (kL) or cubic meters (m³). The conversions are: 1 ML = 1,000 kL = 1,000 m³ =
        1,000,000 litres. Water intensity is typically expressed in kL per tonne of output (for
        manufacturing) or kL per ₹ crore of revenue (for services). Do not mix ML and kL in the
        same row of the BRSR disclosure.
      </P>

      <H2>The intensity denominator: SEBI's guidance</H2>
      <P>
        SEBI's guidance on the intensity denominator distinguishes by sector. For manufacturing companies,
        the preferred denominator is per unit of production (kL per tonne of steel, kL per metre of
        fabric). For services companies and for manufacturers where physical output is difficult to
        normalise (diversified conglomerates), turnover per ₹ crore is an acceptable alternative.
        If your client reports both a physical output intensity and a turnover intensity, that adds
        credibility and is worth recommending.
      </P>
      <Callout title="Assurers check whether the denominator is consistent with prior years" color="amber">
        A common assurance finding is that the company changed its intensity denominator between years
        (for example, from tonnes of finished product to tonnes of raw material processed) without
        disclosing the change. If your client needs to change the denominator for legitimate reasons,
        include a note explaining the change and, if possible, provide a restated prior-year figure
        using the new denominator.
      </Callout>

      <H2>Worked example: a mid-size steel plant</H2>
      <P>
        Consider a mid-size steel plant producing 50,000 tonnes of finished steel per year. Annual
        water withdrawal data is as follows: groundwater (borewells): 90 ML; municipal supply
        (MIDC): 60 ML; rainwater harvested: 30 ML. Total withdrawal: 180 ML. Water discharged after
        treatment: 36 ML (20% of withdrawal recycled to the neighbouring industrial estate). Water
        consumed: 180 ML minus 36 ML = 144 ML. Water intensity: 180,000 kL divided by 50,000 tonnes
        = 3.6 kL per tonne of steel.
      </P>
      <Table
        headers={["Metric", "Value", "Unit"]}
        rows={[
          ["Total water withdrawal", "180", "ML"],
          ["Groundwater", "90", "ML"],
          ["Municipal supply", "60", "ML"],
          ["Rainwater harvested", "30", "ML"],
          ["Water discharged (treated)", "36", "ML"],
          ["Water consumed", "144", "ML"],
          ["Annual production", "50,000", "Tonnes of steel"],
          ["Water intensity", "3.6", "kL per tonne of steel"],
        ]}
      />

      <H2>Key takeaways</H2>
      <UL items={[
        "Disclose withdrawal, consumption, AND discharge separately. Consumption = withdrawal minus discharge.",
        "Collect groundwater borewell volumes proactively from EHS/facilities. They are not in any invoice.",
        "Use ML for volumes in the BRSR disclosure. Convert kL figures by dividing by 1,000.",
        "BRSR Core assurance will check whether the intensity denominator is consistent with prior years and whether it aligns with the ISF sector standard.",
        "ZLD-certified facilities: water consumption equals water withdrawal (no discharge). State the ZLD certification clearly.",
      ]} />

      <FAQ items={[
        {
          q: "What is the difference between water withdrawal and water consumption in BRSR?",
          a: "Water withdrawal is the total volume taken from any source (municipal, groundwater, rainwater, surface). Water consumption is the volume that is not returned to any source after use (it evaporates, is incorporated into the product, or is lost). Discharge is what is returned. The relationship is: Consumption = Withdrawal minus Discharge."
        },
        {
          q: "Does my client need to report water stress area information?",
          a: "Yes, if any operational site is in a water-stressed area. BRSR P6-E3 asks for water withdrawal and consumption separately for water-stressed areas. Sites are identified as water-stressed using CGWB (Central Ground Water Board) designation or the WRI Aqueduct Water Risk Atlas. This is a Leadership-level indicator for some categories."
        },
        {
          q: "What is the correct unit for BRSR water disclosures?",
          a: "BRSR P6-E3 requires water disclosure in Megalitres (ML). Many companies collect data in kilolitres (kL) or cubic metres (m³). The conversion is: 1 kL = 0.001 ML, and 1 m³ = 1 kL. Divide kL figures by 1,000 to get ML. A common error is reporting in kL without converting, making the figures appear 1,000 times larger than actual."
        },
        {
          q: "How should rainwater harvesting be classified?",
          a: "Rainwater harvested and collected on-site counts as water withdrawal from 'rainwater/other' sources. If the rainwater is used directly without discharge, it also counts towards water consumption. Many companies under-report rainwater because it does not appear in any invoice, so it requires a dedicated data request to the EHS or facilities team."
        },
      ]} />
    </>
  ),

  /* ── Post 14: CCTS India 2025-26 ──────────────────────────────────────── */
  "ccts-india-2025-26": (
    <>
      <P>
        India's Carbon Credit Trading Scheme crossed from theory into practice in 2025-26. With the first
        verified GHG emission intensity reports due to BEE by July 31, 2026, obligated companies in nine
        sectors need to move quickly. For consultants who have been preparing BRSR filings for
        manufacturing clients, CCTS is both a natural extension of that work and a distinct new
        compliance obligation with its own verification requirements and commercial consequences.
      </P>

      <H2>What CCTS is and where it comes from</H2>
      <P>
        The Carbon Credit Trading Scheme (CCTS) is India's national carbon market framework, notified by
        the Ministry of Environment, Forest and Climate Change (MoEFCC) under the Energy Conservation
        (Amendment) Act 2022. The Bureau of Energy Efficiency (BEE) is the implementing agency.
        BEE sets sector-specific GHG emission intensity (GEI) targets for each obligated sector through
        what are called GEI Target Orders. Obligated entities that achieve their GEI target earn Carbon
        Credit Certificates (CCCs), which can be traded on the Indian Carbon Market (ICM). Those that
        miss the target must purchase sufficient CCCs to cover the shortfall.
      </P>

      <H2>Which nine sectors are obligated</H2>
      <P>
        BEE notified the nine obligated sectors in two tranches. The first four sectors were notified
        in October 2025: aluminium, cement, chlor-alkali, and pulp and paper. The remaining five sectors
        followed in January 2026: petroleum refining, petrochemicals, textiles, iron and steel, and
        fertilisers. Approximately 490 entities across these nine sectors are obligated in the first
        compliance year. The exact list of obligated entities is maintained by BEE and can change as
        BEE updates its assessments.
      </P>
      <Table
        headers={["Sector group", "Notification date", "Sectors"]}
        rows={[
          ["Tranche 1", "October 2025", "Aluminium, Cement, Chlor-alkali, Pulp and paper"],
          ["Tranche 2", "January 2026", "Petroleum refining, Petrochemicals, Textiles, Iron and steel, Fertilisers"],
        ]}
      />

      <H2>What obligated companies must do this year</H2>
      <P>
        For FY 2025-26 (the first compliance year), obligated entities must: measure their actual GHG
        emission intensity for the full financial year (April 2025 to March 2026); have that GEI
        measurement independently verified by a BEE-accredited third-party verification agency
        following ISO 14064-3 or equivalent; and submit the verified GHG emission intensity report to
        BEE by July 31, 2026.
      </P>
      <Callout title="The July 31, 2026 deadline is tight. Start immediately." color="amber">
        Engaging a BEE-accredited verification agency, collecting twelve months of fuel and electricity
        data, getting the data verified, and filing with BEE by July 31, 2026 requires starting the
        process no later than March 2026. Companies that wait until May or June risk either missing the
        deadline or submitting unverified data, both of which carry enforcement risk under the Energy
        Conservation Act.
      </Callout>

      <H2>The CCTS-BRSR overlap: avoiding double work</H2>
      <P>
        The GHG data required for CCTS is substantially the same as the data required for BRSR
        <Mono>P6-E1</Mono> (GHG emissions, Scope 1 and Scope 2). Both require monthly fuel consumption
        by type, monthly electricity units purchased, production volume (as the intensity denominator),
        and cited emission factors with version references. The key difference is that CCTS requires
        GHG intensity expressed at the entity or plant level (tCO2e per unit of production for the
        specific product), while BRSR P6-E1 can be at the company level. For a single-product
        manufacturer, these are the same calculation. For a diversified manufacturer, some allocation
        methodology is required.
      </P>
      <P>
        The practical advice: build a single data collection workflow that captures monthly energy
        and production data in enough detail to satisfy both requirements. If your client uses Saaksh
        Collect for BRSR data collection, the fuel and electricity inputs that feed the BRSR GHG
        calculator are the same inputs needed for the CCTS GEI report.
      </P>

      <H2>When CCC trading starts and what it means commercially</H2>
      <P>
        CCC trading on the Indian Carbon Market (ICM) is expected to begin in October 2026 (delayed
        from the originally planned April 2025 start). Obligated entities that beat their BEE GEI
        target in FY 2025-26 will receive CCCs that can be sold on the ICM from October 2026. Those
        that miss the target must buy sufficient CCCs to cover the shortfall before the compliance
        deadline. The price of CCCs will be set by the market, but early estimates from government
        consultations suggest an indicative range of ₹200 to ₹400 per CCC (each CCC represents one
        tonne of CO2 equivalent).
      </P>

      <H2>The EU CBAM connection</H2>
      <P>
        There are ongoing discussions between India and the EU about whether BEE-verified CCTS data
        could be recognised under the EU's Carbon Border Adjustment Mechanism (CBAM). If recognised,
        Indian exporters in the nine CCTS sectors who export to the EU could use their BEE-verified
        GHG intensity data to satisfy the CBAM embedded-emissions reporting requirement, potentially
        reducing their EU importers' CBAM certificate obligations. These discussions are ongoing and
        no formal agreement has been reached. However, the data trail being built for CCTS verification
        (monthly fuel data, sub-meter readings, verified GEI report) is exactly the data trail that
        EU importers would need for CBAM in any case.
      </P>

      <H2>Key takeaways</H2>
      <UL items={[
        "Nine sectors (approximately 490 entities) are obligated under CCTS from FY 2025-26: aluminium, cement, chlor-alkali, pulp and paper, petroleum refining, petrochemicals, textiles, iron and steel, fertilisers.",
        "Obligated entities must submit a BEE-verified GHG emission intensity report by July 31, 2026.",
        "Verification must be done by a BEE-accredited verification agency following ISO 14064-3 or equivalent.",
        "The underlying data for CCTS is substantially the same as BRSR P6-E1. Build one workflow to satisfy both.",
        "CCC trading is expected to begin October 2026. Companies that beat their GEI target earn tradeable CCCs.",
      ]} />

      <FAQ items={[
        {
          q: "How many companies are covered by CCTS in India?",
          a: "BEE has notified approximately 490 designated consumers (DCs) across the high energy-intensity sectors covered by CCTS. These include steel, cement, aluminium, textiles, chemicals, paper and pulp, chlor-alkali, and a few others. The DC list is updated periodically by BEE as energy consumption data changes."
        },
        {
          q: "What is a GEI target and how is it set?",
          a: "GEI (Greenhouse Gas Emission Intensity) targets specify the maximum tCO2e allowed per unit of physical output (e.g., per tonne of steel or per metre of fabric) for a given year. BEE sets these based on a baseline period and a trajectory toward India's NDC (Nationally Determined Contribution) goals. Each sector has sector-specific targets."
        },
        {
          q: "What happens to carbon credits (CCCs) generated from CCTS overperformance?",
          a: "Companies that emit less than their GEI target earn Carbon Credit Certificates (CCCs). These can be traded on the Indian Carbon Market (ICM) managed by BEE and the national exchange. Trading is expected to begin in October 2026. Companies that exceed their GEI target must purchase CCCs to cover the shortfall or pay a penalty."
        },
        {
          q: "Is CCTS the same as a carbon tax?",
          a: "No. CCTS is a cap-and-trade system based on emission intensity targets, not a carbon tax. There is no per-tonne fee on emissions; instead, companies receive intensity targets and trade certificates to settle over- or under-performance. A carbon tax applies a fixed price per tonne regardless of targets."
        },
      ]} />
    </>
  ),

  /* ── Post 15: BRSR materiality assessment guide ────────────────────────── */
  "brsr-materiality-assessment-guide": (
    <>
      <P>
        Materiality assessment is one of the most misunderstood requirements in BRSR. The format does
        not prescribe a specific methodology, but it does require evidence of a process: identifying
        stakeholders, engaging them, and determining which ESG topics are material to the company and
        its stakeholders. Only 34% of BSE 100 companies publicly disclose their materiality assessment
        methodology, according to WBCSD India's 2024 review. The rest either skip the disclosure or
        present a pre-screened topic list without evidence of a genuine stakeholder process. Here is
        how to build one that is defensible.
      </P>

      <H2>What BRSR actually requires</H2>
      <P>
        Principle 4 of BRSR (Stakeholder Engagement) requires companies to identify their material
        stakeholders and describe the process through which they engage with them. The broader BRSR
        format implicitly requires identification of material ESG topics because the Section B management
        disclosures ask about policies, targets, and governance structures for ESG issues. A defensible
        materiality assessment needs to demonstrate both "outside-in" materiality (which ESG topics
        could affect the company's financial performance) and "inside-out" materiality (what impact
        does the company's activity have on the environment and society). This is broadly similar to the
        double materiality concept formalised under the EU's CSRD, but is less prescriptive in the
        BRSR context.
      </P>

      <H2>Step 1: Stakeholder mapping</H2>
      <P>
        BRSR identifies six stakeholder groups that companies are expected to engage: communities
        (affected by the company's operations), employees (permanent and contract), shareholders and
        investors, regulators, customers, and value chain partners (suppliers and distributors). Before
        running the assessment, map which specific groups within each category are most relevant to your
        client. For a cement manufacturer, "communities" means the villages within 5 km of the plant,
        not communities in general. For an IT company, "employees" may be the most material stakeholder
        group given the company's impact profile.
      </P>
      <Callout title="A stakeholder survey is not the same as a materiality assessment" color="amber">
        Many companies run a generic employee engagement survey and call it a materiality assessment.
        SEBI expects an actual assessment of which ESG topics are material: a structured process with
        a topic list, a scoring method, and a clear definition of what "material" means for this
        company. The survey is one input into that process, not the process itself.
      </Callout>

      <H2>Step 2: Build the topic list</H2>
      <P>
        Start with the GRI Universal Standards topic list, which covers all major ESG topics across
        environment, social, and governance. Then add sector-specific topics from NSE's sector-specific
        ESG guides or from the BRSR principle structure itself (P1 ethics, P2 products, P3 employees,
        P4 stakeholders, P5 human rights, P6 environment, P7 policy advocacy, P8 inclusive development,
        P9 responsible consumption). For manufacturing clients, add sector-specific regulatory topics:
        effluent standards, PCB consents, EPR obligations, energy efficiency targets. The final topic
        list is typically 30 to 60 items before prioritisation.
      </P>

      <H2>Step 3: Assess impact and financial materiality</H2>
      <P>
        Score each topic on two dimensions. Impact materiality: how significant is the company's
        positive or negative impact on the environment or society through this topic (scale 1 to 5)?
        Financial materiality: how likely is this topic to affect the company's revenues, costs,
        access to capital, or license to operate (scale 1 to 5)? These scores can come from
        management assessment, stakeholder input, or expert review. Plot the results on a 5x5 matrix.
        Topics in the upper-right quadrant (high impact, high financial materiality) are material.
      </P>
      <Table
        headers={["Score combination", "Typical materiality outcome"]}
        rows={[
          ["Impact 4-5 AND Financial 4-5", "Clearly material: include in BRSR disclosures and strategic targets"],
          ["Impact 4-5 OR Financial 4-5 (not both)", "Likely material: include with monitoring commitment"],
          ["Impact 2-3 AND Financial 2-3", "Watch list: monitor but may not require dedicated disclosure"],
          ["Impact 1-2 AND Financial 1-2", "Not material for current reporting period: justify exclusion"],
        ]}
      />

      <H2>Step 4: Stakeholder consultation</H2>
      <P>
        The scoring in step 3 is management's starting point, not the final answer. SEBI expects
        evidence that the company consulted relevant stakeholders about which topics they consider
        material. The minimum acceptable process: a structured survey or interview with at least one
        representative group from each of the six BRSR stakeholder categories, with documented
        responses. For smaller companies, this can be done through existing touchpoints (the AGM for
        shareholders, a focus group with plant workers, a supplier meeting). The output is an adjusted
        materiality matrix that incorporates stakeholder perspectives alongside management's own
        assessment.
      </P>

      <H2>Step 5: Document and disclose</H2>
      <P>
        What goes into the BRSR disclosure: the list of topics assessed, the stakeholder groups
        consulted and how, the methodology used for scoring, the date of the last assessment
        (SEBI expects this to be updated at least every two to three years), and the final list of
        material topics with a brief rationale for each. The materiality matrix itself (a visual
        plot of all topics) is a best practice addition that many assurers and analysts appreciate.
      </P>

      <H2>The shortlist trap: what not to do</H2>
      <P>
        The most common mistake is presenting a pre-screened topic list (for example, "our material
        topics are climate change, employee wellbeing, and ethics") without any evidence of the
        process that produced it. This is sometimes called the "shortlist trap": the consultant or
        management team selected topics based on industry norms or what other companies disclose,
        without running an actual assessment. SEBI's language in the BRSR format refers to an
        assessment process. An assurer reviewing BRSR Core KPIs will look for evidence that a process
        was run, not just a topic list.
      </P>
      <Callout title="Saaksh's free tool provides a suggested materiality shortlist" color="green">
        Saaksh's Suggested Materiality tab generates an industry-specific shortlist of likely material
        ESG topics as a starting point for the materiality process. It is explicitly framed as a
        starting point, not a finished assessment. A genuine BRSR-compliant assessment requires the
        stakeholder engagement process described above. Use the Saaksh shortlist to populate the topic
        list in step 2, then run the scoring and stakeholder consultation steps on top of it.
      </Callout>

      <H2>Key takeaways</H2>
      <UL items={[
        "BRSR requires evidence of a materiality assessment process, not just a topic list. The process must include stakeholder consultation.",
        "Map six BRSR-defined stakeholder groups before starting: communities, employees, shareholders, regulators, customers, value chain partners.",
        "Score topics on two dimensions: impact materiality (inside-out) and financial materiality (outside-in).",
        "Adjust management scores with input from at least one representative from each stakeholder group.",
        "Disclose the methodology, stakeholder groups consulted, date of assessment, and final material topics in the BRSR.",
        "The shortlist trap: a pre-screened topic list without a documented process will not satisfy SEBI or an assurer.",
      ]} />

      <FAQ items={[
        {
          q: "Is a materiality assessment mandatory for BRSR?",
          a: "BRSR does not explicitly mandate a standalone materiality assessment as a separate deliverable, but Section B of the BRSR asks companies to describe their materiality assessment approach. Under BRSR Core assurance, assurers look for evidence of a genuine assessment process when auditing governance-related KPIs. Companies without one are at risk of a qualified assurance opinion."
        },
        {
          q: "How often should a company update its materiality assessment?",
          a: "SEBI expects the materiality assessment to be updated at least every two to three years, or more frequently if there are significant changes to the business (new products, new markets, major acquisitions) or the regulatory environment (SEBI amendments, new ESG risks). For most clients, a full update every two years with an annual review of the top material topics is appropriate."
        },
        {
          q: "Can a materiality assessment for one ESG framework (e.g., GRI) be used for BRSR?",
          a: "Yes, with adaptation. GRI-based materiality assessments (which use the double materiality concept: impact materiality and financial materiality) are compatible with BRSR's requirements. The main adaptation needed is mapping the GRI material topics to the BRSR principle structure (P1 to P9) and ensuring the six BRSR stakeholder categories are covered in the stakeholder consultation."
        },
        {
          q: "What is the 'shortlist trap' and how do consultants avoid it?",
          a: "The shortlist trap is when a consultant or management team pre-selects material topics (typically based on industry norms or what other companies report) without documenting an actual assessment process. An assurer reviewing the BRSR will ask for evidence of how topics were scored and which stakeholders were consulted. The Saaksh materiality shortlist is explicitly positioned as a starting point for step 2 (topic list), not a finished assessment."
        },
        {
          q: "Which stakeholder groups must be included in a BRSR materiality process?",
          a: "BRSR defines six stakeholder groups: communities (local communities near operations), employees, shareholders and investors, regulators, customers and consumers, and value chain partners (suppliers and buyers). At minimum, the assessment should include input from one representative group from each category."
        },
      ]} />
    </>
  ),
};
