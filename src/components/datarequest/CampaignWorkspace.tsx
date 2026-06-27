"use client";

// The Collect campaign workspace — the Pro multi-view surface for one client.
// A header (client identity + actions) over a VIEW-TAB switcher
// (Overview · Owners · Data · Emissions · Draft). All data is passed in from the
// server page (no refetch here); we only switch which view renders. Every number
// is real (status / value / priorValue / lastEmailedAt / remindersSent / evidence /
// computed emissions) — nothing is fabricated.

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CompanyAvatar from "@/components/CompanyAvatar";
import AnimatedNumber from "@/components/AnimatedNumber";
import ProgressBar from "@/components/datarequest/charts/ProgressBar";
import StatusDonut from "@/components/datarequest/charts/StatusDonut";
import CopyLinkButton from "@/components/datarequest/CopyLinkButton";
import AssurancePackButton from "@/components/datarequest/AssurancePackButton";
import AddOwnerPanel from "@/components/datarequest/AddOwnerPanel";
import DirectoryPanel from "@/components/datarequest/DirectoryPanel";
import BulkImportPanel from "@/components/datarequest/BulkImportPanel";
import { PRINCIPLE_LABELS, SECTION_LABELS, PRINCIPLE_ORDER } from "@/lib/datarequest/brsr-meta";
import type { Campaign, Contact, Item, ContactStatus, CompanyContact, RequestField } from "@/lib/datarequest/types";
import type { EmissionInput } from "@/lib/datarequest/emissions";
import type { BulkImportResult, DocCategory } from "@/lib/datarequest/importer";

type Action = (formData: FormData) => void | Promise<void>;

const STATUS_META: Record<ContactStatus, { label: string; cls: string; dot: string }> = {
  pending: { label: "Awaiting", cls: "text-ember-dark bg-ember-bg border-ember/30", dot: "#F2674A" },
  partial: { label: "Partial", cls: "text-amber-700 bg-amber-50 border-amber-200", dot: "#D9A015" },
  received: { label: "Received", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "#10A572" },
};

const ITEM_STATUS = {
  received: { label: "Received", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "#10A572" },
  pending: { label: "Awaiting", cls: "text-ember-dark bg-ember-bg border-ember/30", dot: "#F2674A" },
} as const;

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

function fmtT(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

type ViewKey = "overview" | "autofill" | "readiness" | "owners" | "data" | "emissions" | "draft";
const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "autofill", label: "Auto-fill" },
  { key: "readiness", label: "Readiness" },
  { key: "owners", label: "Owners" },
  { key: "data", label: "Data" },
  { key: "emissions", label: "Emissions" },
  { key: "draft", label: "Draft" },
];

export interface CampaignWorkspaceProps {
  campaign: Campaign;
  base: string;
  evidenceUrls: Record<string, string>; // item.id → signed URL (server-signed)
  ghg: { scope1_tco2e: number; scope2_tco2e: number; total_tco2e: number } | null;
  inputs: EmissionInput[];
  methodology: string;
  assurance: { collected: number; total: number; withEvidence: number; owners: number };
  ledger: string[][];
  ledgerFilename: string;
  daysToDeadline: number | null;
  directory: CompanyContact[];
  fields: RequestField[];
  addOwnerError: boolean;
  // server actions (already bound to the campaign on the server)
  addOwnerAction: Action;
  addContactAction: Action;
  deleteContactAction: Action;
  bulkAction: (campaignId: string, docs: { name: string; text: string; category?: DocCategory }[]) => Promise<BulkImportResult>;
  applyBulkAction: (campaignId: string, accepted: { fieldId: string; value: string }[]) => Promise<void>;
  remindAllPendingAction: () => Promise<void>;
}

