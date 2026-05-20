import { PRIVACY_ARTICLE_INDEX } from "./privacyPosts";

/** Canonical pillar for “effective rate vs 2.9%” intent (replaces legacy /blog/… URL). */
export const PILLAR_EFFECTIVE_RATE_PATH = "/why-stripe-fee-rate-higher-than-2-9";

export type BlogIndexEntry = {
  slug: string;
  path: string;
  title: string;
  desc: string;
  time: string;
  sitemapPriority: number;
};

/** Fee / optimization articles under /blog/* (static page.tsx per slug). */
export const FEE_BLOG_ENTRIES: BlogIndexEntry[] = [
  {
    slug: "stripe-fee-leakage-report-may-2026",
    path: "/blog/stripe-fee-leakage-report-may-2026",
    title: "Stripe Fee Leakage Report: Who Is Safe?",
    desc: "A May 2026 diagnostic model for SaaS founders: which Stripe profiles stay near baseline and which quietly bleed margin.",
    time: "9 min",
    sitemapPriority: 0.76,
  },
  {
    slug: "stripe-international-card-fees",
    path: "/blog/stripe-international-card-fees",
    title: "Stripe International Card Fees Explained",
    desc: "Stripe adds 1.5% on international cards. Here's how it works, how to find it in your data, and how to reduce it.",
    time: "6 min",
    sitemapPriority: 0.72,
  },
  {
    slug: "stripe-ach-vs-credit-card-fees",
    path: "/blog/stripe-ach-vs-credit-card-fees",
    title: "Stripe ACH vs Credit Card Fees: When ACH Saves Money",
    desc: "ACH usually beats standard domestic card pricing on cost. See the $5 cap math and when B2B SaaS should switch.",
    time: "7 min",
    sitemapPriority: 0.72,
  },
  {
    slug: "stripe-fees-small-transactions",
    path: "/blog/stripe-fees-small-transactions",
    title: "Stripe Fees for Small Transactions: Why Your Rate Is Higher",
    desc: "The $0.30 fixed fee dominates micro-transactions — and how feeauditor.com surfaces it.",
    time: "5 min",
    sitemapPriority: 0.71,
  },
  {
    slug: "stripe-blended-rate-calculator",
    path: "/blog/stripe-blended-rate-calculator",
    title: "Stripe Blended Rate Calculator: Your True Fee Rate",
    desc: "Formula for blended rate, what pushes it above 2.9%, and how to verify from your CSV.",
    time: "6 min",
    sitemapPriority: 0.71,
  },
  {
    slug: "how-to-export-stripe-balance-csv",
    path: "/blog/how-to-export-stripe-balance-csv",
    title: "Export Stripe Balance CSV: Itemized vs Summary",
    desc: "Use the right Stripe Balance CSV for fee analysis: Itemized export path, required columns, and mistakes to avoid.",
    time: "4 min",
    sitemapPriority: 0.73,
  },
  {
    slug: "why-stripe-fees-increase",
    path: "/blog/why-stripe-fees-increase",
    title: "Why Did My Stripe Fees Increase?",
    desc: "5 common reasons your effective rate is climbing.",
    time: "5 min",
    sitemapPriority: 0.8,
  },
  {
    slug: "how-to-reduce-stripe-fees",
    path: "/blog/how-to-reduce-stripe-fees",
    title: "How to Reduce Your Stripe Fees",
    desc: "Practical tactics: custom pricing, ACH, fewer disputes.",
    time: "7 min",
    sitemapPriority: 0.65,
  },
  {
    slug: "stripe-effective-fee-rate-explained",
    path: "/blog/stripe-effective-fee-rate-explained",
    title: "What Is Your Stripe Effective Fee Rate?",
    desc: "How to calculate it and what a healthy rate looks like.",
    time: "4 min",
    sitemapPriority: 0.65,
  },
];

const privacyEntries: BlogIndexEntry[] = PRIVACY_ARTICLE_INDEX.map((post) => ({
  slug: post.slug,
  path: `/blog/${post.slug}`,
  title: post.title,
  desc: post.desc,
  time: post.time,
  sitemapPriority: 0.74,
}));

/** Blog hub list (privacy cluster + fee articles). Pillar page is listed separately on the hub. */
export const BLOG_HUB_POSTS: BlogIndexEntry[] = [...privacyEntries, ...FEE_BLOG_ENTRIES];

/** SEO landing pages outside /blog (included in sitemap). */
export const SEO_LANDING_ENTRIES: BlogIndexEntry[] = [
  {
    slug: "why-stripe-fee-rate-higher-than-2-9",
    path: PILLAR_EFFECTIVE_RATE_PATH,
    title: "Why Are My Stripe Fees So High? 2.9% vs Real Rate",
    desc: "Stripe advertises 2.9% + $0.30, but most businesses pay 3.2–3.8%. Five reasons your effective rate is higher.",
    time: "8 min",
    sitemapPriority: 0.85,
  },
  {
    slug: "stripe-fee-calculator",
    path: "/stripe-fee-calculator",
    title: "Stripe Fee Calculator",
    desc: "Estimate your blended Stripe fee rate from volume and mix.",
    time: "5 min",
    sitemapPriority: 0.8,
  },
  {
    slug: "stripe-balance-csv",
    path: "/stripe-balance-csv",
    title: "Stripe Balance CSV Guide",
    desc: "Export and use Stripe Balance Transactions for fee analysis.",
    time: "4 min",
    sitemapPriority: 0.7,
  },
];

export const LEGACY_BLOG_REDIRECTS = [
  {
    source: "/blog/why-stripe-effective-rate-higher-than-2-9-percent",
    destination: PILLAR_EFFECTIVE_RATE_PATH,
  },
] as const;
