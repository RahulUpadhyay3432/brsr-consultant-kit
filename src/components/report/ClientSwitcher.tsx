"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { ReportOutput, IntakeFormData } from "@/lib/types";
import { INDUSTRY_LABELS, type IndustryType } from "@/lib/types";
import CompanyAvatar from "../CompanyAvatar";
import { listClients, switchToClient, startNewClient, activeClientId } from "@/lib/storage";

// The sidebar client tile, as a quick-switch dropdown: click it to see every
// saved client, switch with one click, or start a new one, without leaving the
// workspace. In demo mode there are no saved clients, so it's a static tile
// (isolation: never reads/writes the real registry).
export default function ClientSwitcher({ report, demo = false }: { report: ReportOutput; demo?: boolean }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0); // saved-client count, for the collapsed hint
  const ref = useRef<HTMLDivElement>(null);
  const name = report.companyName || "Your Client";
  const industryLabel = INDUSTRY_LABELS[report.industry as IndustryType] || report.industry;

  // Read the saved-client count after mount (localStorage), so the tile can show
  // how many clients are inside the dropdown.
  useEffect(() => { if (!demo) setCount(listClients().length); }, [demo, open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (demo) {
    return (
      <div className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg bg-white border border-stone-200/80 shadow-sm">
        <CompanyAvatar name={name} size={28} />
        <div className="leading-tight min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-ink truncate">{name}</p>
          <p className="text-[12px] text-ink-muted truncate">{industryLabel}</p>
        </div>
      </div>
    );
  }

  const clients = open ? listClients() : [];
  const activeId = open ? activeClientId() : null;

  const go = (id: string) => {
    if (id !== activeClientId()) switchToClient(id);
    window.location.assign("/report"); // reload so /report regenerates from the newly-active client
  };
  const newClient = () => { startNewClient(); window.location.assign("/start"); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={count > 1 ? `Switch client (${count} saved)` : "Switch client"}
        className="group flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg bg-white border border-stone-200/80 shadow-sm hover:border-brand-300 transition-colors"
      >
        <CompanyAvatar name={name} size={28} />
        <div className="leading-tight min-w-0 flex-1 text-left">
          <p className="text-[13.5px] font-semibold text-ink truncate">{name}</p>
          <p className="text-[12px] text-ink-muted truncate">
            {count > 1 ? "Switch client" : industryLabel}
          </p>
        </div>
        {count > 1 && (
          <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10.5px] font-bold tabular-nums leading-none">
            {count}
          </span>
        )}
        <svg className={`w-3.5 h-3.5 text-stone-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="anim-card absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-white border border-line shadow-elev-2 overflow-hidden">
          <p className="px-3 pt-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
            My clients ({clients.length})
          </p>
          <div className="max-h-[280px] overflow-y-auto py-0.5">
            {clients.map((c) => {
              const cform = c.data.form as IntakeFormData;
              const cname = c.companyName || "Untitled client";
              const cind = INDUSTRY_LABELS[cform.industry as IndustryType] || cform.industry;
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => go(c.id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-band transition-colors ${isActive ? "bg-brand-50" : ""}`}
                >
                  <CompanyAvatar name={cname} size={24} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink truncate">{cname}</p>
                    <p className="text-[11.5px] text-ink-muted truncate">{cind}</p>
                  </div>
                  {isActive && (
                    <svg className="w-4 h-4 text-brand-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  )}
                </button>
              );
            })}
            {clients.length === 0 && (
              <p className="px-3 py-3 text-[12.5px] text-ink-muted">No other saved clients yet.</p>
            )}
          </div>
          <div className="border-t border-line-soft p-1">
            <button onClick={newClient} className="pressable flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium text-ink-body hover:bg-band transition-colors">
              <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              New client
            </button>
            <Link href="/clients" className="pressable flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium text-ink-body hover:bg-band transition-colors">
              <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
              All clients
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
