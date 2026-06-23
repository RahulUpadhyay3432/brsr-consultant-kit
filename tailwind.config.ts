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
        forest: {
          DEFAULT: "#0E4A36",
          light: "#0B3A2A",
        },
        // Mint → green accent scale. brand-500 = mint accent; brand-700 = the
        // contrast-safe label-green for small text; brand-800/900 = deep evergreen.
        brand: {
          50: "#E3F7F0",
          100: "#C9EFE2",
          200: "#A6E3D0",
          300: "#6FD4B5",
          400: "#35C9A0",
          500: "#18C39A",
          600: "#0E9E7C",
          700: "#0B6B4F",
          800: "#0E4A36",
          900: "#0B3A2A",
        },
        // Ember warm pop + amber (sparing accents · "Collect" / "Verify" statuses)
        ember: { DEFAULT: "#D9682E", dark: "#A8481B", bg: "#FBE7DC" },
        gold:  { DEFAULT: "#C2871B", dark: "#8A6516", bg: "#F6ECD8" },
      },
      fontFamily: {
        // Hanken Grotesk body · Newsreader display serif · IBM Plex Mono (self-hosted)
        sans: ["var(--font-hanken)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-newsreader)", "Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
