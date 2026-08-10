/** Fee blog slugs under /blog/* (static page.tsx per slug). */
export const FEE_BLOG_SLUGS = new Set([
  "how-i-found-1400-in-hidden-stripe-fees",
  "cross-border-stripe-fees-migration-2026",
  "stripe-fee-audit-checklist-for-saas-founders",
  "stripe-fee-leakage-report-may-2026",
  "stripe-alternatives-2026",
  "stripe-credit-card-processing-fees",
  "stripe-vs-paypal-fees",
  "stripe-international-card-fees",
  "stripe-ach-vs-credit-card-fees",
  "stripe-fees-small-transactions",
  "stripe-blended-rate-calculator",
  "how-to-export-stripe-balance-csv",
  "why-stripe-effective-rate-jumped-this-month",
  "why-stripe-fees-increase",
  "how-to-reduce-stripe-fees",
  "stripe-effective-fee-rate-explained",
  "why-stripe-effective-rate-higher-than-2-9-percent",
]);

/** Privacy cluster served by app/blog/[slug]/page.tsx */
export const PRIVACY_SLUGS = new Set([
  "why-i-wont-connect-my-stripe-account-to-third-party-tools",
  "what-does-stripe-oauth-read-only-access-actually-see",
  "how-to-audit-stripe-fees-without-connecting-your-account",
  "the-stripe-data-you-share-with-analytics-tools",
  "csv-vs-api-stripe-fee-analysis",
]);

export type PageContentNamespace = "blog" | "privacy";

export function pageContentNamespaceForSlug(slug: string): PageContentNamespace | null {
  if (PRIVACY_SLUGS.has(slug)) return "privacy";
  if (FEE_BLOG_SLUGS.has(slug)) return "blog";
  return null;
}

/** @deprecated Use slug directly as the messages key */
export function blogContentKeyFromSlug(slug: string): string | null {
  return pageContentNamespaceForSlug(slug) ? slug : null;
}
