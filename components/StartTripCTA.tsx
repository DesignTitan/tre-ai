"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { InstallNudge, useInstallNudge } from "./InstallNudge";

/**
 * Welcome-screen primary CTA. Clicking routes to /plan, BUT if the install
 * nudge is eligible and unseen, it intercepts once to surface the
 * "save to home screen for the best experience" interstitial. After the
 * user installs or dismisses, the route push proceeds.
 */
export function StartTripCTA() {
  const router = useRouter();
  const nudge = useInstallNudge();
  const [showNudge, setShowNudge] = useState(false);

  function handleClick(e: React.MouseEvent) {
    if (nudge.shouldShow) {
      e.preventDefault();
      setShowNudge(true);
    }
  }

  function handleContinue() {
    nudge.dismiss();
    setShowNudge(false);
    router.push("/plan");
  }

  return (
    <>
      <a
        href="/plan"
        onClick={handleClick}
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
      </a>

      {showNudge && <InstallNudge onContinue={handleContinue} />}
    </>
  );
}
