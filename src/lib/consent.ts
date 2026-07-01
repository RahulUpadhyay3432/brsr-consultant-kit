// DPDP-aware analytics consent. Single source of truth for whether the user has
// opted in to product analytics (Mixpanel events, GA4, Vercel Analytics). Nothing
// analytics-related runs until consent.analytics === true. SSR-safe: every reader
// no-ops on the server and returns null until the client has read localStorage.
//
// DPDP Act 2023 requires free, specific, informed, unbundled, opt-IN consent before
// processing, so the default is OFF and we never assume consent.

export interface Consent {
  analytics: boolean;
  ts: number; // epoch ms of the choice, for audit/expiry
}

const KEY = "saaksh_consent";
const CHANGE_EVENT = "saaksh-consent-change";
const OPEN_EVENT = "saaksh-consent-open";

// Returns the stored choice, or null if the user hasn't decided yet.
export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (typeof c?.analytics !== "boolean") return null;
    return c;
  } catch {
    return null;
  }
}

// True only when the user has explicitly opted in to analytics.
export function analyticsAllowed(): boolean {
  return getConsent()?.analytics === true;
}

// Persist the user's choice and notify listeners (banner + analytics gate react).
export function setConsent(analytics: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ analytics, ts: Date.now() } satisfies Consent));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

// Re-open the consent banner so the user can change their mind (wired to a
// "Cookie settings" footer link).
export function openConsentSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export const CONSENT_CHANGE_EVENT = CHANGE_EVENT;
export const CONSENT_OPEN_EVENT = OPEN_EVENT;
