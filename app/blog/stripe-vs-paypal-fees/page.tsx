/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogArticleCta } from "@/components/BlogArticleCta";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe vs PayPal Fees: Real Comparison";
const pageDescription =
  "Stripe vs PayPal fees are close on paper, but your real cost depends on checkout mix, average charge size, international customers, refunds, disputes, and payment methods.";
const pagePath = "/blog/stripe-vs-paypal-fees";
const published = "2026-06-25";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe vs PayPal" });

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

const COMPARISON = [
  {
    factor: "Published online card fee",
    stripe: "Often simple and calculator-friendly",
    paypal: "Depends on product and checkout method",
  },
  {
    factor: "Small transactions",
    stripe: "Fixed fee can dominate low-ticket charges",
    paypal: "Fixed fee can also dominate low-ticket charges",
  },
  {
    factor: "International customers",
    stripe: "Card country and FX mix can raise the real rate",
    paypal: "Cross-border and currency rules can also change cost",
  },
  {
    factor: "Best reason to choose",
    stripe: "Developer control, subscriptions, SaaS workflows",
    paypal: "Customer preference and wallet checkout in some markets",
  },
  {
    factor: "What to measure",
    stripe: "Effective processing rate and all-in Stripe cost",
    paypal: "Conversion lift vs higher or lower payment cost",
  },
];

const RELATED = [
  { href: "/should-i-switch-from-stripe", title: "Should I switch from Stripe?" },
  { href: "/compare-stripe-paypal-wise", title: "Stripe vs PayPal vs Wise fees" },
  { href: "/stripe-vs-square-fees", title: "Stripe vs Square fees" },
  { href: "/stripe-vs-gocardless", title: "Stripe vs GoCardless" },
  { href: "/blog/stripe-alternatives-2026", title: "Stripe alternatives in 2026" },
  { href: "/blog/stripe-credit-card-processing-fees", title: "Stripe credit card processing fees" },
  { href: "/stripe-fee-calculator", title: "Stripe fee calculator" },
  { href: "/why-stripe-fee-rate-higher-than-2-9", title: "Why Stripe fees are higher than 2.9%" },
];

const SOURCES = [
  { href: "https://stripe.com/pricing", title: "Stripe pricing" },
  { href: "https://www.paypal.com/us/business/paypal-business-fees", title: "PayPal merchant fees" },
  { href: "https://developer.paypal.com/braintree/articles/guides/payment-methods/paypal", title: "Braintree PayPal docs" },
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
          <span className="text-xs text-gray-400">7 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Stripe vs PayPal Fees: Real Comparison
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Comparing Stripe and PayPal by published rates is useful, but incomplete. The real
          decision is whether the payment method mix increases conversion enough to justify the
          actual fees you pay after refunds, international customers, disputes, and add-ons.
        </p>

        <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <strong>Important:</strong> PayPal and Stripe pricing varies by country, product, card
          type, checkout method, and negotiated plan. Treat public rates as a starting point and
          verify current pricing on the official pricing pages before making a switch.
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">The simple answer</h2>
            <p>
              If a customer would pay either way, Stripe often wins on developer workflow and
              predictable card processing. PayPal can win when wallet checkout improves conversion
              or when your customers strongly prefer PayPal.
            </p>
            <p className="mt-3">
              But for an existing Stripe business, the first question is not "Is PayPal cheaper?"
              It is "What am I actually paying Stripe today?"
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Stripe vs PayPal: what actually matters</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 text-sm">
              <div className="grid grid-cols-[0.9fr_1fr_1fr] border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
                <div className="px-4 py-3">Factor</div>
                <div className="border-l border-gray-200 px-4 py-3">Stripe</div>
                <div className="border-l border-gray-200 px-4 py-3">PayPal</div>
              </div>
              {COMPARISON.map((row) => (
                <div key={row.factor} className="grid grid-cols-[0.9fr_1fr_1fr] border-b border-gray-100 last:border-b-0">
                  <div className="px-4 py-3 font-medium text-gray-800">{row.factor}</div>
                  <div className="border-l border-gray-100 px-4 py-3 text-gray-600">{row.stripe}</div>
                  <div className="border-l border-gray-100 px-4 py-3 text-gray-600">{row.paypal}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Do not compare only one $100 payment</h2>
            <p>
              Most comparison pages calculate a single $100 sale. That misses the real SaaS problem:
              your month includes low-ticket charges, international cards, upgrades, refunds, failed
              payments, subscription add-ons, and sometimes other Stripe fee lines.
            </p>
            <div className="mt-4 rounded-lg bg-gray-900 px-5 py-4 font-mono text-sm text-green-400">
              Better comparison = total payment fees / total processed volume
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">When PayPal may be worth adding</h2>
            <ul className="space-y-3 list-none p-0 text-sm">
              {[
                "Your buyers already ask for PayPal or wallet checkout.",
                "You sell internationally and PayPal is a familiar local trust signal.",
                "You want PayPal as an additional option, not a full Stripe replacement.",
                "You can measure conversion lift against any fee difference.",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-gray-600">
                  <span className="text-blue-600">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Before switching, audit your Stripe baseline</h2>
            <p>
              If your Stripe all-in cost is around 4% or higher, the cause may not be "Stripe is bad."
              It may be international card mix, small charges, refunds, Billing fees, or currency
              conversion. Switching providers without identifying the driver can move the same cost
              problem to a new checkout.
            </p>
          </section>
        </div>

        <BlogArticleCta
          title="Compare against your actual Stripe rate first"
          body="Before moving checkout volume, upload your Balance CSV and see your real processing rate, all-in cost, and the rows driving fees up."
          utmCampaign="stripe-vs-paypal-fees"
        />

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Official pricing sources</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Published rates vary by country, payment method, and product. Confirm current pricing
            on the official pages before changing checkout strategy.
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
