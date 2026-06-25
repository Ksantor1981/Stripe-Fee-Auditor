import { PRIVACY_ARTICLE_INDEX } from "./privacyPosts";

/** Canonical pillar for “effective rate vs 2.9%” intent (replaces legacy /blog/… URL). */
export const PILLAR_EFFECTIVE_RATE_PATH = "/why-stripe-fee-rate-higher-than-2-9";

export type BlogIndexEntry = {
  slug: string;
  path: string;
  title: string;
  desc: string;
  time: string;
  publishedAt: string;
  updatedAt: string;
  sitemapPriority: number;
};

/** Fee / optimization articles under /blog/* (static page.tsx per slug). */
export const FEE_BLOG_ENTRIES: BlogIndexEntry[] = [
  {
    slug: "cross-border-stripe-fees-migration-2026",
    path: "/blog/cross-border-stripe-fees-migration-2026",
    title: "Cross-Border Stripe Fees & Global Migration (June 2026)",
    desc: "Why record global mobility and remote-work visas can push Stripe effective rates from ~2.9% toward 5%+ — and what to monitor in your CSV.",
    time: "10 min",
    publishedAt: "2026-06-22",
    updatedAt: "2026-06-22",
    sitemapPriority: 0.83,
  },
  {
    slug: "stripe-fee-audit-checklist-for-saas-founders",
    path: "/blog/stripe-fee-audit-checklist-for-saas-founders",
    title: "Stripe Fee Audit Checklist for SaaS Founders",
    desc: "A practical monthly Stripe fee audit checklist: effective rate, Balance CSV, international cards, refunds, small charges, and what to compare over time.",
    time: "8 min",
    publishedAt: "2026-05-25",
    updatedAt: "2026-05-25",
    sitemapPriority: 0.77,
  },
  {
    slug: "stripe-fee-leakage-report-may-2026",
    path: "/blog/stripe-fee-leakage-report-may-2026",
    title: "Stripe Fee Leakage Report: Who Is Safe?",
    desc: "A May 2026 diagnostic model for SaaS founders: which Stripe profiles stay near baseline and which quietly bleed margin.",
    time: "9 min",
    publishedAt: "2026-05-18",
    updatedAt: "2026-05-18",
    sitemapPriority: 0.76,
  },
  {
    slug: "stripe-alternatives-2026",
    path: "/blog/stripe-alternatives-2026",
    title: "Stripe Alternatives in 2026: Check Fees Before Switching",
    desc: "Looking for Stripe alternatives? First audit your real effective rate and identify whether fees, payment mix, or checkout strategy is the real problem.",
    time: "8 min",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.78,
  },
  {
    slug: "stripe-credit-card-processing-fees",
    path: "/blog/stripe-credit-card-processing-fees",
    title: "Stripe Credit Card Processing Fees Explained",
    desc: "Stripe card fees start with the published rate, but your real rate depends on fixed fees, international cards, refunds, disputes, and add-ons.",
    time: "6 min",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.76,
  },
  {
    slug: "stripe-vs-paypal-fees",
    path: "/blog/stripe-vs-paypal-fees",
    title: "Stripe vs PayPal Fees: Real Comparison",
    desc: "Compare published Stripe and PayPal fees, then learn why your actual payment cost depends on checkout mix, refunds, international customers, and average charge size.",
    time: "7 min",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.74,
  },
  {
    slug: "stripe-international-card-fees",
    path: "/blog/stripe-international-card-fees",
    title: "Stripe International Card Fees Explained",
    desc: "Stripe adds 1.5% on international cards. Here's how it works, how to find it in your data, and how to reduce it.",
    time: "6 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.72,
  },
  {
    slug: "stripe-ach-vs-credit-card-fees",
    path: "/blog/stripe-ach-vs-credit-card-fees",
    title: "Stripe ACH vs Credit Card Fees: When ACH Saves Money",
    desc: "ACH usually beats standard domestic card pricing on cost. See the $5 cap math and when B2B SaaS should switch.",
    time: "7 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.72,
  },
  {
    slug: "stripe-fees-small-transactions",
    path: "/blog/stripe-fees-small-transactions",
    title: "Stripe Fees for Small Transactions: Why Your Rate Is Higher",
    desc: "The $0.30 fixed fee dominates micro-transactions — and how feeauditor.com surfaces it.",
    time: "5 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.71,
  },
  {
    slug: "stripe-blended-rate-calculator",
    path: "/blog/stripe-blended-rate-calculator",
    title: "Stripe Blended Rate Calculator: Your True Fee Rate",
    desc: "Formula for blended rate, what pushes it above 2.9%, and how to verify from your CSV.",
    time: "6 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.71,
  },
  {
    slug: "how-to-export-stripe-balance-csv",
    path: "/blog/how-to-export-stripe-balance-csv",
    title: "How to Export Stripe Balance CSV for a Fee Audit",
    desc: "Use the right Itemized Stripe Balance CSV to analyze your real fee rate: export path, required columns, and mistakes to avoid.",
    time: "4 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.73,
  },
  {
    slug: "why-stripe-effective-rate-jumped-this-month",
    path: "/blog/why-stripe-effective-rate-jumped-this-month",
    title: "Why Did My Stripe Effective Rate Jump This Month?",
    desc: "6 specific causes — international cards, new low-priced products, refunds, FX stacking — and how to diagnose each from your CSV.",
    time: "8 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.78,
  },
  {
    slug: "why-stripe-fees-increase",
    path: "/blog/why-stripe-fees-increase",
    title: "Why Did My Stripe Fees Increase?",
    desc: "5 common reasons your effective rate is climbing.",
    time: "5 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.8,
  },
  {
    slug: "how-to-reduce-stripe-fees",
    path: "/blog/how-to-reduce-stripe-fees",
    title: "How to Reduce Your Stripe Fees",
    desc: "Practical tactics: custom pricing, ACH, fewer disputes.",
    time: "7 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.65,
  },
  {
    slug: "stripe-effective-fee-rate-explained",
    path: "/blog/stripe-effective-fee-rate-explained",
    title: "What Is Your Stripe Effective Fee Rate?",
    desc: "How to calculate it and what a healthy rate looks like.",
    time: "4 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.65,
  },
];

