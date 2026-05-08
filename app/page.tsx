import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="absolute inset-0 overflow-hidden flex flex-col">
      <div className="welcome-bg" aria-hidden />

      <div className="flex-1 flex flex-col px-7 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))] relative z-10">
        <div className="welcome-fade" style={{ animationDelay: "0ms" }}>
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-cadence uppercase text-mute">
            <span className="w-[5px] h-[5px] rounded-full bg-accent inline-block" />
            tre.ai · field rep tool · v0.1
          </span>
        </div>

        <div className="mt-7 mb-2 flex justify-start welcome-fade" style={{ animationDelay: "120ms" }}>
          <RadarMark />
        </div>

        <div className="mt-auto">
          <h1
            className="welcome-fade text-[46px] font-semibold tracking-tighter leading-[.95] text-ink"
            style={{ animationDelay: "220ms" }}
          >
            Welcome to<br />
            <span className="text-ink">tre</span>
            <span className="text-accent">.ai</span>
            <span className="text-ink">.</span>
          </h1>

          <p
            className="welcome-fade mt-5 text-[15px] leading-[1.5] text-ink2"
            style={{ animationDelay: "340ms" }}
          >
            Land in any city. See the owners <em className="not-italic text-ink font-semibold whitespace-nowrap">most likely thinking</em> about an exit.
            Walk in pitch-ready.
          </p>

          <div className="welcome-fade mt-7" style={{ animationDelay: "460ms" }}>
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
          </div>

          <div
            className="welcome-fade mt-4 flex items-center gap-2 text-[10px] text-mute font-medium tracking-[.04em] uppercase"
            style={{ animationDelay: "620ms" }}
          >
            <span>Free public data</span>
            <span className="opacity-40">·</span>
            <span>OpenStreetMap + Overpass</span>
            <span className="opacity-40">·</span>
            <span>Scoring provisional</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarMark() {
  return (
    <div className="relative w-[140px] h-[140px] -ml-2">
      <svg viewBox="0 0 140 140" className="absolute inset-0">
        <g transform="translate(70 70)">
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              r={6}
              fill="none"
              stroke="#1F4E5F"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              className="welcome-pulse"
              style={{ animationDelay: `${i * 1.5}s` }}
            />
          ))}
          <circle r={5} fill="#101418" />
          <circle r={11} fill="none" stroke="#101418" strokeWidth="1.6" />
        </g>
      </svg>
    </div>
  );
}
