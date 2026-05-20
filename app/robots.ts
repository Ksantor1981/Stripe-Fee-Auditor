import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/report/", "/embed/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
