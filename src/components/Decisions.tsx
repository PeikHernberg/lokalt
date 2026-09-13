"use client";

import { useEffect, useState } from "react";
import type { Strings } from "@/lib/i18n";
import type { Lang } from "@/lib/bodies";
import type { DecisionHit, DecisionsResult } from "@/lib/decisions";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

// The decisions search index does best on a few keywords, and the API
// route itself caps queries at 200 chars — but the resident's question can
// run up to 2000, so it's trimmed down here rather than rejected outright.
const MAX_DECISIONS_QUERY_LENGTH = 200;

// How many rows show before the resident has to ask for more — keeps a
// noisy full-text match from dumping a wall of loosely-related motions.
const INITIAL_VISIBLE_COUNT = 4;

type StatusedHit = DecisionHit & { status: "upcoming" | "decided" };

function formatDate(iso: string | null, lang: Lang): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" });
}

function DecisionRow({ hit, lang, t }: { hit: StatusedHit; lang: Lang; t: Strings }) {
  const date = formatDate(hit.meetingDate, lang);
  const isUpcoming = hit.status === "upcoming";
  return (
    <li className="border-t border-line py-3 first:border-t-0 first:pt-0">
      <span className={`tag ${isUpcoming ? "tag-accent" : "tag-neutral"}`}>
        {isUpcoming ? t.decisionsStatusUpcoming : t.decisionsStatusDecided}
      </span>
      {hit.url ? (
        <a
          href={hit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 block text-[15px] font-medium text-petrol underline-offset-2 hover:underline"
        >
          {hit.subject}
        </a>
      ) : (
        <p className="mt-1.5 text-[15px] font-medium">{hit.subject}</p>
      )}
      <p className="mt-0.5 text-sm text-neutral-500">
        {hit.organizationName}
        {date ? ` · ${date}` : ""}
      </p>
      {isUpcoming && <p className="mt-0.5 text-xs text-neutral-500">{t.decisionsUpcomingHint}</p>}
    </li>
  );
}

export function Decisions({ query, lang, t }: { query: string; lang: Lang; t: Strings }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DecisionsResult | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setResult(null);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    fetchWithTimeout("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.slice(0, MAX_DECISIONS_QUERY_LENGTH), lang, limit: 10 }),
    })
      .then((res) => res.json())
      .then((data: Partial<DecisionsResult>) => {
        if (!cancelled) setResult({ upcoming: data.upcoming ?? [], decided: data.decided ?? [] });
      })
      .catch(() => {
        if (!cancelled) setResult({ upcoming: [], decided: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, lang]);

  // Upcoming first — it's the actionable half, worth seeing before a
  // longer list of history.
  const hits: StatusedHit[] = result
    ? [
        ...result.upcoming.map((hit): StatusedHit => ({ ...hit, status: "upcoming" })),
        ...result.decided.map((hit): StatusedHit => ({ ...hit, status: "decided" })),
      ]
    : [];
  const visibleHits = hits.slice(0, visibleCount);

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-petrol">{t.decisionsHeading}</h2>

      {loading && <p className="mt-3 text-[15px] text-neutral-600">{t.decisionsLoading}</p>}

      {!loading && result && (
        <>
          {hits.length > 0 ? (
            <>
              <ul className="mt-3">
                {visibleHits.map((hit) => (
                  <DecisionRow key={hit.issueId ?? hit.subject} hit={hit} lang={lang} t={t} />
                ))}
              </ul>
              {visibleCount < hits.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + INITIAL_VISIBLE_COUNT)}
                  className="mt-3 text-sm font-medium text-petrol underline-offset-2 hover:underline"
                >
                  {t.decisionsShowMore}
                </button>
              )}
              <p className="mt-4 text-xs text-neutral-500">{t.decisionsSourceLabel}</p>
            </>
          ) : (
            <p className="mt-3 text-[15px] text-neutral-700">{t.decisionsEmpty}</p>
          )}
        </>
      )}
    </div>
  );
}
