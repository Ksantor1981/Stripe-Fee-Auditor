import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://stripe-fee-auditor.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/analyze", "/blog/"],
        disallow: ["/api/", "/report/", "/admin/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
