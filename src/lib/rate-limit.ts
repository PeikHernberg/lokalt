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

/**
 * Routes are budgeted by what a call actually costs us.
 *
 * "model" covers the routes that spend money on a Claude call
 * (route-question, draft, nearby-reports). "lookup" covers the routes that
 * only read the city's open data, which are cheap for us but still shouldn't
 * be used to hammer someone else's servers — and which the result screen
 * legitimately calls several times, plus once per map pan.
 */
export type RouteCost = "model" | "lookup";

const LIMITS: Record<RouteCost, { perMinute: number; perDay: number }> = {
  model: { perMinute: 15, perDay: 100 },
  lookup: { perMinute: 40, perDay: 400 },
};

/**
 * A ceiling across all callers, not just one. Per-IP limits do nothing about
 * a spread of addresses, which is exactly the shape of a bill-running attack
 * on the model routes — so the spend is bounded in absolute terms too, above
 * anything the real traffic of a city-sized audience would reach.
 */
const GLOBAL_LIMITS: Record<RouteCost, { perMinute: number; perDay: number }> = {
  model: { perMinute: 200, perDay: 5_000 },
  lookup: { perMinute: 1_000, perDay: 30_000 },
};

interface Bucket {
  minuteStart: number;
  minuteCount: number;
  dayStart: number;
  dayCount: number;
}

const buckets = new Map<string, Bucket>();
const globalBuckets = new Map<RouteCost, Bucket>();

/** Drop stale entries so the map can't grow without bound. */
function sweep(now: number) {
  for (const [key, b] of buckets) {
    if (now - b.dayStart > DAY_MS) buckets.delete(key);
  }
}

function newBucket(now: number): Bucket {
  return { minuteStart: now, minuteCount: 0, dayStart: now, dayCount: 0 };
}

function roll(b: Bucket, now: number) {
  if (now - b.minuteStart > MINUTE_MS) {
    b.minuteStart = now;
    b.minuteCount = 0;
  }
  if (now - b.dayStart > DAY_MS) {
    b.dayStart = now;
    b.dayCount = 0;
  }
}

/**
 * How many proxies sit between the internet and this server. The client can
 * put anything it likes in X-Forwarded-For, and each proxy appends the address
 * it actually saw — so only the last N entries are ones a caller could not
 * have written, and the first entry (the obvious-looking one) is precisely the
 * attacker-controlled one. Reading from the right by hop count is what makes
 * the limiter hold: taking the leftmost entry lets anyone reset their own
 * budget on every request just by varying a header.
 *
 * Defaults to 1, which is right for the usual single reverse proxy or CDN in
 * front of the app. Set TRUSTED_PROXY_HOPS if the deployment stacks more.
 */
function trustedProxyHops(): number {
  const raw = Number(process.env.TRUSTED_PROXY_HOPS);
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

export function clientIp(req: NextRequest): string {
  // Platform-set headers first: each carries a single address written by the
  // platform itself, so there is no attacker-supplied portion to strip.
  const trusted =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("fly-client-ip") ??
    req.headers.get("true-client-ip");
  if (trusted) return trusted.trim();

  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      const index = Math.max(0, parts.length - trustedProxyHops());
      return parts[index];
    }
  }

  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

/**
 * Returns true if the request is allowed, false if either this caller or the
 * site as a whole has exceeded the budget for this class of route.
 */
export function checkRateLimit(req: NextRequest, cost: RouteCost = "lookup"): boolean {
  const now = Date.now();
  if (buckets.size > 10_000) sweep(now);

  const globalLimit = GLOBAL_LIMITS[cost];
  let g = globalBuckets.get(cost);
  if (!g) {
    g = newBucket(now);
    globalBuckets.set(cost, g);
  }
  roll(g, now);
  if (g.minuteCount >= globalLimit.perMinute || g.dayCount >= globalLimit.perDay) {
    return false;
  }

  const limit = LIMITS[cost];
  // Keyed per cost tier as well as per address, so exhausting the cheap
  // lookups can't also lock the caller out of the routes that matter.
  const key = `${cost}:${clientIp(req)}`;
  let b = buckets.get(key);
  if (!b) {
    b = newBucket(now);
    buckets.set(key, b);
  }
  roll(b, now);
  if (b.minuteCount >= limit.perMinute || b.dayCount >= limit.perDay) {
    return false;
  }

  b.minuteCount++;
  b.dayCount++;
  g.minuteCount++;
  g.dayCount++;
  return true;
}
