import type { Deal } from "../types";

/**
 * Pipeline state for the seeded prospects.
 * Stage names will be replaced with Jamie's real stage names
 * once her PRD answers come back (see docs/PRD.md, Q18).
 */
export const DEALS: Deal[] = [
  // First Visit
  { prospectId: "kennedy",  stage: "first-visit", nextActionLabel: "today",   nextActionDetail: "10:30" },
  { prospectId: "national", stage: "first-visit", nextActionLabel: "today",   nextActionDetail: "1:00" },
  { prospectId: "leonard",  stage: "first-visit", nextActionLabel: "today",   nextActionDetail: "3:00" },
  { prospectId: "jordan",   stage: "first-visit", nextActionLabel: "Tue",     nextActionDetail: "cold visit" },
  { prospectId: "warrenscrew", stage: "first-visit", nextActionLabel: "Wed",  nextActionDetail: "cold visit" },

  // Discovery
  { prospectId: "burtons", stage: "discovery", nextActionLabel: "Mon", nextActionDetail: "follow-up" },
  { prospectId: "dab",     stage: "discovery", nextActionLabel: "stuck", nextActionDetail: "nudge?", isWarn: true, status: "stuck" },

  // Engagement
  { prospectId: "thornton", stage: "engagement", nextActionLabel: "Wed", nextActionDetail: "val. call" },
];
