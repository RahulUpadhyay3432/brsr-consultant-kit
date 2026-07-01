import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Saaksh, BRSR & ESG Compliance for Indian Consultants",
  description:
    "Practical BRSR guidance, GHG calculation walkthroughs, regulatory updates, and sector-specific guides for Indian ESG consultants. Written by practitioners, cited to SEBI and ICAI.",
  openGraph: {
    title: "Saaksh Blog, BRSR Compliance Guides",
    description:
      "Practical BRSR guidance, GHG calculation walkthroughs, regulatory updates, and sector-specific guides for Indian ESG consultants.",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
