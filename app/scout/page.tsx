"use client";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ProspectCard } from "@/components/ProspectCard";
import { cacheCrawledProspects } from "@/lib/data/cache";
import { cx } from "@/lib/utils";
import type { CrawlResult, Prospect } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView").then(m => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#E8E2D6] text-[11px] text-mute font-semibold tracking-[.1em] uppercase">
      Loading map…
    </div>
  ),
});

type ViewMode = "split" | "map" | "list";

function ScoutInner() {
  const params = useSearchParams();
  const q = params?.get("q") ?? "";
  const radius = Math.max(1, Math.min(50, Number(params?.get("radius") ?? "10")));

  const [data, setData] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>("split");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<"score" | "distance">("score");
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    setSelectedId(null);
    fetch(`/api/crawl?q=${encodeURIComponent(q)}&radius=${radius}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? "crawl failed");
        return (await r.json()) as CrawlResult;
      })
      .then((d) => {
        if (cancelled) return;
        const toCache = [...d.prospects, ...(d.nearestBusiness ? [d.nearestBusiness] : [])];
        cacheCrawledProspects(toCache);
        setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "crawl failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, radius]);

  const allProspects = data?.prospects ?? [];
  const prospects = useMemo(() => {
    let list = minScore > 0 ? allProspects.filter(p => p.score >= minScore) : allProspects.slice();
    if (sortBy === "distance") {
      list.sort((a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity));
    } else {
      list.sort((a, b) => b.score - a.score);
    }
    return list;
  }, [allProspects, minScore, sortBy]);
  const placeName = useMemo(() => {
    if (!data) return q || "Trip";
    const parts = data.location.displayName.split(",").map(s => s.trim());
    if (data.location.type === "zip") return `${data.location.query} · ${parts[1] ?? parts[0]}`;
    return parts.slice(0, 2).join(", ");
  }, [data, q]);

  function selectProspect(id: string) {
    setSelectedId(id);
    const el = cardRefs.current.get(id);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // In Map view, keep a card always visible — auto-select the top prospect
  // if none is selected. Tapping a marker swaps the card; tapping × clears
  // (and the next render auto-picks the top one again).
  useEffect(() => {
    if (view === "map" && !selectedId && prospects.length > 0) {
      setSelectedId(prospects[0].id);
    }
  }, [view, selectedId, prospects]);

  if (!q) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-mute text-sm">No trip yet.</p>
        <Link href="/plan" className="inline-block mt-4 text-accent text-sm font-semibold">Start a trip ›</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {data && !loading && (
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="View and filter options"
          className="
            absolute top-3 right-4 z-[1090]
            w-11 h-11 rounded-full
            bg-card/95 backdrop-blur
            border border-rule
            shadow-cta
            flex items-center justify-center
            text-ink active:scale-[.95] transition-transform
          "
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 6h12M3 12h8M3 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.8" fill="#F4F1EC" />
            <circle cx="14" cy="12" r="2" stroke="currentColor" strokeWidth="1.8" fill="#F4F1EC" />
            <circle cx="20" cy="18" r="2" stroke="currentColor" strokeWidth="1.8" fill="#F4F1EC" />
          </svg>
        </button>
      )}

      {menuOpen && (
        <ViewMenu
          view={view}
          onView={(v) => setView(v)}
          minScore={minScore}
          onMinScore={setMinScore}
          sortBy={sortBy}
          onSortBy={setSortBy}
          totalCount={allProspects.length}
          filteredCount={prospects.length}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {error && (
        <div className="px-6 py-4 text-[13px] text-red font-medium">
          Crawl failed: {error}
        </div>
      )}

      {loading && <CrawlLoader />}

      {data && !loading && view === "list" && (
        <div className="flex-1 overflow-y-auto px-6 pt-3 pb-6 flex flex-col gap-2.5">
          <div className="text-[11px] uppercase tracking-[.1em] text-mute font-semibold flex justify-between items-center sticky top-0 bg-bg py-1.5 -mt-1.5">
            <span>Top of the list</span>
            <span className="text-mute font-medium normal-case tracking-normal">
              {prospects.length} crawled
            </span>
          </div>
          {prospects.length === 0 ? (
            <EmptyState radius={data.radiusMi} nearest={data.nearestBusiness} />
          ) : (
            prospects.map(p => (
              <CardSlot
                key={p.id}
                prospect={p}
                selected={selectedId === p.id}
                onSelect={selectProspect}
                setRef={(el) => {
                  if (el) cardRefs.current.set(p.id, el);
                  else cardRefs.current.delete(p.id);
                }}
              />
            ))
          )}
        </div>
      )}

      {data && !loading && view !== "list" && (
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0">
            <MapView
              centerLat={data.location.lat}
              centerLng={data.location.lng}
              radiusMi={data.radiusMi}
              prospects={prospects}
              selectedId={selectedId}
              onSelect={selectProspect}
              className="h-full w-full"
            />
          </div>

          {view === "split" && (
            <SplitSheet
              placeName={placeName}
              radius={data.radiusMi}
              autoExpanded={data.autoExpanded}
              requestedRadiusMi={data.requestedRadiusMi}
              nearest={data.nearestBusiness}
              prospects={prospects}
              selectedId={selectedId}
              onSelect={selectProspect}
              cardRefs={cardRefs}
            />
          )}

          {view === "map" && selectedId && (
            <SelectedSheet
              prospect={prospects.find(p => p.id === selectedId)!}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CardSlot({
  prospect,
  selected,
  onSelect,
  setRef,
}: {
  prospect: Prospect;
  selected: boolean;
  onSelect: (id: string) => void;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={setRef}
      onMouseEnter={() => onSelect(prospect.id)}
      onClick={() => onSelect(prospect.id)}
      className={cx(
        "rounded-2xl transition-shadow",
        selected ? "ring-2 ring-ink shadow-lg" : ""
      )}
    >
      <ProspectCard prospect={prospect} />
    </div>
  );
}

function SelectedSheet({ prospect, onClose }: { prospect: Prospect; onClose: () => void }) {
  return (
    <div className="absolute bottom-3 left-0 right-0 px-3 z-[1050] pointer-events-none">
      <div className="pointer-events-auto bg-card/95 backdrop-blur border border-rule rounded-2xl shadow-cta p-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-mute font-semibold tracking-[.04em] uppercase">{prospect.industry}</div>
          <h4 className="text-[14px] font-semibold tracking-tight2 leading-tight truncate">{prospect.name}</h4>
          {prospect.address && (
            <div className="text-[11px] text-mute mt-0.5 truncate">{prospect.address}</div>
          )}
        </div>
        <Link
          href={`/prospect/${prospect.id}`}
          className="text-[11px] font-semibold text-accent tracking-[.04em] uppercase bg-accent/[.08] px-2.5 py-1.5 rounded-full whitespace-nowrap"
        >
          Open
        </Link>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-[11px] text-mute font-semibold px-2 py-1.5"
        >
          ×
        </button>
      </div>
    </div>
  );
}

const SNAP_POINTS = [25, 58, 88]; // collapsed / default / expanded

function ViewMenu({
  view,
  onView,
  minScore,
  onMinScore,
  sortBy,
  onSortBy,
  totalCount,
  filteredCount,
  onClose,
}: {
  view: ViewMode;
  onView: (v: ViewMode) => void;
  minScore: number;
  onMinScore: (v: number) => void;
  sortBy: "score" | "distance";
  onSortBy: (v: "score" | "distance") => void;
  totalCount: number;
  filteredCount: number;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="View and filter options"
      className="fixed inset-0 z-[2000] bg-ink/45 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full sm:max-w-[400px]
          bg-bg rounded-t-3xl sm:rounded-3xl
          shadow-cta relative
          welcome-fade
        "
        style={{ animationDelay: "0ms" }}
      >
        <div className="welcome-bg" aria-hidden />
        <div className="relative px-6 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex justify-center pb-2">
            <span className="block w-12 h-[5px] bg-ink/20 rounded-full" />
          </div>

          <ViewSection title="View">
            {(["split", "map", "list"] as ViewMode[]).map((v) => (
              <Chip key={v} active={view === v} onClick={() => onView(v)}>
                {v === "split" ? "Split" : v === "map" ? "Map" : "List"}
              </Chip>
            ))}
          </ViewSection>

          <ViewSection title="Min score">
            {[
              { v: 0, label: "All" },
              { v: 50, label: "50+" },
              { v: 60, label: "60+" },
              { v: 70, label: "70+" },
              { v: 80, label: "80+" },
            ].map(({ v, label }) => (
              <Chip key={v} active={minScore === v} onClick={() => onMinScore(v)}>
                {label}
              </Chip>
            ))}
          </ViewSection>

          <ViewSection title="Sort by">
            {([
              { v: "score" as const, label: "Score" },
              { v: "distance" as const, label: "Distance" },
            ]).map(({ v, label }) => (
              <Chip key={v} active={sortBy === v} onClick={() => onSortBy(v)}>
                {label}
              </Chip>
            ))}
          </ViewSection>

          <div className="mt-5 flex items-center justify-between text-[12px] text-mute">
            <span>
              Showing <b className="text-ink font-semibold">{filteredCount}</b> of {totalCount}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="bg-ink text-white rounded-full text-[13px] font-semibold tracking-tight2 px-5 py-2 active:scale-[.97] transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-1">
      <div className="text-[10px] uppercase tracking-[.1em] text-mute font-semibold mb-1.5">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "text-[12px] font-semibold tracking-tight2 rounded-full px-3 py-1.5 border transition-colors active:scale-[.95]",
        active ? "bg-ink text-white border-ink" : "bg-card text-ink2 border-rule"
      )}
    >
      {children}
    </button>
  );
}

function SplitSheet({
  placeName,
  radius,
  autoExpanded,
  requestedRadiusMi,
  nearest,
  prospects,
  selectedId,
  onSelect,
  cardRefs,
}: {
  placeName: string;
  radius: number;
  autoExpanded?: boolean;
  requestedRadiusMi?: number;
  nearest?: Prospect;
  prospects: Prospect[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}) {
  const [heightPct, setHeightPct] = useState(58);
  const [dragging, setDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startPct: number; containerH: number; moved: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    const container = sheetRef.current?.parentElement;
    if (!container) return;
    dragRef.current = {
      startY: e.clientY,
      startPct: heightPct,
      containerH: container.clientHeight,
      moved: 0,
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    d.moved = Math.max(d.moved, Math.abs(dy));
    // Drag up (negative dy) → sheet grows (more list).
    // Drag down (positive dy) → sheet shrinks (more map).
    const next = d.startPct - (dy / d.containerH) * 100;
    setHeightPct(Math.max(12, Math.min(95, next)));
  }

  function onPointerUp() {
    const d = dragRef.current;
    setDragging(false);
    dragRef.current = null;
    if (!d) return;
    // Tap (no real drag) → cycle to next snap point.
    if (d.moved < 6) {
      const idx = SNAP_POINTS.findIndex(p => p === d.startPct);
      const nextIdx = idx === -1 ? 1 : (idx + 1) % SNAP_POINTS.length;
      setHeightPct(SNAP_POINTS[nextIdx]);
      return;
    }
    // Snap to nearest rest position.
    const closest = SNAP_POINTS.reduce((best, p) =>
      Math.abs(p - heightPct) < Math.abs(best - heightPct) ? p : best
    );
    setHeightPct(closest);
  }

  return (
    <div
      ref={sheetRef}
      className={cx(
        "absolute left-0 right-0 bottom-0 z-[1000]",
        "bg-bg rounded-t-3xl",
        "shadow-[0_-12px_30px_rgba(16,20,24,0.12)]",
        "flex flex-col",
        dragging ? "" : "transition-[height] duration-300 ease-out"
      )}
      style={{ height: `${heightPct}%` }}
    >
      <div
        role="separator"
        aria-label="Drag to resize sheet"
        aria-valuenow={Math.round(heightPct)}
        aria-valuemin={12}
        aria-valuemax={95}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ WebkitUserSelect: "none" }}
      >
        <div className="flex justify-center pt-2.5 pb-2.5 -mb-0.5">
          <span className="block w-12 h-[5px] bg-ink/20 rounded-full pointer-events-none" />
        </div>

        <div className="px-6 pt-0.5 pb-1 pointer-events-none">
          <span className="text-[10px] text-accent font-semibold tracking-cadence uppercase truncate block">
            {placeName} · {radius}mi
            {autoExpanded && requestedRadiusMi && (
              <span className="text-accent/70 ml-1.5 font-medium normal-case">expanded from {requestedRadiusMi}mi</span>
            )}
          </span>
        </div>
        <div className="px-6 pb-2 flex items-baseline justify-between gap-3 pointer-events-none">
          <h3 className="text-[20px] font-semibold tracking-tightx text-ink leading-tight">
            {prospects.length} prospects
          </h3>
        </div>
        <p className="px-6 pb-3 text-[11px] text-mute leading-snug pointer-events-none">
          Pan the map to scan the area. Tap a card or marker to highlight.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-3 pb-[calc(5rem+env(safe-area-inset-bottom))] flex flex-col gap-2.5 mt-1">
        {prospects.length === 0 ? (
          <EmptyState radius={radius} nearest={nearest} />
        ) : (
          prospects.map(p => (
            <CardSlot
              key={p.id}
              prospect={p}
              selected={selectedId === p.id}
              onSelect={onSelect}
              setRef={(el) => {
                if (el) cardRefs.current.set(p.id, el);
                else cardRefs.current.delete(p.id);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ radius, nearest }: { radius: number; nearest?: Prospect }) {
  return (
    <div className="bg-card border border-rule rounded-2xl p-5 mt-1">
      <div className="text-[13px] text-ink font-semibold tracking-tight2">
        No businesses within {radius} mi.
      </div>
      <p className="text-[12px] text-mute mt-1 leading-[1.5]">
        OpenStreetMap coverage is volunteer-thin in some rural areas. Widening the radius from <Link href="/plan" className="text-accent font-semibold">Plan</Link> usually catches the next commercial corridor.
      </p>
      {nearest && (
        <div className="mt-4 pt-4 border-t border-rule">
          <div className="text-[10px] uppercase tracking-[.1em] text-mute font-semibold mb-1.5">Closest business on record</div>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold tracking-tight2 text-ink leading-tight">{nearest.name}</div>
              <div className="text-[11px] text-mute mt-0.5">
                {nearest.industry}
                {nearest.address ? <> · {nearest.address}</> : null}
              </div>
              {nearest.distanceMi !== undefined && (
                <div className="text-[12px] text-accent font-semibold mt-1.5">
                  {nearest.distanceMi} mi away
                </div>
              )}
            </div>
            <Link
              href={`/prospect/${nearest.id}`}
              className="flex-none text-[11px] font-semibold text-accent tracking-[.04em] uppercase bg-accent/[.08] px-2.5 py-1.5 rounded-full"
            >
              Open
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CrawlLoader() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setElapsed((performance.now() - startRef.current) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Asymptotic progress — approaches but never reaches 100% until response lands.
  // tau = 5s => 63% at 5s, 86% at 10s, 95% at 15s.
  const progress = Math.min(0.92, 1 - Math.exp(-elapsed / 5));

  const stages: { from: number; label: string }[] = [
    { from: 0, label: "Geocoding location" },
    { from: 1.5, label: "Connecting to OpenStreetMap" },
    { from: 3, label: "Scanning POIs in radius" },
    { from: 7, label: "Filtering chains and franchises" },
    { from: 11, label: "Sorting by exit-readiness" },
    { from: 15, label: "Almost there" },
  ];
  const stage = [...stages].reverse().find(s => elapsed >= s.from)?.label ?? stages[0].label;

  return (
    <div className="px-6 pt-6 pb-8">
      <div
        role="progressbar"
        aria-label="Crawl progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="relative h-1 w-full bg-black/[.06] rounded-full overflow-hidden"
      >
        <div
          className="absolute inset-y-0 left-0 bg-ink rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent crawl-shimmer" />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div className="text-[13px] text-ink font-semibold tracking-tight2">
          {stage}
          <span className="inline-block ml-1 align-baseline">
            <span className="crawl-dot crawl-dot-1">.</span>
            <span className="crawl-dot crawl-dot-2">.</span>
            <span className="crawl-dot crawl-dot-3">.</span>
          </span>
        </div>
        <div className="text-[11px] text-mute font-medium tabular-nums">
          {elapsed.toFixed(1)}s
        </div>
      </div>

      <div className="mt-1 text-[11px] text-mute">
        First crawl of a city can take 5–15 seconds.
      </div>
    </div>
  );
}

export default function ScoutPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-mute text-sm">Loading…</div>}>
      <ScoutInner />
    </Suspense>
  );
}
