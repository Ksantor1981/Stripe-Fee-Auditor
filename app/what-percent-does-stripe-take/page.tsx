import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SeoPageTrustFooter } from "@/components/seo-page-trust-footer";
import { StripeTakeCalculator } from "@/components/stripe-take-calculator";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "What Percentage Does Stripe Take?";
const pageDescription =
  "Stripe usually starts at 2.9% + $0.30 for US online card payments, but your real percentage can be higher. Calculate the published fee and learn how to check your actual rate.";
const pagePath = "/what-percent-does-stripe-take";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "what percent does Stripe take",
    "what percentage does Stripe take",
    "Stripe percentage fee",
    "Stripe fee percentage",
    "Stripe effective fee rate",
    "Stripe real fee rate",
  ],
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    siteName: "Stripe Fee Auditor",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
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

const faqItems = [
  {
    question: "What percentage does Stripe take from a payment?",
    answer:
      "For many US online card payments, Stripe's published rate starts at 2.9% plus $0.30 per successful charge. The effective percentage on a single charge depends on the charge amount because the fixed $0.30 fee is larger on small payments.",
  },
  {
    question: "Why is my real Stripe rate higher than 2.9%?",
    answer:
      "International cards, currency conversion, Stripe Billing fees, refunds, disputes, Radar, and small transaction sizes can all push your real blended Stripe rate above the headline percentage.",
  },
  {
    question: "How do I check the actual percentage Stripe took?",
    answer:
      "Export your itemized Stripe Balance CSV, sum charge volume, sum Stripe fees, and divide fees by volume. Stripe Fee Auditor does this from your Balance CSV and separates processing rate from all-in Stripe cost.",
  },
];

const ABS_PAGE = absoluteUrl(pagePath);

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${ABS_PAGE}#faq`,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
];

const breadcrumbCrumbs = sitePageBreadcrumbs(pageTitle, pagePath);

const commonRates = [
  {
    label: "Standard US online card",
    rate: "2.9% + $0.30",
    note: "The common headline rate for many US online card payments.",
  },
  {
    label: "Small payments",
    rate: "Often 4%+",
    note: "The fixed $0.30 fee can dominate $5-10 subscriptions or add-ons.",
  },
  {
    label: "International card",
    rate: "Often 4.4%+",
    note: "International cards can add 1.5 percentage points before FX.",
  },
  {
    label: "International + FX",
    rate: "Often 5%+",
    note: "Currency conversion can add roughly another percentage point.",
  },
];

export default function WhatPercentDoesStripeTakePage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />

      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
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

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: pageTitle }]} className="mb-6" />
        <header className="mb-12">
          <p className="mb-3 text-sm font-medium text-blue-600">Stripe fee percentage</p>
          <h1 className="text-4xl font-bold leading-tight text-gray-900">
            What Percentage Does Stripe Actually Take?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            The short answer: Stripe often starts at <strong className="text-gray-900">2.9% + $0.30</strong>
            {" "}for US online card payments. The real percentage you pay can be higher once small
            charges, international cards, currency conversion, refunds, and other Stripe fee lines show up.
          </p>
        </header>

        <StripeTakeCalculator />

        <section className="mt-14">
          <h2 className="mb-6 text-lg font-semibold text-gray-900">The answer depends on the payment mix</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {commonRates.map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{item.rate}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 space-y-5 text-gray-700">
          <h2 className="text-lg font-semibold text-gray-900">How to calculate the actual percentage</h2>
          <p className="leading-relaxed">
            For one transaction, divide the Stripe fee by the charge amount. For your business, use the
            blended rate across a full period:
          </p>
          <div className="rounded-xl bg-gray-900 px-5 py-4 font-mono text-sm text-green-400">
            Real Stripe percentage = total Stripe fees / total processed charge volume
          </div>
          <p className="leading-relaxed">
            That is the number that tells you what Stripe actually took from your revenue. A single $100
            domestic card charge may look close to 3.2%, but a real month can land at 3.8%, 4.2%, or higher
            depending on customer geography and transaction size.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-bold text-gray-900">Check your real Stripe percentage from CSV</h2>
          <p className="mt-2 leading-relaxed text-gray-600">
            A public calculator can estimate one charge. Your Stripe Balance CSV shows what happened across
            all charges, refunds, and fee lines. Upload it to see your processing rate, all-in Stripe cost,
            monthly trend, and top fee drivers.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analyze"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Analyze My Stripe CSV
            </Link>
            <Link
              href="/stripe-balance-csv"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              How to export the CSV
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-400">No OAuth. No API keys. Raw CSV files are not stored.</p>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Common questions</h2>
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900">{item.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.answer}</p>
            </div>
          ))}
        </section>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="mb-4 text-sm font-semibold text-gray-700">Related guides</p>
          <div className="space-y-3">
            {[
              { href: "/stripe-fee-calculator", title: "Stripe fee calculator from real data" },
              { href: "/why-stripe-fee-rate-higher-than-2-9", title: "Why Stripe fees are higher than 2.9%" },
              { href: "/blog/stripe-blended-rate-calculator", title: "Stripe blended rate formula" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-blue-600 hover:underline">
                {link.title} -&gt;
              </Link>
            ))}
          </div>
        </div>

        <SeoPageTrustFooter />
      </main>
    </div>
  );
}
