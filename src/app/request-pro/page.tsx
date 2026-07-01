import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { RequestAccessForm } from "@/components/RequestAccessForm";

export const metadata: Metadata = {
  title: "Request Pro access",
  description:
    "Request access to Saaksh Pro (Collect): chase BRSR data from a client's team, auto-compute emissions, keep an assurance trail, and draft the report. Onboarded manually, priced per engagement.",
};

const WHAT_YOU_GET = [
  "Collect: chase data from every team with branded emails and auto-reminders",
  "AI document auto-fill across all 108 BRSR fields, each with its source line",
  "Emissions auto-computed and attributed, plus an assurance-readiness ledger",
  "A grounded AI narrative draft and a proposal & fee builder",
];

export default function RequestProPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="pro" />

      {/* Navy hero */}
      <div className="bg-[#0F1E33]">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8 pt-14 pb-12">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
            Saaksh Pro · Collect
          </p>
          <h1 className="font-display font-bold text-[2.1rem] sm:text-[2.8rem] text-white leading-[1.08] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            Request Pro access
          </h1>
          <p className="text-[16px] text-[#C4D0E0] leading-relaxed mt-4 max-w-[600px]">
            Pro is the workspace that runs the engagement: collecting the data from the client&apos;s team,
            computing and attributing emissions, keeping the assurance trail, and drafting the report. We onboard
            consultants manually and price per engagement, tell us a little about your practice and we&apos;ll set you up.
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8 py-12">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-start">
            {/* What you get */}
            <div className="lg:pt-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700 mb-4">
                What Pro adds
              </p>
              <ul className="space-y-3.5">
                {WHAT_YOU_GET.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[14.5px] text-ink-body leading-snug">
                    <svg className="w-4.5 h-4.5 text-brand-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-[13px] text-ink-muted leading-relaxed mt-6">
                The free readiness tool stays free and on-device. Pro is for when you&apos;re ready to collect the
                data and produce the draft.
              </p>
            </div>

            {/* Form */}
            <RequestAccessForm />
          </div>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
