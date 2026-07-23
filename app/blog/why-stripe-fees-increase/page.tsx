import type { Metadata } from "next";
import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { BlogBreadcrumbs } from "@/components/BlogBreadcrumbs";
import { BlogFaqSection, BlogJsonLd, BlogSourcesSection } from "@/components/BlogSeoBlocks";
import { buildOgImageUrl } from "@/lib/seo-og";

const pageTitle = "Why Did My Stripe Fees Increase This Month?";
const pageDescription =
  "Stripe payout lower than expected or fees up vs last month? Diagnose international cards, refund fees not returned, FX, and mix changes from your Balance CSV.";
const pagePath = "/blog/why-stripe-fees-increase";
const published = "2026-05-16";
const updated = "2026-07-19";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe fee diagnosis" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  keywords: [
    "why did my Stripe fees increase",
    "Stripe payout lower than expected",
    "Stripe refund fees not returned",
    "Stripe effective rate",
    "Stripe fee reconciliation",
  ],
  alternates: { canonical: pagePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://feeauditor.com/blog/why-stripe-fees-increase",
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

const FEE_INCREASE_TABLE = [
  ["More international cards", "+1.5% on affected card charges", "Filter for international card rows"],
  ["Currency conversion", "Often about +1% when conversion applies", "Compare charge and settlement currencies"],
  ["Smaller transactions", "$0.30 fixed fee becomes a larger share", "Group charges by amount bucket"],
  ["Disputes", "Flat dispute fees can spike all-in cost", "Filter dispute rows"],
  ["Billing, Radar, Tax, add-ons", "Separate fee lines raise all-in Stripe cost", "Sum non-charge fee rows"],
  ["Refunds", "Original processing fees are generally not returned", "Review refund rows and retained fees"],
];

const FAQ_ITEMS = [
  {
    question: "Why did my Stripe fees increase?",
    answer:
      "Stripe fees usually increase because your payment mix changed: more international cards, lower average charge size, currency conversion, disputes, refunds, or extra Stripe products such as Billing, Radar, or Tax.",
  },
  {
    question: "How can I tell what caused the increase?",
    answer:
      "Export your itemized Stripe Balance CSV and compare this month to prior months. Check international card share, average transaction size, refund rows, dispute rows, and non-charge Stripe fee rows.",
  },
  {
    question: "Can Stripe fees increase even if my pricing did not change?",
    answer:
      "Yes. Your Stripe pricing can stay the same while your effective rate rises because customer geography, transaction size, refunds, disputes, or add-on usage changed.",
  },
];

const SOURCES = [
  { href: "https://stripe.com/pricing", title: "Stripe pricing" },
  { href: "https://docs.stripe.com/disputes", title: "Stripe disputes documentation" },
  { href: "https://docs.stripe.com/reports/balance-transaction-types", title: "Stripe balance transaction types" },
];

export default function BlogPost1() {
  return (
    <main className="min-h-screen bg-white">
      <BlogJsonLd title={pageTitle} description={pageDescription} path={pagePath} published={published} updated={updated} faqs={FAQ_ITEMS} />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <BlogBreadcrumbs title={pageTitle} path={pagePath} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">
          {pageTitle}
        </h1>
        <p className="mt-3 text-gray-500 text-sm">5 min read · Stripe Fees</p>

        <div className="mt-8 prose prose-gray max-w-none text-gray-700 space-y-5 text-base leading-relaxed">
          <p>
            If your Stripe effective fee rate has climbed over the past few months, you&apos;re not alone.
            Many businesses notice a gradual increase without a clear reason. Here are the most common causes.
          </p>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
            <h2 className="text-base font-bold text-blue-950">Short answer</h2>
            <p className="mt-2">
              Your Stripe fees usually increase because your transaction mix changed, not because
              one obvious setting changed. International cards, smaller charges, refunds, disputes,
              currency conversion, and add-on products can all raise the effective rate.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 text-sm">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
              <div className="px-3 py-2.5">Cause</div>
              <div className="border-l border-gray-200 px-3 py-2.5">Fee impact</div>
              <div className="border-l border-gray-200 px-3 py-2.5">CSV signal</div>
            </div>
            {FEE_INCREASE_TABLE.map(([cause, impact, signal]) => (
              <div key={cause} className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-100 last:border-b-0">
                <div className="px-3 py-2.5 font-medium text-gray-800">{cause}</div>
                <div className="border-l border-gray-100 px-3 py-2.5 text-gray-600">{impact}</div>
                <div className="border-l border-gray-100 px-3 py-2.5 text-gray-600">{signal}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. More International Cards</h2>
          <p>
            Stripe charges an additional 1.5% for international cards (cards issued outside your country).
            If the charge currency differs from your settlement currency, conversion fees (often around 1%)
            stack on top — a common worst-case mix can approach ~5.7% of the charge before fixed fees on a
            $100 example (see our{" "}
            <Link href="/blog/stripe-international-card-fees" className="text-blue-600 underline">
              international fees guide
            </Link>{" "}
            and the{" "}
            <Link href="/blog/cross-border-stripe-fees-migration-2026" className="text-blue-600 underline">
              cross-border fee migration briefing
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
            <Link href="/analyze" className="text-blue-600 underline">Stripe Fee Auditor</Link> for an instant
            breakdown of your effective rate and top cost drivers.
          </p>
          <p>
            If you do not have the file yet, start with the{" "}
            <Link href="/blog/how-to-export-stripe-balance-csv" className="text-blue-600 underline">
              Stripe Balance CSV export guide
            </Link>
            , then come back and run the audit.
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
            <Link href="/blog/how-to-export-stripe-balance-csv" className="text-blue-600 underline">
              How to export Balance CSV for a fee audit
            </Link>
          </p>
        </div>

        <BlogFaqSection items={FAQ_ITEMS} />

        <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 text-center">
          <p className="font-semibold text-gray-900 mb-2">Find out exactly what&apos;s driving your fees</p>
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
