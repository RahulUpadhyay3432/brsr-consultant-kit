import type { ReactNode } from "react";

// A reusable "understand this" value section for the tool pages: an editorial
// heading + short intro + a grid of icon cards. Icons are referenced by name so
// pages pass content, not SVG. Keeps every tool page's first-principles block
// visually consistent with the flagship calculator pages.

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ICONS: Record<string, ReactNode> = {
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></>,
  scale: <><path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a3 3 0 005 0zM19 8l-2.5 6a3 3 0 005 0z" /></>,
  refresh: <><path d="M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2M18 5v4h-4M6 19v-4h4" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" /></>,
  grid: <><path d="M4 4h16v16H4zM4 12h16M12 4v16" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0M16 5.5a3 3 0 010 5.8M21 20a6 6 0 00-4-5.6" /></>,
  doc: <><path d="M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6" /></>,
  seal: <><circle cx="12" cy="10" r="6" /><path d="M9 14.5L8 21l4-2 4 2-1-6.5M10 10l1.5 1.5L15 8" /></>,
  trail: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H15a3 3 0 013 3v3.5M15.5 18H9a3 3 0 01-3-3V8.5" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M8 3v4M16 3v4M9 14h2M13 14h2M9 17h2" /></>,
  shield: <><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4" /></>,
  tag: <><path d="M4 4h7l9 9-7 7-9-9V4z" /><circle cx="8" cy="8" r="1.4" /></>,
  alert: <><path d="M10.3 3.9l-8 13.9A2 2 0 004 21h16a2 2 0 001.7-3.2l-8-13.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01" /></>,
  ruler: <><path d="M3 8l5-5 13 13-5 5zM8 6l2 2M11 9l1.5 1.5M14 12l2 2" /></>,
  heart: <><path d="M12 20s-7-4.5-9-9a4.5 4.5 0 018-3 4.5 4.5 0 018 3c-2 4.5-9 9-9 9z" /></>,
  ledger: <><path d="M5 4h14v16H5zM5 9h14M9 4v16M13 13h3M13 16h3" /></>,
  building: <><path d="M4 21V7l6-3v17M10 21V4l10 4v13M4 21h16M13 9h3M13 12h3M13 15h3" /></>,
  link: <><path d="M9 15l6-6M10 6l1-1a4 4 0 015.6 5.6l-1 1M14 18l-1 1a4 4 0 01-5.6-5.6l1-1" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" /></>,
  compare: <><path d="M12 3v18M7 7l-4 5h8zM3 12a4 4 0 008 0M17 5l-4 5h8zM13 10a4 4 0 008 0" /></>,
  book: <><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM19 3v16M8 7h7M8 10h7" /></>,
};

export type ToolLearnItem = { icon: keyof typeof ICONS | string; title: string; body: string };

export function ToolLearn({
  title,
  intro,
  items,
  maxWidth = 1000,
  band = true,
}: {
  title: string;
  intro?: string;
  items: ToolLearnItem[];
  maxWidth?: number;
  band?: boolean;
}) {
  const cols =
    items.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";
  return (
    <section className={band ? "bg-band border-y border-line-soft" : ""}>
      <div className="mx-auto w-full px-5 sm:px-8 py-16" style={{ maxWidth }}>
        <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em]">
          {title}
        </h2>
        {intro && <p className="text-[15.5px] text-ink-body leading-relaxed mt-3 max-w-[720px]">{intro}</p>}
        <div className={`grid ${cols} gap-4 mt-8`}>
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-line bg-white p-6 shadow-elev-1">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" {...S}>{ICONS[it.icon] ?? ICONS.doc}</svg>
              </div>
              <h3 className="text-[15.5px] font-semibold text-ink mt-4">{it.title}</h3>
              <p className="text-[13.5px] text-ink-body leading-relaxed mt-2">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
