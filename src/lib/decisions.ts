import { createHash } from "node:crypto";
import { getSupabase, getSupabaseWriter } from "@/lib/supabase";
import type { Lang } from "@/lib/bodies";
import { safeExternalUrl } from "@/lib/safe-url";

export type DecisionHit = {
  issueId: string | null;
  subject: string | null;
  organizationName: string | null;
  meetingDate: string | null; // ISO date
  url: string | null;
};

export type DecisionsResult = {
  upcoming: DecisionHit[];
  decided: DecisionHit[];
};

const CACHE_TTL_MINUTES = 10;
// Rows past this age are deleted rather than just ignored, so the cache
// never accumulates residents' search text indefinitely (see CLAUDE.md /
// privacy copy: we only "briefly" cache, not forever).
const CACHE_RETENTION_MINUTES = 60;
const DECISIONS_URL_BASE = "https://paatokset.hel.fi";
// The only host a decision link may point at once assembled — see safe-url.ts.
const DECISIONS_ALLOWED_HOSTS = ["paatokset.hel.fi"];

// The cache key is derived from what the resident typed. Hash it rather
// than storing the query text in plain, queryable form.
function hashCacheKey(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

// paatokset_decisions has both a Finnish and Swedish document per issue in
// practice. English users see Finnish results; there is no English index.
function decisionLanguage(lang: Lang): "fi" | "sv" {
  return lang === "sv" ? "sv" : "fi";
}

// Every field in the Elasticsearch response comes back wrapped in a
// single-element array (an artifact of the underlying Drupal indexing),
// never as a bare scalar. Verified live 2026-09-13.
function unwrap<T>(value: T[] | undefined | null): T | null {
  return value && value.length > 0 ? value[0] : null;
}

type RawSource = {
  subject?: string[];
  issue_id?: string[];
  organization_name?: string[];
  meeting_date?: number[];
  decision_url?: string[];
};

type RawHit = { _id: string; _source: RawSource };
type RawResponse = { hits: { hits: RawHit[] } };

function toHit(raw: RawHit): DecisionHit {
  const s = raw._source;
  const meetingEpoch = unwrap(s.meeting_date);
  const relativeUrl = unwrap(s.decision_url);
  return {
    issueId: unwrap(s.issue_id) ?? raw._id,
    subject: unwrap(s.subject),
    organizationName: unwrap(s.organization_name),
    meetingDate: meetingEpoch ? new Date(meetingEpoch * 1000).toISOString() : null,
    // `decision_url` is meant to be a path, but the index is upstream data:
    // a value beginning ".example.com/" would concatenate into the host
    // "paatokset.hel.fi.example.com", so the assembled URL is re-checked
    // rather than assumed.
    url: relativeUrl
      ? safeExternalUrl(`${DECISIONS_URL_BASE}${relativeUrl}`, DECISIONS_ALLOWED_HOSTS)
      : null,
  };
}

// Re-checks the links on a result that came back out of the cache. The cache
// row is written by us and the database only lets the service-role key write
// it, but a cached link is still a link we did not assemble in this request,
// and re-running it through the same check costs nothing.
function sanitizeCached(result: DecisionsResult): DecisionsResult {
  const clean = (hits: DecisionHit[]): DecisionHit[] =>
    hits.map((hit) => ({ ...hit, url: safeExternalUrl(hit.url, DECISIONS_ALLOWED_HOSTS) }));
  return {
    upcoming: clean(result.upcoming ?? []),
    decided: clean(result.decided ?? []),
  };
}

function dedupe(hits: DecisionHit[]): DecisionHit[] {
  const seen = new Set<string>();
  const result: DecisionHit[] = [];
  for (const hit of hits) {
    const key = hit.issueId ?? `${hit.subject}:${hit.meetingDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(hit);
  }
  return result;
}

async function search(body: object): Promise<RawHit[]> {
  const base = process.env.HEL_DECISIONS_BASE_URL;
  if (!base) throw new Error("HEL_DECISIONS_BASE_URL saknas");

  const res = await fetch(`${base}/paatokset_decisions/_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Beslutsindexet svarade ${res.status}`);

  const data = (await res.json()) as RawResponse;
  return data.hits.hits;
}

export async function searchDecisions(
  query: string,
  lang: Lang,
  limit: number
): Promise<DecisionsResult> {
  const cacheKey = hashCacheKey(
    `${decisionLanguage(lang)}:${query.trim().toLowerCase()}:${limit}`
  );

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("decisions_cache")
        .select("response, fetched_at")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (data) {
        const ageMinutes = (Date.now() - new Date(data.fetched_at).getTime()) / 60000;
        if (ageMinutes < CACHE_TTL_MINUTES) {
          return sanitizeCached(data.response as DecisionsResult);
        }
      }
      // Opportunistic purge of everything past retention, not just this
      // row — keeps the table from growing unbounded without a cron job.
      // Deleting needs the writer: the anon role has no delete privilege.
      const purger = getSupabaseWriter();
      if (purger) {
        const cutoff = new Date(Date.now() - CACHE_RETENTION_MINUTES * 60000).toISOString();
        await purger.from("decisions_cache").delete().lt("fetched_at", cutoff);
      }
    } catch {
      // Cachen är en optimering. Fortsätt mot indexet direkt om den inte svarar.
    }
  }

  const language = decisionLanguage(lang);
  const textMatch = {
    multi_match: { query, fields: ["subject^3", "issue_subject^2", "decision_content"] },
  };

  const [upcomingHits, decidedHits] = await Promise.all([
    search({
      size: limit,
      query: {
        bool: {
          must: [
            { range: { meeting_date: { gte: new Date().toISOString() } } },
            { term: { field_is_decision: false } },
            textMatch,
          ],
          filter: [{ term: { _language: language } }],
        },
      },
      sort: [{ meeting_date: "asc" }],
      _source: ["subject", "issue_id", "organization_name", "meeting_date", "decision_url"],
    }),
    search({
      size: limit,
      query: {
        bool: {
          must: [{ term: { field_is_decision: true } }, textMatch],
          filter: [{ term: { _language: language } }],
        },
      },
      sort: ["_score", { meeting_date: "desc" }],
      _source: ["subject", "issue_id", "organization_name", "meeting_date", "decision_url"],
    }),
  ]);

  const result: DecisionsResult = {
    upcoming: dedupe(upcomingHits.map(toHit)),
    decided: dedupe(decidedHits.map(toHit)),
  };

  const writer = getSupabaseWriter();
  if (writer) {
    try {
      await writer.from("decisions_cache").upsert({ cache_key: cacheKey, response: result });
    } catch {
      // Cacheskrivning är en optimering, inte ett krav.
    }
  }

  return result;
}
