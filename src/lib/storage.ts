// Tiny localStorage helper, SSR-safe and failure-tolerant. Used to persist the
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
    // Quota/serialization errors are non-fatal, persistence is best-effort.
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
  // Whether the interactive "Take a tour" walkthrough has been seen/dismissed.
  // One-time, persists across reports; never written in demo mode.
  tourSeen: "tour.seen",
  // The on-device "My clients" workspace: a registry of saved clients and the id
  // of the one currently loaded into the session.* keys above. See the clients
  // section at the bottom of this file.
  clientsIndex: "clients.index",
  activeClient: "clients.active",
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

// "New report" reset, clears the form, checklist state and materiality shortlist.
// (The one-time walkthrough flag is intentionally kept.)
export function clearReportSession(): void {
  removeKey(STORAGE_KEYS.form);
  removeKey(STORAGE_KEYS.checklist);
  removeKey(STORAGE_KEYS.materiality);
}

// ── Portable backup of the on-device session ─────────────────────────────────
// Work lives only in this browser, so we let the consultant download a small file
// of their session and re-import it on another browser/device (or as a safety
// net). Still 100% on-device, the file stays with them, nothing is uploaded.

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

// ── Shareable report links ───────────────────────────────────────────────────
// A report lives only in localStorage, so a consultant can't send it to a
// colleague. We URL-encode just the intake form (tiny, no client documents) as
// url-safe base64 in /report?v=<param>; the recipient's browser regenerates the
// same report on-device. Nothing is uploaded, no link is stored on any server.

function toBase64Url(str: string): string {
  if (!isBrowser()) return "";
  // UTF-8 safe: encode to bytes, then base64, then make it url-safe.
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return window.btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): string {
  if (!isBrowser()) return "";
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const bin = window.atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Encode an intake form to a url-safe base64 string for /report?v=… Empty on failure.
export function encodeReportParam(form: IntakeFormData): string {
  try {
    return toBase64Url(JSON.stringify(form));
  } catch {
    return "";
  }
}

// Decode a shared ?v= param back into an intake form. Null unless it parses into
// an object carrying every required form field with the right shape (so a garbage,
// truncated, or old-format param is a safe no-op rather than a crash downstream).
export function decodeReportParam(param: string): IntakeFormData | null {
  try {
    const p = JSON.parse(fromBase64Url(param)) as Partial<IntakeFormData>;
    if (!p || typeof p !== "object") return null;
    if (typeof p.companyName !== "string") return null;
    if (typeof p.industry !== "string" || typeof p.sector !== "string") return null;
    if (typeof p.companySize !== "string" || typeof p.reportingMaturity !== "string") return null;
    if (!Array.isArray(p.exportMarkets) || !Array.isArray(p.existingFilings)) return null;
    return p as IntakeFormData;
  } catch {
    return null;
  }
}

// Adopt a shared form as the active on-device session. The prior report's
// checklist/materiality belonged to a different client, so they're cleared, the
// recipient starts from the shared form with a clean slate.
export function adoptSharedForm(form: IntakeFormData): void {
  saveForm(form);
  removeKey(STORAGE_KEYS.checklist);
  removeKey(STORAGE_KEYS.materiality);
  // A shared form is a different client, so detach from the active "My clients"
  // record; the next syncActiveClient() will save it as a new entry rather than
  // overwriting whichever client was open.
  removeKey(STORAGE_KEYS.activeClient);
}

// Atomically write a backup's { form, checklist, materiality } into the three
// live session.* keys (the "working copy" the report/checklist/materiality read).
// Shared by restoreSessionBackup (from a file) and switchToClient (from the registry).
function writeSessionData(data: SessionBackup["data"]): void {
  saveJSON(STORAGE_KEYS.form, data.form);
  if (data.checklist != null) saveJSON(STORAGE_KEYS.checklist, data.checklist);
  else removeKey(STORAGE_KEYS.checklist);
  if (data.materiality != null) saveJSON(STORAGE_KEYS.materiality, data.materiality);
  else removeKey(STORAGE_KEYS.materiality);
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
  writeSessionData(data);
  return true;
}

// ── "My clients" workspace (on-device, multi-client) ─────────────────────────
// The app persists exactly one client across the three session.* keys above; the
// report is always regenerated from session.form. This registry keeps a list of
// SessionBackup-shaped records so a consultant can save and switch between many
// clients, all on-device. The currently-open client's id lives in clients.active,
// and its live data is the session.* keys (the "working copy"). Saving is
// automatic: syncActiveClient() mirrors the working copy into the registry as the
// consultant works (see the call sites in the checklist/materiality/report code).

export type SavedClient = SessionBackup & { id: string };

function newClientId(): string {
  try {
    if (isBrowser() && window.crypto?.randomUUID) return window.crypto.randomUUID();
  } catch {
    // fall through
  }
  // Fallback id (no crypto): timestamp + counter-ish suffix from the registry length.
  return `c-${Date.now().toString(36)}-${(loadClientsIndex().length + 1).toString(36)}`;
}

function loadClientsIndex(): SavedClient[] {
  const list = loadJSON<SavedClient[]>(STORAGE_KEYS.clientsIndex, []);
  return Array.isArray(list) ? list : [];
}

// All saved clients, most-recently-saved first.
export function listClients(): SavedClient[] {
  return loadClientsIndex()
    .filter((c) => c && c.id && c.data && c.data.form)
    .sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
}

export function activeClientId(): string | null {
  return loadJSON<string | null>(STORAGE_KEYS.activeClient, null);
}

// Auto-save: snapshot the live session into the registry under the active id
// (minting one if there's no active client yet, e.g. a fresh report or a
// pre-feature session being adopted). No-op when there's nothing to save.
export function syncActiveClient(): void {
  const snapshot = buildSessionBackup();
  if (!snapshot) return;
  let id = activeClientId();
  const list = loadClientsIndex();
  if (!id) {
    id = newClientId();
    saveJSON(STORAGE_KEYS.activeClient, id);
  }
  const record: SavedClient = { ...snapshot, id };
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  saveJSON(STORAGE_KEYS.clientsIndex, list);
}

// Load a saved client into the live session and make it active. False if unknown.
export function switchToClient(id: string): boolean {
  const record = loadClientsIndex().find((c) => c.id === id);
  if (!record || !record.data || !record.data.form) return false;
  writeSessionData(record.data);
  saveJSON(STORAGE_KEYS.activeClient, id);
  return true;
}

// Remove a saved client. If it was the open one, clear the live session too so
// /report doesn't keep showing a deleted client.
export function deleteClient(id: string): void {
  saveJSON(STORAGE_KEYS.clientsIndex, loadClientsIndex().filter((c) => c.id !== id));
  if (activeClientId() === id) {
    clearReportSession();
    removeKey(STORAGE_KEYS.activeClient);
  }
}

// Start a fresh client: clear the live session + active id so the next saved
// report becomes a new registry record (existing saved clients are untouched).
export function startNewClient(): void {
  clearReportSession();
  removeKey(STORAGE_KEYS.activeClient);
}
