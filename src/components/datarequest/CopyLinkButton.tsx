"use client";

import { useState } from "react";

// The secure owner link, as a real action instead of a raw URL dumped on screen.
// "Copy link" with a confirmed state; "Open" previews exactly what the owner sees.
export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard can be blocked (insecure context / permissions), fall back to a prompt.
      window.prompt("Copy this link", link);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy the owner's secure link"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium
          text-stone-600 bg-white border border-stone-200 hover:border-stone-300 hover:text-stone-800
          transition-colors pressable"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
            <span className="text-emerald-700">Copied</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>
            Copy link
          </>
        )}
      </button>
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium
          text-stone-500 hover:text-stone-800 hover:bg-stone-100/70 transition-colors pressable"
      >
        Open
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
      </a>
    </div>
  );
}
