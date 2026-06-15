import Link from "next/link";
import { listCampaigns } from "@/lib/datarequest/db";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const campaigns = await listCampaigns();

  return (
    <div className="max-w-[820px] mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] text-stone-900 tracking-tight">Data collections</h1>
          <p className="text-[13.5px] text-stone-500 mt-1">One per client. Track who&apos;s sent their data.</p>
        </div>
        <Link href="/requests/new" className="inline-flex items-center gap-2 bg-forest text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg hover:bg-forest-light transition-colors whitespace-nowrap pressable">
          New collection
        </Link>
      </div>

      <div className="mt-6 space-y-2.5">
        {campaigns.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-xl">
            <p className="text-[14px] text-stone-500">No collections yet.</p>
            <Link href="/requests/new" className="text-[13px] text-brand-700 font-medium hover:underline mt-1 inline-block">
              Start your first one →
            </Link>
          </div>
        ) : (
          campaigns.map((c) => {
            const items = c.contacts.flatMap((ct) => ct.items);
            const received = items.filter((i) => i.status === "received").length;
            const owners = c.contacts.length;
            const pct = items.length ? Math.round((received / items.length) * 100) : 0;
            const complete = items.length > 0 && received === items.length;
            return (
              <Link key={c.id} href={`/requests/${c.id}`}
                className="group flex items-center gap-4 bg-white border border-stone-200 rounded-xl px-4 py-3.5 hover:border-stone-300 transition-colors shadow-[0_1px_3px_rgba(80,60,30,0.04)] pressable">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-stone-800 truncate">{c.clientName}</p>
                  <p className="text-[12px] text-stone-400 truncate">
                    {owners} {owners === 1 ? "owner" : "owners"}
                    {c.deadline && <> · due {new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>}
                  </p>
                </div>
                {items.length > 0 ? (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-20 sm:w-24 h-1.5 rounded-full bg-stone-100 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${received} of ${items.length} fields received`}>
                      <div className={`h-full rounded-full transition-all ${complete ? "bg-emerald-500" : "bg-brand-500"}`} style={{ width: `${Math.max(pct, received > 0 ? 6 : 0)}%` }} />
                    </div>
                    <span className="text-[12px] text-stone-500 tabular-nums w-11 text-right">{received}/{items.length}</span>
                  </div>
                ) : (
                  <span className="text-[12px] text-stone-400 whitespace-nowrap">no fields yet</span>
                )}
                <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
