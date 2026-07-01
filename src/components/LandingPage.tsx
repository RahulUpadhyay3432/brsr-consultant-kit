"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import CookieSettingsLink from "@/components/CookieSettingsLink";
import { SaakshMark } from "@/components/SaakshMark";
import { REQUEST_ACCESS_URL } from "@/lib/links";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { computeTimeline, defaultDeadline, timelineCsvRows } from "@/lib/engagement-timeline";
import { downloadCsv } from "@/lib/export";
import { topLatest } from "@/lib/latest";
import { track } from "@/lib/mixpanel";

interface LandingPageProps {
  onStart: () => void;
  resume?: { companyName: string; onResume: () => void } | null;
}

const BODY = "text-ink-body";

/* ── Icons (Phosphor-style: stroke, 1.75px, rounded) ──────────────────────── */

function IcoClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="8" y="2" width="8" height="4" rx="1.5" />
      <path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" />
      <path d="M9.5 12.5l2 2 3-3" />
    </svg>
  );
}

function IcoBarChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 20V4M12 20V10M6 20v-4" />
    </svg>
  );
}

function IcoNetwork() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M12 7v4M12 11l-5.5 6M12 11l5.5 6" />
    </svg>
  );
}

function IcoFileText() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function IcoGlobe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
    </svg>
  );
}

function IcoCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IcoDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IcoArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function IcoChevronDown({ cls = "w-3.5 h-3.5" }: { cls?: string }) {
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IcoExternal() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 3h6.5v6.5M12 3L4 11" />
    </svg>
  );
}

/* ── Reused small pieces ───────────────────────────────────────────────────── */

function Dot() { return <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />; }

function Spark() {
  return (
    <span className="w-5 h-5 flex-shrink-0 rounded-md bg-forest flex items-center justify-center mt-0.5">
      <svg className="w-3 h-3 text-brand-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.6 4.8L18 8.4l-4.4 1.6L12 15l-1.6-5L6 8.4l4.4-1.6L12 2z" />
      </svg>
    </span>
  );
}

function Check({ className = "text-brand-600" }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ── Trust cards ───────────────────────────────────────────────────────────── */
const TRUST_CARDS = [
  {
    t: "Cited & versioned",
    b: "Every disclosure and emission factor traces to SEBI, ICAI, CEA or IPCC, so what you put in front of a client is defensible.",
    card: "bg-forest text-white", chip: "bg-white/10", icon: "text-brand-400", title: "text-white", body: "text-[#BFD3CA]",
    glyph: (<><path d="M12 3l7 3v5c0 4.5-3 7-7 8.5C8 17 5 14.5 5 11V6l7-3z" /><path d="M9 11.5l2 2 4-4" /></>),
  },
  {
    t: "100% on-device",
    b: "The free readiness tool runs entirely in your browser. No upload, no account, nothing stored.",
    card: "bg-brand-50 border border-brand-100", chip: "bg-white border border-brand-100", icon: "text-brand-700", title: "text-ink", body: BODY,
    glyph: (<><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M3 8.5h18M8 21h8M12 17v4" /></>),
  },
  {
    t: "Free to start",
    b: "The readiness tool is free and needs no login. Pro layers on when you move to collecting and reporting at scale.",
    card: "bg-ember-bg border border-[#F8CFC5]", chip: "bg-white border border-[#F8CFC5]", icon: "text-[#C2432A]", title: "text-ink", body: BODY,
    glyph: (<path d="M13 2L4.5 12.5h6L11 22l8.5-10.5h-6L13 2z" />),
  },
];

/* ── Tier cards (Free vs Pro) ──────────────────────────────────────────────── */
function TierCards({ onStart }: { onStart: () => void }) {
  const FREE_FEATURES = [
    "Gap-analysed action plan across all 108 BRSR fields",
    "GHG, energy, water & Scope 3 calculators, cited to CEA, IPCC & DEFRA",
    "GRI, TCFD, IFRS S1/S2, TNFD, MSCI & DJSI mapping, exportable as CSV",
    "CBAM & CCTS in-scope readiness check",
    "Templates, internal request emails & a who-owns-what map",
    "Engagement timeline generator (12 or 20-week plan)",
    "AI field guidance on every disclosure",
    "CSV export + client-ready PDF brief",
  ];
  const PRO_FEATURES = [
    "Chase data from every team with branded emails and auto-reminders",
    "No-login owner submission with evidence attached per field",
    "AI document auto-fill: reads your client’s reports across all 108 fields",
    "Emissions auto-computed and attributed to the person who submitted",
    "Assurance-readiness ledger: a data-ownership trail for BRSR Core",
    "Grounded AI narrative draft, ready to review and edit",
    "Proposal & fee builder: scope, price, and send",
    "Multi-client workspace with readiness, data, draft and assurance tabs",
  ];

  return (
    <div className="mt-10 grid md:grid-cols-2 gap-5">
      {/* Free card */}
      <div className="rounded-2xl border border-line bg-white p-7 sm:p-8 flex flex-col shadow-elev-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <span className="font-display font-bold text-[28px] text-ink tracking-tight">Free</span>
          <span className="font-mono text-[11px] font-semibold tracking-wide text-[#10A572] bg-[#E3F7F0] border border-[#BFE6D8] px-2.5 py-1 rounded-full shrink-0">₹0 forever</span>
        </div>
        <p className="text-[14.5px] text-ink-body leading-snug">Prepare &amp; understand, entirely on your device.</p>
        <p className="text-[12px] font-mono text-ink-faint mt-1 mb-6">No login required &middot; Nothing stored</p>
        <ul className="space-y-3 flex-1">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink-body leading-snug">
              <svg className="w-4 h-4 text-brand-500 shrink-0 mt-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={onStart}
          className="pressable mt-7 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white text-ink text-[15px] font-semibold py-3.5 hover:bg-ink hover:text-white transition-colors"
        >
          Start free <IcoArrow />
        </button>
      </div>

      {/* Pro card */}
      <div className="rounded-2xl bg-forest text-white p-7 sm:p-8 flex flex-col shadow-elev-2 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(30,157,242,0.13) 0%, transparent 60%)" }} />
        <div className="relative flex items-start justify-between gap-3 mb-1">
          <span className="font-display font-bold text-[28px] text-white tracking-tight">Pro</span>
          <span className="font-mono text-[11px] font-semibold tracking-wide text-forest bg-brand-400 px-2.5 py-1 rounded-full shrink-0">Paid</span>
        </div>
        <p className="relative text-[14.5px] text-ondark-muted leading-snug">Collect, compute &amp; close the engagement.</p>
        <p className="relative text-[12px] font-mono text-ondark-faint mt-1 mb-5">Manual onboarding &middot; Priced per engagement</p>
        <p className="relative text-[11.5px] font-mono text-ondark-faint uppercase tracking-wide mb-3">Everything in Free, plus:</p>
        <ul className="relative space-y-3 flex-1">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-white/85 leading-snug">
              <svg className="w-4 h-4 text-brand-400 shrink-0 mt-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              {f}
            </li>
          ))}
        </ul>
        <a
          href={REQUEST_ACCESS_URL}
          className="pressable relative mt-7 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white text-[15px] font-semibold py-3.5 hover:bg-brand-400 transition-colors"
        >
          Request access <IcoArrow />
        </a>
        <p className="relative text-[12px] text-ondark-faint mt-3 text-center">Early access, manually onboarded. Talk to us first.</p>
      </div>
    </div>
  );
}

