import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// `'unsafe-eval'` is required by React Fast Refresh in `next dev`, and by the
// Ace editor (admin only). We therefore allow it everywhere in development, but
// in production only on the authenticated /admin & /login routes — public pages
// get a stricter policy. KaTeX renders without eval (server-side + client
// `katex.renderToString`).
// `'unsafe-inline'` is kept for script-src/style-src: Next injects inline
// bootstrap scripts and KaTeX emits inline styles; removing it requires a nonce
// (tracked as a follow-up).
function buildCsp({ allowEval }: { allowEval: boolean }): string {
  const scriptSrc = ["'self'", "'unsafe-inline'", allowEval ? "'unsafe-eval'" : "", "https://giscus.app", "https://platform.twitter.com", "https://va.vercel-scripts.com"]
    .filter(Boolean)
    .join(" ");

  return `
  default-src 'self';
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://giscus.app https://api.github.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.supabase.co;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'self' https://giscus.app https://platform.twitter.com https://www.youtube.com https://www.google.com https://maps.google.com;
  manifest-src 'self';
  upgrade-insecure-requests;
`;
}

const publicCsp = buildCsp({ allowEval: isDev });
const adminCsp = buildCsp({ allowEval: true });

const oneLine = (value: string) => value.replace(/\n/g, "").trim();

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
        hostname: "*.supabase.co",
      },
    ],
  },
  typedRoutes: true,
  async redirects() {
    return [
      {
        source: "/diary/ziz_4vfmu",
        destination: "/diary/tokyo-2025-d-module",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Non-CSP security headers apply to every route.
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
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=()",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
      {
        // Authenticated admin & login routes: looser CSP (Ace editor needs eval).
        // These rules and the public rule below are mutually exclusive, so each
        // path receives exactly one Content-Security-Policy header.
        source: "/admin/:path*",
        headers: [{ key: "Content-Security-Policy", value: oneLine(adminCsp) }],
      },
      {
        source: "/login",
        headers: [{ key: "Content-Security-Policy", value: oneLine(adminCsp) }],
      },
      {
        // Everything except /admin/** and /login: stricter CSP (no unsafe-eval in prod).
        source: "/((?!admin(?:$|/)|login(?:$|/)).*)",
        headers: [{ key: "Content-Security-Policy", value: oneLine(publicCsp) }],
      },
    ];
  },
};

export default nextConfig;
