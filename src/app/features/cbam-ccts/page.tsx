import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "CBAM & CCTS Readiness — Saaksh",
  description:
    "Know if your client is in scope for the EU Carbon Border Adjustment Mechanism or India's Carbon Credit Trading Scheme — and what to prepare, cited to official sources.",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E5E9F0",
  borderRadius: "12px",
  boxShadow:
    "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)",
};

const CBAM_SECTORS = [
  "Iron & steel",
  "Cement",
  "Aluminium",
  "Fertilizers",
  "Hydrogen",
  "Electricity",
];

const CCTS_SECTORS = [
  "Aluminium",
  "Cement",
  "Chlor-alkali",
  "Fertilizer",
  "Iron & steel",
  "Paper & pulp",
  "Petrochemicals",
  "Petroleum refinery",
  "Textile",
];

const CBAM_CHECKLIST = [
  "Confirm CN codes for exported products against CBAM Regulation Annex I",
  "Calculate embedded emissions per tonne of covered product (Scope 1 + Scope 2, allocated to the product)",
  "Prepare a data package: fuel consumption, electricity, emission factors with version citations, allocation methodology",
  "Coordinate with EU importers — they must declare your embedded emissions to customs",
];

const CCTS_CHECKLIST = [
  "Confirm GEI target assignment from Bureau of Energy Efficiency (BEE)",
  "Establish baseline energy consumption per unit of output for the target period",
  "Set up metering for all covered energy inputs (electricity, fuel, steam)",
  "Document methodology per BEE GEI target guidance documents",
];

