// Client-only Mixpanel helper. SSR-safe: all calls are no-ops on the server.
// initMixpanel() must be called once (MixpanelProvider does this). track() waits
// for init to complete even if called before the provider mounts.

import type { Mixpanel, Dict } from "mixpanel-browser";
import { analyticsAllowed } from "./consent";

export const MIXPANEL_TOKEN = "7f380e0a4f06fa4020b708b7349e7afa";

let mp: Mixpanel | null = null;
let initPromise: Promise<void> | null = null;

// Privacy-by-design (DPDP + the free tool's "client data never leaves your browser"
// promise): session replay and autocapture are OFF. We send only the handful of
// explicit track() events below, each carrying non-PII aggregate props (industry,
// sector, counts), never client values. Replay/autocapture can be selectively
// re-enabled on authenticated Pro surfaces later if ever needed.
export function initMixpanel(superProps?: Dict): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  // Hard consent gate: never initialise (which would set cookies / start the SDK)
  // unless the user opted in. Guards stray track() calls too.
  if (!analyticsAllowed()) return Promise.resolve();
  if (initPromise) {
    // Already initialised; just update super props if new ones come in.
    if (superProps && mp) mp.register(superProps);
    return initPromise;
  }
  initPromise = import("mixpanel-browser").then(({ default: mixpanel }) => {
    mixpanel.init(MIXPANEL_TOKEN, {
      autocapture: false,
      record_sessions_percent: 0,
      persistence: "localStorage",
    });
    if (superProps) mixpanel.register(superProps);
    mp = mixpanel;
  });
  return initPromise;
}

// Call after login to link events to a named profile. For Saaksh Pro (shared
// passcode, single consultant), a stable string id is enough for now.
export function identifyUser(id: string, profile?: Dict) {
  if (typeof window === "undefined" || !analyticsAllowed()) return;
  (initPromise ?? initMixpanel()).then(() => {
    try {
      mp?.identify(id);
      if (profile) mp?.people.set(profile);
    } catch { /* best-effort */ }
  });
}

export function track(event: string, props?: Dict) {
  if (typeof window === "undefined" || !analyticsAllowed()) return;
  (initPromise ?? initMixpanel()).then(() => {
    try { mp?.track(event, props); } catch { /* best-effort */ }
  });
}
