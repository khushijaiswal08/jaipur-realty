import type { NextConfig } from "next";
import { assertPublicEnv } from "./lib/config/validate";

// Fail fast (build + dev start) when business identity / public config is missing or malformed.
// SPEC §34.2: "The build fails rather than shipping a broken contact number."
assertPublicEnv();

const s3PublicUrl = process.env.S3_PUBLIC_URL?.trim();
const isDev = process.env.NODE_ENV !== "production";
const isHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

/**
 * Content-Security-Policy (SPEC §49). Inline scripts are needed for Next's bootstrap, JSON-LD and
 * the analytics snippets, so script-src keeps 'unsafe-inline' but is limited to known hosts.
 * Third-party origins: analytics (GA4/GTM/Meta/Clarity), Turnstile, map + YouTube embeds.
 */
const csp = [
  ["default-src", "'self'"],
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://www.googletagmanager.com",
    "https://connect.facebook.net",
    "https://www.clarity.ms",
    "https://*.clarity.ms",
    "https://challenges.cloudflare.com",
  ],
  ["style-src", "'self'", "'unsafe-inline'"],
  ["img-src", "'self'", "data:", "blob:", "https:"],
  ["font-src", "'self'", "data:"],
  [
    "connect-src",
    "'self'",
    ...(isDev ? ["ws:"] : []),
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://www.googletagmanager.com",
    "https://www.facebook.com",
    "https://*.clarity.ms",
    "https://c.bing.com",
    "https://challenges.cloudflare.com",
  ],
  ["frame-src", "https://www.google.com", "https://www.openstreetmap.org", "https://www.youtube-nocookie.com", "https://challenges.cloudflare.com", "https://www.googletagmanager.com"],
  ["media-src", "'self'", ...(s3PublicUrl ? [new URL(s3PublicUrl).origin] : [])],
  ["object-src", "'none'"],
  ["base-uri", "'self'"],
  ["form-action", "'self'"],
  ["frame-ancestors", "'none'"],
  ...(!isDev && isHttps ? [["upgrade-insecure-requests"]] : []),
]
  .map((d) => d.join(" "))
  .join("; ");

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
          { key: "Content-Security-Policy", value: csp },
          // HSTS only for a production HTTPS deployment (never on localhost).
          ...(!isDev && isHttps ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
