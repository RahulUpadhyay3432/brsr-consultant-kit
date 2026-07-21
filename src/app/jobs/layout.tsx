import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ESG & Sustainability Jobs in India",
  description:
    "A curated board of live ESG, BRSR, climate and sustainability roles across India, from consulting, corporates and startups. Hand-picked, linked to the original posting.",
  alternates: { canonical: "/jobs" },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
