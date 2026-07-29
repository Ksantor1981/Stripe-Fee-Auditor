import type { NextConfig } from "next";
import { LEGACY_BLOG_REDIRECTS } from "./app/blog/_data/blogIndex";
import { getGaMeasurementId } from "./lib/ga";

const isDev = process.env.NODE_ENV === "development";
const hasGa4 = Boolean(getGaMeasurementId());
const gaScriptSrc = hasGa4 ? " https://www.googletagmanager.com" : "";
const gaConnectSrc = hasGa4
  ? " https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com"
  : "";

// CSP: strict in production, relaxed only for Next/React dev overlay
const CSP_DEFAULT = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://plausible.io${gaScriptSrc}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://plausible.io${gaConnectSrc}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.polar.sh",
].join("; ");

/** Allow Notion / dashboards to iframe the lightweight metrics card only. */
const CSP_EMBED = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://plausible.io${gaScriptSrc}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://plausible.io${gaConnectSrc}`,
  "frame-ancestors *",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.polar.sh",
].join("; ");

const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_BLOG_REDIRECTS.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/report/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: CSP_DEFAULT },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Reduces chance of access_token in full URL leaking via Referer on cross-origin navigations
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: CSP_EMBED },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
