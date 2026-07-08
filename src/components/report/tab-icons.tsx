import { type CSSProperties } from "react";

// Per-tab accent colour + duotone glyphs, shared by the sidebar (ReportView) and
// the per-view headers (ViewHeader) so each view carries a consistent identity.

export const ICON_COLOR: Record<string, string> = {
  overview:     "#0B6FD4", // brand blue
  checklist:    "#0B5FB0", // deep blue
  materiality:  "#7B6FE0", // violet
  framework:    "#0E7A56", // teal-green
  alignment:    "#0E7A56",
  "beyond-brsr":"#F2674A", // coral / ember
  templates:    "#C2871B", // amber
  sources:      "#5B6573", // slate
  collect:      "#F2674A", // coral
  community:    "#1EA362", // green
};

// Colourful duotone nav icons: a soft accent-tinted fill behind a crisp accent glyph.
// Colour comes from each tab's accent (above); active/idle is carried by opacity.
export function TabIcon({ id, className, active = true, size = 16 }: { id: string; className?: string; active?: boolean; size?: number }) {
  const color = ICON_COLOR[id] ?? "#5B6573";
  const p = {
    className,
    width: size, height: size, viewBox: "0 0 16 16",
    style: { color, opacity: active ? 1 : 0.78 } as CSSProperties,
  };
  const fg = { stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

  if (id === "overview") return (
    <svg {...p}>
      <rect x="2" y="2" width="5" height="5" rx="1.4" fill="currentColor" fillOpacity="0.95" />
      <rect x="9" y="2" width="5" height="5" rx="1.4" fill="currentColor" fillOpacity="0.28" />
      <rect x="2" y="9" width="5" height="5" rx="1.4" fill="currentColor" fillOpacity="0.28" />
      <rect x="9" y="9" width="5" height="5" rx="1.4" fill="currentColor" fillOpacity="0.95" />
    </svg>
  );
  if (id === "checklist") return (
    <svg {...p}>
      <rect x="2.5" y="2" width="11" height="12" rx="2" fill="currentColor" fillOpacity="0.16" />
      <path d="M5.2 6.2h5.6M5.2 8.6h5.6M5.2 11h3.4" {...fg} />
    </svg>
  );
  if (id === "materiality") return (
    <svg {...p}>
      <rect x="2" y="2" width="12" height="12" rx="2.4" fill="currentColor" fillOpacity="0.14" />
      <circle cx="5" cy="10.8" r="1.35" fill="currentColor" />
      <circle cx="8.2" cy="7.2" r="1.35" fill="currentColor" />
      <circle cx="11.2" cy="4.4" r="1.35" fill="currentColor" />
    </svg>
  );
  if (id === "framework" || id === "alignment") return (
    <svg {...p}>
      <path d="M4.4 8l6 -3.6M4.4 8l6 3.6" {...fg} />
      <circle cx="3.6" cy="8" r="1.9" fill="currentColor" fillOpacity="0.95" />
      <circle cx="12" cy="4" r="1.9" fill="currentColor" fillOpacity="0.4" />
      <circle cx="12" cy="12" r="1.9" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
  if (id === "beyond-brsr") return (
    <svg {...p}>
      <circle cx="8" cy="8" r="6" fill="currentColor" fillOpacity="0.15" />
      <circle cx="8" cy="8" r="6" {...fg} />
      <path d="M2.2 8h11.6M8 2.2c1.7 1.6 1.7 10 0 11.6M8 2.2c-1.7 1.6-1.7 10 0 11.6" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  );
  if (id === "templates") return (
    <svg {...p}>
      <path d="M4 2.5h4.6l3.4 3.4V13a1 1 0 01-1 1H4a1 1 0 01-1-1V3.5a1 1 0 011-1z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth={1.45} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.4 2.6v3.4h3.4" {...fg} />
      <path d="M5.6 9.2h4.8M5.6 11.2h3" {...fg} />
    </svg>
  );
  if (id === "sources") return (
    <svg {...p}>
      <path d="M2.6 3.2A1.4 1.4 0 014 2h3.4v11H4a1.4 1.4 0 00-1.4 1.4z" fill="currentColor" fillOpacity="0.2" />
      <path d="M13.4 3.2A1.4 1.4 0 0012 2H8.6v11H12a1.4 1.4 0 011.4 1.4z" fill="currentColor" fillOpacity="0.1" />
      <path d="M2.6 3.2A1.4 1.4 0 014 2h3.4v11H4a1.4 1.4 0 00-1.4 1.4zM13.4 3.2A1.4 1.4 0 0012 2H8.6v11H12a1.4 1.4 0 011.4 1.4z" {...fg} />
    </svg>
  );
  if (id === "collect") return (
    <svg {...p}>
      <path d="M14 2.2L9 14l-2.4-5.2L1.5 6.4 14 2.2z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth={1.45} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2.2L6.6 8.8" {...fg} />
    </svg>
  );
  if (id === "community") return (
    <svg {...p}>
      <path d="M2.5 4a1.5 1.5 0 011.5-1.5h8A1.5 1.5 0 0113.5 4v4.6A1.5 1.5 0 0112 10h-5l-3 2.6V10a1.5 1.5 0 01-1.5-1.4V4z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth={1.45} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.6" cy="6.2" r="0.8" fill="currentColor" />
      <circle cx="8" cy="6.2" r="0.8" fill="currentColor" />
      <circle cx="10.4" cy="6.2" r="0.8" fill="currentColor" />
    </svg>
  );
  return null;
}
