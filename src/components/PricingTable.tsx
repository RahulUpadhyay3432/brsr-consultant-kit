"use client";

// Shared Free vs Pro tier cards. Used by the homepage (LandingPage passes an
// onStart callback so the Free CTA opens the intake form in place) and by the
// standalone /pricing route (no callback, so the Free CTA is a plain link to
// /start). One source of truth for the feature lists so they never drift.

import Link from "next/link";
import { REQUEST_ACCESS_URL } from "@/lib/links";

export const FREE_FEATURES = [
  "Gap-analysed action plan across all 108 BRSR fields",
  "GHG, energy, water & Scope 3 calculators, cited to CEA, IPCC & DEFRA",
  "GRI, TCFD, IFRS S1/S2, TNFD, MSCI & DJSI mapping, exportable as CSV",
  "CBAM & CCTS in-scope readiness check",
  "Templates, internal request emails & a who-owns-what map",
  "Engagement timeline generator (12 or 20-week plan)",
  "AI field guidance on every disclosure",
  "CSV export + client-ready PDF brief",
];

export const PRO_FEATURES = [
  "Chase data from every team with branded emails and auto-reminders",
  "No-login owner submission with evidence attached per field",
  "AI document auto-fill: reads your client’s reports across all 108 fields",
  "Emissions auto-computed and attributed to the person who submitted",
  "Assurance-readiness ledger: a data-ownership trail for BRSR Core",
  "Grounded AI narrative draft, ready to review and edit",
  "Proposal & fee builder: scope, price, and send",
  "Multi-client workspace with readiness, data, draft and assurance tabs",
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Check({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function TierCards({ onStart }: { onStart?: () => void }) {
  // Shared classes for the Free CTA (button on the homepage, link on /pricing).
  const freeCtaClass =
    "pressable mt-7 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white text-ink text-[15px] font-semibold py-3.5 hover:bg-ink hover:text-white transition-colors";

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
              <Check className="w-4 h-4 text-brand-500 shrink-0 mt-[2px]" />
              {f}
            </li>
          ))}
        </ul>
        {onStart ? (
          <button onClick={onStart} className={freeCtaClass}>
            Start free <Arrow />
          </button>
        ) : (
          <Link href="/start" className={freeCtaClass}>
            Start free <Arrow />
          </Link>
        )}
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
              <Check className="w-4 h-4 text-brand-400 shrink-0 mt-[2px]" />
              {f}
            </li>
          ))}
        </ul>
        <a
          href={REQUEST_ACCESS_URL}
          className="pressable relative mt-7 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 text-white text-[15px] font-semibold py-3.5 hover:bg-brand-400 transition-colors"
        >
          Request access <Arrow />
        </a>
        <p className="relative text-[12px] text-ondark-faint mt-3 text-center">Early access, manually onboarded. Talk to us first.</p>
      </div>
    </div>
  );
}
