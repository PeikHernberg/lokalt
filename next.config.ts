import type { NextConfig } from "next";

// Baseline security headers for every response. The site sets no cookies and
// has no auth, so the main goals are: no embedding in other sites
// (frame-ancestors), no MIME sniffing, and a CSP that blocks foreign scripts.
// 'unsafe-inline' is required by Next.js's own inline bootstrap script/styles
// and the inline JSON-LD structured-data blocks (om/page.tsx, FaqJsonLd,
// OrganizationJsonLd). The browser only ever talks to our own origin —
// Supabase and the city's APIs are only ever called server-side — so
// connect-src 'self' is enough.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
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
