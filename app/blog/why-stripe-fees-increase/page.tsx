import type { Metadata } from "next";
import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { BlogBreadcrumbs } from "@/components/BlogBreadcrumbs";
import { BlogFaqSection, BlogJsonLd, BlogSourcesSection } from "@/components/BlogSeoBlocks";
import { buildOgImageUrl } from "@/lib/seo-og";

const pageTitle = "Why Did My Stripe Fees Increase This Month?";
const pageDescription =
  "Fees up or payout lower than last month? See the usual drivers — international cards, refund fees not returned, FX, Radar/add-ons — then check which line moved in your Balance CSV. Free diagnosis on Fee Auditor.";
const pagePath = "/blog/why-stripe-fees-increase";
const published = "2026-05-16";
const updated = "2026-08-05";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe fee diagnosis" });

export const metadata: Metadata = {
  title: "Why Stripe Fees Increased This Month — CSV Checklist | Fee Auditor",
  description: pageDescription,
  keywords: [
    "why did my Stripe fees increase",
    "why are my Stripe fees so high",
    "Stripe payout lower than expected",
    "Stripe refund fees not returned",
    "Stripe effective rate",
    "Stripe international card fees",
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
      "Stripe fees usually increase because your payment mix changed: more international cards, lower average charge size, currency conversion, disputes, refunds, or extra Stripe products such as Billing, Radar, or Tax — not because the homepage 2.9% rate quietly changed overnight.",
  },
  {
    question: "Why are my Stripe fees so high compared with 2.9%?",
    answer:
      "The published 2.9% + $0.30 is a domestic card starting point. Your effective rate is total fees ÷ charge volume. International cards, FX, fixed fees on small tickets, refund fee retention, disputes, and add-ons can push the blended number well above 2.9%.",
  },
  {
    question: "Why is my Stripe payout lower than expected?",
    answer:
      "Payouts settle net of fees, refunds, disputes, and other Balance lines. If volume looks fine but cash is light, check whether fees rose, refunds increased, or non-charge fee rows (Radar, Billing, Tax) grew. Compare month-over-month in an itemized Balance CSV.",
  },
  {
    question: "Do Stripe refund fees get returned?",
    answer:
      "Usually no. When you refund a charge, Stripe generally keeps the original processing fee. A higher refund rate can raise your all-in cost even if card pricing did not change. Look for refund rows and retained fee impact in your Balance export.",
  },
  {
    question: "Can Radar or Billing raise my effective rate this month?",
    answer:
      "Yes. Paid Radar screening, Billing percentage fees, Tax, and similar products show up as separate fee lines. A new Radar trial that rolls into paid Standard, or higher Billing volume, can move the all-in rate without changing your base card rate.",
  },
  {
    question: "How can I tell what caused the increase?",
    answer:
      "Export your itemized Stripe Balance CSV and compare this month to prior months. Check international card share, average transaction size, refund rows, dispute rows, and non-charge Stripe fee rows — or run a free diagnosis that surfaces one concrete driver.",
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
  {
    href: "https://support.stripe.com/questions/updates-to-radar-pricing-(january-2027)",
    title: "Stripe Radar pricing updates",
  },
];

export default function BlogPost1() {
  return (
    <main className="min-h-screen bg-white">
      <BlogJsonLd
        title={pageTitle}
        description={pageDescription}
        path={pagePath}
        published={published}
        updated={updated}
        faqs={FAQ_ITEMS}
      />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <BlogBreadcrumbs title={pageTitle} path={pagePath} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">{pageTitle}</h1>
        <p className="mt-3 text-sm text-gray-500">5 min read · Stripe Fees · Updated Aug 2026</p>

        <div className="prose prose-gray mt-8 max-w-none space-y-5 text-base leading-relaxed text-gray-700">
          <p>
            If your Stripe effective fee rate has climbed over the past few months — or your payout
            looks lighter than volume suggests — you&apos;re not alone. Many teams notice a gradual
            increase without a clear Dashboard explanation. Here are the most common causes and how
            to confirm which one moved.
          </p>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
            <h2 className="text-base font-bold text-blue-950">Short answer</h2>
            <p className="mt-2">
              Your Stripe fees usually increase because your transaction mix changed, not because
              one obvious setting changed. International cards, smaller charges, refunds, disputes,
              currency conversion, and add-on products can all raise the effective rate.
            </p>
          </div>

          <div className="not-prose overflow-hidden rounded-xl border border-gray-200 text-sm">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
              <div className="px-3 py-2.5">Cause</div>
              <div className="border-l border-gray-200 px-3 py-2.5">Fee impact</div>
              <div className="border-l border-gray-200 px-3 py-2.5">CSV signal</div>
            </div>
            {FEE_INCREASE_TABLE.map(([cause, impact, signal]) => (
              <div
                key={cause}
                className="grid grid-cols-[1fr_1fr_1fr] border-b border-gray-100 last:border-b-0"
              >
                <div className="px-3 py-2.5 font-medium text-gray-800">{cause}</div>
                <div className="border-l border-gray-100 px-3 py-2.5 text-gray-600">{impact}</div>
                <div className="border-l border-gray-100 px-3 py-2.5 text-gray-600">{signal}</div>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">1. More International Cards</h2>
          <p>
            Stripe charges an additional 1.5% for international cards (cards issued outside your
            country). If the charge currency differs from your settlement currency, conversion fees
            (often around 1%) stack on top — a common worst-case mix can approach ~5.7% of the charge
            before fixed fees on a $100 example (see our{" "}
            <Link href="/blog/stripe-international-card-fees" className="text-blue-600 underline">
              international fees guide
            </Link>{" "}
            and the{" "}
            <Link
              href="/blog/cross-border-stripe-fees-migration-2026"
              className="text-blue-600 underline"
            >
              cross-border fee migration briefing
            </Link>
            ). If your customer mix has shifted toward international buyers, your effective rate
            rises.
          </p>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">2. More American Express Transactions</h2>
          <p>
            Amex cards have higher interchange fees. Standard Stripe rate for Amex is 2.9% + $0.30,
            same as Visa/Mastercard — but the underlying interchange is higher, which can affect
            your costs if you&apos;re on a custom pricing plan.
          </p>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">3. Smaller Average Transaction Size</h2>
          <p>
            The fixed $0.30 per transaction matters more for small payments. A $5 charge has an
            effective rate of 8.9% (2.9% + $0.30 = $0.445 on $5.00), while a $100 charge is just 3.2%.
            If your average order value dropped, your effective rate went up. Details:{" "}
            <Link href="/blog/stripe-fees-small-transactions" className="text-blue-600 underline">
              small-transaction fee drag
            </Link>
            .
          </p>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">4. Increased Dispute Rate</h2>
          <p>
            Each dispute costs $15. Even a small increase in dispute frequency can meaningfully raise
            total fees, especially if your average transaction size is moderate.
          </p>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">5. Currency Conversion</h2>
          <p>
            Stripe adds roughly a 1% conversion fee when charging in a currency other than your
            settlement currency. If you recently started selling globally, this is likely
            contributing — especially alongside international cards.
          </p>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">6. Refunds (fees usually not returned)</h2>
          <p>
            When you issue a refund, Stripe generally keeps the original processing fee. A quiet rise
            in refund rate can lift your all-in cost even when card pricing is unchanged. This is one
            of the most common &quot;payout feels light&quot; explanations alongside international
            mix.
          </p>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">7. Stripe Billing, Radar, Tax</h2>
          <p>
            If you use Stripe&apos;s Billing product for subscriptions and invoicing, pay-as-you-go
            pricing commonly adds about <strong>0.7%</strong> of billing volume on top of card or ACH
            processing. Fixed annual Billing plans start around <strong>$620/month</strong> instead
            of that percentage. Radar and Tax add separate fee lines — including when a Radar trial
            later rolls into a paid tier. Sum non-charge fee rows in the Balance CSV to see whether
            add-ons, not cards, moved the needle.
          </p>

          <div className="not-prose my-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-5 text-center">
            <p className="text-sm font-semibold text-gray-900">
              See which driver moved — sample first, or your CSV
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Free diagnosis. No OAuth. Raw CSV is not stored.
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Link
                href="/analyze?sample=1"
                className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try sample in 10s →
              </Link>
              <Link
                href="/analyze"
                className="inline-flex rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Upload my Balance CSV →
              </Link>
            </div>
          </div>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900">How to diagnose your fees</h2>
          <p>
            The fastest way to find the cause is to analyze your Stripe Balance CSV. Export it from
            Stripe → Reports → Balance (Itemized), then upload it to{" "}
            <Link href="/analyze" className="text-blue-600 underline">
              Fee Auditor
            </Link>{" "}
            for a breakdown of your effective rate and top cost drivers.
          </p>
          <p>
            If you do not have the file yet, use the quick{" "}
            <Link href="/stripe-balance-csv" className="text-blue-600 underline">
              Balance CSV export guide
            </Link>{" "}
            (or the{" "}
            <Link href="/blog/how-to-export-stripe-balance-csv" className="text-blue-600 underline">
              detailed screenshot walkthrough
            </Link>
            ), then come back and run the audit. Prefer a demo first?{" "}
            <Link href="/analyze?sample=1" className="text-blue-600 underline">
              Open the sample report
            </Link>
            .
          </p>
          <p className="mt-4">
            <span className="font-semibold text-gray-900">Related pain guides:</span>{" "}
            <Link href="/why-stripe-fee-rate-higher-than-2-9" className="text-blue-600 underline">
              Why fees run higher than 2.9%
            </Link>
            {" · "}
            <Link href="/blog/stripe-international-card-fees" className="text-blue-600 underline">
              International card fees
            </Link>
            {" · "}
            <Link href="/blog/why-stripe-effective-rate-jumped-this-month" className="text-blue-600 underline">
              Effective rate jumped this month
            </Link>
            {" · "}
            <Link href="/stripe-fee-calculator" className="text-blue-600 underline">
              Published-rate calculator
            </Link>
          </p>
        </div>

        <BlogFaqSection items={FAQ_ITEMS} />

        <div className="mt-12 rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
          <p className="mb-2 font-semibold text-gray-900">
            Find out exactly what&apos;s driving your fees
          </p>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              href="/analyze?sample=1"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Try sample in 10s →
            </Link>
            <Link
              href="/analyze"
              className="inline-block rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            >
              Analyze my CSV →
            </Link>
          </div>
          <BlogBetaRetentionNote tone="gray" />
        </div>

        <BlogSourcesSection items={SOURCES} />
      </div>
    </main>
  );
}
