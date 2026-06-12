import Link from "next/link";
import { listCampaigns } from "@/lib/datarequest/db";
import { logoutAction } from "@/lib/datarequest/auth";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const campaigns = await listCampaigns();

  return (
    <main className="min-h-screen bg-[#F7F6F2]">
      <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] text-stone-900 tracking-tight">Data collections</h1>
            <p className="text-[13.5px] text-stone-500 mt-1">One per client. Track who&apos;s sent their data.</p>
          </div>
          <div className="flex items-center gap-2">
            <form action={logoutAction}>
              <button type="submit" className="text-[12.5px] text-stone-500 hover:text-stone-700 px-2.5 py-2 rounded-lg hover:bg-stone-100 transition-colors">
                Log out
              </button>
            </form>
            <Link href="/requests/new" className="inline-flex items-center gap-2 bg-[#111] text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-lg hover:bg-black transition-colors whitespace-nowrap">
              New collection
            </Link>
          </div>
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
              return (
                <Link key={c.id} href={`/requests/${c.id}`}
                  className="flex items-center gap-4 bg-white border border-stone-200 rounded-xl px-4 py-3.5 hover:border-stone-300 transition-colors shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-stone-800 truncate">{c.clientName}</p>
                    <p className="text-[12px] text-stone-400 truncate">
                      {owners} {owners === 1 ? "owner" : "owners"}
                      {c.deadline && <> · due {new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>}
                    </p>
                  </div>
                  <span className="text-[12px] text-stone-500 tabular-nums whitespace-nowrap">
                    {items.length === 0 ? "no fields yet" : `${received}/${items.length} fields`}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
