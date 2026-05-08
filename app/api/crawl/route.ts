import { NextResponse } from "next/server";
import { geocode, overpass, MILES_TO_M } from "@/lib/crawl/sources";
import { transformElements } from "@/lib/crawl/transform";
import type { CrawlResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function slugifyQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "anchor";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const radiusMi = Math.max(1, Math.min(50, Number(searchParams.get("radius") ?? "10")));
  if (!q) {
    return NextResponse.json({ error: "missing q parameter" }, { status: 400 });
  }

  try {
    const hit = await geocode(q);
    if (!hit) {
      return NextResponse.json({ error: "geocode not found" }, { status: 404 });
    }

    const slug = slugifyQuery(hit.displayName.split(",")[0] || q);
    const areaName = (hit.displayName.split(",")[0] || q).trim();

    // Auto-expand: if the user-requested radius returns < MIN_PROSPECTS,
    // widen the search up to 50mi and retry. OSM coverage is volunteer-thin
    // in small towns / rural areas — 33M SMBs in the US, so empty-from-OSM
    // usually means we need to reach the next commercial corridor over.
    const MIN_PROSPECTS = 12;
    const RADIUS_LADDER = [radiusMi];
    if (radiusMi < 50) RADIUS_LADDER.push(Math.min(50, radiusMi * 2));
    if (radiusMi < 25) RADIUS_LADDER.push(Math.min(50, radiusMi * 4));

    let elements: Awaited<ReturnType<typeof overpass>> = [];
    let prospects: ReturnType<typeof transformElements> = [];
    let effectiveRadius = radiusMi;
    let expanded = false;

    for (const r of RADIUS_LADDER) {
      elements = await overpass(hit.lat, hit.lng, r * MILES_TO_M);
      prospects = transformElements(elements, {
        anchorLat: hit.lat,
        anchorLng: hit.lng,
        areaSlug: slug,
        areaName,
      });
      effectiveRadius = r;
      if (prospects.length >= MIN_PROSPECTS) break;
      if (r > radiusMi) expanded = true;
    }

    const top = prospects.slice(0, 60);

    // If we still have nothing (deeply rural area), do one wide-net query so
    // we can at least tell the user "the nearest business is N miles away"
    // — no dead ends.
    let nearestBusiness: typeof prospects[number] | undefined;
    if (top.length === 0) {
      const wideElements = await overpass(hit.lat, hit.lng, 100 * MILES_TO_M);
      const wideProspects = transformElements(wideElements, {
        anchorLat: hit.lat,
        anchorLng: hit.lng,
        areaSlug: slug,
        areaName,
      });
      nearestBusiness = [...wideProspects].sort(
        (a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity)
      )[0];
    }

    const body: CrawlResult = {
      location: {
        query: q,
        displayName: hit.displayName,
        lat: hit.lat,
        lng: hit.lng,
        type: hit.type,
      },
      radiusMi: effectiveRadius,
      requestedRadiusMi: radiusMi,
      autoExpanded: expanded,
      prospects: top,
      fetchedAt: new Date().toISOString(),
      totalRaw: elements.length,
      filtered: prospects.length,
      nearestBusiness,
    };

    return NextResponse.json(body, {
      headers: {
        "cache-control": "public, max-age=21600, s-maxage=21600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "crawl failed" },
      { status: 502 }
    );
  }
}
