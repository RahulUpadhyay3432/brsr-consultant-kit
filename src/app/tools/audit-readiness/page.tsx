"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
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

  const railItems = [
    { principle: "all", name: "All principles", count: totalCount() },
    ...AUDIT_GROUPS.map((g) => ({
      principle: g.principle,
      name: g.name,
      count: coreOnly ? g.rows.filter((r) => r.core).length : g.rows.length,
    })),
  ];

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          eyebrow="Filing & audit tools · on-device"
          title="What the BRSR Core assurer will ask you for"
          subtitle="The exact source documents a reasonable-assurance engagement requests, listed per KPI and grouped by principle. Hand your client one checklist and the engagement runs weeks shorter."
          benefits={[
            "Every KPI mapped to the evidence an assurer expects, and where it lives",
            `The ${coreCount()} BRSR Core attributes flagged, so you prepare those first`,
            "Download the whole checklist as a working CSV to share with the client",
          ]}
          whoFor="For the consultant scoping a BRSR Core reasonable-assurance engagement. Illustrative; the assurer's own evidence request governs."
        />

        <div className="anim-up-sm mx-auto w-full px-5 sm:px-8 py-10" style={{ maxWidth: 1180 }}>
          <div className="grid lg:grid-cols-[248px_1fr] gap-8 lg:gap-10 items-start">
            {/* Sticky rail: jump / filter / export */}
            <aside className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-line bg-white p-3.5 shadow-elev-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint mb-2.5 px-1.5">Jump to principle</p>
                <div className="space-y-0.5">
                  {railItems.map((it) => {
                    const on = active === it.principle;
                    return (
                      <button key={it.principle} onClick={() => setActive(it.principle)}
                        className={`w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-lg transition-colors ${on ? "bg-brand-50 text-ink" : "hover:bg-band text-ink-body"}`}>
                        {it.principle !== "all" && (
                          <span className={`font-mono text-[10.5px] font-semibold rounded px-1 py-0.5 flex-shrink-0 ${on ? "bg-brand-600 text-white" : "bg-band text-brand-700"}`}>
                            {it.principle}
                          </span>
                        )}
                        <span className="flex-1 text-[13px] font-medium leading-snug">{it.name}</span>
                        <span className="text-[12px] text-ink-muted tabular-nums flex-shrink-0">{it.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-white p-4 shadow-elev-1 space-y-3">
                <label className="flex items-center gap-2 text-[13px] font-medium text-ink-body cursor-pointer select-none">
                  <input type="checkbox" checked={coreOnly} onChange={(e) => setCoreOnly(e.target.checked)}
                    className="accent-brand-600 w-4 h-4" />
                  Show BRSR Core only
                </label>
                <button onClick={() => downloadCsv("brsr-audit-readiness-checklist.csv", buildAuditReadinessRows())}
                  className="w-full inline-flex items-center justify-center gap-2 bg-forest text-white text-[13.5px] font-semibold px-3.5 py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable">
                  <DownloadIcon /> Download CSV
                </button>
                <p className="text-[12.5px] text-ink-muted leading-relaxed">
                  {totalCount()} evidence items · {coreCount()} tied to a BRSR Core attribute.
                </p>
              </div>
            </aside>

            {/* Groups */}
            <div className="min-w-0">
              <div className="space-y-6">
                {groups.map((g) => (
                  <div key={g.principle} className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden scroll-mt-24">
                    <div className="flex items-center gap-2.5 px-5 py-3 bg-band border-b border-line">
                      <span className="font-mono text-[11px] font-semibold text-brand-700 bg-white border border-[#CDE2F6] rounded px-1.5 py-0.5">
                        {g.principle}
                      </span>
                      <h2 className="text-[14.5px] font-semibold text-ink">{g.name}</h2>
                    </div>
                    <div className="divide-y divide-line">
                      {g.rows.map((r, i) => (
                        <div key={i} className="px-5 py-4 grid sm:grid-cols-[1fr_1.25fr] gap-x-6 gap-y-1.5">
                          <div>
                            <p className="text-[14px] font-semibold text-ink leading-snug flex items-start gap-2">
                              <span className="flex-1">{r.kpi}</span>
                              {r.core && (
                                <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-[#C24428] bg-[#FFF1ED] border border-[#F8C9BD] rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                                  Core
                                </span>
                              )}
                            </p>
                            <p className="text-[13px] text-ink-body mt-1.5 leading-relaxed">
                              <span className="text-ink-muted">Usually lives with</span> {r.location}
                            </p>
                          </div>
                          <p className="text-[13.5px] text-ink-body leading-relaxed">{r.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Source footer */}
              <div className="rounded-xl border border-line bg-band px-4 py-4 mt-8">
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  {AUDIT_META.core_note} This list is illustrative; the assurer&rsquo;s own evidence request governs the engagement.
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-line-soft">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Sources</span>
                  {AUDIT_META.sources.map((s) => (
                    <a key={s.href} href={s.href} target="_blank" rel="noreferrer"
                      className="text-[13px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-[13px] text-ink-muted leading-relaxed mt-6">
                To see which of these your client already has covered, run the{" "}
                <Link href="/start" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">free readiness report</Link>{" "}
                or collect and attribute the evidence in{" "}
                <Link href="/requests" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">Collect (Pro)</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
