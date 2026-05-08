"use client";
import { useEffect, useState } from "react";
import { usePWAInstall } from "@/lib/usePWAInstall";

const DISMISS_KEY = "tre.installNudgeDismissed";

/**
 * Decides whether the install-nudge interstitial should fire.
 *
 * Shows once for users who:
 *   - are on a mobile browser that can install (Android Chrome via the
 *     beforeinstallprompt event, or iOS Safari with the Share-sheet path)
 *   - haven't already installed (display-mode: standalone)
 *   - haven't dismissed the nudge before
 *
 * Anyone on desktop, in an in-app webview, or who's already added the
 * app to their home screen is silently skipped.
 */
export function useInstallNudge() {
  const { available, mounted } = usePWAInstall();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!mounted || !available) {
      setShouldShow(false);
      return;
    }
    try {
      setShouldShow(!localStorage.getItem(DISMISS_KEY));
    } catch {
      setShouldShow(false);
    }
  }, [mounted, available]);

  function dismiss(persist = false) {
    if (persist) {
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        // private browsing / quota — ok, just don't persist
      }
    }
    setShouldShow(false);
  }

  return { shouldShow, dismiss };
}

interface Props {
  onContinue: (persist: boolean) => void;
}

export function InstallNudge({ onContinue }: Props) {
  const { install, isIOS } = usePWAInstall();
  const [iosSteps, setIosSteps] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  async function handleInstall() {
    setBusy(true);
    const result = await install();
    setBusy(false);
    if (result === "ios-instructions") {
      setIosSteps(true);
    } else if (result === "accepted") {
      onContinue(true);
    }
  }

  function handleDismiss() {
    onContinue(dontShowAgain);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save to home screen"
      className="fixed inset-0 z-[2000] bg-ink/55 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full sm:max-w-[400px]
          min-h-[64vh] sm:min-h-0
          bg-bg rounded-t-3xl sm:rounded-3xl
          shadow-cta relative overflow-hidden
          welcome-fade
        "
        style={{ animationDelay: "0ms" }}
      >
        <div className="welcome-bg" aria-hidden />
        <div className="relative px-7 pt-9 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col min-h-[64vh] sm:min-h-0">
          {iosSteps ? (
            <IOSSteps onContinue={() => onContinue(true)} />
          ) : (
            <>
              <div className="mb-4 flex justify-center">
                <Mark />
              </div>

              <div className="text-[10px] text-accent font-semibold tracking-cadence uppercase text-center">
                For the best experience
              </div>
              <h2 className="text-center text-[24px] font-semibold tracking-tighter leading-[1.1] mt-1.5 text-ink">
                Save <span className="text-ink">tre</span><span className="text-accent">.ai</span> to your home screen
              </h2>
              <p className="text-center text-[13px] text-ink2 leading-[1.45] mt-2 max-w-[300px] mx-auto">
                Fullscreen, no browser chrome, faster launches in the field.
              </p>

              <button
                type="button"
                disabled={busy}
                onClick={handleInstall}
                className="
                  mt-5 w-full bg-ink text-white rounded-2xl p-4
                  flex justify-between items-center font-semibold
                  shadow-cta active:scale-[.98] transition-transform
                  disabled:opacity-60 disabled:scale-100
                "
              >
                <span className="text-[14px] tracking-tight2">
                  {busy ? "Opening installer…" : isIOS ? "Show me how" : "Save to home screen"}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="mt-3 w-full text-center text-[12px] text-mute font-medium py-2 hover:text-ink2 transition-colors"
              >
                Maybe later
              </button>

              <div className="mt-auto pt-6 flex justify-center">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <span className="relative flex-none">
                    <input
                      type="checkbox"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="
                      block w-4 h-4 rounded
                      border border-rule bg-card
                      peer-checked:bg-ink peer-checked:border-ink
                      transition-colors
                    " />
                    <svg
                      viewBox="0 0 16 16"
                      className="absolute inset-0 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      fill="none"
                    >
                      <path d="M3.5 8.5L7 12l5.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[12px] text-ink2 font-medium">Don&apos;t show this message again</span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Mark() {
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon.png"
        alt="tre.ai app icon"
        width={88}
        height={88}
        className="
          w-[88px] h-[88px] rounded-[20px] object-cover
          shadow-[0_8px_24px_rgba(16,20,24,.18),0_2px_6px_rgba(16,20,24,.10)]
        "
      />
    </div>
  );
}

function IOSSteps({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <div className="text-[10px] text-accent font-semibold tracking-cadence uppercase text-center">Two taps in Safari</div>
      <h2 className="text-center text-[22px] font-semibold tracking-tightx leading-tight mt-1.5 text-ink">
        Add to your home screen
      </h2>
      <p className="text-center text-[12px] text-mute leading-snug mt-1.5 max-w-[300px] mx-auto">
        iOS doesn&apos;t let apps trigger this directly — here&apos;s the path.
      </p>
      <ol className="flex flex-col gap-3 mt-5">
        <li className="flex items-start gap-3 bg-card border border-rule rounded-xl p-3">
          <span className="flex-none w-7 h-7 rounded-full bg-ink text-white text-[12px] font-bold flex items-center justify-center mt-px">1</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink tracking-tight2 leading-tight">Tap the Share button</div>
            <div className="text-[11px] text-mute mt-0.5">It&apos;s in the Safari toolbar at the bottom of the screen.</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="flex-none w-6 h-6 text-accent mt-1" aria-hidden>
            <path d="M12 3v12m0-12l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </li>
        <li className="flex items-start gap-3 bg-card border border-rule rounded-xl p-3">
          <span className="flex-none w-7 h-7 rounded-full bg-ink text-white text-[12px] font-bold flex items-center justify-center mt-px">2</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink tracking-tight2 leading-tight">Choose &ldquo;Add to Home Screen&rdquo;</div>
            <div className="text-[11px] text-mute mt-0.5">Scroll the action sheet if it&apos;s not on the first row.</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="flex-none w-6 h-6 text-accent mt-1" aria-hidden>
            <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </li>
      </ol>
      <button
        type="button"
        onClick={onContinue}
        className="mt-6 w-full bg-ink text-white rounded-2xl py-3 text-[14px] font-semibold tracking-tight2 active:scale-[.98] transition-transform"
      >
        Got it, continue
      </button>
    </>
  );
}
