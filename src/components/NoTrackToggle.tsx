"use client";
import { useEffect, useState } from "react";
import { getConsent, setConsent, type Consent } from "@/lib/consent";

// The interactive half of /notrack. Landing on the page with ?notrack=1 has
// already written the opt-out (getConsent applies the URL flag on its first
// read), so this component's job is to SHOW the resulting state — an opt-out you
// cannot see is an opt-out you cannot trust — and let you flip it either way.
export function NoTrackToggle() {
  const [consent, setLocal] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Arriving here IS the request to be excluded — the link is the whole
    // interface, so landing on it applies the opt-out rather than offering it.
    // Runs once per page load, which leaves the undo button below usable.
    if (getConsent()?.analytics !== false) setConsent(false);
    setLocal(getConsent());
    setReady(true);
  }, []);

  function choose(analytics: boolean) {
    setConsent(analytics);
    setLocal(getConsent());
  }

  // Until localStorage has been read, claim nothing.
  if (!ready) {
    return (
      <div className="rounded-xl border border-line bg-surface p-5 text-[15px] text-ink-muted">
        Checking this device…
      </div>
    );
  }

  // After the effect above, the device is excluded unless the visitor has just
  // pressed "start counting again" on this page.
  const excluded = consent?.analytics === false;

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-5 ${
          excluded ? "border-emerald-200 bg-emerald-50/60" : "border-line bg-surface"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full ${
              excluded ? "bg-emerald-600" : "bg-amber-500"
            }`}
          />
          <div>
            <p className="text-[17px] font-semibold text-ink leading-snug">
              {excluded
                ? "Done — this device is excluded from analytics."
                : "This device is being counted again."}
            </p>
            <p className="mt-1.5 text-[14.5px] text-ink-body leading-relaxed">
              {excluded
                ? "Google Analytics, Mixpanel and Vercel Analytics will not load in this browser. The setting is saved here, so it survives closing the tab — there is nothing else to do."
                : "Your visits will be included in the usage numbers from now on. Reloading this page will exclude the device again."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {!excluded && (
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-[14.5px] font-semibold text-white transition hover:bg-brand-700"
          >
            Exclude this device
          </button>
        )}
        {excluded && (
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-lg border border-line bg-surface px-4 py-2.5 text-[14.5px] font-semibold text-ink transition hover:bg-page"
          >
            Start counting this device again
          </button>
        )}
      </div>

      <p className="text-[13.5px] text-ink-muted leading-relaxed">
        The choice is stored in this browser only. Open the same link in another
        browser, another profile, or a private window to exclude those too — and
        note that clearing site data resets it.
      </p>
    </div>
  );
}
