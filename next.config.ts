import type { NextConfig } from "next";
import path from "path";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://giscus.app https://platform.twitter.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://images.microcms-assets.io https://*.githubusercontent.com https://abs.twimg.com https://pbs.twimg.com;
  font-src 'self';
  connect-src 'self' https://giscus.app https://api.github.com https://vitals.vercel-insights.com https://*.supabase.co;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'self' https://giscus.app https://platform.twitter.com;
  manifest-src 'self';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  // Prevent Next.js from inferring an incorrect workspace root when multiple lockfiles exist.
  // This affects which `.env.*` files are loaded and can lead to mismatched Supabase URL/key.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
    ],
  },
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, "").trim(),
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=()",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
