import Link from "next/link";
import type { Metadata } from "next";

const pageTitle = "Why Is My Stripe Fee Rate Higher Than 2.9%?";
const pageDescription =
  "Stripe advertises 2.9% + $0.30, but most businesses pay 3.2-3.8%. Learn the 5 reasons your effective Stripe fee rate is higher than expected.";
const pagePath = "/why-stripe-fee-rate-higher-than-2-9";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Stripe fee rate higher than 2.9%",
    "Stripe effective fee rate",
    "Stripe fees explained",
    "Stripe international card fees",
    "Stripe refund fees",
    "Stripe Balance CSV analysis",
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

const reasons = [
  {
    number: "01",
    title: "International Cards",
    description:
      "When your customer's card is issued outside your country, Stripe adds a cross-border fee of +1.5%. If 20% of your customers are international, this alone adds ~0.3% to your effective rate.",
    example: "20% international customers × 1.5% = +0.30% on your effective rate",
  },
  {
    number: "02",
    title: "Currency Conversion",
    description:
      "If you charge in USD but your customer's bank settles in EUR or GBP, Stripe applies an FX markup on top of the base rate. This is separate from the cross-border fee and often invisible in the Dashboard.",
    example: "FX markup is embedded in the exchange rate — not shown as a separate line item",
  },
  {
    number: "03",
    title: "Refunds",
    description:
      "Stripe keeps the processing fee when you issue a refund. The original transaction fee is not returned. A 5% refund rate adds meaningful cost across large volumes.",
    example: "5% refund rate on $100k revenue = $1,450 in non-refundable fees",
  },
  {
    number: "04",
    title: "Stripe Radar",
    description:
      "If you use Radar for fraud protection beyond the basic included tier, there's an additional $0.02–$0.07 per transaction. This shows up as a separate line in your Balance report.",
    example: "1,000 transactions × $0.05 Radar fee = $50/month extra",
  },
  {
    number: "05",
    title: "Micro-Transactions",
    description:
      "On small charges, the fixed $0.30 component dominates. A $2.00 charge has an effective rate of 17.9% — this drags up your average significantly if you have many small payments.",
    example: "$2.00 charge: 2.9% ($0.06) + $0.30 = $0.36 total = 17.9% effective rate",
  },
];

const faqItems = [
  {
    question: "Why is my Stripe fee rate higher than 2.9%?",
    answer:
      "Your effective Stripe fee rate can be higher than the published 2.9% + $0.30 because of international card fees, currency conversion, non-refundable fees on refunds, Radar charges, disputes, and small transactions where the fixed fee is a large share of the payment.",
  },
  {
    question: "Does Stripe return processing fees when I refund a payment?",
    answer:
      "No. When you issue a refund, Stripe generally does not return the original processing fee. This can increase your effective fee rate if your business has a meaningful refund rate.",
  },
  {
    question: "How can I calculate my real Stripe effective fee rate?",
    answer:
      "Export your Stripe Balance Transactions CSV and divide total Stripe fees by total processed charge volume for the same period. Stripe Fee Auditor does this from your real CSV and shows the transactions driving the rate up.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pagePath}#article`,
    headline: pageTitle,
    description: pageDescription,
    inLanguage: "en-US",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pagePath,
    },
    publisher: {
      "@type": "Organization",
      name: "Stripe Fee Auditor",
    },
    about: [
      "Stripe fees",
      "Stripe effective fee rate",
      "payment processing costs",
      "Stripe Balance CSV",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pagePath}#faq`,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pagePath}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageTitle,
        item: pagePath,
      },
    ],
  },
];

export default function WhyStripeFeesIncreasePage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900 text-sm">
            Stripe Fee Auditor
          </Link>
          <Link
            href="/analyze"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze My Fees
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-14">
          <p className="text-blue-600 text-sm font-medium mb-3">Fee Education</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Why Is My Stripe Fee Rate Higher Than 2.9%?
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Stripe advertises 2.9% + $0.30 per transaction. But most businesses
            pay 3.2–3.8% when averaged across all charges. Here are the five
            reasons why — with real numbers.
          </p>
        </div>

        {/* Reasons */}
        <div className="space-y-10 mb-16">
          {reasons.map((r) => (
            <div key={r.number} className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                <span className="text-xs font-mono font-semibold text-gray-400">
                  {r.number}
                </span>
              </div>
              <div className="flex-1 pt-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {r.title}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-3">
                  {r.description}
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-sm font-mono text-gray-600">{r.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-14 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Common questions
          </h2>
          {faqItems.map((item) => (
            <div key={item.question} className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 text-sm mb-1">
                {item.question}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="border border-gray-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            See exactly which of these apply to you
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Upload your Stripe Balance CSV. Get your real effective rate,
            monthly breakdown, and the specific transactions driving it up.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Analyze My Fees →
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            No account · CSV not stored · Results in 30 seconds
          </p>
        </div>

        {/* Next step */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
          <span>Next: how to export the file</span>
          <Link
            href="/stripe-balance-csv"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            CSV Export Guide →
          </Link>
        </div>
      </main>
    </div>
  );
}
