import { NextRequest, NextResponse } from "next/server";
import { findNearbyReports } from "@/lib/nearby-reports";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Same bound as area-responsibility's coordinates, and as route-question's
// resident text (this query can be the resident's full complaint, verbatim).
const HELSINKI_BOUNDS = { minLat: 59, maxLat: 61, minLon: 23, maxLon: 26 };
const MAX_QUERY_LENGTH = 2000;

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lon = Number(body?.lon);
  const query = typeof body?.query === "string" ? body.query : "";

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat och lon krävs" }, { status: 400 });
  }
  if (
    lat < HELSINKI_BOUNDS.minLat ||
    lat > HELSINKI_BOUNDS.maxLat ||
    lon < HELSINKI_BOUNDS.minLon ||
    lon > HELSINKI_BOUNDS.maxLon
  ) {
    return NextResponse.json({ error: "lat/lon utanför rimligt intervall" }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }

  try {
    const result = await findNearbyReports(lat, lon, query);
    return NextResponse.json(result);
  } catch {
    // Databasen eller modellen kan svara nej. Resten av skärmen ska fungera
    // utan det här blocket.
    return NextResponse.json({ reports: [], radiusMeters: 300, verified: false }, { status: 200 });
  }
}
