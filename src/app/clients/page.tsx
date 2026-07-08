"use client";

// The on-device "My clients" workspace (/clients). Lists every client the
// consultant has saved in this browser and lets them reopen, start, or delete
// one. Everything is in localStorage, nothing is uploaded, so it's the same
// privacy model as the rest of the free tool, just multi-client.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import CompanyAvatar from "@/components/CompanyAvatar";
import { listClients, switchToClient, deleteClient, startNewClient, type SavedClient } from "@/lib/storage";
import { generateReport } from "@/lib/report-generator";
import { INDUSTRY_LABELS, COMPANY_SIZE_LABELS, type IntakeFormData } from "@/lib/types";

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Base gap-analysis stat for a saved client (ready / to-collect), computed on the
// fly from its intake form. Pure + cheap; falls back to nulls if the form is odd.
function clientStat(client: SavedClient): { ready: number; collect: number; total: number } | null {
  try {
    const r = generateReport(client.data.form as IntakeFormData);
    return {
      ready: r.summary.alreadyTracked,
      collect: r.summary.newDataNeeded,
      total: r.summary.totalDataPoints - r.summary.notApplicable,
    };
  } catch {
    return null;
  }
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setClients(listClients());
    setMounted(true);
  }, []);

  const open = (id: string) => {
    if (switchToClient(id)) router.push("/report");
  };
  const remove = (id: string, name: string) => {
    if (window.confirm(`Remove ${name || "this client"} from this device? This can't be undone.`)) {
      deleteClient(id);
      setClients(listClients());
    }
  };
  const newClient = () => {
    startNewClient();
    router.push("/start");
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[900px] px-5 sm:px-8 py-12 sm:py-16">

          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Workspace</p>
              <h1 className="font-editorial font-semibold text-ink text-[2.2rem] sm:text-[2.6rem] leading-tight tracking-[-0.02em] mt-2">
                My clients
              </h1>
              <p className="text-[14.5px] text-ink-muted leading-relaxed mt-2 max-w-[560px]">
                Every client you&apos;ve worked on in this browser, saved automatically so you can pick up where you left off. Saved on this device only, nothing is uploaded.
              </p>
            </div>
            <button
              onClick={newClient}
              className="pressable inline-flex items-center gap-2 rounded-xl bg-forest text-white text-[14.5px] font-semibold px-4 py-2.5 hover:bg-forest-light transition-colors shadow-sm flex-shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              New client
            </button>
          </div>

          {/* List */}
          <div className="mt-8">
            {!mounted ? null : clients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center">
                <p className="text-[15px] font-semibold text-ink">No saved clients yet</p>
                <p className="text-[13.5px] text-ink-muted leading-relaxed mt-1.5 max-w-[380px] mx-auto">
                  Start a readiness report for your first client, and it&apos;ll appear here so you can return to it anytime.
                </p>
                <button
                  onClick={newClient}
                  className="pressable inline-flex items-center gap-2 rounded-xl bg-forest text-white text-[14px] font-semibold px-4 py-2.5 hover:bg-forest-light transition-colors mt-5"
                >
                  Start your first report
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {clients.map((c) => {
                  const form = c.data?.form as IntakeFormData | undefined;
                  const stat = clientStat(c);
                  const industry = form ? INDUSTRY_LABELS[form.industry] : "";
                  const size = form ? COMPANY_SIZE_LABELS[form.companySize] : "";
                  return (
                    <li
                      key={c.id}
                      className="group rounded-2xl border border-line bg-white shadow-elev-1 hover:border-brand-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 p-4 sm:p-5">
                        <button onClick={() => open(c.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                          <CompanyAvatar name={c.companyName || "Client"} size={40} />
                          <div className="min-w-0">
                            <p className="text-[15.5px] font-semibold text-ink truncate">{c.companyName || "Untitled client"}</p>
                            <p className="text-[12.5px] text-ink-muted truncate">
                              {[industry, size].filter(Boolean).join(" · ")}
                              {c.savedAt && <span className="text-ink-faint"> · saved {timeAgo(c.savedAt)}</span>}
                            </p>
                          </div>
                        </button>

                        {/* Readiness stat */}
                        {stat && (
                          <div className="hidden sm:flex items-center gap-4 flex-shrink-0 mr-1">
                            <div className="text-right">
                              <p className="text-[15px] font-semibold text-brand-700 tabular-nums leading-none">{stat.ready}</p>
                              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint mt-1">ready</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[15px] font-semibold text-ember tabular-nums leading-none">{stat.collect}</p>
                              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-faint mt-1">to collect</p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => open(c.id)}
                            className="pressable inline-flex items-center gap-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-100 text-[13px] font-semibold px-3 py-2 hover:bg-brand-100 transition-colors"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => remove(c.id, c.companyName)}
                            aria-label={`Delete ${c.companyName || "client"}`}
                            className="pressable inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink-faint hover:text-ember hover:bg-ember-bg transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" /></svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
