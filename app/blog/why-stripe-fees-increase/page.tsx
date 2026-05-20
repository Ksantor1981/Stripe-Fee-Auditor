import type { Metadata } from "next";
import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { buildOgImageUrl } from "@/lib/seo-og";

const pageTitle = "Why Did My Stripe Fees Increase?";
const pageDescription =
  "Stripe fees can creep up for many reasons: more international cards, higher dispute rates, or plan changes. Learn how to diagnose and reduce your effective fee rate.";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe fee diagnosis" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  alternates: { canonical: "/blog/why-stripe-fees-increase" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://feeauditor.com/blog/why-stripe-fees-increase",
    type: "article",
    images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

export default function BlogPost1() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">
          Why Did My Stripe Fees Increase?
        </h1>
        <p className="mt-3 text-gray-500 text-sm">5 min read · Stripe Fees</p>

        <div className="mt-8 prose prose-gray max-w-none text-gray-700 space-y-5 text-base leading-relaxed">
          <p>
            If your Stripe effective fee rate has climbed over the past few months, you&apos;re not alone.
            Many businesses notice a gradual increase without a clear reason. Here are the most common causes.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. More International Cards</h2>
          <p>
            Stripe charges an additional 1.5% for international cards (cards issued outside your country).
            If the charge currency differs from your settlement currency, conversion fees (often around 1%)
            stack on top — a common worst-case mix can approach ~5.7% of the charge before fixed fees on a
            $100 example (see our{" "}
            <Link href="/blog/stripe-international-card-fees" className="text-blue-600 underline">
              international fees guide
            </Link>
            ). If your customer mix has shifted toward international buyers, your effective rate rises.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. More American Express Transactions</h2>
          <p>
            Amex cards have higher interchange fees. Standard Stripe rate for Amex is 2.9% + $0.30, same
            as Visa/Mastercard — but the underlying interchange is higher, which can affect your costs if
            you&apos;re on a custom pricing plan.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Smaller Average Transaction Size</h2>
          <p>
            The fixed $0.30 per transaction matters more for small payments. A $5 charge has an effective
            rate of 8.9% (2.9% + $0.30 = $0.445 on $5.00), while a $100 charge is just 3.2%.
            If your average order value dropped, your effective rate went up.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Increased Dispute Rate</h2>
          <p>
            Each dispute costs $15. Even a small increase in dispute frequency can meaningfully raise
            total fees, especially if your average transaction size is moderate.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Currency Conversion</h2>
          <p>
            Stripe adds roughly a 1% conversion fee when charging in a currency other than your settlement currency.
            If you recently started selling globally, this is likely contributing — especially alongside international cards.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Stripe Billing Usage</h2>
          <p>
            If you use Stripe&apos;s Billing product for subscriptions and invoicing, pay-as-you-go pricing commonly adds about{" "}
            <strong>0.7%</strong> of billing volume on top of card or ACH processing. Fixed annual Billing plans start around{" "}
            <strong>$620/month</strong> instead of that percentage — growing recurring revenue raises costs differently depending on which model you chose.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">How to Diagnose Your Fees</h2>
          <p>
            The fastest way to find the cause is to analyze your Stripe Balance CSV.
            Export it from Stripe → Reports → Balance, and upload it to{" "}
            <Link href="/" className="text-blue-600 underline">Stripe Fee Auditor</Link> for an instant
            breakdown of your effective rate and top cost drivers.
          </p>
          <p className="mt-4">
            <span className="font-semibold text-gray-900">Related guides:</span>{" "}
            <Link href="/why-stripe-fee-rate-higher-than-2-9" className="text-blue-600 underline">
              Why your fee rate can be higher than 2.9%
            </Link>
            {" · "}
            <Link href="/stripe-fee-calculator" className="text-blue-600 underline">
              Effective fee rate calculator walkthrough
            </Link>
            {" · "}
            <Link href="/stripe-balance-csv" className="text-blue-600 underline">
              How to export Balance CSV
            </Link>
          </p>
        </div>

        <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 text-center">
          <p className="font-semibold text-gray-900 mb-2">Find out exactly what&apos;s driving your fees</p>
          <Link href="/analyze" className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Analyze My Fees →
          </Link>
          <BlogBetaRetentionNote tone="gray" />
        </div>
      </div>
    </main>
  );
}
