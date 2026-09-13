/** @type {import('next').NextConfig} */
const nextConfig = {
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
