"use client";

// Inline editor for a collection's deadline + reporting period (a popover on the
// workspace header). Lets the consultant change either after the collection exists.
import { useEffect, useRef, useState, useTransition } from "react";
import { updateCampaignAction } from "@/lib/datarequest/actions";

function fyOptions(now = new Date()): string[] {
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const opts: string[] = [];
  for (let s = startYear; s >= startYear - 3; s--) opts.push(`FY ${s}-${String(s + 1).slice(2)}`);
  return opts;
}

export default function CampaignSettingsButton({
  campaignId,
  deadline,
  reportingPeriod,
}: {
  campaignId: string;
  deadline: string | null;
  reportingPeriod: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState(deadline ?? "");
  const [rp, setRp] = useState(reportingPeriod ?? "");
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const opts = fyOptions();
  if (rp && !opts.includes(rp)) opts.unshift(rp);

  function save() {
    start(async () => {
      await updateCampaignAction(campaignId, d || null, rp || null);
      setOpen(false);
    });
  }

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-body bg-white border border-line rounded-full px-2.5 py-0.5 hover:border-stone-300 transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
        title="Edit deadline and reporting period"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
        Edit
      </button>
      {open && (
        <div className="absolute z-30 top-8 left-0 w-64 bg-white border border-line rounded-lg shadow-[0_8px_24px_rgba(15,30,51,0.12)] p-3 space-y-3 dropdown-in">
          <label className="block">
            <span className="block text-[12px] font-medium text-ink-body mb-1">Reporting period</span>
            <select value={rp} onChange={(e) => setRp(e.target.value)} className="w-full h-9 px-2.5 text-[13.5px] text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-[12px] font-medium text-ink-body mb-1">Deadline</span>
            <input type="date" value={d} onChange={(e) => setD(e.target.value)} className="w-full h-9 px-2.5 text-[13.5px] text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <div className="flex items-center gap-2 pt-0.5">
            <button type="button" onClick={save} disabled={pending} className="inline-flex items-center gap-1.5 bg-forest text-white text-[13px] font-semibold px-3 py-1.5 rounded-lg hover:bg-forest-light disabled:opacity-60 transition-colors pressable">
              {pending ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setOpen(false)} disabled={pending} className="text-[13px] text-ink-muted hover:text-ink-body px-1.5">Cancel</button>
          </div>
        </div>
      )}
    </span>
  );
}
