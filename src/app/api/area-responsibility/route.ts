import { NextRequest, NextResponse } from "next/server";
import { lookupAreaResponsibility } from "@/lib/area-responsibility";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// A generous bounding box around Helsinki — enough to reject obviously bogus
// or scripted coordinates without rejecting any real resident's location.
const HELSINKI_BOUNDS = { minLat: 59, maxLat: 61, minLon: 23, maxLon: 26 };

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lon = Number(body?.lon);

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

  try {
    const result = await lookupAreaResponsibility(lat, lon);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { found: false, party: null, maintenanceLevel: null, areaName: null, areaType: null },
      { status: 200 }
    );
  }
}
