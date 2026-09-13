import { NextResponse } from "next/server";
import { findNearbyReports } from "@/lib/nearby-reports";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lon = Number(body?.lon);
  const query = typeof body?.query === "string" ? body.query : "";

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat och lon krävs" }, { status: 400 });
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
