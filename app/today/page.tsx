"use client";
import { useState } from "react";
import { cx } from "@/lib/utils";

type StopState = "queued" | "next" | "done";

interface Stop {
  time: string;
  badge: string;        // "visited" | "next" | ""
  title: string;        // "Burton's Plumbing · Dearborn"
  meta: string;
  initialState: StopState;
}

const SEED_STOPS: Stop[] = [
  { time: "9:00",  badge: "visited", title: "Burton's Plumbing · Dearborn", meta: "Family — short visit, polite no.", initialState: "done" },
  { time: "10:30", badge: "next",    title: "Kennedy Plumbing · Livonia",   meta: "Paul Kennedy · 17 mi · score 88",  initialState: "next" },
  { time: "1:00",  badge: "",        title: "National Heating · Detroit",   meta: "Cold visit · est. 1958 · score 82", initialState: "queued" },
  { time: "3:00",  badge: "",        title: "Leonard Machine · Warren",     meta: "Cold visit · est. 1951 · score 76", initialState: "queued" },
];

export default function TodayPage() {
  const [stops, setStops] = useState<{ state: StopState }[]>(
    SEED_STOPS.map(s => ({ state: s.initialState }))
  );

  function cycle(idx: number) {
    setStops(curr => curr.map((s, i) => {
      if (i !== idx) return s;
      const order: StopState[] = ["queued", "next", "done"];
      const next = order[(order.indexOf(s.state) + 1) % order.length];
      return { state: next };
    }));
  }

  return (
    <div>
      <div className="px-6 pt-3.5 text-[11px] text-accent font-semibold tracking-cadence uppercase">
        Detroit Trip · Day 1 of 4
      </div>
      <div className="px-6 pt-1 pb-2 flex justify-between items-end">
        <div>
          <div className="text-[12px] text-mute uppercase tracking-[.1em] font-semibold">Thursday · May 7</div>
          <h2 className="text-[22px] font-semibold tracking-tightx mt-0.5">4 stops · 42 mi</h2>
        </div>
        <div className="text-[11px] text-ink2 text-right">
          <div className="font-semibold text-ink text-[12px]">1 of 4 done</div>
          <div>Next at <b className="text-ink">10:30</b></div>
        </div>
      </div>

      {/* Map */}
      <div className="mx-6 h-[180px] rounded-2xl border border-rule overflow-hidden relative bg-gradient-to-b from-[#DDE5E2] to-[#CAD3CE]">
        <svg viewBox="0 0 320 180" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="g2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" stroke="rgba(255,255,255,.45)" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="320" height="180" fill="url(#g2)" />
          <path d="M50 140 Q100 100 140 110 T220 70 Q260 50 285 60" stroke="#101418" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M50 140 Q100 100 140 110" stroke="#3F8160" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
        <Pin n={1} top={120} left={42} variant="green" />
        <Pin n={2} top={90}  left={130} />
        <Pin n={3} top={52}  left={215} variant="warm" />
        <Pin n={4} top={42}  left={275} variant="warm" />
      </div>

      {/* Stops */}
      <div className="px-6 py-3.5 flex flex-col gap-2.5">
        {SEED_STOPS.map((s, i) => {
          const state = stops[i]?.state ?? s.initialState;
          return (
            <div key={i} className="flex gap-3.5 items-start">
              <div className="text-[11px] font-semibold text-mute w-12 flex-none pt-3.5">
                <strong className="block text-ink text-[14px] font-bold">{s.time}</strong>
                {state === "next" ? "next" : state === "done" ? "visited" : ""}
              </div>
              <button
                onClick={() => cycle(i)}
                className={cx(
                  "flex-1 bg-card rounded-xl border px-3.5 py-3 flex justify-between items-center text-left active:scale-[.985] transition-transform",
                  state === "next"
                    ? "border-ink shadow-next"
                    : state === "done"
                    ? "border-green/[.25] bg-green/[.05]"
                    : "border-rule"
                )}
              >
                <div>
                  <h4 className={cx(
                    "m-0 text-[13px] font-semibold tracking-tight2",
                    state === "done" ? "line-through text-mute" : ""
                  )}>{s.title}</h4>
                  <div className="text-[11px] text-mute mt-0.5">{s.meta}</div>
                </div>
                <div className={cx(
                  "text-[10px] font-semibold uppercase tracking-[.06em]",
                  state === "next" ? "text-ink" :
                  state === "done" ? "text-green" : "text-mute"
                )}>
                  {state === "next" ? "NEXT ↗" : state === "done" ? "DONE" : "QUEUED"}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Pin({ n, top, left, variant }: { n: number; top: number; left: number; variant?: "green" | "warm" }) {
  const bg = variant === "green" ? "bg-green" : variant === "warm" ? "bg-warm" : "bg-ink";
  return (
    <div
      className={cx(
        "absolute w-7 h-7 rounded-[50%_50%_50%_0] -rotate-45 flex items-center justify-center text-white text-[11px] font-bold shadow-lg",
        bg
      )}
      style={{ top, left }}
    >
      <span className="rotate-45">{n}</span>
    </div>
  );
}
