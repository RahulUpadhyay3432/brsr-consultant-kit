"use client";

// Mobile navigation (md:hidden). The desktop nav is hover-dropdown-heavy and
// hidden on small screens, so this hamburger opens a simple, scrollable sheet of
// flat links to every destination. Shared by SiteHeader and the homepage Header.

import { useState } from "react";
import Link from "next/link";
import { REQUEST_ACCESS_URL } from "@/lib/links";
import { FILING_AUDIT_ITEMS, FREE_NAV_ITEMS } from "@/lib/nav-items";

const PAGES: { label: string; href: string }[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Latest", href: "/latest" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <p className="px-4 pb-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{title}</p>
      {children}
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const linkCls = "block px-4 py-2.5 text-[14px] font-medium text-ink-body hover:bg-band rounded-lg transition-colors";

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-ink hover:bg-band transition-colors"
      >
        {open ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop closes the sheet (sits below the sticky header + the sheet) */}
          <button aria-hidden="true" tabIndex={-1} onClick={close} className="fixed inset-0 z-40 bg-black/20" />
          {/* Sheet */}
          <div className="dropdown-in absolute right-3 top-full mt-2 z-50 w-[280px] max-h-[75vh] overflow-y-auto bg-white border border-line rounded-2xl shadow-elev-2 py-2">
            <Section title="Explore">
              {PAGES.map((p) => (
                <Link key={p.href} href={p.href} onClick={close} className={linkCls}>{p.label}</Link>
              ))}
            </Section>

            <div className="border-t border-line-soft" />
            <Section title="Filing & audit tools">
              {FILING_AUDIT_ITEMS.map((it) => (
                <Link key={it.href} href={it.href} onClick={close} className={linkCls}>{it.label}</Link>
              ))}
            </Section>

            <div className="border-t border-line-soft" />
            <Section title="Free tools">
              {FREE_NAV_ITEMS.map((it) => (
                <Link key={it.href + it.label} href={it.href} onClick={close} className={linkCls}>{it.label}</Link>
              ))}
            </Section>

            <div className="border-t border-line-soft px-3 pt-2.5 pb-1 space-y-2">
              <a href={REQUEST_ACCESS_URL} onClick={close} className="block text-center rounded-lg border border-line px-3 py-2.5 text-[14px] font-semibold text-ink hover:bg-band transition-colors">
                Request Pro access
              </a>
              <Link href="/start" onClick={close} className="block text-center rounded-lg bg-forest text-white px-3 py-2.5 text-[14px] font-semibold hover:bg-forest-light transition-colors">
                Start free
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
