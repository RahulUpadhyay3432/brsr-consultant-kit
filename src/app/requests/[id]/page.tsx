import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/datarequest/db";
import { campaignEmissions } from "@/lib/datarequest/emissions";
import { addContactAction } from "@/lib/datarequest/actions";
import { REQUEST_FIELDS } from "@/lib/datarequest/fields";
import type { FieldCategory, ContactStatus } from "@/lib/datarequest/types";
import { fmtNum } from "@/lib/emissions-calculator";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER: FieldCategory[] = ["Environment", "Social", "Governance"];
const CATEGORY_DOT: Record<FieldCategory, string> = {
  Environment: "bg-emerald-500", Social: "bg-blue-500", Governance: "bg-violet-500",
};
const STATUS_META: Record<ContactStatus, { label: string; cls: string }> = {
  pending: { label: "Awaiting", cls: "text-stone-600 bg-stone-100 border-stone-200" },
  partial: { label: "Partial", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  received: { label: "Received", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
};

export default async function CampaignDetailPage({
  params, searchParams,
}: { params: { id: string }; searchParams: { error?: string } }) {
  const campaign = await getCampaign(params.id);
  if (!campaign) notFound();

  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const allItems = campaign.contacts.flatMap((c) => c.items);
  const received = allItems.filter((i) => i.status === "received").length;
  const ghg = campaignEmissions(campaign);
  const addOwner = addContactAction.bind(null, campaign.id, campaign.clientName, campaign.deadline);

  const grouped = CATEGORY_ORDER.map((cat) => ({ cat, fields: REQUEST_FIELDS.filter((f) => f.category === cat) }));

  return (
    <div className="max-w-[820px] mx-auto">
        <Link href="/requests" className="text-[13px] text-stone-500 hover:text-stone-700">← All collections</Link>

        <div className="flex items-start justify-between gap-4 mt-3">
          <div>
            <h1 className="font-display text-[24px] text-stone-900 tracking-tight">{campaign.clientName}</h1>
            <p className="text-[13px] text-stone-500 mt-1">
              {campaign.contacts.length} {campaign.contacts.length === 1 ? "owner" : "owners"}
              {campaign.deadline && <> · due {new Date(campaign.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>}
            </p>
          </div>
          {allItems.length > 0 && (
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-[13px] font-semibold text-stone-700 tabular-nums whitespace-nowrap">{received}/{allItems.length} received</span>
              <Link href={`/requests/${campaign.id}/draft`}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                Generate draft
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          )}
        </div>

        {/* Emissions auto-calc — appears once activity data lands */}
        {ghg && (
          <div className="mt-5 bg-[#111] text-white rounded-xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50 mb-3">Calculated emissions · from collected activity data</p>
            <div className="grid grid-cols-3 gap-4">
              <Metric label="Scope 1 (fuel)" value={fmtNum(ghg.scope1_tco2e)} unit="tCO₂e" />
              <Metric label="Scope 2 (electricity)" value={fmtNum(ghg.scope2_tco2e)} unit="tCO₂e" />
              <Metric label="Total" value={fmtNum(ghg.total_tco2e)} unit="tCO₂e" accent />
            </div>
            <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
              CEA grid factor (Scope 2) + IPCC 2006 fuel factors (Scope 1). Auto-computed from submitted electricity &amp; fuel.
            </p>
          </div>
        )}

        {/* Owners */}
        <div className="mt-5 space-y-3">
          {campaign.contacts.map((c) => {
            const meta = STATUS_META[c.status];
            const link = `${base}/submit/${c.token}`;
            const got = c.items.filter((i) => i.status === "received").length;
            return (
              <div key={c.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-stone-800 truncate">{c.name || c.email}</p>
                    {c.name && <p className="text-[11.5px] text-stone-400 truncate">{c.email}</p>}
                  </div>
                  <span className="text-[12px] text-stone-500 tabular-nums">{got}/{c.items.length}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.cls} whitespace-nowrap`}>{meta.label}</span>
                </div>
                {c.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-stone-50">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${it.status === "received" ? "bg-emerald-500" : "bg-stone-300"}`} />
                    <span className="flex-1 min-w-0 text-[13px] text-stone-700 truncate">
                      {it.label}{it.unit && <span className="text-stone-400"> · {it.unit}</span>}
                    </span>
                    <span className="text-[13px] tabular-nums whitespace-nowrap">
                      {it.value ? <span className="font-semibold text-stone-800">{it.value}</span> : <span className="text-stone-300">—</span>}
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-stone-400 px-4 py-2 bg-stone-50/60 break-all border-t border-stone-100">
                  Link: <span className="text-brand-700">{link}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Add a data owner */}
        <div className="mt-6 bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
          <p className="text-[14px] font-semibold text-stone-800">Add a data owner</p>
          <p className="text-[12px] text-stone-500 mt-0.5 mb-4">
            Assign the fields this person owns — e.g. the energy manager for electricity &amp; fuel, EHS for water.
          </p>
          {searchParams.error === "owner" && (
            <p className="mb-4 text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">
              Add an email and select at least one field.
            </p>
          )}
          <form action={addOwner} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input name="name" placeholder="Name (optional)"
                className="h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
              <input name="email" type="email" required placeholder="Email *"
                className="h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
            </div>

            <div className="space-y-4">
              {grouped.map(({ cat, fields }) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[cat]}`} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-400">{cat}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {fields.map((f) => (
                      <label key={f.id} className="flex items-start gap-2.5 px-3 py-2 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 cursor-pointer transition-colors">
                        <input type="checkbox" name="fields" value={f.id} className="mt-0.5 accent-[#00745a]" />
                        <span className="text-[12.5px] text-stone-700 leading-snug">
                          {f.label}
                          {f.kind === "activity" && <span className="ml-1.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-full align-middle">activity</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="inline-flex items-center gap-2 bg-[#111] text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-black transition-colors">
              Send request →
            </button>
          </form>
        </div>
    </div>
  );
}

function Metric({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div>
      <p className={`text-[24px] font-semibold leading-none tabular-nums ${accent ? "text-brand-400" : "text-white"}`}>{value}</p>
      <p className="text-[11px] text-white/50 mt-1.5">{unit}</p>
      <p className="text-[11.5px] text-white/70 mt-0.5">{label}</p>
    </div>
  );
}
