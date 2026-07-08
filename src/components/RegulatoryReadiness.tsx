"use client";
// "Beyond BRSR" tab, a cited readiness check for the EU CBAM and India's CCTS,
// derived from the client's industry + export markets. On-device, no AI. Shows who
// is in scope and what to prepare; not a liability calculator.
import type { RegulatoryReadiness, RegAssessment, RegVerdict } from "@/lib/regulatory-readiness";
import ViewHeader from "./report/ViewHeader";
import InfoPopover from "./report/InfoPopover";

const VERDICT: Record<RegVerdict, { label: string; cls: string; dot: string }> = {
  applies:    { label: "Likely applies",   cls: "text-[#C2432A] bg-[#FDEBE7] border-[#F8CFC5]", dot: "bg-[#F2674A]" },
  may_apply:  { label: "May apply",         cls: "text-[#8A6516] bg-[#F6ECD8] border-[#EAD9B0]", dot: "bg-[#C2871B]" },
  unlikely:   { label: "Unlikely to apply", cls: "text-stone-600 bg-stone-100 border-stone-200", dot: "bg-stone-400" },
};

function RegCard({ a }: { a: RegAssessment }) {
  const v = VERDICT[a.verdict];
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[17px] font-semibold text-stone-900 leading-tight">{a.name}</h3>
            <p className="text-[13.5px] text-stone-600 mt-1.5 max-w-[64ch] leading-relaxed">{a.what}</p>
          </div>
          <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-2.5 py-1 rounded-full border ${v.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />{v.label}
          </span>
        </div>
        <div className={`mt-3 text-[13.5px] leading-relaxed rounded-lg px-3 py-2.5 border ${v.cls}`}>{a.reason}</div>
      </div>

      <div className="px-5 py-4 grid md:grid-cols-2 gap-5">
        {/* Timeline */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2.5">Key dates</p>
          <ul className="space-y-2.5">
            {a.timeline.map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-brand-500" />
                <div>
                  <p className="text-[13.5px] font-semibold text-stone-700 leading-snug">{t.date}</p>
                  <p className="text-[13.5px] text-stone-600 leading-snug">{t.event}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Checklist */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2.5">Readiness checklist</p>
          <ul className="space-y-2.5">
            {a.checklist.map((c, i) => (
              <li key={i} className="flex gap-2.5">
                <svg className="flex-shrink-0 mt-0.5 w-3.5 h-3.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 12l3 3 5-6" /></svg>
                <div>
                  <p className="text-[13.5px] font-semibold text-stone-700 leading-snug">{c.task}</p>
                  <p className="text-[13.5px] text-stone-600 leading-snug mt-0.5">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer, honest framing + cited sources */}
      <div className="px-5 py-3 bg-stone-50/60 border-t border-stone-100">
        <p className="text-[12.5px] text-stone-500 leading-relaxed">{a.statusNote}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-stone-500">Sources</span>
          {a.sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noreferrer" className="text-[12.5px] text-brand-700 hover:text-brand-800 underline decoration-stone-300 hover:decoration-brand-500 transition-colors">{s.label} ↗</a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegulatoryReadiness({ regulatory }: { regulatory: RegulatoryReadiness }) {
  return (
    <div className="space-y-4">
      <ViewHeader
        tabId="beyond-brsr"
        title="Beyond BRSR"
        subtitle="The other climate regulations on the horizon for Indian companies, checked for scope against this client's industry and export markets, with what to prepare."
        info={
          <InfoPopover title="A readiness check, not a calculator">
            <p>These are cited readiness guides for the EU&apos;s <strong className="text-white">CBAM</strong> and India&apos;s <strong className="text-white">CCTS</strong>: whether each applies to this client, the timeline, and what to get ready.</p>
            <p>Scope is inferred from the client&apos;s industry and export markets you entered. The liability/quantification step comes later, this orients the work, it isn&apos;t a liability calculation.</p>
          </InfoPopover>
        }
      />
      <RegCard a={regulatory.cbam} />
      <RegCard a={regulatory.ccts} />
    </div>
  );
}
