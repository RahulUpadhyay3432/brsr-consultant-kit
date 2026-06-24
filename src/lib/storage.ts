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

// ── Portable backup of the on-device session ─────────────────────────────────
// Work lives only in this browser, so we let the consultant download a small file
// of their session and re-import it on another browser/device (or as a safety
// net). Still 100% on-device — the file stays with them, nothing is uploaded.

export interface SessionBackup {
  app: "saaksh";
  kind: "session-backup";
  version: 1;
  savedAt: string;
  companyName: string;
  data: { form: unknown; checklist: unknown; materiality: unknown };
}

// Snapshot the current session (form + checklist + materiality). Null if nothing saved.
export function buildSessionBackup(): SessionBackup | null {
  const form = loadSavedForm();
  if (!form) return null;
  return {
    app: "saaksh",
    kind: "session-backup",
    version: 1,
    savedAt: new Date().toISOString(),
    companyName: form.companyName || "",
    data: {
      form,
      checklist: loadJSON(STORAGE_KEYS.checklist, null),
      materiality: loadJSON(STORAGE_KEYS.materiality, null),
    },
  };
}

// Validate a parsed backup and write it back into localStorage. Returns false for
// anything that isn't a Saaksh backup with a usable form (so a wrong file is a
// no-op, not a corrupted session).
export function restoreSessionBackup(parsed: unknown): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  const b = parsed as Partial<SessionBackup>;
  if (b.app !== "saaksh" || !b.data || typeof b.data !== "object") return false;
  const data = b.data as SessionBackup["data"];
  if (!data.form || typeof data.form !== "object") return false;
  saveJSON(STORAGE_KEYS.form, data.form);
  if (data.checklist != null) saveJSON(STORAGE_KEYS.checklist, data.checklist);
  else removeKey(STORAGE_KEYS.checklist);
  if (data.materiality != null) saveJSON(STORAGE_KEYS.materiality, data.materiality);
  else removeKey(STORAGE_KEYS.materiality);
  return true;
}
