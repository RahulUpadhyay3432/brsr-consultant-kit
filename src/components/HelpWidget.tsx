"use client";

// Persistent, app-wide help. A floating button (bottom-right on every page except
// /login) opens a panel with: the "How it works" steps and an "ask" box that
// keyword-matches the curated help KB (src/data/help_topics.json), no AI, fully
// on-device, so it can only surface vetted answers, never invent one.

import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { searchHelp, type HelpTopic } from "@/lib/help-search";
import helpData from "@/data/help_topics.json";
import { askSaaksh } from "@/lib/datarequest/help-ai";
import { WALKTHROUGH_STEPS, StepRow } from "./Walkthrough";

const TOPICS = (helpData as { topics: HelpTopic[] }).topics;
const COMPLIANCE_CHAT = "https://huggingface.co/spaces/sherlockwatson221/climate-compliance";

// ── Tiny dependency-free markdown renderer ──────────────────────────────────
// Renders the curated/AI answers (which are written as: a summary line, then
// "1." / "2." steps or "- " bullets, with **bold** key terms). Deliberately
// minimal, no HTML is interpreted, only our own inline bold + list grammar.

// Inline: split on **bold** spans (everything else is plain text).
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) {
      out.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    } else {
      out.push(<span key={`${keyPrefix}-t-${i}`}>{part}</span>);
    }
  });
  return out;
}

