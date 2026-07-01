import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scope 1 & 2 GHG Calculator for BRSR",
  description:
    "Calculate absolute Scope 1 & 2 GHG emissions for BRSR P6-E1 using the CEA grid factor and IPCC fuel factors, each cited. Free, on-device, no login.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
