"use client";
import { useEffect, useState } from "react";
import { getConsent, type Consent, CONSENT_CHANGE_EVENT } from "./consent";

// Reactive read of the analytics-consent choice. `ready` flips true once the
// client has read localStorage (so SSR/first paint don't assume a value).
export function useConsent(): { consent: Consent | null; ready: boolean } {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => {
      setConsent(getConsent());
      setReady(true);
    };
    read();
    window.addEventListener(CONSENT_CHANGE_EVENT, read);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, read);
  }, []);

  return { consent, ready };
}
