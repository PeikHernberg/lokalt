import { createClient } from "@supabase/supabase-js";

// No generated Database types yet (see data/bodies.json's WFS/Elasticsearch
// sources, not a Postgres schema), so the client is untyped.
let client: ReturnType<typeof createClient<any>> | null = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  client = createClient<any>(url, key);
  return client;
}
