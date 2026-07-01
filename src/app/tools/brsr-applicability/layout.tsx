import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRSR Applicability Checker: Must Your Client File?",
  description:
    "Check whether a company must file BRSR, BRSR Core, or value-chain disclosures for FY 2025-26, and by when. Based on SEBI's top-1000 / top-500 glide path.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
