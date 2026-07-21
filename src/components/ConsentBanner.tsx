"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getConsent, setConsent, CONSENT_OPEN_EVENT } from "@/lib/consent";

// DPDP opt-in banner. Shows on first visit (no stored choice) and whenever the
// user re-opens "Cookie settings". Accept enables product analytics; Decline keeps
// everything off. The free tool's report generation is unaffected either way —
// client data is processed on-device and never uploaded.
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (getConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  // The Brief is a full-screen app surface; its own bottom nav would clash with the
  // banner. Consent is captured on the rest of the site instead.
  if (!open || pathname?.startsWith("/brief")) return null;

  function choose(analytics: boolean) {
    setConsent(analytics);
    setOpen(false);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-[420px] z-[60] anim-up-md">
      <div className="bg-white rounded-xl border border-stone-200 shadow-[0_8px_30px_rgba(15,30,51,0.12)] p-4">
        <p className="text-[14px] font-semibold text-stone-900">A note on analytics</p>
        <p className="text-[13px] text-stone-600 mt-1.5 leading-relaxed">
          We use privacy-light product analytics to see which features help and improve Saaksh.
          Your clients&apos; data is never part of this, the free tool runs entirely in your browser.
          You can decline and everything still works.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => choose(true)}
            className="inline-flex items-center text-[13px] font-semibold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-2 rounded-lg transition-colors pressable"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => choose(false)}
            className="inline-flex items-center text-[13px] font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 px-3.5 py-2 rounded-lg transition-colors pressable"
          >
            Decline
          </button>
          <Link
            href="/privacy"
            className="ml-auto text-[12.5px] text-stone-500 hover:text-stone-700 underline decoration-stone-300 hover:decoration-stone-500 transition-colors"
          >
            Privacy policy
          </Link>
        </div>
      </div>
    </div>
  );
}
