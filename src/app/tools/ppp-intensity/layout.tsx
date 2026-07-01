import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PPP-Adjusted Emissions Intensity Calculator for BRSR",
  description:
    "Restate your BRSR emissions or energy intensity against PPP-adjusted turnover so Indian figures compare like-for-like with global peers. World Bank PPP factor, on-device.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
