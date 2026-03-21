import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [25, 50, 75, 100],
  },
  rewrites() {
    return [
      {
        source: "/notebook/:path*",
        destination: "https://omnix-backend-l2h4.onrender.com/notebook/:path*",
      },
    ];
  },
};

export default nextConfig;
