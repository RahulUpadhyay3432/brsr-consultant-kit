"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import type { ReportOutput, FrameworkMapping } from "@/lib/types";
import { INDUSTRY_LABELS, FILING_LABELS, type IndustryType, type ExistingFiling } from "@/lib/types";
import CompanyAvatar from "./CompanyAvatar";
import { SaakshMark } from "./SaakshMark";
import { BackupWorkButton, ShareLinkButton } from "./SessionBackup";
import DataChecklist from "./DataChecklist";
import MaterialityMatrix from "./MaterialityMatrix";
import FrameworkMapper from "./FrameworkMapper";
import EsgRatingsMapper from "./EsgRatingsMapper";
import RegulatoryReadiness from "./RegulatoryReadiness";
import TemplatesPanel from "./TemplatesPanel";
import AnimatedNumber from "./AnimatedNumber";
import SourcesPanel from "./SourcesPanel";
import { downloadReportPdf } from "@/lib/report-pdf";
import { track } from "@/lib/mixpanel";
import { downloadCsv, exportFilename } from "@/lib/export";
import { buildFrameworkExportRows, buildRatingsExportRows, type RatingMappingRow } from "@/lib/framework-export";
import { downloadTableDocx } from "@/lib/report-docx";
import { PRINCIPLES } from "./checklist/constants";
import { loadJSON, saveJSON, STORAGE_KEYS } from "@/lib/storage";
import { WalkthroughCard } from "./Walkthrough";
import { ICON_COLOR, TabIcon } from "./report/tab-icons";
import ViewHeader from "./report/ViewHeader";
import InfoPopover from "./report/InfoPopover";
import GuidedTour, { REPORT_TOUR_STEPS } from "./report/GuidedTour";
import esgRatingsData from "@/data/esg_ratings_mapping.json";

interface ReportViewProps {
  report: ReportOutput;
  onHome: () => void;   // Brand/logo, go to the marketing home
  onBack: () => void;   // New report, clears the session
  onEdit: () => void;   // Back to form, keeps answers pre-filled
  // Read-only sample mode (the /demo route): the report is fully interactive
  // in-memory, but nothing is persisted and none of the visitor's real session
  // or "My clients" data is read or written.
  demo?: boolean;
}

const TABS = [
  { id: "overview",    label: "Overview" },
  { id: "checklist",   label: "Action Plan" },
  { id: "materiality", label: "Materiality" },
  { id: "alignment",   label: "Alignment" },
  { id: "beyond-brsr", label: "Beyond BRSR" },
] as const;

// "sources" + "templates" are reference panels, not workspace steps, so they live outside TABS.
type TabId = (typeof TABS)[number]["id"] | "sources" | "templates";

const ALL_TAB_IDS: readonly string[] = [...TABS.map((t) => t.id), "templates", "sources"];

// Read + validate the active tab from the URL (?tab=). Falls back to "overview".
function tabFromUrl(): TabId {
  if (typeof window === "undefined") return "overview";
  const t = new URLSearchParams(window.location.search).get("tab") ?? "";
  return ALL_TAB_IDS.includes(t) ? (t as TabId) : "overview";
}

// Per-tab accent colour + duotone nav icons now live in ./report/tab-icons so the
// per-view headers can share them. ICON_COLOR + TabIcon are imported at the top.

