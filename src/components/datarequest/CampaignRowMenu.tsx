"use client";

// Per-card "⋯" actions menu on the collections list. Lives OUTSIDE the card's
// <Link> (a button can't nest in an anchor), positioned over its top-right corner.
// Delete is guarded by a native confirm — destructive + irreversible.

import { useEffect, useRef, useState, useTransition } from "react";

export default function CampaignRowMenu({
  campaignId,
  clientName,
  deleteAction,
}: {
  campaignId: string;
  clientName: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onDelete() {
    setOpen(false);
    if (!window.confirm(`Delete "${clientName}" and all its collected data? This can't be undone.`)) return;
    startTransition(() => {
      void deleteAction(campaignId);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Actions for ${clientName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-line/70 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50"
      >
        {pending ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="12" cy="19" r="1.6" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-48 bg-white border border-line rounded-lg shadow-[0_8px_24px_rgba(15,30,51,0.12)] py-1 dropdown-in"
        >
          <button
            type="button"
            role="menuitem"
            onClick={onDelete}
            className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[13.5px] font-medium text-ember-dark hover:bg-ember-bg transition-colors focus:outline-none focus-visible:bg-ember-bg"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" />
            </svg>
            Delete collection
          </button>
        </div>
      )}
    </div>
  );
}
