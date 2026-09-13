"use client";

import { useEffect, useRef, useState } from "react";
import type { Location } from "@/components/LocationPicker";
import type { Strings } from "@/lib/i18n";
import type { AreaShape, ResponsibleParty } from "@/lib/area-responsibility";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const HELSINKI_CENTER: [number, number] = [60.1699, 24.9384];
const DEFAULT_ZOOM = 12;

// Below this, a screenful of shapes runs into the thousands even in the
// city's busiest areas (verified against the live layer) — too many to
// fetch or draw usefully, so the map shows a "zoom in" hint instead until
// the resident crosses it.
const MIN_ZOOM_FOR_AREAS = 17;
// Matches MIN_ZOOM_FOR_AREAS so a pin placed via tap, geolocation, or street
// search always lands exactly where the responsibility colours are already
// visible — landing one zoom step short of that (the previous behaviour)
// read as "the colours don't work" rather than "zoom in once more".
const SELECTED_ZOOM = MIN_ZOOM_FOR_AREAS;

// Colours picked to sit apart from the basemap's own palette (OSM already
// uses green for parks, red/orange for roads, blue for water) so the
// responsibility layer doesn't blend into or get mistaken for the map
// underneath it. "ingen" (not determined) deliberately stays a flat neutral
// grey rather than a colour, per the same "not a real answer" logic as its
// text-card counterpart.
const PARTY_COLORS: Record<ResponsibleParty, string> = {
  kaupunki: "#7c3aed", // violet
  kiinteisto: "#ca8a04", // gold/mustard
  hkl: "#db2777", // magenta
  valtio: "#78350f", // brown
  liikunta: "#57534e", // warm stone grey
  ingen: "#9ca3af", // neutral grey
};

function legendLabel(t: Strings, party: ResponsibleParty): string {
  switch (party) {
    case "kaupunki":
      return t.legendKaupunki;
    case "kiinteisto":
      return t.legendKiinteisto;
    case "hkl":
      return t.legendHkl;
    case "valtio":
      return t.legendValtio;
    case "liikunta":
      return t.legendLiikunta;
    case "ingen":
      return t.legendIngen;
  }
}

const LEGEND_ORDER: ResponsibleParty[] = ["kaupunki", "kiinteisto", "hkl", "valtio", "liikunta", "ingen"];

