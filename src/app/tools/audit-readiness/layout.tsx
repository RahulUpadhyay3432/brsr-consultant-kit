import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRSR Core Audit Readiness Checklist",
  description:
    "See exactly which source documents a BRSR Core assurance auditor will ask for, grouped by KPI and principle. Free, cited, runs on your device.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
