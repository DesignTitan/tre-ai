/**
 * Core data shapes for tre.ai.
 *
 * These types are the contract between the data layer and the UI.
 * When we move from local seed data to Supabase, the table columns
 * should mirror these — keep them in sync.
 */

export type AreaSlug = string;

export interface Area {
  slug: AreaSlug;
  name: string;
  shortName?: string;
  meta: string;
  count: number;
  isAnchor?: boolean;
  isInRange?: boolean;
  lat?: number;
  lng?: number;
}

export type IndustryTag =
  | "Plumbing"
  | "HVAC"
  | "Mechanical"
  | "Heating"
  | "Collision Repair"
  | "Accounting"
  | "Machine Tools"
  | "Tool & Die"
  | "Specialty Mfg";

export interface Signal {
  label: string;
  detail: string;
  source: string;
  weight: number;
}

export interface Prospect {
  id: string;
  area: AreaSlug;
  name: string;
  industry: string;
  founded?: number;
  revenueEstimate?: { low: number; high: number; verified: boolean };
  ownerHint?: string;
  successionStatus: "founder-active" | "in-motion" | "settled" | "unknown";
  score: number;
  whyOneLine: string;
  whyBullets: string[];
  signals: Signal[];
  tags?: ("owner-led" | "pe-tailwind" | "warm-intro" | "stuck" | "provisional")[];
  distanceMi?: number;
  driveMin?: number;
  lat?: number;
  lng?: number;
  address?: string;
  phone?: string;
  website?: string;
  source?: "curated" | "crawled";
  provisional?: boolean;
}

export type DealStage = "first-visit" | "discovery" | "engagement";
export type DealStatus = "queued" | "next" | "done" | "stuck";

export interface Deal {
  prospectId: string;
  stage: DealStage;
  status?: DealStatus;
  nextActionLabel?: string;
  nextActionDetail?: string;
  isWarn?: boolean;
}

export interface Trip {
  anchor: AreaSlug;
  rangeMi: number;
  activeAreas: AreaSlug[];
  startedAt?: string;
  dayOfTrip?: number;
}

export interface CrawlLocation {
  query: string;
  displayName: string;
  lat: number;
  lng: number;
  type: "city" | "zip" | "address";
}

export interface CrawlResult {
  location: CrawlLocation;
  radiusMi: number;
  requestedRadiusMi?: number;
  autoExpanded?: boolean;
  prospects: Prospect[];
  fetchedAt: string;
  totalRaw: number;
  filtered: number;
  nearestBusiness?: Prospect;
}
