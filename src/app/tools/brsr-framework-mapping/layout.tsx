import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRSR to GRI, TCFD, IFRS S1/S2 & TNFD Mapping (free crosswalk)",
  description:
    "A free, searchable crosswalk mapping every BRSR disclosure to its GRI, TCFD, IFRS S1/S2 and TNFD equivalent. Cited, exportable to CSV/Word, on-device. No signup.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
