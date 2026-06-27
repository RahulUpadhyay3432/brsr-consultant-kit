import Link from "next/link";
import { listCampaigns } from "@/lib/datarequest/db";
import { loadSampleClientAction, deleteCampaignAction } from "@/lib/datarequest/actions";
import CompanyAvatar from "@/components/CompanyAvatar";
import CampaignRowMenu from "@/components/datarequest/CampaignRowMenu";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const campaigns = await listCampaigns();

  return (
    <div className="max-w-[820px] mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] text-ink tracking-tight">Data collections</h1>
          <p className="text-[13.5px] text-ink-muted mt-1">One per client. Track who&apos;s sent their data.</p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex items-center gap-2 bg-forest text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg hover:bg-forest-light transition-colors whitespace-nowrap pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          New collection
        </Link>
      </div>

      {campaigns.length === 0 ? (
        // EMPTY STATE — guided, never blank.
        <div className="mt-6 bg-white border border-line rounded-xl px-6 py-12 text-center shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
          <div className="mx-auto w-12 h-12 rounded-full bg-tint flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="font-display text-[20px] text-ink tracking-tight">Start with a sample, or create your first client</h2>
          <p className="text-[13.5px] text-ink-body mt-2 max-w-[460px] mx-auto leading-relaxed">
            Tap below to load a fully-populated sample client and see Pro in action — owners, progress, emissions and a draft, instantly.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <form action={loadSampleClientAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-forest text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Load a sample client
              </button>
            </form>
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 bg-white text-ink-body text-[13.5px] font-semibold px-5 py-2.5 rounded-lg border border-line hover:border-ink-muted/40 hover:bg-tint transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              New collection
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 flex justify-end">
            <form action={loadSampleClientAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-700 hover:text-forest transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400 rounded-md px-1.5 py-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Load a sample client
              </button>
            </form>
          </div>

          <div className="mt-2 space-y-2.5">
            {campaigns.map((c) => {
              const items = c.contacts.flatMap((ct) => ct.items);
              const received = items.filter((i) => i.status === "received").length;
              const owners = c.contacts.length;
              const total = items.length;
              const pct = total ? Math.round((received / total) * 100) : 0;
              const complete = total > 0 && received === total;
              const dueLabel = c.deadline
                ? new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : null;
              const statusHint =
                total === 0
                  ? "No fields assigned yet"
                  : complete
                    ? "All data in — ready to draft"
                    : received === 0
                      ? "Awaiting first submission"
                      : `${total - received} still to collect`;
              const hintColor = complete
                ? "text-emerald-600"
                : received === 0
                  ? "text-ember"
                  : "text-amber-600";

              return (
                <div key={c.id} className="relative">
                  <Link
                    href={`/requests/${c.id}`}
                    className="group block bg-white border border-line rounded-xl px-4 py-3.5 hover:border-ink-muted/30 hover:bg-tint/40 transition-colors shadow-[0_1px_2px_rgba(16,33,26,0.05)] pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <div className="flex items-center gap-3.5 pr-9">
                      <CompanyAvatar name={c.clientName} size={36} rounded="rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-[14.5px] font-semibold text-ink truncate" title={c.clientName}>
                            {c.clientName}
                          </p>
                          {c.reportingPeriod && (
                            <span className="flex-shrink-0 text-[10.5px] font-mono font-medium text-brand-700 bg-tint px-1.5 py-0.5 rounded">
                              {c.reportingPeriod}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-ink-muted truncate mt-0.5">
                          {owners} {owners === 1 ? "owner" : "owners"}
                          {dueLabel && <> · due {dueLabel}</>}
                          {" · "}
                          <span className={hintColor}>{statusHint}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3 pl-[50px]">
                      <div
                        className="flex-1 h-1.5 rounded-full bg-line overflow-hidden"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={total > 0 ? `${received} of ${total} fields received` : "No fields assigned yet"}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${complete ? "bg-emerald-500" : "bg-brand-500"}`}
                          style={{ width: `${total > 0 ? Math.max(pct, received > 0 ? 6 : 0) : 0}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-ink-muted tabular-nums flex-shrink-0 w-14 text-right">
                        {total > 0 ? `${received}/${total}` : "0 fields"}
                      </span>
                    </div>
                  </Link>
                  <div className="absolute top-3 right-3">
                    <CampaignRowMenu campaignId={c.id} clientName={c.clientName} deleteAction={deleteCampaignAction} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
