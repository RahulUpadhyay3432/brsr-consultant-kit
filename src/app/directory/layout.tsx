import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ESG & BRSR Consultants in India, a directory",
  description:
    "Find an independent ESG, BRSR, LCA or EHS consultant in India by what they actually take on, and where they are. Free to search, free to be listed.",
  alternates: { canonical: "/directory" },
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
