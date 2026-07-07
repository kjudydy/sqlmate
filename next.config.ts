import type { NextConfig } from "next";

const noStoreHeaders = [
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0"
  },
  {
    key: "Pragma",
    value: "no-cache"
  },
  {
    key: "Expires",
    value: "0"
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/",
        headers: noStoreHeaders
      },
      {
        source: "/((?!_next/static|favicon.ico).*)",
        headers: noStoreHeaders
      }
    ];
  }
};

export default nextConfig;
