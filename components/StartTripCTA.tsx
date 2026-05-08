"use client";
import Link from "next/link";

/**
 * Welcome-screen primary CTA. Pure navigation — the install nudge fires
 * on /plan mount so it lives on the destination screen, not as an
 * interstitial that blocks the transition.
 */
export function StartTripCTA() {
  return (
    <Link
      href="/plan"
      className="
        group flex items-center justify-between
        bg-ink text-white rounded-2xl p-4
        font-semibold shadow-cta
        active:scale-[.98] transition-transform
      "
    >
      <span className="text-[15px] tracking-tight2">Start a trip</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
