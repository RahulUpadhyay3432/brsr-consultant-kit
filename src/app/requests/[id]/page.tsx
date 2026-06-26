import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign, listCompanyContacts } from "@/lib/datarequest/db";
import { campaignEmissions, emissionInputs, GHG_METHODOLOGY } from "@/lib/datarequest/emissions";
import { buildAssuranceLedger, assuranceStats } from "@/lib/datarequest/assurance";
import { exportFilename } from "@/lib/export";
import { signCampaignEvidence } from "@/lib/datarequest/storage";
import AssurancePackButton from "@/components/datarequest/AssurancePackButton";
import CollectionSummary from "@/components/datarequest/CollectionSummary";
import CompanyAvatar from "@/components/CompanyAvatar";
import AnimatedNumber from "@/components/AnimatedNumber";
import { addContactAction, addDirectoryContactsAction, deleteDirectoryContactAction, importDocumentAction, applyImportAction } from "@/lib/datarequest/actions";
import AddOwnerPanel from "@/components/datarequest/AddOwnerPanel";
import ImportPanel from "@/components/datarequest/ImportPanel";
import DirectoryPanel from "@/components/datarequest/DirectoryPanel";
import CopyLinkButton from "@/components/datarequest/CopyLinkButton";
import { REQUEST_FIELDS } from "@/lib/datarequest/fields";
import type { Contact, ContactStatus } from "@/lib/datarequest/types";
import { fmtNum } from "@/lib/emissions-calculator";

export const dynamic = "force-dynamic";

