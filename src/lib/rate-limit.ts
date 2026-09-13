import type { NextRequest } from "next/server";

/**
 * Minimal in-memory rate limiter shared by every public API route. Several
 * routes trigger a paid Claude call and others hit the city's own public
 * infrastructure (WFS, Elasticsearch, Open311) — unmetered access to any of
 * them is either a denial-of-wallet or a bad-neighbour risk, so every public
 * route calls this.
 *
 * The state lives in module memory, so the limits are per server instance:
 * exact on a single long-lived `next start` server, best-effort on
 * serverless platforms where instances come and go. That is still enough to
 * stop naive scripted abuse; swap in a shared store (e.g. Upstash Redis)
 * if the deployment ever needs a globally exact limit.
 */

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Generous for a human resident, restrictive for a script.
const MAX_PER_MINUTE = 20;
const MAX_PER_DAY = 200;

interface Bucket {
  minuteStart: number;
  minuteCount: number;
  dayStart: number;
  dayCount: number;
}

const buckets = new Map<string, Bucket>();

/** Drop stale entries so the map can't grow without bound. */
function sweep(now: number) {
  for (const [key, b] of buckets) {
    if (now - b.dayStart > DAY_MS) buckets.delete(key);
  }
}

export function clientIp(req: NextRequest): string {
  // Behind a proxy/CDN the first x-forwarded-for entry is the client.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Returns true if the request is allowed, false if the caller has exceeded
 * either the per-minute or the per-day budget.
 */
export function checkRateLimit(req: NextRequest): boolean {
  const now = Date.now();
  if (buckets.size > 10_000) sweep(now);

  const ip = clientIp(req);
  let b = buckets.get(ip);
  if (!b) {
    b = { minuteStart: now, minuteCount: 0, dayStart: now, dayCount: 0 };
    buckets.set(ip, b);
  }

  if (now - b.minuteStart > MINUTE_MS) {
    b.minuteStart = now;
    b.minuteCount = 0;
  }
  if (now - b.dayStart > DAY_MS) {
    b.dayStart = now;
    b.dayCount = 0;
  }

  if (b.minuteCount >= MAX_PER_MINUTE || b.dayCount >= MAX_PER_DAY) {
    return false;
  }

  b.minuteCount++;
  b.dayCount++;
  return true;
}
