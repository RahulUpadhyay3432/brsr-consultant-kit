// Best-effort, in-memory global rate cap for founder-notification emails sent
// from the PUBLIC marketing forms (see leads.ts). It is scoped to a warm
// serverless instance (not distributed), so it's a backstop against a burst from
// a single source, not a hard guarantee, the per-email DB dedupe in leads.ts is
// the primary control. No dependency, no external store.

const WINDOW_MS = 10 * 60 * 1000; // rolling 10 minutes
const MAX_IN_WINDOW = 30;         // founder emails allowed per window

let hits: number[] = [];

// Returns true if a founder email may be sent now, and records the send. Once
// MAX_IN_WINDOW sends have happened inside the window, further calls return false
// until older hits age out.
export function allowFounderEmail(): boolean {
  const now = Date.now();
  hits = hits.filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_IN_WINDOW) return false;
  hits.push(now);
  return true;
}

// Test-only reset so unit tests start from a clean window.
export function __resetFounderEmailWindow(): void {
  hits = [];
}
