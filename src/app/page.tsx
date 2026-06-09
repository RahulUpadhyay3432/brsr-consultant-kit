"use client";

import { useState, useCallback } from "react";
import type { IntakeFormData, ReportOutput } from "@/lib/types";
import { generateReport } from "@/lib/report-generator";
import IntakeForm from "@/components/IntakeForm";
import ReportView from "@/components/ReportView";

export default function Home() {
  const [report, setReport] = useState<ReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback((formData: IntakeFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const result = generateReport(formData);
        setReport(result);
        window.scrollTo({ top: 0, behavior: "instant" });
      } catch (err) {
        console.error("Report generation failed:", err);
        alert("Something went wrong generating the report. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, []);

  const handleBack = () => {
    setReport(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="min-h-screen bg-grid">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 no-print bg-[#F7F6F2]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-13 flex items-center justify-between">

          {/* Wordmark + mark — clicking returns to home */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2.5 py-3.5 pressable"
            aria-label="Go to home"
          >
            <div className="w-[26px] h-[26px] rounded-md bg-[#111111] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white leading-none tracking-tight">BK</span>
            </div>
            <span className="text-[13.5px] font-semibold text-stone-900 tracking-[-0.01em]">
              BRSR Consultant Kit
            </span>
          </button>

          {/* Right side — Compliance Chat + trust signal */}
          <div className="flex items-center gap-3">
            <a
              href="https://huggingface.co/spaces/sherlockwatson221/climate-compliance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                border border-stone-200 bg-white text-[12px] font-medium text-stone-600
                hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50
                transition-colors pressable shadow-sm"
            >
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="hidden sm:inline">Compliance Chat</span>
              <svg className="w-2.5 h-2.5 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-[11px] text-stone-400 tracking-tight">No data stored</span>
            </div>
          </div>
        </div>
        {/* Hairline separator — much subtler than border-b */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-black/[0.07]" />
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        {!report ? (
          <div className="max-w-3xl mx-auto">

            {/* ── Hero ──────────────────────────────────────────────────── */}
            <div className="mb-10 pt-6">
              {/* Eyebrow — enters first, sets the stage */}
              <div className="anim-up-sm mb-6" style={{ animationDelay: "0ms" }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                  bg-brand-50 border border-brand-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-brand-800 tracking-[0.08em] uppercase">
                    For ESG Consultants · India · Free
                  </span>
                </div>
              </div>

              {/* Heading — hero element, larger travel, slowest timing */}
              <h2
                className="anim-up-hero font-display font-light text-[2.4rem] sm:text-[3.6rem] text-stone-900
                  leading-[1.08] tracking-[-0.02em]"
                style={{ textWrap: "balance", animationDelay: "70ms" }}
              >
                Generate your client&apos;s
                <br />
                <span className="italic text-brand-700">BRSR Readiness Report</span>
                <br />
                in under a minute.
              </h2>

              {/* Subtitle — secondary, follows heading */}
              <p
                className="anim-up-md text-stone-600 mt-6 text-[17px] sm:text-[19px] max-w-[600px] leading-[1.7]"
                style={{ animationDelay: "180ms" }}
              >
                Fill in a few details below. Get a gap-analysis checklist,
                pre-populated materiality assessment, and cross-framework
                mappings — all ready for your client meeting.
              </p>
            </div>

            {/* ── Form Card — enters after hero settles ─────────────────── */}
            <div
              className="anim-card bg-white rounded-2xl border border-stone-200/80
                shadow-[0_2px_20px_rgba(100,80,40,0.08)] p-6 sm:p-10"
              style={{ animationDelay: "270ms" }}
            >
              <IntakeForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>

            {/* ── What you get — staggered cascade after form ───────────── */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: <IconChecklist />, accent: "text-emerald-600", accentBg: "bg-emerald-50",
                  title: "Data Collection Checklist",
                  description: "All 108 BRSR fields with gap analysis — what's already documented in their existing filings vs what needs collecting fresh.",
                  delay: "400ms",
                },
                {
                  icon: <IconScatter />, accent: "text-brand-700", accentBg: "bg-brand-50",
                  title: "Materiality Assessment",
                  description: "Pre-populated ESG topics for your client's industry with an interactive two-axis scoring chart.",
                  delay: "460ms",
                },
                {
                  icon: <IconFramework />, accent: "text-violet-600", accentBg: "bg-violet-50",
                  title: "Cross-Framework Mapper",
                  description: "BRSR mapped to GRI, TCFD, and IFRS S1/S2 — collect data once, report across all frameworks.",
                  delay: "520ms",
                },
              ].map((card) => (
                <div key={card.title} className="anim-up-sm" style={{ animationDelay: card.delay }}>
                  <FeatureCard
                    icon={card.icon} accent={card.accent} accentBg={card.accentBg}
                    title={card.title} description={card.description}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ReportView report={report} onBack={handleBack} />
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="mt-20 no-print">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 border-t border-black/[0.07]
          flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-stone-400">
            Built by{" "}
            <a
              href="https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors"
            >
              Rahul Upadhyay
            </a>
            {" · "}
            <a
              href="mailto:rahulu626@gmail.com"
              className="text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors"
            >
              rahulu626@gmail.com
            </a>
          </p>
          <p className="text-[11px] text-stone-400">
            ICAI BRSR 2024 · SEBI Circulars · MoEFCC Rules
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Feature Card ─────────────────────────────────────────────────────────── */
function FeatureCard({
  icon, accent, accentBg, title, description,
}: {
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-5 flex flex-col gap-4
      shadow-[0_1px_4px_rgba(100,80,40,0.05)] hover:shadow-[0_6px_20px_rgba(100,80,40,0.10)]
      transition-all duration-200 hover:-translate-y-1 group cursor-default">
      {/* Icon in a tinted square — scales with card hover */}
      <div className={`w-8 h-8 rounded-lg ${accentBg} flex items-center justify-center flex-shrink-0
        transition-transform duration-200 group-hover:scale-110`}>
        <span className={`${accent}`} aria-hidden="true">{icon}</span>
      </div>
      <div>
        <h3 className="text-[13px] font-semibold text-stone-800 leading-snug">{title}</h3>
        <p className="text-[12px] text-stone-500 mt-1.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ── SVG Icons — replacing emoji ──────────────────────────────────────────── */
function IconChecklist() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M5 8l2 2 4-4" />
    </svg>
  );
}

function IconScatter() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="4.5" cy="10.5" r="1.5" />
      <circle cx="8" cy="6" r="1.5" />
      <circle cx="11.5" cy="4" r="1.5" />
      <circle cx="6.5" cy="12" r="1" />
      <circle cx="12" cy="9" r="1" />
    </svg>
  );
}

function IconFramework() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="13" cy="3.5" r="1.5" />
      <circle cx="13" cy="12.5" r="1.5" />
      <path d="M4.5 8l7-4M4.5 8l7 4" />
    </svg>
  );
}
