import type { Prospect } from "./types";

/**
 * Exit Readiness score model — placeholder weights.
 *
 * The real model will be tuned to Jamie's actual closes once her PRD
 * answers come back. Until then, this is a rough heuristic combining
 * tenure, succession risk, and industry tailwind.
 *
 * IMPORTANT: at the moment we don't recompute scores at runtime — the
 * scores in lib/data/prospects.ts are hand-set values that already reflect
 * this logic applied. This module exists so we can switch over cleanly
 * the moment we have real signal weights.
 */

const INDUSTRY_TAILWIND: Record<string, number> = {
  "HVAC":             25,
  "Plumbing":         20,
  "Mechanical":       22,
  "Heating":          18,
  "Collision Repair": 25,
  "Accounting":       20,
  "Tool & Die":       10,
  "Machine Tools":    10,
  "Specialty Mfg":    10,
};

export function exitReadinessScore(p: Prospect): number {
  let score = 0;
  const age = p.founded ? new Date().getFullYear() - p.founded : 0;

  // Tenure
  if (age >= 50) score += 25;
  else if (age >= 30) score += 20;
  else if (age >= 15) score += 10;

  // Succession risk
  switch (p.successionStatus) {
    case "founder-active": score += 20; break;
    case "in-motion":      score += 15; break;
    case "unknown":        score += 12; break;
    case "settled":        score += 5;  break;
  }

  // Industry tailwind — pick the highest matching token in the industry string
  let bestTailwind = 0;
  for (const [token, weight] of Object.entries(INDUSTRY_TAILWIND)) {
    if (p.industry.includes(token) && weight > bestTailwind) bestTailwind = weight;
  }
  score += bestTailwind;

  // Owner explicitly named on a public source
  if (p.ownerHint) score += 10;

  return Math.min(100, score);
}
