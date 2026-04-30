import Link from "next/link";
import type { Metadata } from "next";

const pageTitle = "Stripe Effective Fee Rate Calculator - From Real Data";
const pageDescription =
  "Calculate your real Stripe effective fee rate from your Balance CSV. Not an estimator - actual numbers from your transactions.";
const pagePath = "/stripe-fee-calculator";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Stripe fee calculator",
    "Stripe effective fee rate calculator",
    "Stripe fee audit",
    "Stripe Balance CSV analyzer",
    "calculate Stripe fees",
    "real Stripe processing fees",
  ],
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    siteName: "Stripe Fee Auditor",
    type: "website",
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

const differences = [
  {
    label: "Published rate",
    rate: "2.9%",
    note: "Stripe's standard US rate",
    highlight: false,
  },
  {
    label: "Typical effective rate",
    rate: "3.1–3.4%",
    note: "After international cards + refunds",
    highlight: false,
  },
  {
    label: "With high intl. volume",
    rate: "3.5–4.2%",
    note: "30%+ international customers",
    highlight: true,
  },
];

const whatYouGet = [
  {
    title: "Effective rate for the period",
    description:
      "Your actual fee rate across all charges — not an estimate based on inputs.",
  },
  {
    title: "Month-over-month change",
    description:
      "See if your rate went up, down, or stayed flat. In dollars, not just percentages.",
  },
  {
    title: "Top fee drivers",
    description:
      "Which specific transactions had the highest fee rate and why (international card, micro-transaction, etc).",
  },
  {
    title: "Charge fees vs other fees",
    description:
      "Processing fees separated from Radar, dispute fees, and refund-related costs.",
  },
];

const faqItems = [
  {
    question: "Is this a Stripe fee estimator or a real calculator?",
    answer:
      "Stripe Fee Auditor calculates your real effective Stripe fee rate from your Balance Transactions CSV. It is not just a single-transaction estimator using the published 2.9% + $0.30 rate.",
  },
  {
    question: "What file do I need to calculate my Stripe effective fee rate?",
    answer:
      "You need the Stripe Balance Transactions CSV export. It includes the transaction amount, fee, net amount, currency, type, and timestamp needed for an accurate fee analysis.",
  },
  {
    question: "Why can my effective Stripe rate be higher than the published rate?",
    answer:
      "International cards, currency conversion, refunds, Radar charges, disputes, and micro-transactions can all push your blended effective rate above Stripe's standard published rate.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${pagePath}#software`,
    name: "Stripe Fee Auditor",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: pagePath,
    description:
      "Stripe Fee Auditor analyzes Stripe Balance CSV exports to calculate the real effective Stripe fee rate, monthly fee trends, and transactions driving payment processing costs.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: whatYouGet.map((item) => item.title),
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

export default function StripeFeeCalculatorPage() {
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
          <p className="text-blue-600 text-sm font-medium mb-3">
            Real Data Calculator
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Your Real Stripe Fee Rate Isn't 2.9%
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Most fee calculators ask you to enter a transaction amount and
            estimate the cost. That's useful for one transaction. Your actual
            effective rate — across hundreds of real charges — is different, and
            it depends on your specific customer mix.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mt-4">
            Stripe Fee Auditor is built for SaaS, ecommerce, subscription, and
            marketplace teams that need a Stripe fee calculator based on actual
            Balance CSV exports instead of averages.
          </p>
        </div>

        {/* Why estimate vs real */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Why the difference matters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {differences.map((d) => (
              <div
                key={d.label}
                className={`rounded-xl p-4 border ${
                  d.highlight
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">{d.label}</p>
                <p
                  className={`text-2xl font-bold mb-1 ${
                    d.highlight ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {d.rate}
                </p>
                <p className="text-xs text-gray-400">{d.note}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">Example: </span>
              At $50,000/month in revenue, a 3.3% effective rate vs 2.9%
              published rate is{" "}
              <span className="font-semibold text-gray-900">
                $200/month extra — $2,400/year
              </span>
              . Knowing what's driving it tells you what to actually do about
              it.
            </p>
          </div>
        </div>

        {/* Estimator vs real data */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Estimator vs real data analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Fee Estimator
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">—</span>
                  <span>Enter a transaction amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">—</span>
                  <span>Get Stripe's published fee</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">—</span>
                  <span>Assumes standard rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">—</span>
                  <span>No history or trends</span>
                </li>
              </ul>
            </div>
            <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-5">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-3">
                Stripe Fee Auditor
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>Upload your real Balance CSV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>Actual rate from real transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>Monthly trend and MoM change</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>Specific transactions driving costs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            What you get from the analysis
          </h2>
          <div className="space-y-4">
            {whatYouGet.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-0.5">
                    {item.title}
                  </p>
                  <p className="text-gray-500 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
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
            Calculate from your real data
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Export your Stripe Balance CSV and upload it. See your actual
            effective rate in 30 seconds — no account needed.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Analyze My Fees →
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            No account · File deleted in 1 hour · Results in 30 seconds
          </p>
        </div>

        {/* Need the CSV */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-gray-400">
          <span>Don't have the CSV yet?</span>
          <Link
            href="/stripe-balance-csv"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            CSV Export Guide →
          </Link>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-gray-400">
          <span>Want to understand the fee drivers?</span>
          <Link
            href="/why-stripe-fee-rate-higher-than-2-9"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Why fees run higher →
          </Link>
        </div>
      </main>
    </div>
  );
}
