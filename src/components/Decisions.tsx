"use client";

import { useState } from "react";
import type { Strings } from "@/lib/i18n";
import type { Lang } from "@/lib/bodies";
import type { DecisionHit, DecisionsResult } from "@/lib/decisions";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

function formatDate(iso: string | null, lang: Lang): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" });
}

function DecisionRow({ hit, lang }: { hit: DecisionHit; lang: Lang }) {
  const date = formatDate(hit.meetingDate, lang);
  return (
    <li className="border-t border-line py-3 first:border-t-0 first:pt-0">
      {hit.url ? (
        <a
          href={hit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-medium text-petrol underline underline-offset-2"
        >
          {hit.subject}
        </a>
      ) : (
        <p className="text-[15px] font-medium">{hit.subject}</p>
      )}
      <p className="mt-0.5 text-sm text-neutral-600">
        {hit.organizationName}
        {date ? ` · ${date}` : ""}
      </p>
    </li>
  );
}

export function Decisions({ lang, t }: { lang: Lang; t: Strings }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecisionsResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetchWithTimeout("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, lang, limit: 10 }),
      });
      const data = (await res.json()) as DecisionsResult;
      setResult(data);
    } catch {
      setResult({ upcoming: [], decided: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-petrol">{t.decisionsHeading}</h2>

      <form onSubmit={handleSearch} className="mt-3">
        <label htmlFor="decisions-query" className="block text-sm font-medium">
          {t.decisionsSearchLabel}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="decisions-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.decisionsSearchPlaceholder}
            maxLength={200}
            className="w-full rounded-lg border border-line bg-white px-4 py-2 text-base outline-none focus:border-petrol"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-lg border border-petrol px-4 py-2 font-medium text-petrol transition hover:bg-petrol/5 disabled:opacity-50"
          >
            {t.decisionsSearchButton}
          </button>
        </div>
      </form>

      {loading && <p className="mt-4 text-[15px] text-neutral-600">{t.decisionsLoading}</p>}

      {!loading && result && (
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold">{t.decisionsUpcomingHeading}</h3>
            {result.upcoming.length > 0 ? (
              <>
                <p className="mt-0.5 text-xs text-neutral-500">{t.decisionsUpcomingHint}</p>
                <ul className="mt-2">
                  {result.upcoming.map((hit) => (
                    <DecisionRow key={hit.issueId ?? hit.subject} hit={hit} lang={lang} />
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-1 text-sm text-neutral-600">{t.decisionsUpcomingEmpty}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold">{t.decisionsDecidedHeading}</h3>
            {result.decided.length > 0 ? (
              <ul className="mt-2">
                {result.decided.map((hit) => (
                  <DecisionRow key={hit.issueId ?? hit.subject} hit={hit} lang={lang} />
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-neutral-600">{t.decisionsDecidedEmpty}</p>
            )}
          </div>

          <p className="text-xs text-neutral-500">{t.decisionsSourceLabel}</p>
        </div>
      )}
    </div>
  );
}
