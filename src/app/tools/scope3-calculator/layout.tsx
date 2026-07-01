import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scope 3 GHG Calculator for BRSR P6",
  description:
    "Activity-based Scope 3 GHG screening calculator for BRSR Principle 6. DEFRA 2024 factors cited per category (business travel, commuting, waste, freight). Free, on-device.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
