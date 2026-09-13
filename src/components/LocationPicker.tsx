"use client";

import { useState } from "react";
import type { Strings } from "@/lib/i18n";

export type Location = { lat: number; lon: number; label: string | null };

export function LocationPicker({
  t,
  onSelect,
}: {
  t: Strings;
  onSelect: (location: Location) => void;
}) {
  const [street, setStreet] = useState("");
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  function useGeolocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError(t.locationGeoError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          label: null,
        };
        setSelected(location);
        onSelect(location);
      },
      () => setError(t.locationGeoError),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function searchStreet(e: React.FormEvent) {
    e.preventDefault();
    if (!street.trim()) return;
    setError(null);
    setSearching(true);
    try {
      const res = await fetch("/api/geocode-street", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streetName: street }),
      });
      const data = await res.json();
      if (!data.found) {
        setError(t.locationGeoError);
        return;
      }
      const location: Location = { lat: data.lat, lon: data.lon, label: data.matchedName };
      setSelected(location);
      onSelect(location);
    } catch {
      setError(t.locationGeoError);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-petrol">{t.locationHeading}</h2>

      <button
        type="button"
        onClick={useGeolocation}
        className="mt-3 rounded-lg bg-petrol px-5 py-3 font-medium text-white transition hover:bg-petrol-dark"
      >
        {t.locationGeoButton}
      </button>

      <form onSubmit={searchStreet} className="mt-4">
        <label htmlFor="street" className="block text-sm font-medium">
          {t.locationStreetLabel}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder={t.locationStreetPlaceholder}
            className="w-full rounded-lg border border-line bg-white px-4 py-2 text-base outline-none focus:border-petrol"
          />
          <button
            type="submit"
            disabled={searching || !street.trim()}
            className="rounded-lg border border-petrol px-4 py-2 font-medium text-petrol transition hover:bg-petrol/5 disabled:opacity-50"
          >
            {t.locationStreetButton}
          </button>
        </div>
      </form>

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}

      {selected && (
        <p className="mt-4 text-sm text-neutral-600">
          {t.locationSelectedLabel}: {selected.label ?? `${selected.lat.toFixed(5)}, ${selected.lon.toFixed(5)}`}
        </p>
      )}
    </div>
  );
}