/* ── ProPillar card ────────────────────────────────────────────────────────── */
function ProPillar({ name, status, desc, flagship, ai, tint }: { name: string; status: "live" | "coming" | "future"; desc: string; flagship?: boolean; ai?: boolean; tint?: boolean }) {
  const filled = !!flagship;
  const surface = filled
    ? "bg-forest text-white shadow-elev-2"
    : tint
      ? "bg-brand-50 border border-brand-100 shadow-elev-1"
      : "bg-white border border-[#DDE3EC] shadow-elev-1";
  const tag = status === "live" ? "Available now" : status === "coming" ? "Coming" : "Future";
  const tagCls = status === "live"
    ? "text-forest bg-brand-400"
    : status === "coming"
      ? "text-[#8A6516] bg-[#F6ECD8] border border-[#EAD9B0]"
      : "text-ink-faint bg-white border border-line";
  return (
    <div className={`rounded-2xl p-6 ${surface}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`font-display text-[19px] leading-tight flex items-center gap-2 ${filled ? "text-white" : "text-ink"}`}>
          {name}
          {ai && <span className={`font-mono text-[10px] font-semibold uppercase tracking-wide rounded-full px-1.5 py-0.5 ${filled ? "bg-brand-400 text-forest" : "bg-forest text-white"}`}>AI</span>}
        </span>
        <span className={`font-mono text-[10.5px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 whitespace-nowrap ${tagCls}`}>{tag}</span>
      </div>
      <p className={`text-[13.5px] leading-relaxed mt-3.5 ${filled ? "text-[#BFD3CA]" : "text-ink-muted"}`}>{desc}</p>
    </div>
  );
}

/* ── Feature row (copy-left / panel-right) ─────────────────────────────────── */
function FeatureRow({ id, eyebrow, title, panel, children, band }: { id?: string; eyebrow?: string; title: string; panel: React.ReactNode; children: React.ReactNode; band?: boolean }) {
  return (
    <section id={id} className={band ? "bg-band" : ""}>
      <div data-reveal className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          {eyebrow && <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-brand-700 mb-3">{eyebrow}</p>}
          <h2 className="font-display font-bold text-[2.4rem] sm:text-[2.9rem] leading-[1.06] tracking-[-0.025em]" style={{ textWrap: "balance" }}>{title}</h2>
          <div className="mt-5">{children}</div>
        </div>
        <div>{panel}</div>
      </div>
    </section>
  );
}

/* ── Panel card wrapper ────────────────────────────────────────────────────── */
function PanelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white border border-line shadow-elev-2 ${className}`}>{children}</div>;
}

/* ── Status pill ───────────────────────────────────────────────────────────── */
function StatusPill({ s }: { s: "Ready" | "Verify" | "Collect" }) {
  const map = { Ready: ["#EAF4FE", "#10A572"], Verify: ["#F6ECD8", "#8A6516"], Collect: ["#FDEBE7", "#C2432A"] } as const;
  const [bg, fg] = map[s];
  return <span className="font-mono text-[10px] rounded-full px-2 py-0.5" style={{ backgroundColor: bg, color: fg }}>{s}</span>;
}

/* ── Action plan panel ─────────────────────────────────────────────────────── */
function ActionPlanPanel() {
  return (
    <PanelCard className="p-4">
      <div className="flex items-center justify-between px-1 pb-2.5 border-b border-line-soft">
        <p className="text-[12.5px] font-semibold text-ink">Action plan · Principle 6, Environment</p>
        <span className="font-mono text-[10.5px] text-ink-faint">11 fields</span>
      </div>
      <RowItem label="Total energy consumption (GJ)" status="Ready" dot="#1E9DF2" />
      <RowItem label="Water withdrawal by source (kL)" status="Verify" dot="#C2871B" />
      <div className="rounded-lg border border-line my-1.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#F2674A" }} />
          <span className="text-[13px] text-ink flex-1">Scope 1 emissions (tCO₂e)</span>
          <span className="font-mono text-[10px] text-ink-faint">Essential</span>
          <StatusPill s="Collect" />
        </div>
        <div className="mx-3 mb-3 rounded-lg bg-[#EAF4FE] border border-[#CDE2F6] p-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[#10A572]"><Spark />AI field guidance</p>
          <p className="text-[13px] text-[#3F4A44] leading-relaxed mt-1.5">Direct greenhouse gases from sources the company owns or controls: fuel burned in boilers, furnaces and company vehicles. Report the total in tonnes of CO₂-equivalent, using CEA and IPCC factors.</p>
          <p className="font-mono text-[10px] text-ink-faint mt-2">Source · SEBI BRSR Format, P6 Q7</p>
        </div>
      </div>
      <RowItem label="Scope 2 emissions (tCO₂e)" status="Collect" dot="#F2674A" />
      <RowItem label="Air emissions, NOx, SOx (MT)" status="Ready" dot="#1E9DF2" />
    </PanelCard>
  );
}

function RowItem({ label, status, dot }: { label: string; status: "Ready" | "Verify" | "Collect"; dot: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
      <span className="text-[13px] text-ink flex-1">{label}</span>
      <StatusPill s={status} />
    </div>
  );
}

