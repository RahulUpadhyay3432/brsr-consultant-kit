"use client";

// Landing route (/) — the marketing homepage. The intake form lives at /start and
// the report workspace at /report (each a real URL so the back button, refresh and
// bookmarks behave). If work is saved on this device, we surface a "Continue where
// you left off" banner; the report is regenerated locally from the saved form.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import { loadSavedForm } from "@/lib/storage";

export default function Home() {
  const router = useRouter();
  const [resume, setResume] = useState<{ companyName: string } | null>(null);

  useEffect(() => {
    const saved = loadSavedForm();
    if (saved) setResume({ companyName: saved.companyName || "" });
  }, []);

  return (
    <LandingPage
      onStart={() => router.push("/start")}
      resume={resume ? { companyName: resume.companyName, onResume: () => router.push("/report") } : null}
    />
  );
}
