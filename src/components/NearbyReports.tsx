"use client";

import { useEffect, useState } from "react";
import type { Strings } from "@/lib/i18n";
import type { Lang } from "@/lib/bodies";
import type { NearbyReport, NearbyReportsResult } from "@/lib/nearby-reports";
import type { Location } from "@/components/LocationPicker";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

function formatDate(iso: string | null, lang: Lang): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" });
}

function ReportRow({ report, lang, t }: { report: NearbyReport; lang: Lang; t: Strings }) {
  const date = formatDate(report.requestedAt, lang);
  const firstLine = report.description.split("\n")[0];
  return (
    <li className="border-t border-line py-3 first:border-t-0 first:pt-0">
      <p className="text-sm text-neutral-600">
        {report.address ?? "—"}
        {date ? ` · ${date}` : ""} · {t.nearbyDistance.replace("{distance}", String(report.distanceMeters))}
      </p>
      <p className="mt-1 text-[15px] text-neutral-800">{firstLine}</p>
      {report.statusNotes && (
        <p className="mt-1 rounded-md bg-paper p-2 text-sm text-neutral-700">
          <span className="font-medium">{t.nearbyCityReplyLabel}:</span> {report.statusNotes}
        </p>
      )}
      <a
        href={report.publishedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-xs text-petrol underline underline-offset-2"
      >
        {t.nearbySourceLabel}
      </a>
    </li>
  );
}

export function NearbyReports({
  location,
  lang,
  t,
  query = "",
}: {
  location: Location;
  lang: Lang;
  t: Strings;
  query?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<NearbyReportsResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setResult(null);
    fetchWithTimeout("/api/nearby-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: location.lat, lon: location.lon, query }),
    })
      .then((res) => res.json())
      .then((data: NearbyReportsResult) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setResult({ reports: [], radiusMeters: 300, verified: false });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location.lat, location.lon, query]);

  return (
    <div className="mt-4 rounded-xl border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-petrol">{t.nearbyHeading}</h2>
      <p className="mt-1 text-xs text-neutral-500">{t.nearbyHint}</p>

      {loading && <p className="mt-3 text-[15px] text-neutral-600">{t.nearbyLoading}</p>}

      {!loading && result && (
        <>
          {result.reports.length > 0 && query.trim() && (
            <p className="mt-3 text-xs text-neutral-500">
              {result.verified ? t.nearbyVerifiedHint : t.nearbyUnverifiedHint}
            </p>
          )}
          {result.radiusMeters > 300 && result.reports.length > 0 && (
            <p className="mt-1 text-xs text-neutral-500">{t.nearbyWideNote}</p>
          )}
          {result.reports.length > 0 ? (
            <ul className="mt-2">
              {result.reports.map((report) => (
                <ReportRow key={report.id} report={report} lang={lang} t={t} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[15px] text-neutral-700">{t.nearbyEmpty}</p>
          )}
        </>
      )}
    </div>
  );
}
