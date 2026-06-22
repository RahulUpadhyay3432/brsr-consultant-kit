// Tiny localStorage helper — SSR-safe and failure-tolerant. Used to persist the
// consultant's in-progress work (the generated report + checklist state) so a
// refresh or accidental close doesn't lose it. Everything stays on the device.

const PREFIX = "brsr.v1.";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota/serialization errors are non-fatal — persistence is best-effort.
  }
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

// Stable storage keys for the active work session.
export const STORAGE_KEYS = {
  form: "session.form",
  checklist: "session.checklist",
  materiality: "session.materiality",
} as const;

// Per-tab "active work session" flag (sessionStorage, not localStorage). It lets
// us show the marketing landing page on every fresh visit while still restoring
// the report on a same-tab refresh, so the consultant doesn't lose their place.
// A new tab / a later visit has no flag → landing page.
const ACTIVE_KEY = PREFIX + "active";

function hasSession(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function markSessionActive(): void {
  if (!hasSession()) return;
  try { window.sessionStorage.setItem(ACTIVE_KEY, "1"); } catch { /* best-effort */ }
}

export function clearSessionActive(): void {
  if (!hasSession()) return;
  try { window.sessionStorage.removeItem(ACTIVE_KEY); } catch { /* ignore */ }
}

export function isSessionActive(): boolean {
  if (!hasSession()) return false;
  try { return window.sessionStorage.getItem(ACTIVE_KEY) === "1"; } catch { return false; }
}
