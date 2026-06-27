"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Campaign } from "@/lib/datarequest/types";

// The per-client workspace sections, deep-linked via ?view= so each (incl. Readiness)
// is its own entry in the sidebar and reachable directly.
const SECTIONS: { key: string; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "autofill", label: "Auto-fill" },
  { key: "readiness", label: "Readiness" },
  { key: "owners", label: "Owners" },
  { key: "data", label: "Data" },
  { key: "emissions", label: "Emissions" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{children}</p>
  );
}

function Item({ href, active, icon, badge, children, onClick, depth = 0 }: {
  href: string; active: boolean; icon?: React.ReactNode; badge?: React.ReactNode;
  children: React.ReactNode; onClick?: () => void; depth?: number;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex items-center gap-2.5 w-full py-[7px] rounded-lg text-[13.5px] font-medium
        transition-colors pressable focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
        ${depth ? "pl-8 pr-2.5" : "px-2.5"}
        ${active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-brand-500" />}
      {icon && <span className={`flex-shrink-0 ${active ? "text-brand-500" : "text-white/55 group-hover:text-white/80"}`}>{icon}</span>}
      <span className="flex-1 text-left truncate" title={typeof children === "string" ? children : undefined}>{children}</span>
      {badge}
    </Link>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const path = usePathname();
  const searchParams = useSearchParams();
  const items = campaign.contacts.flatMap((c) => c.items);
  const received = items.filter((i) => i.status === "received").length;
  const onThis = path.startsWith(`/requests/${campaign.id}`);
  const [open, setOpen] = useState(onThis);
  const expanded = open || onThis;
  const rowActive = path === `/requests/${campaign.id}`;
  const onDraft = path === `/requests/${campaign.id}/draft`;
  const currentView = searchParams.get("view") || "overview";

  return (
    <div>
      <div
        className={`group relative flex items-center gap-1.5 w-full pl-1.5 pr-2 py-[7px] rounded-lg text-[13px] font-medium
          transition-colors ${rowActive ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
      >
        {rowActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-brand-500" />}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${campaign.clientName}` : `Expand ${campaign.clientName}`}
          className="flex-shrink-0 p-0.5 rounded text-white/50 hover:text-white/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>
            <path d="M4.5 3l3 3-3 3" />
          </svg>
        </button>
        <Link
          href={`/requests/${campaign.id}`}
          className="flex-1 min-w-0 truncate text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
          title={campaign.clientName}
        >
          {campaign.clientName}
        </Link>
        {items.length > 0 && (
          <span className="flex-shrink-0 text-[10px] font-mono tabular-nums text-white/55 bg-white/10 rounded px-1.5 py-px leading-none"
            title={`${received} of ${items.length} fields received`}>
            {received}/{items.length}
          </span>
        )}
      </div>
      {expanded && (
        <div className="mt-0.5 space-y-0.5">
          {SECTIONS.map((s) => (
            <Item key={s.key} href={`/requests/${campaign.id}?view=${s.key}`} active={rowActive && currentView === s.key} depth={1}>{s.label}</Item>
          ))}
          <Item href={`/requests/${campaign.id}/draft`} active={onDraft} depth={1}>Draft</Item>
        </div>
      )}
    </div>
  );
}

export default function CollectNav({ campaigns = [] }: { campaigns?: Campaign[] }) {
  const path = usePathname();
  const dashboardActive = path === "/requests";
  const newActive = path === "/requests/new";
  const proposalActive = path.startsWith("/requests/proposal");
  const cbamActive = path.startsWith("/requests/cbam");
  const profileActive = path.startsWith("/requests/profile");

  return (
    <nav className="flex-1 overflow-y-auto px-3 pt-4 space-y-5">
      {/* Ask Saaksh, opens the global help panel */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent("saaksh:open-help"))}
        className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13.5px] font-semibold
          bg-white/10 text-white hover:bg-white/15 transition-colors pressable
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <span className="text-brand-500 flex-shrink-0"><IconSpark /></span>
        Ask Saaksh
      </button>

      <div>
        <SectionLabel>Collections</SectionLabel>
        <div className="space-y-0.5">
          <Item href="/requests" active={dashboardActive} icon={<IconGrid />}>Dashboard</Item>
          <Item href="/requests/new" active={newActive} icon={<IconPlus />}>New collection</Item>
          {campaigns.length === 0 ? (
            <p className="px-2.5 py-1.5 text-[12px] text-white/45 leading-snug">
              No collections yet. Start your first one above.
            </p>
          ) : (
            campaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)
          )}
        </div>
      </div>

      <div>
        <SectionLabel>Win work</SectionLabel>
        <div className="space-y-0.5">
          <Item href="/requests/proposal" active={proposalActive} icon={<IconDoc />}>Proposals</Item>
        </div>
      </div>

      <div>
        <SectionLabel>Beyond BRSR</SectionLabel>
        <div className="space-y-0.5">
          <Item href="/requests/cbam" active={cbamActive} icon={<IconGlobe />}>CBAM</Item>
        </div>
      </div>

      <div>
        <SectionLabel>Account</SectionLabel>
        <div className="space-y-0.5">
          <Item href="/requests/profile" active={profileActive} icon={<IconUser />}>Profile</Item>
        </div>
      </div>

      <div>
        <SectionLabel>Tool</SectionLabel>
        <div className="space-y-0.5">
          <Item href="/" active={false} icon={<IconBack />}>Free readiness tool</Item>
        </div>
      </div>
    </nav>
  );
}

function IconSpark() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 1.5l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6L2.5 6.5l3.6-1.4z" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M7.5 3v9M3 7.5h9" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 1.5h4.5L11.5 4.5v9H4z" /><path d="M8.5 1.5v3h3M5.5 7.5h4M5.5 9.5h4" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7.5" r="6" /><path d="M1.5 7.5h12M7.5 1.5c2 2 2 10 0 12M7.5 1.5c-2 2-2 10 0 12" />
    </svg>
  );
}
function IconBack() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3.5L4 7.5l4 4M4 7.5h7" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="4.5" r="2.5" /><path d="M2.5 13c0-2.5 2.2-4 5-4s5 1.5 5 4" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" /><rect x="8.5" y="1.5" width="5" height="5" rx="1" /><rect x="1.5" y="8.5" width="5" height="5" rx="1" /><rect x="8.5" y="8.5" width="5" height="5" rx="1" />
    </svg>
  );
}
