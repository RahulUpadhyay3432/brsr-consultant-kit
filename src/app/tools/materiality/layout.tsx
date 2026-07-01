import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRSR Materiality Topic Finder by Industry",
  description:
    "Get a suggested shortlist of material ESG topics for your client's industry, mapped to BRSR principles. A starting point for the stakeholder-driven materiality process.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
