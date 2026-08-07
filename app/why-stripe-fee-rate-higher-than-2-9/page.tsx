import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { AdvertiserIdentityBanner } from "@/components/AdvertiserIdentityBanner";
import { SeoPageTrustFooter } from "@/components/seo-page-trust-footer";
import { SeoAnalyzeCta } from "@/components/SeoAnalyzeCta";
import { SeoRelatedReading } from "@/components/SeoRelatedReading";
import { SEO_RELATED_WHY_HIGHER } from "@/lib/seo-related-reading";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Why Is My Stripe Effective Rate Higher Than Expected?";
const pageDescription =
  "Fee Auditor (feeauditor.com) — independent CSV tool, not affiliated with Stripe. See why effective rate and payout often run above 2.9% + $0.30: international cards, refund fees, FX, small tickets.";
const pagePath = "/why-stripe-fee-rate-higher-than-2-9";
const published = "2026-05-16";
const updated = "2026-08-03";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Stripe effective rate",
    "Stripe payout lower than expected",
    "why are my Stripe fees so high",
    "Stripe refund fees not returned",
    "Stripe processing fees",
    "Stripe fee rate higher than 2.9%",
    "Stripe international card fees",
    "Stripe fee reconciliation",
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
    publishedTime: published,
    modifiedTime: updated,
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
      "Per Stripe's pricing FAQ, when you issue a refund Stripe does not return the processing fees, Connect fees, or currency conversion fees from the original transaction. A 5% refund rate adds meaningful cost across large volumes.",
    example: "5% refund rate on $100k revenue = $145 in non-refundable fees",
  },
  {
    number: "04",
    title: "Disputes",
    description:
      "Each dispute carries a $15 received fee (refunded if you win). Smart Disputes adds 30% of the disputed amount when you win — on top of card processing.",
    example: "$100 disputed charge won with Smart Disputes: $15 fee refunded + $30 Smart Disputes fee",
  },
  {
    number: "05",
    title: "Stripe Radar",
    description:
      "If you use Radar for fraud protection beyond the basic included tier, there's an additional $0.02–$0.07 per transaction. This shows up as a separate line in your Balance report.",
    example: "1,000 transactions × $0.05 Radar fee = $50/month extra",
  },
  {
    number: "06",
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
      "No. Per Stripe's pricing FAQ, when you issue a refund Stripe does not return the processing fees, Connect fees, or currency conversion fees from the original transaction. This can increase your effective fee rate if your business has a meaningful refund rate.",
  },
  {
    question: "What do Stripe disputes and Smart Disputes cost?",
    answer:
      "Stripe charges a $15 fee when a dispute is received (refunded if you win). Smart Disputes, when enabled, adds 30% of the disputed amount when you win.",
  },
  {
    question: "How can I calculate my real Stripe effective fee rate?",
    answer:
      "Export your Stripe Balance Transactions CSV and divide total Stripe fees by total processed charge volume for the same period. Fee Auditor (feeauditor.com) does this from your real CSV and shows the transactions driving the rate up.",
  },
  {
    question: "Is Fee Auditor part of Stripe?",
    answer:
      "No. Fee Auditor is an independent tool at feeauditor.com. It is not affiliated with, endorsed by, or part of Stripe, Inc. We do not provide Stripe customer support and do not connect to your Stripe account via OAuth.",
  },
];

const ABS_PAGE = absoluteUrl(pagePath);

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${ABS_PAGE}#article`,
    headline: pageTitle,
    description: pageDescription,
    datePublished: published,
    dateModified: updated,
    inLanguage: "en-US",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": ABS_PAGE,
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

export default function WhyStripeFeesIncreasePage() {
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
        <AdvertiserIdentityBanner className="mb-8" />
        {/* Header */}
        <div className="mb-14">
          <p className="text-blue-600 text-sm font-medium mb-3">
            Fee Auditor · Independent fee education
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Why Is My Stripe Effective Rate Higher Than Expected?
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Stripe advertises 2.9% + $0.30. Your effective rate — and sometimes your payout vs
            volume — often lands at 3.2–3.8% because of international cards, refund fees that are
            not returned, FX, and small tickets. Here are the five drivers — with real numbers.
            Fee Auditor helps you check your own Balance CSV; we are not Stripe support.
          </p>
        </div>

        <SeoAnalyzeCta
          className="mb-14 border border-blue-100"
          title="Find your specific fee driver with Fee Auditor — free"
          description="Independent tool at feeauditor.com — not affiliated with Stripe. Upload your Balance CSV to see the rate you actually paid and one concrete driver. No OAuth. Raw CSV is not stored."
          primaryLabel="Analyze my Balance CSV →"
          showSample={false}
        />

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

        <SeoRelatedReading links={SEO_RELATED_WHY_HIGHER} />

        <SeoPageTrustFooter />
      </main>
    </MarketingShell>
  );
}