const privacyEntries: BlogIndexEntry[] = PRIVACY_ARTICLE_INDEX.map((post) => ({
  slug: post.slug,
  path: `/blog/${post.slug}`,
  title: post.title,
  desc: post.desc,
  time: post.time,
  publishedAt: post.datePublished,
  updatedAt: post.dateModified,
  sitemapPriority: 0.74,
}));

/** Blog hub list (privacy cluster + fee articles). Latest fee article pinned first. */
export const BLOG_HUB_POSTS: BlogIndexEntry[] = [
  FEE_BLOG_ENTRIES[0],
  ...privacyEntries,
  ...FEE_BLOG_ENTRIES.slice(1),
];

/** SEO landing pages outside /blog (included in sitemap). */
export const SEO_LANDING_ENTRIES: BlogIndexEntry[] = [
  {
    slug: "why-stripe-fee-rate-higher-than-2-9",
    path: PILLAR_EFFECTIVE_RATE_PATH,
    title: "Why Are My Stripe Fees So High? 2.9% vs Real Rate",
    desc: "Stripe advertises 2.9% + $0.30, but most businesses pay 3.2–3.8%. Five reasons your effective rate is higher.",
    time: "8 min",
    publishedAt: "2026-05-16",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.85,
  },
  {
    slug: "stripe-fee-calculator",
    path: "/stripe-fee-calculator",
    title: "Stripe Fee Calculator: Estimate Monthly Fees",
    desc: "Estimate monthly Stripe fees from card volume and average charge size, then compare with your real CSV-based rate.",
    time: "5 min",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.8,
  },
  {
    slug: "what-percent-does-stripe-take",
    path: "/what-percent-does-stripe-take",
    title: "What Percentage Does Stripe Take?",
    desc: "Calculate the published Stripe percentage and learn why your real effective rate can be higher.",
    time: "4 min",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.79,
  },
  {
    slug: "how-it-works",
    path: "/how-it-works",
    title: "How Stripe Fee Auditor Handles Your CSV",
    desc: "See exactly what happens when you upload a Stripe Balance CSV: server analysis, stored report data, retention, and core logic links.",
    time: "4 min",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.68,
  },
  {
    slug: "stripe-balance-csv",
    path: "/stripe-balance-csv",
    title: "How to Export Stripe Balance CSV and Check Your Real Fee Rate",
    desc: "Step-by-step guide to export the itemized Stripe Balance CSV, then use it to check whether your real Stripe fee rate is 2.9%, 3.8%, or higher.",
    time: "4 min",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    sitemapPriority: 0.7,
  },
];

export const LEGACY_BLOG_REDIRECTS = [
  {
    source: "/blog/why-stripe-effective-rate-higher-than-2-9-percent",
    destination: PILLAR_EFFECTIVE_RATE_PATH,
  },
] as const;
