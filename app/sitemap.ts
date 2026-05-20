import type { MetadataRoute } from "next";
import {
  BLOG_HUB_POSTS,
  SEO_LANDING_ENTRIES,
} from "./blog/_data/blogIndex";

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticCore: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/analyze`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.72 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogAndLandings: MetadataRoute.Sitemap = [
    ...BLOG_HUB_POSTS,
    ...SEO_LANDING_ENTRIES,
  ].map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: entry.sitemapPriority,
  }));

  return [...staticCore, ...blogAndLandings];
}
