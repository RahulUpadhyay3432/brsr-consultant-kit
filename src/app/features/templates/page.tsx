import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "BRSR Templates & Guides — Saaksh",
  description:
    "Downloadable BRSR templates, engagement timelines, and cited how-to guides — built in your browser from real SEBI format data, no login required.",
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FBFCFE" }}>
      <SiteHeader active="tools" />

      {/* Hero */}
      <section style={{ background: "#0F1E33" }} className="mt-6">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <span
              className="text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full uppercase"
              style={{ background: "#0B6FD4" }}
            >
              Free tool
            </span>
            <span className="text-sm font-mono" style={{ color: "#1E9DF2" }}>
              In the report → Templates tab
            </span>
          </div>
          <h1
            className="font-display text-4xl md:text-5xl mb-5 leading-tight"
            style={{ color: "#FFFFFF" }}
          >
            BRSR Templates &amp; Guides
          </h1>
          <p className="text-lg max-w-[640px] leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
            Downloadable BRSR workbooks, engagement timelines, and cited how-to guides — built in
            your browser, no login, nothing stored.
          </p>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-16">

        {/* Section 1 — Downloadable templates */}
        <section>
          <h2 className="font-display text-2xl mb-3" style={{ color: "#0F172A" }}>
            Downloadable templates
          </h2>
          <p className="text-sm mb-8 max-w-[560px]" style={{ color: "#5B6573" }}>
            Generated in your browser from the official BRSR format. Download as CSV, open in Excel
            or Google Sheets. Nothing stored — regenerated fresh each time.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="2" width="16" height="18" rx="2" stroke="#0B6FD4" strokeWidth="1.5" />
                    <path
                      d="M7 8h8M7 11h8M7 14h5"
                      stroke="#0B6FD4"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                title: "BRSR Response Workbook",
                subtitle: "108 fields + Sections A & B",
                body: "CSV with all 108 Section C fields plus Sections A and B as a blank fill-in sheet. Opens in Excel or Google Sheets. Generated from the official SEBI BRSR format.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="#0B6FD4" strokeWidth="1.5" />
                    <path
                      d="M11 7v4l3 2"
                      stroke="#0B6FD4"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                title: "Materiality Assessment Grid",
                subtitle: "Impact × stakeholder-concern scoring",
                body: "Impact × stakeholder-concern scoring template with worked examples for the 6 BRSR stakeholder groups. Start your client's materiality process here.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path
                      d="M4 6h14M4 10h10M4 14h7"
                      stroke="#0B6FD4"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                title: "Stakeholder Engagement Plan",
                subtitle: "6 BRSR stakeholder groups",
                body: "Pre-filled with the six BRSR stakeholder groups (employees, communities, investors, customers, suppliers, regulators). Add your client's specifics.",
              },
            ].map(({ icon, title, subtitle, body }) => (
              <div
                key={title}
                className="rounded-xl p-7 flex flex-col gap-4 border"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#E5E9F0",
                  boxShadow: "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ background: "#EAF4FE" }}
                  >
                    {icon}
                  </div>
                  <span
                    className="text-xs font-mono font-semibold px-2 py-0.5 rounded border"
                    style={{
                      background: "#EFF3FA",
                      color: "#5B6573",
                      borderColor: "#E5E9F0",
                    }}
                  >
                    CSV
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-base mb-0.5" style={{ color: "#0F172A" }}>
                    {title}
                  </h3>
                  <p className="text-xs font-mono" style={{ color: "#5B6573" }}>
                    {subtitle}
                  </p>
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#28303B" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 — Engagement Timeline */}
        <section>
          <div
            className="rounded-xl p-8 md:p-10 border"
            style={{ background: "#EAF4FE", borderColor: "#AFD2FB" }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="font-display text-2xl mb-4" style={{ color: "#0F172A" }}>
                  Engagement timeline generator
                </h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#28303B" }}>
                  Set your client&apos;s filing deadline. Saaksh calculates a milestone-by-milestone
                  timeline for the full engagement. Two plans:
                </p>
                <ul className="space-y-2 text-sm" style={{ color: "#28303B" }}>
                  <li className="flex gap-2">
                    <span className="font-semibold shrink-0" style={{ color: "#0B6FD4" }}>
                      First-time (20 weeks):
                    </span>
                    kickoff, document review, team briefing, data collection, gap verification,
                    narrative draft, internal review, assurance (if BRSR Core), filing
                  </li>
                  <li className="flex gap-2 mt-3">
                    <span className="font-semibold shrink-0" style={{ color: "#0B6FD4" }}>
                      Experienced (12 weeks):
                    </span>
                    condensed plan for repeat filers with a shorter runway
                  </li>
                </ul>
                <p className="text-sm mt-4" style={{ color: "#5B6573" }}>
                  Download the timeline as a CSV. Each milestone shows the due date, lead owner, and notes.
                </p>
              </div>
              <div className="space-y-2.5">
                {[
                  { num: "01", label: "Kickoff", week: "Week 1", owner: "Consultant" },
                  { num: "02", label: "Document review", week: "Week 2", owner: "Consultant" },
                  { num: "03", label: "Data collection", week: "Weeks 3–10", owner: "Owners + Consultant" },
                  { num: "04", label: "Gap review", week: "Week 11", owner: "Consultant" },
                  { num: "05", label: "Draft + review", week: "Weeks 12–14", owner: "Client + Consultant" },
                  { num: "06", label: "Assurance", week: "Weeks 15–17", owner: "Auditor" },
                  { num: "07", label: "Filing", week: "Week 20", owner: "Company Secretary" },
                ].map(({ num, label, week, owner }) => (
                  <div
                    key={num}
                    className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 border"
                    style={{ background: "#FFFFFF", borderColor: "#E5E9F0" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold" style={{ color: "#1E9DF2" }}>
                        {num}
                      </span>
                      <span className="text-sm font-medium" style={{ color: "#0F172A" }}>
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono" style={{ color: "#5B6573" }}>
                        {week}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded border hidden md:inline"
                        style={{
                          background: "#EFF3FA",
                          color: "#5B6573",
                          borderColor: "#E5E9F0",
                        }}
                      >
                        {owner}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Cited how-to guides */}
        <section>
          <h2 className="font-display text-2xl mb-3" style={{ color: "#0F172A" }}>
            Cited how-to guides
          </h2>
          <p className="text-sm mb-8 max-w-[560px]" style={{ color: "#5B6573" }}>
            Guides your team would otherwise spend hours hunting across SEBI circulars and
            international standards — compiled and kept current.
          </p>
          <div className="space-y-4">
            {[
              {
                num: "01",
                title: "How to run a materiality assessment",
                body: "Steps: identify stakeholders, assess impact and concern for each topic, shortlist material topics, document the process.",
                sources: [
                  "SEBI BRSR Format (Section B)",
                  "AA1000 Accountability Principles (2018)",
                ],
              },
              {
                num: "02",
                title: "Answering Principle 5: Human Rights",
                body: "Key disclosures: human rights policy, grievance mechanisms, supply chain due diligence. Covers what SEBI expects and how to reference the UNGPs correctly.",
                sources: [
                  "UN Guiding Principles on Business and Human Rights (UNGPs)",
                  "SEBI BRSR Format P5",
                ],
              },
              {
                num: "03",
                title: "Getting ready for BRSR Core assurance",
                body: "Steps: identify the 42 KPIs, build a data trail with primary sources, document methodology, engage your assurer early (they book out). Top 500 companies face reasonable assurance this year (FY 2025–26); top 1000 from FY 2026–27.",
                sources: [
                  "SEBI BRSR Core circular",
                  "ICAI guidance on ESG assurance",
                ],
              },
            ].map(({ num, title, body, sources }) => (
              <div
                key={num}
                className="rounded-xl p-7 border"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#E5E9F0",
                  boxShadow: "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)",
                }}
              >
                <div className="flex gap-5 items-start">
                  <span
                    className="font-mono text-xs font-bold tracking-widest mt-1 shrink-0"
                    style={{ color: "#1E9DF2" }}
                  >
                    {num}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-base mb-2" style={{ color: "#0F172A" }}>
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "#28303B" }}>
                      {body}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-2.5 py-1 rounded-lg border"
                          style={{
                            background: "#EAF4FE",
                            color: "#0B5FB0",
                            borderColor: "#AFD2FB",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 — Honest framing */}
        <section>
          <div
            className="rounded-xl p-7 border"
            style={{ background: "#E3F7F0", borderColor: "#BFE6D8" }}
          >
            <div className="flex gap-3 items-start">
              <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="#0E7A56" strokeWidth="1.5" />
                <path
                  d="M9 8v5M9 6h.01"
                  stroke="#0E7A56"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-sm leading-relaxed" style={{ color: "#0E5C40" }}>
                These templates are{" "}
                <strong style={{ color: "#0A4A33" }}>
                  starting formats, not finished products
                </strong>
                . A BRSR-compliant materiality assessment requires a stakeholder-engagement process
                with documented outputs. Use these as the starting structure, not the end result.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-6">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors pressable"
            style={{ background: "#0B6FD4" }}
          >
            Open the templates →
          </Link>
          <p className="text-sm mt-4" style={{ color: "#5B6573" }}>
            Templates are inside the report — generate a free report first, then open the
            Templates tab.
          </p>
        </section>
      </div>
    </div>
  );
}
