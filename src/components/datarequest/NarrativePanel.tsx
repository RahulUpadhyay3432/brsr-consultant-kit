"use client";

// Draft-page panel for the AI narrative. Calls the grounded Groq server action,
// renders one editable-prose block per principle (labeled "AI draft"), with a
// Copy button. Generates on demand, so no tokens are spent unless asked.

import { useState } from "react";
import { generateNarrativeAction } from "@/lib/datarequest/actions";
import { PRINCIPLE_LABELS } from "@/lib/datarequest/brsr-meta";

export default function NarrativePanel({
  campaignId,
  initial,
}: {
  campaignId: string;
  initial: Record<string, string> | null;
}) {
  const [narr, setNarr] = useState<Record<string, string> | null>(
    initial && Object.keys(initial).length ? initial : null
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const entries = narr ? Object.entries(narr) : [];

  async function generate() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await generateNarrativeAction(campaignId);
      if (Object.keys(r).length === 0) {
        setNarr(null);
        setMsg("Nothing to draft yet. Collect some principle-wise (Section C) values, then generate.");
      } else {
        setNarr(r);
      }
    } catch {
      setMsg("Could not generate right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy(principle: string, text: string) {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(principle);
        setTimeout(() => setCopied(null), 1500);
      })
      .catch(() => {});
  }

  return (
    <div className="mt-5 bg-white border border-line rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
      <div className="px-4 py-3 border-b border-line bg-tint/60 flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-bold text-ink font-display">AI narrative draft</p>
          <p className="text-[11.5px] text-ink-muted leading-snug mt-0.5">Drafted only from your collected data — never invented. Review before filing.</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="no-print inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-forest
            hover:bg-forest-light disabled:opacity-60 px-3 py-1.5 rounded-lg pressable transition-colors"
        >
          {loading ? "Generating…" : entries.length ? "Regenerate" : "Generate AI narrative"}
        </button>
      </div>

      <div className="px-4 py-3">
        {entries.length === 0 ? (
          <p className="text-[12.5px] text-ink-body leading-relaxed">
            {msg ??
              "Turn your collected figures into editable narrative prose for the principle-wise write-up. It is grounded only in what owners submitted: numbers are never invented or altered. Review and edit before filing."}
          </p>
        ) : (
          <>
            <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> AI draft — review and edit before filing
            </div>
            <div className="space-y-3">
              {entries.map(([p, text]) => (
                <div key={p} className="border border-line rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-[12px] font-semibold text-ink">
                      <span className="font-mono text-ink-muted mr-1.5">{p}</span>
                      {PRINCIPLE_LABELS[p] ?? "Principle"}
                    </p>
                    <button
                      onClick={() => copy(p, text)}
                      className="no-print text-[11px] font-medium text-stone-500 hover:text-stone-800 px-2 py-0.5 rounded transition-colors"
                    >
                      {copied === p ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[12.5px] text-ink-body leading-relaxed whitespace-pre-line">{text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
