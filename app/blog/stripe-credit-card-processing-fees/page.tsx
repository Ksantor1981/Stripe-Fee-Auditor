/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogArticleCta } from "@/components/BlogArticleCta";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { buildOgImageUrl } from "@/lib/seo-og";

const pageTitle = "Stripe Credit Card Processing Fees Explained";
const pageDescription =
  "Stripe credit card processing fees start with the published card rate, but your real effective rate depends on fixed fees, international cards, refunds, disputes, and add-ons.";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe card fees" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  alternates: { canonical: "/blog/stripe-credit-card-processing-fees" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://feeauditor.com/blog/stripe-credit-card-processing-fees",
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

const FEE_DRIVERS = [
  {
    title: "Percentage fee",
    body: "The headline card rate applies to the charge amount. This is the part most calculators show.",
  },
  {
    title: "Fixed per-transaction fee",
    body: "The fixed fee matters most on low-ticket subscriptions and micro-transactions. A $0.30 fixed fee is 6% of a $5 charge before the percentage fee.",
  },
  {
    title: "International cards",
    body: "Cards issued outside your Stripe account country can add cross-border cost. If your SaaS has global customers, this can be the biggest reason your rate is not close to the headline number.",
  },
  {
    title: "Currency conversion",
    body: "If the charge currency and settlement currency differ, currency conversion can stack on top of card processing.",
  },
  {
    title: "Refunds, disputes, and add-ons",
    body: "Refunded processing fees, dispute fees, Radar, Billing, and other Stripe fee lines can raise your all-in Stripe cost even when card processing looks normal.",
  },
];

const RELATED = [
  { href: "/stripe-fee-calculator", title: "Estimate monthly Stripe fees" },
  { href: "/blog/stripe-vs-paypal-fees", title: "Stripe vs PayPal fees" },
  { href: "/blog/stripe-alternatives-2026", title: "Stripe alternatives in 2026" },
  { href: "/blog/how-to-export-stripe-balance-csv", title: "Export Stripe Balance CSV for a fee audit" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          &larr; Blog
        </Link>

        <div className="mt-4">
          <span className="text-xs text-gray-400">6 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Stripe Credit Card Processing Fees Explained
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Stripe's published card fee is only the starting point. The number that matters for a
          real business is your effective processing rate: total card processing fees divided by
          total card charge volume.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Short version:</strong> use public pricing to estimate a payment before you sell.
          Use your Stripe Balance CSV to check what you actually paid after customer mix, refunds,
          international cards, and other fee lines.
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">The simple formula</h2>
            <div className="rounded-lg bg-gray-900 px-5 py-4 font-mono text-sm text-green-400">
              Effective card processing rate = card processing fees / card charge volume
            </div>
            <p className="mt-4">
              This is different from your all-in Stripe cost rate. All-in cost can include other
              fee lines such as dispute fees, payout fees, Billing, Radar, currency conversion,
              and refund-related leakage.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">What pushes the rate higher?</h2>
            <div className="space-y-3">
              {FEE_DRIVERS.map((driver) => (
                <div key={driver.title} className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                  <p className="font-semibold text-gray-900">{driver.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{driver.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Estimate vs actual</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 text-sm">
              <div className="grid grid-cols-[0.9fr_1fr_1fr] border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
                <div className="px-4 py-3">Question</div>
                <div className="border-l border-gray-200 px-4 py-3">Public calculator</div>
                <div className="border-l border-gray-200 px-4 py-3">Balance CSV audit</div>
              </div>
              {[
                ["What should one payment cost?", "Good", "Not needed"],
                ["What did I pay this month?", "Weak", "Good"],
                ["Which rows drove fees up?", "No", "Yes"],
                ["Are refunds leaking margin?", "No", "Yes"],
                ["Should I add ACH or local payments?", "Maybe", "Much better"],
              ].map(([question, calculator, audit]) => (
                <div key={question} className="grid grid-cols-[0.9fr_1fr_1fr] border-b border-gray-100 last:border-b-0">
                  <div className="px-4 py-3 font-medium text-gray-800">{question}</div>
                  <div className="border-l border-gray-100 px-4 py-3 text-gray-600">{calculator}</div>
                  <div className="border-l border-gray-100 px-4 py-3 text-gray-600">{audit}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">How to check your Stripe card fees</h2>
            <ol className="space-y-3 list-none p-0 text-sm">
              {[
                "Export an itemized Stripe Balance CSV for at least one full month.",
                "Filter charge rows and sum card charge volume.",
                "Sum the Stripe fees on those same charge rows.",
                "Divide fees by volume to get processing rate.",
                "Compare that with all other Stripe fee lines to get all-in cost.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <BlogArticleCta
          title="Check your real Stripe processing rate"
          body="Upload your Balance CSV to separate card processing rate from all-in Stripe cost, then see the specific fee drivers behind the number."
          utmCampaign="stripe-credit-card-processing-fees"
        />

        <p className="mt-5 text-xs leading-relaxed text-gray-500">
          Pricing changes. Always verify current rates on the official Stripe pricing page and in your
          own Stripe Dashboard before making pricing or migration decisions.
        </p>

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
          <div className="mt-4 space-y-3">
            {RELATED.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-blue-600 hover:underline">
                {link.title} -&gt;
              </Link>
            ))}
          </div>
          <BlogBetaRetentionNote tone="gray" />
        </section>
      </div>
    </main>
  );
}
