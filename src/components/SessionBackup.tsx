"use client";

// Back up / restore the on-device session as a small file. Lets a consultant
// move their work to another browser or device, or keep a safety copy, without
// any account or server, the file stays with them.

import { useRef, useState } from "react";
import { buildSessionBackup, restoreSessionBackup, loadSavedForm, encodeReportParam } from "@/lib/storage";
import { track } from "@/lib/mixpanel";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const FOOTER_BTN =
  "inline-flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium " +
  "text-stone-600 hover:bg-stone-100/70 transition-colors pressable";

// Downloads the current session as saaksh-backup-<client>.json.
export function BackupWorkButton({ className }: { className?: string }) {
  const [done, setDone] = useState(false);

  const onClick = () => {
    const backup = buildSessionBackup();
    if (!backup) return;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = slugify(backup.companyName || "");
    a.download = slug ? `saaksh-backup-${slug}.json` : "saaksh-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <button onClick={onClick} className={className ?? FOOTER_BTN} title="Download a copy of your work">
      {done ? (
        <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      )}
      {done ? "Backed up" : "Back up work"}
    </button>
  );
}

// Copies a shareable /report?v=… link (the intake form encoded in the URL) to the
// clipboard so a consultant can send the report to a colleague. On-device only:
// the colleague's browser regenerates the report, nothing is uploaded.
export function ShareLinkButton({ className }: { className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const onClick = async () => {
    const form = loadSavedForm();
    if (!form) return;
    const param = encodeReportParam(form);
    if (!param) { setState("error"); setTimeout(() => setState("idle"), 2500); return; }
    const url = `${window.location.origin}/report?v=${param}`;
    try {
      await navigator.clipboard.writeText(url);
      track("report_link_copied", { hasCompanyName: !!form.companyName });
      setState("copied");
    } catch {
      // Clipboard blocked (permissions/insecure context): fall back to a prompt
      // so the consultant can still copy the link by hand.
      window.prompt("Copy this shareable report link:", url);
      setState("copied");
    }
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <button onClick={onClick} className={className ?? FOOTER_BTN} title="Copy a shareable link to this report">
      {state === "copied" ? (
        <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      )}
      {state === "copied" ? "Link copied" : state === "error" ? "Couldn't copy" : "Share link"}
    </button>
  );
}

// A "restore from a backup file" affordance. On a valid file it writes the
// session and calls onRestored() (the caller navigates to the report).
export function RestoreWorkButton({
  onRestored,
  className = "text-brand-700 font-medium underline underline-offset-2 hover:text-brand-800",
  label = "Restore your work from a backup file",
}: {
  onRestored: () => void;
  className?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (restoreSessionBackup(JSON.parse(String(reader.result)))) {
          setError(false);
          onRestored();
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    };
    reader.onerror = () => setError(true);
    reader.readAsText(file);
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={() => inputRef.current?.click()} className={className}>
        {label}
      </button>
      <input ref={inputRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
      {error && (
        <span className="text-[12px] text-rose-600">
          That doesn&apos;t look like a Saaksh backup file. Try another.
        </span>
      )}
    </span>
  );
}