// Block: group consecutive list lines into <ol>/<ul>; blank lines = spacing;
// everything else is a paragraph.
function renderMarkdown(answer: string): ReactNode {
  const lines = answer.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flush = () => {
    if (!list) return;
    const items = list.items;
    if (list.ordered) {
      blocks.push(
        <ol key={`ol-${key++}`} className="list-decimal pl-5 space-y-1.5 marker:text-brand-600 marker:font-semibold">
          {items.map((it, i) => (
            <li key={i} className="text-[14px] text-ink-body leading-relaxed pl-0.5">{renderInline(it, `li-${i}`)}</li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={`ul-${key++}`} className="list-disc pl-5 space-y-1.5 marker:text-brand-600">
          {items.map((it, i) => (
            <li key={i} className="text-[14px] text-ink-body leading-relaxed pl-0.5">{renderInline(it, `li-${i}`)}</li>
          ))}
        </ul>
      );
    }
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const ordered = /^\d+[.)]\s+/.test(line);
    const bullet = /^[-*•]\s+/.test(line);
    if (ordered || bullet) {
      const wantOrdered = ordered;
      const content = line.replace(ordered ? /^\d+[.)]\s+/ : /^[-*•]\s+/, "");
      if (!list || list.ordered !== wantOrdered) {
        flush();
        list = { ordered: wantOrdered, items: [] };
      }
      list.items.push(content);
    } else {
      flush();
      blocks.push(
        <p key={`p-${key++}`} className="text-[14px] text-ink-body leading-relaxed">
          {renderInline(line, `p-${key}`)}
        </p>
      );
    }
  }
  flush();
  return <div className="space-y-2">{blocks}</div>;
}

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
  // Submitted question drives the answer view (the AI call, with keyword fallback).
  const [asked, setAsked] = useState("");
  const [thinking, setThinking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  // Monotonic id so a stale in-flight AI response can't overwrite a newer ask.
  const askSeq = useRef(0);

  // Keyword results for the submitted question, the graceful fallback when the
  // AI is unavailable, and what we show alongside the AI answer for vetted detail.
  const results = useMemo(() => (asked.trim() ? searchHelp(asked, TOPICS) : []), [asked]);

  async function runAsk(raw: string) {
    const q = raw.trim();
    if (!q) return;
    const seq = ++askSeq.current;
    setAsked(q);
    setOpenId(null);
    setAiAnswer(null);
    setThinking(true);
    try {
      const { answer } = await askSaaksh(q);
      if (seq === askSeq.current) setAiAnswer(answer);
    } catch {
      // Server action threw, fall through to keyword results (aiAnswer stays null).
      if (seq === askSeq.current) setAiAnswer(null);
    } finally {
      if (seq === askSeq.current) setThinking(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Let any part of the app open the assistant (e.g. the Pro nav "Ask Saaksh" button
  // dispatches window.dispatchEvent(new Event("saaksh:open-help"))).
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("saaksh:open-help", onOpen);
    return () => window.removeEventListener("saaksh:open-help", onOpen);
  }, []);

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
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.6 4.3L18 9l-4.4 1.7L12 15l-1.6-4.3L6 9l4.4-1.7L12 3zM18 15l.7 1.9L20.5 18l-1.8.6L18 21l-.7-1.9L15.5 18l1.8-.6L18 15z" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-[15px] font-semibold text-ink">Ask Saaksh AI</p>
                <p className="text-[12px] text-ink-muted">Grounded assistant · never invents</p>
              </div>
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
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runAsk(query); }}
                placeholder="Ask Saaksh a question…"
                aria-label="Ask a question"
                autoFocus
                className="w-full h-10 pl-8 pr-3 text-[14px] text-ink bg-white border border-line rounded-lg
                  focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {asked.trim() ? (
              <div className="mt-2 space-y-3">
                {/* AI answer surface, neutral white card with a thin blue accent; grounded. */}
                {thinking ? (
                  <div className="rounded-lg border border-line bg-white border-l-2 border-l-brand-500 px-3.5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                      <span className="text-[13px] font-medium text-brand-700">Saaksh AI is thinking…</span>
                    </div>
                  </div>
                ) : aiAnswer ? (
                  <div className="rounded-lg border border-line bg-white border-l-2 border-l-brand-500 px-3.5 py-3.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-700 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5">Saaksh AI</span>
                      <span className="text-[11.5px] text-ink-muted">grounded, never invents</span>
                    </div>
                    {renderMarkdown(aiAnswer)}
                  </div>
                ) : null}

                {/* Keyword results, the safe fallback (also shown beside an AI answer for vetted detail). */}
                {results.length ? (
                  <div>
                    {aiAnswer && (
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-2">From the help library</p>
                    )}
                    <ul className="space-y-2">
                      {results.map((t) => {
                        const isOpen = openId === t.id;
                        return (
                          <li key={t.id} className="rounded-lg border border-line overflow-hidden">
                            <button
                              onClick={() => setOpenId(isOpen ? null : t.id)}
                              aria-expanded={isOpen}
                              className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-brand-50/60 transition-colors"
                            >
                              <span className="text-[14px] font-medium text-ink">{t.title}</span>
                              <svg className={`w-3.5 h-3.5 text-ink-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                            {isOpen && (
                              <div className="px-3 pb-3">{renderMarkdown(t.answer)}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : !thinking && !aiAnswer ? (
                  <div className="text-[13.5px] text-ink-body leading-relaxed">
                    <p>
                      No exact match. Here&apos;s the quick sequence below, or for deep regulatory
                      questions open{" "}
                      <a href={COMPLIANCE_CHAT} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-2">Compliance Chat</a>.
                    </p>
                    <div className="mt-4 space-y-4">
                      {WALKTHROUGH_STEPS.map((s) => <StepRow key={s.n} step={s} />)}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setQuery(q); runAsk(q); }}
                      className="text-[12.5px] text-ink-body bg-brand-50 hover:bg-brand-100 border border-brand-100 rounded-full px-2.5 py-1 transition-colors pressable"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">How it works</p>
                <div className="space-y-4">
                  {WALKTHROUGH_STEPS.map((s) => <StepRow key={s.n} step={s} />)}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-line flex items-center justify-between">
            <span className="text-[12px] text-ink-muted">Stuck on a regulation?</span>
            <a
              href={COMPLIANCE_CHAT}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12.5px] font-medium text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
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
        className="fixed z-[100] bottom-4 right-4 sm:right-6 inline-flex items-center gap-2 rounded-full bg-brand-600 text-white
          pl-3.5 pr-4 py-2.5 text-[14px] font-semibold shadow-[0_8px_24px_rgba(11,111,212,0.32)] hover:bg-brand-700 transition-colors pressable"
      >
        {open ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <>
            <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.6 4.3L18 9l-4.4 1.7L12 15l-1.6-4.3L6 9l4.4-1.7L12 3zM18 15l.7 1.9L20.5 18l-1.8.6L18 21l-.7-1.9L15.5 18l1.8-.6L18 15z" />
            </svg>
            Ask Saaksh AI
          </>
        )}
      </button>
    </div>
  );
}
