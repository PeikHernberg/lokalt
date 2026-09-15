import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Ingests Helsinki's Open311 feedback reports into feedback_reports.
// Two modes, per lokalt-kontext/claude-kontext/02-byggordning.md step 4:
//   { mode: "recent" }            -> last 3 days, run hourly
//   { mode: "day", date: "YYYY-MM-DD" } -> one day, used by the one-off backfill
// Classification is a separate step (see scripts/classify-palaute.mjs) and
// never runs here, so a failed classification can never block ingestion.
//
// This is the only writer to feedback_reports / ingest_log. It writes with
// the service-role key, which never leaves the function's own environment —
// readers (the web app) hold a key that can only SELECT.

const OPEN311_BASE = "https://palautteet.hel.fi/public-api/open311-public-service/v1";

// Open311 never returns more than 100 rows for one request, so a day's worth
// comfortably fits; the cap only bounds a pathological upstream response.
const MAX_ROWS = 500;

type RawReport = {
  service_request_id: string;
  description: string | null;
  address: string | null;
  status: string | null;
  status_notes: string | null;
  requested_datetime: string | null;
  updated_datetime: string | null;
  media_url: string | null;
  lat: string | null;
  long: string | null;
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Constant-time compare so a caller can't recover the shared secret by
// timing repeated guesses against it.
function secretMatches(provided: string, expected: string): boolean {
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Only ever a plain calendar date. Anything else is rejected before it can
// reach Date parsing or the upstream query string.
function parseDay(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  // Guard against a caller walking the function through thousands of
  // pointless upstream requests for dates that cannot hold any data.
  const now = Date.now();
  const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000;
  if (parsed.getTime() > now || parsed.getTime() < fiveYearsAgo) return null;
  return parsed;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  // A valid anon JWT is enough to reach an Edge Function, and the anon key is
  // a public value by design — so the write path needs its own secret on top.
  // Enforced whenever INGEST_SECRET is configured on the function.
  const expectedSecret = Deno.env.get("INGEST_SECRET");
  if (expectedSecret) {
    const provided = req.headers.get("x-ingest-secret") ?? "";
    if (!secretMatches(provided, expectedSecret)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }
  }

  let body: { mode?: string; date?: string } = {};
  try {
    body = await req.json();
  } catch {
    // No body is fine — defaults to "recent".
  }
  const mode = body.mode === "day" ? "day" : "recent";

  let start: Date;
  let end: Date;
  if (mode === "day") {
    if (!body.date) return jsonResponse({ error: "date krävs för mode=day" }, 400);
    const parsed = parseDay(body.date);
    if (!parsed) return jsonResponse({ error: "ogiltigt datum" }, 400);
    start = parsed;
    end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  } else {
    end = new Date();
    start = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000);
  }

  const params = new URLSearchParams({
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  });

  const res = await fetch(`${OPEN311_BASE}/requests.json?${params.toString()}`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return jsonResponse({ error: `Open311 svarade ${res.status}` }, 502);
  const reports = (await res.json()) as RawReport[];
  if (!Array.isArray(reports)) return jsonResponse({ error: "oväntat svar från Open311" }, 502);

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) return jsonResponse({ error: "service role key saknas" }, 500);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rows = reports
    .filter((r) => !!r.service_request_id)
    .slice(0, MAX_ROWS)
    .map((r) => ({
      service_request_id: r.service_request_id,
      description: r.description ?? "",
      address: r.address,
      lat: r.lat ? Number(r.lat) : null,
      lon: r.long ? Number(r.long) : null,
      status: r.status,
      status_notes: r.status_notes,
      requested_at: r.requested_datetime,
      updated_at: r.updated_datetime,
      media_url: r.media_url,
      raw: r,
    }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("feedback_reports")
      .upsert(rows, { onConflict: "service_request_id" });
    if (error) return jsonResponse({ error: error.message }, 500);
  }

  if (mode === "day" && body.date) {
    await supabase.from("ingest_log").upsert({ day: body.date, report_count: rows.length });
  }

  return jsonResponse({ mode, date: body.date ?? null, count: rows.length });
});
