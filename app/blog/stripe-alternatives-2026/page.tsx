/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogArticleCta } from "@/components/BlogArticleCta";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe Alternatives in 2026: Check Fees Before Switching";
const pageDescription =
  "Looking for Stripe alternatives in 2026? Before switching processors, audit your real Stripe effective rate and identify whether fees, payment mix, or checkout strategy is the real problem.";
const pagePath = "/blog/stripe-alternatives-2026";
const published = "2026-06-25";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe alternatives" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  alternates: { canonical: pagePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl(pagePath),
    type: "article",
    publishedTime: published,
    modifiedTime: published,
    images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

const ALTERNATIVES = [
  {
    name: "PayPal / Braintree",
    bestFor: "Adding wallet checkout or PayPal preference",
    feeQuestion: "Does conversion lift outweigh the payment fee difference?",
  },
  {
    name: "Square",
    bestFor: "Businesses with in-person plus online payments",
    feeQuestion: "Are you solving fees, operations, or point-of-sale workflow?",
  },
  {
    name: "GoCardless / ACH-first",
    bestFor: "B2B invoices, bank debit, recurring bank payments",
    feeQuestion: "Are large card invoices the expensive part of your Stripe data?",
  },
  {
    name: "Adyen",
    bestFor: "Larger global companies with payment operations teams",
    feeQuestion: "Do you have the volume and team to benefit from more complex pricing?",
  },
  {
    name: "Merchant of record tools",
    bestFor: "Tax, compliance, and global SaaS operations",
    feeQuestion: "Are you buying operational coverage, not just cheaper processing?",
  },
];

const SWITCH_REASONS = [
  "Your all-in Stripe cost is materially above the headline card rate.",
  "International card and FX costs are growing faster than revenue.",
  "Large B2B invoices are going through cards when ACH could fit.",
  "You need local payment methods Stripe is not handling well for your market.",
  "You are solving risk, tax, support, or payout workflow - not only fees.",
];

const RELATED = [
  { href: "/blog/stripe-vs-paypal-fees", title: "Stripe vs PayPal fees" },
  { href: "/blog/stripe-credit-card-processing-fees", title: "Stripe credit card processing fees" },
  { href: "/blog/stripe-ach-vs-credit-card-fees", title: "Stripe ACH vs credit card fees" },
  { href: "/blog/how-to-reduce-stripe-fees", title: "How to reduce Stripe fees" },
];

const SOURCES = [
  { href: "https://stripe.com/pricing", title: "Stripe pricing" },
  { href: "https://www.paypal.com/us/business/paypal-business-fees", title: "PayPal merchant fees" },
  { href: "https://squareup.com/us/en/payments/our-fees", title: "Square payment processing fees" },
  { href: "https://gocardless.com/pricing/", title: "GoCardless pricing" },
  { href: "https://www.adyen.com/pricing", title: "Adyen pricing" },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pageTitle,
    description: pageDescription,
    datePublished: published,
    dateModified: published,
    author: { "@type": "Person", name: "Konstantin Starkov" },
    publisher: { "@type": "Organization", name: "Stripe Fee Auditor", url: absoluteUrl("/") },
    mainEntityOfPage: absoluteUrl(pagePath),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: pageTitle, item: absoluteUrl(pagePath) },
    ],
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          &larr; Blog
        </Link>

        <div className="mt-4">
          <span className="text-xs text-gray-400">8 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Stripe Alternatives in 2026: Check Fees Before Switching
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          If you are searching for Stripe alternatives, there is a good chance something feels
          expensive, opaque, or operationally painful. Before migrating payments, find out whether
          you are actually overpaying - and why.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Founder shortcut:</strong> export your Stripe Balance CSV first. If the real
          fee driver is small charges, international cards, refunds, or card-funded B2B invoices,
          the fix may be payment mix - not a full processor migration.
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">The best Stripe alternative depends on the problem</h2>
            <p>
              "Stripe alternative" is too broad. A founder leaving because of card fees needs a
              different answer than a founder leaving because of tax compliance, fraud, chargebacks,
              payout timing, or in-person payments.
            </p>
            <p className="mt-3">
              Start by separating your complaint into two buckets: payment cost and payment operations.
              Fee Auditor helps with the first bucket by showing your actual processing rate and all-in
              Stripe cost from the Balance CSV.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Common alternatives and the real question</h2>
            <div className="space-y-3">
              {ALTERNATIVES.map((item) => (
                <div key={item.name} className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.bestFor}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.feeQuestion}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">When switching may make sense</h2>
            <ul className="space-y-3 list-none p-0 text-sm">
              {SWITCH_REASONS.map((item) => (
                <li key={item} className="flex gap-2 text-gray-600">
                  <span className="text-blue-600">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">When switching probably will not fix the issue</h2>
            <p>
              If your problem is low-ticket card payments, any provider with a fixed per-transaction
              fee can still produce a high effective rate. If your problem is international buyers,
              another card processor may still charge cross-border or FX costs. If your problem is
              refunds, payment processors often still keep some fees.
            </p>
            <p className="mt-3">
              In those cases, the better move may be changing plan structure, offering annual billing,
              adding ACH or local payment methods, or adjusting checkout defaults.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">A simple pre-switch checklist</h2>
            <ol className="space-y-3 list-none p-0 text-sm">
              {[
                "Export 3-6 months of Stripe Balance data.",
                "Calculate processing rate and all-in Stripe cost separately.",
                "Find the top fee drivers: international cards, small charges, refunds, disputes, add-ons.",
                "Estimate whether ACH, local payments, or annual billing fixes the driver.",
                "Only then compare Stripe alternatives against the specific problem.",
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
          title="Before switching from Stripe, measure the real problem"
          body="Upload your Balance CSV to see whether your fees are driven by card mix, international customers, refunds, small charges, or other Stripe fee lines."
          utmCampaign="stripe-alternatives-2026"
        />

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Official pricing sources</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Pricing changes by country, product, and plan. Use these official pages as the current
            reference before changing processors.
          </p>
          <div className="mt-4 space-y-2">
            {SOURCES.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline"
              >
                {source.title} -&gt;
              </a>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
          <div className="mt-4 space-y-3">
            {RELATED.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-blue-600 hover:underline">
                {link.title} -&gt;
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
