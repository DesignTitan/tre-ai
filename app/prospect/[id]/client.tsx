"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { findProspect } from "@/lib/data/prospects";
import { findArea } from "@/lib/data/areas";
import { ScoreRing } from "@/components/ScoreRing";
import { yearsSince, formatRevenueBand } from "@/lib/utils";

export default function ProspectDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const p = findProspect(id);
  const [showToast, setShowToast] = useState(false);

  if (!p) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-mute text-sm">Prospect not found.</p>
        <Link href="/scout" className="inline-block mt-4 text-accent text-sm font-semibold">‹ Back to Scout</Link>
      </div>
    );
  }

  const area = findArea(p.area);

  function addToToday() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-6 pt-2 flex justify-between text-[13px] text-accent font-semibold">
        <button onClick={() => router.back()} className="active:translate-x-[-2px] transition-transform">‹ Detroit Trip</button>
        <span className="text-mute font-medium">Save · Share</span>
      </div>

      {/* Hero */}
      <div className="px-6 pt-3.5 pb-1.5">
        <span className="
          inline-block mb-1.5
          text-[10px] font-semibold uppercase tracking-[.04em]
          text-accent bg-accent/[.09] px-1.5 py-[2px] rounded
        ">
          {area?.name}{p.distanceMi !== undefined ? ` · ${p.distanceMi}mi` : ""}
        </span>
        <h3
          className="text-[22px] font-semibold tracking-tightx leading-[1.15] m-0"
          dangerouslySetInnerHTML={{ __html: p.name }}
        />
        <div className="text-[12px] text-mute mt-1">
          {p.industry} · est. {p.founded} · {yearsSince(p.founded)} yrs
          {p.revenueEstimate ? ` · ${formatRevenueBand(p.revenueEstimate)}` : ""}
        </div>
      </div>

      {/* Score + why */}
      <div className="flex gap-3.5 items-center px-6 pt-3.5 pb-2.5">
        <ScoreRing score={p.score} />
        <div className="flex-1">
          <div className="text-[11px] text-mute uppercase tracking-[.1em] font-semibold">Why this one</div>
          <div className="text-[13px] text-ink font-medium leading-[1.4] mt-0.5">{p.whyOneLine}</div>
        </div>
      </div>

      {/* Signals */}
      <div className="px-6 pt-4.5">
        <h5 className="text-[11px] uppercase tracking-[.12em] text-mute font-bold mb-2.5 mt-0">Signal breakdown</h5>
        {p.signals.map((s, i) => (
          <div key={i} className="flex justify-between items-start py-2.5 border-b border-rule last:border-b-0 gap-2.5">
            <div className="flex-1 text-[12px] text-ink2 leading-[1.35]">
              <b className="text-ink font-semibold block mb-px text-[13px]">{s.label}</b>
              {s.detail}
              <cite className="block not-italic text-[10px] text-mute mt-0.5 tracking-[.04em]">{s.source}</cite>
            </div>
            <div className="flex-none w-[60px] h-1 bg-black/[.08] rounded mt-2 relative overflow-hidden">
              <i className="absolute left-0 top-0 bottom-0 bg-ink rounded" style={{ width: `${s.weight}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="px-6 pt-3.5 pb-6 flex gap-2">
        <button
          onClick={addToToday}
          className="flex-1 bg-ink text-white font-semibold text-[13px] p-3.5 rounded-xl active:scale-[.97] transition-transform"
        >
          Add to Today
        </button>
        <button
          onClick={() => router.back()}
          className="flex-1 border border-ink text-ink font-semibold text-[13px] p-3.5 rounded-xl active:scale-[.97] transition-transform"
        >
          Notes
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="
          absolute bottom-24 left-1/2 -translate-x-1/2
          bg-ink text-white text-[13px] font-medium tracking-tight2
          px-4 py-2.5 rounded-xl
          shadow-lg
          animate-[slide-in_.25s_cubic-bezier(.32,.72,0,1)]
        ">
          Added to Today&apos;s route
        </div>
      )}
    </div>
  );
}
