/**
 * Link hygiene for URLs that came from somewhere other than our own source.
 *
 * Every outbound link the result screen renders is built from data fetched at
 * runtime — the city's decisions index, the Open311 report corpus — and both
 * arrive over the network and pass through a cache on the way. A link is the
 * one piece of that data the resident is invited to click, so it is the one
 * piece worth checking rather than trusting: a `javascript:` scheme would run
 * in the page, and a host like `paatokset.hel.fi.example.com` would read as
 * the city's own domain in the link text while pointing somewhere else.
 *
 * Anything that isn't https on one of the expected hosts comes back null, and
 * the components already render a plain, unlinked title in that case.
 */
export function safeExternalUrl(raw: string | null | undefined, allowedHosts: string[]): string | null {
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;

  const host = parsed.hostname.toLowerCase();
  // Exact host, or a subdomain of one — never a host that merely starts with
  // an allowed name (that is the `hel.fi.example.com` case).
  const allowed = allowedHosts.some(
    (candidate) => host === candidate || host.endsWith(`.${candidate}`)
  );
  if (!allowed) return null;

  return parsed.toString();
}
