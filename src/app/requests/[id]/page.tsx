import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/datarequest/db";
import { campaignEmissions, emissionInputs } from "@/lib/datarequest/emissions";
import { addContactAction } from "@/lib/datarequest/actions";
import AddOwnerPanel from "@/components/datarequest/AddOwnerPanel";
import type { ContactStatus } from "@/lib/datarequest/types";
import { fmtNum } from "@/lib/emissions-calculator";

export const dynamic = "force-dynamic";

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
  const inputs = emissionInputs(campaign);
  const addOwner = addContactAction.bind(null, campaign.id, campaign.clientName, campaign.deadline);

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

      {/* Emissions auto-calc + attribution */}
      {ghg && (
        <div className="mt-5 bg-[#111] text-white rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50 mb-3">Calculated emissions · from collected activity data</p>
          <div className="grid grid-cols-3 gap-4">
            <Metric label="Scope 1 (fuel)" value={fmtNum(ghg.scope1_tco2e)} unit="tCO₂e" />
            <Metric label="Scope 2 (electricity)" value={fmtNum(ghg.scope2_tco2e)} unit="tCO₂e" />
            <Metric label="Total" value={fmtNum(ghg.total_tco2e)} unit="tCO₂e" accent />
          </div>
          {/* Traceability — every figure back to its input, factor + source, and who gave it */}
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            {inputs.map((inp, i) => (
              <p key={i} className="text-[11.5px] text-white/55 leading-relaxed">
                <span className="text-white/85 font-medium">Scope {inp.scope} · {fmtNum(inp.tco2e)} tCO₂e</span>
                {"  ←  "}{inp.rawValue}
                <span className="text-white/35"> · </span>submitted by {inp.submittedBy}
                <span className="text-white/35"> · </span>{inp.factor}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Owners — add panel on top, then the list */}
      <div className="mt-5 space-y-3">
        <AddOwnerPanel action={addOwner} error={searchParams.error === "owner"} />

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
