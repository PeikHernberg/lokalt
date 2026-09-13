import { getSupabase } from "@/lib/supabase";

export type ResponsibleParty =
  | "kaupunki"
  | "kiinteisto"
  | "hkl"
  | "valtio"
  | "liikunta"
  | "ingen";

export type AreaResponsibility = {
  found: boolean;
  party: ResponsibleParty | null;
  maintenanceLevel: string | null;
  areaName: string | null;
  areaType: string | null;
};

const WFS_LAYER = "avoindata:YLRE_Katu_ja_viherosat_kaikki_alue";

// Fältvärdena är fritext och stavningen varierar mellan fälten, se
// lokalt-kontext/claude-kontext/01-datakallor.md. Matcha på substräng, aldrig exakt.
function normalizeParty(raw: string | null | undefined): ResponsibleParty {
  if (!raw) return "ingen";
  const value = raw.toLowerCase();
  if (value.includes("ei ")) return "ingen";
  if (value.includes("kiinteist")) return "kiinteisto";
  if (value.includes("hkl") || value.includes("kaupunkiliikenne")) return "hkl";
  if (value.includes("valtio")) return "valtio";
  if (value.includes("liikunta")) return "liikunta";
  if (value.includes("kaupunkiympäristö")) return "kaupunki";
  return "ingen";
}

type WfsFeature = {
  properties: {
    talvikunnossapito?: string | null;
    puhtaanapito?: string | null;
    rakenteellinen_kunnossapito?: string | null;
    yllapidon_taso_selite?: string | null;
    alueen_nimi?: string | null;
    paatyyppi?: string | null;
  };
};

type WfsResponse = {
  numberReturned: number;
  features: WfsFeature[];
};

// Geometry as returned by the WFS in GeoJSON form (EPSG:4326, [lon, lat]
// pairs) — kept minimal and local rather than shared with geocode-street.ts,
// matching that file's own copy.
export type AreaGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

export type AreaShape = {
  party: ResponsibleParty;
  geometry: AreaGeometry;
};

type WfsBoundsFeature = { geometry: AreaGeometry; properties: WfsFeature["properties"] };
type WfsBoundsResponse = { numberReturned: number; features: WfsBoundsFeature[] };

// Capped well below what a single screenful at street-level zoom returns
// (a few hundred, per live testing) — a defensive ceiling against an
// oversized bbox slipping past the route's own size check.
const MAX_BOUNDS_FEATURES = 1000;

// Rounded to the same ~11m precision as the point cache's lat/lon, joined
// into one key — the maintenance-area boundaries this covers change rarely
// enough that, like the point cache below, entries are never expired.
function boundsCacheKey(bounds: { west: number; south: number; east: number; north: number }): string {
  return [
    roundCoord(bounds.west),
    roundCoord(bounds.south),
    roundCoord(bounds.east),
    roundCoord(bounds.north),
  ].join(",");
}

export async function lookupAreaShapesInBounds(bounds: {
  west: number;
  south: number;
  east: number;
  north: number;
}): Promise<AreaShape[]> {
  const cacheKey = boundsCacheKey(bounds);
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("area_responsibility_bounds_cache")
        .select("response")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (data) return data.response as AreaShape[];
    } catch {
      // Cachen är en optimering. Om den inte svarar går vi vidare till WFS direkt.
    }
  }

  const base = process.env.HEL_WFS_BASE_URL;
  if (!base) throw new Error("HEL_WFS_BASE_URL saknas");

  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: WFS_LAYER,
    outputFormat: "application/json",
    srsName: "EPSG:4326",
    count: String(MAX_BOUNDS_FEATURES),
    // BBOX(propertyName, minX, minY, maxX, maxY, [SRS]) — CQL's BBOX takes
    // plain minx/miny/maxx/maxy, sidestepping the WFS bbox parameter's
    // axis-order ambiguity for EPSG:4326 (see the point-lookup comment
    // above for the same gotcha with INTERSECTS).
    cql_filter: `BBOX(geom,${bounds.west},${bounds.south},${bounds.east},${bounds.north},'EPSG:4326')`,
  });

  const res = await fetch(`${base}?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`WFS svarade ${res.status}`);

  const data = (await res.json()) as WfsBoundsResponse;
  const shapes = data.features.map((f) => ({
    party: normalizeParty(f.properties.talvikunnossapito),
    geometry: f.geometry,
  }));

  if (supabase) {
    try {
      await supabase.from("area_responsibility_bounds_cache").upsert({ cache_key: cacheKey, response: shapes });
    } catch {
      // Cacheskrivning är en optimering, inte ett krav för att svara användaren.
    }
  }

  return shapes;
}

async function fetchFeatureAt(lat: number, lon: number): Promise<WfsFeature | null> {
  const base = process.env.HEL_WFS_BASE_URL;
  if (!base) throw new Error("HEL_WFS_BASE_URL saknas");

  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: WFS_LAYER,
    outputFormat: "application/json",
    srsName: "EPSG:4326",
    count: "1",
    cql_filter: `INTERSECTS(geom, SRID=4326;POINT(${lon} ${lat}))`,
  });

  const res = await fetch(`${base}?${params.toString()}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`WFS svarade ${res.status}`);

  const data = (await res.json()) as WfsResponse;
  return data.features[0] ?? null;
}

function roundCoord(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export async function lookupAreaResponsibility(
  lat: number,
  lon: number
): Promise<AreaResponsibility> {
  const latRounded = roundCoord(lat);
  const lonRounded = roundCoord(lon);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("area_responsibility_cache")
        .select("response")
        .eq("lat_rounded", latRounded)
        .eq("lon_rounded", lonRounded)
        .maybeSingle();
      if (data) return data.response as AreaResponsibility;
    } catch {
      // Cachen är en optimering. Om den inte svarar går vi vidare till WFS direkt.
    }
  }

  const feature = await fetchFeatureAt(lat, lon);
  const result: AreaResponsibility = feature
    ? {
        found: true,
        party: normalizeParty(feature.properties.talvikunnossapito),
        maintenanceLevel: feature.properties.yllapidon_taso_selite ?? null,
        areaName: feature.properties.alueen_nimi ?? null,
        areaType: feature.properties.paatyyppi ?? null,
      }
    : { found: false, party: null, maintenanceLevel: null, areaName: null, areaType: null };

  if (supabase) {
    try {
      await supabase.from("area_responsibility_cache").upsert({
        lat_rounded: latRounded,
        lon_rounded: lonRounded,
        response: result,
      });
    } catch {
      // Cacheskrivning är en optimering, inte ett krav för att svara användaren.
    }
  }

  return result;
}
