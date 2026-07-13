/* eslint-disable react/no-unescaped-entities -- long-form landing copy */
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrackedLink } from "@/components/TrackedLink";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe vs PayPal vs Wise Fees: Compare Before Switching";
const pageDescription =
  "Compare Stripe, PayPal, and Wise fees by payment use case, then audit your real Stripe Balance CSV before moving checkout volume.";
const pagePath = "/compare-stripe-paypal-wise";
const published = "2026-06-26";
const ogImage = buildOgImageUrl({
  title: "Stripe vs PayPal vs Wise fees",
  eyebrow: "Payment fee comparison",
});

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  keywords: [
    "Stripe vs PayPal fees",
    "Stripe vs Wise fees",
    "PayPal vs Wise fees",
    "Stripe alternatives",
    "payment processor fee comparison",
    "Stripe fee calculator",
  ],
  alternates: { canonical: pagePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl(pagePath),
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const PLATFORMS = [
  {
    name: "Stripe",
    bestFor: "SaaS checkout, subscriptions, marketplaces, custom payment flows",
    watch: "International cards, fixed per-charge fees, refunds, disputes, Billing/Radar/add-on fee lines",
    auditQuestion: "Is your actual all-in Stripe cost higher than the published card rate?",
  },
  {
    name: "PayPal",
    bestFor: "Wallet checkout, buyers who prefer PayPal, markets where PayPal trust can lift conversion",
    watch: "Cross-border rules, currency conversion, product-specific fees, checkout mix",
    auditQuestion: "Will PayPal lift conversion enough to justify any fee difference?",
  },
  {
    name: "Wise",
    bestFor: "International bank transfers, supplier payments, multi-currency business operations",
    watch: "Transfer fees, conversion fees, payout workflow, not a direct card-checkout replacement",
    auditQuestion: "Are you solving payment processing, or international money movement?",
  },
];

const USE_CASES = [
  {
    useCase: "SaaS card subscriptions",
    stripe: "Usually the default because subscriptions, invoices, and developer control are strong.",
    paypal: "Useful as an extra wallet option if customers ask for it.",
    wise: "Not usually a card-subscription checkout replacement.",
  },
  {
    useCase: "Low-ticket products",
    stripe: "Fixed per-charge fees can dominate $5-20 transactions.",
    paypal: "Fixed fees can also dominate low-ticket transactions.",
    wise: "May fit invoices or transfers, not impulse card checkout.",
  },
  {
    useCase: "International customers",
    stripe: "Card country and FX mix can push the effective rate above the headline rate.",
    paypal: "Can help where buyers trust PayPal, but cross-border pricing still matters.",
    wise: "Strong fit for international transfers and currency conversion workflows.",
  },
  {
    useCase: "B2B invoices",
    stripe: "Cards can be expensive for large invoices; ACH/bank methods may help.",
    paypal: "Can work, but measure buyer preference against fees.",
    wise: "Often relevant for bank transfers and international vendor/customer payments.",
  },
];

const CHECKLIST = [
  "Export 3-6 months of Stripe Balance data.",
  "Separate card processing rate from all-in Stripe cost.",
  "Check whether international cards, refunds, disputes, and small charges are the real driver.",
  "Estimate whether a payment-method change fixes the driver before migrating platforms.",
  "Compare official pricing pages for your country and product before changing checkout.",
];

const OFFICIAL_SOURCES = [
  { title: "Stripe pricing", href: "https://stripe.com/pricing" },
  { title: "PayPal merchant fees", href: "https://www.paypal.com/us/business/paypal-business-fees" },
  { title: "Wise Business pricing", href: "https://wise.com/us/pricing/business/" },
];

const RELATED = [
  { href: "/should-i-switch-from-stripe", title: "Should I switch from Stripe?" },
  { href: "/stripe-fee-calculator", title: "Stripe fee calculator" },
  { href: "/blog/stripe-vs-paypal-fees", title: "Stripe vs PayPal fees" },
  { href: "/stripe-vs-square-fees", title: "Stripe vs Square fees" },
  { href: "/stripe-vs-gocardless", title: "Stripe vs GoCardless" },
  { href: "/stripe-vs-paddle-fees", title: "Stripe vs Paddle fees" },
  { href: "/blog/stripe-alternatives-2026", title: "Stripe alternatives in 2026" },
  { href: "/blog/stripe-ach-vs-credit-card-fees", title: "ACH vs credit card fees" },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
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
      { "@type": "ListItem", position: 2, name: pageTitle, item: absoluteUrl(pagePath) },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is PayPal cheaper than Stripe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sometimes, but not universally. The right comparison depends on payment method, country, checkout product, cross-border mix, currency conversion, refunds, and conversion lift.",
        },
      },
      {
        "@type": "Question",
        name: "Is Wise a Stripe alternative?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Wise can be useful for international transfers and currency conversion workflows, but it is not a direct replacement for every Stripe card checkout or subscription use case.",
        },
      },
      {
        "@type": "Question",
        name: "What should I check before switching payment processors?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Audit your actual Stripe Balance CSV first. Find whether the real driver is international cards, small transactions, refunds, disputes, add-ons, or checkout conversion before changing providers.",
        },
      },
    ],
  },
];