export default function CampaignWorkspace(props: CampaignWorkspaceProps) {
  const { campaign } = props;
  // The active view is reflected in the URL (?view=) so the sidebar can deep-link to
  // each section and a tab is shareable. Tab clicks update the URL without a refetch
  // (history.replaceState); a sidebar deep-link (a real navigation) is picked up via
  // the effect below.
  const searchParams = useSearchParams();
  const urlView: ViewKey = (() => {
    const v = searchParams.get("view");
    return VIEWS.some((x) => x.key === v) ? (v as ViewKey) : "overview";
  })();
  const [view, setView] = useState<ViewKey>(urlView);
  useEffect(() => { setView(urlView); }, [urlView]);
  const goView = (key: ViewKey) => {
    setView(key);
    if (typeof window !== "undefined") window.history.replaceState(null, "", `/requests/${campaign.id}?view=${key}`);
  };
  const [pending, startTransition] = useTransition();

  const allItems = useMemo(() => campaign.contacts.flatMap((c) => c.items), [campaign]);
  const received = allItems.filter((i) => i.status === "received").length;
  const awaiting = allItems.length - received;
  const hasPending = campaign.contacts.some((c) => c.status !== "received");

  function remindAll() {
    startTransition(() => { void props.remindAllPendingAction(); });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <CompanyAvatar name={campaign.clientName} size={44} rounded="rounded-xl" className="mt-0.5" />
          <div className="min-w-0">
            <h1 className="font-display text-[28px] font-bold text-ink tracking-tight leading-tight">{campaign.clientName}</h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {campaign.reportingPeriod && <Chip>{campaign.reportingPeriod}</Chip>}
              <Chip>{campaign.contacts.length} {campaign.contacts.length === 1 ? "owner" : "owners"}</Chip>
              {campaign.deadline && (
                <Chip>
                  due {new Date(campaign.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {props.daysToDeadline != null && props.daysToDeadline >= 0 && <span className="text-ink-muted"> · {props.daysToDeadline}d</span>}
                </Chip>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasPending && allItems.length > 0 && (
            <button
              onClick={remindAll}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-ink-body bg-white border border-line hover:border-stone-300 px-3.5 py-2 rounded-lg transition-colors pressable disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-2.6-6.4M21 3v6h-6" /></svg>
              {pending ? "Reminding…" : "Remind all pending"}
            </button>
          )}
          {allItems.length > 0 && (
            <Link
              href={`/requests/${campaign.id}/draft`}
              className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-white bg-forest hover:bg-forest-light px-3.5 py-2 rounded-lg transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              Generate draft
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          )}
        </div>
      </div>

      {/* View-tab switcher */}
      <div className="mt-6 border-b border-line">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => goView(v.key)}
              className={`relative px-3.5 py-2.5 text-[14.5px] font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-t-md ${
                view === v.key ? "text-ink" : "text-ink-body hover:text-ink"
              }`}
            >
              {v.label}
              {view === v.key && <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-forest" />}
            </button>
          ))}
        </div>
      </div>

      {/* Active view (tab-fade on switch) */}
      <div key={view} className="anim-up-sm mt-5">
        {view === "overview" && <OverviewView {...props} received={received} awaiting={awaiting} hasPending={hasPending} onRemindAll={remindAll} reminding={pending} onGoView={goView} />}
        {view === "autofill" && <AutofillView {...props} />}
        {view === "readiness" && <ReadinessView {...props} />}
        {view === "owners" && <OwnersView {...props} />}
        {view === "data" && <DataView {...props} />}
        {view === "emissions" && <EmissionsView {...props} />}
        {view === "draft" && <DraftView {...props} />}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-[13.5px] font-medium text-ink-body bg-white border border-line rounded-full px-2.5 py-0.5">
      {children}
    </span>
  );
}

/* ─────────────────────────── OVERVIEW ─────────────────────────── */

