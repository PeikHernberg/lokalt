"use client";

import { useEffect, useState } from "react";
import type { Strings } from "@/lib/i18n";
import type { AreaResponsibility, ResponsibleParty } from "@/lib/area-responsibility";
import type { Location } from "@/components/LocationPicker";

function partyLabel(t: Strings, party: ResponsibleParty): string {
  switch (party) {
    case "kiinteisto":
      return t.partyLabelKiinteisto;
    case "hkl":
      return t.partyLabelHkl;
    case "valtio":
      return t.partyLabelValtio;
    case "liikunta":
      return t.partyLabelLiikunta;
    default:
      return "";
  }
}

export function Responsibility({ location, t }: { location: Location; t: Strings }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AreaResponsibility | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setResult(null);
    fetch("/api/area-responsibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: location.lat, lon: location.lon }),
    })
      .then((res) => res.json())
      .then((data: AreaResponsibility) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setResult({ found: false, party: null, maintenanceLevel: null, areaName: null, areaType: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location.lat, location.lon]);

  return (
    <div className="mt-4 rounded-xl border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-petrol">{t.responsibilityHeading}</h2>

      {loading && <p className="mt-2 text-[15px] text-neutral-600">{t.responsibilityLoading}</p>}

      {!loading && result && (
        <>
          {(!result.found || result.party === "ingen") && (
            <p className="mt-2 text-[15px] text-neutral-700">{t.responsibilityNotFoundText}</p>
          )}
          {result.found && result.party === "kaupunki" && (
            <p className="mt-2 text-[15px] text-neutral-700">{t.responsibilityCityText}</p>
          )}
          {result.found && result.party && result.party !== "kaupunki" && result.party !== "ingen" && (
            <p className="mt-2 text-[15px] text-neutral-700">
              {t.responsibilityOtherText.replace("{party}", partyLabel(t, result.party))}
            </p>
          )}
          {result.found && result.maintenanceLevel && (
            <p className="mt-2 text-sm text-neutral-500">
              {t.responsibilityMaintenanceLevelLabel}: {result.maintenanceLevel}
            </p>
          )}
        </>
      )}
    </div>
  );
}
