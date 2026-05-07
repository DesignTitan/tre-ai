import { NextResponse } from "next/server";
import { geocode } from "@/lib/crawl/sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "missing q parameter" }, { status: 400 });
  }
  try {
    const hit = await geocode(q);
    if (!hit) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(hit);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "geocode failed" },
      { status: 502 }
    );
  }
}
