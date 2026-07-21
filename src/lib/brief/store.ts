// Client-side persistence for Saaksh Brief: bookmarks, a daily streak, cached
// "Why it matters" text, and chosen categories. SSR-safe (all reads no-op on the
// server). Nothing leaves the browser, consistent with the free tool's promise.
import type { BriefItem } from "./types";

const K = {
  saved: "saaksh:brief:saved",
  streak: "saaksh:brief:streak",
  why: "saaksh:brief:why",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* quota / private mode: ignore */
  }
}

// ── Bookmarks ──────────────────────────────────────────────────────────────
export function getSaved(): BriefItem[] {
  return read<BriefItem[]>(K.saved, []);
}
export function isSaved(id: string): boolean {
  return getSaved().some((i) => i.id === id);
}
// Returns the new saved-state (true = now saved).
export function toggleSaved(item: BriefItem): boolean {
  const list = getSaved();
  const idx = list.findIndex((i) => i.id === item.id);
  if (idx === -1) {
    write(K.saved, [item, ...list].slice(0, 200));
    return true;
  }
  list.splice(idx, 1);
  write(K.saved, list);
  return false;
}

// ── Streak ─────────────────────────────────────────────────────────────────
interface Streak {
  count: number;
  last: string; // YYYY-MM-DD
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
export function getStreak(): number {
  return read<Streak>(K.streak, { count: 0, last: "" }).count;
}
// Call once per visit; advances the streak if it's a new day (resets if a day was skipped).
export function touchStreak(): number {
  const s = read<Streak>(K.streak, { count: 0, last: "" });
  const t = today();
  if (s.last === t) return s.count || 1;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const next = { count: s.last === yesterday ? s.count + 1 : 1, last: t };
  write(K.streak, next);
  return next.count;
}

// ── Cached "Why it matters" ──────────────────────────────────────────────────
export function getCachedWhy(id: string): string | null {
  return read<Record<string, string>>(K.why, {})[id] || null;
}
export function cacheWhy(id: string, text: string): void {
  const map = read<Record<string, string>>(K.why, {});
  map[id] = text;
  write(K.why, map);
}
