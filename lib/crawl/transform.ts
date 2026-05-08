/**
 * Map raw Overpass elements → Prospect-shaped records the UI already knows
 * how to render.
 *
 * Note: Overpass tags can give us name, address, phone, website, industry
 * tag, sometimes start_date. They cannot give us founder name, succession
 * status, or revenue band — those come from the v2 enrichment pass
 * (Firecrawl + OpenCorporates). For now those fields are explicitly
 * undefined and `provisional: true` is set so the UI can label them.
 */

import type { OverpassElement } from "./sources";
import type { Prospect, Signal } from "../types";
import { provisionalScore } from "./score";

const KNOWN_CHAINS = new Set<string>([
  // Auto / tires / oil
  "midas", "jiffy lube", "valvoline", "meineke", "monro", "discount tire",
  "firestone", "pep boys", "goodyear", "aamco", "big o tires", "tire kingdom",
  "mavis", "ntb", "tires plus", "les schwab",
  // Tax / insurance / financial
  "h&r block", "jackson hewitt", "liberty tax",
  "edward jones", "state farm", "allstate", "geico", "farmers insurance",
  "progressive", "nationwide", "american family", "liberty mutual",
  // Home services
  "merry maids", "stanley steemer", "servpro", "molly maid", "chem-dry",
  "rainbow international", "two men and a truck",
  // Home improvement / hardware
  "the home depot", "home depot", "lowe's", "lowes", "ace hardware", "true value",
  "menards", "harbor freight", "tractor supply",
  // Big-box / dept
  "walmart", "target", "kmart", "sears", "kohl's", "kohls", "macy's", "macys",
  "tj maxx", "marshalls", "ross", "burlington", "old navy", "gap", "banana republic",
  "best buy", "costco", "sam's club", "sams club", "bj's wholesale",
  // Pet
  "petsmart", "petco", "pet supplies plus",
  // Pharmacy
  "walgreens", "cvs", "rite aid",
  // Fast food
  "mcdonald's", "mcdonalds", "burger king", "wendy's", "wendys", "subway",
  "taco bell", "kfc", "popeyes", "chick-fil-a", "chickfila", "dairy queen",
  "arby's", "arbys", "sonic", "carl's jr", "hardee's", "jack in the box",
  "five guys", "shake shack", "in-n-out", "in n out", "white castle",
  "panera", "panera bread", "chipotle", "qdoba", "moe's", "moes southwest",
  "domino's", "dominos", "pizza hut", "papa john's", "papa johns",
  "little caesars", "papa murphy's", "marco's pizza",
  "starbucks", "dunkin", "dunkin' donuts", "tim hortons", "krispy kreme",
  "baskin-robbins", "cold stone creamery", "ben & jerry's",
  "ihop", "denny's", "dennys", "applebee's", "applebees",
  "olive garden", "outback steakhouse", "longhorn", "red lobster",
  "buffalo wild wings", "tgi friday's", "chili's", "chilis",
  "cracker barrel", "waffle house", "perkins", "bob evans",
  // Convenience / gas
  "7-eleven", "7 eleven", "circle k", "wawa", "sheetz", "speedway",
  "casey's", "casey's general store", "cumberland farms", "cumby's",
  "shell", "exxon", "exxonmobil", "mobil", "bp", "chevron", "marathon",
  "valero", "76", "phillips 66", "sunoco", "citgo", "arco", "conoco",
  // Hotels (chain branded)
  "holiday inn", "hampton inn", "comfort inn", "comfort suites",
  "fairfield inn", "courtyard by marriott", "marriott", "hilton",
  "hampton by hilton", "hyatt", "hyatt place", "best western",
  "super 8", "days inn", "motel 6", "extended stay america", "la quinta",
  "ramada", "quality inn", "sleep inn", "tru by hilton",
  "homewood suites", "embassy suites", "doubletree", "residence inn",
  "townplace suites", "springhill suites", "wingate", "country inn",
  "marriott bonvoy",
  // Telecom / electronics
  "verizon", "verizon wireless", "at&t", "t-mobile", "tmobile",
  "sprint", "metropcs", "metro by t-mobile", "boost mobile", "cricket wireless",
  // Apparel / specialty
  "lululemon", "nike", "adidas", "under armour", "champion sports",
  "victoria's secret", "victorias secret", "bath & body works",
  "claire's", "claires", "build-a-bear",
  // Coffee / juice / smoothie
  "jamba juice", "smoothie king", "tropical smoothie", "biggby coffee",
  "caribou coffee", "peet's coffee",
  // Other common
  "gnc", "supplements plus", "vitamin shoppe",
  "anytime fitness", "planet fitness", "snap fitness", "orange theory",
  "supercuts", "great clips", "sport clips",
  "ymca", "ywca",
  "u-haul", "uhaul", "penske", "ryder",
  "fedex", "fedex office", "ups store", "the ups store",
  "kinko's", "kinkos",
  "starbucks reserve",
  "dollar tree", "dollar general", "family dollar", "five below", "99 cents only",
]);

function isLikelyChain(name: string): boolean {
  const n = name.toLowerCase().trim();
  if (KNOWN_CHAINS.has(n)) return true;
  for (const c of KNOWN_CHAINS) if (n.includes(c)) return true;
  return false;
}

