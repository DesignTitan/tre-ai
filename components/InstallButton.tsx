"use client";
import { useState } from "react";
import { usePWAInstall } from "@/lib/usePWAInstall";

export function InstallButton({ className = "" }: { className?: string }) {
  const { available, install, isIOS } = usePWAInstall();
  const [showIOS, setShowIOS] = useState(false);

  if (!available) return null;

  async function handleClick() {
    const result = await install();
    if (result === "ios-instructions") setShowIOS(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          "inline-flex items-center justify-center gap-2 " +
          "text-[11px] font-semibold tracking-[.04em] uppercase " +
          "text-accent bg-accent/[.08] hover:bg-accent/[.14] active:scale-[.98] " +
          "px-3 py-2 rounded-full transition-all " +
          className
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Save to home screen
      </button>

      {showIOS && (
        <IOSInstallSheet onClose={() => setShowIOS(false)} />
      )}
    </>
  );
}

function IOSInstallSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[2000] bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="
          w-full sm:max-w-[380px]
          bg-bg rounded-t-3xl sm:rounded-3xl
          p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]
          shadow-cta
          relative
          welcome-fade
        "
        style={{ animationDelay: "0ms" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <div className="text-[10px] font-semibold tracking-cadence uppercase text-accent">Install</div>
            <h3 className="text-[20px] font-semibold tracking-tightx mt-0.5 leading-tight">
              Add tre.ai to your home screen
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-none w-8 h-8 rounded-full hover:bg-black/[.04] flex items-center justify-center text-mute text-[18px]"
          >
            ×
          </button>
        </div>
        <p className="text-[12px] text-mute leading-snug mt-1 mb-4">
          iOS doesn&apos;t let apps trigger this directly — two taps in Safari and you&apos;re done.
        </p>

        <ol className="flex flex-col gap-3">
          <li className="flex items-start gap-3 bg-card border border-rule rounded-xl p-3">
            <span className="flex-none w-7 h-7 rounded-full bg-ink text-white text-[12px] font-bold flex items-center justify-center mt-px">1</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink tracking-tight2 leading-tight">Tap the Share button</div>
              <div className="text-[11px] text-mute mt-0.5">It&apos;s in the Safari toolbar at the bottom of the screen.</div>
            </div>
            <ShareIcon className="flex-none w-6 h-6 text-accent mt-1" />
          </li>
          <li className="flex items-start gap-3 bg-card border border-rule rounded-xl p-3">
            <span className="flex-none w-7 h-7 rounded-full bg-ink text-white text-[12px] font-bold flex items-center justify-center mt-px">2</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink tracking-tight2 leading-tight">Choose &ldquo;Add to Home Screen&rdquo;</div>
              <div className="text-[11px] text-mute mt-0.5">Scroll the action sheet if you don&apos;t see it right away.</div>
            </div>
            <HomeIcon className="flex-none w-6 h-6 text-accent mt-1" />
          </li>
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full bg-ink text-white rounded-2xl py-3 text-[14px] font-semibold tracking-tight2 active:scale-[.98] transition-transform"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3v12m0-12l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
