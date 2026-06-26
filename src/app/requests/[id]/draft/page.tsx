import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/datarequest/db";
import { buildDraft } from "@/lib/datarequest/draft";
import { GHG_METHODOLOGY } from "@/lib/datarequest/emissions";
import { fmtNum } from "@/lib/emissions-calculator";
import PrintButton from "@/components/datarequest/PrintButton";
import NarrativePanel from "@/components/datarequest/NarrativePanel";

export const dynamic = "force-dynamic";

export default async function DraftPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaign(params.id);
  if (!campaign) notFound();

  const draft = buildDraft(campaign);
  const date = new Date(draft.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-[780px] mx-auto">
      <div className="no-print">
        <Link href={`/requests/${campaign.id}`} className="text-[13px] text-ink-muted hover:text-ink">← Back to collection</Link>
      </div>

      {/* ── Cover / header card ── */}
      <div className="mt-3 bg-white border border-line rounded-xl shadow-[0_1px_2px_rgba(16,33,26,0.05)] px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-[28px] leading-tight text-ink tracking-tight">BRSR Draft Responses</h1>
            <p className="text-[15px] text-ink-body mt-2 font-medium">
              {draft.clientName}
              {draft.reportingPeriod && <span className="text-ink-muted font-normal"> · {draft.reportingPeriod}</span>}
            </p>
            <p className="text-[12.5px] text-ink-muted mt-1">
              Generated {date} · {draft.collectedCount} of {draft.totalCount} data points collected
            </p>
            <p className="text-[11.5px] text-ink-muted mt-3">
              Prepared with Saaksh · cited to SEBI BRSR Format &amp; ICAI (2024)
            </p>
          </div>
          <div className="no-print">
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Honesty note — prints with the draft */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="text-[12.5px] text-amber-800 leading-relaxed">
          <strong>Drafted from your collected data.</strong> Every figure below is your client&apos;s submitted value
          (emissions are computed from those values using cited CEA / IPCC factors). Nothing is invented. Review,
          edit, and write the qualitative narrative before filing.
        </p>
      </div>

      <NarrativePanel campaignId={campaign.id} initial={campaign.narrative ?? null} />

      {draft.emissions && (
        <Section title="Principle 6 · GHG emissions" subtitle="Computed from submitted activity data">
          <Table>
            <Row label="Scope 1 — fuel combustion" value={`${draft.emissions.scope1} tCO₂e`} />
            <Row label="Scope 2 — purchased electricity" value={`${draft.emissions.scope2} tCO₂e`} />
            <Row label="Total (Scope 1 + 2)" value={`${draft.emissions.total} tCO₂e`} strong />
          </Table>
          {draft.emissionInputs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-line space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Basis &amp; attribution</p>
              {draft.emissionInputs.map((inp, i) => (
                <p key={i} className="text-[12px] text-ink-body leading-relaxed">
                  <span className="font-semibold text-ink">Scope {inp.scope} · {fmtNum(inp.tco2e)} tCO₂e</span>
                  {" ← "}{inp.rawValue} · submitted by {inp.submittedBy} · {inp.factor}
                </p>
              ))}
              <p className="text-[11.5px] text-ink-muted leading-relaxed pt-1">{GHG_METHODOLOGY}</p>
            </div>
          )}
        </Section>
      )}

      {draft.sections.map((s) => (
        <Section key={s.title} title={s.title} subtitle={`${s.lines.length} field${s.lines.length === 1 ? "" : "s"} · ${s.lines.length} received`}>
          <Table headed>
            {s.lines.map((l, i) => (
              <Row key={i} code={l.code} label={l.label} value={l.value} prior={l.prior} />
            ))}
          </Table>
        </Section>
      ))}

      {draft.evidence.length > 0 && (
        <Section title="Supporting evidence" subtitle="For assurance">
          <Table>
            {draft.evidence.map((e, i) => (
              <Row key={i} label={e.label} value={e.fileName} mono />
            ))}
          </Table>
          <p className="text-[11.5px] text-ink-muted leading-relaxed pt-3">
            Source documents attached by the named data owners, each tied to its cited calculation factor —
            the data-ownership and evidence trail an assurance provider needs. Retain these;
            BRSR Core disclosures require reasonable assurance.
          </p>
        </Section>
      )}

      {draft.collectedCount === 0 && (
        <div className="mt-4 bg-tint border border-line rounded-xl px-5 py-4">
          <p className="text-[13px] text-ink-body">
            No data collected yet. Once owners submit values, they appear here as draft responses.
          </p>
        </div>
      )}

      {draft.pending.length > 0 && (
        <div className="mt-6 no-print bg-white border border-line rounded-xl px-5 py-4 shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted mb-3">Still to collect ({draft.pending.length})</p>
          <ul className="space-y-1.5">
            {draft.pending.map((p, i) => (
              <li key={i} className="text-[12.5px] text-ink-muted flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300 flex-shrink-0" />{p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Footer ── */}
      <p className="mt-6 text-[11px] text-ink-muted text-center">
        Prepared with Saaksh · cited to SEBI BRSR Format &amp; ICAI (2024)
      </p>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 bg-white border border-line rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
      <div className="px-6 pt-5 pb-4 border-b border-line">
        <h2 className="font-display font-bold text-[17px] text-ink tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11.5px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-3">{children}</div>
    </div>
  );
}

function Table({ headed, children }: { headed?: boolean; children: React.ReactNode }) {
  return (
    <div>
      {headed && (
        <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-line">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Disclosure</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Current year</span>
        </div>
      )}
      {children}
    </div>
  );
}

function Row({
  code,
  label,
  value,
  prior,
  strong,
  mono,
}: {
  code?: string;
  label: string;
  value: string;
  prior?: string;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-line last:border-0">
      <span className="text-[13px] text-ink-body">
        {code && <span className="font-mono text-[11px] font-semibold text-brand-700 mr-1.5">{code}</span>}
        {label}
      </span>
      <span className={`text-[13px] tabular-nums whitespace-nowrap text-right ${mono ? "font-mono text-[12px]" : ""}`}>
        <span className={strong ? "font-bold text-ink" : "font-semibold text-ink"}>{value}</span>
        {prior && <span className="text-ink-muted font-normal"> · prev {prior}</span>}
      </span>
    </div>
  );
}
