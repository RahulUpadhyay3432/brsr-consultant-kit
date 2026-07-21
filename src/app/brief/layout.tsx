import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Saaksh Brief — the 30-second ESG & BRSR digest",
  description:
    "A swipeable, install-to-home-screen brief of Indian ESG and BRSR: SEBI, BRSR Core, CBAM, CCTS and global frameworks. Fresh news, cited regulation, plain guides.",
  appleWebApp: { capable: true, title: "Brief", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#FBFCFE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Full-screen own chrome: no SiteHeader (pages opt into it; this route doesn't).
export default function BriefLayout({ children }: { children: React.ReactNode }) {
  return children;
}
