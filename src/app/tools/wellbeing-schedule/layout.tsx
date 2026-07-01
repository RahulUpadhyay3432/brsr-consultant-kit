import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRSR P3 Employee Wellbeing Schedule Builder",
  description:
    "Map the 11 BRSR Principle 3 employee welfare heads to the exact P&L ledger lines they come from. Downloadable CSV, cited guide, runs on your device.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
