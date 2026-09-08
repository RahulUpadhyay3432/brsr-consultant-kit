import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Free BRSR Readiness Report",
  description:
    "Describe your client in six fields and get a cited, 108-field BRSR gap analysis in seconds. Free, no login, and everything runs in your browser.",
  alternates: { canonical: "/start" },
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
