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
        ink:     { DEFAULT: "#0F172A", body: "#28303B", muted: "#5B6573" },
      },
      fontFamily: {
        // Hanken Grotesk body · Newsreader display serif · IBM Plex Mono (self-hosted)
        sans: ["var(--font-hanken)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-hanken)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