export default function CompareStripePayPalWisePage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-gray-900">
            Stripe Fee Auditor
          </Link>
          <Link
            href="/analyze"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Analyze My Fees
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: pageTitle }]} className="mb-8" />

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Payment fee comparison
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              Stripe vs PayPal vs Wise fees: compare the use case first.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
              A single $100-fee calculator is not enough. The real winner depends on card mix,
              average charge size, international customers, refunds, conversion lift, and whether
              you are solving checkout or money movement.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href="/analyze"
                utm={{ source: "compare", medium: "cta", campaign: "stripe_paypal_wise" }}
                funnelEvent="funnel_landing_cta"
                funnelProps={{ placement: "compare_hero" }}
                className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Audit my actual Stripe CSV
              </TrackedLink>
              <Link
                href="/stripe-fee-calculator"
                className="inline-flex justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Start with a quick estimate
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
              Before you switch
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Find the driver in your existing Stripe data.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              If your issue is small charges, international cards, refunds, or card-funded B2B
              invoices, the fix may be payment mix rather than a full processor migration.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {["Processing rate", "All-in cost", "Fee drivers"].map((item) => (
                <div key={item} className="rounded-xl border border-white bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item}</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">Use your Balance CSV</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="platform-fit-heading">
          <h2 id="platform-fit-heading" className="text-2xl font-bold text-gray-900">
            Which payment option fits which problem?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {PLATFORMS.map((platform) => (
              <div key={platform.name} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">{platform.name}</h3>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Best for
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{platform.bestFor}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Watch
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{platform.watch}</p>
                <p className="mt-4 rounded-xl bg-gray-50 px-3 py-3 text-sm leading-relaxed text-gray-700">
                  {platform.auditQuestion}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14" aria-labelledby="use-case-heading">
          <h2 id="use-case-heading" className="text-2xl font-bold text-gray-900">
            Compare by real payment scenario
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 text-sm">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[0.85fr_1fr_1fr_1fr] bg-gray-50 font-semibold text-gray-700">
                <div className="px-4 py-3">Use case</div>
                <div className="border-l border-gray-200 px-4 py-3">Stripe</div>
                <div className="border-l border-gray-200 px-4 py-3">PayPal</div>
                <div className="border-l border-gray-200 px-4 py-3">Wise</div>
              </div>
              {USE_CASES.map((row) => (
                <div key={row.useCase} className="grid grid-cols-[0.85fr_1fr_1fr_1fr] border-t border-gray-100">
                  <div className="px-4 py-4 font-medium text-gray-900">{row.useCase}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.stripe}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.paypal}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.wise}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Pricing varies by country, payment method, product, and negotiated plan. Treat this as
            decision guidance, then verify current official rates before changing checkout.
          </p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" aria-labelledby="checklist-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Pre-switch checklist
            </p>
            <h2 id="checklist-heading" className="mt-2 text-2xl font-bold text-gray-900">
              Do this before moving payment volume.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Switching processors is expensive when the real issue is your transaction mix. Audit
              the current baseline first, then compare alternatives against the specific driver.
            </p>
          </div>
          <ol className="space-y-3">
            {CHECKLIST.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-gray-700">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            CSV audit before migration
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Know your real Stripe baseline before comparing providers.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            Upload the itemized Stripe Balance CSV and see your actual processing rate, all-in cost,
            monthly drift, high-fee charges, and savings ideas.
          </p>
          <TrackedLink
            href="/analyze"
            utm={{ source: "compare", medium: "cta", campaign: "stripe_paypal_wise_bottom" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "compare_bottom" }}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Analyze my CSV
          </TrackedLink>
        </section>

        <section className="mt-12 grid gap-8 border-t border-gray-100 pt-8 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Official pricing sources</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Confirm current pricing for your country and product before changing payment strategy.
            </p>
            <div className="mt-4 space-y-2">
              {OFFICIAL_SOURCES.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium text-blue-600 hover:underline"
                >
                  {source.title} -&gt;
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
            <div className="mt-4 space-y-2">
              {RELATED.map((link) => (
                <Link key={link.href} href={link.href} className="block text-sm font-medium text-blue-600 hover:underline">
                  {link.title} -&gt;
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
