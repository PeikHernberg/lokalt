const WFS_LAYER = "avoindata:YLRE_Katu_ja_viherosat_kaikki_alue";

type Ring = number[][];
type Geometry =
  | { type: "Polygon"; coordinates: Ring[] }
  | { type: "MultiPolygon"; coordinates: Ring[][] };

type WfsFeature = { geometry: Geometry };
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

// Sanitize a user-typed street name for use inside a CQL string literal:
// escape single quotes and strip characters CQL doesn't expect in a plain
// ILIKE pattern, so user input can never break out of the literal.
function sanitizeForCql(input: string): string {
  return input.replace(/'/g, "''").replace(/[%_]/g, "");
}

export async function geocodeStreetName(
  streetName: string
): Promise<{ lat: number; lon: number; matchedName: string } | null> {
  const base = process.env.HEL_WFS_BASE_URL;
  if (!base) throw new Error("HEL_WFS_BASE_URL saknas");

  const safeName = sanitizeForCql(streetName.trim());
  if (!safeName) return null;

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

  return { lat, lon, matchedName: streetName.trim() };
}
