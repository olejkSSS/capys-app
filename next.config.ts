import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/perp-dex-volume-rankings",
        destination: "/markets",
        permanent: true,
      },
      {
        source: "/perp-dex-by-volume",
        destination: "/markets",
        permanent: true,
      },
      {
        source: "/perp-dex-open-interest",
        destination: "/markets",
        permanent: true,
      },
      {
        source: "/top-perp-dexes",
        destination: "/markets",
        permanent: true,
      },
      {
        source: "/best-perp-dex-to-farm",
        destination: "/tools/route-finder",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "icons.llamao.fi",
      },
    ],
  },
};

export default nextConfig;
