import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "BRSR Gap Analysis — Saaksh",
  description:
    "See exactly which of your client's 108 BRSR disclosures are covered, partially covered, or need fresh data — in under 60 seconds.",
};

export default function GapAnalysisPage() {
  return (
    <div className="min-h-screen bg-page">
      <SiteHeader active="tools" />

      {/* Hero */}
      <section className="bg-forest glow-dark mt-6">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="bg-brand-600 text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full uppercase">
              Free
            </span>
            <span className="text-brand-500 text-sm font-mono">108 BRSR disclosures</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-5 leading-tight">
            BRSR Gap Analysis
          </h1>
          <p className="text-lg text-white/70 max-w-[620px] leading-relaxed">
            See exactly which of your client&apos;s 108 BRSR disclosures are covered, partially covered,
            or need fresh data — in under 60 seconds.
          </p>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-16">

        {/* How it works */}
        <section>
          <h2 className="font-display text-2xl text-ink mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Fill the 5-minute intake form",
                body: "Industry, company size, reporting maturity, and existing compliance filings. That's all Saaksh needs to start.",
              },
              {
                step: "02",
                title: "Cross-reference with your filings",
                body: "Saaksh maps your client's existing compliance filings against all 108 BRSR Section C disclosures — automatically.",
              },
              {
                step: "03",
                title: "Get a color-coded action plan",
                body: "Every field is tagged: Ready to pull, Needs verification, or Collect fresh. Know where to spend time before you open a spreadsheet.",
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="bg-surface border border-line rounded-2xl p-7 shadow-elev-1"
              >
                <div className="font-mono text-xs text-brand-500 font-semibold tracking-widest mb-4">
                  STEP {step}
                </div>
                <h3 className="font-display text-lg text-ink mb-3">{title}</h3>
                <p className="text-sm text-ink-body leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The three statuses */}
        <section>
          <h2 className="font-display text-2xl text-ink mb-3">The three statuses</h2>
          <p className="text-ink-muted text-sm mb-8 max-w-[560px]">
            Every BRSR Section C field gets one of these labels, so your action plan is already prioritized.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl p-6 border" style={{ background: "#E3F7F0", borderColor: "#BFE6D8" }}>
              <div
                className="inline-block text-xs font-semibold font-mono px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase"
                style={{ color: "#0E7A56", background: "rgba(14,122,86,0.10)" }}
              >
                Ready to pull
              </div>
              <h3 className="font-display text-base mb-2" style={{ color: "#0E5C40" }}>
                Data exists in a filing
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#1A6E50" }}>
                Your client&apos;s existing compliance filings already cover this disclosure. Pull the figure —
                no new data collection needed.
              </p>
            </div>

            <div className="rounded-2xl p-6 border" style={{ background: "#FEF3C7", borderColor: "#F6D860" }}>
              <div
                className="inline-block text-xs font-semibold font-mono px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase"
                style={{ color: "#92400E", background: "rgba(146,64,14,0.10)" }}
              >
                Needs verification
              </div>
              <h3 className="font-display text-base mb-2" style={{ color: "#78350F" }}>
                Partially covered
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#92400E" }}>
                One part of this disclosure is in a filing; another piece is missing. Saaksh flags exactly
                what needs confirming.
              </p>
            </div>

            <div className="rounded-2xl p-6 border" style={{ background: "#FFF1ED", borderColor: "#F8C9BD" }}>
              <div
                className="inline-block text-xs font-semibold font-mono px-2.5 py-1 rounded-full mb-4 tracking-wide uppercase"
                style={{ color: "#C24428", background: "rgba(194,68,40,0.10)" }}
              >
                Collect fresh
              </div>
              <h3 className="font-display text-base mb-2" style={{ color: "#9E2C12" }}>
                Not in any filing
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#C24428" }}>
                This disclosure isn&apos;t covered by any existing filing. You&apos;ll need to collect it directly
                from the client&apos;s teams.
              </p>
            </div>
          </div>
        </section>

        {/* What we check against */}
        <section>
          <h2 className="font-display text-2xl text-ink mb-3">What we check against</h2>
          <p className="text-ink-muted text-sm mb-8 max-w-[560px]">
            Saaksh knows which BRSR fields each compliance regime already captures. You tell us what your
            client has filed — we do the mapping.
          </p>
          <div className="bg-tint border border-line rounded-2xl p-8">
            <ul className="grid md:grid-cols-2 gap-x-12 gap-y-3">
              {[
                "PCB / CTE / CTO filings",
                "Zero Liquid Discharge (ZLD) certification",
                "Hazardous Waste authorizations (Schedule I–III)",
                "EPR registration — e-waste & plastic",
                "Factory Act registers (workers, wages, hours)",
                "PAT scheme data (specific energy consumption)",
                "TNFD nature indicators (water, biodiversity, land)",
                "Energy audit reports (BEE PAT cycle data)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-body">
                  <svg
                    className="shrink-0 mt-0.5"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle cx="8" cy="8" r="7" fill="#EAF4FE" stroke="#AFD2FB" />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="#0B6FD4"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Honest framing */}
        <section>
          <div className="bg-band border border-line rounded-2xl p-7">
            <div className="flex gap-3 items-start">
              <svg
                className="shrink-0 mt-0.5"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <circle cx="9" cy="9" r="8" stroke="#5B6573" strokeWidth="1.5" />
                <path d="M9 8v5M9 6h.01" stroke="#5B6573" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-ink mb-1">Honest framing</p>
                <p className="text-sm text-ink-muted leading-relaxed">
                  The gap analysis is a starting point. It predicts which data you likely have — based on your
                  client&apos;s industry and existing filings — not a replacement for reviewing the actual
                  documents. Every recommendation is cited to SEBI&apos;s official BRSR Format and the ICAI
                  Background Material (2024).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-6">
          <p className="text-ink-muted text-sm mb-5">No login. No data uploaded. Works entirely in your browser.</p>
          <Link
            href="/start"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3.5 rounded-xl pressable shadow-elev-1 transition-colors"
          >
            Run a free gap analysis
            <span aria-hidden>→</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
