import type { Metadata } from "next";
import Link from "next/link";
import { PRIVACY_ARTICLE_INDEX } from "./_data/privacyPosts";

export const metadata: Metadata = {
  title: "Blog — Stripe Fee Auditor",
  description: "Guides on understanding and reducing your Stripe fees.",
  alternates: { canonical: "/blog" },
};

const POSTS = [
  ...PRIVACY_ARTICLE_INDEX,
  {
    slug: "stripe-fee-leakage-report-may-2026",
    title: "Stripe Fee Leakage Report: Who Is Safe?",
    desc: "A May 2026 diagnostic model for SaaS founders: which Stripe profiles stay near baseline and which quietly bleed margin.",
    time: "9 min",
  },
  {
    slug: "why-stripe-effective-rate-higher-than-2-9-percent",
    title: "Why Is My Stripe Effective Rate Higher Than 2.9%?",
    desc: "4 real reasons your blended Stripe fee rate is higher than advertised — and what to do about each.",
    time: "8 min",
  },
  {
    slug: "stripe-international-card-fees",
    title: "Stripe International Card Fees Explained",
    desc: "Stripe adds 1.5% on international cards. Here's how it works, how to find it in your data, and how to reduce it.",
    time: "6 min",
  },
  {
    slug: "stripe-ach-vs-credit-card-fees",
    title: "Stripe ACH vs Credit Card Fees: When ACH Saves Money",
    desc: "ACH can beat cards on larger invoices. See the break-even math, $5 cap, and when B2B SaaS should switch.",
    time: "7 min",
  },
  {
    slug: "stripe-fees-small-transactions",
    title: "Stripe Fees for Small Transactions: Why Your Rate Is Higher",
    desc: "The $0.30 fixed fee dominates micro-transactions — and how feeauditor.com surfaces it.",
    time: "5 min",
  },
  {
    slug: "stripe-blended-rate-calculator",
    title: "Stripe Blended Rate Calculator: Your True Fee Rate",
    desc: "Formula for blended rate, what pushes it above 2.9%, and how to verify from your CSV.",
    time: "6 min",
  },
  {
    slug: "how-to-export-stripe-balance-csv",
    title: "Export Stripe Balance CSV: Itemized vs Summary",
    desc: "Use the right Stripe Balance CSV for fee analysis: Itemized export path, required columns, and mistakes to avoid.",
    time: "4 min",
  },
  {
    slug: "why-stripe-fees-increase",
    title: "Why Did My Stripe Fees Increase?",
    desc: "5 common reasons your effective rate is climbing.",
    time: "5 min",
  },
  {
    slug: "how-to-reduce-stripe-fees",
    title: "How to Reduce Your Stripe Fees",
    desc: "Practical tactics: custom pricing, ACH, fewer disputes.",
    time: "7 min",
  },
  {
    slug: "stripe-effective-fee-rate-explained",
    title: "What Is Your Stripe Effective Fee Rate?",
    desc: "How to calculate it and what a healthy rate looks like.",
    time: "4 min",
  },
];

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Home</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Blog</h1>
        <p className="mt-2 text-gray-500">Guides on Stripe fees, optimization, and analytics.</p>
        <div className="mt-10 space-y-4">
          {POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow transition-all"
            >
              <h2 className="font-semibold text-gray-900">{p.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
              <p className="mt-2 text-xs text-gray-400">{p.time} read</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
