/**
 * Provisional score model for crawled prospects.
 *
 * This is a placeholder. CLAUDE.md is explicit that real weights only get
 * tuned once Jamie's PRD answers come back (Q5/Q8 — what her last 3-5
 * closes had in common, signals that tell her an owner is thinking exit).
 *
 * Until then this gives crawled prospects a relative ordering — not an
 * authoritative number. The UI must label these as "Provisional" so we
 * don't accidentally ship a sharper-looking wrong answer.
 */

export interface ProvisionalInputs {
  founded?: number;
  hasWebsite: boolean;
  isCraft: boolean;
}

export function provisionalScore(input: ProvisionalInputs): number {
  let score = 30;

  if (input.founded) {
    const years = new Date().getFullYear() - input.founded;
    if (years >= 40) score += 25;
    else if (years >= 25) score += 18;
    else if (years >= 15) score += 10;
    else if (years >= 5) score += 4;
  } else {
    score += 5;
  }

  if (input.isCraft) score += 18;
  if (input.hasWebsite) score += 6;

  score += Math.floor(Math.random() * 5);

  return Math.max(0, Math.min(85, score));
}
