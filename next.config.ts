import type { NextConfig } from "next";
import { assertPublicEnv } from "./lib/config/validate";

// Fail fast (build + dev start) when business identity / public config is missing or malformed.
// SPEC §34.2: "The build fails rather than shipping a broken contact number."
assertPublicEnv();

const s3PublicUrl = process.env.S3_PUBLIC_URL?.trim();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    remotePatterns: s3PublicUrl ? [new URL(`${s3PublicUrl.replace(/\/+$/, "")}/**`)] : [],
  },
  serverExternalPackages: ["sharp"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
