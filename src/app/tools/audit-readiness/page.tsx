"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { downloadCsv } from "@/lib/export";
import {
  AUDIT_GROUPS, AUDIT_META, buildAuditReadinessRows, coreCount, totalCount,
} from "@/lib/audit-readiness";

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  );
}

export default function AuditReadinessPage() {
  const [active, setActive] = useState<string>("all");
  const [coreOnly, setCoreOnly] = useState(false);

  const groups = AUDIT_GROUPS
    .filter((g) => active === "all" || g.principle === active)
    .map((g) => ({ ...g, rows: coreOnly ? g.rows.filter((r) => r.core) : g.rows }))
    .filter((g) => g.rows.length > 0);

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="tools" />
      <main className="flex-1">
        <div className="bg-[#0F1E33]">
          <div className="max-w-[1000px] mx-auto px-5 sm:px-8 py-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
              Filing &amp; audit tools · on-device
            </p>
            <h1 className="font-display font-bold text-[2rem] sm:text-[2.5rem] text-white leading-[1.1] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
              What the BRSR Core assurer will ask you for
            </h1>
            <p className="text-[15px] text-[#9FB0C4] leading-relaxed mt-3 max-w-[640px]">
              The source documents a reasonable-assurance engagement typically requests, per KPI, grouped by principle. Collect them before the assurer starts, and the engagement runs weeks shorter. Download the whole list as a working CSV.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <span className="text-[12.5px] text-white/90 bg-white/10 border border-white/15 rounded-full px-3 py-1">
                {totalCount()} evidence items
              </span>
              <span className="text-[12.5px] text-white/90 bg-[#F2674A]/20 border border-[#F2674A]/30 rounded-full px-3 py-1">
                {coreCount()} tied to a BRSR Core attribute
              </span>
            </div>
          </div>
        </div>

        <div className="anim-up-sm max-w-[1000px] mx-auto px-5 sm:px-8 py-10">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button onClick={() => setActive("all")}
              className={`text-[12.5px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${active === "all" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-muted border-line hover:border-brand-300"}`}>
              All principles
            </button>
            {AUDIT_GROUPS.map((g) => (
              <button key={g.principle} onClick={() => setActive(g.principle)}
                className={`text-[12.5px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${active === g.principle ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-muted border-line hover:border-brand-300"}`}>
                {g.principle}
              </button>
            ))}
            <label className="flex items-center gap-1.5 text-[12.5px] text-ink-muted ml-1 cursor-pointer select-none">
              <input type="checkbox" checked={coreOnly} onChange={(e) => setCoreOnly(e.target.checked)}
                className="accent-brand-600 w-3.5 h-3.5" />
              BRSR Core only
            </label>
            <button onClick={() => downloadCsv("brsr-audit-readiness-checklist.csv", buildAuditReadinessRows())}
              className="ml-auto inline-flex items-center gap-2 bg-forest text-white text-[13px] font-semibold px-3.5 py-2 rounded-lg hover:bg-forest-light transition-colors pressable">
              <DownloadIcon /> Download CSV
            </button>
          </div>

          {/* Groups */}
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.principle} className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3 bg-band border-b border-line">
                  <span className="font-mono text-[11px] font-semibold text-brand-700 bg-white border border-[#CDE2F6] rounded px-1.5 py-0.5">
                    {g.principle}
                  </span>
                  <h2 className="text-[14px] font-semibold text-ink">{g.name}</h2>
                </div>
                <div className="divide-y divide-line">
                  {g.rows.map((r, i) => (
                    <div key={i} className="px-5 py-3.5 grid sm:grid-cols-[1fr_1.3fr] gap-x-6 gap-y-1.5">
                      <div>
                        <p className="text-[13.5px] font-semibold text-ink leading-snug flex items-start gap-2">
                          <span className="flex-1">{r.kpi}</span>
                          {r.core && (
                            <span className="font-mono text-[9px] uppercase tracking-wide text-[#C24428] bg-[#FFF1ED] border border-[#F8C9BD] rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                              Core
                            </span>
                          )}
                        </p>
                        <p className="text-[11.5px] text-ink-faint mt-1">Usually lives with: {r.location}</p>
                      </div>
                      <p className="text-[13px] text-ink-muted leading-relaxed">{r.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Source footer */}
          <div className="rounded-xl border border-line bg-band px-4 py-4 mt-8">
            <p className="text-[12.5px] text-ink-muted leading-relaxed">
              {AUDIT_META.core_note} This list is illustrative; the assurer&rsquo;s own evidence request governs the engagement.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-line-soft">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Sources</span>
              {AUDIT_META.sources.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer"
                  className="text-[12.5px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>

          <p className="text-[12.5px] text-ink-faint leading-relaxed mt-6">
            To see which of these your client already has covered, run the{" "}
            <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">free readiness report</Link>{" "}
            or collect and attribute the evidence in{" "}
            <Link href="/requests" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">Collect (Pro)</Link>.
          </p>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
