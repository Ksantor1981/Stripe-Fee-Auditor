import Link from "next/link";
import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SeoPageTrustFooter } from "@/components/seo-page-trust-footer";
import { SeoAnalyzeCta } from "@/components/SeoAnalyzeCta";
import { StripeFeeMiniEstimate } from "@/components/stripe-fee-mini-estimate";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe Fee Calculator: Estimate Fees, Then Verify Your Real Rate";
const pageDescription =
  "Free Stripe fee calculator for monthly volume, average charge size, and reverse fee math. Estimate costs, then verify your real effective rate from a Balance CSV.";
const pagePath = "/stripe-fee-calculator";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Stripe fee calculator",
    "Stripe fees calculator",
    "how much does Stripe charge per transaction",
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
    question: "How much does Stripe charge per transaction?",
    answer:
      "For many US online card payments, Stripe's published rate is 2.9% + $0.30 per successful charge. On a $100 domestic card payment that is about $3.20 (3.2% effective). International cards, currency conversion, refunds, and small tickets can push the blended rate higher — use the calculator above for your mix, then upload a Balance CSV to see your real rate.",
  },
  {
    question: "Is this calculator using my actual Stripe rates?",
    answer:
      "No. This page uses Stripe's published list pricing by region. Custom or interchange-plus accounts may differ — check Dashboard → Settings → Plans and fees. Upload a Balance CSV to see your real effective rate.",
  },
  {
    question: "Does Stripe return fees when I refund a payment?",
    answer:
      "No. Per Stripe's pricing FAQ, when you issue a refund Stripe does not return the processing fees, Connect fees, or currency conversion fees from the original transaction.",
  },
  {
    question: "What do Stripe disputes cost?",
    answer:
      "Stripe charges a $15 fee when a dispute is received (refunded if you win). Smart Disputes, when enabled, adds 30% of the disputed amount when you win — on top of card processing fees.",
  },
  {
    question: "Does Stripe Billing add fees on top of card processing?",
    answer:
      "Yes. Stripe Billing is 0.7% of billing volume on top of standard card processing fees. See stripe.com/billing/pricing.",
  },
  {
    question: "Is this a Stripe fee estimator or a real calculator?",
    answer:
      "The on-page Stripe fees calculator estimates fees from public pricing. Stripe Fee Auditor calculates your real effective Stripe fee rate from your Balance Transactions CSV, so you can compare the estimate with actual numbers.",
  },
  {
    question: "How do I estimate monthly Stripe fees?",
    answer:
      "Enter your monthly card volume and average charge amount to estimate monthly fees. Use the reverse calculator when you know the net amount you want to receive and need the gross amount to charge.",
  },
  {
    question: "What file do I need to calculate my Stripe effective fee rate?",
    answer:
      "You need the Stripe Balance Transactions CSV export. It includes the transaction amount, fee, net amount, currency, type, and timestamp needed for an accurate fee analysis.",
  },
  {
    question: "Why can my effective Stripe rate be higher than the published rate?",
    answer:
      "International cards, currency conversion, refunds (fees not returned), Stripe Billing (0.7%), Radar, disputes ($15 + Smart Disputes 30% on win), and micro-transactions can all push your blended effective rate above Stripe's standard published rate.",
  },
];

const ABS_PAGE = absoluteUrl(pagePath);

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${ABS_PAGE}#software`,
    name: "Stripe Fee Auditor",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: ABS_PAGE,
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

export default function StripeFeeCalculatorPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />

      {/* Nav */}

      <main className="max-w-3xl mx-auto px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: pageTitle }]} className="mb-6" />
        {/* Header */}
        <div className="mb-14">
          <p className="text-blue-600 text-sm font-medium mb-3">
            Stripe fees calculator
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Stripe Fee Calculator: Estimate Fees, Then Verify Your Real Rate
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Estimate monthly Stripe fees, effective rate, and how much to charge if you want to receive
            a target amount after fees. Then compare that estimate with your actual effective rate from
            a Balance CSV, where international cards, refunds, small charges, and add-ons can push the
            real number higher.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mt-4">
            Stripe Fee Auditor is built for SaaS, ecommerce, subscription, and
            marketplace teams that need a Stripe fee calculator based on actual
            Balance CSV exports instead of averages.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            Estimates below use Stripe&apos;s <strong>published rates</strong> by region (2025–2026). Your account
            may differ if you have custom or interchange-plus pricing — confirm in{" "}
            <strong>Dashboard → Settings → Plans and fees</strong>. Add-ons (Billing 0.7%, disputes, refunds) are
            not included in the card-fee math.
          </p>
        </div>

        <StripeFeeMiniEstimate />

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
              . Knowing what&apos;s driving it tells you what to actually do about
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
                  <span>Get Stripe&apos;s published fee</span>
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

        <SeoAnalyzeCta
          className="border border-blue-100"
          title="Done estimating? This was only published pricing"
          description="Your real effective rate depends on card mix, refunds, and FX in your Balance CSV. Run the free sample first, or upload your own file — no OAuth."
          primaryLabel="Upload my Balance CSV →"
          showSample
        />

        {/* Need the CSV */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-gray-400">
          <span>Don&apos;t have the CSV yet?</span>
          <Link
            href="/stripe-balance-csv"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            CSV Export Guide →
          </Link>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-gray-400">
          <span>Fees up vs last month?</span>
          <Link
            href="/blog/why-stripe-fees-increase"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Why Stripe fees increase →
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
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-gray-400">
          <span>Need the short percentage answer?</span>
          <Link
            href="/what-percent-does-stripe-take"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            What percent Stripe takes →
          </Link>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-gray-400">
          <span>Comparing payment options?</span>
          <Link
            href="/compare-stripe-paypal-wise"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Stripe vs PayPal vs Wise →
          </Link>
        </div>

        <SeoPageTrustFooter />
      </main>
    </MarketingShell>
  );
}
