#!/usr/bin/env node
// One-off 12-month backfill for feedback_reports, per
// lokalt-kontext/claude-kontext/02-byggordning.md step 4. Drives the
// deployed "ingest-palaute" Edge Function one day at a time (Open311 caps a
// single request at 100 results, and a day never comes close to that at
// current volumes) and logs the daily count to ingest_log.
//
// Run with: node scripts/backfill-palaute.mjs [days]   (default 365)

import { readFileSync } from "node:fs";

function loadEnvLocal() {
  try {
    const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {
    // No .env.local — assume the vars are already in the environment.
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("SUPABASE_URL / SUPABASE_ANON_KEY saknas (se .env.local).");
  process.exit(1);
}

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ingest-palaute`;
// The Edge Function is the only writer to feedback_reports. A valid anon JWT
// is enough to reach any Edge Function, and the anon key is public by design,
// so the function also requires a shared secret. Set INGEST_SECRET here to the
// same value configured on the function (Supabase -> Edge Functions -> Secrets).
const INGEST_SECRET = process.env.INGEST_SECRET ?? "";
const DAYS = Number(process.argv[2]) || 365;
const DELAY_MS = 150;

function dateString(d) {
  return d.toISOString().slice(0, 10);
}

async function ingestDay(dateStr) {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(INGEST_SECRET ? { "x-ingest-secret": INGEST_SECRET } : {}),
    },
    body: JSON.stringify({ mode: "day", date: dateStr }),
  });
  if (!res.ok) throw new Error(`${dateStr}: HTTP ${res.status} — ${await res.text()}`);
  return res.json();
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let total = 0;
  let failures = 0;

  for (let i = DAYS; i >= 1; i--) {
    const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = dateString(day);
    try {
      const result = await ingestDay(dateStr);
      total += result.count;
      if ((DAYS - i) % 30 === 0 || i === 1) {
        console.log(`${dateStr}: ${result.count} poster (totalt hittills: ${total})`);
      }
    } catch (err) {
      failures++;
      console.error(`${dateStr}: FEL — ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\nKlar. ${total} poster totalt över ${DAYS} dygn, ${failures} dygn misslyckades.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
