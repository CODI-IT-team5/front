import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", 
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/proxy/:path*",
        destination: "http://3.34.104.78/api/:path*", 
      },
    ];
  },
};

export default nextConfig;