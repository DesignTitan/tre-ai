/**
 * Core data shapes for tre.ai.
 *
 * These types are the contract between the data layer and the UI.
 * When we move from local seed data to Supabase, the table columns
 * should mirror these — keep them in sync.
 */

export type AreaSlug =
  | "detroit"
  | "warren"
  | "dearborn"
  | "livonia"
  | "farmington";

export interface Area {
  slug: AreaSlug;
  name: string;        // "Detroit"
  shortName?: string;  // "Detroit" — used in tight chip layouts
  meta: string;        // "Anchor · 0 mi" or "14 mi NE"
  count: number;       // # prospects we have for this area today
  isAnchor?: boolean;
  isInRange?: boolean; // for the "extend range to include" affordance later
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

/** A single signal that contributed to the score, with its source. */
export interface Signal {
  label: string;       // "Founder still active"
  detail: string;      // "Paul Kennedy named as Founder, Master Plumber"
  source: string;      // "kennedyplumbingheating.com"
  weight: number;      // 0–100 — how strongly this signal pushed the score
}

/** A single prospect business. */
export interface Prospect {
  id: string;
  area: AreaSlug;
  name: string;        // may include "<br/>" for two-line display
  industry: string;    // free-text, may combine multiple tags
  founded: number;     // year
  revenueEstimate?: { low: number; high: number; verified: boolean }; // millions
  ownerHint?: string;  // "Paul Kennedy" or "Larry" or "Bergstrom + Knight"
  successionStatus: "founder-active" | "in-motion" | "settled" | "unknown";
  score: number;       // 0–100 Exit Readiness
  whyOneLine: string;  // short narrative for the detail page header
  whyBullets: string[];// 1–3 short bullets for the scout card
  signals: Signal[];   // detail-page signal breakdown
  tags?: ("owner-led" | "pe-tailwind" | "warm-intro" | "stuck")[];
  distanceMi?: number; // miles from anchor
  driveMin?: number;
}

export type DealStage = "first-visit" | "discovery" | "engagement";
export type DealStatus = "queued" | "next" | "done" | "stuck";

export interface Deal {
  prospectId: string;
  stage: DealStage;
  status?: DealStatus;
  nextActionLabel?: string; // "10:30" or "Mon" or "stuck"
  nextActionDetail?: string; // "today" or "follow-up" or "nudge?"
  isWarn?: boolean;
}

export interface Trip {
  anchor: AreaSlug;
  rangeMi: number;
  activeAreas: AreaSlug[];
  startedAt?: string;
  dayOfTrip?: number;
}
