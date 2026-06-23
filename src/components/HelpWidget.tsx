"use client";

// Persistent, app-wide help. A floating button (bottom-right on every page except
// /login) opens a panel with: the "How it works" steps and an "ask" box that
// keyword-matches the curated help KB (src/data/help_topics.json) — no AI, fully
// on-device, so it can only surface vetted answers, never invent one.

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { searchHelp, type HelpTopic } from "@/lib/help-search";
import helpData from "@/data/help_topics.json";
import { WALKTHROUGH_STEPS, StepRow } from "./Walkthrough";

const TOPICS = (helpData as { topics: HelpTopic[] }).topics;
const COMPLIANCE_CHAT = "https://huggingface.co/spaces/sherlockwatson221/climate-compliance";

const QUICK = [
  "What do Ready, Verify and Collect mean?",
  "Where is the CSV export?",
  "Will I lose my work?",
  "What is BRSR Core?",
];

export default function HelpWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const results = useMemo(() => (query.trim() ? searchHelp(query, TOPICS) : []), [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // No help affordance on the bare auth screen.
  if (pathname === "/login") return null;

  return (
    <div className="no-print">
      {/* ── Panel ───────────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed z-[100] bottom-20 right-4 sm:right-6 w-[min(384px,calc(100vw-2rem))] max-h-[72vh]
            flex flex-col rounded-2xl bg-white border border-stone-200 shadow-[0_24px_60px_rgba(40,30,15,0.22)] anim-card overflow-hidden"
          role="dialog"
          aria-label="Help"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-100 border border-brand-200 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.375M12 16.5h.008v.008H12V16.5z" />
                </svg>
              </span>
              <p className="text-[14px] font-semibold text-stone-900">Help</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close help"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors pressable"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Ask box */}
          <div className="px-4 pt-3 pb-1.5">
            <div className="relative">
              <svg className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpenId(null); }}
                placeholder="Ask a question…"
                aria-label="Ask a question"
                autoFocus
                className="w-full h-9 pl-8 pr-3 text-[13px] text-stone-800 bg-white border border-stone-200 rounded-lg
                  focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {query.trim() ? (
              results.length ? (
                <ul className="space-y-2 mt-2">
                  {results.map((t) => {
                    const isOpen = openId === t.id;
                    return (
                      <li key={t.id} className="rounded-lg border border-stone-200 overflow-hidden">
                        <button
                          onClick={() => setOpenId(isOpen ? null : t.id)}
                          aria-expanded={isOpen}
                          className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-stone-50 transition-colors"
                        >
                          <span className="text-[13px] font-medium text-stone-800">{t.title}</span>
                          <svg className={`w-3.5 h-3.5 text-stone-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                        {isOpen && (
                          <p className="px-3 pb-3 text-[12.5px] text-stone-600 leading-relaxed">{t.answer}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-3 text-[12.5px] text-stone-500 leading-relaxed">
                  <p>
                    No exact match. Here&apos;s the quick sequence below, or for deep regulatory
                    questions open{" "}
                    <a href={COMPLIANCE_CHAT} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-2">Compliance Chat</a>.
                  </p>
                  <div className="mt-4 space-y-4">
                    {WALKTHROUGH_STEPS.map((s) => <StepRow key={s.n} step={s} />)}
                  </div>
                </div>
              )
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuery(q)}
                      className="text-[11.5px] text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-full px-2.5 py-1 transition-colors pressable"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-stone-400 mb-3">How it works</p>
                <div className="space-y-4">
                  {WALKTHROUGH_STEPS.map((s) => <StepRow key={s.n} step={s} />)}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">Stuck on a regulation?</span>
            <a
              href={COMPLIANCE_CHAT}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11.5px] font-medium text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
            >
              Compliance Chat
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* ── Floating button ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close help" : "Ask Saaksh"}
        className="fixed z-[100] bottom-4 right-4 sm:right-6 inline-flex items-center gap-2 rounded-full bg-forest text-white
          pl-3.5 pr-4 py-2.5 text-[13px] font-semibold shadow-[0_8px_24px_rgba(20,30,25,0.28)] hover:bg-forest-light transition-colors pressable"
      >
        {open ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            Ask Saaksh
          </>
        )}
      </button>
    </div>
  );
}
