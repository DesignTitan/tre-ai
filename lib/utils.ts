/** Class-name joiner — merges falsy / conditional class strings. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Formats a number of years since a founding year, e.g. 1980 → 46. */
export function yearsSince(year: number): number {
  return new Date().getFullYear() - year;
}

/** Formats a revenue band: { low: 3, high: 7 } → "$3–7M est." */
export function formatRevenueBand(band?: { low: number; high: number; verified: boolean }): string {
  if (!band) return "";
  return `$${band.low}–${band.high}M${band.verified ? "" : " est."}`;
}

/**
 * Resolves inline **bold** markup in a short string.
 * Used by the prospect card "why this one" bullets so the writers can
 * write `**Founder Bob** is...` without HTML.
 */
export function renderInlineBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}
