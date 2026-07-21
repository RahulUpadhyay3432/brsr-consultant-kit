import type { MetadataRoute } from "next";

// Web app manifest, so Saaksh Brief can be installed to the home screen and open
// standalone (no browser chrome). Next serves this at /manifest.webmanifest and
// links it site-wide; start_url points at the Brief.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saaksh Brief",
    short_name: "Brief",
    description: "The 30-second read on Indian ESG & BRSR: SEBI, BRSR Core, CBAM, CCTS and global frameworks.",
    start_url: "/brief",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F1E33",
    theme_color: "#0F1E33",
    categories: ["news", "business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
