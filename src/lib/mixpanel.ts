// Client-only Mixpanel helper. SSR-safe: all calls are no-ops on the server.
// initMixpanel() must be called once (MixpanelProvider does this). track() waits
// for init to complete even if called before the provider mounts.

import type { Mixpanel, Dict } from "mixpanel-browser";

export const MIXPANEL_TOKEN = "7f380e0a4f06fa4020b708b7349e7afa";

let mp: Mixpanel | null = null;
let initPromise: Promise<void> | null = null;

export function initMixpanel(superProps?: Dict): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (initPromise) {
    // Already initialised; just update super props if new ones come in.
    if (superProps && mp) mp.register(superProps);
    return initPromise;
  }
  initPromise = import("mixpanel-browser").then(({ default: mixpanel }) => {
    mixpanel.init(MIXPANEL_TOKEN, {
      autocapture: true,
      record_sessions_percent: 100,
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
  if (typeof window === "undefined") return;
  (initPromise ?? initMixpanel()).then(() => {
    try {
      mp?.identify(id);
      if (profile) mp?.people.set(profile);
    } catch { /* best-effort */ }
  });
}

export function track(event: string, props?: Dict) {
  if (typeof window === "undefined") return;
  (initPromise ?? initMixpanel()).then(() => {
    try { mp?.track(event, props); } catch { /* best-effort */ }
  });
}
