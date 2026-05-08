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

async function nominatimSearch(query: string, limit = 1): Promise<Array<{
  display_name: string;
  lat: string;
  lon: string;
  addresstype?: string;
  class?: string;
  type?: string;
  address?: { city?: string; town?: string; village?: string; state?: string; postcode?: string; country_code?: string };
}>> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: String(limit),
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

export interface PlaceSuggestion {
  title: string;
  subtitle: string;
  query: string;
  lat: number;
  lng: number;
  type: GeocodeHit["type"];
}

const STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO",
  Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI",
  "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
  Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI",
  Wyoming: "WY", "District of Columbia": "DC",
  Ontario: "ON", Quebec: "QC", "British Columbia": "BC", Alberta: "AB",
  Manitoba: "MB", Saskatchewan: "SK", "Nova Scotia": "NS", "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL", "Prince Edward Island": "PE",
};

interface PhotonProps {
  name?: string;
  osm_value?: string;
  osm_key?: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  postcode?: string;
  county?: string;
}

const PLACE_TYPES = new Set(["city", "town", "village", "hamlet", "suburb", "postcode", "neighbourhood"]);

export async function suggestPlaces(query: string, limit = 6): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const params = new URLSearchParams({
    q: trimmed,
    limit: String(Math.min(limit * 3, 20)),
    lang: "en",
  });
  const res = await fetch(`https://photon.komoot.io/api/?${params}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: Array<{ properties?: PhotonProps; geometry?: { coordinates?: [number, number] } }> };
  const features = data.features ?? [];
  const out: PlaceSuggestion[] = [];
  const seen = new Set<string>();
  for (const f of features) {
    const p = f.properties ?? {};
    const cc = p.countrycode;
    if (cc !== "US" && cc !== "CA") continue;
    const osmVal = p.osm_value ?? "";
    if (!PLACE_TYPES.has(osmVal)) continue;
    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const [lng, lat] = coords;
    const isZip = osmVal === "postcode";
    const stateAbbr = p.state ? (STATE_ABBR[p.state] ?? p.state) : "";
    let title: string;
    let subtitle: string;
    let queryStr: string;
    if (isZip) {
      const place = p.city ?? p.county ?? "";
      title = `${p.name} · ${place}${stateAbbr ? `, ${stateAbbr}` : ""}`.trim();
      subtitle = `ZIP${p.country ? ` · ${p.country}` : ""}`;
      queryStr = String(p.name);
    } else {
      const placeName = p.name ?? "";
      title = stateAbbr ? `${placeName}, ${stateAbbr}` : placeName;
      const subParts: string[] = [];
      if (p.county && p.county !== placeName) subParts.push(p.county);
      if (cc === "CA") subParts.push("Canada");
      subtitle = subParts.join(" · ");
      queryStr = title;
    }
    if (!title) continue;
    const dedupeKey = title.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({
      title,
      subtitle,
      query: queryStr,
      lat,
      lng,
      type: isZip ? "zip" : (osmVal === "city" || osmVal === "town" || osmVal === "village" ? "city" : "address"),
    });
    if (out.length >= limit) break;
  }
  return out;
}

export async function geocode(query: string): Promise<GeocodeHit | null> {
  const trimmed = query.trim();
  const isZip = /^\d{5}(-\d{4})?$/.test(trimmed);
  const candidates = [trimmed, trimmed.replace(/\s+/g, " ").replace(/,\s*/g, ", ")];
  if (trimmed.includes(",")) {
    candidates.push(trimmed.replace(/,\s*/g, " "));
  }
  if (isZip) {
    candidates.push(`${trimmed}, USA`);
  }
  let arr: Awaited<ReturnType<typeof nominatimSearch>> = [];
  for (const q of [...new Set(candidates)]) {
    arr = await nominatimSearch(q);
    if (arr.length) break;
  }
  if (arr.length) {
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

  // Fallback: Photon (better for ZIPs and prefix queries)
  const photon = await suggestPlaces(trimmed, 1);
  if (photon.length) {
    const p = photon[0];
    const splitAll = (s: string) => s.split(/[,·]/).map(x => x.trim()).filter(Boolean);
    const parts = [...splitAll(p.title), ...splitAll(p.subtitle)];
    const cleanDisplay = [...new Set(parts)].filter(s => !/^ZIP$/i.test(s)).join(", ");
    return {
      displayName: cleanDisplay,
      lat: p.lat,
      lng: p.lng,
      type: p.type,
    };
  }
  return null;
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
  // Skilled trades — strongest exit-readiness signal
  '["craft"]',

  // Industrial / manufacturing
  '["industrial"]',
  '["man_made"="works"]',

  // Professional services — owner-led practices
  '["office"]',

  // Healthcare — independent practices (dental, optometry, chiropractic, vet, etc.)
  '["healthcare"]',
  '["amenity"="dentist"]',
  '["amenity"="doctors"]',
  '["amenity"="clinic"]',
  '["amenity"="veterinary"]',
  '["amenity"="pharmacy"]',

  // Auto-related
  '["shop"="car_repair"]',
  '["shop"="car"]',
  '["shop"="motorcycle"]',
  '["shop"="tyres"]',
  '["shop"="boat"]',
  '["amenity"="car_wash"]',
  '["amenity"="car_rental"]',
  '["amenity"="fuel"]',

  // Hospitality — independent hotels/motels/B&Bs
  '["tourism"="hotel"]',
  '["tourism"="motel"]',
  '["tourism"="guest_house"]',
  '["tourism"="hostel"]',
  '["tourism"="apartment"]',

  // Food & beverage — independents
  '["amenity"="restaurant"]',
  '["amenity"="cafe"]',
  '["amenity"="bar"]',
  '["amenity"="pub"]',
  '["amenity"="ice_cream"]',
  '["amenity"="biergarten"]',
  '["shop"="bakery"]',
  '["shop"="butcher"]',
  '["shop"="confectionery"]',
  '["shop"="cheese"]',
  '["shop"="seafood"]',
  '["shop"="wine"]',
  '["shop"="alcohol"]',

  // Personal services
  '["amenity"="funeral_hall"]',
  '["shop"="dry_cleaning"]',
  '["shop"="laundry"]',
  '["shop"="hairdresser"]',
  '["shop"="beauty"]',
  '["shop"="tattoo"]',
  '["shop"="optician"]',
  '["shop"="florist"]',

  // Building / home / hardware
  '["shop"="hardware"]',
  '["shop"="doityourself"]',
  '["shop"="trade"]',
  '["shop"="tool_hire"]',
  '["shop"="hvac"]',
  '["shop"="paint"]',
  '["shop"="tile"]',
  '["shop"="kitchen"]',
  '["shop"="bathroom_furnishing"]',
  '["shop"="garden_centre"]',
  '["shop"="appliance"]',
  '["shop"="furniture"]',
  '["shop"="houseware"]',
  '["shop"="lighting"]',
  '["shop"="flooring"]',
  '["shop"="carpet"]',

  // Specialty retail — single-owner-friendly
  '["shop"="jewelry"]',
  '["shop"="art"]',
  '["shop"="antiques"]',
  '["shop"="music"]',
  '["shop"="musical_instrument"]',
  '["shop"="bicycle"]',
  '["shop"="sports"]',
  '["shop"="outdoor"]',
  '["shop"="hunting"]',
  '["shop"="fishing"]',
  '["shop"="firearm"]',
  '["shop"="hobby"]',
  '["shop"="books"]',
  '["shop"="stationery"]',
  '["shop"="toys"]',
  '["shop"="games"]',
  '["shop"="pet"]',
  '["shop"="pet_grooming"]',
  '["shop"="electronics"]',
  '["shop"="computer"]',
  '["shop"="mobile_phone"]',
  '["shop"="camera"]',
  '["shop"="watches"]',
  '["shop"="clothes"]',
  '["shop"="shoes"]',
  '["shop"="bag"]',
  '["shop"="leather"]',
  '["shop"="fabric"]',
  '["shop"="sewing"]',
  '["shop"="frame"]',
  '["shop"="storage_rental"]',
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
