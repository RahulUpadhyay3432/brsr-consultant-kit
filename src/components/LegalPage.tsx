import Link from "next/link";
import CookieSettingsLink from "./CookieSettingsLink";
import { SaakshMark } from "./SaakshMark";

const NAV: { href: string; label: string }[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/dpa", label: "Data processing" },
  { href: "/security", label: "Security" },
  { href: "/methodology", label: "Methodology" },
  { href: "/status", label: "Status" },
];

// Shared chrome for the static trust/legal pages: a slim header (logo → home), a
// readable prose container, and a cross-linking footer. Server component.
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
    <div className="min-h-screen bg-page text-stone-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="max-w-[820px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <SaakshMark size={26} />
            <span className="font-display text-[18px] text-stone-900">Saaksh</span>
          </Link>
          <Link href="/" className="text-[13px] font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Back to Saaksh
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <h1 className="font-display text-[30px] sm:text-[34px] font-bold text-stone-900 leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[15px] text-stone-600 mt-2 leading-relaxed max-w-[68ch]">{subtitle}</p>
          )}
          {updated && (
            <p className="text-[12.5px] text-stone-500 mt-3 font-mono">Last updated: {updated}</p>
          )}
          <div className="mt-8 space-y-6">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-[13px] text-stone-600 hover:text-stone-900 transition-colors">
                {n.label}
              </Link>
            ))}
            <CookieSettingsLink className="text-[13px] text-stone-600 hover:text-stone-900 transition-colors" />
          </div>
          <p className="text-[12.5px] text-stone-500 mt-4 leading-relaxed">
            Saaksh is built and operated by Rahul Upadhyay (
            <a href="mailto:rahulu626@gmail.com" className="underline decoration-stone-300 hover:decoration-stone-500">rahulu626@gmail.com</a>
            ). Client data in the free tool is processed on your device and never uploaded.
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
      <h2 className="text-[18px] font-bold text-stone-900">{heading}</h2>
      <div className="text-[14px] text-stone-700 leading-relaxed space-y-2.5">{children}</div>
    </section>
  );
}

export function DraftNotice() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <p className="text-[13px] text-amber-900 leading-relaxed">
        <strong>Working draft.</strong> This document is provided in good faith and is being
        finalised with legal review. If anything here conflicts with applicable law, the law
        prevails. Questions: <a href="mailto:rahulu626@gmail.com" className="underline">rahulu626@gmail.com</a>.
      </p>
    </div>
  );
}