export default function ReportView({ report, onHome, onBack, onEdit, demo = false }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [demoGuideOpen, setDemoGuideOpen] = useState(true);
  const [seedQuery, setSeedQuery] = useState("");      // global-search → Action Plan
  const industryLabel = INDUSTRY_LABELS[report.industry as IndustryType] || report.industry;
  const fieldCount = report.checklist.length;

  // URL-addressable tabs: reflect the active tab in ?tab= so browser Back/Forward,
  // deep-links and bookmarks work. Hook-free (window.history + popstate) so no
  // Suspense/force-dynamic requirement is introduced on the /report and /demo pages.
  const navigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    window.history.pushState(null, "", tab === "overview" ? path : `${path}?tab=${tab}`);
  }, []);
  useEffect(() => {
    setActiveTab(tabFromUrl());   // seed from the URL on mount (deep-link support)
    const onPop = () => setActiveTab(tabFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Interactive "Take a tour" walkthrough, always available from the top bar.
  // A subtle nudge dot shows until it's been taken once (real report only; demo
  // persists nothing).
  const [tourOpen, setTourOpen] = useState(false);
  const [tourNudge, setTourNudge] = useState(false);
  useEffect(() => { if (!demo) setTourNudge(!loadJSON<boolean>(STORAGE_KEYS.tourSeen, false)); }, [demo]);
  const closeTour = useCallback(() => {
    setTourOpen(false);
    setTourNudge(false);
    if (!demo) saveJSON(STORAGE_KEYS.tourSeen, true);
  }, [demo]);

  // Materiality → PDF opt-in. Read the shortlist the Materiality tab persists so
  // the consultant can choose to append it to the downloadable brief. Refreshed
  // on tab change + on a live event the Materiality tab fires when it changes.
  const [shortlistedTopics, setShortlistedTopics] = useState<typeof report.materialityTopics>([]);
  const [includeMateriality, setIncludeMateriality] = useState(false);
  useEffect(() => {
    if (demo) return; // the sample never reads the visitor's real shortlist
    const read = () => {
      const saved = loadJSON<{ shortlistedIds?: string[] } | null>(STORAGE_KEYS.materiality, null);
      const ids = new Set(saved?.shortlistedIds ?? []);
      setShortlistedTopics(report.materialityTopics.filter((t) => ids.has(t.id)));
    };
    read();
    window.addEventListener("saaksh:materiality-changed", read);
    return () => window.removeEventListener("saaksh:materiality-changed", read);
  }, [activeTab, report.materialityTopics, demo]);

  const goToPlanWithQuery = useCallback((q: string) => {
    setSeedQuery(q);
    navigate("checklist");
  }, [navigate]);

  return (
    <div className="anim-up-sm flex min-h-screen bg-page">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Sidebar
        report={report}
        industryLabel={industryLabel}
        fieldCount={fieldCount}
        activeTab={activeTab}
        onNavigate={navigate}
        onHome={onHome}
        onBack={onBack}
        onEdit={onEdit}
      />

      {/* ── Main column, top bar + scrollable content ─────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onSearch={goToPlanWithQuery} onTour={() => setTourOpen(true)} tourNudge={tourNudge} />

        <main className="flex-1 px-5 sm:px-8 lg:px-10 py-7">
          <div className="max-w-[1180px] mx-auto">
            {demo && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
                <p className="text-[13.5px] text-ink-body leading-snug">
                  <span className="font-semibold text-brand-800">This is a sample report</span> for a made-up steel company, explore every tab freely. Nothing here is saved.
                </p>
                <button
                  onClick={onEdit}
                  className="pressable inline-flex items-center gap-1.5 rounded-lg bg-forest text-white text-[13px] font-semibold px-3.5 py-2 hover:bg-forest-light transition-colors flex-shrink-0"
                >
                  Start your own free report
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
            {/* Breadcrumb + per-screen actions */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <p className="text-[13.5px] text-ink-body font-medium tracking-tight">
                BRSR Readiness · FY 2025–26
              </p>
              <div className="flex items-center gap-3">
              {shortlistedTopics.length > 0 && (
                <label className="no-print inline-flex items-center gap-1.5 text-[12.5px] text-ink-body cursor-pointer select-none" title="Append your shortlisted material topics to the PDF">
                  <input
                    type="checkbox"
                    checked={includeMateriality}
                    onChange={(e) => setIncludeMateriality(e.target.checked)}
                    className="accent-brand-600 w-3.5 h-3.5"
                  />
                  Include material topics ({shortlistedTopics.length})
                </label>
              )}
              <div className="no-print relative group">
                <button
                  onClick={() => { track("pdf_downloaded", { materiality: includeMateriality }); downloadReportPdf(report, includeMateriality ? { materialityTopics: shortlistedTopics } : undefined).catch((e) => console.error("PDF export failed", e)); }}
                  aria-describedby="pdf-tip"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-medium
                    text-ink-body bg-white border border-line hover:border-brand-300 hover:bg-band
                    px-3 py-1.5 rounded-lg pressable transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" aria-hidden="true" />
                  </svg>
                  Download PDF
                </button>
                {/* Hover tooltip explaining what the PDF is */}
                <div
                  id="pdf-tip"
                  role="tooltip"
                  className="pointer-events-none absolute right-0 top-full mt-2 z-30 w-[290px] rounded-xl bg-[#0F1E33] px-3.5 py-3 shadow-elev-2
                    opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150"
                >
                  <p className="text-[12.5px] font-semibold text-white mb-1">A client-ready data-request brief</p>
                  <p className="text-[12.5px] leading-relaxed text-white/80">
                    Every gap grouped by the team that owns it (HR, EHS, energy manager, company secretary), in plain English, plus what&apos;s already covered. Built on your device. The full 108-field detail is the CSV export.
                  </p>
                </div>
              </div>
              </div>
            </div>

            <div key={activeTab} role="tabpanel" id={`${activeTab}-panel`} className="tab-fade">
              {activeTab === "overview" && (
                <>
                  {demo && demoGuideOpen && (
                    <DemoGuide onNavigate={navigate} onClose={() => setDemoGuideOpen(false)} onTour={() => setTourOpen(true)} />
                  )}
                  <Overview report={report} onGoToPlan={() => navigate("checklist")} onBack={onBack} demo={demo} />
                </>
              )}
              {activeTab === "checklist"   && <DataChecklist items={report.checklist} general={report.generalDisclosures} seedQuery={seedQuery} clientName={report.companyName} demo={demo} />}
              {activeTab === "materiality" && <MaterialityMatrix topics={report.materialityTopics} clientName={report.companyName} demo={demo} />}
              {activeTab === "alignment"   && <AlignmentWorkspace mappings={report.frameworkMappings} clientName={report.companyName} />}
              {activeTab === "beyond-brsr" && <RegulatoryReadiness regulatory={report.regulatory} />}
              {activeTab === "templates"   && <TemplatesPanel clientName={report.companyName} />}
              {activeTab === "sources"     && <SourcesPanel />}
            </div>
          </div>
        </main>
      </div>

      {tourOpen && <GuidedTour steps={REPORT_TOUR_STEPS} onNavigate={(t) => navigate(t as TabId)} onClose={closeTour} />}
    </div>
  );
}

// ─── Sidebar, brand, workspace switcher, grouped nav, footer ─────────────────
function Sidebar({
  report, industryLabel, fieldCount, activeTab, onNavigate, onHome, onBack, onEdit,
}: {
  report: ReportOutput;
  industryLabel: string;
  fieldCount: number;
  activeTab: TabId;
  onNavigate: (id: TabId) => void;
  onHome: () => void;
  onBack: () => void;
  onEdit: () => void;
}) {
  const navItem = (tab: { id: string; label: string }, badge?: React.ReactNode) => {
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        role="tab"
        data-tour={`tab-${tab.id}`}
        aria-selected={active}
        aria-controls={`${tab.id}-panel`}
        onClick={() => onNavigate(tab.id as TabId)}
        className={`group relative flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13.5px] font-medium
          transition-colors pressable
          ${active ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100/70"}`}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-brand-600" />}
        <TabIcon id={tab.id} active={active} className="flex-shrink-0" />
        <span className="flex-1 text-left">{tab.label}</span>
        {badge}
      </button>
    );
  };

  return (
    <aside className="no-print w-[244px] flex-shrink-0 h-screen sticky top-0 hidden lg:flex flex-col
      bg-white/55 backdrop-blur-sm border-r border-black/[0.06]">

      {/* Brand, clicking returns to the marketing home (the URL changes to /) */}
      <button
        onClick={onHome}
        aria-label="Go to home"
        className="group h-14 flex items-center gap-2.5 px-4 border-b border-black/[0.05] w-full text-left
          hover:bg-stone-100/50 transition-colors pressable"
      >
        <SaakshMark size={26} className="flex-shrink-0" />
        <div className="leading-tight">
          <p className="text-[14px] font-semibold text-stone-900 tracking-[-0.01em]">Saaksh</p>
          <p className="text-[12px] text-stone-500">Readiness workspace</p>
        </div>
      </button>

      {/* Workspace / client identity — a switcher into the "My clients" list */}
      <div className="px-3 pt-3">
        <Link
          href="/clients"
          title="Switch client"
          className="group flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg bg-white border border-stone-200/80 shadow-sm hover:border-brand-300 transition-colors"
        >
          <CompanyAvatar name={report.companyName || "Your Client"} size={28} />
          <div className="leading-tight min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-ink truncate">{report.companyName || "Your Client"}</p>
            <p className="text-[12px] text-ink-muted truncate">{industryLabel}</p>
          </div>
          <svg className="w-3.5 h-3.5 text-stone-300 group-hover:text-brand-600 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </Link>
      </div>

      {/* Nav groups */}
      <nav role="tablist" aria-label="Workspace" className="flex-1 overflow-y-auto px-3 pt-4 space-y-5">
        <div>
          <p className="px-2.5 mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-stone-500">Workspace</p>
          <div className="space-y-0.5">
            {TABS.map(tab =>
              navItem(tab, tab.id === "checklist"
                ? <span className={`text-[11px] tabular-nums font-semibold ${activeTab === "checklist" ? "text-brand-700" : "text-stone-400"}`}>{fieldCount}</span>
                : undefined)
            )}
          </div>
        </div>

        <div>
          <p className="px-2.5 mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-stone-500">Reference</p>
          <div className="space-y-0.5">
            {navItem({ id: "templates", label: "Templates" })}
            {navItem({ id: "sources", label: "Sources" })}
          </div>
        </div>

        <div>
          <p className="px-2.5 mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-stone-500">Collect data</p>
          <div className="space-y-0.5">
            <Link
              href="/requests"
              className="group flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13.5px] font-medium
                text-stone-600 hover:bg-stone-100/70 transition-colors pressable"
            >
              <TabIcon id="collect" className="flex-shrink-0 text-stone-400 group-hover:text-stone-500" />
              <span className="flex-1 text-left">Collect</span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] font-semibold text-[#0B5FB0] bg-[#EAF4FE] rounded px-1.5 py-0.5 leading-none flex-shrink-0">Pro</span>
              <svg className="w-3 h-3 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div>
          <p className="px-2.5 mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-stone-500">Community</p>
          <div className="space-y-0.5">
            <Link
              href="/community"
              className="group flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13.5px] font-medium
                text-stone-600 hover:bg-stone-100/70 transition-colors pressable"
            >
              <TabIcon id="community" className="flex-shrink-0" />
              <span className="flex-1 text-left">Join the community</span>
              <svg className="w-3 h-3 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-black/[0.05] space-y-1">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium
            text-stone-600 hover:bg-stone-100/70 transition-colors pressable"
        >
          <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to form
        </button>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium
            text-stone-600 hover:bg-stone-100/70 transition-colors pressable"
        >
          <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New client
        </button>
        <ShareLinkButton />
        <BackupWorkButton />

        {/* Persistent on-device notice, work is saved in this browser only. */}
        <div className="mt-1.5 pt-2.5 px-2.5 border-t border-black/[0.05]">
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-stone-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            Saved on this device
          </p>
          <p className="text-[12px] text-stone-600 leading-relaxed mt-1">
            Your work stays in this browser, so a refresh or restart is safe. Clearing your browser data or switching browsers starts fresh, so back it up (or export the PDF/CSV) to keep a copy.
          </p>
        </div>
      </div>
    </aside>
  );
}

// ─── Top bar, global search + utility actions ───────────────────────────────
function TopBar({ onSearch, onTour, tourNudge = false }: { onSearch: (q: string) => void; onTour: () => void; tourNudge?: boolean }) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search from anywhere (unless already typing in a field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="no-print sticky top-0 z-40 h-14 flex items-center gap-3 px-5 sm:px-8
      bg-page/85 backdrop-blur-md border-b border-line">

      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (draft.trim()) onSearch(draft.trim()); }}
        className="flex-1 max-w-[560px]"
      >
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search fields, frameworks, topics…"
            aria-label="Search the workspace"
            className="w-full h-9 pl-9 pr-9 rounded-lg bg-white border border-stone-200
              text-[14.5px] text-stone-700 placeholder:text-stone-400
              focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors shadow-sm"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-stone-400
            bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5 leading-none">/</kbd>
        </div>
      </form>

      <div className="flex-1" />

      {/* Utility actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onTour}
          className="pressable relative inline-flex items-center gap-1.5 rounded-lg border border-line bg-white
            px-3 py-1.5 text-[13px] font-medium text-ink-body hover:border-brand-300 hover:bg-band transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4" />
          </svg>
          Take a tour
          {tourNudge && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-page" />}
        </button>
      </div>
    </header>
  );
}

// ─── Demo-only guided panel: teaches a cold visitor how to explore the sample ─
// Shown on the Overview of the /demo route. Self-paced; each row jumps to a tab.

const DEMO_STEPS: { id: TabId; label: string; blurb: string }[] = [
  { id: "overview",    label: "Overview",    blurb: "Your client's readiness at a glance: how many of the 108 fields are ready to pull, need checking, or must be collected fresh." },
  { id: "checklist",   label: "Action Plan", blurb: "Every BRSR field, grouped by principle. Expand any row for the gap, the exact SEBI wording, and how to collect it. Built-in emissions calculators live here too." },
  { id: "materiality", label: "Materiality", blurb: "A suggested shortlist of the ESG topics that matter most for this sector, each mapped to the BRSR principles." },
  { id: "alignment",   label: "Alignment",   blurb: "How each BRSR disclosure maps to GRI, TCFD, IFRS S1/S2 and TNFD, ready to export as a crosswalk." },
  { id: "beyond-brsr", label: "Beyond BRSR", blurb: "A quick CBAM and CCTS in-scope readiness check, based on this client's sector and export markets." },
];

function DemoGuide({ onNavigate, onClose, onTour }: { onNavigate: (t: TabId) => void; onClose: () => void; onTour: () => void }) {
  return (
    <div className="anim-up-sm mb-6 rounded-2xl border border-brand-200 bg-white shadow-elev-1 overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4 bg-brand-50 border-b border-brand-100">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink leading-snug">How to explore this sample report</p>
          <p className="text-[13px] text-ink-muted mt-0.5 leading-snug">Five views of the same client. Jump in below, or take a quick guided tour, nothing you do here is saved.</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onTour}
            className="pressable inline-flex items-center gap-1.5 rounded-lg bg-forest text-white text-[12.5px] font-semibold px-3 py-1.5 hover:bg-forest-light transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4" /></svg>
            Take a tour
          </button>
          <button
            onClick={onClose}
            aria-label="Hide guide"
            className="pressable w-7 h-7 rounded-lg flex items-center justify-center text-ink-faint hover:text-ink hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <ol className="divide-y divide-line-soft">
        {DEMO_STEPS.map((s, i) => (
          <li key={s.id} className="flex items-start gap-3.5 px-5 py-3.5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-600 text-white text-[12px] font-semibold flex items-center justify-center tabular-nums mt-0.5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink leading-snug">{s.label}</p>
              <p className="text-[13px] text-ink-muted leading-relaxed mt-0.5">{s.blurb}</p>
            </div>
            {s.id === "overview" ? (
              <span className="flex-shrink-0 mt-0.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-full px-2.5 py-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> You&apos;re here
              </span>
            ) : (
              <button
                onClick={() => onNavigate(s.id)}
                className="pressable flex-shrink-0 mt-0.5 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:text-brand-800 border border-line hover:border-brand-300 rounded-lg px-3 py-1.5 bg-white hover:bg-band transition-colors whitespace-nowrap"
              >
                Go
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Overview, the report's dashboard, mapped to our data (no dummy data) ────

// Per-principle status breakdown, derived from the live checklist.
function principleBreakdown(report: ReportOutput) {
  const order = Object.keys(PRINCIPLES); // P1…P9
  const map = new Map<string, { ready: number; verify: number; collect: number; na: number; total: number }>();
  for (const item of report.checklist) {
    const row = map.get(item.principle) ?? { ready: 0, verify: 0, collect: 0, na: 0, total: 0 };
    if (item.status === "already_tracked") row.ready++;
    else if (item.status === "partially_tracked") row.verify++;
    else if (item.status === "new_data_needed") row.collect++;
    else row.na++;
    row.total++;
    map.set(item.principle, row);
  }
  return order
    .filter(p => map.has(p))
    .map(p => ({ id: p, name: PRINCIPLES[p].name, ...map.get(p)! }));
}

function Overview({
  report, onGoToPlan, onBack, demo = false,
}: {
  report: ReportOutput;
  onGoToPlan: () => void;
  onBack: () => void;
  demo?: boolean;
}) {
  const { alreadyTracked, partiallyTracked, newDataNeeded, notApplicable, totalDataPoints } = report.summary;
  const applicableFields = totalDataPoints - notApplicable;
  const sourced = alreadyTracked + partiallyTracked;       // fields with an existing source
  const noFilings = sourced === 0;
  const filings = report.selectedFilings.filter(f => f !== "none");

  // Weighted readiness: full credit for "Ready", half credit for "Verify".
  const readyPct = applicableFields > 0
    ? Math.round(((alreadyTracked + partiallyTracked * 0.5) / applicableFields) * 100)
    : 0;

  // Donut geometry.
  const R = 52, C = 2 * Math.PI * R;

  // Ring fills on mount: start empty, then animate to the target so the CSS
  // transition actually fires (a freshly-rendered element at the final offset
  // wouldn't transition). Reduced motion → jump straight to the value.
  const [ringPct, setRingPct] = useState(0);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setRingPct(readyPct); return; }
    const id = requestAnimationFrame(() => setRingPct(readyPct));
    return () => cancelAnimationFrame(id);
  }, [readyPct]);

  const breakdown = principleBreakdown(report);
  const biggestGap = [...breakdown].sort((a, b) => b.collect - a.collect)[0];

  const stats = [
    { n: alreadyTracked,   label: "Pull from filing", sub: "already in compliance docs", dot: "bg-emerald-500", num: alreadyTracked > 0 ? "text-emerald-600" : "text-stone-300" },
    { n: partiallyTracked, label: "Verify & complete", sub: "partial data exists",        dot: "bg-amber-400",   num: partiallyTracked > 0 ? "text-amber-600"  : "text-stone-300" },
    { n: newDataNeeded,    label: "Collect fresh",     sub: "no existing source",         dot: "bg-orange-500",  num: newDataNeeded > 0 ? "text-orange-600" : "text-stone-300" },
  ];

  // Sections A & B aren't gap-analysed, but they're still collected work. Read
  // the consultant's progress (collected + last-year detections) from the
  // persisted checklist state so the Overview reflects it. Re-reads on each
  // mount, and Overview remounts on every tab switch, so it stays current.
  const abTotal = report.generalDisclosures.sectionA.length + report.generalDisclosures.sectionB.length;
  const [abProgress, setAbProgress] = useState({ collected: 0, detected: 0 });
  useEffect(() => {
    if (demo) return; // the sample doesn't read the visitor's real progress
    const saved = loadJSON<{ collectedIds?: string[]; detection?: { detectedIds?: string[] } | null } | null>(
      STORAGE_KEYS.checklist, null
    );
    const abIds = new Set(
      [...report.generalDisclosures.sectionA, ...report.generalDisclosures.sectionB].map(d => d.id)
    );
    const collected = (saved?.collectedIds ?? []).filter(id => abIds.has(id)).length;
    const detected  = (saved?.detection?.detectedIds ?? []).filter(id => abIds.has(id)).length;
    setAbProgress({ collected, detected });
  }, [report]);

  // First-run "Start here" card, shown until dismissed; persists across reports.
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (demo) return; // no first-run card (and no persisted flag) in the sample
    setShowIntro(!loadJSON<boolean>(STORAGE_KEYS.walkthroughSeen, false));
  }, [demo]);
  const dismissIntro = () => {
    saveJSON(STORAGE_KEYS.walkthroughSeen, true);
    setShowIntro(false);
  };

  return (
    <div className="space-y-4">

      {/* Title + filing source */}
      <ViewHeader
        tabId="overview"
        title="Overview"
        subtitle={
          <>
            A live readiness picture for{" "}
            <strong className="font-semibold text-ink-body">{report.companyName || "this company"}</strong>{" "}
            across the {applicableFields} principle-wise BRSR fields (Section C): what&apos;s covered, what to verify, and what to collect
            {notApplicable > 0 && <> ({notApplicable} manufacturing-only marked Not applicable)</>}.
          </>
        }
        info={
          <InfoPopover title="What the readiness score means">
            <p>The gauge is a weighted score: a field counts fully when it&apos;s <strong className="text-white">Ready to pull</strong> from an existing filing, and half when it&apos;s partially covered (<strong className="text-white">Verify</strong>). Fields with no existing source (<strong className="text-white">Collect fresh</strong>) don&apos;t count yet, so the score rises as you gather data.</p>
          </InfoPopover>
        }
        actions={
          !noFilings ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[12px] text-ink-muted">Based on:</span>
              {filings.map((f) => (
                <span key={f} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white text-ink-body border border-line">
                  {FILING_LABELS[f as ExistingFiling]}
                </span>
              ))}
            </div>
          ) : undefined
        }
      />

      {showIntro && <WalkthroughCard onDismiss={dismissIntro} />}

      {/* Hero readiness card, donut + segmented bar + legend */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 lg:p-6 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
        <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8">

          {/* Donut */}
          <div className="relative flex-shrink-0" style={{ width: 132, height: 132 }}>
            <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
              <circle cx="66" cy="66" r={R} fill="none" className="stroke-stone-100" strokeWidth="11" />
              <circle
                cx="66" cy="66" r={R} fill="none"
                className="stroke-brand-600" strokeWidth="11" strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - ringPct / 100)}
                style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.2,0,0,1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[30px] font-semibold tabular-nums text-stone-900 leading-none">
                <AnimatedNumber value={readyPct} durationMs={700} /><span className="text-[16px] text-stone-400 align-top">%</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400 mt-1">Ready</span>
            </div>
          </div>

          {/* Bar + legend */}
          <div className="flex-1 min-w-0 w-full">
            <p className="text-[13.5px] text-stone-600 leading-relaxed mb-3">
              <strong className="font-semibold text-stone-900"><AnimatedNumber value={sourced} /></strong> of{" "}
              <strong className="font-semibold text-stone-900"><AnimatedNumber value={applicableFields} /></strong> fields have an existing source ·{" "}
              <strong className="font-semibold text-stone-900"><AnimatedNumber value={newDataNeeded} /></strong> need fresh collection
            </p>

            <div className="flex items-stretch gap-1 h-3 mb-3">
              {alreadyTracked > 0 &&
                <div className="bg-emerald-500 rounded-full min-w-[10px]" style={{ flexGrow: alreadyTracked }} title={`Pull from filing: ${alreadyTracked}`} />}
              {partiallyTracked > 0 &&
                <div className="bg-amber-400 rounded-full min-w-[10px]" style={{ flexGrow: partiallyTracked }} title={`Verify & complete: ${partiallyTracked}`} />}
              {newDataNeeded > 0 &&
                <div className="bg-orange-500 rounded-full min-w-[10px]" style={{ flexGrow: newDataNeeded }} title={`Collect fresh: ${newDataNeeded}`} />}
              {notApplicable > 0 &&
                <div className="bg-slate-200 rounded-full min-w-[10px]" style={{ flexGrow: notApplicable }} title={`Not applicable: ${notApplicable}`} />}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px]">
              <Legend dot="bg-emerald-500" label="Ready"   n={alreadyTracked} />
              <Legend dot="bg-amber-400"   label="Verify"  n={partiallyTracked} />
              <Legend dot="bg-orange-500"  label="Collect" n={newDataNeeded} />
              {notApplicable > 0 && <Legend dot="bg-slate-200" label="N/A" n={notApplicable} />}
            </div>
          </div>
        </div>

        {/* Action stat cards, inside the hero so the numbers read as one unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-stone-100">
          {stats.map((s, i) => (
            <div key={i} className="stagger-item rounded-lg" style={{ animationDelay: `${i * 60}ms` }}>
              <p className={`text-[2rem] font-semibold leading-none tabular-nums ${s.num}`}><AnimatedNumber value={s.n} /></p>
              <p className="flex items-center gap-1.5 text-[14.5px] font-semibold text-stone-700 mt-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                {s.label}
              </p>
              <p className="text-[12.5px] text-stone-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* General disclosures (Sections A & B), collection progress, not gap-analysed */}
      <button
        onClick={onGoToPlan}
        className="group w-full text-left bg-white rounded-xl border border-stone-200 p-4 sm:p-5
          shadow-[0_1px_3px_rgba(80,60,30,0.04)] hover:border-stone-300 transition-colors pressable
          flex items-center gap-4 flex-wrap sm:flex-nowrap"
      >
        <span className="flex-shrink-0 text-[11px] font-bold font-mono px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">A·B</span>
        <div className="min-w-0 flex-1">
          <p className="text-[15.5px] font-bold text-ink">General disclosures · Sections A &amp; B</p>
          <p className="text-[13.5px] text-ink-body mt-0.5 leading-relaxed">
            The {abTotal} entity facts &amp; policies every BRSR opens with, collected from the client&apos;s own
            records, separate from the Section-C gap analysis above.
          </p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-[20px] font-semibold tabular-nums text-stone-900 leading-none">
              {abProgress.collected}<span className="text-stone-300">/{abTotal}</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400 mt-1">Collected</p>
          </div>
          {abProgress.detected > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-indigo-700
              bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {abProgress.detected} from last year
            </span>
          )}
          <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Readiness by principle + Where to start */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Per-principle breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-[17px] font-bold text-ink">Readiness by principle</h3>
            <span className="text-[12.5px] text-stone-500">{breakdown.length} NGRBC principles</span>
          </div>
          <ul className="space-y-1">
            {breakdown.map(p => (
              <li key={p.id}>
                <button
                  onClick={onGoToPlan}
                  className="group w-full flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg text-left
                    hover:bg-stone-50 transition-colors pressable"
                >
                  <span className="flex-shrink-0 w-8 text-[11px] font-bold text-stone-500 tabular-nums">{p.id}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-medium text-stone-800 truncate">{p.name}</span>
                    <span className="block text-[12.5px] text-stone-600">{p.total} fields</span>
                  </span>
                  {/* mini stacked bar */}
                  <span className="hidden sm:flex items-stretch gap-0.5 h-2 w-28 flex-shrink-0">
                    {p.ready   > 0 && <span className="bg-emerald-500 rounded-full min-w-[3px]" style={{ flexGrow: p.ready }} />}
                    {p.verify  > 0 && <span className="bg-amber-400 rounded-full min-w-[3px]"   style={{ flexGrow: p.verify }} />}
                    {p.collect > 0 && <span className="bg-orange-500 rounded-full min-w-[3px]"   style={{ flexGrow: p.collect }} />}
                    {p.na      > 0 && <span className="bg-slate-200 rounded-full min-w-[3px]"    style={{ flexGrow: p.na }} />}
                  </span>
                  <span className="flex items-center gap-2.5 flex-shrink-0 w-[88px] justify-end text-[12px] tabular-nums">
                    <span className={p.ready   > 0 ? "text-emerald-600 font-semibold" : "text-stone-300"}>{p.ready}</span>
                    <span className={p.verify  > 0 ? "text-amber-600 font-semibold"   : "text-stone-300"}>{p.verify}</span>
                    <span className={p.collect > 0 ? "text-orange-600 font-semibold"   : "text-stone-300"}>{p.collect}</span>
                  </span>
                  <svg className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Where to start */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
          <h3 className="text-[17px] font-bold text-ink mb-4">Where to start</h3>

          {noFilings ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-[13px] text-amber-800 leading-relaxed">
                No compliance filings selected, all {newDataNeeded} fields show as &quot;Collect fresh.&quot; Most companies
                already cover 15–25 of these in PCB consents, EPR registrations, or PAT certificates.
              </p>
              <button onClick={onBack}
                className="no-print mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-900 underline underline-offset-2 pressable">
                <svg aria-hidden="true" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Add their filings
              </button>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {alreadyTracked > 0 && (
                <StartStep dot="bg-emerald-500" onClick={onGoToPlan}>
                  <strong className="font-semibold text-stone-800">Pull {alreadyTracked} ready field{alreadyTracked > 1 ? "s" : ""}</strong>{" "}
                  straight from existing filings, cite the source and move on.
                </StartStep>
              )}
              {biggestGap && biggestGap.collect > 0 && (
                <StartStep dot="bg-stone-400" onClick={onGoToPlan}>
                  <strong className="font-semibold text-stone-800">Close the {biggestGap.id} gap</strong>{" "}, {biggestGap.collect} fields to collect in {biggestGap.name}, the largest gap.
                </StartStep>
              )}
              {partiallyTracked > 0 && (
                <StartStep dot="bg-amber-400" onClick={onGoToPlan}>
                  <strong className="font-semibold text-stone-800">Verify {partiallyTracked} partial field{partiallyTracked > 1 ? "s" : ""}</strong>{" "}
                  where a filing covers most of the disclosure but one piece is missing.
                </StartStep>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Legend chip, dot + label + count.
function Legend({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-stone-500">{label}</span>
      <span className="font-semibold text-stone-800 tabular-nums">{n}</span>
    </span>
  );
}

// A single "Where to start" step, clickable, routes to the Action Plan.
function StartStep({ dot, onClick, children }: { dot: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button onClick={onClick} className="group w-full flex items-start gap-3 text-left pressable">
        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-[14.5px] text-stone-600 leading-relaxed group-hover:text-stone-800 transition-colors">
          {children}
        </span>
      </button>
    </li>
  );
}

// ─── Alignment workspace, Reporting frameworks + ESG ratings, in one tab ─────
// Replaces the two stacked accordions (PRODUCT.md §4): one consistent nav model,
// ratings is a peer of frameworks instead of buried below a long table.
function AlignmentWorkspace({ mappings, clientName }: { mappings: FrameworkMapping[]; clientName?: string }) {
  const [sub, setSub] = useState<"frameworks" | "ratings">("frameworks");

  // Export whichever crosswalk is in view, one obvious action. On-device CSV
  // (reuses the report's RFC-4180/formula-safe export.ts), so nothing leaves the browser.
  function activeRows(): { rows: string[][]; file: string; title: string } {
    if (sub === "frameworks") {
      return {
        rows: buildFrameworkExportRows(mappings),
        file: "brsr-framework-mapping",
        title: "BRSR cross-framework mapping",
      };
    }
    const ratings = (esgRatingsData as { mappings: RatingMappingRow[] }).mappings ?? [];
    return {
      rows: buildRatingsExportRows(ratings),
      file: "brsr-ratings-alignment",
      title: "BRSR ESG-ratings alignment (MSCI & DJSI)",
    };
  }

  function exportActive() {
    const { rows, file } = activeRows();
    downloadCsv(exportFilename(file, clientName), rows);
  }

  function exportActiveDocx() {
    const { rows, file, title } = activeRows();
    void downloadTableDocx({
      filename: exportFilename(file, clientName).replace(/\.csv$/, ""),
      title,
      subtitle: clientName ? `Prepared for ${clientName}. Collect once, report across frameworks.` : "Collect once, report across frameworks.",
      rows,
      footnote: "An editable starting point, review and adapt to the client before use.",
    });
  }

  const total    = mappings.length;
  const withGRI  = mappings.filter(m => m.gri_standard   && m.gri_standard   !== ", ").length;
  const withTCFD = mappings.filter(m => m.tcfd_pillar    && m.tcfd_pillar    !== ", ").length;
  const withIFRS = mappings.filter(m => m.ifrs_reference && m.ifrs_reference !== ", ").length;
  const withTNFD = mappings.filter(m => m.tnfd_pillar    && m.tnfd_pillar    !== ", ").length;
  const ratingsCount = (esgRatingsData as { mappings?: unknown[] }).mappings?.length ?? 9;

  const subTabs = [
    { key: "frameworks" as const, label: "Reporting frameworks", count: total },
    { key: "ratings"    as const, label: "ESG ratings",          count: ratingsCount },
  ];

  const statCards = [
    { n: total,    label: "Total mappings", tone: "text-stone-800"   },
    { n: withGRI,  label: "GRI Standards",  tone: "text-blue-600"    },
    { n: withTCFD, label: "TCFD aligned",   tone: "text-violet-600"  },
    { n: withIFRS, label: "IFRS S1/S2",     tone: "text-emerald-600" },
    { n: withTNFD, label: "TNFD (nature)",  tone: "text-teal-600"    },
  ];

  return (
    <div className="space-y-4">

      <ViewHeader
        tabId="alignment"
        title="Alignment"
        subtitle="How each BRSR disclosure maps to GRI, TCFD, IFRS S1/S2 and TNFD (nature), and to the MSCI & DJSI rating frameworks. Collect once, report across all."
        info={
          <InfoPopover title="Collect once, report across frameworks">
            <p>BRSR overlaps heavily with the global frameworks. This crosswalk maps every disclosure to its counterpart in GRI, TCFD, IFRS S1/S2 and TNFD, and to the MSCI and S&amp;P/DJSI rating criteria, so one round of BRSR data can feed the client&apos;s other reports and rating submissions.</p>
            <p><strong className="text-white">How to use it:</strong> switch between Reporting frameworks and ESG ratings, expand any row for the exact reference (e.g. GRI 305, IFRS S2), and export the crosswalk to CSV or Word.</p>
            <p className="text-white/55">Indicative, not a certified equivalence, confirm the exact clause against each framework&apos;s current version before a filing.</p>
          </InfoPopover>
        }
        actions={
          <>
            <button
              onClick={exportActive}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brand-700 bg-brand-50
                border border-brand-100 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors pressable whitespace-nowrap"
              title={sub === "frameworks" ? "Download the full BRSR↔GRI↔TCFD↔IFRS↔TNFD mapping as a spreadsheet" : "Download the MSCI & DJSI ratings alignment as a spreadsheet"}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              CSV
            </button>
            <button
              onClick={exportActiveDocx}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink-body bg-white
                border border-line hover:border-brand-300 hover:bg-band px-2.5 py-1.5 rounded-lg transition-colors pressable whitespace-nowrap"
              title={sub === "frameworks" ? "Download the framework mapping as an editable Word document" : "Download the ratings alignment as an editable Word document"}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12h6M9 16h6M9 8h2M5 3h9l5 5v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
              Word
            </button>
          </>
        }
      />

      {/* Sub-tabs */}
      <div className="inline-flex items-center gap-0.5 p-0.5 bg-stone-100/80 rounded-lg border border-stone-200/60">
        {subTabs.map(t => {
          const active = sub === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSub(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium
                whitespace-nowrap transition-colors pressable
                ${active ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
            >
              {t.label}
              <span className={`tabular-nums text-[11px] ${active ? "text-stone-400" : "text-stone-400"}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {sub === "frameworks" ? (
        <>
          {/* Headline stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((s, i) => (
              <div key={i} className="stagger-item bg-white rounded-xl border border-stone-200 p-4 shadow-[0_1px_3px_rgba(80,60,30,0.04)]" style={{ animationDelay: `${i * 45}ms` }}>
                <p className={`text-[2rem] font-semibold leading-none tabular-nums ${s.tone}`}><AnimatedNumber value={s.n} /></p>
                <p className="text-[13.5px] font-medium text-ink-muted mt-2">{s.label}</p>
              </div>
            ))}
          </div>
          <FrameworkMapper mappings={mappings} />
        </>
      ) : (
        <EsgRatingsMapper />
      )}
    </div>
  );
}
