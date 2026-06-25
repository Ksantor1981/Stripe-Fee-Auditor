import type { MetadataRoute } from "next";
import {
  BLOG_HUB_POSTS,
  SEO_LANDING_ENTRIES,
} from "./blog/_data/blogIndex";

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com";
const CORE_UPDATED_AT = "2026-06-25";

function date(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const coreUpdatedAt = date(CORE_UPDATED_AT);

  const staticCore: MetadataRoute.Sitemap = [
    { url: base, lastModified: coreUpdatedAt, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/analyze`, lastModified: coreUpdatedAt, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/monitor`, lastModified: coreUpdatedAt, changeFrequency: "weekly", priority: 0.72 },
    { url: `${base}/blog`, lastModified: coreUpdatedAt, changeFrequency: "weekly", priority: 0.72 },
    { url: `${base}/about`, lastModified: coreUpdatedAt, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: coreUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: coreUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund`, lastModified: coreUpdatedAt, changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogAndLandings: MetadataRoute.Sitemap = [
    ...BLOG_HUB_POSTS,
    ...SEO_LANDING_ENTRIES,
  ].map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: date(entry.updatedAt),
    changeFrequency: "monthly" as const,
    priority: entry.sitemapPriority,
  }));

  return [...staticCore, ...blogAndLandings];
}
