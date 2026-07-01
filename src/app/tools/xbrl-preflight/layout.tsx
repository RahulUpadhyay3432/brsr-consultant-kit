import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BRSR XBRL Preflight Checker",
  description:
    "Catch common BRSR XBRL filing errors before uploading to BSE/NSE. Lakh/Crore to absolute INR converter plus a 7-item rejection checklist, cited to MCA.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
