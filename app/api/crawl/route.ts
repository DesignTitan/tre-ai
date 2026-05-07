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

    const elements = await overpass(hit.lat, hit.lng, radiusMi * MILES_TO_M);
    const slug = slugifyQuery(hit.displayName.split(",")[0] || q);
    const areaName = (hit.displayName.split(",")[0] || q).trim();

    const prospects = transformElements(elements, {
      anchorLat: hit.lat,
      anchorLng: hit.lng,
      areaSlug: slug,
      areaName,
    });

    const top = prospects.slice(0, 60);

    const body: CrawlResult = {
      location: {
        query: q,
        displayName: hit.displayName,
        lat: hit.lat,
        lng: hit.lng,
        type: hit.type,
      },
      radiusMi,
      prospects: top,
      fetchedAt: new Date().toISOString(),
      totalRaw: elements.length,
      filtered: prospects.length,
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
