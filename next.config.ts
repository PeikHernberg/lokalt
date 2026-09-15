import type { NextConfig } from "next";

// Baseline security headers for every response. The site sets no cookies, has
// no auth and stores nothing about the resident, so the goals are narrow: no
// embedding in other sites, no MIME sniffing, and a CSP that blocks foreign
// scripts and foreign network calls.
//
// 'unsafe-inline' is required by Next.js's own inline bootstrap script/styles
// and the inline JSON-LD structured-data blocks (om/page.tsx, FaqJsonLd,
// OrganizationJsonLd). The browser only ever talks to our own origin —
// Supabase, Claude and the city's APIs are called server-side only — so
// connect-src 'self' is enough. img-src additionally allows the OpenStreetMap
// tile subdomains for the LocationMap; marker icons are bundled locally.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self'",
  // Nothing on the site embeds or is embedded, loads a plugin, or runs a
  // worker — so each of those is closed rather than left to default-src.
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "media-src 'none'",
  "base-uri 'self'",
  // The one form on the site is the mailto: draft the resident sends
  // themselves; no form on any page posts anywhere but our own origin.
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Two years, subdomains included — the site is https-only in production.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // geolocation stays on: the location picker offers "use my position"
  // (LocationPicker.tsx). Everything else a page could ask the browser for,
  // it has no reason to.
  {
    key: "Permissions-Policy",
    value: [
      "geolocation=(self)",
      "camera=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
      "interest-cohort=()",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

// The API routes carry the resident's own words in the request and, for the
// decisions and nearby-report lookups, in the response too. Nothing in that
// round trip should be written to a CDN edge cache or a browser's disk cache:
// the product's promise is that it keeps nothing, and a cached copy on shared
// infrastructure is a copy it kept.
const noStoreHeaders = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
  { key: "Pragma", value: "no-cache" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework version to scanners.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/api/(.*)", headers: noStoreHeaders },
    ];
  },
  async redirects() {
    return [
      {
        source: "/om",
        destination: "/sv/om",
        permanent: true,
      },
      {
        source: "/app",
        destination: "/sv/app",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
