import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/datarequest/db";
import { requireOrg } from "@/lib/datarequest/org";
import { frameworkCoverage, type FrameworkAnswer } from "@/lib/datarequest/framework-coverage";

export const dynamic = "force-dynamic";

const TONE: Record<FrameworkAnswer["framework"], string> = {
  GRI: "bg-blue-50 text-blue-700 border-blue-100",
  TCFD: "bg-violet-50 text-violet-700 border-violet-100",
  "IFRS S1/S2": "bg-emerald-50 text-emerald-700 border-emerald-100",
  CDP: "bg-sky-50 text-sky-700 border-sky-100",
  EcoVadis: "bg-amber-50 text-amber-700 border-amber-100",
  GRESB: "bg-teal-50 text-teal-700 border-teal-100",
};

const SOURCE_LABEL: Record<string, string> = {
  owner: "Owner-submitted",
  import: "Read from a document",
};

export default async function FrameworkCoveragePage({ params }: { params: { id: string } }) {
  const org = await requireOrg();
  const campaign = await getCampaign(params.id, org.id);
  if (!campaign) notFound();

  const cov = frameworkCoverage(campaign);

  return (
    <div className="max-w-[900px] mx-auto">
      <Link href={`/requests/${campaign.id}`} className="text-[13px] text-ink-muted hover:text-ink">
        ← Back to collection
      </Link>

      <div className="mt-3 bg-white border border-line rounded-xl shadow-[0_1px_2px_rgba(16,33,26,0.05)] px-6 py-6">
        <h1 className="font-display font-bold text-[26px] leading-tight text-ink tracking-tight">
          Collected once, answered across frameworks
        </h1>
        <p className="text-[15px] text-ink-body mt-2 font-medium">
          {cov.clientName}
          {cov.reportingPeriod && <span className="text-ink-muted font-normal"> · {cov.reportingPeriod}</span>}
        </p>
        <p className="text-[13.5px] text-ink-body leading-relaxed mt-3 max-w-[640px]">
          Every figure below was submitted once by the person inside the client who holds it. Each
          row shows where that same number is already an answer in the other frameworks — so it does
          not get asked for again in a different vocabulary.
        </p>

        {cov.frameworksReached.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            <span className="text-[12px] text-ink-muted mr-1 self-center">Reaches:</span>
            {cov.frameworksReached.map((f) => (
              <span key={f} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${TONE[f as FrameworkAnswer["framework"]]}`}>
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* The scope caveat is not a footnote. The product has already promised
          more than it had once; a partial view presented as full would do it
          again. */}
      <div className="mt-4 rounded-xl border border-[#F6CBBC] bg-[#FDF4F0] px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9C3F20] mb-1.5">
          What this covers, and what it does not
        </p>
        <p className="text-[13.5px] text-ink-body leading-relaxed">{cov.scopeNote}</p>
      </div>

      {cov.covered.length === 0 ? (
        <div className="mt-4 rounded-xl border border-line bg-white px-6 py-8 text-center">
          <p className="text-[14.5px] text-ink-body">
            Nothing has come back yet. Once an owner submits an environment figure (energy, water,
            emissions, waste) or a people figure (headcount, training, safety, benefits), it will
            appear here with everything it answers.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {cov.covered.map((row) => (
            <div key={row.fieldId} className="bg-white border border-line rounded-xl px-5 sm:px-6 py-5">
              {/* The collected figure */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[220px]">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand-800">
                    {row.fieldId}
                  </p>
                  <p className="text-[14.5px] text-ink font-medium leading-snug mt-1">{row.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-[22px] font-semibold text-ink tabular-nums leading-none">
                    {row.value}
                    {row.unit && <span className="text-[13px] text-ink-muted font-normal ml-1">{row.unit}</span>}
                  </p>
                  <p className="text-[11.5px] text-ink-faint mt-1.5">
                    {row.ownerName ? `Assigned to ${row.ownerName}` : "Owner not named"}
                    {row.valueSource && ` · ${SOURCE_LABEL[row.valueSource] ?? "Not recorded"}`}
                    {!row.valueSource && " · Not recorded"}
                  </p>
                  {row.evidenceName && (
                    <p className="text-[11.5px] text-brand-700 mt-0.5">📎 {row.evidenceName}</p>
                  )}
                </div>
              </div>

              {/* What this one answer feeds */}
              <div className="mt-4 pl-3.5 border-l-2 border-[#CDE2F6]">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand-800 mb-1.5">
                  This one answer covers {row.metrics.length} metric{row.metrics.length === 1 ? "" : "s"}
                </p>
                <p className="text-[12.5px] text-ink-muted leading-relaxed mb-3">
                  {row.metrics.map((m) => m.label).join(" · ")}
                </p>
                <p className="text-[12.5px] text-ink-faint leading-relaxed mb-3 italic">{row.bridgeNote}</p>

                <div className="space-y-2">
                  {row.answers.map((a, i) => (
                    <div key={`${a.framework}-${i}`} className="flex items-start gap-2.5">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap mt-0.5 ${TONE[a.framework]}`}>
                        {a.framework}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-ink font-medium leading-snug">{a.reference}</p>
                        {a.detail && (
                          <p className="text-[12.5px] text-ink-muted leading-relaxed mt-0.5">{a.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cov.collectedButUnmapped.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-band px-5 sm:px-6 py-5">
          <h2 className="font-display font-bold text-[16px] text-ink">
            Collected, but it answers nothing elsewhere
          </h2>
          <p className="text-[13px] text-ink-muted leading-relaxed mt-1.5 mb-3">
            These came back, and they belong in the BRSR filing — but no other framework asks for
            them in a form this figure can fill. Stated rather than hidden.
          </p>
          <div className="space-y-2.5">
            {cov.collectedButUnmapped.map((u) => (
              <div key={u.fieldId}>
                <p className="text-[13.5px] text-ink font-medium">{u.label}</p>
                <p className="text-[12.5px] text-ink-muted leading-relaxed">{u.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {cov.awaiting.length > 0 && (
        <section className="mt-4 rounded-xl border border-line bg-white px-5 sm:px-6 py-5">
          <h2 className="font-display font-bold text-[16px] text-ink">
            Still waiting ({cov.awaiting.length})
          </h2>
          <p className="text-[13px] text-ink-muted leading-relaxed mt-1.5 mb-3">
            Fields assigned but not yet answered. Each one will light up several frameworks at once
            when it arrives.
          </p>
          <ul className="space-y-1.5">
            {cov.awaiting.map((a) => (
              <li key={a.fieldId} className="text-[13px] text-ink-body">
                {a.label}
                {a.ownerName && <span className="text-ink-faint"> · {a.ownerName}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4 rounded-xl border border-line bg-white px-5 sm:px-6 py-5">
        <h2 className="font-display font-bold text-[16px] text-ink">How this is derived</h2>
        <p className="text-[13px] text-ink-body leading-relaxed mt-2">
          Nothing here is generated or inferred. Each framework reference comes from a sourced
          crosswalk row — GRI standards, TCFD pillars, IFRS references, the published CDP
          questionnaire areas, EcoVadis&apos; documented criteria, and the GRESB Assessment
          Components and Aspects. The link between a BRSR question and those rows is reconciled by
          hand, because SEBI&apos;s question numbering and the crosswalk&apos;s metric numbering use
          the same codes for different disclosures. A figure with no sourced counterpart is listed
          as unmapped above rather than given a plausible-looking home.
        </p>
        <p className="text-[12.5px] text-ink-muted leading-relaxed mt-3">
          This is an indicative view for orienting the work, not a submission to any framework. Each
          framework collects on its own templates, with its own boundaries and reporting-period
          rules.
        </p>
      </section>
    </div>
  );
}
