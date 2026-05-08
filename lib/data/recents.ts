/**
 * Recent trip queries — local-only history, last 5, deduped.
 * Replaces the hardcoded QUICK_PICKS list on /plan once the user has
 * actually run trips. Pure client-side; nothing leaves the browser.
 */

const KEY = "tre.recents";
const MAX = 5;

export interface RecentQuery {
  query: string;
  displayName?: string;
  radiusMi: number;
  ts: number;
}

export function readRecents(): RecentQuery[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentQuery[];
    if (!Array.isArray(arr)) return [];
    return arr.filter(r => r && typeof r.query === "string");
  } catch {
    return [];
  }
}

export function pushRecent(entry: Omit<RecentQuery, "ts">) {
  if (typeof localStorage === "undefined") return;
  try {
    const norm = entry.query.trim();
    if (!norm) return;
    const existing = readRecents().filter(r => r.query.toLowerCase() !== norm.toLowerCase());
    const next: RecentQuery[] = [{ ...entry, query: norm, ts: Date.now() }, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage full or blocked — silently skip
  }
}

export function clearRecents() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
