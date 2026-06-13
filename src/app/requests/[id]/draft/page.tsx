import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/datarequest/db";
import { buildDraft } from "@/lib/datarequest/draft";
import { GHG_METHODOLOGY } from "@/lib/datarequest/emissions";
import { fmtNum } from "@/lib/emissions-calculator";
import PrintButton from "@/components/datarequest/PrintButton";

export const dynamic = "force-dynamic";

export default async function DraftPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaign(params.id);
  if (!campaign) notFound();

  const draft = buildDraft(campaign);
  const date = new Date(draft.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-[760px] mx-auto">
      <div className="no-print">
        <Link href={`/requests/${campaign.id}`} className="text-[13px] text-stone-500 hover:text-stone-700">← Back to collection</Link>
      </div>

      <div className="flex items-start justify-between gap-4 mt-3">
        <div>
          <h1 className="font-display text-[24px] text-stone-900 tracking-tight">Draft BRSR responses</h1>
          <p className="text-[13px] text-stone-500 mt-1">
            {draft.clientName} · {date} · {draft.collectedCount} of {draft.totalCount} data points collected
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Honesty note — prints with the draft */}
      <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <p className="text-[12.5px] text-amber-800 leading-relaxed">
          <strong>Drafted from your collected data.</strong> Every figure below is your client&apos;s submitted value
          (emissions are computed from those values using cited CEA / IPCC factors). Nothing is invented — review,
          edit, and write the qualitative narrative before filing.
        </p>
      </div>

      {draft.emissions && (
        <Section title="Principle 6 — GHG emissions (computed)">
          <Line label="Scope 1 — fuel combustion" value={`${draft.emissions.scope1} tCO₂e`} />
          <Line label="Scope 2 — purchased electricity" value={`${draft.emissions.scope2} tCO₂e`} />
          <Line label="Total (Scope 1 + 2)" value={`${draft.emissions.total} tCO₂e`} />
          {draft.emissionInputs.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-stone-100 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400">Basis</p>
              {draft.emissionInputs.map((inp, i) => (
                <p key={i} className="text-[11.5px] text-stone-500 leading-relaxed">
                  <span className="font-medium text-stone-700">Scope {inp.scope} · {fmtNum(inp.tco2e)} tCO₂e</span>
                  {" ← "}{inp.rawValue} · submitted by {inp.submittedBy} · {inp.factor}
                </p>
              ))}
              <p className="text-[11px] text-stone-400 leading-relaxed pt-1">{GHG_METHODOLOGY}</p>
            </div>
          )}
        </Section>
      )}

      {draft.sections.map((s) => (
        <Section key={s.title} title={s.title}>
          {s.lines.map((l, i) => <Line key={i} label={l.label} value={l.value} />)}
        </Section>
      ))}

      {draft.collectedCount === 0 && (
        <p className="mt-5 text-[13px] text-stone-500">
          No data collected yet — once owners submit values, they appear here as draft responses.
        </p>
      )}

      {draft.pending.length > 0 && (
        <div className="mt-6 no-print">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-400 mb-2">Still to collect ({draft.pending.length})</p>
          <ul className="space-y-1">
            {draft.pending.map((p, i) => (
              <li key={i} className="text-[12.5px] text-stone-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300 flex-shrink-0" />{p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
      <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-500">{title}</p>
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-stone-50 last:border-0">
      <span className="text-[13px] text-stone-700">{label}</span>
      <span className="text-[13px] font-semibold text-stone-900 tabular-nums whitespace-nowrap">{value}</span>
    </div>
  );
}