const STATUS_META: Record<ContactStatus, { label: string; cls: string }> = {
  pending: { label: "Awaiting", cls: "text-stone-600 bg-stone-100 border-stone-200" },
  partial: { label: "Partial", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  received: { label: "Received", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
};

// Surface the reminder cadence we already track, so the chasing is visible.
function relativeDays(iso: string | null): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function emailStatus(c: Contact): string {
  if (c.status === "received") return "Data received";
  const when = relativeDays(c.lastEmailedAt);
  if (!when) return "Not emailed yet";
  const reminders = c.remindersSent > 0
    ? ` · ${c.remindersSent} reminder${c.remindersSent > 1 ? "s" : ""} sent`
    : "";
  return `Emailed ${when}${reminders}`;
}

export default async function CampaignDetailPage({
  params, searchParams,
}: { params: { id: string }; searchParams: { error?: string } }) {
  const [campaign, directory] = await Promise.all([
    getCampaign(params.id),
    listCompanyContacts(params.id), // best-effort → [] before the migration
  ]);
  if (!campaign) notFound();

  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const allItems = campaign.contacts.flatMap((c) => c.items);
  const evidence = await signCampaignEvidence(allItems);
  const received = allItems.filter((i) => i.status === "received").length;
  const ghg = campaignEmissions(campaign);
  const inputs = emissionInputs(campaign);
  const assurance = assuranceStats(campaign);
  const addOwner = addContactAction.bind(null, campaign.id, campaign.clientName, campaign.deadline, campaign.reportingPeriod);
  const addContact = addDirectoryContactsAction.bind(null, campaign.id);
  const deleteContact = deleteDirectoryContactAction.bind(null, campaign.id);
  const importDoc = importDocumentAction.bind(null, campaign.id);
  const applyImport = applyImportAction.bind(null, campaign.id);

  return (
    <div className="max-w-[820px] mx-auto bg-page">
      <Link href="/requests" className="text-[13px] text-ink-muted hover:text-ink">← All collections</Link>

      <div className="flex items-start justify-between gap-4 mt-3">
        <div className="flex items-start gap-3 min-w-0">
          <CompanyAvatar name={campaign.clientName} size={40} rounded="rounded-xl" className="mt-0.5" />
          <div className="min-w-0">
            <h1 className="font-display text-[24px] font-bold text-ink tracking-tight">{campaign.clientName}</h1>
            <p className="text-[13px] text-ink-muted mt-1">
              {campaign.reportingPeriod && <>{campaign.reportingPeriod} · </>}
              {campaign.contacts.length} {campaign.contacts.length === 1 ? "owner" : "owners"}
              {campaign.deadline && <> · due {new Date(campaign.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>}
            </p>
          </div>
        </div>
        {allItems.length > 0 && (
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-[13px] font-semibold text-ink-body tabular-nums whitespace-nowrap">{received}/{allItems.length} received</span>
            <Link href={`/requests/${campaign.id}/draft`}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
              Generate draft
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        )}
      </div>

      {allItems.length > 0 && (
        <CollectionSummary
          received={received}
          total={allItems.length}
          owners={assurance.owners}
          withEvidence={assurance.withEvidence}
          emissions={ghg ? ghg.total_tco2e : undefined}
        />
      )}

      {/* Emissions auto-calc + attribution */}
      {ghg && (
        <div className="mt-5 bg-forest text-white rounded-xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50 mb-3">Calculated emissions · from collected activity data</p>
          <div className="grid grid-cols-3 gap-4">
            <Metric label="Scope 1 (fuel)" value={ghg.scope1_tco2e} unit="tCO₂e" />
            <Metric label="Scope 2 (electricity)" value={ghg.scope2_tco2e} unit="tCO₂e" />
            <Metric label="Total" value={ghg.total_tco2e} unit="tCO₂e" accent />
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
            <p className="text-[11px] text-white/40 leading-relaxed pt-1.5">{GHG_METHODOLOGY}</p>
          </div>
        </div>
      )}

      {/* Assurance readiness — reframes the attribution + evidence we already capture
          as the data-ownership trail a reasonable-assurance review asks for. */}
      {allItems.length > 0 && (
        <div className="mt-5 bg-white border border-line rounded-xl p-5 shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[14px] font-semibold text-ink">Assurance readiness</p>
              <p className="text-[12.5px] text-ink-body mt-1 max-w-[58ch] leading-relaxed">
                Every collected figure is traceable to who submitted it, the document that backs it, and the cited
                factor behind any calculation — the data-ownership trail a reasonable-assurance review asks for.
              </p>
            </div>
            {assurance.collected > 0 && (
              <div className="flex-shrink-0">
                <AssurancePackButton
                  rows={buildAssuranceLedger(campaign)}
                  filename={exportFilename("brsr-assurance-ledger", campaign.clientName)}
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[12px] font-medium text-ink-body bg-tint border border-line rounded-full px-2.5 py-1 tabular-nums">
              <AnimatedNumber value={assurance.collected} />/<AnimatedNumber value={assurance.total} /> data points collected
            </span>
            <span className="text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 tabular-nums">
              <AnimatedNumber value={assurance.withEvidence} /> with evidence attached
            </span>
            <span className="text-[12px] font-medium text-ink-body bg-tint border border-line rounded-full px-2.5 py-1 tabular-nums">
              <AnimatedNumber value={assurance.owners} /> data {assurance.owners === 1 ? "owner" : "owners"}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted leading-relaxed mt-3">
            Every figure is a value an owner submitted or computed from one via a cited factor; nothing is estimated.
            {assurance.collected === 0 && " Collect a value to populate the ledger."}
          </p>
        </div>
      )}

      {/* Owners — saved roster + add panel on top, then the list (or empty state) */}
      <div className="mt-5 space-y-3">
        <DirectoryPanel contacts={directory} addAction={addContact} deleteAction={deleteContact} />
        <AddOwnerPanel action={addOwner} error={searchParams.error === "owner"} fields={REQUEST_FIELDS} directory={directory} />
        <ImportPanel importAction={importDoc} applyAction={applyImport} hasItems={allItems.length > 0} />

        {campaign.contacts.length === 0 ? (
          <div className="rounded-xl border border-line bg-tint px-5 py-9 text-center shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
            <div className="mx-auto w-10 h-10 rounded-full bg-white border border-brand-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
            </div>
            <p className="text-[14px] font-semibold text-ink mt-3">No data owners yet</p>
            <p className="text-[13px] text-ink-body mt-1.5 max-w-[44ch] mx-auto leading-relaxed">
              Add the people who hold each number: the energy manager for electricity and fuel,
              HR for headcount, EHS for water. Each gets their own secure link and is reminded
              automatically until they respond.
            </p>
          </div>
        ) : (
          campaign.contacts.map((c) => {
            const meta = STATUS_META[c.status];
            const link = `${base}/submit/${c.token}`;
            const got = c.items.filter((i) => i.status === "received").length;
            const ownerPct = c.items.length > 0 ? Math.round((got / c.items.length) * 100) : 0;
            return (
              <div key={c.id} className="bg-white border border-line rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
                  <CompanyAvatar name={c.name || c.email} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-ink truncate">{c.name || c.email}</p>
                    {c.name && <p className="text-[11.5px] text-ink-muted truncate">{c.email}</p>}
                  </div>
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0 w-32">
                    <div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${ownerPct}%` }} />
                    </div>
                    <span className="text-[11.5px] text-ink-muted tabular-nums whitespace-nowrap">{got}/{c.items.length}</span>
                  </div>
                  <span className="sm:hidden text-[12px] text-ink-muted tabular-nums">{got}/{c.items.length}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.cls} whitespace-nowrap`}>{meta.label}</span>
                </div>
                {c.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-line">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${it.status === "received" ? "bg-emerald-500" : "bg-stone-300"}`} />
                    {it.section && (
                      <span className="flex-shrink-0 text-[10px] font-mono font-semibold text-ink-muted bg-tint border border-line px-1.5 py-0.5 rounded" title={`Section ${it.section}${it.principle ? ` · ${it.principle}` : ""}`}>
                        {it.fieldId}
                      </span>
                    )}
                    <span className="flex-1 min-w-0 text-[13px] text-ink-body truncate">
                      {it.label}{it.unit && <span className="text-ink-muted"> · {it.unit}</span>}
                    </span>
                    {it.evidencePath && (
                      evidence.get(it.id) ? (
                        <a href={evidence.get(it.id)} target="_blank" rel="noreferrer"
                          title={it.evidenceName ?? "View evidence"}
                          className="inline-flex items-center gap-1 flex-shrink-0 text-[11px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-1.5 py-0.5 rounded-md transition-colors pressable">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9 9a4 4 0 01-6-6l9-9a3 3 0 014 4l-9 9a1.5 1.5 0 01-2-2l8-8" /></svg>
                          Evidence
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 flex-shrink-0 text-[11px] text-stone-400" title={it.evidenceName ?? "Evidence attached"}>
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9 9a4 4 0 01-6-6l9-9a3 3 0 014 4l-9 9a1.5 1.5 0 01-2-2l8-8" /></svg>
                          Attached
                        </span>
                      )
                    )}
                    <span className="text-[13px] tabular-nums whitespace-nowrap">
                      {it.value ? <span className="font-semibold text-ink">{it.value}</span> : <span className="text-stone-300">—</span>}
                      {it.priorValue && <span className="text-ink-muted"> · prev {it.priorValue}</span>}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-tint/60 border-t border-line">
                  <CopyLinkButton link={link} />
                  <span className="text-[11.5px] text-ink-muted whitespace-nowrap">{emailStatus(c)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, unit, accent }: { label: string; value: number; unit: string; accent?: boolean }) {
  return (
    <div>
      <p className={`text-[24px] font-semibold leading-none tabular-nums ${accent ? "text-brand-400" : "text-white"}`}><AnimatedNumber value={value} decimals={1} /></p>
      <p className="text-[11px] text-white/50 mt-1.5">{unit}</p>
      <p className="text-[11.5px] text-white/70 mt-0.5">{label}</p>
    </div>
  );
}
