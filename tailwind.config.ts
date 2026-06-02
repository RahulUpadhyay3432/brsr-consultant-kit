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
        forest: {
          DEFAULT: "#0d0d0d",   // Mintlify: black pill primary
          light: "#262626",
        },
        brand: {
          50: "#effdf9",
          100: "#c8fbec",
          200: "#94f5d8",
          300: "#58e8be",
          400: "#28d4a4",
          500: "#00d4a4",   // Mintlify signature mint
          600: "#00b890",
          700: "#009473",
          800: "#00745a",
          900: "#005e49",
        },
      },
      fontFamily: {
        // Apple SF Pro on Mac/iOS → Geist on Windows → system-ui elsewhere
        sans: ["-apple-system", "BlinkMacSystemFont", "var(--font-geist-sans)", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
