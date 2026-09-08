import type { Metadata } from "next";

// An app surface rather than a content page, so it stays out of the index: it
// has nothing to rank for and would only dilute crawl budget.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
