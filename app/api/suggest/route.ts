import { NextResponse } from "next/server";
import { suggestPlaces } from "@/lib/crawl/sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.max(1, Math.min(10, Number(searchParams.get("limit") ?? "6")));
  if (q.length < 2) return NextResponse.json({ suggestions: [] });
  try {
    const suggestions = await suggestPlaces(q, limit);
    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "suggest failed", suggestions: [] },
      { status: 502 }
    );
  }
}
