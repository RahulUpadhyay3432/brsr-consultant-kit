import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import HelpWidget from "@/components/HelpWidget";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Saaksh: Free BRSR Readiness Report Generator",
  description:
    "Generate client-specific BRSR data collection checklists, materiality assessments, and cross-framework mappings. Free tool for ESG consultants in India.",
  keywords: "BRSR, ESG, SEBI, sustainability reporting, India, consultant tool, materiality assessment, GRI, TCFD, IFRS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} text-stone-900`}
      >
        <Analytics />
        {children}
        <HelpWidget />
      </body>
      <GoogleAnalytics gaId="G-GJBBQ6YPZL" />
    </html>
  );
}
