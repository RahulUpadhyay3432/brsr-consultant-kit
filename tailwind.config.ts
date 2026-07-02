import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Evergreen & Ember — deep evergreen primary (buttons, logo, dark sections)
        // Deep navy — sidebar rail, dark data cards, dark sections (the anchor)
        forest: {
          DEFAULT: "#0F1E33",
          light: "#1A2B45",
        },
        // Vivid blue accent scale. brand-600 = primary blue (white-text AA);
        // brand-500 = bright accent; brand-700 = contrast-safe label-blue.
        brand: {
          50: "#EAF4FE",
          100: "#D3E7FD",
          200: "#AFD2FB",
          300: "#7FB6F7",
          400: "#4D97F0",
          500: "#1E9DF2",
          600: "#0B6FD4",
          700: "#0B5FB0",
          800: "#0C4C8E",
          900: "#0F1E33",
        },
        // Warm coral — "awaiting / collect" status + warm pops (inviting)
        ember: { DEFAULT: "#F2674A", dark: "#C24428", bg: "#FFF1ED" },
        gold:  { DEFAULT: "#C2871B", dark: "#8A6516", bg: "#F6ECD8" },
        // Surfaces + near-black text
        page:    "#FBFCFE",
        surface: "#FFFFFF",
        line:    "#E5E9F0",
        tint:    "#EAF4FE",
        // Depth additions (additive — homepage layering): a cool recessed band that
        // sits between page and tint so alternating sections read as distinct chapters,
        // and a softer hairline for inside-card dividers (card edge stays the strongest line).
        band:      "#EFF3FA",
        "line-soft": "#EEF1F6",
        // faint darkened from #6B7585 so small labels stay legible; reserved for
        // <=11px uppercase mono labels. Content/secondary copy uses muted or darker.
        ink:     { DEFAULT: "#0F172A", body: "#28303B", muted: "#5B6573", faint: "#616A78" },
        // Text on dark surfaces (navy #0F1E33, near-black footer #0A1422), AA-tuned.
        ondark:  { DEFAULT: "#DCE6F2", muted: "#AEBED0", faint: "#93A4B8" },
      },
      // One navy-tinted elevation scale (never pure black) so cards lift off the page.
      boxShadow: {
        "elev-1":       "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)",
        "elev-2":       "0 2px 6px rgba(15,30,51,0.05), 0 12px 32px rgba(15,30,51,0.08)",
        "elev-3":       "0 4px 10px rgba(15,30,51,0.06), 0 24px 56px rgba(15,30,51,0.12)",
        "elev-1-hover": "0 2px 4px rgba(15,30,51,0.05), 0 8px 20px rgba(15,30,51,0.07)",
      },
      fontFamily: {
        // Hanken Grotesk body · Newsreader = editorial serif for big headings.
        // `mono` intentionally resolves to the sans stack: the product uses no
        // monospace typeface (the `font-mono` class name is kept only to avoid
        // churning ~200 call sites; it renders Hanken like everything else).
        sans: ["var(--font-hanken)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["var(--font-hanken)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        display: ["var(--font-hanken)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
