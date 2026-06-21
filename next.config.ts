import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "www.khs.go.kr" },
      { protocol: "https", hostname: "www.khs.go.kr" },
    ],
  },
};

export default nextConfig;
