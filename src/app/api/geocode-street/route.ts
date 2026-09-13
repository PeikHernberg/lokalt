import { NextResponse } from "next/server";
import { geocodeStreetName } from "@/lib/geocode-street";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const streetName = typeof body?.streetName === "string" ? body.streetName : "";

  if (!streetName.trim()) {
    return NextResponse.json({ error: "streetName krävs" }, { status: 400 });
  }

  try {
    const result = await geocodeStreetName(streetName);
    if (!result) return NextResponse.json({ found: false }, { status: 200 });
    return NextResponse.json({ found: true, ...result });
  } catch {
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
