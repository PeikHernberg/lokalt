const WFS_LAYER = "avoindata:YLRE_Katu_ja_viherosat_kaikki_alue";

type Ring = number[][];
type Geometry =
  | { type: "Polygon"; coordinates: Ring[] }
  | { type: "MultiPolygon"; coordinates: Ring[][] };

type WfsFeature = { geometry: Geometry; properties: { alueen_nimi?: string | null } };
type WfsResponse = { numberReturned: number; features: WfsFeature[] };

function outerRing(geometry: Geometry): Ring | null {
  if (geometry.type === "Polygon") return geometry.coordinates[0] ?? null;
  if (geometry.type === "MultiPolygon") return geometry.coordinates[0]?.[0] ?? null;
  return null;
}

function centroidOf(geometry: Geometry): [number, number] | null {
  const ring = outerRing(geometry);
  if (!ring || ring.length === 0) return null;
  let sumLon = 0;
  let sumLat = 0;
  for (const [lon, lat] of ring) {
    sumLon += lon;
    sumLat += lat;
  }
  return [sumLon / ring.length, sumLat / ring.length];
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Longest street name worth sending upstream. Helsinki's longest is well
// under this; anything longer is not a street name.
const MAX_CQL_NAME_LENGTH = 80;

// A street name typed by a resident ends up inside a CQL string literal in a
// query we send to the city's WFS. Rather than escape the characters that
// would break out of that literal, keep only the characters a street name is
// actually made of — letters (any alphabet, so Finnish and Swedish spellings
// survive), spaces and hyphens. Quotes, wildcards, parentheses and everything
// else CQL gives meaning to are dropped before the query is built, so there
// is nothing left to escape.
function sanitizeForCql(input: string): string {
  return input
    .replace(/[^\p{L}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CQL_NAME_LENGTH);
}

// The WFS layer's alueen_nimi field holds only bare street names — no house
// numbers, no apartment letters — so "Unioninkatu 6B 32" matches nothing
// even though "Unioninkatu" alone matches fine. Strip everything from the
// first digit onward before searching. Verified live 2026-09-13.
function stripHouseNumber(input: string): string {
  return input.replace(/\s+\d.*$/, "").trim();
}

// Finnish and Swedish street-name suffixes, used to guess a street the
// resident already named in their free-text question — so the location
// step can pre-fill itself instead of asking them to type the same street
// again. A capitalized match only (street names are proper nouns), and only
// the first one found: good enough for a pre-fill the resident can still
// edit or override, not a claim of certainty.
const STREET_NAME_SUFFIXES = [
  "katu", "kuja", "tie", "polku", "väylä", "aukio", "puistikko", // Finnish
  "gatan", "gränd", "vägen", "stigen", "torget", "planen", // Swedish
];

export function guessStreetNameFromText(text: string): string | null {
  const words = text.match(/\p{L}+/gu) ?? [];
  for (const word of words) {
    if (!/^\p{Lu}/u.test(word)) continue;
    const lower = word.toLowerCase();
    if (STREET_NAME_SUFFIXES.some((suffix) => lower.endsWith(suffix) && word.length > suffix.length + 1)) {
      return word;
    }
  }
  return null;
}

const NIMISTO_LAYER = "avoindata:Helsinki_nimisto";

type NimistoFeature = { properties: { nimi?: string | null } };
type NimistoResponse = { features: NimistoFeature[] };

// The maintenance-area layer (YLRE) only carries Finnish street names, so a
// Swedish name typed or auto-filled from the resident's question (e.g.
// "Fredriksgatan") matches nothing there even though the street exists.
// Helsinki's official bilingual name register lets us look up the Finnish
// name and retry — this is a real per-street register (nimi/nimi_sv), not a
// mechanical suffix swap: "Georgsgatan" maps to "Yrjönkatu", not
// "Georginkatu". Verified live 2026-09-13.
async function translateSwedishToFinnishStreetName(base: string, swedishName: string): Promise<string | null> {
  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: NIMISTO_LAYER,
    outputFormat: "application/json",
    count: "5",
    cql_filter: `nimi_sv ILIKE '%${swedishName}%'`,
  });

  const res = await fetch(`${base}?${params.toString()}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as NimistoResponse;
  return data.features.find((f) => f.properties?.nimi)?.properties.nimi ?? null;
}

async function searchMaintenanceAreasByName(
  base: string,
  safeName: string
): Promise<{ lat: number; lon: number; matchedName: string } | null> {
  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: WFS_LAYER,
    outputFormat: "application/json",
    srsName: "EPSG:4326",
    count: "25",
    cql_filter: `alueen_nimi ILIKE '%${safeName}%'`,
  });

  const res = await fetch(`${base}?${params.toString()}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`WFS svarade ${res.status}`);

  const data = (await res.json()) as WfsResponse;
  if (data.numberReturned === 0) return null;

  const centroids = data.features
    .map((f) => centroidOf(f.geometry))
    .filter((c): c is [number, number] => c !== null);
  if (centroids.length === 0) return null;

  const lon = median(centroids.map((c) => c[0]));
  const lat = median(centroids.map((c) => c[1]));

  // Show what the source actually matched (its real spelling/casing), not a
  // blind echo of the user's input — the two can differ.
  const matchedName = data.features.find((f) => f.properties?.alueen_nimi)?.properties.alueen_nimi ?? safeName;

  return { lat, lon, matchedName };
}

export async function geocodeStreetName(
  streetName: string
): Promise<{ lat: number; lon: number; matchedName: string } | null> {
  const base = process.env.HEL_WFS_BASE_URL;
  if (!base) throw new Error("HEL_WFS_BASE_URL saknas");

  const safeName = sanitizeForCql(stripHouseNumber(streetName));
  if (!safeName) return null;

  const direct = await searchMaintenanceAreasByName(base, safeName);
  if (direct) return direct;

  const finnishName = await translateSwedishToFinnishStreetName(base, safeName);
  if (!finnishName) return null;

  return searchMaintenanceAreasByName(base, sanitizeForCql(finnishName));
}
