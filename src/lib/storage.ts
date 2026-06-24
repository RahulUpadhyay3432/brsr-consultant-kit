// Tiny localStorage helper — SSR-safe and failure-tolerant. Used to persist the
// consultant's in-progress work (the generated report + checklist state) so a
// refresh or accidental close doesn't lose it. Everything stays on the device.

import type { IntakeFormData } from "@/lib/types";

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
  // Whether the first-run "Start here" walkthrough has been dismissed. Persists
  // across reports (it's a one-time intro), so it is NOT cleared on "New report".
  walkthroughSeen: "walkthrough.seen",
} as const;

// ── The saved intake form is the source of truth for the report ──────────────
// The report itself isn't stored; it's regenerated from the form (see the /report
// route). These helpers are shared by the landing / form / report routes.

// The consultant's last intake answers, or null if none/malformed.
export function loadSavedForm(): IntakeFormData | null {
  try {
    return loadJSON<IntakeFormData | null>(STORAGE_KEYS.form, null);
  } catch {
    removeKey(STORAGE_KEYS.form);
    removeKey(STORAGE_KEYS.checklist);
    return null;
  }
}

export function saveForm(form: IntakeFormData): void {
  saveJSON(STORAGE_KEYS.form, form);
}

// "New report" reset — clears the form, checklist state and materiality shortlist.
// (The one-time walkthrough flag is intentionally kept.)
export function clearReportSession(): void {
  removeKey(STORAGE_KEYS.form);
  removeKey(STORAGE_KEYS.checklist);
  removeKey(STORAGE_KEYS.materiality);
}