/* ── Materiality panel ─────────────────────────────────────────────────────── */
function MaterialityPanel() {
  const pts = [
    { n: 1, x: 220, y: 40, c: "#F2674A", label: "Climate & GHG emissions" },
    { n: 2, x: 190, y: 95, c: "#0F1E33", label: "Energy management" },
    { n: 3, x: 150, y: 70, c: "#0F1E33", label: "Water & effluents" },
    { n: 4, x: 120, y: 130, c: "#1E9DF2", label: "Employee health & safety" },
    { n: 5, x: 175, y: 150, c: "#1E9DF2", label: "Business ethics" },
    { n: 6, x: 95, y: 175, c: "#8A938D", label: "Waste & circularity" },
  ];
  return (
    <PanelCard className="p-5 flex gap-5">
      <svg viewBox="0 0 260 210" className="w-[58%] flex-shrink-0">
        <line x1="40" y1="10" x2="40" y2="190" stroke="#E6E3DB" strokeWidth="1" />
        <line x1="40" y1="190" x2="250" y2="190" stroke="#E6E3DB" strokeWidth="1" />
        <line x1="145" y1="10" x2="145" y2="190" stroke="#EEF1F6" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="40" y1="100" x2="250" y2="100" stroke="#EEF1F6" strokeWidth="1" strokeDasharray="3 3" />
        {pts.map((p) => (
          <g key={p.n}>
            <circle cx={p.x} cy={p.y} r="12" fill={p.c} />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff">{p.n}</text>
          </g>
        ))}
        <text x="145" y="206" textAnchor="middle" fontSize="8" fill="#8A938D">Impact on enterprise value →</text>
      </svg>
      <ul className="flex-1 space-y-1.5 self-center">
        {pts.map((p) => (
          <li key={p.n} className="flex items-center gap-2 text-[12px] text-[#3F4A44]">
            <span className="font-mono text-[10px] w-3 text-ink-faint">{p.n}</span>{p.label}
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

/* ── Alignment panel ───────────────────────────────────────────────────────── */
function AlignmentPanel() {
  const rows = [
    ["GHG emissions", "305", "M-b", "S2·29", "—"],
    ["Energy use", "302", "—", "S2·29", "—"],
    ["Water withdrawal", "303", "—", "—", "C1.1"],
    ["Board diversity", "405", "—", "—", "—"],
  ];
  return (
    <PanelCard className="p-5">
      <table className="w-full text-left">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            <th className="font-normal pb-2">Disclosure</th><th className="font-normal pb-2 text-right">GRI</th><th className="font-normal pb-2 text-right">TCFD</th><th className="font-normal pb-2 text-right">IFRS</th><th className="font-normal pb-2 text-right">TNFD</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-line-soft">
              <td className="py-2.5 text-[13px] text-ink">{r[0]}</td>
              {r.slice(1).map((v, i) => <td key={i} className="py-2.5 text-right font-mono text-[12px] text-ink-muted">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-line-soft">
        <span className="font-mono text-[10.5px] text-ink-faint">Ratings</span>
        {["MSCI", "DJSI"].map((r) => <span key={r} className="font-mono text-[10.5px] text-[#10A572] bg-[#EAF4FE] rounded px-1.5 py-0.5">{r}</span>)}
      </div>
    </PanelCard>
  );
}

/* ── GHG calculator panel ──────────────────────────────────────────────────── */
function GhgCalculatorPanel() {
  const [diesel, setDiesel] = useState("12000");
  const [elec, setElec] = useState("84000");
  const d = parseFloat(diesel) || 0, e = parseFloat(elec) || 0;
  const s1 = (d * 2.68) / 1000, s2 = (e * 0.716) / 1000, total = s1 + s2;
  const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
  return (
    <PanelCard className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <p className="text-[12.5px] font-semibold text-ink">GHG calculator · Scope 1 &amp; 2</p>
        <span className="font-mono text-[10px] uppercase tracking-wide text-[#10A572]">live</span>
      </div>
      <div className="mt-3 space-y-3">
        <CalcField label="Diesel consumed (litres / year)" value={diesel} onChange={setDiesel} factor="× 2.68 kg/L" />
        <CalcField label="Grid electricity (kWh / year)" value={elec} onChange={setElec} factor="× 0.716 t/MWh" />
      </div>
      <p className="font-mono text-[10px] text-ink-faint mt-2.5">Factors · IPCC 2006 · CEA v18 (FY24)</p>
      <div className="mt-3 rounded-xl bg-forest text-white p-4">
        <div className="flex items-center justify-between text-[12.5px] text-[#BFD3CA]"><span>Scope 1 (fuel)</span><span className="font-mono text-white">{fmt(s1)} t</span></div>
        <div className="flex items-center justify-between text-[12.5px] text-[#BFD3CA] mt-1"><span>Scope 2 (electricity)</span><span className="font-mono text-white">{fmt(s2)} t</span></div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/15">
          <span className="text-[13px] font-semibold">Total</span>
          <span className="font-display text-[26px] leading-none">{fmt(total)}<span className="font-mono text-[12px] ml-1">tCO₂e</span></span>
        </div>
      </div>
    </PanelCard>
  );
}

function CalcField({ label, value, onChange, factor }: { label: string; value: string; onChange: (v: string) => void; factor: string }) {
  return (
    <div>
      <label className="text-[12px] text-ink-muted">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          inputMode="numeric"
          className="flex-1 h-10 px-3 font-mono text-[14px] text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
        />
        <span className="font-mono text-[11px] text-ink-faint whitespace-nowrap">{factor}</span>
      </div>
    </div>
  );
}

/* ── Collect panel ─────────────────────────────────────────────────────────── */
function CollectPanel() {
  const reqs = [
    { in: "PR", name: "Priya R.", dept: "Facilities", item: "Energy bills · FY24", status: "Submitted", c: "#10A572", bg: "#EAF4FE" },
    { in: "RM", name: "Rohan M.", dept: "Fleet", item: "Diesel & fuel logs", status: "Reminder sent", c: "#8A6516", bg: "#F6ECD8" },
    { in: "AN", name: "Anita N.", dept: "Utilities", item: "Water meter readings", status: "Awaiting", c: "#C2432A", bg: "#FDEBE7" },
  ];
  return (
    <PanelCard className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <p className="text-[12.5px] font-semibold text-ink">Data requests · Acme Industries</p>
        <span className="font-mono text-[10.5px] text-ink-faint">3 of 5 in</span>
      </div>
      <div className="mt-2 space-y-1">
        {reqs.map((r) => (
          <div key={r.in} className="flex items-center gap-3 py-2">
            <span className="w-8 h-8 rounded-full bg-[#EAF4FE] flex items-center justify-center font-mono text-[11px] text-[#0F1E33] flex-shrink-0">{r.in}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-ink leading-tight">{r.name} · <span className="text-ink-muted">{r.dept}</span></p>
              <p className="font-mono text-[11px] text-ink-faint">{r.item}</p>
            </div>
            <span className="font-mono text-[10px] rounded-full px-2 py-0.5 whitespace-nowrap" style={{ backgroundColor: r.bg, color: r.c }}>{r.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-[#EAF4FE] border border-[#CDE2F6] p-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[#10A572]"><Spark />AI-drafted narrative</p>
        <p className="text-[13px] text-[#3F4A44] leading-relaxed mt-1.5">In FY 2024-25 the company&apos;s Scope 1 and 2 emissions totalled <span className="font-semibold text-ink">92.3 tCO₂e</span>, a 4% reduction year on year, driven by the switch to grid-renewable supply at the Pune facility.</p>
        <p className="font-mono text-[10px] text-ink-faint mt-2">Every figure linked to source · nothing invented</p>
      </div>
    </PanelCard>
  );
}

/* ── Footer helpers ────────────────────────────────────────────────────────── */
function FootCol({ title, links }: { title: string; links: [string, (() => void) | null][] }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">{title}</p>
      <ul className="mt-2.5 space-y-1.5">
        {links.map(([label, fn]) => (
          <li key={label}>
            {fn ? (
              <button onClick={fn} className="text-[14px] text-[#BFD3CA] hover:text-white text-left transition-colors">{label}</button>
            ) : (
              <span className="text-[14px] text-[#BFD3CA]">{label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Template builders (for direct downloads on landing page) ─────────────── */
function buildMaterialityGrid(): string[][] {
  return [
    ["Material topic", "Pillar (E/S/G)", "Why it matters to the business", "Business impact (1-5)", "Stakeholder concern (1-5)", "Material? (Y/N)", "Rationale for decision", "Owner"],
    ["e.g. GHG emissions & energy", "E", "Cost, regulation (BRSR Core, CCTS), customer pressure", "", "", "", "", ""],
    ["e.g. Occupational health & safety", "S", "Licence to operate, workforce continuity", "", "", "", "", ""],
    ["e.g. Business ethics & anti-bribery", "G", "Legal exposure, investor trust", "", "", "", "", ""],
    ...Array.from({ length: 9 }, () => ["", "", "", "", "", "", "", ""]),
  ];
}

function buildStakeholderPlan(): string[][] {
  return [
    ["Stakeholder group", "Why they matter", "Engagement method", "Frequency", "Key ESG topics", "Owner", "Last engaged"],
    ["Employees & workers", "Workforce wellbeing, retention, P3/P5 data", "Survey, town halls, grievance channel", "Quarterly", "Safety, wages, D&I, grievances", "", ""],
    ["Customers", "Demand, product responsibility (P9)", "Feedback, account reviews", "Ongoing", "Product safety, data privacy, ESG asks", "", ""],
    ["Suppliers / value chain", "Scope 3, value-chain disclosure (FY26-27)", "Onboarding, audits, questionnaires", "Annual", "Emissions data, labour, sourcing", "", ""],
    ["Local communities", "Licence to operate (P8)", "Consultations, CSR reviews", "Annual", "Land, water, livelihoods, grievances", "", ""],
    ["Investors / lenders", "Cost of capital, ratings", "Disclosures, briefings", "Annual", "Climate risk, governance, targets", "", ""],
    ["Regulators", "Compliance (SEBI, PCB, BEE)", "Filings, inspections", "As required", "Permits, BRSR, CCTS/PAT", "", ""],
  ];
}

/* ══════════════════════════════════════════════════════════════════════════════
   SECTION COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── Header ────────────────────────────────────────────────────────────────── */
function Header({
  onStart,
  scrollTo,
  resume,
}: {
  onStart: () => void;
  scrollTo: (id: string) => () => void;
  resume?: { companyName: string; onResume: () => void } | null;
}) {
  const [openMenu, setOpenMenu] = useState<"filing" | "free" | "pro" | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openDropdown = (menu: "filing" | "free" | "pro") => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };
  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  const FREE_ITEMS: { label: string; sub: string; href?: string; action?: () => void; badge?: string }[] = [
    { label: "BRSR gap analysis", sub: "108-field instant readiness report", action: onStart, badge: "Start free" },
    { label: "BRSR applicability checker", sub: "Must your client file, and by when?", href: "/tools/brsr-applicability" },
    { label: "GHG & emissions calculator", sub: "Scope 1 & 2, energy, water, CEA & IPCC cited", href: "/tools/ghg-calculator" },
    { label: "Scope 3 screening", sub: "Activity-based Cat 4–9, GHG Protocol + DEFRA", href: "/tools/scope3-calculator" },
    { label: "Materiality matrix builder", sub: "Impact × stakeholder grid, CSV export", href: "/tools/materiality" },
    { label: "Templates & workbooks", sub: "BRSR workbook, materiality grid, stakeholder plan", href: "/features/templates" },
    { label: "Cross-framework mapping", sub: "BRSR ↔ GRI, TCFD, IFRS, TNFD, MSCI/DJSI", href: "/features/alignment" },
    { label: "CBAM & CCTS checker", sub: "Are you in scope for new regulations?", href: "/features/cbam-ccts" },
    { label: "Materiality topics", sub: "Suggested material topics by industry", href: "/features/materiality" },
    { label: "Methodology & sources", sub: "How we calculate, every figure cited", href: "/methodology" },
  ];

  const PRO_ITEMS = [
    { label: "Collect", sub: "Chase data from the client's team, auto-reminders", href: "/requests" },
    { label: "AI compliance importer", sub: "Upload docs, AI fills all 108 fields with source lines", href: "/requests" },
    { label: "Proposal & fee builder", sub: "Scope and price an engagement in minutes", href: "/requests/proposal" },
    { label: "Multi-client workspace", sub: "Every client's engagement in one dashboard", href: "/requests" },
  ];

  const FILING_ITEMS: { label: string; sub: string; href: string }[] = [
    { label: "XBRL pre-flight check", sub: "Rupee-scale converter + why filings get rejected", href: "/tools/xbrl-preflight" },
    { label: "Audit-readiness checklist", sub: "Evidence a BRSR Core assurer asks for, per KPI", href: "/tools/audit-readiness" },
    { label: "PPP-adjusted intensity", sub: "Intensity comparable with global peers, WB PPP cited", href: "/tools/ppp-intensity" },
    { label: "Well-being expense schedule", sub: "P3 welfare heads mapped to P&L lines, CSV", href: "/tools/wellbeing-schedule" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-page/90 backdrop-blur-md border-b border-line">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-[70px] flex items-center gap-2">
        {/* Logo → home */}
        <Link href="/" aria-label="Saaksh home" className="flex items-center gap-2.5 flex-shrink-0 mr-3 rounded-lg hover:opacity-90 transition-opacity">
          <SaakshMark size={32} />
          <span className="font-display font-bold text-[19px] text-ink">Saaksh</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {/* Filing & audit tools dropdown (leading, consultant-facing) */}
          <div
            className="relative"
            onMouseEnter={() => openDropdown("filing")}
            onMouseLeave={closeDropdown}
          >
            <button className={`flex items-center gap-1 text-[15px] font-medium px-3 py-2 rounded-lg transition-colors ${openMenu === "filing" ? "text-ink bg-band" : "text-ink-muted hover:text-ink hover:bg-band"}`}>
              Filing &amp; audit tools <IcoChevronDown />
            </button>
            <div
              className={`absolute top-full left-0 mt-1 w-[560px] bg-white border border-line rounded-2xl shadow-elev-2 p-2 grid grid-cols-2 gap-0.5 transition-all duration-150 origin-top-left ${openMenu === "filing" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
            >
              {FILING_ITEMS.map((item) => (
                <Link key={item.label} href={item.href} className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-band transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink">{item.label}</p>
                    <p className="text-[12px] text-ink-muted mt-0.5 leading-snug">{item.sub}</p>
                  </div>
                  <IcoArrow />
                </Link>
              ))}
            </div>
          </div>

          {/* Tools dropdown */}
          <div
            className="relative"
            onMouseEnter={() => openDropdown("free")}
            onMouseLeave={closeDropdown}
          >
            <button className={`flex items-center gap-1 text-[15px] font-medium px-3 py-2 rounded-lg transition-colors ${openMenu === "free" ? "text-ink bg-band" : "text-ink-muted hover:text-ink hover:bg-band"}`}>
              Tools <IcoChevronDown />
            </button>
            <div
              className={`absolute top-full left-0 mt-1 w-[600px] bg-white border border-line rounded-2xl shadow-elev-2 p-2 grid grid-cols-2 gap-0.5 transition-all duration-150 origin-top-left ${openMenu === "free" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
            >
              {FREE_ITEMS.map((item) => {
                const inner = (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink flex items-center gap-2">
                        {item.label}
                        {item.badge && (
                          <span className="font-mono text-[9px] uppercase tracking-wide bg-brand-500 text-white rounded-full px-1.5 py-0.5">{item.badge}</span>
                        )}
                      </p>
                      <p className="text-[12px] text-ink-muted mt-0.5 leading-snug">{item.sub}</p>
                    </div>
                    <IcoArrow />
                  </>
                );
                const cls = "w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-band transition-colors group";
                return item.href
                  ? <Link key={item.label} href={item.href} className={cls}>{inner}</Link>
                  : <button key={item.label} onClick={item.action} className={cls}>{inner}</button>;
              })}
            </div>
          </div>

          {/* Pro dropdown */}
          <div
            className="relative"
            onMouseEnter={() => openDropdown("pro")}
            onMouseLeave={closeDropdown}
          >
            <button className={`flex items-center gap-1 text-[15px] font-medium px-3 py-2 rounded-lg transition-colors ${openMenu === "pro" ? "text-ink bg-band" : "text-ink-muted hover:text-ink hover:bg-band"}`}>
              Pro <IcoChevronDown />
            </button>
            <div
              className={`absolute top-full left-0 mt-1 w-[280px] bg-white border border-line rounded-2xl shadow-elev-2 p-1.5 transition-all duration-150 origin-top-left ${openMenu === "pro" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
            >
              {PRO_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-band transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink">{item.label}</p>
                    <p className="text-[12px] text-ink-muted mt-0.5 leading-snug">{item.sub}</p>
                  </div>
                  <IcoArrow />
                </a>
              ))}
              <div className="mt-1 pt-1.5 border-t border-line-soft">
                <a href={REQUEST_ACCESS_URL} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-forest text-white hover:bg-forest-light transition-colors">
                  <span className="text-[13px] font-semibold flex-1">Request Pro access</span>
                  <IcoArrow />
                </a>
              </div>
            </div>
          </div>

          <Link href="/latest" className="text-[15px] font-medium text-ink-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-band transition-colors">Latest</Link>

          <button onClick={scrollTo("how")} className="text-[15px] font-medium text-ink-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-band transition-colors">How it works</button>

          <Link href="/blog" className="text-[15px] font-medium text-ink-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-band transition-colors">Blog</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {resume && (
            <button
              onClick={resume.onResume}
              className="hidden sm:flex items-center gap-2 text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors pressable"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
              {resume.companyName ? `Continue: ${resume.companyName}` : "Continue report"} →
            </button>
          )}
          <button
            onClick={onStart}
            className="inline-flex items-center gap-1.5 bg-forest text-white text-[13.5px] font-semibold px-4 py-2 rounded-lg hover:bg-forest-light transition-colors pressable"
          >
            Start free
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── Product preview section ───────────────────────────────────────────────── */
/* Shared status badge styles used by both the hero panel and the product preview */
const BADGE_CLS = {
  tracked: "bg-[#E3F7F0] text-[#0E7A56] border border-[#BFE6D8]",
  partial: "bg-[#F6ECD8] text-[#8A6516] border border-[#EAD8B0]",
  new: "bg-[#FFF1ED] text-[#C24428] border border-[#F8C9BD]",
};

const STATUS_DOT = {
  tracked: "#22C55E",
  partial: "#F59E0B",
  new: "#F2674A",
};

/* Hero readiness panel, replaces the shrunk full-app screenshot */
function HeroReadinessPanel() {
  const rows = [
    { id: "P6-E1", label: "Scope 1 & 2 GHG emissions (absolute, tCO₂e)", status: "tracked" as const, badge: "Ready to pull", source: "PAT Scheme + CEA v21.0" },
    { id: "P3-E1", label: "Total workforce: employees and contractors",   status: "partial" as const, badge: "Needs verification", source: "Factory Act (partial)" },
    { id: "P1-E2", label: "Code of conduct and anti-corruption policy",   status: "tracked" as const, badge: "Ready to pull",      source: "Annual report" },
  ];

  const READY = 23, VERIFY = 41, COLLECT = 44, TOTAL = 108;
  const sourced = READY + VERIFY;
  const r = 36, cx = 44, cy = 44, circ = 2 * Math.PI * r;
  const dash = (circ * sourced) / TOTAL;

  return (
    <>
      {/* Report header */}
      <div className="bg-white border-b border-line px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0F1E33] flex items-center justify-center text-white text-[10px] font-bold shrink-0">S</div>
          <span className="font-semibold text-ink text-[13.5px]">Tata Steel Ltd</span>
          <span className="text-[11px] font-mono text-ink-muted bg-band px-1.5 py-0.5 rounded hidden sm:inline">BRSR FY 2025-26</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${BADGE_CLS.tracked}`}>{READY} ready</span>
          <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${BADGE_CLS.partial}`}>{VERIFY} verify</span>
          <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${BADGE_CLS.new}`}>{COLLECT} collect</span>
        </div>
      </div>

      {/* Readiness moment */}
      <div className="bg-[#F8FBFE] border-b border-line px-5 py-5 flex items-center gap-5">
        {/* Donut */}
        <div className="shrink-0 relative" style={{ width: 88, height: 88 }}>
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" style={{ transform: "rotate(-90deg)" }}>
            <circle cx={cx} cy={cy} r={r} stroke="#E5E9F0" strokeWidth="8" />
            <circle
              cx={cx} cy={cy} r={r}
              stroke="#1E9DF2"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <span className="text-[22px] font-bold text-ink tabular-nums">{sourced}</span>
            <span className="text-[9px] font-medium text-ink-muted uppercase tracking-[0.08em] mt-0.5">of {TOTAL}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-[11.5px] text-ink-muted leading-snug mb-2.5">{sourced} of {TOTAL} fields have an existing source</p>
          {/* Segmented bar */}
          <div className="flex rounded-full overflow-hidden h-2" style={{ gap: 2 }}>
            <div className="rounded-full" style={{ width: `${(READY / TOTAL) * 100}%`, background: "#22C55E" }} />
            <div className="rounded-full" style={{ width: `${(VERIFY / TOTAL) * 100}%`, background: "#F59E0B" }} />
            <div className="rounded-full flex-1"                                          style={{ background: "#F2674A" }} />
          </div>
          {/* Counts */}
          <div className="flex items-center gap-4 pt-0.5">
            {([["tracked", `${READY} Ready`], ["partial", `${VERIFY} Verify`], ["new", `${COLLECT} Collect`]] as const).map(([k, label]) => (
              <span key={k} className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_DOT[k] }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Disclosure rows */}
      <div className="divide-y divide-[#EEF1F6] bg-white">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className="px-5 py-3 flex items-center justify-between gap-4"
            style={{ animationDelay: `${320 + i * 60}ms` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[10.5px] text-ink-faint shrink-0 w-[48px]">{row.id}</span>
              <span className="text-[13px] text-ink truncate">{row.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-ink-muted hidden lg:block">{row.source}</span>
              <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${BADGE_CLS[row.status]}`}>
                {row.badge}
              </span>
            </div>
          </div>
        ))}
        <div className="px-5 py-2.5 bg-band flex items-center gap-2 text-[11.5px] text-ink-faint">
          <span className="font-mono tracking-wider">· · ·</span>
          <span>105 more disclosures across all 9 BRSR principles</span>
        </div>
      </div>
    </>
  );
}

function LatestStrip() {
  const items = topLatest(3);
  return (
    <section data-reveal className="border-b border-line">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div className="max-w-[600px]">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700 mb-2.5">Latest</p>
            <h2 className="font-display font-bold text-[1.7rem] sm:text-[2.1rem] leading-[1.1] tracking-[-0.02em] text-ink" style={{ textWrap: "balance" }}>
              Stay ahead of the regulation
            </h2>
            <p className="text-[14.5px] text-ink-muted leading-relaxed mt-2.5">
              The BRSR, CBAM and CCTS moves worth briefing a client on, cited to the source. Updated as things change.
            </p>
          </div>
          <Link href="/latest" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-700 hover:gap-2 transition-all">
            See all updates <IcoArrow />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {items.map((it) => {
            const isReg = it.kind === "regulation";
            const inner = (
              <>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={`font-mono text-[10px] font-semibold uppercase tracking-[0.05em] rounded px-1.5 py-0.5 ${isReg ? "text-[#C24428] bg-[#FFF1ED] border border-[#F8C9BD]" : "text-brand-700 bg-brand-50 border border-[#CDE2F6]"}`}>
                    {it.tag}
                  </span>
                  <span className="text-[12px] font-medium text-ink-muted">{it.displayDate}</span>
                </div>
                <h3 className="text-[15.5px] font-semibold text-ink leading-snug tracking-[-0.01em] group-hover:text-brand-700 transition-colors">{it.title}</h3>
                <p className="text-[13px] text-ink-body leading-relaxed mt-2 line-clamp-3 flex-1">{it.summary}</p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-[12.5px] font-semibold text-brand-700 group-hover:gap-2 transition-all">
                  {isReg ? "Read the source" : "Read the guide"} <IcoArrow />
                </span>
              </>
            );
            const cls = "group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-elev-1 hover:shadow-elev-2 hover:-translate-y-0.5 transition-all";
            const onClick = () => track("latest_item_clicked", { tag: it.tag, kind: it.kind, from: "home" });
            return it.external ? (
              <a key={it.id} href={it.href} target="_blank" rel="noreferrer" onClick={onClick} className={cls}>{inner}</a>
            ) : (
              <Link key={it.id} href={it.href} onClick={onClick} className={cls}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FilingAuditBand() {
  const secondary = [
    { label: "Audit-readiness checklist", sub: "The evidence a BRSR Core assurer asks for, per KPI, ready to download as a CSV.", href: "/tools/audit-readiness" },
    { label: "PPP-adjusted intensity", sub: "Restate intensity against PPP-adjusted turnover so an Indian figure stands next to global peers.", href: "/tools/ppp-intensity" },
    { label: "Well-being expense schedule", sub: "Map P3 welfare heads to the P&L lines they come from, then export the schedule.", href: "/tools/wellbeing-schedule" },
  ];
  return (
    <section data-reveal className="bg-band border-b border-line">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="max-w-[640px] mb-9">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700 mb-3">
            Built for ESG consultants
          </p>
          <h2 className="font-display font-bold text-[2rem] sm:text-[2.6rem] leading-[1.08] tracking-[-0.02em] text-ink" style={{ textWrap: "balance" }}>
            The last mile: get it filed, get it assured.
          </h2>
          <p className="text-[15px] sm:text-[16px] text-ink-muted leading-relaxed mt-3">
            Filing &amp; audit tools cover the parts of a BRSR engagement that trip consultants up after the numbers are in: a clean XBRL upload, an assurer&rsquo;s evidence list, PPP-comparable intensity, and the P3 well-being schedule. Free, cited, and on-device.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.08fr_1fr] gap-5">
          {/* Primary: interactive XBRL card */}
          <Link href="/tools/xbrl-preflight"
            className="group relative flex flex-col justify-between rounded-2xl border border-[#CDE2F6] bg-[#EAF4FE] p-7 sm:p-8 overflow-hidden hover:border-brand-300 transition-colors pressable">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-brand-700 bg-white border border-[#CDE2F6] rounded-full px-2.5 py-1">
                  Free tool · on-device
                </span>
              </div>
              <h3 className="font-display font-bold text-[1.55rem] sm:text-[1.85rem] leading-[1.1] tracking-[-0.02em] text-ink">
                XBRL pre-flight check
              </h3>
              <p className="text-[14.5px] text-ink-muted leading-relaxed mt-2.5 max-w-[440px]">
                A rupee-scale converter plus the recurring mistakes that get a BRSR XBRL bounced by the exchange utility. Fix them before you upload.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-7">
              <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand-700 group-hover:gap-2.5 transition-all">
                Open the converter <IcoArrow />
              </span>
            </div>
            <div className="pointer-events-none absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-brand-500/10" />
          </Link>

          {/* Secondary: three compact rows in one card */}
          <div className="rounded-2xl border border-line bg-white shadow-elev-1 divide-y divide-line overflow-hidden">
            {secondary.map((s) => (
              <Link key={s.href} href={s.href}
                className="group flex items-start gap-4 px-6 py-5 hover:bg-band transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-ink leading-snug group-hover:text-brand-700 transition-colors">{s.label}</p>
                  <p className="text-[13px] text-ink-muted leading-relaxed mt-1">{s.sub}</p>
                </div>
                <span className="mt-1 flex-shrink-0 text-brand-700"><IcoArrow /></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductPreviewSection({ onStart }: { onStart: () => void }) {
  const rows = [
    {
      id: "P6-E1",
      label: "Scope 1 & 2 GHG emissions (absolute, tCO₂e)",
      status: "tracked" as const,
      badge: "Ready to pull",
      source: "PAT Scheme + CEA v21.0",
    },
    {
      id: "P3-E1",
      label: "Total workforce: employees and contractors",
      status: "partial" as const,
      badge: "Needs verification",
      source: "Factory Act (partial)",
    },
    {
      id: "P1-E2",
      label: "Code of conduct and anti-corruption policy",
      status: "tracked" as const,
      badge: "Ready to pull",
      source: "Annual report",
    },
    {
      id: "P6-L3",
      label: "Water discharge by quality and destination",
      status: "new" as const,
      badge: "Collect fresh",
      source: "ZLD filing (not available)",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-band border-b border-line">
      <div className="max-w-[1000px] mx-auto px-5 sm:px-8">
        {/* Heading */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-[1.75rem] sm:text-[2.1rem] text-ink leading-tight tracking-[-0.025em] mb-2" style={{ textWrap: "balance" }}>
            Here&apos;s what comes out the other side.
          </h2>
          <p className="text-[15px] text-ink-muted max-w-[520px] leading-relaxed">
            A structured, colour-coded action plan across all 108 BRSR disclosures. Every field matched against your client&apos;s existing filings, every source named.
          </p>
        </div>

        {/* Browser mockup */}
        <div className="rounded-xl border border-line shadow-elev-2 overflow-hidden">
          {/* Chrome bar */}
          <div className="bg-[#0F1E33] px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 bg-[#1A2B45] rounded px-3 py-[5px] text-[11.5px] font-mono text-[#7BB3D8] tracking-tight">
              saaksh.co/report
            </div>
          </div>

          {/* Report header */}
          <div className="bg-white border-b border-line px-5 py-3.5 flex items-start sm:items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-md bg-[#0F1E33] flex items-center justify-center text-white text-[10px] font-bold shrink-0">S</div>
                <span className="font-semibold text-ink text-[13.5px]">Tata Steel Ltd</span>
                <span className="text-[11px] font-mono text-ink-muted bg-band px-1.5 py-0.5 rounded">BRSR FY 2025-26</span>
              </div>
              <p className="text-[11.5px] text-ink-muted pl-8">Steel &amp; Metals · Listed top 1000 · PAT + PCB + ZLD filings detected</p>
            </div>
            <div className="flex items-center gap-2 pl-8 sm:pl-0">
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E3F7F0] text-[#0E7A56] border border-[#BFE6D8]">23 ready</span>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F6ECD8] text-[#8A6516] border border-[#EAD8B0]">41 verify</span>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FFF1ED] text-[#C24428] border border-[#F8C9BD]">44 collect</span>
            </div>
          </div>

          {/* Disclosure rows */}
          <div className="divide-y divide-[#EEF1F6] bg-white">
            {rows.map((row) => (
              <div
                key={row.id}
                className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-brand-50/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[10.5px] text-ink-faint shrink-0 w-[54px]">{row.id}</span>
                  <span className="text-[13px] text-ink truncate">{row.label}</span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] text-ink-muted hidden md:block">{row.source}</span>
                  <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${BADGE_CLS[row.status]}`}>
                    {row.badge}
                  </span>
                </div>
              </div>
            ))}
            {/* Fade-out row */}
            <div className="px-5 py-2.5 bg-band flex items-center gap-2 text-[11.5px] text-ink-faint">
              <span className="font-mono tracking-wider">· · ·</span>
              <span>104 more disclosures across all 9 BRSR principles</span>
            </div>
          </div>
        </div>

        {/* Stat strip + CTA */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              "108 BRSR fields",
              "GHG + energy + water calcs",
              "GRI · TCFD · IFRS mapping",
              "100% on-device",
            ].map((s) => (
              <span key={s} className="text-[13px] text-ink-muted flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {s}
              </span>
            ))}
          </div>
          <button
            onClick={onStart}
            className="pressable inline-flex items-center gap-2 rounded-lg bg-brand-600 text-white text-[13.5px] font-semibold px-4 py-2.5 hover:bg-brand-700 transition-colors"
          >
            Generate your report
            <IcoArrow />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Free features grid ────────────────────────────────────────────────────── */
function FeaturesGrid({ onStart, scrollTo }: { onStart: () => void; scrollTo: (id: string) => () => void }) {
  const features = [
    {
      icon: <IcoClipboard />,
      iconBg: "bg-brand-50 text-brand-600",
      title: "BRSR gap analysis",
      desc: "All 108 disclosures sorted into Ready, Verify or Collect, matched against the company's existing filings.",
      cta: "Start free",
      action: onStart,
    },
    {
      icon: <IcoBarChart />,
      iconBg: "bg-[#EAF4FE] text-brand-600",
      title: "GHG & emissions calculators",
      desc: "Scope 1, 2 and 3 screening. CEA and IPCC conversion factors, version noted on every line.",
      cta: "See calculator",
      action: scrollTo("calculators"),
    },
    {
      icon: <IcoNetwork />,
      iconBg: "bg-[#EDE9FE] text-violet-600",
      title: "Cross-framework mapping",
      desc: "Every BRSR disclosure linked to GRI, TCFD, IFRS S1/S2 and TNFD. 68 mappings, exportable as CSV.",
      cta: "Explore mapping",
      action: onStart,
    },
    {
      icon: <IcoFileText />,
      iconBg: "bg-[#F0FDF4] text-emerald-600",
      title: "Templates & workbooks",
      desc: "BRSR response workbook, materiality assessment grid, stakeholder engagement plan. Download in one click.",
      cta: "See templates",
      action: scrollTo("tools"),
    },
    {
      icon: <IcoCalendar />,
      iconBg: "bg-[#FFF7ED] text-orange-500",
      title: "Engagement timeline",
      desc: "A 12 or 20-week milestone plan tailored to your filing deadline. Download as CSV for the client.",
      cta: "Generate timeline",
      action: scrollTo("tools"),
    },
    {
      icon: <IcoGlobe />,
      iconBg: "bg-[#FFF1F2] text-rose-600",
      title: "CBAM & CCTS readiness",
      desc: "EU Carbon Border Adjustment and India's Carbon Credit Trading Scheme, who's in scope and what to prepare.",
      cta: "Check readiness",
      action: onStart,
    },
  ];

  return (
    <section className="bg-band border-b border-line">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display font-bold text-[2.3rem] sm:text-[2.9rem] leading-[1.06] tracking-[-0.025em]" style={{ textWrap: "balance" }}>
              A full toolkit. All free.
            </h2>
            <p className={`text-[16px] ${BODY} leading-relaxed mt-3 max-w-[540px]`}>
              Every tool that used to take a week of prep is here, on your device, no login.
            </p>
          </div>
          <button onClick={onStart} className="flex-shrink-0 inline-flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-4 py-2.5 rounded-xl hover:bg-forest-light transition-colors pressable">
            Start free <IcoArrow />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <button
              key={f.title}
              onClick={f.action}
              className="group text-left bg-white rounded-2xl p-6 border border-line shadow-elev-1 hover:shadow-elev-2 hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-200 pressable"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-ink text-[15px] leading-snug">{f.title}</h3>
              <p className={`text-[13.5px] ${BODY} leading-relaxed mt-2`}>{f.desc}</p>
              <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-600 mt-4 group-hover:text-brand-700 transition-colors">
                {f.cta} <IcoArrow />
              </p>
            </button>
          ))}
        </div>

        <p className="font-mono text-[12px] text-ink-muted mt-8 text-center">
          Everything above is free · No login · Client data never leaves your browser
        </p>
      </div>
    </section>
  );
}

/* ── Mini tools section (interactive, no report needed) ───────────────────── */
function MiniToolsSection({ onStart }: { onStart: () => void }) {
  const [firstTime, setFirstTime] = useState(false);
  const [deadlineStr, setDeadlineStr] = useState(defaultDeadline());
  const deadline = new Date(deadlineStr + "T00:00:00");
  const timeline = computeTimeline(deadline, firstTime);
  const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  function handleTimelineDownload() {
    downloadCsv(`saaksh-engagement-timeline`, timelineCsvRows(timeline));
  }

  function handleMaterialityDownload() {
    downloadCsv("materiality-assessment-template", buildMaterialityGrid());
  }

  function handleStakeholderDownload() {
    downloadCsv("stakeholder-engagement-plan", buildStakeholderPlan());
  }

  return (
    <section id="tools" className="bg-white border-y border-line">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display font-bold text-[2.3rem] sm:text-[2.9rem] leading-[1.06] tracking-[-0.025em]" style={{ textWrap: "balance" }}>
          Use the tools directly, no report needed.
        </h2>
        <p className={`text-[16px] ${BODY} leading-relaxed mt-3 max-w-[600px]`}>
          The timeline and templates work right here. For the full gap analysis, generate a report from your client's details.
        </p>

        <div className="grid lg:grid-cols-2 gap-10 mt-12">
          {/* Engagement timeline */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-orange-500 flex items-center justify-center flex-shrink-0">
                <IcoCalendar />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-[16px]">Engagement timeline</h3>
                <p className="text-[13px] text-ink-muted">Personalized to your filing deadline.</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wide text-ink-faint block mb-1">Filing deadline</label>
                <input
                  type="date"
                  value={deadlineStr}
                  onChange={(e) => setDeadlineStr(e.target.value)}
                  className="h-9 px-3 font-mono text-[13px] text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wide text-ink-faint block mb-1">Client experience</label>
                <div className="flex items-center rounded-lg border border-line overflow-hidden bg-white h-9">
                  {([["First-time", true], ["Experienced", false]] as const).map(([label, val]) => (
                    <button
                      key={label}
                      onClick={() => setFirstTime(val)}
                      className={`px-3 h-full text-[12.5px] font-medium transition-colors ${firstTime === val ? "bg-forest text-white" : "text-ink-muted hover:text-ink"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline table */}
            <div className="rounded-2xl border border-line overflow-hidden shadow-elev-1">
              <div className="bg-band border-b border-line px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-wide text-ink-faint">{firstTime ? "20-week plan" : "12-week plan"} · {timeline.length} milestones</span>
                <button onClick={handleTimelineDownload} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors pressable">
                  <IcoDownload /> Download CSV
                </button>
              </div>
              <div className="divide-y divide-line-soft">
                {timeline.map((m) => (
                  <div key={m.name} className="grid grid-cols-[1fr_auto] gap-3 items-start px-4 py-3">
                    <div>
                      <p className="text-[13px] font-semibold text-ink leading-snug">{m.name}</p>
                      <p className="text-[11.5px] text-ink-muted mt-0.5 leading-snug">{m.owner}</p>
                    </div>
                    <p className="font-mono text-[12px] text-ink-body whitespace-nowrap pt-0.5">{fmtDate(m.dueDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Templates */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] text-emerald-600 flex items-center justify-center flex-shrink-0">
                <IcoFileText />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-[16px]">Ready-to-use templates</h3>
                <p className="text-[13px] text-ink-muted">Download as Excel-compatible CSV, no signup.</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: "Materiality assessment grid",
                  desc: "Scoring format for a stakeholder-driven materiality assessment. Business impact × stakeholder concern, with worked examples.",
                  onDownload: handleMaterialityDownload,
                  free: true,
                },
                {
                  name: "Stakeholder engagement plan",
                  desc: "Pre-filled with the six stakeholder groups BRSR expects, with suggested engagement methods and ESG topics for each.",
                  onDownload: handleStakeholderDownload,
                  free: true,
                },
                {
                  name: "BRSR response workbook",
                  desc: "All 108 Section C fields plus Sections A and B as a blank fill-in sheet, with data owner and evidence columns.",
                  onDownload: onStart,
                  free: true,
                  note: "Generate a report to download",
                },
              ].map((t) => (
                <div key={t.name} className="flex items-start gap-4 p-4 rounded-2xl border border-line bg-white shadow-elev-1 hover:shadow-elev-2 transition-shadow">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-[14px] leading-snug">{t.name}</p>
                    <p className="text-[12.5px] text-ink-muted leading-relaxed mt-1">{t.desc}</p>
                    {t.note && <p className="text-[11.5px] text-ink-faint mt-1.5 font-mono">{t.note}</p>}
                  </div>
                  <button
                    onClick={t.onDownload}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors pressable whitespace-nowrap"
                  >
                    <IcoDownload />
                    {t.note ? "Start free" : "Download"}
                  </button>
                </div>
              ))}
            </div>

            <p className="font-mono text-[11.5px] text-ink-faint mt-4">
              All downloads are generated in your browser · Nothing uploaded · Free forever
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pain / solution table ─────────────────────────────────────────────────── */
function PainTable() {
  const rows = [
    { pain: "A blank 108-field format, and no quick read on what's already covered", sol: "A gap-analysed action plan, every field sorted into Ready, Verify or Collect" },
    { pain: "Re-keying figures out of an 80-page annual report or last year's BRSR by hand", sol: "Upload the whole document: AI reads every page, distributes figures across all 108 fields, each shown with its source line" },
    { pain: "Chasing data that lives with different people across the business", sol: "Branded requests with auto-reminders and no-login submission, evidence attached" },
    { pain: "Emission factors to get right, and proving the number is defensible", sol: "Calculators cited to CEA & IPCC (version on every line) and an assurance evidence trail" },
    { pain: "One dataset, demanded by GRI, TCFD, IFRS and TNFD", sol: "Cross-framework mapping and one-click export, collect once, report many" },
    { pain: "Hand-writing emails to chase data, and hunting for materiality formats", sol: "Ready-to-send internal request emails per team, a who-owns-what map, and templates and guides" },
    { pain: "New regulations landing, CBAM for exporters, CCTS carbon credits", sol: "Beyond-BRSR readiness checks: who's in scope, and what to prepare" },
  ];
  return (
    <section id="beyond" className="bg-band">
      <div data-reveal className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display font-bold text-[2.3rem] sm:text-[2.9rem] leading-[1.06] tracking-[-0.025em] max-w-[620px]" style={{ textWrap: "balance" }}>
          Every part of the work that eats weeks, handled.
        </h2>
        <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[600px]`}>
          A BRSR report is a hundred-odd disclosures, scattered data, emission maths and a stack of frameworks. Saaksh takes each of those jobs and gives it a tool.
        </p>
        <div className="mt-12 rounded-2xl border border-line bg-white overflow-hidden divide-y divide-line-soft shadow-elev-1">
          {rows.map((r) => (
            <div key={r.pain} className="grid sm:grid-cols-2 gap-x-8 gap-y-2 px-5 sm:px-7 py-5 items-center">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#FDEBE7] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#C2432A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </span>
                <p className="text-[15px] text-ink-muted leading-snug">{r.pain}</p>
              </div>
              <div className="flex items-start gap-3 sm:pl-8 sm:border-l border-line-soft">
                <Check className="text-brand-600 mt-0.5" />
                <p className="text-[15px] text-ink leading-snug flex-1 font-medium">{r.sol}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Header + Footer ───────────────────────────────────────────────────────── */
function Footer({ onStart, scrollTo }: { onStart: () => void; scrollTo: (id: string) => () => void }) {
  return (
    <footer className="bg-[#0A1422] text-white">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <SaakshMark size={26} variant="subtle" />
            <span className="font-display font-bold text-[19px] text-white">Saaksh</span>
          </div>
          <p className="text-[13.5px] text-[#9FB6AC] leading-relaxed mt-3 max-w-[240px]">Evidence-first compliance for Indian businesses. Starting with BRSR.</p>
        </div>
        <FootCol title="Free tools" links={[
          ["BRSR gap analysis", onStart],
          ["Engagement timeline", scrollTo("tools")],
          ["Templates & workbooks", scrollTo("tools")],
          ["GHG calculators", scrollTo("calculators")],
          ["CBAM & CCTS checker", scrollTo("beyond")],
        ]} />
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">Resources</p>
          <ul className="mt-2.5 space-y-1.5">
            {[
              ["/blog", "Blog"],
              ["/features/gap-analysis", "Gap analysis guide"],
              ["/features/ghg-calculator", "GHG calculator guide"],
              ["/features/templates", "Templates & workbooks"],
              ["/features/collect", "Collect (Pro)"],
              ["/features/cbam-ccts", "CBAM & CCTS guide"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-[14px] text-[#BFD3CA] hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">Built by</p>
          <a href="https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/" target="_blank" rel="noopener noreferrer" className="block text-[14px] text-[#BFD3CA] hover:text-white mt-2.5 transition-colors">Rahul Upadhyay</a>
          <a href="mailto:rahulu626@gmail.com" className="block text-[14px] text-[#BFD3CA] hover:text-white mt-1 transition-colors">rahulu626@gmail.com</a>
          <p className="text-[11.5px] text-ink-muted mt-4">ICAI BRSR 2024 · SEBI Circulars · MoEFCC Rules</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          {[
            ["/privacy", "Privacy"],
            ["/terms", "Terms"],
            ["/dpa", "Data processing"],
            ["/security", "Security"],
            ["/methodology", "Methodology"],
            ["/status", "Status"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="text-[13px] text-[#9FB6AC] hover:text-white transition-colors">{label}</Link>
          ))}
          <CookieSettingsLink className="text-[13px] text-[#9FB6AC] hover:text-white transition-colors" />
          <span className="text-[12px] text-ink-muted sm:ml-auto">Client data never leaves your browser · Cited to SEBI &amp; ICAI</span>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════════ */

export default function LandingPage({ onStart, resume }: LandingPageProps) {
  useScrollReveal();
  const scrollTo = (id: string) => () =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-page text-ink">
      <Header onStart={onStart} scrollTo={scrollTo} resume={resume} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-grid">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-16 lg:pb-24">
          <div className="grid lg:grid-cols-[1fr_1.08fr] gap-12 lg:gap-14 items-center">
            <div>
              <div className="anim-up-sm inline-flex items-center gap-2 rounded-full border border-line bg-white/70 pl-2 pr-3.5 py-1">
                <span className="font-display font-bold text-[14px] text-brand-700">साक्ष्य</span>
                <span className="text-[12.5px] text-ink-muted">Evidence, by name and by design</span>
              </div>

              <h1
                className="anim-up-hero font-display font-bold text-ink text-[3.6rem] sm:text-[4.8rem] leading-[1.0] tracking-[-0.03em] mt-6"
                style={{ textWrap: "balance", animationDelay: "60ms" }}
              >
                Compliance reporting, made <em className="not-italic text-brand-600">fast</em> and defensible.
              </h1>

              <p
                className={`anim-up-md text-[17.5px] sm:text-[19px] ${BODY} leading-[1.6] mt-6 max-w-[545px]`}
                style={{ animationDelay: "160ms" }}
              >
                Saaksh turns the scramble of regulatory reporting, scattered data, emission maths, frameworks to reconcile, a narrative to draft, into one cited workflow. Starts with BRSR.
              </p>

              <div className="anim-up-md flex flex-wrap items-center gap-3 mt-8" style={{ animationDelay: "240ms" }}>
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2 bg-forest text-white text-[15.5px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable shadow-sm"
                >
                  Start a free report <IcoArrow />
                </button>
                <button
                  onClick={scrollTo("how")}
                  className="inline-flex items-center gap-2 bg-white text-ink text-[15.5px] font-medium px-5 py-3 rounded-xl border border-line hover:bg-band transition-colors pressable shadow-elev-1"
                >
                  See how it works
                </button>
              </div>

              <p className="anim-up-md text-[13.5px] text-ink-muted mt-5" style={{ animationDelay: "300ms" }}>
                Used by <span className="font-semibold text-ink">75+ consultants</span> preparing BRSR reports across India.
              </p>

              <p
                className="anim-up-md flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12.5px] font-medium text-[#48505C] mt-4"
                style={{ animationDelay: "320ms" }}
              >
                <Dot /> Client data never leaves your browser <span className="text-[#9AA3B0]">·</span>
                <Dot /> AI field guidance <span className="text-[#9AA3B0]">·</span>
                <Dot /> Cited to SEBI &amp; ICAI
              </p>
            </div>

            {/* Product screenshot */}
            <div className="anim-card relative" style={{ animationDelay: "280ms" }}>
              <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-6 sm:translate-x-5 sm:translate-y-7 rounded-[26px] bg-brand-100/55" />
              <div aria-hidden className="absolute -right-5 -top-6 w-32 h-32 rounded-full bg-ember/15 blur-2xl" />
              <div className="relative rounded-xl bg-white border border-line shadow-elev-2 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3.5 h-9 bg-[#F4F7FC] border-b border-line">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5717A]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E8B84B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5FC08A]" />
                  <span className="ml-3 hidden sm:flex items-center flex-1 max-w-[260px] h-5 rounded-md bg-white border border-line px-2 font-mono text-[10px] text-ink-faint">saaksh.co/report</span>
                </div>
                <HeroReadinessPanel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto">
          {/* Scrolling sources ticker */}
          <div className="flex items-center border-b border-line">
            {/* Static label, fixed left */}
            <div className="flex-shrink-0 px-5 sm:px-8 py-4 border-r border-line">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted whitespace-nowrap">Built on primary sources</span>
            </div>
            {/* Scrolling area */}
            <div className="flex-1 overflow-hidden py-4">
              <div className="animate-marquee flex items-center gap-8 w-max">
                {[
                  "SEBI BRSR Format", "ICAI 2024", "CEA factors", "IPCC 2006",
                  "GRI", "TCFD", "IFRS S1/S2", "TNFD", "DEFRA", "MSCI", "DJSI",
                  "SEBI BRSR Format", "ICAI 2024", "CEA factors", "IPCC 2006",
                  "GRI", "TCFD", "IFRS S1/S2", "TNFD", "DEFRA", "MSCI", "DJSI",
                ].map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
                    <svg className="w-3.5 h-3.5 text-[#E07B39] flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M5.5 8l2 2 3-3" />
                    </svg>
                    <span className="text-[14px] font-medium text-ink-muted">{s}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-4 flex flex-wrap items-center justify-center gap-2.5">
            {[
              { href: "/privacy", label: "On-device & private", icon: <path d="M5 13l4 4L19 7" /> },
              { href: "/methodology", label: "Cited, never invented", icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
              { href: "/security", label: "Security & sub-processors", icon: <path d="M12 3l7 3v5c0 4.5-3 7-7 8.5C8 17 5 14.5 5 11V6l7-3z" /> },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-white pl-2.5 pr-2 py-1.5 text-[13px] font-medium text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors pressable"
              >
                <svg className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{c.icon}</svg>
                {c.label}
                <IcoExternal />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built for ESG consultants ────────────────────────────────────── */}
      <FilingAuditBand />

      {/* ── Latest (regulation + guidance) ───────────────────────────────── */}
      <LatestStrip />

      {/* ── Product preview ──────────────────────────────────────────────── */}
      <ProductPreviewSection onStart={onStart} />

      {/* ── Free features grid ───────────────────────────────────────────── */}
      <FeaturesGrid onStart={onStart} scrollTo={scrollTo} />

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" data-reveal className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display font-bold text-[2.4rem] sm:text-[3rem] leading-[1.06] tracking-[-0.025em]" style={{ textWrap: "balance" }}>
          Three steps from intake to a defensible plan.
        </h2>
        <p className={`text-[16.5px] ${BODY} leading-relaxed mt-4 max-w-[560px]`}>
          No setup, no account. Open the tool, describe the company, and get a plan you can take straight into the work.
        </p>
        <div className="grid md:grid-cols-3 gap-10 sm:gap-8 mt-12">
          {[
            { n: "01", t: "Describe the company", b: "A short intake: sector, listing category, what's already in last year's filing. Two minutes, on your device." },
            { n: "02", t: "Get a gap-analysed report", b: "All 108 fields sorted into Ready, Verify and Collect, with suggested materiality and cross-framework mapping." },
            { n: "03", t: "Take it into the work", b: "Export a clean PDF brief and a CSV of every data point still to collect, or move to Collect to chase it." },
          ].map((s) => (
            <div key={s.n} className="flex gap-5">
              <p className="font-display font-bold text-[2.6rem] text-brand-200 leading-none flex-shrink-0 w-12">{s.n}</p>
              <div>
                <h3 className="text-[17px] font-semibold text-ink">{s.t}</h3>
                <p className={`text-[15px] ${BODY} leading-relaxed mt-2`}>{s.b}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature: Action plan ─────────────────────────────────────────── */}
      <FeatureRow id="gap" band eyebrow="The readiness report" title="A gap-analysed action plan, colour-coded." panel={<ActionPlanPanel />}>
        <p className={`text-[16.5px] ${BODY} leading-relaxed`}>
          Every disclosure is matched against last year&apos;s filing and sorted: what&apos;s{" "}
          <span className="text-brand-700 font-medium">Ready</span>, what to{" "}
          <span className="text-[#8A6516] font-medium">Verify</span>, and what still needs to be{" "}
          <span className="text-[#C2432A] font-medium">Collected</span>. Open any field for a cited explanation from the public SEBI definition.
        </p>
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-line bg-band px-3.5 py-3 max-w-[460px]">
          <Spark />
          <p className="text-[13.5px] text-ink-muted leading-relaxed">
            <span className="font-semibold text-ink">Field guidance</span> is AI-written once from public SEBI definitions. No client data is involved, and the text ships as static data.
          </p>
        </div>
      </FeatureRow>

      {/* ── Materiality + Alignment ──────────────────────────────────────── */}
      <section className="bg-white border-y border-line">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h2 className="font-display font-bold text-[2.2rem] sm:text-[2.6rem] leading-[1.08] tracking-[-0.025em]">Where to focus, by sector.</h2>
            <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[460px]`}>A starting materiality view drawn from the company&apos;s sector, so the conversation begins with the topics that matter most.</p>
            <div className="mt-6"><MaterialityPanel /></div>
          </div>
          <div>
            <h2 className="font-display font-bold text-[2.2rem] sm:text-[2.6rem] leading-[1.08] tracking-[-0.025em]">One disclosure, mapped everywhere.</h2>
            <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[460px]`}>Each BRSR data point is linked to its equivalent in GRI, TCFD, IFRS S2 and TNFD, plus the ratings that matter to investors.</p>
            <div className="mt-6"><AlignmentPanel /></div>
          </div>
        </div>
      </section>

      {/* ── Feature: Calculators ─────────────────────────────────────────── */}
      <FeatureRow id="calculators" band eyebrow="Calculators & exports" title="The maths is done, and it's cited." panel={<GhgCalculatorPanel />}>
        <p className={`text-[16.5px] ${BODY} leading-relaxed`}>
          Built-in GHG, energy, water and Scope 3 screening calculators convert raw activity data into BRSR-ready figures, using CEA and IPCC factors with the version noted on every line.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink bg-white border border-line px-3.5 py-2 rounded-lg">Export CSV</span>
          <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-white bg-forest px-3.5 py-2 rounded-lg">Client-ready PDF brief</span>
        </div>
      </FeatureRow>

      {/* ── Mini tools (interactive, no report needed) ───────────────────── */}
      <MiniToolsSection onStart={onStart} />

      {/* ── AI section ───────────────────────────────────────────────────── */}
      <section className="bg-band border-t border-line" data-reveal>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-7 border-t border-ink-muted" />
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">On AI</p>
          </div>
          {/* Heading */}
          <h2 className="font-display font-bold text-[2.4rem] sm:text-[3rem] leading-[1.05] tracking-[-0.025em] max-w-[760px]" style={{ textWrap: "balance" }}>
            AI where it helps, <em>never where it can mislead.</em>
          </h2>
          <p className={`text-[16.5px] ${BODY} leading-relaxed mt-5 max-w-[560px]`}>
            What goes into a filed report has to be defensible. So AI does the explaining, the reading and the drafting, never the deciding, and never the inventing. Three places it helps:
          </p>
          {/* Three cards */}
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {[
              { t: "AI field guidance",       tag: "Free", b: "Every field explained from the public SEBI definition. Written once, shipped as static text, nothing about the client is ever sent anywhere." },
              { t: "Compliance importer",     tag: "Pro",  b: "Reads the client's entire document, whether 10 pages or 80, and pre-fills figures across all 108 BRSR fields. Every value shows the exact sentence it came from. It never invents a number." },
              { t: "Grounded narrative draft", tag: "Pro", b: "Turns the numbers you collected into review-ready prose. Every figure traces back to its source; gaps are flagged, not guessed." },
            ].map((p) => (
              <div key={p.t} className="bg-white rounded-2xl border border-line shadow-elev-1 p-6 flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-ink-muted" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M8 1.5l1.39 2.82 3.11.45-2.25 2.19.53 3.09L8 8.5l-2.78 1.55.53-3.09L3.5 4.77l3.11-.45z" />
                    </svg>
                  </div>
                  <span className={`text-[12px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                    p.tag === "Free"
                      ? "bg-[#C8E64A] text-forest"
                      : "bg-forest text-white"
                  }`}>{p.tag}</span>
                </div>
                <h3 className="text-[17px] font-bold text-ink">{p.t}</h3>
                <p className={`text-[14.5px] leading-relaxed mt-2 flex-1 ${p.tag === "Free" ? BODY : "text-[#2A5C40]"}`}>{p.b}</p>
              </div>
            ))}
          </div>
          {/* Closing cite line */}
          <p className={`text-[13.5px] ${BODY} leading-relaxed mt-8 max-w-[620px] border-t border-line pt-6`}>
            Everything stays cited, each disclosure links to SEBI, ICAI, CEA or IPCC with the version noted. You can defend every line.
          </p>
        </div>
      </section>

      {/* ── Collect (paid tier) ──────────────────────────────────────────── */}
      <section id="collect" className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.12em] text-[#C2432A] bg-[#FDEBE7] border border-[#F8CFC5] rounded px-2 py-1">Collect · paid tier</span>
          <h2 className="font-display font-bold text-[2.4rem] sm:text-[2.9rem] leading-[1.06] tracking-[-0.025em] mt-4">Chase the data without chasing people.</h2>
          <p className={`text-[16.5px] ${BODY} leading-relaxed mt-5 max-w-[470px]`}>
            When the job moves from preparing to collecting, Collect requests BRSR data from the team that holds each number, with branded emails and automatic reminders. They submit through a no-login form with evidence attached, emissions are calculated with cited factors, and an AI draft turns the result into review-ready narrative.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              "Per-client workspace: readiness %, data view, emissions, assurance and draft in one place",
              "Branded request emails & auto-reminders",
              "No-login submission with evidence attachments",
              "Emissions calculated with attributed factors",
              "Assurance-ready evidence trail, every figure traced to its owner and source",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[15px] text-ink"><Check />{f}</li>
            ))}
          </ul>
          <a
            href={REQUEST_ACCESS_URL}
            className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable mt-7"
          >
            Request Pro access <IcoArrow />
          </a>
          <p className="text-[13px] text-ink-faint mt-3 max-w-[440px]">The readiness tool stays free and needs no login. Collect is the paid tier; we onboard you on request.</p>
        </div>
        <CollectPanel />
      </section>

      {/* ── Free vs Pro ──────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-band border-t border-line">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20">
          <h2 className="font-display font-bold text-[2.4rem] sm:text-[3rem] leading-[1.06] tracking-[-0.025em]" style={{ textWrap: "balance" }}>
            Free prepares the report. Pro runs the whole job.
          </h2>
          <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[600px]`}>
            The readiness tool is genuinely free, on your device. Pro is the workspace that does the work: collecting the data, the AI that reads and drafts, the assurance trail, and the tools to win and price the engagement.
          </p>
          <TierCards onStart={onStart} />
        </div>
      </section>

      {/* ── Saaksh Pro grid ──────────────────────────────────────────────── */}
      <section id="pro" className="bg-white border-t border-line">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">Saaksh Pro</p>
          <h2 className="font-display font-bold text-[2.4rem] sm:text-[3rem] leading-[1.06] tracking-[-0.025em] mt-3" style={{ textWrap: "balance" }}>
            The workspace for the whole engagement.
          </h2>
          <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[620px]`}>
            The free tool prepares the report. Pro does the work: winning and pricing the engagement, collecting the data, computing and drafting, reporting across frameworks.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {[
              { name: "Collect", status: "live" as const, flagship: true, desc: "Chase BRSR data from the client's team with branded emails, auto-reminders, and no-login submission with evidence." },
              { name: "Compliance importer", status: "live" as const, ai: true, tint: true, desc: "Drop in last year's BRSR, an annual report, or any client document. AI reads every page and distributes figures across all 108 fields, each with its source line." },
              { name: "Cross-framework export", status: "live" as const, desc: "Download the full BRSR to GRI to TCFD to IFRS to TNFD mapping (plus MSCI & DJSI) as a spreadsheet, collect once, report many." },
              { name: "Proposal & fee builder", status: "live" as const, desc: "Turn a scope into a client-ready proposal and a transparent fee estimate, built from your own rates." },
              { name: "Multi-client workspace", status: "live" as const, desc: "Every client's engagement in one place: a cross-client overview plus a full per-client workspace with readiness, data, emissions, assurance and draft tabs." },
              { name: "Consultant network", status: "future" as const, desc: "Get matched with the companies that need a BRSR consultant. Be found, not just searching." },
            ].map((p) => (
              <ProPillar key={p.name} name={p.name} status={p.status} desc={p.desc} flagship={"flagship" in p ? p.flagship : undefined} ai={"ai" in p ? p.ai : undefined} tint={"tint" in p ? p.tint : undefined} />
            ))}
          </div>
          <a href={REQUEST_ACCESS_URL} className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable mt-8">
            Request Pro access <IcoArrow />
          </a>
          <p className="text-[13px] text-ink-faint mt-3">Early access, priced per engagement. Talk to us and we&apos;ll set you up.</p>
        </div>
      </section>

      {/* ── Pain/solution table (after Pro, for those who want the full picture) */}
      <PainTable />

      {/* ── Trust cards ──────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-line">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            {TRUST_CARDS.map((c) => (
              <div key={c.t} className={`rounded-2xl p-6 shadow-elev-1 ${c.card}`}>
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.chip}`}>
                  <svg className={`w-5 h-5 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{c.glyph}</svg>
                </span>
                <h3 className={`font-display font-bold text-[20px] mt-4 ${c.title}`}>{c.t}</h3>
                <p className={`text-[15px] leading-relaxed mt-2 ${c.body}`}>{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ───────────────────────────────────────────────────── */}
      <section className="bg-band border-y border-line">
        <div data-reveal className="max-w-[1280px] mx-auto px-5 sm:px-8 py-16">
          <p className="font-display font-bold text-center text-[1.9rem] sm:text-[2.4rem] leading-[1.18] tracking-[-0.025em] text-ink max-w-[660px] mx-auto" style={{ textWrap: "balance" }}>
            The first week of BRSR work, done in minutes. Gap-analysed, cited, and ready to send.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {[
              { n: "108", l: "BRSR fields" },
              { n: "9", l: "NGRBC principles" },
              { n: "68", l: "framework mappings" },
              { n: "0", l: "records stored" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="font-display font-bold text-[3rem] sm:text-[3.4rem] leading-none text-forest">{s.n}</p>
                <p className="font-mono text-[12px] uppercase tracking-wide text-ink-faint mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── In good company ──────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[0.82fr_1fr] items-stretch rounded-3xl overflow-hidden border border-line shadow-elev-1 bg-gradient-to-br from-brand-50 via-white to-ember-bg/60">
            <div className="relative min-h-[260px] lg:min-h-[440px] order-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/product/consultant.jpg"
                alt="An independent ESG consultant in India working through a BRSR readiness report with a client."
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </div>
            <div className="order-2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              <h2 className="font-display font-bold text-[2.2rem] sm:text-[2.7rem] leading-[1.06] tracking-[-0.025em]" style={{ textWrap: "balance" }}>
                Used by <span className="text-brand-700">75+ consultants</span>, and counting.
              </h2>
              <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[480px]`}>
                Independent ESG consultants across India use Saaksh to turn the first week of a BRSR engagement, the scramble of scattered data, emission maths and frameworks, into a cited plan they can send the same day.
              </p>
              <div className="mt-7">
                <button onClick={onStart} className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable shadow-sm">
                  Start a free report <IcoArrow />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-forest text-white glow-dark">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="font-display font-bold text-[2.6rem] sm:text-[3.4rem] leading-[1.05] tracking-[-0.025em]" style={{ textWrap: "balance" }}>
            Take the work out of your next BRSR report.
          </h2>
          <button onClick={onStart} className="inline-flex items-center gap-2 bg-brand-500 text-forest text-[16px] font-semibold px-6 py-3.5 rounded-xl hover:bg-brand-400 transition-colors pressable mt-8">
            Start a free report <IcoArrow />
          </button>
          <p className="font-mono text-[12px] text-[#9FB6AC] mt-5">No login · Client data never leaves your browser · Cited to SEBI &amp; ICAI</p>
        </div>
      </section>

      <Footer onStart={onStart} scrollTo={scrollTo} />
    </div>
  );
}
