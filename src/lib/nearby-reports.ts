import { getSupabase } from "@/lib/supabase";
import { getClient } from "@/lib/anthropic";

export type NearbyReport = {
  id: string;
  description: string;
  address: string | null;
  statusNotes: string | null;
  requestedAt: string | null;
  distanceMeters: number;
  publishedUrl: string;
};

export type NearbyReportsResult = {
  reports: NearbyReport[];
  radiusMeters: number;
  // true once step B (the model verification pass) has actually filtered
  // these results down from candidates to same/possibly-same matches.
  verified: boolean;
};

const NEAR_RADIUS_METERS = 300;
const WIDE_RADIUS_METERS = 800;
const MIN_CANDIDATES_BEFORE_WIDENING = 3;
const CANDIDATE_LIMIT = 20;
const MONTHS_BACK = 12;
const MAX_RESULTS = 5;
const VERIFY_MODEL = "claude-haiku-4-5-20251001"; // cheap, fast — only ever labels candidates, never invents one.
const PUBLISHED_BASE = "https://palautteet.hel.fi/julkaistu-palaute#/published";

// status_notes comes back as raw HTML (<div>, <a href>, &nbsp;) from the
// city's own reply text. Strip it to plain text for display.
function stripHtml(html: string): string {
  return html
    .replace(/<(br|div|p)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

type Candidate = {
  service_request_id: string;
  description: string;
  address: string | null;
  status_notes: string | null;
  requested_at: string | null;
  distance_meters: number;
  similarity: number;
};

async function fetchCandidates(
  lat: number,
  lon: number,
  radiusMeters: number,
  query: string
): Promise<Candidate[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase är inte konfigurerat.");

  const { data, error } = await supabase.rpc("search_nearby_reports", {
    p_lat: lat,
    p_lon: lon,
    p_radius_meters: radiusMeters,
    p_query: query,
    p_months: MONTHS_BACK,
    p_limit: CANDIDATE_LIMIT,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as Candidate[];
}

function toReport(c: Candidate): NearbyReport {
  return {
    id: c.service_request_id,
    description: c.description,
    address: c.address,
    statusNotes: c.status_notes ? stripHtml(c.status_notes) : null,
    requestedAt: c.requested_at,
    distanceMeters: Math.round(c.distance_meters),
    publishedUrl: `${PUBLISHED_BASE}/${c.service_request_id}`,
  };
}

// Step B: ask a cheap model to label each candidate against the resident's
// own text as "samma" (same issue), "kanske" (possibly), or "annat"
// (different) — trigram similarity is character-based, not semantic, and
// produces false positives (see search_nearby_reports). Never invents a
// candidate: it only ever labels the ids it was given.
async function verifyMatches(query: string, candidates: Candidate[]): Promise<Set<string>> {
  const client = getClient();
  const items = candidates.map((c) => ({ id: c.service_request_id, description: c.description }));

  const message = await client.messages.create(
    {
      model: VERIFY_MODEL,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system: `You compare a Helsinki resident's new fault report against previously reported candidates near the same spot, to catch likely duplicates before the resident submits a new one.

For each candidate, judge whether it describes the SAME underlying problem as the resident's text — not just shared words. Two different potholes on the same street are "annat", not "samma". Label each candidate exactly "samma", "kanske", or "annat".

The worst possible mistake is a false "samma" or "kanske": it can make a resident wrongly believe their real problem is already reported, so they never report it. When genuinely unsure, prefer "annat".

Descriptions are almost always in Finnish; the resident's text may be in Swedish, Finnish, or English — compare by meaning, not language.

Return ONLY a JSON array, no prose, no markdown fences: [{"id": "<id>", "label": "samma" | "kanske" | "annat"}]`,
      messages: [
        {
          role: "user",
          content: `Resident's new report:\n"""${query}"""\n\nCandidates:\n${JSON.stringify(items)}`,
        },
      ],
    },
    // Without an explicit timeout the SDK defaults to 10 minutes, which
    // would leave findNearbyReports awaiting forever instead of falling
    // back to the unverified step-A ranking (see the catch below).
    { timeout: 25_000 },
  );

  const text = message.content.find((b) => b.type === "text")?.text ?? "[]";
  const cleaned = text.trim().replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
  const labels = JSON.parse(cleaned) as { id: string; label: string }[];

  const knownIds = new Set(candidates.map((c) => c.service_request_id));
  const matches = new Set<string>();
  for (const { id, label } of labels) {
    if (knownIds.has(id) && (label === "samma" || label === "kanske")) matches.add(id);
  }
  return matches;
}

/**
 * Step A: real PostGIS distance + trigram-similarity search over twelve
 * months of ingested reports, radius escalating from 300m to 800m when too
 * few candidates turn up nearby. Step B (model verification against the
 * resident's own text) runs only when `query` is non-empty, and degrades
 * gracefully to the unverified step-A ranking if the model call fails —
 * never blocks on it. See 02-byggordning.md step 4.
 */
export async function findNearbyReports(
  lat: number,
  lon: number,
  query: string
): Promise<NearbyReportsResult> {
  let radiusMeters = NEAR_RADIUS_METERS;
  let candidates = await fetchCandidates(lat, lon, radiusMeters, query);
  if (candidates.length < MIN_CANDIDATES_BEFORE_WIDENING) {
    radiusMeters = WIDE_RADIUS_METERS;
    candidates = await fetchCandidates(lat, lon, radiusMeters, query);
  }

  if (!query.trim() || candidates.length === 0) {
    return {
      radiusMeters,
      verified: false,
      reports: candidates.slice(0, MAX_RESULTS).map(toReport),
    };
  }

  try {
    const matchIds = await verifyMatches(query, candidates);
    return {
      radiusMeters,
      verified: true,
      reports: candidates.filter((c) => matchIds.has(c.service_request_id)).slice(0, MAX_RESULTS).map(toReport),
    };
  } catch {
    // Modellen nere: fall tillbaka på steg A:s rankning, aldrig ett fel.
    return {
      radiusMeters,
      verified: false,
      reports: candidates.slice(0, MAX_RESULTS).map(toReport),
    };
  }
}
