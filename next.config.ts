import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
