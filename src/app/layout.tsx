import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import HelpWidget from "@/components/HelpWidget";
import "./globals.css";

// Self-hosted (no next/font/google on this machine). Newsreader = display serif,
// Hanken Grotesk = body sans, IBM Plex Mono = mono. Files fetched once by
// scripts/fetch-fonts.mjs.
const newsreader = localFont({
  src: [
    { path: "./fonts/Newsreader-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Newsreader-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Newsreader-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Newsreader-400italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});
const hanken = localFont({
  src: [
    { path: "./fonts/HankenGrotesk-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/HankenGrotesk-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/HankenGrotesk-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/HankenGrotesk-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-hanken",
  display: "swap",
});
const plexMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
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
        className={`${newsreader.variable} ${hanken.variable} ${plexMono.variable} text-stone-900`}
      >
        <Analytics />
        {children}
        <HelpWidget />
      </body>
      <GoogleAnalytics gaId="G-GJBBQ6YPZL" />
    </html>
  );
}
