import type { ReportOutput, ChecklistItem } from "@/lib/types";
import { INDUSTRY_LABELS, type IndustryType } from "@/lib/types";
import { PRINCIPLES } from "./checklist/constants";

// A dedicated, print-only "BRSR Readiness Report" — one clean paginated document
// rendered regardless of which on-screen tab is open. Hidden on screen via the
// `.print-only` class (globals.css); shown when the consultant hits Save as PDF,
// at which point the interactive app shell is hidden via `.no-print`.

const STATUS: Record<ChecklistItem["status"], { label: string; cls: string }> = {
  already_tracked:   { label: "Ready to pull",      cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  partially_tracked: { label: "Needs verification", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  new_data_needed:   { label: "Collect fresh",      cls: "text-stone-600 bg-stone-100 border-stone-200" },
  not_applicable:    { label: "Not applicable",     cls: "text-slate-600 bg-slate-100 border-slate-200" },
};

const CAT_LABEL: Record<string, string> = { environment: "Environment", social: "Social", governance: "Governance" };

export default function PrintReport({ report }: { report: ReportOutput }) {
  const date = new Date(report.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const industry = INDUSTRY_LABELS[report.industry as IndustryType] || report.industry;
  const s = report.summary;
  const applicable = s.totalDataPoints - s.notApplicable;

  const byPrinciple = Object.keys(PRINCIPLES)
    .map((pid) => ({ id: pid, name: PRINCIPLES[pid].name, items: report.checklist.filter((i) => i.principle === pid) }))
    .filter((g) => g.items.length > 0);

  const cats = ["environment", "social", "governance"] as const;

  return (
    <div className="print-only text-stone-900 font-sans" style={{ fontSize: "10.5px", lineHeight: 1.5 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b-2 border-stone-900 pb-3 mb-5">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-brand-700">BRSR Readiness Report</p>
        <h1 className="font-display text-[26px] leading-tight text-stone-900 mt-1">{report.companyName || "Your Client"}</h1>
        <p className="text-[10.5px] text-stone-500 mt-0.5">{industry} · FY 2025–26 · Generated {date}</p>
      </header>

      {/* ── Readiness summary ──────────────────────────────────────────────── */}
      <section className="mb-6 print-avoid-break">
        <h2 className="font-display text-[15px] text-stone-900 mb-1.5">Readiness summary</h2>
        <p className="text-[10px] text-stone-500 mb-3">
          Across the {applicable} principle-wise BRSR disclosures (Section C)
          {s.notApplicable > 0 ? ` · ${s.notApplicable} manufacturing-only fields marked not applicable` : ""}.
        </p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { n: s.alreadyTracked, l: "Ready to pull", c: "text-emerald-700" },
            { n: s.partiallyTracked, l: "Needs verification", c: "text-amber-700" },
            { n: s.newDataNeeded, l: "Collect fresh", c: "text-stone-700" },
            { n: s.notApplicable, l: "Not applicable", c: "text-slate-600" },
          ].map((x) => (
            <div key={x.l} className="border border-stone-200 rounded-md px-2.5 py-2">
              <p className={`text-[20px] font-semibold leading-none tabular-nums ${x.c}`}>{x.n}</p>
              <p className="text-[9px] text-stone-500 mt-1">{x.l}</p>
            </div>
          ))}
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-[8.5px] uppercase tracking-[0.06em] text-stone-400 border-b border-stone-200">
              <th className="py-1 font-semibold">Principle</th>
              <th className="py-1 font-semibold text-right w-12">Ready</th>
              <th className="py-1 font-semibold text-right w-12">Verify</th>
              <th className="py-1 font-semibold text-right w-12">Collect</th>
              <th className="py-1 font-semibold text-right w-12">Total</th>
            </tr>
          </thead>
          <tbody>
            {byPrinciple.map((g) => {
              const ready = g.items.filter((i) => i.status === "already_tracked").length;
              const verify = g.items.filter((i) => i.status === "partially_tracked").length;
              const collect = g.items.filter((i) => i.status === "new_data_needed").length;
              return (
                <tr key={g.id} className="border-t border-stone-100 text-[9.5px]">
                  <td className="py-1 text-stone-700"><span className="font-mono text-stone-400 mr-1.5">{g.id}</span>{g.name}</td>
                  <td className="py-1 text-right tabular-nums text-emerald-700">{ready || "·"}</td>
                  <td className="py-1 text-right tabular-nums text-amber-700">{verify || "·"}</td>
                  <td className="py-1 text-right tabular-nums text-stone-600">{collect || "·"}</td>
                  <td className="py-1 text-right tabular-nums font-semibold text-stone-700">{g.items.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ── Section C — gap analysis by principle ──────────────────────────── */}
      <section className="mb-6">
        <h2 className="font-display text-[15px] text-stone-900 mb-3">Section C · Principle-wise gap analysis</h2>
        {byPrinciple.map((g) => (
          <div key={g.id} className="mb-4">
            <h3 className="font-display text-[13px] text-stone-900 border-b border-stone-300 pb-1 mb-1.5">
              <span className="font-mono text-[10px] text-stone-400 mr-2">{g.id}</span>{g.name}
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-[8px] uppercase tracking-[0.05em] text-stone-400">
                  <th className="py-1 pr-2 font-semibold w-[46px]">Code</th>
                  <th className="py-1 pr-2 font-semibold">Disclosure</th>
                  <th className="py-1 pr-2 font-semibold w-[60px]">Type</th>
                  <th className="py-1 pr-2 font-semibold w-[96px]">Status</th>
                  <th className="py-1 font-semibold w-[120px]">Source / gap</th>
                </tr>
              </thead>
              <tbody>
                {g.items.map((it) => (
                  <tr key={it.id} className="border-t border-stone-100 align-top print-avoid-break">
                    <td className="py-1 pr-2 font-mono text-[8.5px] text-stone-500">{it.id}</td>
                    <td className="py-1 pr-2 text-[9.5px] text-stone-800 leading-snug">
                      {it.label}{it.unit ? <span className="text-stone-400"> ({it.unit})</span> : null}
                    </td>
                    <td className="py-1 pr-2 text-[8.5px] text-stone-500">{it.indicator_type === "essential" ? "Essential" : "Leadership"}</td>
                    <td className="py-1 pr-2">
                      <span className={`inline-block text-[8px] font-semibold px-1.5 py-0.5 rounded-full border whitespace-nowrap ${STATUS[it.status].cls}`}>
                        {STATUS[it.status].label}
                      </span>
                    </td>
                    <td className="py-1 text-[8.5px] text-stone-500 leading-snug">{it.source_filing || it.gap_note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      {/* ── Sections A & B ─────────────────────────────────────────────────── */}
      <section className="mb-6 print-avoid-break">
        <h2 className="font-display text-[15px] text-stone-900 mb-1.5">Sections A &amp; B · General disclosures</h2>
        <p className="text-[9.5px] text-stone-500 mb-2.5">
          Entity and policy disclosures collected from the client&apos;s own records (not gap-analysed against filings).
        </p>
        {([["Section A · General disclosures", report.generalDisclosures.sectionA],
           ["Section B · Management & process", report.generalDisclosures.sectionB]] as const).map(([title, items]) => (
          <div key={title} className="mb-3">
            <h3 className="text-[11px] font-semibold text-stone-700 mb-1">{title}</h3>
            <ul className="space-y-0.5">
              {items.map((d) => (
                <li key={d.id} className="flex gap-2 text-[9.5px] text-stone-700 leading-snug">
                  <span className="font-mono text-[8.5px] text-stone-400 shrink-0 w-[64px]">{d.id}</span>
                  <span>{d.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ── Suggested materiality ──────────────────────────────────────────── */}
      <section className="mb-5">
        <h2 className="font-display text-[15px] text-stone-900 mb-1.5">Suggested material topics</h2>
        <p className="text-[9.5px] text-stone-500 mb-3">
          A suggested starting shortlist for {industry}. This is a head start for the stakeholder-engagement
          process, not a completed materiality assessment.
        </p>
        {cats.map((cat) => {
          const topics = report.materialityTopics.filter((t) => t.category === cat);
          if (!topics.length) return null;
          return (
            <div key={cat} className="mb-3 print-avoid-break">
              <h3 className="text-[11px] font-semibold text-stone-700 mb-1">{CAT_LABEL[cat]}</h3>
              <ul className="space-y-1.5">
                {topics.map((t) => (
                  <li key={t.id} className="text-[9.5px] leading-snug">
                    <span className="font-semibold text-stone-800">{t.topic}</span>
                    <span className="text-stone-400"> · {t.brsr_principles.join(", ")}</span>
                    <span className="block text-stone-500">{t.why_material}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-6 pt-2.5 border-t border-stone-300 text-[8.5px] text-stone-400 leading-relaxed">
        Generated by BRSR Consultant Kit · Cited to the SEBI BRSR Format &amp; ICAI Background Material (2024).
        Client data is processed on your device; nothing is uploaded or stored. Review and adapt before filing.
      </footer>
    </div>
  );
}
