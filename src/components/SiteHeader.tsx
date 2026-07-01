"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { SaakshMark } from "@/components/SaakshMark";
import { REQUEST_ACCESS_URL } from "@/lib/links";
import { FREE_NAV_ITEMS, PRO_NAV_ITEMS, FILING_AUDIT_ITEMS } from "@/lib/nav-items";

function IcoChevronDown() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IcoArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-ink-faint group-hover:text-ink-muted transition-colors flex-shrink-0">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SiteHeader({ active: _active }: { active?: string } = {}) {
  const [openMenu, setOpenMenu] = useState<"filing" | "free" | "pro" | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = (menu: "filing" | "free" | "pro") => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };
  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  return (
    <header className="sticky top-0 z-50 bg-page/90 backdrop-blur-md border-b border-line">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-[70px] flex items-center gap-2">
        {/* Logo */}
        <Link href="/" aria-label="Saaksh home" className="flex items-center gap-2.5 flex-shrink-0 mr-3 rounded-lg hover:opacity-90 transition-opacity">
          <SaakshMark size={32} />
          <span className="font-display font-bold text-[19px] text-ink">Saaksh</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {/* Filing & audit tools dropdown (leading, consultant-facing) */}
          <div className="relative" onMouseEnter={() => openDropdown("filing")} onMouseLeave={closeDropdown}>
            <button className={`flex items-center gap-1 text-[15px] font-medium px-3 py-2 rounded-lg transition-colors ${openMenu === "filing" ? "text-ink bg-band" : "text-ink-muted hover:text-ink hover:bg-band"}`}>
              Filing &amp; audit tools <IcoChevronDown />
            </button>
            <div className={`absolute top-full left-0 mt-1 w-[560px] bg-white border border-line rounded-2xl shadow-elev-2 p-2 grid grid-cols-2 gap-0.5 transition-all duration-150 origin-top-left ${openMenu === "filing" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
              {FILING_AUDIT_ITEMS.map((item) => (
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
          <div className="relative" onMouseEnter={() => openDropdown("free")} onMouseLeave={closeDropdown}>
            <button className={`flex items-center gap-1 text-[15px] font-medium px-3 py-2 rounded-lg transition-colors ${openMenu === "free" ? "text-ink bg-band" : "text-ink-muted hover:text-ink hover:bg-band"}`}>
              Tools <IcoChevronDown />
            </button>
            <div className={`absolute top-full left-0 mt-1 w-[600px] bg-white border border-line rounded-2xl shadow-elev-2 p-2 grid grid-cols-2 gap-0.5 transition-all duration-150 origin-top-left ${openMenu === "free" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
              {FREE_NAV_ITEMS.map((item) => (
                <Link key={item.label} href={item.href} className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-band transition-colors group">
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
                </Link>
              ))}
            </div>
          </div>

          {/* Pro dropdown */}
          <div className="relative" onMouseEnter={() => openDropdown("pro")} onMouseLeave={closeDropdown}>
            <button className={`flex items-center gap-1 text-[15px] font-medium px-3 py-2 rounded-lg transition-colors ${openMenu === "pro" ? "text-ink bg-band" : "text-ink-muted hover:text-ink hover:bg-band"}`}>
              Pro <IcoChevronDown />
            </button>
            <div className={`absolute top-full left-0 mt-1 w-[280px] bg-white border border-line rounded-2xl shadow-elev-2 p-1.5 transition-all duration-150 origin-top-left ${openMenu === "pro" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
              {PRO_NAV_ITEMS.map((item) => (
                <a key={item.label} href={item.href} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-band transition-colors group">
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

          <Link href="/#how" className="text-[15px] font-medium text-ink-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-band transition-colors">How it works</Link>
          <Link href="/blog" className="text-[15px] font-medium text-ink-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-band transition-colors">Blog</Link>
        </nav>

        {/* CTA */}
        <Link href="/start" className="ml-auto inline-flex items-center gap-2 bg-forest text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-forest-light transition-colors pressable">
          Start free
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
