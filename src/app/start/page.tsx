"use client";

// Intake-form route (/start). On submit we save the answers and navigate to
// /report, which regenerates the report from them. Everything stays on-device.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { IntakeFormData } from "@/lib/types";
import { generateReport } from "@/lib/report-generator";
import { loadSavedForm, saveForm } from "@/lib/storage";
import IntakeForm from "@/components/IntakeForm";
import { RestoreWorkButton } from "@/components/SessionBackup";

export default function StartPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // Read the saved form only after mount (it lives in localStorage), so the
  // server render and first client render match, then the form pre-fills.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSubmit = (formData: IntakeFormData) => {
    setIsLoading(true);
    // Small delay lets the button spinner paint before we navigate.
    setTimeout(() => {
      try {
        generateReport(formData); // validate it builds before we navigate
        saveForm(formData);
        router.push("/report");
      } catch (err) {
        console.error("Report generation failed:", err);
        alert("Something went wrong generating the report. Please try again.");
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-grid">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 no-print bg-page/85 backdrop-blur-md">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 h-13 flex items-center justify-between">

          {/* Wordmark + mark — clicking returns to the marketing home */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 py-3.5 pressable"
            aria-label="Go to home"
          >
            <div className="w-[26px] h-[26px] rounded-md bg-forest flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white leading-none tracking-tight">S</span>
            </div>
            <span className="text-[13.5px] font-semibold text-ink tracking-[-0.01em]">
              Saaksh
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
      <main className="max-w-[1680px] mx-auto px-4 sm:px-8 py-12">
        <div className="max-w-[880px] mx-auto">

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
              className="anim-up-hero font-display font-bold text-[2.7rem] sm:text-[4rem] text-ink
                leading-[1.05] tracking-[-0.02em]"
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
              className="anim-up-md text-ink-body mt-6 text-[17px] sm:text-[19px] max-w-[600px] leading-[1.7]"
              style={{ animationDelay: "180ms" }}
            >
              Fill in a few details below. Get a gap-analysis checklist,
              suggested material topics, and cross-framework
              mappings — all ready for your client meeting.
            </p>
          </div>

          {/* ── Form Card — enters after hero settles ─────────────────── */}
          <div
            className="anim-card bg-white rounded-2xl border border-line
              shadow-[0_1px_2px_rgba(16,33,26,0.05)] p-6 sm:p-10"
            style={{ animationDelay: "270ms" }}
          >
            <IntakeForm
              key={mounted ? "filled" : "empty"}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialData={mounted ? loadSavedForm() ?? undefined : undefined}
            />
          </div>

          {/* Restore — bring saved work in from another browser/device via a backup file */}
          <div className="mt-3 text-[12.5px] text-stone-500">
            Already started this on another device?{" "}
            <RestoreWorkButton onRestored={() => router.push("/report")} />
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
                title: "Suggested Materiality",
                description: "Suggested ESG material topics for your client's industry — a starting point for the stakeholder-driven materiality process.",
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
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="mt-20 no-print">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 py-6 border-t border-black/[0.07]
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
    <div className="bg-white rounded-xl border border-line p-5 flex flex-col gap-4
      shadow-[0_1px_2px_rgba(16,33,26,0.05)] hover:shadow-[0_6px_20px_rgba(16,33,26,0.08)]
      transition-all duration-200 hover:-translate-y-1 group cursor-default">
      {/* Icon in a tinted square — scales with card hover */}
      <div className={`w-8 h-8 rounded-lg ${accentBg} flex items-center justify-center flex-shrink-0
        transition-transform duration-200 group-hover:scale-110`}>
        <span className={`${accent}`} aria-hidden="true">{icon}</span>
      </div>
      <div>
        <h3 className="text-[13px] font-semibold text-ink leading-snug">{title}</h3>
        <p className="text-[12px] text-ink-muted mt-1.5 leading-relaxed">{description}</p>
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
