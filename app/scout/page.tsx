"use client";
import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { rankedProspects } from "@/lib/data/prospects";
import { AREAS } from "@/lib/data/areas";
import { ProspectCard } from "@/components/ProspectCard";
import { cx } from "@/lib/utils";
import type { AreaSlug } from "@/lib/types";

function ScoutInner() {
  const params = useSearchParams();
  const range = params?.get("range") ?? "25";
  const areasParam = params?.get("areas")?.split(",") ?? AREAS.map(a => a.slug);
  const includedAreas = new Set(areasParam);

  const [activeArea, setActiveArea] = useState<string>("all");
  const [filters, setFilters] = useState<Record<string, boolean>>({
    "exit-ready": true, trades: false, mfg: false, "owner-led": false,
  });

  const baseList = useMemo(
    () => rankedProspects().filter(p => includedAreas.has(p.area)),
    [includedAreas] // intentionally depends on the set's identity per render
  );
  const visibleList = useMemo(
    () => activeArea === "all" ? baseList : baseList.filter(p => p.area === activeArea),
    [activeArea, baseList]
  );

  const visibleAreas = AREAS.filter(a => includedAreas.has(a.slug));
  const totalCount = baseList.length;

  return (
    <div>
      {/* Trip banner */}
      <div className="px-6 pt-3 pb-3.5 flex justify-between items-start gap-3 border-b border-rule">
        <div>
          <div className="text-[11px] text-accent font-semibold tracking-cadence uppercase">📍 Detroit Trip</div>
          <h2 className="text-[24px] font-semibold tracking-tightx mt-0.5 leading-[1.05]">
            {totalCount} prospects
          </h2>
          <div className="text-[12px] text-mute mt-1">
            <b className="text-ink font-semibold">{range} mi</b> · {visibleAreas.length} areas · day 1
          </div>
        </div>
        <Link
          href="/plan"
          className="flex-none text-[11px] font-semibold text-accent tracking-[.04em] uppercase bg-accent/[.08] px-2.5 py-1.5 rounded-full"
        >
          Edit
        </Link>
      </div>

      {/* Area strip */}
      <div className="px-6 py-2.5 flex gap-1.5 overflow-x-auto no-scrollbar border-b border-rule">
        <AreaPill onClick={() => setActiveArea("all")} active={activeArea === "all"} name="All" count={`${totalCount} prospects`} />
        {visibleAreas.map(a => (
          <AreaPill
            key={a.slug}
            onClick={() => setActiveArea(a.slug)}
            active={activeArea === a.slug}
            name={a.shortName ?? a.name}
            count={String(a.count)}
          />
        ))}
      </div>

      {/* Filter chips */}
      <div className="px-6 py-2.5 flex gap-1.5 flex-wrap">
        {[
          { key: "exit-ready", label: "Exit-ready" },
          { key: "trades",     label: "Trades" },
          { key: "mfg",        label: "Mfg" },
          { key: "owner-led",  label: "Owner-led" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilters(s => ({ ...s, [f.key]: !s[f.key] }))}
            className={cx(
              "text-[11px] rounded-full px-2.5 py-1.5 font-medium border transition-colors active:scale-[.95]",
              filters[f.key]
                ? "bg-ink text-white border-ink"
                : "bg-card text-ink2 border-rule"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="px-6 pb-3 flex flex-col gap-2.5">
        <div className="text-[11px] uppercase tracking-[.1em] text-mute font-semibold mt-1.5 flex justify-between items-center">
          <span>Top of the list</span>
          <span className="text-mute font-medium normal-case tracking-normal">{visibleList.length} real businesses</span>
        </div>
        {visibleList.map(p => (
          <ProspectCard key={p.id} prospect={p} />
        ))}
      </div>
    </div>
  );
}

function AreaPill({ onClick, active, name, count }: { onClick: () => void; active: boolean; name: string; count: string }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex-none rounded-xl px-3 py-2 text-left border transition-colors active:scale-[.95]",
        active ? "bg-ink border-ink" : "bg-card border-rule"
      )}
    >
      <div className={cx("text-[11px] font-semibold tracking-tight2", active ? "text-white" : "text-ink")}>
        {name}
      </div>
      <div className={cx("text-[10px] font-medium mt-px", active ? "text-white/70" : "text-mute")}>
        {count}
      </div>
    </button>
  );
}

export default function ScoutPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-mute text-sm">Loading…</div>}>
      <ScoutInner />
    </Suspense>
  );
}
