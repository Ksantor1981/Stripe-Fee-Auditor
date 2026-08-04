import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ChromeExtensionInstallCta } from "@/components/ChromeExtensionInstallCta";
import { SeoPageTrustFooter } from "@/components/seo-page-trust-footer";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "How to Export Stripe Balance CSV for Fee Analysis";
const pageDescription =
  "Quick steps: Stripe Dashboard → Reports → Balance → Export → Itemized CSV. Use it to check effective rate, refund fee leakage, and international card mix — not for Tableau, Qlik, or PostgreSQL pipelines.";
const pagePath = "/stripe-balance-csv";

export const metadata: Metadata = {
  title: "Export Stripe Balance CSV (Quick Fee Audit) | Fee Auditor",
  description: pageDescription,
  keywords: [
    "how to export Stripe Balance CSV",
    "export Stripe Balance CSV",
    "Stripe Balance Transactions CSV",
    "Stripe balance export",
    "Stripe Balance CSV for fee analysis",
    "Stripe effective rate audit",
    "Stripe fee reconciliation",
    "Stripe fee report CSV",
    "Stripe Dashboard reports",
    "Stripe CSV columns",
    "not Stripe Tableau export",
    "not Stripe PostgreSQL export",
    "not Stripe Qlik export",
  ],
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: "Export Stripe Balance CSV (Quick Fee Audit)",
    description: pageDescription,
    url: pagePath,
    siteName: "Stripe Fee Auditor",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Export Stripe Balance CSV (Quick Fee Audit)",
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
      "We recommend at least 3 months for meaningful trend analysis. Longer is better — the more data, the more accurate the high-fee charge detection.",
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
  { name: "balance_transaction_id", description: "Unique balance transaction identifier" },
  { name: "reporting_category", description: "charge, refund, dispute, payout, fee, adjustment" },
  { name: "gross", description: "Gross transaction amount in normal currency units" },
  { name: "fee", description: "Stripe fee amount in normal currency units" },
  { name: "net", description: "Gross amount minus fees in normal currency units" },
  { name: "currency", description: "ISO 4217 currency code (usd, eur, gbp)" },
  { name: "created", description: "Transaction timestamp (created or created_utc)" },
  { name: "description", description: "Optional payment description or customer info" },
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
      "Export at least one month of data. Three or more months gives better trend data and month-over-month comparison. Stripe Fee Auditor supports files up to 4MB.",
  },
];

const ABS_PAGE = absoluteUrl(pagePath);

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${ABS_PAGE}#howto`,
    name: pageTitle,
    description: pageDescription,
    inLanguage: "en-US",
    step: steps.map((step) => ({
      "@type": "HowToStep",
      position: Number(step.number),
      name: step.title,
      text: step.schemaText,
      url: `${ABS_PAGE}#step-${step.number}`,
    })),
  },
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

export default function StripeBalanceCsvPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />

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
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: pageTitle }]} className="mb-6" />
        {/* Header */}
        <div className="mb-14">
          <p className="text-blue-600 text-sm font-medium mb-3">Quick export guide · ~5 minutes</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            {pageTitle}
          </h1>
          <p className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Not for BI tools or data pipelines</p>
          <p className="text-lg text-gray-500 leading-relaxed">
            This guide is for Stripe users who want to understand their real processing costs: effective rate, payout differences, refund fee leakage, and international card mix. It is not for developers building data pipelines to Tableau, PostgreSQL, Qlik, Power BI, or JSON warehouses.
          </p>
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Looking for a broader Stripe data export path instead? See{" "}
            <Link href="/stripe-data-export" className="font-medium text-blue-600 hover:underline">
              Stripe exports for JSON, Tableau, Power BI, and PostgreSQL
            </Link>
            .
          </div>
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
            Stripe Dashboard Balance exports usually show amounts in normal
            currency units (for example, 49.00 USD). API-style cent columns are
            also accepted when you provide amount / fee / net.
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
            breakdown, and top fee drivers, usually in under 30 seconds.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/analyze?sample=1"
              className="inline-flex items-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Try sample in 10s →
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center border border-gray-200 bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              Analyze My Fees →
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            No account · Raw CSV file not stored · Usually under 30 seconds
          </p>
          <div className="mt-5 flex justify-center">
            <ChromeExtensionInstallCta placement="stripe_balance_csv_cta" variant="quiet" />
          </div>
        </div>

        <SeoPageTrustFooter />

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-sm font-semibold text-gray-700 mb-4">Related fee guides</p>
          <div className="space-y-3">
            {[
              { href: "/stripe-fee-calculator", title: "Stripe fees calculator (estimate first)" },
              { href: "/stripe-data-export", title: "Stripe data export options (JSON, Tableau, PostgreSQL)" },
              { href: "/why-stripe-fee-rate-higher-than-2-9", title: "Why are my Stripe fees so high?" },
              { href: "/what-percent-does-stripe-take", title: "How much does Stripe charge per transaction?" },
              { href: "/blog/why-stripe-fees-increase", title: "Why did my Stripe fees increase?" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-blue-600 hover:underline">
                {link.title} →
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
