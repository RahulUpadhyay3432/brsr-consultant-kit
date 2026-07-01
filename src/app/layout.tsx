import type { Metadata } from "next";
import localFont from "next/font/local";
import HelpWidget from "@/components/HelpWidget";
import { AnalyticsGate } from "@/components/AnalyticsGate";
import ConsentBanner from "@/components/ConsentBanner";
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
  metadataBase: new URL("https://saaksh.co"),
  title: {
    default: "Saaksh: Free BRSR Readiness Tool for Indian ESG Consultants",
    template: "%s | Saaksh",
  },
  description:
    "Generate a BRSR gap-analysis report for your client in seconds. Free tool for Indian ESG consultants, cited to SEBI & ICAI, everything runs on your device.",
  keywords: "BRSR, ESG, SEBI, sustainability reporting, India, consultant tool, materiality assessment, GRI, TCFD, IFRS, BRSR gap analysis, BRSR checklist",
  // og:image comes from the file-convention route (src/app/opengraph-image.tsx),
  // which auto-injects it here and for every child route that doesn't override
  // it. og:title / og:description fall back to each page's own title/description,
  // so we deliberately don't pin them here (that would freeze every page's card
  // to the homepage copy). twitter:image falls back to og:image when unset.
  openGraph: {
    type: "website",
    siteName: "Saaksh",
  },
  twitter: {
    card: "summary_large_image",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://saaksh.co/#org",
                  name: "Saaksh",
                  url: "https://saaksh.co",
                  logo: { "@type": "ImageObject", url: "https://saaksh.co/icon.svg" },
                  contactPoint: { "@type": "ContactPoint", email: "rahulu626@gmail.com", contactType: "customer support" },
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://saaksh.co/#app",
                  name: "Saaksh",
                  url: "https://saaksh.co",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR", description: "Free BRSR readiness tool. Pro Collect tier available on request." },
                  description: "Free BRSR gap-analysis tool for Indian ESG consultants. Cited to SEBI & ICAI, everything runs on your device.",
                  publisher: { "@id": "https://saaksh.co/#org" },
                },
              ],
            }),
          }}
        />
        {children}
        <HelpWidget />
        <ConsentBanner />
        <AnalyticsGate />
      </body>
    </html>
  );
}