const AMENITY_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  pub: "Pub",
  fast_food: "Quick service",
  ice_cream: "Ice cream",
  biergarten: "Beer garden",
  fuel: "Gas station",
  car_wash: "Car wash",
  car_rental: "Car rental",
  funeral_hall: "Funeral home",
  veterinary: "Veterinary clinic",
  dentist: "Dental practice",
  doctors: "Medical practice",
  clinic: "Medical clinic",
  pharmacy: "Pharmacy",
};

const TOURISM_LABELS: Record<string, string> = {
  hotel: "Hotel",
  motel: "Motel",
  guest_house: "Guest house",
  hostel: "Hostel",
  apartment: "Short-term rental",
};

function industryFromTags(tags: Record<string, string>): string {
  if (tags.craft) return cap(tags.craft.replace(/_/g, " "));
  if (tags.shop) return cap(tags.shop.replace(/_/g, " "));
  if (tags.office) return `${cap(tags.office)} (office)`;
  if (tags.healthcare) return `${cap(tags.healthcare.replace(/_/g, " "))} (healthcare)`;
  if (tags.amenity && AMENITY_LABELS[tags.amenity]) return AMENITY_LABELS[tags.amenity];
  if (tags.tourism && TOURISM_LABELS[tags.tourism]) return TOURISM_LABELS[tags.tourism];
  if (tags.industrial) return cap(tags.industrial.replace(/_/g, " "));
  if (tags["man_made"] === "works") return "Manufacturing";
  return "Business";
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function addressFromTags(tags: Record<string, string>): string | undefined {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length >= 2 ? parts.join(", ") : undefined;
}

function foundedFromTags(tags: Record<string, string>): number | undefined {
  const raw = tags["start_date"];
  if (!raw) return undefined;
  const m = raw.match(/^(\d{4})/);
  return m ? Number(m[1]) : undefined;
}

function distanceMi(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function slugifyName(name: string, id: number): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) + `-${id}`
  );
}

function signalsFor(p: Partial<Prospect>, tags: Record<string, string>): Signal[] {
  const out: Signal[] = [];
  const yearsActive = p.founded ? new Date().getFullYear() - p.founded : null;
  if (yearsActive !== null) {
    out.push({
      label: "Tenure",
      detail: `${yearsActive} years on record (OSM start_date ${p.founded})`,
      source: "OpenStreetMap",
      weight: Math.min(90, 40 + yearsActive),
    });
  }
  if (tags.craft) {
    out.push({
      label: "Skilled-trade business",
      detail: `Tagged as ${tags.craft.replace(/_/g, " ")} — owner-operated norm in this category`,
      source: "OpenStreetMap (craft)",
      weight: 70,
    });
  }
  if (tags.website || tags["contact:website"]) {
    out.push({
      label: "Website on file",
      detail: "Public website available — enrichment pass will scrape for owner + founding info",
      source: "OpenStreetMap",
      weight: 35,
    });
  }
  if (tags.phone || tags["contact:phone"]) {
    out.push({
      label: "Direct phone listed",
      detail: tags.phone || tags["contact:phone"]!,
      source: "OpenStreetMap",
      weight: 25,
    });
  }
  if (out.length === 0) {
    out.push({
      label: "Limited public data",
      detail: "Only basic POI tags available. v2 enrichment will fill this in.",
      source: "OpenStreetMap",
      weight: 20,
    });
  }
  return out;
}

export interface TransformOpts {
  anchorLat: number;
  anchorLng: number;
  areaSlug: string;
  areaName: string;
}

export function transformElements(
  elements: OverpassElement[],
  opts: TransformOpts
): Prospect[] {
  const seen = new Set<string>();
  const out: Prospect[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name) continue;
    if (isLikelyChain(name)) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat === undefined || lng === undefined) continue;

    const dedupeKey = `${name.toLowerCase()}|${lat.toFixed(4)}|${lng.toFixed(4)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const founded = foundedFromTags(tags);
    const industry = industryFromTags(tags);
    const address = addressFromTags(tags);
    const website = tags.website || tags["contact:website"];
    const phone = tags.phone || tags["contact:phone"];

    const partial: Partial<Prospect> = {
      founded,
      industry,
    };
    const signals = signalsFor(partial, tags);
    const score = provisionalScore({ founded, hasWebsite: !!website, isCraft: !!tags.craft });
    const dist = distanceMi(opts.anchorLat, opts.anchorLng, lat, lng);

    const yearsLabel = founded
      ? `${new Date().getFullYear() - founded} years on record`
      : "Tenure unknown — v2 enrichment pending";

    const prospect: Prospect = {
      id: slugifyName(name, el.id),
      area: opts.areaSlug,
      name,
      industry,
      founded,
      successionStatus: "unknown",
      score,
      whyOneLine: `${industry} — ${yearsLabel}. Owner & succession data pending enrichment.`,
      whyBullets: [
        `**${industry}** at this location`,
        founded ? `**Operating since ${founded}**` : "**Founding year unknown** (v2 enrichment)",
        website ? "**Has website** — scrapeable for owner info" : "**No public website** on file",
      ],
      signals,
      tags: ["provisional"],
      distanceMi: Math.round(dist * 10) / 10,
      lat,
      lng,
      address,
      phone,
      website,
      source: "crawled",
      provisional: true,
    };
    out.push(prospect);
  }

  out.sort((a, b) => b.score - a.score);
  return out;
}
