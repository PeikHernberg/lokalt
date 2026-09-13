"use client";

import { useEffect, useRef, useState } from "react";
import type { Strings } from "@/lib/i18n";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { guessStreetNameFromText } from "@/lib/geocode-street";
import { LocationMap } from "@/components/LocationMap";

export type Location = { lat: number; lon: number; label: string | null };

export function LocationPicker({
  t,
  onSelect,
  questionText,
}: {
  t: Strings;
  onSelect: (location: Location) => void;
  // The resident's own question text, if any — used once, on mount, to
  // guess a street name already mentioned there and pre-fill the search
  // instead of asking them to type the same street a second time.
  questionText?: string;
}) {
  const [street, setStreet] = useState("");
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

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

  async function searchStreet(e?: React.FormEvent, nameOverride?: string) {
    e?.preventDefault();
    const name = nameOverride ?? street;
    if (!name.trim()) return;
    setError(null);
    setSearching(true);
    try {
      const res = await fetchWithTimeout("/api/geocode-street", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streetName: name }),
      });
      const data = await res.json();
      if (!data.found) {
        setError(t.locationStreetNotFoundError);
        return;
      }
      const location: Location = { lat: data.lat, lon: data.lon, label: data.matchedName };
      setSelected(location);
      onSelect(location);
    } catch {
      setError(t.locationStreetNotFoundError);
    } finally {
      setSearching(false);
    }
  }

  const autoFillTried = useRef(false);
  useEffect(() => {
    if (autoFillTried.current || !questionText) return;
    autoFillTried.current = true;
    const guess = guessStreetNameFromText(questionText);
    if (!guess) return;
    setStreet(guess);
    setAutoFilled(true);
    void searchStreet(undefined, guess);
    // Only ever runs once, off the question text present when this step
    // first mounts — searchStreet is stable enough in practice that
    // tracking it as a dependency would just churn the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionText]);

  function pickOnMap(lat: number, lon: number) {
    setError(null);
    setAutoFilled(false);
    const location: Location = { lat, lon, label: null };
    setSelected(location);
    onSelect(location);
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-petrol">{t.locationHeading}</h2>
      <p className="mt-1 text-xs text-neutral-500">{t.locationMapHint}</p>

      <LocationMap selected={selected} onPick={pickOnMap} t={t} />

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
        <p className="mt-1 text-xs text-neutral-500">{t.locationStreetHint}</p>
        <div className="mt-2 flex gap-2">
          <input
            id="street"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              setAutoFilled(false);
            }}
            placeholder={t.locationStreetPlaceholder}
            maxLength={200}
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
        {autoFilled && <p className="mt-1.5 text-xs text-neutral-500">{t.locationAutoFilledHint}</p>}
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
