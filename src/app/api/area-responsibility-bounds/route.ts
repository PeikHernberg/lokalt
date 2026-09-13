import { NextRequest, NextResponse } from "next/server";
import { lookupAreaShapesInBounds } from "@/lib/area-responsibility";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Same bound as the other city-data routes.
const HELSINKI_BOUNDS = { minLat: 59, maxLat: 61, minLon: 23, maxLon: 26 };

// Generous for a single screenful at the zoom level the map requires before
// it fetches shapes at all (see MIN_ZOOM_FOR_AREAS in LocationMap.tsx) —
// rejects a bbox far larger than any real map viewport, which would either
// be a misbehaving client or a scripted attempt to bulk-scrape the layer.
const MAX_BOUNDS_DEGREES = 0.05;

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const west = Number(body?.west);
  const south = Number(body?.south);
  const east = Number(body?.east);
  const north = Number(body?.north);

  if (![west, south, east, north].every(Number.isFinite)) {
    return NextResponse.json({ error: "west/south/east/north krävs" }, { status: 400 });
  }
  if (
    south < HELSINKI_BOUNDS.minLat ||
    north > HELSINKI_BOUNDS.maxLat ||
    west < HELSINKI_BOUNDS.minLon ||
    east > HELSINKI_BOUNDS.maxLon ||
    west >= east ||
    south >= north
  ) {
    return NextResponse.json({ error: "bounds utanför rimligt intervall" }, { status: 400 });
  }
  if (east - west > MAX_BOUNDS_DEGREES || north - south > MAX_BOUNDS_DEGREES) {
    return NextResponse.json({ error: "bounds_too_large" }, { status: 400 });
  }

  try {
    const shapes = await lookupAreaShapesInBounds({ west, south, east, north });
    return NextResponse.json({ shapes });
  } catch {
    return NextResponse.json({ shapes: [] }, { status: 200 });
  }
}
