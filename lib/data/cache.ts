/**
 * Session-scoped cache for crawled prospects.
 *
 * The detail page (`/prospect/[id]`) needs to look up a prospect by id.
 * Curated prospects live in PROSPECTS at build time; crawled ones come
 * back from `/api/crawl` and only exist in the user's session. We park
 * them in sessionStorage so a hard nav from the Scout list to the detail
 * page still resolves.
 *
 * Storage limits are ~5MB which is enormous for our payload (60 prospects
 * per crawl, ~2KB each = 120KB tops).
 */

import type { Prospect } from "../types";

const KEY_PREFIX = "tre.crawled:";

export function cacheCrawledProspects(prospects: Prospect[]) {
  if (typeof sessionStorage === "undefined") return;
  for (const p of prospects) {
    try {
      sessionStorage.setItem(`${KEY_PREFIX}${p.id}`, JSON.stringify(p));
    } catch {
      return;
    }
  }
}

export function readCachedProspect(id: string): Prospect | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${KEY_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as Prospect) : null;
  } catch {
    return null;
  }
}
