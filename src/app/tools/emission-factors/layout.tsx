import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/tools/emission-factors" },
  title: "India Emission Factor Database for BRSR — Free, Cited, Versioned",
  description:
    "Every emission factor Saaksh calculates with, in one searchable table: the CEA grid factor with its version, IPCC fuel factors, AR5 refrigerant GWPs and DEFRA Scope 3 factors. Each with its primary source. Free, no signup, CSV download.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
