import { NextRequest, NextResponse } from "next/server";
import { geocodeStreetName } from "@/lib/geocode-street";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_STREET_NAME_LENGTH = 200;

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const streetName = typeof body?.streetName === "string" ? body.streetName : "";

  if (!streetName.trim()) {
    return NextResponse.json({ error: "streetName krävs" }, { status: 400 });
  }
  if (streetName.length > MAX_STREET_NAME_LENGTH) {
    return NextResponse.json({ error: "streetName_too_long" }, { status: 400 });
  }

  try {
    const result = await geocodeStreetName(streetName);
    if (!result) return NextResponse.json({ found: false }, { status: 200 });
    return NextResponse.json({ found: true, ...result });
  } catch {
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
