import { getContactByToken } from "@/lib/datarequest/db";
import { submitDataAction } from "@/lib/datarequest/actions";

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

  const { contact, clientName, deadline } = found;

  if (searchParams.done) {
    return (
      <Shell>
        <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="text-[16px] text-stone-900 font-semibold">Thank you — your data is in.</p>
        <p className="text-[13.5px] text-stone-500 mt-1 leading-relaxed">
          The consultant preparing {clientName}&apos;s BRSR report has been notified. You can close this tab.
        </p>
      </Shell>
    );
  }

  const submit = submitDataAction.bind(null, params.token);
  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <Shell wide>
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-brand-700">Data request</p>
      <h1 className="font-display text-[22px] text-stone-900 mt-1 tracking-tight">
        A few data points for {clientName}&apos;s BRSR report
      </h1>
      <p className="text-[13.5px] text-stone-500 mt-2 leading-relaxed">
        Hi {contact.name || "there"} — please fill in what you have below. Estimates are fine; the consultant will
        confirm. {deadlineStr && <>Needed by <strong className="text-stone-700">{deadlineStr}</strong>.</>}
      </p>

      <form action={submit} className="mt-6 space-y-3 w-full">
        {contact.items.map((it) => (
          <div key={it.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3.5">
            <label className="block">
              <span className="block text-[13.5px] font-medium text-stone-800">
                {it.label}{it.unit && <span className="text-stone-400 font-normal"> ({it.unit})</span>}
              </span>
              <input
                name={`f_${it.id}`}
                defaultValue={it.value ?? ""}
                placeholder="Enter value"
                className="mt-2 w-full h-10 px-3 text-[13.5px] text-stone-800 bg-stone-50 border border-stone-200 rounded-lg
                  focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
            </label>
          </div>
        ))}

        <div className="pt-2 flex items-center gap-3">
          <button type="submit" className="inline-flex items-center gap-2 bg-[#111] text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-black transition-colors">
            Submit data
          </button>
          <span className="text-[12px] text-stone-400">Sent securely · no account needed.</span>
        </div>
      </form>
    </Shell>
  );
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className="min-h-screen bg-[#F7F6F2]">
      <div className={`mx-auto px-5 sm:px-8 py-12 ${wide ? "max-w-[640px]" : "max-w-[480px]"}`}>
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-[26px] h-[26px] rounded-md bg-[#111] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white leading-none">BK</span>
          </span>
          <span className="text-[13px] font-semibold text-stone-900">BRSR Consultant Kit</span>
        </div>
        <div className={wide ? "" : "bg-white border border-stone-200 rounded-2xl p-7 shadow-[0_2px_20px_rgba(100,80,40,0.06)] flex flex-col items-start"}>
          {children}
        </div>
      </div>
    </main>
  );
}
