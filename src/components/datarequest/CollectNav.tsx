"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Item({ href, active, icon, children }: {
  href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[13.5px] font-medium
        transition-colors pressable ${active ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100/70"}`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-brand-600" />}
      <span className={`flex-shrink-0 ${active ? "text-brand-700" : "text-stone-400 group-hover:text-stone-500"}`}>{icon}</span>
      <span className="flex-1 text-left">{children}</span>
    </Link>
  );
}

export default function CollectNav() {
  const path = usePathname();
  const proposalActive = path.startsWith("/requests/proposal");
  const newActive = path === "/requests/new";
  const collectionsActive = !proposalActive && (path === "/requests" || (path.startsWith("/requests/") && !newActive));

  return (
    <nav className="flex-1 overflow-y-auto px-3 pt-4 space-y-5">
      <div>
        <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">Collect</p>
        <div className="space-y-0.5">
          <Item href="/requests" active={collectionsActive} icon={<IconList />}>Collections</Item>
          <Item href="/requests/new" active={newActive} icon={<IconPlus />}>New collection</Item>
        </div>
      </div>
      <div>
        <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">Win work</p>
        <div className="space-y-0.5">
          <Item href="/requests/proposal" active={proposalActive} icon={<IconDoc />}>Proposal builder</Item>
        </div>
      </div>
      <div>
        <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">Tool</p>
        <div className="space-y-0.5">
          <Item href="/" active={false} icon={<IconBack />}>Readiness report</Item>
        </div>
      </div>
    </nav>
  );
}

function IconList() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h8M5 7.5h8M5 11h8" /><circle cx="2.5" cy="4" r="0.6" fill="currentColor" /><circle cx="2.5" cy="7.5" r="0.6" fill="currentColor" /><circle cx="2.5" cy="11" r="0.6" fill="currentColor" />
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
function IconBack() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3.5L4 7.5l4 4M4 7.5h7" />
    </svg>
  );
}
