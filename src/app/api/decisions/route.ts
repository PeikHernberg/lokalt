import { NextRequest, NextResponse } from "next/server";
import { searchDecisions } from "@/lib/decisions";
import { isLocale } from "@/lib/site-config";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 200;

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  const lang = body?.lang;
  const limit = Number(body?.limit) || 10;

  if (!query || !isLocale(lang)) {
    return NextResponse.json({ error: "query och giltigt lang krävs" }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }

  try {
    const result = await searchDecisions(query, lang, Math.min(limit, 50));
    return NextResponse.json(result);
  } catch {
    // Indexet kan svara nej eller inte alls. Resten av skärmen ska fungera
    // utan beslutsblocket, så vi svarar tomt snarare än med ett fel.
    return NextResponse.json({ upcoming: [], decided: [] }, { status: 200 });
  }
}
