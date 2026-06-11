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
