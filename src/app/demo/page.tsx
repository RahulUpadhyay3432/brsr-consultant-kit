"use client";

// Demo route (/demo). A form-first sample: it opens the intake form PRE-FILLED
// with a hardcoded example client, and "See the sample report" reveals the
// report generated from whatever is in the form. Fields are editable, so a
// visitor can tweak the inputs and watch the report change.
// Deliberately isolated: it never calls any storage-writing function
// (syncActiveClient / saveForm / startNewClient) and the `demo` prop stops the
// report's children from persisting, so the visitor's real on-device session and
// "My clients" list are left completely untouched.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { IntakeFormData } from "@/lib/types";
import { generateReport } from "@/lib/report-generator";
import { SAMPLE_FORM } from "@/lib/demo-data";
import IntakeForm from "@/components/IntakeForm";
import ReportView from "@/components/ReportView";
import { SaakshMark } from "@/components/SaakshMark";

export default function DemoPage() {
  const router = useRouter();
  const [form, setForm] = useState<IntakeFormData>(SAMPLE_FORM);
  const [step, setStep] = useState<"form" | "report">("form");

  // Regenerated in-memory from the current form whenever we show the report.
  const report = useMemo(() => (step === "report" ? generateReport(form) : null), [step, form]);

  if (step === "report" && report) {
    return (
      <ReportView
        report={report}
        demo
        onHome={() => router.push("/")}
        onEdit={() => setStep("form")}     // back to the (still pre-filled) sample form
        onBack={() => router.push("/start")} // "New client" → the real, empty form
      />
    );
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 no-print bg-page/85 backdrop-blur-md">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 h-13 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 py-3.5 pressable"
            aria-label="Go to home"
          >
            <SaakshMark size={26} className="flex-shrink-0" />
            <span className="text-[13.5px] font-semibold text-ink tracking-[-0.01em]">Saaksh</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-[11px] text-stone-400 tracking-tight">Sample · nothing saved</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-black/[0.07]" />
      </header>

      <main className="max-w-[1680px] mx-auto px-4 sm:px-8 py-12">
        <div className="max-w-[880px] mx-auto">
          {/* Hero */}
          <div className="mb-8 pt-6">
            <div className="anim-up-sm mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                <span className="text-[11px] font-medium text-brand-800 tracking-[0.08em] uppercase">Sample report · explore freely</span>
              </div>
            </div>
            <h1 className="anim-up-hero font-display font-bold text-[2.4rem] sm:text-[3.4rem] text-ink leading-[1.05] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
              See how it works, on a{" "}
              <span className="italic text-brand-700">sample client.</span>
            </h1>
            <p className="anim-up-md text-ink-body mt-5 text-[16.5px] sm:text-[18px] max-w-[620px] leading-[1.65]">
              This is the same intake form your real report starts from, already filled in with an example steel company.
              Change anything you like, or just continue, and we&apos;ll build the report on your device. Nothing you enter here is saved.
            </p>
          </div>

          {/* Pre-filled form */}
          <div className="anim-card bg-white rounded-2xl border border-line shadow-[0_1px_2px_rgba(16,33,26,0.05)] p-6 sm:p-10" style={{ animationDelay: "120ms" }}>
            <IntakeForm
              initialData={form}
              isLoading={false}
              submitLabel="See the sample report"
              onSubmit={(data) => { setForm(data); setStep("report"); }}
            />
          </div>

          <p className="mt-3 text-[12.5px] text-stone-500">
            Ready to do this for a real client?{" "}
            <button onClick={() => router.push("/start")} className="text-brand-700 font-medium hover:underline">
              Start a free report →
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
