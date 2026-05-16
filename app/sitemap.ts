import type { MetadataRoute } from "next";
import { PRIVACY_ARTICLE_INDEX } from "./blog/_data/privacyPosts";

/** Set NEXT_PUBLIC_BASE_URL in production when you use a custom domain. */
const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/analyze`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${base}/blog/why-stripe-fees-increase`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/stripe-fee-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/stripe-balance-csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/why-stripe-fee-rate-higher-than-2-9`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.72 },
    ...PRIVACY_ARTICLE_INDEX.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.74,
    })),
    {
      url: `${base}/blog/why-stripe-effective-rate-higher-than-2-9-percent`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/blog/stripe-international-card-fees`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${base}/blog/stripe-ach-vs-credit-card-fees`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${base}/blog/stripe-fees-small-transactions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.71,
    },
    {
      url: `${base}/blog/stripe-blended-rate-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.71,
    },
    {
      url: `${base}/blog/how-to-export-stripe-balance-csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.73,
    },
    {
      url: `${base}/blog/how-to-reduce-stripe-fees`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/blog/stripe-effective-fee-rate-explained`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
