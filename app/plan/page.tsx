"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AREAS } from "@/lib/data/areas";
import { cx } from "@/lib/utils";
import type { AreaSlug } from "@/lib/types";

const RANGE_OPTIONS = [10, 25, 50, 100];

export default function PlanTripPage() {
  const router = useRouter();
  const [range, setRange] = useState(25);
  const [activeAreas, setActiveAreas] = useState<Record<AreaSlug, boolean>>(
    () => Object.fromEntries(AREAS.map(a => [a.slug, true])) as Record<AreaSlug, boolean>
  );

  const totals = useMemo(() => {
    let areas = 0, prospects = 0;
    for (const a of AREAS) {
      if (activeAreas[a.slug]) {
        areas++;
        prospects += a.count;
      }
    }
    return { areas, prospects };
  }, [activeAreas]);

  function toggleArea(slug: AreaSlug) {
    setActiveAreas(s => ({ ...s, [slug]: !s[slug] }));
  }

  function startTrip() {
    const params = new URLSearchParams({
      range: String(range),
      areas: AREAS.filter(a => activeAreas[a.slug]).map(a => a.slug).join(","),
    });
    router.push(`/scout?${params.toString()}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-3.5 pb-0.5">
        <div className="text-[11px] text-accent font-semibold tracking-cadence uppercase">New trip</div>
        <h2 className="text-[30px] font-semibold tracking-tighter mt-1 leading-[1.05]">
          Where are you<br />headed?
        </h2>
        <p className="text-[13px] text-mute mt-1.5">Anchor a city. We&apos;ll show you the cities around it.</p>
      </div>

      {/* City input */}
      <div className="mx-6 mt-4.5 bg-card border border-rule rounded-2xl px-4 py-3.5 flex items-center gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-none text-accent">
          <path d="M12 21s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" stroke="currentColor" strokeWidth="1.6"/>
          <circle cx="12" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
        <div>
          <div className="text-[18px] font-semibold tracking-tightx text-ink">Detroit, MI</div>
          <div className="text-[11px] text-mute font-medium tracking-[.04em] uppercase mt-px">Wayne County · pop. 632k</div>
        </div>
        <span className="ml-auto text-[11px] font-semibold text-accent tracking-[.04em] uppercase">Change</span>
      </div>

      {/* Range row */}
      <div className="px-6 pt-4.5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] text-mute font-semibold tracking-[.1em] uppercase">Drive radius</span>
          <b className="text-[13px] text-ink font-semibold tracking-tight2">{range} miles</b>
        </div>
        <div className="flex gap-1.5">
          {RANGE_OPTIONS.map(v => (
            <button
              key={v}
              onClick={() => setRange(v)}
              className={cx(
                "flex-1 text-[12px] font-medium rounded-full py-2 border transition-colors active:scale-[.95]",
                range === v
                  ? "bg-ink text-white border-ink"
                  : "bg-card text-ink2 border-rule"
              )}
            >
              {v}mi
            </button>
          ))}
        </div>
      </div>

      {/* Radius diagram */}
      <div className="mx-6 mt-3.5 h-[130px] rounded-2xl border border-rule overflow-hidden relative bg-gradient-to-b from-[#E7DFD2] to-[#DCD3C2]">
        <svg viewBox="0 0 320 130" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,.55)" />
            </pattern>
          </defs>
          <rect width="320" height="130" fill="url(#dots)" />
          <circle cx="160" cy="70" r="58" fill="rgba(31,78,95,.12)" stroke="rgba(31,78,95,.5)" strokeWidth="1.2" strokeDasharray="3 3"/>
          <circle cx="160" cy="70" r="3" fill="#101418"/>
          <circle cx="118" cy="58" r="3" fill="#101418"/>
          <circle cx="200" cy="42" r="3" fill="#101418"/>
          <circle cx="98"  cy="38" r="3" fill="#101418"/>
          <circle cx="84"  cy="62" r="3" fill="#101418"/>
          <text x="160" y="64" fill="#101418" fontFamily="Inter" fontSize="9" fontWeight="700" textAnchor="middle">DETROIT</text>
          <text x="118" y="52" fill="#3A4047" fontFamily="Inter" fontSize="8" fontWeight="600" textAnchor="middle">Dearborn</text>
          <text x="200" y="36" fill="#3A4047" fontFamily="Inter" fontSize="8" fontWeight="600" textAnchor="middle">Warren</text>
          <text x="98"  y="32" fill="#3A4047" fontFamily="Inter" fontSize="8" fontWeight="600" textAnchor="middle">Livonia</text>
          <text x="80"  y="56" fill="#3A4047" fontFamily="Inter" fontSize="8" fontWeight="600" textAnchor="middle">Farm. Hills</text>
        </svg>
      </div>

      {/* Areas */}
      <div className="px-6 pt-4.5 pb-3.5">
        <div className="flex justify-between items-baseline mb-2">
          <b className="text-[13px] font-semibold tracking-tight2">Areas in range</b>
          <span className="text-[11px] text-mute">Tap to toggle</span>
        </div>
        {AREAS.map(area => {
          const on = activeAreas[area.slug];
          return (
            <button
              key={area.slug}
              onClick={() => toggleArea(area.slug)}
              className="w-full flex items-center gap-3 py-2.5 border-b border-rule last:border-b-0 text-left"
            >
              <div className="flex-1">
                <b className={cx("block text-[14px] font-semibold tracking-tight2", on ? "text-ink" : "text-mute")}>
                  {area.name}
                </b>
                <div className="text-[11px] text-mute mt-px">{area.meta}</div>
              </div>
              <div className={cx("w-[38px] text-right text-[13px] font-bold tracking-tightx", on ? "text-ink" : "text-mute")}>
                {area.count}
                <small className="block text-[9px] text-mute font-medium uppercase tracking-[.06em] mt-px">
                  {area.count === 1 ? "lead" : "leads"}
                </small>
              </div>
              <span
                className={cx(
                  "flex-none relative w-9 h-[22px] rounded-full transition-colors",
                  on ? "bg-ink" : "bg-black/[.12]"
                )}
                aria-hidden
              >
                <span
                  className={cx(
                    "absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all",
                    on ? "left-4" : "left-0.5"
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* Start trip */}
      <button
        onClick={startTrip}
        className="
          mx-6 mt-2 mb-6
          bg-ink text-white rounded-2xl p-4
          flex justify-between items-center font-semibold
          shadow-cta active:scale-[.98] transition-transform
          w-[calc(100%-3rem)]
        "
      >
        <span className="text-[15px] tracking-tight2">Start trip</span>
        <span className="text-[11px] opacity-70 font-medium">{totals.areas} areas · {totals.prospects} prospects</span>
      </button>
    </div>
  );
}
