import Link from "next/link";
import CookieSettingsLink from "./CookieSettingsLink";
import { SiteHeader } from "./SiteHeader";

const NAV: { href: string; label: string }[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/dpa", label: "Data processing" },
  { href: "/security", label: "Security" },
  { href: "/methodology", label: "Methodology" },
  { href: "/status", label: "Status" },
];

// Shared chrome for the static trust/legal pages: the site header, a lit title
// band, a readable "document card" for the prose, and a cross-linking footer.
// Server component. (Methodology has its own bespoke page; this covers the rest.)
export default function LegalPage({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader />

      {/* Title band */}
      <header className="relative overflow-hidden border-b border-line-soft bg-band glow-soft">
        <div className="mx-auto w-full max-w-[880px] px-5 sm:px-8 pt-14 pb-11">
          <h1 className="font-editorial font-semibold text-ink text-[2.2rem] sm:text-[2.7rem] leading-[1.08] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[16px] text-ink-muted mt-3.5 leading-relaxed max-w-[66ch]">{subtitle}</p>
          )}
          {updated && (
            <p className="text-[12.5px] text-ink-faint mt-4 font-mono">Last updated: {updated}</p>
          )}
        </div>
      </header>

      {/* Content — a readable document card */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[880px] px-5 sm:px-8 py-12">
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-10 shadow-elev-1 space-y-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer — legal cross-nav (anonymous builder line) */}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto max-w-[880px] px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-[13px] text-ink-muted hover:text-ink transition-colors">
                {n.label}
              </Link>
            ))}
            <CookieSettingsLink className="text-[13px] text-ink-muted hover:text-ink transition-colors" />
          </div>
          <p className="text-[12.5px] text-ink-faint mt-4 leading-relaxed">
            Saaksh is built by a group of sustainability and compliance experts. Client data in the free tool is
            processed on your device and never uploaded.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Small presentational helpers the legal pages compose with.
export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="font-editorial font-semibold text-ink text-[1.4rem] leading-tight tracking-[-0.01em]">{heading}</h2>
      <div className="text-[15px] text-ink-body leading-[1.7] space-y-3">{children}</div>
    </section>
  );
}

export function DraftNotice() {
  return (
    <div className="bg-gold-bg border border-[#EAD8B0] rounded-xl px-4 py-3">
      <p className="text-[13px] text-gold-dark leading-relaxed">
        <strong>Working draft.</strong> This document is provided in good faith and is being finalised with legal
        review. If anything here conflicts with applicable law, the law prevails.
      </p>
    </div>
  );
}
