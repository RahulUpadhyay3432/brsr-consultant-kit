import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRSR to GRI, TCFD, IFRS S1/S2, TNFD & ESRS (CSRD) Mapping (free crosswalk)",
  description:
    "A free, searchable crosswalk mapping every BRSR disclosure to its GRI, TCFD, IFRS S1/S2, TNFD and ESRS (CSRD) equivalent. Pick a target framework and read the mapping. Cited, exportable to CSV/Word, on-device. No signup.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
