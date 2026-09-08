import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest BRSR, CBAM & CCTS Regulatory Updates",
  description:
    "Dated, cited updates on Indian ESG regulation, SEBI BRSR circulars, BRSR Core assurance, CBAM and CCTS, alongside Saaksh's practical guides. Every item links to the primary source.",
  alternates: { canonical: "/latest" },
};

export default function LatestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