export default function CbamCctsPage() {
  return (
    <main
      style={{
        background: "#FBFCFE",
        minHeight: "100vh",
        fontFamily: "inherit",
      }}
    >
      <SiteHeader active="tools" />

      <section
        style={{
          background: "#0F1E33",
          marginTop: "24px",
          padding: "72px 24px 80px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              background: "#EFF3FA",
              color: "#5B6573",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              borderRadius: "6px",
              padding: "3px 10px",
              marginBottom: "20px",
            }}
          >
            Free — in the Beyond BRSR tab
          </span>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(32px, 4.5vw, 52px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 16px",
            }}
          >
            CBAM & CCTS Readiness
          </h1>
          <p
            style={{
              color: "#94A8C0",
              fontSize: "17px",
              lineHeight: 1.6,
              maxWidth: "600px",
              margin: 0,
            }}
          >
            Know if your client is in scope for the EU Carbon Border Adjustment
            Mechanism or India's Carbon Credit Trading Scheme — and what to
            prepare, cited to official sources.
          </p>
        </div>
      </section>

      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}
      >
        <section style={{ paddingTop: "56px" }}>
          <h2
            style={{
              color: "#0F172A",
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 24px",
            }}
          >
            Two regulatory regimes to watch
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={cardStyle}>
              <div style={{ padding: "24px 24px 20px" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: "#EAF4FE",
                    color: "#0B5FB0",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    marginBottom: "14px",
                  }}
                >
                  EU
                </span>
                <h3
                  style={{
                    color: "#0F172A",
                    fontSize: "18px",
                    fontWeight: 700,
                    margin: "0 0 10px",
                  }}
                >
                  EU CBAM
                </h3>
                <p
                  style={{
                    color: "#28303B",
                    fontSize: "14px",
                    lineHeight: 1.65,
                    margin: "0 0 16px",
                  }}
                >
                  The EU's Carbon Border Adjustment Mechanism puts a carbon
                  price on imports of covered goods from countries without
                  equivalent carbon pricing. From 1 January 2026, it's in its
                  definitive phase. EU importers must purchase CBAM certificates
                  based on the embedded emissions in what they import.
                </p>
                <p
                  style={{
                    color: "#5B6573",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    margin: "0 0 8px",
                  }}
                >
                  Saaksh checks
                </p>
                <p
                  style={{
                    color: "#28303B",
                    fontSize: "13px",
                    lineHeight: 1.55,
                    margin: "0 0 16px",
                  }}
                >
                  Does the client's sector map to a covered CN code? Do they
                  export to the EU?
                </p>
                <p
                  style={{
                    color: "#5B6573",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    margin: "0 0 10px",
                  }}
                >
                  Covered sectors
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {CBAM_SECTORS.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "#EFF3FA",
                        color: "#28303B",
                        fontSize: "12px",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        border: "1px solid #E5E9F0",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ padding: "24px 24px 20px" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: "#F6ECD8",
                    color: "#8A6516",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    marginBottom: "14px",
                  }}
                >
                  India
                </span>
                <h3
                  style={{
                    color: "#0F172A",
                    fontSize: "18px",
                    fontWeight: 700,
                    margin: "0 0 10px",
                  }}
                >
                  India CCTS
                </h3>
                <p
                  style={{
                    color: "#28303B",
                    fontSize: "14px",
                    lineHeight: 1.65,
                    margin: "0 0 16px",
                  }}
                >
                  India's Carbon Credit Trading Scheme establishes a domestic
                  carbon market. GEI (Greenhouse Gas Emission Intensity)
                  reduction targets are set for the 9 most energy-intensive
                  sectors. Companies in these sectors that outperform their
                  targets earn tradeable carbon credits.
                </p>
                <p
                  style={{
                    color: "#5B6573",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    margin: "0 0 8px",
                  }}
                >
                  Saaksh checks
                </p>
                <p
                  style={{
                    color: "#28303B",
                    fontSize: "13px",
                    lineHeight: 1.55,
                    margin: "0 0 16px",
                  }}
                >
                  Does the client's sector appear in the 9 GEI-notified sectors?
                </p>
                <p
                  style={{
                    color: "#5B6573",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.06em",
                    margin: "0 0 10px",
                  }}
                >
                  Obligated sectors
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {CCTS_SECTORS.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "#EFF3FA",
                        color: "#28303B",
                        fontSize: "12px",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        border: "1px solid #E5E9F0",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: "56px" }}>
          <h2
            style={{
              color: "#0F172A",
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 24px",
            }}
          >
            Readiness checklists
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={{ ...cardStyle, padding: "24px" }}>
              <h3
                style={{
                  color: "#0F172A",
                  fontSize: "15px",
                  fontWeight: 700,
                  margin: "0 0 16px",
                }}
              >
                CBAM checklist
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {CBAM_CHECKLIST.map((item, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      style={{ flexShrink: 0, marginTop: "1px" }}
                    >
                      <circle cx="9" cy="9" r="9" fill="#EAF4FE" />
                      <path
                        d="M5.5 9l2.5 2.5 4.5-4.5"
                        stroke="#0B6FD4"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      style={{
                        color: "#28303B",
                        fontSize: "14px",
                        lineHeight: 1.55,
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ ...cardStyle, padding: "24px" }}>
              <h3
                style={{
                  color: "#0F172A",
                  fontSize: "15px",
                  fontWeight: 700,
                  margin: "0 0 16px",
                }}
              >
                CCTS checklist
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {CCTS_CHECKLIST.map((item, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      style={{ flexShrink: 0, marginTop: "1px" }}
                    >
                      <circle cx="9" cy="9" r="9" fill="#E3F7F0" />
                      <path
                        d="M5.5 9l2.5 2.5 4.5-4.5"
                        stroke="#0E7A56"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      style={{
                        color: "#28303B",
                        fontSize: "14px",
                        lineHeight: 1.55,
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: "56px" }}>
          <div
            style={{
              background: "#F6ECD8",
              border: "1px solid #EAD8B0",
              borderRadius: "12px",
              padding: "20px 24px",
            }}
          >
            <p
              style={{
                color: "#8A6516",
                fontSize: "14px",
                fontWeight: 600,
                margin: "0 0 6px",
              }}
            >
              Not a liability calculator
            </p>
            <p
              style={{
                color: "#5C3D06",
                fontSize: "14px",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Saaksh's CBAM and CCTS module is a readiness check, not a
              liability calculation. We flag scope and tell you what to prepare.
              The actual embedded-emissions calculation (for CBAM) or credit
              position (for CCTS) requires site-level data per process step and
              typically a specialist. We tell you if you need to worry — and
              what to do first.
            </p>
          </div>
        </section>

        <section style={{ paddingTop: "48px" }}>
          <p
            style={{
              color: "#5B6573",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "12px",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            EU CBAM Regulation 2023/956 · EU Commission implementing acts (Dec
            2023) · MoEFCC CCTS Notification 2023 · BEE GEI Target Order 2023
          </p>
        </section>

        <section
          style={{
            paddingTop: "56px",
            paddingBottom: "72px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "#0F1E33",
              borderRadius: "12px",
              padding: "48px 32px",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: "0 0 10px",
              }}
            >
              Try it on your client
            </h2>
            <p
              style={{
                color: "#94A8C0",
                fontSize: "14px",
                lineHeight: 1.6,
                maxWidth: "420px",
                margin: "0 auto 24px",
              }}
            >
              The CBAM and CCTS readiness check is inside the free BRSR report,
              in the "Beyond BRSR" tab.
            </p>
            <Link
              href="/start"
              style={{
                display: "inline-block",
                background: "#0B6FD4",
                color: "#fff",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Start a free report
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
