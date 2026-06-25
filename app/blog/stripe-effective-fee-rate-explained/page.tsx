import type { Metadata } from "next";
import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { BlogFaqSection, BlogJsonLd, BlogSourcesSection } from "@/components/BlogSeoBlocks";
import { buildOgImageUrl } from "@/lib/seo-og";

const pageTitle = "What Is Your Stripe Effective Fee Rate?";
const pageDescription =
  "Your effective Stripe fee rate is the true percentage of revenue you pay to Stripe. Learn how to calculate it and what a good rate looks like.";
const pagePath = "/blog/stripe-effective-fee-rate-explained";
const published = "2026-05-16";
const updated = "2026-06-25";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe effective rate" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  alternates: { canonical: pagePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://feeauditor.com/blog/stripe-effective-fee-rate-explained",
    type: "article",
    publishedTime: published,
    modifiedTime: updated,
    images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

const FAQ_ITEMS = [
  {
    question: "What is Stripe effective fee rate?",
    answer:
      "Stripe effective fee rate is total Stripe fees divided by total processed charge volume for the same period. It shows the real percentage of revenue paid to Stripe after fixed fees, international cards, refunds, disputes, and add-ons.",
  },
  {
    question: "Is effective fee rate the same as Stripe's 2.9% rate?",
    answer:
      "No. Stripe's 2.9% + $0.30 is a published rate for a common card scenario. Your effective rate uses your actual transaction mix, so it can be higher when you have small charges, international customers, or refund/dispute activity.",
  },
  {
    question: "What is a good Stripe effective fee rate?",
    answer:
      "For domestic US card payments with healthy average transaction size, roughly 3.0% to 3.3% can be normal. A rate above 3.5% usually deserves investigation, especially for SaaS with international cards or low-ticket plans.",
  },
];

const SOURCES = [
  { href: "https://stripe.com/pricing", title: "Stripe pricing" },
  { href: "https://docs.stripe.com/reports", title: "Stripe reports documentation" },
  { href: "https://docs.stripe.com/reports/balance-transaction-types", title: "Stripe balance transaction types" },
];

export default function BlogPost3() {
  return (
    <main className="min-h-screen bg-white">
      <BlogJsonLd title={pageTitle} description={pageDescription} path={pagePath} published={published} updated={updated} faqs={FAQ_ITEMS} />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">
          What Is Your Stripe Effective Fee Rate?
        </h1>
        <p className="mt-3 text-gray-500 text-sm">4 min read · Fundamentals</p>

        <div className="mt-8 space-y-5 text-base text-gray-700 leading-relaxed">
          <p>
            Stripe advertises 2.9% + $0.30 per transaction. But what you actually pay —
            your <strong>effective fee rate</strong> — is almost always different, and usually higher.
          </p>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
            <h2 className="text-base font-bold text-blue-950">Definition: Stripe effective fee rate</h2>
            <p className="mt-2">
              Stripe effective fee rate is the total amount you paid in Stripe fees divided by your
              total processed charge volume for the same period. It is the practical answer to
              “what percentage did Stripe actually take?”
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">How to Calculate It</h2>
          <p>
            Effective fee rate = total fees paid ÷ total charge volume × 100
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm">
            <p>Total fees: $1,240</p>
            <p>Total volume: $38,500</p>
            <p>Effective rate: $1,240 / $38,500 = <strong>3.22%</strong></p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">What&apos;s a Good Effective Rate?</h2>
          <p>
            For US-only domestic transactions with an average order value of $50+,
            a rate of 3.0–3.3% is typical. Higher than 3.5% usually means there&apos;s
            something to investigate — international cards, disputes, or small transaction sizes.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Why It&apos;s Higher Than 2.9%</h2>
          <p>
            Several factors push the rate above the advertised 2.9%:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>The $0.30 fixed fee adds ~0.3% on a $100 average order</li>
            <li>International cards add 1.5% cross-border on top of base pricing</li>
            <li>Currency conversion often adds ~1% when settlement currency differs — stacks with international surcharges</li>
            <li>Stripe Billing: ~0.7% of billing volume on pay-as-you-go, or fixed annual plans from ~$620/month — check your plan</li>
            <li>Disputes cost $15 each</li>
            <li>Refunds don&apos;t return the original processing fee</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Track It Monthly</h2>
          <p>
            The effective rate can shift month to month based on your customer mix.
            Tracking it helps you catch problems early — like a sudden influx of international
            traffic, or a disputed batch of transactions.
          </p>
        </div>

        <BlogFaqSection items={FAQ_ITEMS} />

        <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 text-center">
          <p className="font-semibold text-gray-900 mb-2">Calculate your effective rate instantly</p>
          <Link href="/analyze" className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Analyze My Fees →
          </Link>
          <BlogBetaRetentionNote tone="gray" />
        </div>

        <BlogSourcesSection items={SOURCES} />
      </div>
    </main>
  );
}