export function LocationMap({
  selected,
  onPick,
  t,
}: {
  selected: Location | null;
  onPick: (lat: number, lon: number) => void;
  t: Strings;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const areasLayerRef = useRef<import("leaflet").GeoJSON | null>(null);
  // Session-only cache of already-fetched view boxes, so panning back to a
  // spot already loaded doesn't re-hit the city's WFS. A persistent
  // (Supabase-backed) version is a later step, not this one.
  const boundsCacheRef = useRef<Map<string, AreaShape[]>>(new Map());
  // Bumped on every load; a response only gets drawn if it's still the
  // latest request by the time it resolves. Without this, rapid panning or
  // zooming fires several overlapping fetches, and whichever happens to
  // resolve last "wins" — sometimes an older, now-outdated view — which
  // read as the colours randomly flickering between two states.
  const requestSeqRef = useRef(0);
  const moveEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [active, setActive] = useState(false);
  const [zoomedInEnough, setZoomedInEnough] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2xUrl.src,
        iconUrl: markerIconUrl.src,
        shadowUrl: markerShadowUrl.src,
      });

      // Dragging and scroll-wheel zoom start disabled so a swipe or scroll
      // that merely passes over the map still scrolls the page, instead of
      // being captured by the map. The tap-to-activate overlay below turns
      // them on once the resident deliberately wants to pan/zoom.
      const map = L.map(containerRef.current, {
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        // Canvas instead of Leaflet's default SVG renderer: the
        // responsibility layer can draw hundreds of detailed polygons at
        // once, and SVG (one DOM element per shape) visibly froze the page
        // at that volume. Canvas draws them all to a single bitmap.
        preferCanvas: true,
      }).setView(HELSINKI_CENTER, DEFAULT_ZOOM);
      // Standard OSM tiles, muted with a CSS filter (see globals.css) rather
      // than switched to a different tile provider: free "no API key" light
      // basemaps (e.g. CARTO Positron) now require a key, and the plain OSM
      // style is busy enough (green parks, orange roads, dense labels) that
      // the responsibility-area colours need the contrast toned down to
      // stay readable on top of it.
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        className: "map-tiles-muted",
      }).addTo(map);

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        onPickRef.current(e.latlng.lat, e.latlng.lng);
      });

      map.on("moveend", () => {
        if (moveEndTimerRef.current) clearTimeout(moveEndTimerRef.current);
        // Debounced so a burst of zoom-button clicks or a fast drag only
        // triggers one fetch for the view the resident actually settles on,
        // not one per intermediate step. Short enough that a single
        // deliberate tap (drop a pin, jump to a street) still feels prompt.
        moveEndTimerRef.current = setTimeout(() => loadAreasForCurrentView(L, map), 120);
      });

      mapRef.current = map;
      setZoomedInEnough(map.getZoom() >= MIN_ZOOM_FOR_AREAS);
    });

    return () => {
      cancelled = true;
      if (moveEndTimerRef.current) clearTimeout(moveEndTimerRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      areasLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      if (markerRef.current) {
        markerRef.current.setLatLng([selected.lat, selected.lon]);
      } else {
        markerRef.current = L.marker([selected.lat, selected.lon]).addTo(map);
      }
      map.setView([selected.lat, selected.lon], Math.max(map.getZoom(), SELECTED_ZOOM));
    });
  }, [selected]);

  function boundsCacheKey(b: import("leaflet").LatLngBounds): string {
    // Rounded to ~11m so a few pixels of pan reuses the same cache entry.
    const round = (n: number) => Math.round(n * 10000) / 10000;
    return [round(b.getWest()), round(b.getSouth()), round(b.getEast()), round(b.getNorth())].join(",");
  }

  async function loadAreasForCurrentView(L: typeof import("leaflet"), map: import("leaflet").Map) {
    const zoom = map.getZoom();
    setZoomedInEnough(zoom >= MIN_ZOOM_FOR_AREAS);
    if (zoom < MIN_ZOOM_FOR_AREAS) {
      areasLayerRef.current?.remove();
      areasLayerRef.current = null;
      setLoadingAreas(false);
      return;
    }

    const requestSeq = ++requestSeqRef.current;
    const bounds = map.getBounds();
    const key = boundsCacheKey(bounds);
    const cached = boundsCacheRef.current.get(key);
    // A newly-panned-to view has no shapes yet (the previous view's shapes,
    // tied to their own real-world coordinates, simply aren't under the map
    // anymore) — surfacing that as "loading" rather than nothing keeps a
    // network-latency gap from reading as the feature being broken.
    if (!cached) setLoadingAreas(true);
    const shapes =
      cached ??
      (await fetchWithTimeout("/api/area-responsibility-bounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          west: bounds.getWest(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          north: bounds.getNorth(),
        }),
      })
        .then((res) => res.json())
        .then((data: { shapes?: AreaShape[] }) => data.shapes ?? [])
        .catch(() => [] as AreaShape[]));

    if (!cached) boundsCacheRef.current.set(key, shapes);
    if (mapRef.current !== map) return; // unmounted mid-fetch
    if (requestSeq !== requestSeqRef.current) return; // a newer view has since been requested
    setLoadingAreas(false);

    areasLayerRef.current?.remove();
    areasLayerRef.current = L.geoJSON(
      shapes.map((s) => ({ type: "Feature", properties: { party: s.party }, geometry: s.geometry })) as GeoJSON.Feature[],
      {
        style: (feature) => {
          const party = (feature?.properties?.party as ResponsibleParty) ?? "ingen";
          const isUndetermined = party === "ingen";
          return {
            color: PARTY_COLORS[party],
            weight: isUndetermined ? 1 : 1.5,
            opacity: isUndetermined ? 0.5 : 0.8,
            fillColor: PARTY_COLORS[party],
            fillOpacity: isUndetermined ? 0.15 : 0.45,
            dashArray: isUndetermined ? "4,4" : undefined,
          };
        },
        interactive: false,
      }
    ).addTo(map);
    areasLayerRef.current.bringToBack();
  }

  function activate() {
    const map = mapRef.current;
    if (!map) return;
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.touchZoom.enable();
    map.boxZoom.enable();
    setActive(true);
  }

  return (
    <div>
      <div className="relative mt-3 h-80 w-full overflow-hidden rounded-lg border border-line">
        <div ref={containerRef} className="h-full w-full" />
        {!active && (
          <button
            type="button"
            onClick={activate}
            className="absolute inset-0 z-[1100] flex items-center justify-center bg-ink/10 text-center"
          >
            <span className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-petrol shadow">
              {t.locationMapActivateHint}
            </span>
          </button>
        )}
        {active && !zoomedInEnough && (
          <p className="pointer-events-none absolute inset-x-0 bottom-2 z-[1100] mx-auto w-fit rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-petrol shadow">
            {t.locationMapZoomHint}
          </p>
        )}
        {active && zoomedInEnough && loadingAreas && (
          <p className="pointer-events-none absolute inset-x-0 bottom-2 z-[1100] mx-auto w-fit rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-petrol shadow">
            {t.locationMapLoadingAreas}
          </p>
        )}
      </div>

      {active && zoomedInEnough && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
          {LEGEND_ORDER.map((party) => (
            <li key={party} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: PARTY_COLORS[party] }}
              />
              {legendLabel(t, party)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
