"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/mixpanel";
import { loadJSON, saveJSON, STORAGE_KEYS } from "@/lib/storage";

// A calm, contextual Pro (Collect) upsell on the report Overview, anchored to the
// real "collect fresh" count, the exact pain Collect solves. Dismissible; the
// dismissal persists on the real report but never in demo (isolation).
export default function ProUpsell({ count, demo = false }: { count: number; demo?: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (demo) { setShow(true); return; } // demo shows it (to demonstrate the funnel), persists nothing
    setShow(!loadJSON<boolean>(STORAGE_KEYS.proUpsellSeen, false));
  }, [demo]);

  if (count <= 0 || !show) return null;

  const dismiss = () => {
    setShow(false);
    if (!demo) saveJSON(STORAGE_KEYS.proUpsellSeen, true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-[#0F1E33] to-[#0B4C8E] text-white p-5 sm:p-6 shadow-elev-1">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>

      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand-200 bg-white/10 border border-white/15 rounded-full px-2 py-0.5">
        Pro · Collect
      </span>
      <h3 className="font-display text-[19px] sm:text-[21px] font-bold mt-3 leading-tight max-w-[24ch]">
        {count} fields to collect from your client&apos;s team.
      </h3>
      <p className="text-[14px] text-white/80 leading-relaxed mt-2 max-w-[64ch]">
        Collect (Pro) does the chasing for you: branded request emails, automatic reminders, a no-login form for each
        data owner with evidence upload, and emissions computed and attributed, so you review a draft instead of
        hounding five teams over email.
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Link
          href="/features/collect"
          onClick={() => track("pro_upsell_clicked", { where: "overview", cta: "learn", count })}
          className="pressable inline-flex items-center gap-1.5 rounded-lg bg-white text-forest text-[13.5px] font-semibold px-4 py-2 hover:bg-white/90 transition-colors"
        >
          See what Pro does
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
        <Link
          href="/request-pro"
          onClick={() => track("pro_upsell_clicked", { where: "overview", cta: "request", count })}
          className="pressable inline-flex items-center gap-1.5 rounded-lg border border-white/25 text-white text-[13.5px] font-medium px-4 py-2 hover:bg-white/10 transition-colors"
        >
          Request access
        </Link>
      </div>
    </div>
  );
}
