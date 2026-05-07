/**
 * Free public data sources used by the crawl pipeline.
 *
 * - Nominatim (OpenStreetMap): geocoding city/zip → lat/lng. Usage policy
 *   requires a descriptive User-Agent and ~1 req/sec. We're well under both.
 * - Overpass (OpenStreetMap): POI lookup by lat/lng + radius. Public servers
 *   handle a few req/min comfortably.
 *
 * Both are free and unauthenticated. Calls happen server-side from Next API
 * routes so the User-Agent and rate compliance stay in our control.
 */

const USER_AGENT = "tre.ai (+https://tre.ai)";

export interface GeocodeHit {
  displayName: string;
  lat: number;
  lng: number;
  type: "city" | "zip" | "address";
  raw?: unknown;
}

async function nominatimSearch(query: string): Promise<Array<{
  display_name: string;
  lat: string;
  lon: string;
  addresstype?: string;
  class?: string;
  type?: string;
}>> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: "1",
    "accept-language": "en",
    countrycodes: "us,ca",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      Referer: "https://tre-ai.vercel.app",
    },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function geocode(query: string): Promise<GeocodeHit | null> {
  const trimmed = query.trim();
  const candidates = [trimmed, trimmed.replace(/\s+/g, " ").replace(/,\s*/g, ", ")];
  if (trimmed.includes(",")) {
    candidates.push(trimmed.replace(/,\s*/g, " "));
  }
  const isZip = /^\d{5}(-\d{4})?$/.test(trimmed);
  let arr: Awaited<ReturnType<typeof nominatimSearch>> = [];
  for (const q of [...new Set(candidates)]) {
    arr = await nominatimSearch(q);
    if (arr.length) break;
  }
  if (!arr.length) return null;
  const hit = arr[0];
  const type: GeocodeHit["type"] = isZip
    ? "zip"
    : hit.addresstype === "city" || hit.addresstype === "town" || hit.addresstype === "village"
      ? "city"
      : "address";
  return {
    displayName: hit.display_name,
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    type,
  };
}

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const PROSPECT_TAG_FILTERS = [
  '["craft"]',
  '["shop"="trade"]',
  '["shop"="car_repair"]',
  '["shop"="tyres"]',
  '["shop"="tool_hire"]',
  '["shop"="hvac"]',
  '["shop"="hardware"]',
  '["shop"="doityourself"]',
  '["office"="accountant"]',
  '["office"="lawyer"]',
  '["office"="insurance"]',
  '["office"="engineer"]',
  '["office"="architect"]',
  '["office"="financial"]',
  '["office"="company"]',
  '["industrial"]',
  '["man_made"="works"]',
];

export async function overpass(
  lat: number,
  lng: number,
  radiusM: number
): Promise<OverpassElement[]> {
  const around = `(around:${Math.round(radiusM)},${lat},${lng})`;
  const filters = PROSPECT_TAG_FILTERS.map((f) => `nwr${f}${around};`).join("\n  ");
  const body =
    `[out:json][timeout:25];\n(\n  ${filters}\n);\nout center tags;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(body)}`,
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 6 },
  });
  if (!res.ok) {
    throw new Error(`Overpass ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { elements?: OverpassElement[] };
  return data.elements ?? [];
}

export const MILES_TO_M = 1609.344;
