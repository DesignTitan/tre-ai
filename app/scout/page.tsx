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
        cacheCrawledProspects(d.prospects);
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

  const prospects = data?.prospects ?? [];
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

  if (!q) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-mute text-sm">No trip yet.</p>
        <Link href="/plan" className="inline-block mt-4 text-accent text-sm font-semibold">Start a trip ›</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-3 pb-3 flex justify-between items-start gap-3 border-b border-rule">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-accent font-semibold tracking-cadence uppercase truncate">
            {placeName} Trip
          </div>
          <h2 className="text-[22px] font-semibold tracking-tightx mt-0.5 leading-[1.05]">
            {loading ? "Crawling…" : `${prospects.length} prospects`}
          </h2>
          <div className="text-[12px] text-mute mt-0.5">
            <b className="text-ink font-semibold">{radius} mi</b>
            {data && <> · scanned {data.totalRaw} POIs · kept {data.filtered}</>}
          </div>
        </div>
        <Link
          href="/plan"
          className="flex-none text-[11px] font-semibold text-accent tracking-[.04em] uppercase bg-accent/[.08] px-2.5 py-1.5 rounded-full"
        >
          Edit
        </Link>
      </div>

      <div className="px-6 py-2 flex gap-1.5 border-b border-rule">
        {([
          { key: "split", label: "Split" },
          { key: "map", label: "Map" },
          { key: "list", label: "List" },
        ] as { key: ViewMode; label: string }[]).map(opt => (
          <button
            key={opt.key}
            onClick={() => setView(opt.key)}
            className={cx(
              "text-[11px] rounded-full px-3 py-1.5 font-semibold border transition-colors active:scale-[.95]",
              view === opt.key ? "bg-ink text-white border-ink" : "bg-card text-ink2 border-rule"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-6 py-4 text-[13px] text-red font-medium">
          Crawl failed: {error}
        </div>
      )}

      {loading && (
        <div className="px-6 py-8 text-center text-mute text-[13px]">
          <div className="inline-block w-5 h-5 border-2 border-ink/20 border-t-ink rounded-full animate-spin mb-2" />
          <div>Querying OpenStreetMap…</div>
          <div className="text-[11px] mt-1 opacity-70">First crawl of a city can take 5–15 seconds</div>
        </div>
      )}

      {data && !loading && (
        <div className="flex-1 flex flex-col min-h-0">
          {view !== "list" && (
            <div className={cx("relative", view === "map" ? "flex-1" : "h-[260px] flex-none")}>
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
          )}

          {view !== "map" && (
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-6 flex flex-col gap-2.5">
              <div className="text-[11px] uppercase tracking-[.1em] text-mute font-semibold flex justify-between items-center sticky top-0 bg-paper py-1.5 -mt-1.5">
                <span>Top of the list</span>
                <span className="text-mute font-medium normal-case tracking-normal">
                  {prospects.length} crawled
                </span>
              </div>
              {prospects.length === 0 ? (
                <div className="text-mute text-[13px] py-6 text-center">
                  No prospects matched in this radius. Try widening the radius or another city.
                </div>
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
    <div className="absolute bottom-16 left-0 right-0 px-3 z-[1000] pointer-events-none">
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

export default function ScoutPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-mute text-sm">Loading…</div>}>
      <ScoutInner />
    </Suspense>
  );
}
