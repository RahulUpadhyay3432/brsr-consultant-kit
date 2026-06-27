// Client-only Mixpanel helper. SSR-safe: all calls are no-ops on the server.
// Import `track` anywhere in client components to fire an event.

import type { Dict } from "mixpanel-browser";

// Token is public (goes in the browser bundle) — NEXT_PUBLIC_ prefix is intentional.
export const MIXPANEL_TOKEN = "7f380e0a4f06fa4020b708b7349e7afa";

let initialized = false;

export async function initMixpanel() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;
  const mp = (await import("mixpanel-browser")).default;
  mp.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
    persistence: "localStorage",
  });
}

export function track(event: string, props?: Dict) {
  if (typeof window === "undefined") return;
  import("mixpanel-browser").then(({ default: mp }) => {
    try { mp.track(event, props); } catch { /* best-effort */ }
  });
}
