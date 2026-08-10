import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { LEGACY_BLOG_REDIRECTS } from "./app/blog/_data/blogIndex";
import { SEO_KEYWORD_REDIRECTS } from "./lib/seo-redirects";
import { getGaMeasurementId } from "./lib/ga";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";
const hasGa4 = Boolean(getGaMeasurementId());
// Official GA4 (+ Ads) CSP hosts: https://developers.google.com/tag-platform/security/guides/csp
const gaScriptSrc = hasGa4 ? " https://www.googletagmanager.com https://*.googletagmanager.com" : "";
const gaImgSrc = hasGa4
  ? " https://*.google-analytics.com https://www.googletagmanager.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com"
  : "";
const gaConnectSrc = hasGa4
  ? " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://pagead2.googlesyndication.com"
  : "";
const gaFrameSrc = hasGa4 ? " https://www.googletagmanager.com" : "";

// CSP: strict in production, relaxed only for Next/React dev overlay
const CSP_DEFAULT = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://plausible.io${gaScriptSrc}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${gaImgSrc}`,
  "font-src 'self'",
  `connect-src 'self' https://plausible.io${gaConnectSrc}`,
  `frame-src 'self'${gaFrameSrc}`,
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
  `img-src 'self' data: blob:${gaImgSrc}`,
  "font-src 'self'",
  `connect-src 'self' https://plausible.io${gaConnectSrc}`,
  `frame-src 'self'${gaFrameSrc}`,
  "frame-ancestors *",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' *.polar.sh",
].join("; ");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...LEGACY_BLOG_REDIRECTS.map((r) => ({
        source: r.source,
        destination: r.destination,
        permanent: true,
      })),
      ...SEO_KEYWORD_REDIRECTS.map((r) => ({
        source: r.source,
        destination: r.destination,
        permanent: true,
      })),
    ];
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

export default withNextIntl(nextConfig);
