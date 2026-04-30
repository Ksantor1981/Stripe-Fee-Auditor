import Link from "next/link";
import type { Metadata } from "next";

const pageTitle = "How to Export Stripe Balance CSV - Step by Step";
const pageDescription =
  "Step-by-step guide to export your Stripe Balance Transactions CSV from the Dashboard. Includes what columns to expect and how to use the file.";
const pagePath = "/stripe-balance-csv";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "export Stripe Balance CSV",
    "Stripe Balance Transactions CSV",
    "Stripe balance export",
    "Stripe fee report CSV",
    "Stripe Dashboard reports",
    "Stripe CSV columns",
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

const steps = [
  {
    number: "1",
    title: "Open Stripe Dashboard",
    schemaText:
      "Go to dashboard.stripe.com and log in to your Stripe account.",
    description: (
      <>
        Go to{" "}
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          dashboard.stripe.com
        </a>{" "}
        and log in to your account.
      </>
    ),
  },
  {
    number: "2",
    title: 'Click "Reports" in the left sidebar',
    schemaText:
      'Find the Reports section in the left navigation menu. If you do not see it, look under "Balance" or use the Dashboard search.',
    description:
      'Find the Reports section in the left navigation menu. If you don\'t see it, look under "Balance" or use the search.',
  },
  {
    number: "3",
    title: 'Select "Balance" → "Balance transactions"',
    schemaText:
      'Choose "Balance transactions" instead of a summary report so the CSV includes one row per transaction with fee detail.',
    description:
      'Choose "Balance transactions" — not the summary. This gives you one row per transaction with full fee detail.',
  },
  {
    number: "4",
    title: "Set your date range",
    schemaText:
      "Choose at least one month of data. Three or more months is better for trend analysis and month-over-month comparison.",
    description:
      "We recommend at least 3 months for meaningful trend analysis. Longer is better — the more data, the more accurate the anomaly detection.",
  },
  {
    number: "5",
    title: "Export as CSV",
    schemaText:
      "Click Export, select CSV format, and download the Balance Transactions file.",
    description:
      'Click "Export" in the top right, select CSV format, and download. The file is usually named balance_transactions_YYYYMMDD.csv.',
  },
];

const columns = [
  { name: "id", description: "Unique transaction identifier" },
  { name: "type", description: "charge, refund, payout, fee, adjustment" },
  { name: "amount", description: "Gross amount (in cents)" },
  { name: "fee", description: "Stripe fee charged (in cents)" },
  { name: "net", description: "Amount minus fee (in cents)" },
  { name: "currency", description: "ISO 4217 currency code (usd, eur, gbp)" },
  { name: "created", description: "Transaction timestamp (ISO 8601)" },
  { name: "description", description: "Payment description or customer info" },
];

const faqItems = [
  {
    question: 'I do not see "Balance transactions" in Reports',
    answer:
      'Try navigating to Reports -> Balance and look for an "Export" button in the top right. The UI varies slightly by account type. Some accounts see it under Payments -> All transactions.',
  },
  {
    question: "What is the difference between Balance and Payout reports?",
    answer:
      "Balance transactions include individual charges, refunds, and fees. Payout reports are grouped summaries of what Stripe sent to your bank. Use Balance transactions for fee analysis.",
  },
  {
    question: "How much data should I export?",
    answer:
      "Export at least one month of data. Three or more months gives better trend data and month-over-month comparison. Stripe Fee Auditor supports files up to 50MB.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${pagePath}#howto`,
    name: pageTitle,
    description: pageDescription,
    inLanguage: "en-US",
    step: steps.map((step) => ({
      "@type": "HowToStep",
      position: Number(step.number),
      name: step.title,
      text: step.schemaText,
      url: `${pagePath}#step-${step.number}`,
    })),
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

export default function StripeBalanceCsvPage() {
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
          <p className="text-blue-600 text-sm font-medium mb-3">Export Guide</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            How to Export Your Stripe Balance CSV
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            The Balance Transactions report is the most detailed financial
            export in Stripe. Here's how to get it in five steps.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-14">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-5 bottom-5 w-px bg-gray-200" />

            <div className="space-y-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  id={`step-${step.number}`}
                  className="flex gap-6 relative"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center z-10">
                    <span className="text-sm font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-1 pt-2 pb-2">
                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columns reference */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Key columns in the file
          </h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 font-mono text-xs">
                    Column
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {columns.map((col) => (
                  <tr key={col.name}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700 bg-blue-50/30">
                      {col.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {col.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Amounts are in the smallest currency unit (cents for USD). The
            analyzer converts them automatically.
          </p>
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
            Got your CSV? Upload it now.
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Drop your Balance CSV and get your real effective rate, monthly
            breakdown, and top fee drivers in 30 seconds.
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
      </main>
    </div>
  );
}
