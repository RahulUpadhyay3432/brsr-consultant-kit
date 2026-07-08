"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";

// A small accessible "learn" affordance: an ⓘ button that opens a popover on
// CLICK (not hover, so it works on touch), and closes on Esc or click-outside.
// This is the app's one reusable tooltip; everything else is native title="".
export default function InfoPopover({
  label = "Learn more",
  title,
  children,
  align = "left",
  className = "",
}: {
  label?: string;
  title?: string;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="pressable inline-flex items-center justify-center w-5 h-5 rounded-full border border-line text-ink-faint
          hover:text-brand-700 hover:border-brand-300 bg-white transition-colors"
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6h.01" />
        </svg>
      </button>
      {open && (
        <div
          role="dialog"
          className={`anim-card absolute top-full mt-2 z-40 w-[290px] rounded-xl bg-[#0F1E33] px-4 py-3.5 shadow-elev-2
            ${align === "right" ? "right-0" : "left-0"}`}
        >
          {title && <p className="text-[12.5px] font-semibold text-white mb-1">{title}</p>}
          <div className="text-[12.5px] leading-relaxed text-white/80 space-y-1.5">{children}</div>
        </div>
      )}
    </div>
  );
}
