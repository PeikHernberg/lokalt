import { NextResponse } from "next/server";
import { lookupAreaResponsibility } from "@/lib/area-responsibility";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lon = Number(body?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat och lon krävs" }, { status: 400 });
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