function ReadinessView(props: CampaignWorkspaceProps) {
  const { campaign, fields } = props;
  const [onlyMissing, setOnlyMissing] = useState(false);

  // fieldIds that already have a real collected value (from owners or auto-fill).
  const collected = useMemo(() => {
    const s = new Set<string>();
    for (const c of campaign.contacts)
      for (const it of c.items)
        if (it.status === "received" && it.value && it.value.trim()) s.add(it.fieldId);
    return s;
  }, [campaign]);

  const total = fields.length;
  const coveredCount = fields.filter((f) => collected.has(f.id)).length;
  const pct = total > 0 ? Math.round((coveredCount / total) * 100) : 0;

  // Group the full BRSR skeleton by Section → Principle.
  const sections: ("A" | "B" | "C")[] = ["A", "B", "C"];
  const grouped = sections
    .map((sec) => {
      const inSec = fields.filter((f) => (f.section ?? "C") === sec);
      if (sec === "C") {
        const byP = PRINCIPLE_ORDER
          .map((p) => ({ key: p, label: `${p} · ${PRINCIPLE_LABELS[p] ?? ""}`, rows: inSec.filter((f) => f.principle === p) }))
          .filter((g) => g.rows.length > 0);
        const noP = inSec.filter((f) => !f.principle);
        if (noP.length) byP.push({ key: "C-other", label: "General", rows: noP });
        return { sec, groups: byP };
      }
      return { sec, groups: inSec.length ? [{ key: sec, label: SECTION_LABELS[sec], rows: inSec }] : [] };
    })
    .filter((s) => s.groups.length > 0);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">BRSR readiness</p>
            <p className="text-[34px] font-bold text-ink tabular-nums leading-none mt-1.5"><AnimatedNumber value={pct} />%</p>
            <p className="text-[14px] text-ink-body mt-1.5">
              <span className="font-semibold text-ink tabular-nums">{coveredCount}</span> of {total} BRSR fields covered ·{" "}
              <span className="font-semibold text-ember-dark tabular-nums">{total - coveredCount}</span> still to collect
            </p>
          </div>
          <button
            onClick={() => setOnlyMissing((v) => !v)}
            className="text-[13px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {onlyMissing ? "Show all fields" : "Show only the gaps"}
          </button>
        </div>
        <div className="mt-4"><ProgressBar value={coveredCount} total={total} /></div>
        <p className="text-[13.5px] text-ink-body mt-3 leading-relaxed">
          Covered = a value already collected for that field — from a data owner, or auto-filled from your documents.
          Use <span className="font-semibold text-ink">Auto-fill from your documents</span> above to close the gaps in one upload.
        </p>
      </Card>

      {grouped.map(({ sec, groups }) => (
        <div key={sec}>
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted mb-2">{SECTION_LABELS[sec]}</p>
          <div className="space-y-2">
            {groups.map((g) => {
              const cov = g.rows.filter((f) => collected.has(f.id)).length;
              const rows = onlyMissing ? g.rows.filter((f) => !collected.has(f.id)) : g.rows;
              if (!rows.length) return null;
              return <ReadinessGroup key={g.key} title={g.label} covered={cov} total={g.rows.length} rows={rows} collected={collected} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadinessGroup({
  title, covered, total, rows, collected,
}: { title: string; covered: number; total: number; rows: RequestField[]; collected: Set<string> }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-tint/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <svg className={`w-4 h-4 text-ink-muted transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="flex-1 text-[14px] font-semibold text-ink truncate">{title}</span>
        <div className="hidden sm:block w-24 h-1.5 rounded-full bg-line overflow-hidden">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${total ? (covered / total) * 100 : 0}%` }} />
        </div>
        <span className="text-[13px] text-ink-muted tabular-nums whitespace-nowrap">{covered}/{total}</span>
      </button>
      {open && (
        <div className="border-t border-line divide-y divide-line">
          {rows.map((f) => {
            const has = collected.has(f.id);
            return (
              <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-tint/40 transition-colors">
                <span className="flex-shrink-0 text-[11.5px] font-mono font-semibold text-ink-muted bg-tint border border-line px-1.5 py-0.5 rounded">{f.id}</span>
                <span className="flex-1 min-w-0 text-[14px] text-ink-body" title={f.label}>{f.label}{f.unit && <span className="text-ink-muted"> · {f.unit}</span>}</span>
                {has ? (
                  <span className="inline-flex items-center gap-1 flex-shrink-0 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                    Covered
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 flex-shrink-0 text-[12px] font-medium text-ink-muted bg-page border border-line px-2 py-0.5 rounded-full">
                    To collect
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// The single "Auto-fill from your documents" space (was a separate panel above the
// header — now a workspace tab, below the company identity, so there's ONE place).
function AutofillView(props: CampaignWorkspaceProps) {
  return (
    <BulkImportPanel
      campaignId={props.campaign.id}
      bulkAction={props.bulkAction}
      applyAction={props.applyBulkAction}
    />
  );
}

function AutofillCta({ onGoView }: { onGoView: (key: ViewKey) => void }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-tint text-brand-700 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
        </span>
        <div className="min-w-0">
          <p className="text-[15.5px] font-bold text-ink font-display">Already have the client&apos;s documents?</p>
          <p className="text-[13.5px] text-ink-body mt-1 leading-relaxed">
            Upload last year&apos;s BRSR, the annual report, bills or policies and let the AI fill the BRSR for you — then chase only what&apos;s still missing.
          </p>
          <button onClick={() => onGoView("autofill")} className="mt-3 inline-flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-forest-light transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400">
            Auto-fill from documents
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

function OverviewView(
  props: CampaignWorkspaceProps & { received: number; awaiting: number; hasPending: boolean; onRemindAll: () => void; reminding: boolean; onGoView: (key: ViewKey) => void },
) {
  const { campaign, ghg, assurance } = props;
  const allItems = campaign.contacts.flatMap((c) => c.items);
  const segments = [
    { value: props.received, color: "#10A572", label: "Received" },
    { value: props.awaiting, color: "#F2674A", label: "Awaiting" },
  ].filter((s) => s.value > 0 || allItems.length === 0);
  const pct = allItems.length > 0 ? Math.round((props.received / allItems.length) * 100) : 0;

  if (allItems.length === 0) {
    return (
      <div className="space-y-5">
        <AutofillCta onGoView={props.onGoView} />
        <EmptyOwners />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Kpi label="Collected">
          <span className="text-[26px] font-bold text-ink tabular-nums"><AnimatedNumber value={pct} />%</span>
          <span className="block text-[12.5px] text-ink-body mt-0.5 tabular-nums">{props.received}/{allItems.length}</span>
        </Kpi>
        <Kpi label="Owners">
          <span className="text-[26px] font-bold text-ink tabular-nums"><AnimatedNumber value={assurance.owners} /></span>
          <span className="block text-[12.5px] text-ink-body mt-0.5">{assurance.owners === 1 ? "person" : "people"}</span>
        </Kpi>
        <Kpi label="Evidence">
          <span className="text-[26px] font-bold text-ink tabular-nums"><AnimatedNumber value={assurance.withEvidence} /></span>
          <span className="block text-[12.5px] text-ink-body mt-0.5">{assurance.withEvidence === 1 ? "document" : "documents"}</span>
        </Kpi>
        {ghg && (
          <Kpi label="Emissions">
            <span className="text-[26px] font-bold text-ink tabular-nums"><AnimatedNumber value={ghg.total_tco2e} decimals={1} /></span>
            <span className="block text-[12.5px] text-ink-body mt-0.5">tCO₂e total</span>
          </Kpi>
        )}
        {props.daysToDeadline != null && (
          <Kpi label="Deadline">
            <span className="text-[26px] font-bold text-ink tabular-nums">
              {props.daysToDeadline >= 0 ? <AnimatedNumber value={props.daysToDeadline} /> : "—"}
            </span>
            <span className="block text-[12.5px] text-ink-body mt-0.5">{props.daysToDeadline >= 0 ? "days left" : "past due"}</span>
          </Kpi>
        )}
      </div>

      {/* Progress bar + status donut */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-3">
        <Card>
          <p className="text-[14.5px] font-semibold text-ink mb-3">Collection progress</p>
          <ProgressBar value={props.received} total={allItems.length} label="Data points received" />
          <p className="text-[12.5px] text-ink-body mt-3 leading-relaxed">
            Across {campaign.contacts.length} {campaign.contacts.length === 1 ? "owner" : "owners"}. Owners are reminded automatically until they respond.
          </p>
        </Card>
        <Card>
          <p className="text-[14.5px] font-semibold text-ink mb-3">By status</p>
          <StatusDonut
            segments={segments.length ? segments : [{ value: allItems.length, color: "#E8EBEA", label: "Awaiting" }]}
            centerLabel={`${pct}%`}
            centerSub="done"
            size={120}
          />
        </Card>
      </div>

      {/* Tracking panel */}
      <Card>
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[14.5px] font-semibold text-ink">Owner tracking</p>
          {props.hasPending && (
            <button
              onClick={props.onRemindAll}
              disabled={props.reminding}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors pressable disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {props.reminding ? "Reminding…" : "Remind all pending"}
            </button>
          )}
        </div>
        <div className="divide-y divide-line">
          {campaign.contacts.map((c) => {
            const got = c.items.filter((i) => i.status === "received").length;
            const meta = STATUS_META[c.status];
            return (
              <div key={c.id} className="flex items-center gap-3 py-2.5">
                <CompanyAvatar name={c.name || c.email} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold text-ink truncate">{c.name || c.email}</p>
                  <p className="text-[12.5px] text-ink-body truncate">{emailStatus(c)}</p>
                </div>
                <span className="text-[12.5px] text-ink-body tabular-nums whitespace-nowrap hidden sm:inline">{got}/{c.items.length}</span>
                <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center gap-1 ${meta.cls}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <ToolsArea {...props} />
    </div>
  );
}

function ToolsArea(props: CampaignWorkspaceProps) {
  const { campaign, assurance } = props;
  const allItems = campaign.contacts.flatMap((c) => c.items);
  return (
    <Card>
      <p className="text-[14.5px] font-semibold text-ink">Tools</p>
      <p className="text-[13.5px] text-ink-body mt-1 mb-3 leading-relaxed">
        Every collected figure is traceable to who submitted it, the document that backs it, and the cited factor behind any
        calculation — the data-ownership trail a reasonable-assurance review asks for.
      </p>
      {allItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[13.5px] font-medium text-ink-body bg-tint border border-line rounded-full px-2.5 py-1 tabular-nums">
            <AnimatedNumber value={assurance.collected} />/<AnimatedNumber value={assurance.total} /> collected
          </span>
          <span className="text-[13.5px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 tabular-nums">
            <AnimatedNumber value={assurance.withEvidence} /> with evidence
          </span>
          <span className="text-[13.5px] font-medium text-ink-body bg-tint border border-line rounded-full px-2.5 py-1 tabular-nums">
            <AnimatedNumber value={assurance.owners} /> data {assurance.owners === 1 ? "owner" : "owners"}
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {assurance.collected > 0 && (
          <AssurancePackButton rows={props.ledger} filename={props.ledgerFilename} />
        )}
      </div>
    </Card>
  );
}

/* ─────────────────────────── OWNERS ─────────────────────────── */

function OwnersView(props: CampaignWorkspaceProps) {
  const { campaign, base, evidenceUrls } = props;
  return (
    <div className="space-y-3">
      <DirectoryPanel contacts={props.directory} addAction={props.addContactAction} deleteAction={props.deleteContactAction} />
      <AddOwnerPanel action={props.addOwnerAction} error={props.addOwnerError} fields={props.fields} directory={props.directory} />

      {campaign.contacts.length === 0 ? (
        <EmptyOwners />
      ) : (
        campaign.contacts.map((c) => (
          <OwnerRow key={c.id} contact={c} link={`${base}/submit/${c.token}`} evidenceUrls={evidenceUrls} />
        ))
      )}
    </div>
  );
}

function OwnerRow({ contact: c, link, evidenceUrls }: { contact: Contact; link: string; evidenceUrls: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[c.status];
  const got = c.items.filter((i) => i.status === "received").length;
  const pct = c.items.length > 0 ? Math.round((got / c.items.length) * 100) : 0;

  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-tint/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <CompanyAvatar name={c.name || c.email} size={30} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink truncate">{c.name || c.email}</p>
          {c.name && <p className="text-[12.5px] text-ink-body truncate">{c.email}</p>}
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 w-32">
          <div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
            <div className="h-full rounded-full bg-brand-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[12.5px] text-ink-body tabular-nums whitespace-nowrap">{got}/{c.items.length}</span>
        </div>
        <span className="sm:hidden text-[13.5px] text-ink-body tabular-nums">{got}/{c.items.length}</span>
        <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center gap-1 ${meta.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
          {meta.label}
        </span>
        <svg className={`w-4 h-4 text-ink-muted transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      {open && (
        <div className="border-t border-line anim-up-sm">
          {c.items.map((it) => (
            <ItemRow key={it.id} item={it} evidenceUrl={evidenceUrls[it.id]} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-tint/60 border-t border-line">
        <CopyLinkButton link={link} />
        <span className="text-[12.5px] text-ink-body whitespace-nowrap">{emailStatus(c)}</span>
      </div>
    </div>
  );
}

function ItemRow({ item: it, evidenceUrl }: { item: Item; evidenceUrl?: string }) {
  const st = it.status === "received" ? ITEM_STATUS.received : ITEM_STATUS.pending;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-t border-line first:border-t-0 hover:bg-tint/40 transition-colors">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: st.dot }} />
      {it.section && (
        <span className="flex-shrink-0 text-[11.5px] font-mono font-semibold text-ink-body bg-tint border border-line px-1.5 py-0.5 rounded" title={`Section ${it.section}${it.principle ? ` · ${it.principle}` : ""}`}>
          {it.fieldId}
        </span>
      )}
      <span className="flex-1 min-w-0 text-[14.5px] text-ink-body" title={it.label}>
        {it.label}{it.unit && <span className="text-ink-muted"> · {it.unit}</span>}
      </span>
      {it.evidencePath && (
        evidenceUrl ? (
          <a href={evidenceUrl} target="_blank" rel="noreferrer" title={it.evidenceName ?? "View evidence"}
            className="inline-flex items-center gap-1 flex-shrink-0 text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-1.5 py-0.5 rounded-md transition-colors pressable">
            <EvidenceIcon /> Evidence
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 flex-shrink-0 text-[12.5px] text-stone-400" title={it.evidenceName ?? "Evidence attached"}>
            <EvidenceIcon /> Attached
          </span>
        )
      )}
      <span className="text-[14.5px] tabular-nums whitespace-nowrap text-right">
        {it.value ? <span className="font-semibold text-ink">{it.value}</span> : <span className="text-stone-300">—</span>}
        {it.priorValue && <span className="text-ink-muted"> · prev {it.priorValue}</span>}
      </span>
    </div>
  );
}

function EvidenceIcon() {
  return <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9 9a4 4 0 01-6-6l9-9a3 3 0 014 4l-9 9a1.5 1.5 0 01-2-2l8-8" /></svg>;
}

/* ─────────────────────────── DATA ─────────────────────────── */

function DataView(props: CampaignWorkspaceProps) {
  const { campaign, evidenceUrls } = props;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "received" | "pending">("all");

  // Flatten every item across all contacts (carrying who submitted it).
  const all = useMemo(() => {
    const out: { item: Item; owner: string }[] = [];
    for (const c of campaign.contacts) {
      const owner = c.name || c.email;
      for (const it of c.items) out.push({ item: it, owner });
    }
    return out;
  }, [campaign]);

  const q = query.trim().toLowerCase();
  const filtered = all.filter(({ item }) => {
    if (filter === "received" && item.status !== "received") return false;
    if (filter === "pending" && item.status === "received") return false;
    if (q && !(item.label.toLowerCase().includes(q) || item.fieldId.toLowerCase().includes(q))) return false;
    return true;
  });

  // Group by Section → Principle.
  const sections: ("A" | "B" | "C")[] = ["A", "B", "C"];
  const grouped = sections
    .map((sec) => {
      const inSec = filtered.filter(({ item }) => (item.section ?? "C") === sec);
      if (sec === "C") {
        const byPrinciple = PRINCIPLE_ORDER
          .map((p) => ({ principle: p, rows: inSec.filter(({ item }) => item.principle === p) }))
          .filter((g) => g.rows.length > 0);
        const noPrinciple = inSec.filter(({ item }) => !item.principle);
        if (noPrinciple.length) byPrinciple.push({ principle: "", rows: noPrinciple });
        return { sec, groups: byPrinciple };
      }
      return { sec, groups: inSec.length ? [{ principle: "", rows: inSec }] : [] };
    })
    .filter((s) => s.groups.length > 0);

  if (all.length === 0) {
    return <EmptyOwners />;
  }

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M21 21l-4.3-4.3" /></svg>
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code or label…"
            className="h-9 w-full pl-9 pr-3 text-[14.5px] text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-line rounded-lg p-0.5">
          {(["all", "received", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1.5 text-[13.5px] font-medium rounded-md transition-colors capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                filter === f ? "bg-forest text-white" : "text-ink-body hover:text-ink"
              }`}
            >
              {f === "pending" ? "Awaiting" : f}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="text-[14.5px] text-ink-body text-center py-10 bg-white border border-line rounded-xl">No data points match your search.</p>
      ) : (
        grouped.map(({ sec, groups }) => (
          <div key={sec}>
            <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-body mb-2">{SECTION_LABELS[sec]}</p>
            <div className="space-y-2">
              {groups.map((g, gi) => (
                <PrincipleGroup
                  key={`${sec}-${g.principle || gi}`}
                  title={g.principle ? `${g.principle} · ${PRINCIPLE_LABELS[g.principle] ?? ""}` : "General"}
                  rows={g.rows}
                  evidenceUrls={evidenceUrls}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function PrincipleGroup({
  title, rows, evidenceUrls,
}: { title: string; rows: { item: Item; owner: string }[]; evidenceUrls: Record<string, string> }) {
  const [open, setOpen] = useState(true);
  const filled = rows.filter(({ item }) => item.status === "received").length;
  return (
    <div className="bg-white border border-line rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-tint/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <svg className={`w-3.5 h-3.5 text-ink-muted transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="flex-1 text-[14.5px] font-semibold text-ink">{title}</span>
        <div className="hidden sm:block w-24 h-1.5 rounded-full bg-line overflow-hidden">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${rows.length ? (filled / rows.length) * 100 : 0}%` }} />
        </div>
        <span className="text-[12.5px] text-ink-body tabular-nums whitespace-nowrap">{filled}/{rows.length}</span>
      </button>
      {open && (
        <div className="border-t border-line">
          {rows.map(({ item, owner }) => (
            <DataFieldRow key={item.id} item={item} owner={owner} evidenceUrl={evidenceUrls[item.id]} />
          ))}
        </div>
      )}
    </div>
  );
}

// One field row in the Data view — click to expand a full detail panel.
// The collapsed row shows the full (wrapping, never truncated) label; the
// expanded panel restates every coordinate the consultant might want.
function DataFieldRow({ item, owner, evidenceUrl }: { item: Item; owner: string; evidenceUrl?: string }) {
  const [open, setOpen] = useState(false);
  const st = item.status === "received" ? ITEM_STATUS.received : ITEM_STATUS.pending;
  return (
    <div className="border-t border-line first:border-t-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-tint/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: st.dot }} />
        <span className="flex-shrink-0 mt-px text-[11.5px] font-mono font-semibold text-ink-body bg-tint border border-line px-1.5 py-0.5 rounded">{item.fieldId}</span>
        <span className="flex-1 min-w-0 text-[14.5px] text-ink-body">
          {item.label}
          <span className="text-ink-muted"> · {owner}</span>
        </span>
        {item.evidencePath && (
          evidenceUrl ? (
            <a href={evidenceUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} title={item.evidenceName ?? "View evidence"}
              className="inline-flex items-center gap-1 flex-shrink-0 text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-1.5 py-0.5 rounded-md transition-colors pressable">
              <EvidenceIcon /> Evidence
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 flex-shrink-0 text-[12.5px] text-stone-400" title={item.evidenceName ?? "Evidence attached"}>
              <EvidenceIcon /> Attached
            </span>
          )
        )}
        <span className="text-[14.5px] tabular-nums whitespace-nowrap text-right">
          {item.value ? <span className="font-semibold text-ink">{item.value}{item.unit && <span className="text-ink-muted font-normal"> {item.unit}</span>}</span> : <span className="text-stone-300">—</span>}
          {item.priorValue && <span className="text-ink-muted"> · prev {item.priorValue}</span>}
        </span>
        <svg className={`mt-0.5 w-4 h-4 text-ink-muted transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      {open && (
        <div className="anim-up-sm px-4 pb-4 pt-1 bg-tint/40">
          <p className="text-[14.5px] text-ink leading-relaxed font-medium">{item.label}</p>
          <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
            <DetailField label="Field code" value={item.fieldId} mono />
            <DetailField label="Section" value={item.section ? SECTION_LABELS[item.section] : "—"} />
            <DetailField label="Principle" value={item.principle ? `${item.principle}${PRINCIPLE_LABELS[item.principle] ? ` · ${PRINCIPLE_LABELS[item.principle]}` : ""}` : "—"} />
            <DetailField label="Submitted by" value={owner} />
            <DetailField label="Status" value={st.label} />
            <DetailField label="Value" value={item.value ? `${item.value}${item.unit ? ` ${item.unit}` : ""}` : "Not submitted yet"} />
            <DetailField label="Prior-year value" value={item.priorValue ? `${item.priorValue}${item.unit ? ` ${item.unit}` : ""}` : "—"} />
            {item.indicatorType && <DetailField label="Indicator" value={item.indicatorType === "essential" ? "Essential" : "Leadership"} />}
            <div>
              <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Evidence</dt>
              <dd className="mt-1 text-[14px] text-ink">
                {item.evidencePath ? (
                  evidenceUrl ? (
                    <a href={evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 font-medium hover:underline">
                      <EvidenceIcon /> {item.evidenceName ?? "View document"}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-ink-body"><EvidenceIcon /> {item.evidenceName ?? "Attached"}</span>
                  )
                ) : "No document attached"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{label}</dt>
      <dd className={`mt-1 text-[14px] text-ink ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

/* ─────────────────────────── EMISSIONS ─────────────────────────── */

function EmissionsView(props: CampaignWorkspaceProps) {
  const { ghg, inputs, methodology } = props;
  if (!ghg) {
    return (
      <div className="bg-white border border-line rounded-xl px-5 py-10 text-center shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
        <div className="mx-auto w-10 h-10 rounded-full bg-tint border border-brand-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" /></svg>
        </div>
        <p className="text-[15.5px] font-semibold text-ink mt-3">No emissions computed yet</p>
        <p className="text-[14px] text-ink-body mt-1.5 max-w-[46ch] mx-auto leading-relaxed">
          Assign an activity field (grid electricity or fuel) to a data owner. Once they submit the raw activity data,
          Scope 1 &amp; 2 are calculated here from the cited CEA &amp; IPCC factors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-forest text-white rounded-xl p-5">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-white/60 mb-3">Calculated emissions · from collected activity data</p>
        <div className="grid grid-cols-3 gap-4">
          <Metric label="Scope 1 (fuel)" value={ghg.scope1_tco2e} unit="tCO₂e" />
          <Metric label="Scope 2 (electricity)" value={ghg.scope2_tco2e} unit="tCO₂e" />
          <Metric label="Total" value={ghg.total_tco2e} unit="tCO₂e" accent />
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <ScopeBarOnDark scope1={ghg.scope1_tco2e} scope2={ghg.scope2_tco2e} />
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          {inputs.map((inp, i) => (
            <p key={i} className="text-[12.5px] text-white/65 leading-relaxed">
              <span className="text-white/90 font-medium">Scope {inp.scope} · {fmtT(inp.tco2e)} tCO₂e</span>
              {"  ←  "}{inp.rawValue}
              <span className="text-white/40"> · </span>submitted by {inp.submittedBy}
              <span className="text-white/40"> · </span>{inp.factor}
            </p>
          ))}
          <p className="text-[12px] text-white/50 leading-relaxed pt-1.5">{methodology}</p>
        </div>
      </div>
    </div>
  );
}

// A light-text variant of the scope split for the dark emissions card.
function ScopeBarOnDark({ scope1, scope2 }: { scope1: number; scope2: number }) {
  const total = scope1 + scope2;
  const s1 = total > 0 ? (scope1 / total) * 100 : 0;
  const s2 = total > 0 ? (scope2 / total) * 100 : 0;
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
        {s1 > 0 && <div className="h-full bg-white/70" style={{ width: `${s1}%` }} />}
        {s2 > 0 && <div className="h-full bg-brand-400" style={{ width: `${s2}%` }} />}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5">
        <span className="flex items-center gap-1.5 text-[12.5px] text-white/75">
          <span className="w-2.5 h-2.5 rounded-sm bg-white/70 flex-shrink-0" /> Scope 1 <span className="text-white/55 tabular-nums">{fmtT(scope1)} t</span>
        </span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-white/75">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-400 flex-shrink-0" /> Scope 2 <span className="text-white/55 tabular-nums">{fmtT(scope2)} t</span>
        </span>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, accent }: { label: string; value: number; unit: string; accent?: boolean }) {
  return (
    <div>
      <p className={`text-[26px] font-semibold leading-none tabular-nums ${accent ? "text-brand-400" : "text-white"}`}><AnimatedNumber value={value} decimals={1} /></p>
      <p className="text-[12px] text-white/60 mt-1.5">{unit}</p>
      <p className="text-[12.5px] text-white/80 mt-0.5">{label}</p>
    </div>
  );
}

/* ─────────────────────────── DRAFT ─────────────────────────── */

function DraftView(props: CampaignWorkspaceProps) {
  const { campaign } = props;
  const allItems = campaign.contacts.flatMap((c) => c.items);
  const received = allItems.filter((i) => i.status === "received").length;
  return (
    <Card>
      <p className="text-[15.5px] font-semibold text-ink">BRSR draft</p>
      <p className="text-[14px] text-ink-body mt-1.5 max-w-[64ch] leading-relaxed">
        Generate a printable BRSR draft from the {received} collected {received === 1 ? "value" : "values"}, grouped by
        Section and Principle, with the emissions block and a "nothing is invented" basis line. Deterministic — only
        submitted values and figures computed from them via cited factors.
      </p>
      <Link
        href={`/requests/${campaign.id}/draft`}
        className="mt-4 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-white bg-forest hover:bg-forest-light px-4 py-2.5 rounded-lg transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        Generate the BRSR draft from collected data
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </Link>
    </Card>
  );
}

/* ─────────────────────────── shared bits ─────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-line rounded-xl p-5 shadow-[0_1px_2px_rgba(16,33,26,0.05)]">{children}</div>;
}

function Kpi({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-xl px-4 py-3.5 shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function EmptyOwners() {
  return (
    <div className="rounded-xl border border-line bg-tint px-5 py-9 text-center shadow-[0_1px_2px_rgba(16,33,26,0.05)]">
      <div className="mx-auto w-10 h-10 rounded-full bg-white border border-brand-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-brand-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
      </div>
      <p className="text-[15.5px] font-semibold text-ink mt-3">No data owners yet</p>
      <p className="text-[14px] text-ink-body mt-1.5 max-w-[44ch] mx-auto leading-relaxed">
        Add the people who hold each number: the energy manager for electricity and fuel, HR for headcount, EHS for
        water. Each gets their own secure link and is reminded automatically until they respond.
      </p>
      <p className="text-[13.5px] text-ink-body mt-2">Open the <span className="font-semibold text-ink">Owners</span> tab to add one.</p>
    </div>
  );
}
