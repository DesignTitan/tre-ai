import type { Area } from "../types";

/**
 * The five Detroit-metro areas seeded for tre.ai v0.1.
 * Counts match the actual seeded prospects in lib/data/prospects.ts.
 *
 * In production this gets replaced by an on-demand geocoder call
 * (Google Places / Mapbox) that returns adjacent metros + counts
 * per the user's anchor + radius selection.
 */
export const AREAS: Area[] = [
  { slug: "detroit",    name: "Detroit",          meta: "Anchor · 0 mi", count: 3, isAnchor: true,  isInRange: true },
  { slug: "warren",     name: "Warren",           meta: "14 mi NE",      count: 3,                   isInRange: true },
  { slug: "dearborn",   name: "Dearborn",         meta: "9 mi W",        count: 1,                   isInRange: true },
  { slug: "livonia",    name: "Livonia",          meta: "17 mi NW",      count: 1,                   isInRange: true },
  { slug: "farmington", name: "Farmington Hills", shortName: "Farm. H.", meta: "22 mi NW", count: 1, isInRange: true },
];

export function findArea(slug: string): Area | undefined {
  return AREAS.find(a => a.slug === slug);
}
