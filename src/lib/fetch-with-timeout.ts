// Bounds how long the browser waits for one of our own API routes before
// giving up — otherwise a stalled request (proxy hang, upstream overload)
// leaves the resident staring at a loading state forever with no feedback.
// Server-side, the corresponding route already fails fast on its own model
// call (see route-question/draft/nearby-reports); this is the client-side
// backstop for the rest of the round trip.
const REQUEST_TIMEOUT_MS = 30_000;

export function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}
