import { getContactByToken } from "@/lib/datarequest/db";
import { submitDataAction } from "@/lib/datarequest/actions";
import SubmitItemRow from "@/components/datarequest/SubmitItemRow";
import { SaakshMark } from "@/components/SaakshMark";

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  params, searchParams,
}: { params: { token: string }; searchParams: { done?: string } }) {
  const found = await getContactByToken(params.token);

  if (!found) {
    return (
      <Shell>
        <p className="text-[15px] text-stone-700 font-medium">This link is no longer valid.</p>
        <p className="text-[13px] text-stone-500 mt-1">Please ask whoever sent it for a fresh link.</p>
      </Shell>
    );
  }

  const { contact, clientName, reportingPeriod, deadline } = found;

  if (searchParams.done) {
    return (
      <Shell>
        <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="text-[17px] text-ink font-bold">Thank you. Your data is in.</p>
        <p className="text-[13.5px] text-ink-muted mt-1 leading-relaxed">
          The consultant preparing {clientName}&apos;s BRSR report has been notified. You can close this tab.
        </p>
      </Shell>
    );
  }

  const submit = submitDataAction.bind(null, params.token);
  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;
  // BRSR is reported year-on-year, so collect this year + the previous year.
  const thisYearLabel = reportingPeriod || "This year";
  const prevYearLabel = priorFy(reportingPeriod) || "Previous year";

  return (
    <Shell wide>
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-brand-700">Data request</p>
      <h1 className="font-display text-[23px] font-bold text-ink mt-1 tracking-tight">
        A few data points for {clientName}&apos;s BRSR report
      </h1>
      <p className="text-[13.5px] text-ink-muted mt-2 leading-relaxed">
        Hi {contact.name || "there"}, please fill in what you have below
        {reportingPeriod && <> for <strong className="text-stone-700">{reportingPeriod}</strong></>}. Estimates are fine;
        the consultant will confirm. {deadlineStr && <>Needed by <strong className="text-stone-700">{deadlineStr}</strong>.</>}
      </p>

      <form action={submit} className="mt-6 space-y-3 w-full">
        {contact.items.map((it) => (
          <SubmitItemRow
            key={it.id}
            item={{
              id: it.id,
              label: it.label,
              unit: it.unit,
              kind: it.kind,
              value: it.value,
              priorValue: it.priorValue,
              evidenceName: it.evidenceName,
            }}
            thisYearLabel={thisYearLabel}
            prevYearLabel={prevYearLabel}
          />
        ))}

        <div className="pt-2 flex items-center gap-3">
          <button type="submit" className="inline-flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable">
            Submit data
          </button>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-stone-400">
            <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
            Sent securely · no account needed.
          </span>
        </div>
      </form>
    </Shell>
  );
}

// "FY 2025-26" → "FY 2024-25". Returns null if the period isn't a parseable FY.
function priorFy(period: string | null): string | null {
  if (!period) return null;
  const m = period.match(/(\d{4})-(\d{2})/);
  if (!m) return null;
  const start = parseInt(m[1], 10) - 1;
  return `FY ${start}-${String(start + 1).slice(2)}`;
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className="min-h-screen bg-page">
      <div className={`mx-auto px-5 sm:px-8 py-12 ${wide ? "max-w-[640px]" : "max-w-[480px]"}`}>
        <div className="flex items-center gap-2.5 mb-6">
          <SaakshMark size={26} />
          <span className="text-[13px] font-semibold text-ink">Saaksh</span>
        </div>
        <div className={wide ? "" : "bg-white border border-line rounded-2xl p-7 shadow-[0_1px_2px_rgba(16,33,26,0.05)] flex flex-col items-start"}>
          {children}
        </div>
      </div>
    </main>
  );
}
