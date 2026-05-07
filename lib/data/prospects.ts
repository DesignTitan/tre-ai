import type { Prospect } from "../types";

/**
 * Seed dataset — 9 real Detroit-metro businesses sourced from public
 * BBB profiles, company websites, and public Google search.
 * No paid APIs were used to assemble this.
 *
 * Revenue figures are ESTIMATED from business age + service-area + employee
 * proxy and are NOT verified at the company level. The verified=false flag
 * is the contract for the UI to render them as "est." rather than as fact.
 *
 * Score weights are the placeholder model. Once Jamie's PRD answers come
 * back we'll move scoring to lib/score.ts and tune to her actual closes.
 */
export const PROSPECTS: Prospect[] = [
  {
    id: "kennedy",
    area: "livonia",
    name: "Kennedy Plumbing<br/>& Heating, Inc.",
    industry: "Plumbing · Mechanical",
    founded: 1980,
    revenueEstimate: { low: 3, high: 7, verified: false },
    ownerHint: "Paul Kennedy",
    successionStatus: "in-motion",
    score: 88,
    whyOneLine:
      "Founder Paul Kennedy is still the named master plumber. His son Brian works in the business — succession is happening but not settled.",
    whyBullets: [
      "**Founder Paul Kennedy** still active, master plumber",
      "**Son Brian** in the business — succession in motion, not settled",
      "**Plumbing roll-up** heavy across SE Michigan",
    ],
    signals: [
      { label: "Founder still active",    detail: "Paul Kennedy named as Founder, Master Plumber",   source: "kennedyplumbingheating.com", weight: 90 },
      { label: "Succession in motion",    detail: "Son Brian, also Master Plumber, helps run",       source: "kennedyplumbingheating.com", weight: 78 },
      { label: "Industry tailwind",       detail: "Plumbing PE roll-ups active in Michigan",         source: "industry M&A press",         weight: 84 },
      { label: "Tenure",                  detail: "46 years under continuous founder ownership",     source: "company website",            weight: 82 },
      { label: "Revenue band fit",        detail: "Estimated $3–7M from size proxy",                 source: "est. — not verified",        weight: 65 },
    ],
    tags: ["owner-led", "pe-tailwind"],
    distanceMi: 17,
    driveMin: 28,
  },
  {
    id: "burtons",
    area: "dearborn",
    name: "Burton's Plumbing<br/>& Heating",
    industry: "Plumbing · Heating",
    founded: 1975,
    revenueEstimate: { low: 4, high: 9, verified: false },
    ownerHint: "Burton family",
    successionStatus: "unknown",
    score: 85,
    whyOneLine:
      "Family-owned business operating for over 50 years; \"the original Burton's\" still mentioned in the company narrative.",
    whyBullets: [
      "**Family business**, originally started by the Burtons",
      "Plumbing tailwind active in Wayne County",
    ],
    signals: [
      { label: "Family-owned tenure", detail: "Operating since 1975, 51 years",                source: "burtonsplumbing.com",  weight: 82 },
      { label: "Industry tailwind",   detail: "Plumbing tailwind active in Wayne County",      source: "industry M&A press",   weight: 80 },
      { label: "Single-name brand",   detail: "Burton family identity tied to the business",   source: "burtonsplumbing.com",  weight: 70 },
      { label: "Revenue band fit",    detail: "Estimated $4–9M",                               source: "est. — not verified",  weight: 65 },
    ],
    tags: ["owner-led"],
    distanceMi: 9,
  },
  {
    id: "national",
    area: "detroit",
    name: "National Heating<br/>Company",
    industry: "HVAC",
    founded: 1958,
    revenueEstimate: { low: 4, high: 10, verified: false },
    successionStatus: "unknown",
    score: 82,
    whyOneLine:
      "67 years in business; owner not publicly named on their BBB profile or company materials.",
    whyBullets: [
      "**67 years** in business — owner not publicly named",
      "**HVAC tailwind** very active in Michigan",
    ],
    signals: [
      { label: "Long tenure",     detail: "Operating since 1958, 67 years",                   source: "BBB profile",        weight: 88 },
      { label: "HVAC tailwind",   detail: "HVAC roll-up active in Michigan",                  source: "industry M&A press", weight: 85 },
      { label: "Owner anonymity", detail: "Owner not publicly named; possible succession opacity", source: "BBB profile", weight: 72 },
    ],
    tags: ["pe-tailwind"],
    distanceMi: 0,
  },
  {
    id: "dab",
    area: "detroit",
    name: "Detroit Auto Body",
    industry: "Collision Repair",
    founded: 1972,
    revenueEstimate: { low: 3, high: 8, verified: false },
    ownerHint: "Larry",
    successionStatus: "unknown",
    score: 80,
    whyOneLine:
      "Family-owned since 1972; \"Larry\" listed as owner. Auto-body is one of the most actively rolled-up verticals in 2025–2026.",
    whyBullets: [
      "**Family-owned** since 1972; \"Larry\" listed as owner",
      "Auto-body PE roll-ups (Caliber, Crash Champions) active",
    ],
    signals: [
      { label: "Family-owned",     detail: "Since 1972, owner identified as Larry",               source: "detroitautobody.com", weight: 85 },
      { label: "Auto-body tailwind", detail: "Caliber, Crash Champions, Service King aggressive in MI", source: "industry M&A press", weight: 90 },
      { label: "Tenure",           detail: "54 years of operation",                                source: "detroitautobody.com", weight: 78 },
    ],
    tags: ["owner-led", "pe-tailwind"],
    distanceMi: 0,
  },
  {
    id: "gjc",
    area: "detroit",
    name: "George Johnson<br/>& Co CPAs",
    industry: "Accounting",
    founded: 1940,
    revenueEstimate: { low: 5, high: 15, verified: false },
    ownerHint: "Founded by Richard Austin",
    successionStatus: "settled",
    score: 78,
    whyOneLine:
      "Founded by Richard Austin over 80 years ago. CPA firm consolidation has accelerated dramatically with PE entry into the space.",
    whyBullets: [
      "**Founded by Richard Austin** over 80 years ago",
      "CPA firm consolidation accelerating",
    ],
    signals: [
      { label: "Long tenure",         detail: "85 years in business",                  source: "gjc-cpa.com",          weight: 92 },
      { label: "CPA roll-up tailwind", detail: "PE-backed CPA platforms on the hunt",  source: "industry M&A press",   weight: 80 },
      { label: "Founder legacy",      detail: "Richard Austin, original founder",      source: "gjc-cpa.com",          weight: 60 },
    ],
    tags: ["pe-tailwind"],
    distanceMi: 0,
  },
  {
    id: "leonard",
    area: "warren",
    name: "Leonard Machine<br/>Tools Systems",
    industry: "Machine Tools",
    founded: 1951,
    revenueEstimate: { low: 4, high: 12, verified: false },
    successionStatus: "unknown",
    score: 76,
    whyOneLine: "Family-owned and operating in Warren for 75 years.",
    whyBullets: [
      "**Family-owned**, 75 yrs of operation",
    ],
    signals: [
      { label: "Tenure",       detail: "75 years of operation",         source: "industry directory", weight: 90 },
      { label: "Family-owned", detail: "Multi-generation continuity",   source: "industry directory", weight: 70 },
    ],
    distanceMi: 14,
  },
  {
    id: "thornton",
    area: "farmington",
    name: "Thornton & Grooms",
    industry: "HVAC · Plumbing",
    founded: 1937,
    revenueEstimate: { low: 8, high: 18, verified: false },
    ownerHint: "M. Bergstrom + D. Knight",
    successionStatus: "in-motion",
    score: 75,
    whyOneLine:
      "89 years old. Multiple principals listed (Bergstrom + Knight) — succession is in motion but ownership is split, which can drive an exit.",
    whyBullets: [
      "**Multi-principal** — Bergstrom + Knight",
      "89 years; classic HVAC roll-up target",
    ],
    signals: [
      { label: "Long tenure",     detail: "89 years",                                 source: "BBB profile",         weight: 95 },
      { label: "HVAC tailwind",   detail: "Multiple PE roll-ups in HVAC + plumbing",  source: "industry M&A press",  weight: 84 },
      { label: "Multi-principal", detail: "M. Bergstrom · M. Bergstrom · D. Knight",  source: "BBB profile",         weight: 60 },
    ],
    tags: ["pe-tailwind"],
    distanceMi: 22,
  },
  {
    id: "jordan",
    area: "warren",
    name: "Jordan Tool",
    industry: "Tool & Die · NAAMS",
    founded: 1953,
    revenueEstimate: { low: 4, high: 12, verified: false },
    successionStatus: "settled",
    score: 73,
    whyOneLine:
      "Multi-generational family-owned. Tool & Die has steady but slower consolidation activity.",
    whyBullets: [
      "**Multi-generational** family-owned",
    ],
    signals: [
      { label: "Tenure",        detail: "73 years",                            source: "jordantool.com", weight: 85 },
      { label: "Multi-gen family", detail: "Established 1953, family-run",      source: "jordantool.com", weight: 70 },
    ],
    distanceMi: 14,
  },
  {
    id: "warrenscrew",
    area: "warren",
    name: "Warren Screw<br/>Products",
    industry: "Specialty Mfg",
    founded: 1957,
    revenueEstimate: { low: 4, high: 10, verified: false },
    ownerHint: "3rd-gen Kaspari family",
    successionStatus: "settled",
    score: 72,
    whyOneLine:
      "3rd-generation Kaspari family business. Settled succession means slightly lower exit probability, but still old enough that gen-2 may be retiring.",
    whyBullets: [
      "**3rd-generation Kaspari family**",
    ],
    signals: [
      { label: "Long tenure", detail: "69 years",                          source: "warrenscrew.com", weight: 80 },
      { label: "3rd-gen family", detail: "Kaspari family, 3rd generation", source: "warrenscrew.com", weight: 55 },
    ],
    distanceMi: 14,
  },
];

export function findProspect(id: string) {
  return PROSPECTS.find(p => p.id === id);
}

/** Sorted prospects in score order (descending). */
export function rankedProspects(filterArea?: string | null): Prospect[] {
  const list = filterArea && filterArea !== "all"
    ? PROSPECTS.filter(p => p.area === filterArea)
    : [...PROSPECTS];
  return list.sort((a, b) => b.score - a.score);
}
