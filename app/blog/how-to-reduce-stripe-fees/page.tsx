import type { Metadata } from "next";
import Link from "next/link";
import { BlogArticleCta } from "@/components/BlogArticleCta";
import { BlogFaqSection, BlogJsonLd, BlogSourcesSection } from "@/components/BlogSeoBlocks";
import { PILLAR_EFFECTIVE_RATE_PATH } from "../_data/blogIndex";
import { buildOgImageUrl } from "@/lib/seo-og";

const pageTitle = "How to Reduce Your Stripe Fees";
const pageDescription =
  "Practical tactics to lower your Stripe effective fee rate: negotiate custom pricing, reduce disputes, optimize currency settings, and more.";
const pagePath = "/blog/how-to-reduce-stripe-fees";
const published = "2026-05-16";
const updated = "2026-06-25";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe fee optimization" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  alternates: { canonical: pagePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://feeauditor.com/blog/how-to-reduce-stripe-fees",
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

const TACTICS = [
  ["Add ACH for large B2B invoices", "High", "Best for US B2B invoices and annual plans"],
  ["Raise average transaction size", "High", "Best for low-ticket subscriptions or add-ons"],
  ["Offer local payment methods", "Medium-high", "Best for international customer bases"],
  ["Reduce disputes and refunds", "Medium", "Best when refund/dispute rows are visible in CSV"],
  ["Negotiate custom pricing", "Medium", "Best after meaningful monthly processing volume"],
  ["Review Billing/Radar/Tax add-ons", "Case-by-case", "Best when non-charge fee rows are growing"],
];

const FAQ_ITEMS = [
  {
    question: "What is the fastest way to reduce Stripe fees?",
    answer:
      "The fastest path depends on your fee driver. For large B2B invoices, ACH can be the biggest win. For small charges, bundling or annual billing usually helps more. For international customers, local payment methods can reduce card surcharges.",
  },
  {
    question: "Can I negotiate Stripe fees?",
    answer:
      "Stripe may discuss custom pricing for businesses with meaningful processing volume or specific payment needs. Before negotiating, measure your current effective rate and fee drivers from your Balance CSV.",
  },
  {
    question: "Should I switch away from Stripe to reduce fees?",
    answer:
      "Not always. First identify whether your cost comes from Stripe's base pricing, international cards, small charges, refunds, disputes, or add-ons. Some problems can be fixed inside Stripe by changing payment mix.",
  },
];

const SOURCES = [
  { href: "https://stripe.com/pricing", title: "Stripe pricing" },
  { href: "https://docs.stripe.com/payments/payment-methods", title: "Stripe payment methods" },
  { href: "https://docs.stripe.com/disputes", title: "Stripe disputes documentation" },
];

const RELATED = [
  { href: PILLAR_EFFECTIVE_RATE_PATH, title: "Why Are My Stripe Fees Higher Than 2.9%?" },
  { href: "/blog/stripe-alternatives-2026", title: "Stripe Alternatives in 2026" },
  { href: "/blog/stripe-credit-card-processing-fees", title: "Stripe Credit Card Processing Fees Explained" },
  { href: "/blog/stripe-ach-vs-credit-card-fees", title: "Stripe ACH vs Credit Card Fees" },
  { href: "/blog/stripe-international-card-fees", title: "Stripe International Card Fees Explained" },
  { href: "/blog/how-to-export-stripe-balance-csv", title: "Export Stripe Balance CSV" },
];

export default function BlogPost2() {
  return (
    <main className="min-h-screen bg-white">
      <BlogJsonLd title={pageTitle} description={pageDescription} path={pagePath} published={published} updated={updated} faqs={FAQ_ITEMS} />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          ← Blog
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">
          How to Reduce Your Stripe Fees
        </h1>
        <p className="mt-3 text-gray-500 text-sm">7 min read · Optimization</p>

        <div className="mt-8 space-y-5 text-base text-gray-700 leading-relaxed">
          <p>
            Stripe&apos;s standard rate is 2.9% + $0.30 per transaction, but your <em>effective</em> rate
            — what you actually pay — can be significantly higher. Here&apos;s how to bring it down.
          </p>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
            <h2 className="text-base font-bold text-blue-950">Short answer</h2>
            <p className="mt-2">
              The best way to reduce Stripe fees is to match the fix to the driver: ACH for large
              invoices, annual billing for small recurring charges, local payment methods for
              international customers, and dispute/refund reduction when those rows dominate.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 text-sm">
            <div className="grid grid-cols-[1fr_0.7fr_1fr] border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
              <div className="px-3 py-2.5">Tactic</div>
              <div className="border-l border-gray-200 px-3 py-2.5">Potential</div>
              <div className="border-l border-gray-200 px-3 py-2.5">Best fit</div>
            </div>
            {TACTICS.map(([tactic, potential, bestFit]) => (
              <div key={tactic} className="grid grid-cols-[1fr_0.7fr_1fr] border-b border-gray-100 last:border-b-0">
                <div className="px-3 py-2.5 font-medium text-gray-800">{tactic}</div>
                <div className="border-l border-gray-100 px-3 py-2.5 text-gray-600">{potential}</div>
                <div className="border-l border-gray-100 px-3 py-2.5 text-gray-600">{bestFit}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Negotiate Custom Pricing</h2>
          <p>
            Once you&apos;re processing over $80,000/month, Stripe will discuss custom rates.
            Contact your account manager or reach out at stripe.com/contact/sales.
            Even a 0.2% reduction on $100K/month saves $200 every month.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Increase Average Transaction Value</h2>
          <p>
            The $0.30 fixed component hurts small transactions most. Consider bundling products,
            offering annual plans instead of monthly, or setting a minimum order value.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Reduce Disputes</h2>
          <p>
            Enable Stripe Radar rules to block suspicious transactions before they become disputes.
            Use clear billing descriptors. Each avoided dispute saves $15 + potential refund costs.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Optimize Currency Settings</h2>
          <p>
            If you sell in multiple countries, consider enabling local payment methods via Stripe
            to avoid currency conversion fees (1% per transaction).
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Use ACH for High-Value B2B Payments</h2>
          <p>
            ACH bank transfers via Stripe cost 0.8% (capped at $5). For invoices over $1,000,
            this is 70–80% cheaper than card processing.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">First: Know Your Baseline</h2>
          <p>
            Before optimizing, you need to know your current effective rate and which transactions
            are costing the most. Upload your Stripe Balance CSV to Fee Auditor for a breakdown with
            benchmark context, refund leakage, and savings ideas tied to your export.
          </p>
        </div>

        <BlogFaqSection items={FAQ_ITEMS} />

        <BlogArticleCta
          title="Find your biggest fee drivers first"
          body="Optimization without a baseline is guesswork. Run a Balance CSV audit to see processing vs all-in rate, high-fee charges, and ACH/international opportunities."
          utmCampaign="how-to-reduce-stripe-fees"
        />

        <BlogSourcesSection items={SOURCES} />

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
          <ul className="mt-4 space-y-3 list-none p-0">
            {RELATED.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block text-sm text-blue-600 hover:underline">
                  {link.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
