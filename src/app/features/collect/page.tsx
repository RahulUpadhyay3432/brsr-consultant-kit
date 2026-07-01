import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Collect — BRSR Data Collection — Saaksh",
  description:
    "Chase BRSR data from your client's team with branded emails, auto-reminders, and no-login owner submissions. Stop managing this over WhatsApp.",
};

const PRO_ACCESS_HREF =
  "mailto:rahulu626@gmail.com?subject=Saaksh%20Pro%20access&body=Hi%2C%20I%27d%20like%20to%20try%20Saaksh%20Collect%20(Pro).";

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E5E9F0",
  borderRadius: "12px",
  boxShadow:
    "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)",
};

const STEPS = [
  {
    title: "Create a collection",
    description:
      "Set up a campaign for your client: company name, filing deadline, reporting period (FY). This is the workspace.",
  },
  {
    title: "Add data owners",
    description:
      "Assign fields to the right people: HR gets P3 and P5, Plant/EHS gets P6 and P2, Company Secretary gets Section A and P1, Procurement gets P2 value-chain, CSR gets P8.",
  },
  {
    title: "Send branded request emails",
    description:
      "One click sends a personalized, structured request email to each owner. They get a direct link to their own submission form — no login, no app to install.",
  },
  {
    title: "Owners submit on a no-login form",
    description:
      "Each owner fills their assigned fields on a clean web form. They can attach supporting documents (electricity bills, HR system exports, water meter readings) per field.",
  },
  {
    title: "Track and follow up from your dashboard",
    description:
      "See who's submitted, who hasn't, and when they last opened the link. Saaksh sends automatic reminder emails on a 3-day cadence (up to 3 reminders).",
  },
];

export default function CollectPage() {
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
              background: "#EAD8B0",
              color: "#8A6516",
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
            Pro
          </span>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 16px",
            }}
          >
            Collect
          </h1>
          <p
            style={{
              color: "#94A8C0",
              fontSize: "17px",
              lineHeight: 1.6,
              maxWidth: "560px",
              margin: "0 0 32px",
            }}
          >
            Chase BRSR data from your client's team with branded emails,
            auto-reminders, and no-login owner submissions.
          </p>
          <a
            href={PRO_ACCESS_HREF}
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
            Request Pro access
          </a>
        </div>
      </section>

      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}
      >
        <section style={{ paddingTop: "56px" }}>
          <div
            style={{
              background: "#EFF3FA",
              border: "1px solid #E5E9F0",
              borderRadius: "12px",
              padding: "28px 32px",
            }}
          >
            <p
              style={{
                color: "#28303B",
                fontSize: "16px",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              For most BRSR consultants, data collection is the bottleneck. You
              send an email to HR. They're busy. You follow up on WhatsApp. The
              energy data is with the plant manager, who reports to someone
              else. The Company Secretary has the Section A data. Six weeks
              pass. Collect automates this.
            </p>
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
            How Collect works
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  ...cardStyle,
                  padding: "20px 24px",
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: "32px",
                    height: "32px",
                    background: "#EAF4FE",
                    color: "#0B6FD4",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "13px",
                    fontWeight: 700,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <p
                    style={{
                      color: "#0F172A",
                      fontSize: "15px",
                      fontWeight: 600,
                      margin: "0 0 4px",
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    style={{
                      color: "#28303B",
                      fontSize: "14px",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingTop: "56px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "#FFF1ED",
                border: "1px solid #F8C9BD",
                borderRadius: "12px",
                padding: "20px 24px",
              }}
            >
              <p
                style={{
                  color: "#0F172A",
                  fontSize: "15px",
                  fontWeight: 600,
                  margin: "0 0 8px",
                }}
              >
                Auto-reminders
              </p>
              <p
                style={{
                  color: "#28303B",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                Automatic follow-up emails on a 3-day cadence. Up to 3
                reminders per owner before the deadline. You stop chasing. The
                system does it.
              </p>
            </div>
            <div
              style={{
                background: "#EAF4FE",
                border: "1px solid #AFD2FB",
                borderRadius: "12px",
                padding: "20px 24px",
              }}
            >
              <p
                style={{
                  color: "#0F172A",
                  fontSize: "15px",
                  fontWeight: 600,
                  margin: "0 0 8px",
                }}
              >
                Evidence attachments
              </p>
              <p
                style={{
                  color: "#28303B",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                Owners attach supporting documents per field: electricity bills,
                HR exports, water meter readings. Stored securely and linked in
                the assurance-readiness report.
              </p>
            </div>
            <div
              style={{
                background: "#E3F7F0",
                border: "1px solid #BFE6D8",
                borderRadius: "12px",
                padding: "20px 24px",
              }}
            >
              <p
                style={{
                  color: "#0F172A",
                  fontSize: "15px",
                  fontWeight: 600,
                  margin: "0 0 8px",
                }}
              >
                Emissions auto-calc
              </p>
              <p
                style={{
                  color: "#28303B",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                Scope 1 and 2 emissions are computed automatically from
                submitted fuel and electricity figures. CEA and IPCC factors
                cited by version.
              </p>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: "56px" }}>
          <div
            style={{
              background: "#EFF3FA",
              border: "1px solid #E5E9F0",
              borderRadius: "12px",
              padding: "28px 32px",
            }}
          >
            <h2
              style={{
                color: "#0F172A",
                fontSize: "18px",
                fontWeight: 700,
                margin: "0 0 12px",
              }}
            >
              Every submission builds your audit trail
            </h2>
            <p
              style={{
                color: "#28303B",
                fontSize: "15px",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Each submitted data point is attributed: who provided it, when,
              from which document. The assurance-readiness CSV export gives your
              assurer a complete data-ownership trail — name, role, email,
              field, value, evidence attached (yes/no), calculation basis. BRSR
              Core reasonable assurance is becoming mandatory for the top 500
              companies. Collect is built for that world.
            </p>
          </div>
        </section>

        <section style={{ paddingTop: "56px", paddingBottom: "72px" }}>
          <div
            style={{
              background: "#0F1E33",
              borderRadius: "12px",
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              Ready to stop managing BRSR over WhatsApp?
            </h2>
            <p
              style={{
                color: "#94A8C0",
                fontSize: "15px",
                lineHeight: 1.6,
                maxWidth: "480px",
                margin: "0 auto 28px",
              }}
            >
              Collect is available on request. We onboard new consultants
              manually so we can make sure it's set up right for your practice.
            </p>
            <a
              href={PRO_ACCESS_HREF}
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
              Request Pro access
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
