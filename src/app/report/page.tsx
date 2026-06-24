"use client";

// Report-workspace route (/report). The report isn't stored — it's regenerated
// on-device from the saved intake form, so a refresh or bookmark of /report just
// rebuilds it. With no saved form (e.g. a stale bookmark after "New report"),
// we send the visitor home.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportOutput } from "@/lib/types";
import { generateReport } from "@/lib/report-generator";
import { loadSavedForm, clearReportSession } from "@/lib/storage";
import ReportView from "@/components/ReportView";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportOutput | null>(null);

  useEffect(() => {
    const saved = loadSavedForm();
    if (!saved) {
      router.replace("/");
      return;
    }
    try {
      setReport(generateReport(saved));
    } catch (err) {
      console.error("Report generation failed:", err);
      clearReportSession();
      router.replace("/");
    }
  }, [router]);

  if (!report) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-400 text-[13px]">
          <span className="w-4 h-4 border-2 border-stone-300 border-t-brand-500 rounded-full animate-spin" />
          Preparing your workspace…
        </div>
      </div>
    );
  }

  return (
    <ReportView
      report={report}
      onHome={() => router.push("/")}
      onEdit={() => router.push("/start")}
      onBack={() => { clearReportSession(); router.push("/start"); }}
    />
  );
}
