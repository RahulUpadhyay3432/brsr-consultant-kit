"use client";

// Report-workspace route (/report). The report isn't stored, it's regenerated
// on-device from the saved intake form, so a refresh or bookmark of /report just
// rebuilds it. With no saved form (e.g. a stale bookmark after "New report"),
// we send the visitor home.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportOutput } from "@/lib/types";
import { generateReport } from "@/lib/report-generator";
import { loadSavedForm, clearReportSession, decodeReportParam, adoptSharedForm, syncActiveClient, startNewClient } from "@/lib/storage";
import { track } from "@/lib/mixpanel";
import ReportView from "@/components/ReportView";
import Skeleton from "@/components/Skeleton";

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportOutput | null>(null);

  useEffect(() => {
    // A shared ?v=<form> link: decode it and adopt it as the active session. But
    // don't silently wipe a returning user's in-progress work, if a *different*
    // form is already saved, confirm first; if they decline, keep their own work.
    // Either way strip the query so a refresh regenerates from localStorage.
    const v = new URLSearchParams(window.location.search).get("v");
    if (v) {
      const shared = decodeReportParam(v);
      if (shared) {
        const existing = loadSavedForm();
        const same = existing && JSON.stringify(existing) === JSON.stringify(shared);
        if (
          !existing ||
          same ||
          window.confirm("Open this shared report? It will replace the report you currently have open on this device.")
        ) {
          adoptSharedForm(shared);
        }
        window.history.replaceState({}, "", "/report");
      }
    }

    const saved = loadSavedForm();
    if (!saved) {
      router.replace("/");
      return;
    }
    try {
      const r = generateReport(saved);
      setReport(r);
      // Ensure this client exists in the on-device "My clients" list (also adopts
      // a pre-feature session, or a just-adopted shared form, as a new record).
      syncActiveClient();
      track("report_generated", {
        industry: saved.industry,
        sector: saved.sector,
        companySize: saved.companySize,
        reportingMaturity: saved.reportingMaturity,
        hasCompanyName: !!saved.companyName,
        gapCount: r.checklist.filter((i) => i.status === "new_data_needed").length,
      });
    } catch (err) {
      console.error("Report generation failed:", err);
      clearReportSession();
      router.replace("/");
    }
  }, [router]);

  if (!report) {
    // Workspace-shaped skeleton (sidebar + hero card), reads as "report arriving"
    // rather than a blank spinner. The real report renders on the next frame.
    return (
      <div className="min-h-screen bg-page flex">
        <aside className="hidden md:flex flex-col w-[248px] border-r border-line bg-white/60 p-4 gap-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="space-y-2 mt-2">
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-full rounded-lg" />)}
          </div>
        </aside>
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-[860px] mx-auto space-y-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-3.5 w-80" />
            <Skeleton className="h-44 w-full rounded-xl mt-2" />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          </div>
        </main>
        <span className="sr-only">Preparing your workspace…</span>
      </div>
    );
  }

  return (
    <ReportView
      report={report}
      onHome={() => router.push("/")}
      onEdit={() => router.push("/start")}
      onBack={() => { startNewClient(); router.push("/start"); }}
    />
  );
}
