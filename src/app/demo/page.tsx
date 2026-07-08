"use client";

// Demo route (/demo). Renders a fully-generated sample report from a hardcoded
// client so a visitor can explore the product without filling the intake form.
// Deliberately isolated: it never calls any storage-writing function
// (syncActiveClient / saveForm / startNewClient), and the `demo` prop stops the
// report's children from persisting anything, so the visitor's real on-device
// session and "My clients" list are left completely untouched.

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { generateReport } from "@/lib/report-generator";
import { SAMPLE_FORM } from "@/lib/demo-data";
import ReportView from "@/components/ReportView";

export default function DemoPage() {
  const router = useRouter();
  const report = useMemo(() => generateReport(SAMPLE_FORM), []);

  return (
    <ReportView
      report={report}
      demo
      onHome={() => router.push("/")}
      onEdit={() => router.push("/start")}
      onBack={() => router.push("/start")}
    />
  );
}
