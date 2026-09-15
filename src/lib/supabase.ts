import { createClient } from "@supabase/supabase-js";

// No generated Database types yet (see data/bodies.json's WFS/Elasticsearch
// sources, not a Postgres schema), so the clients are untyped.
type Client = ReturnType<typeof createClient<any>>;

let readClient: Client | null = null;
let writeClient: Client | null = null;

const OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/**
 * Read-only client, using the anon key.
 *
 * The anon key is a public value by Supabase's design — it is safe to assume
 * it will eventually be seen by someone outside the project. The database is
 * set up so that this key can do nothing but SELECT the cache tables and the
 * ingested reports: every table privilege beyond SELECT is revoked from the
 * `anon` role, so a leaked key cannot rewrite what the site shows residents.
 * Use this for every lookup.
 */
export function getSupabase(): Client | null {
  if (readClient) return readClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  readClient = createClient<any>(url, key, OPTIONS);
  return readClient;
}

/**
 * Write client, using the service-role key — the only credential that can
 * fill the caches. It bypasses RLS, so it must never leave the server: it is
 * read from a non-`NEXT_PUBLIC_` variable and only ever used inside route
 * handlers and the lib functions they call.
 *
 * Returns null when the key isn't configured, which is a supported state:
 * cache writes are an optimisation and every caller already treats a failed
 * write as a no-op, so the site keeps working (it just re-fetches from the
 * city's services more often).
 */
export function getSupabaseWriter(): Client | null {
  if (writeClient) return writeClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  writeClient = createClient<any>(url, key, OPTIONS);
  return writeClient;
}
