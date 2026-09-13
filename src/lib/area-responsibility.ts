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
