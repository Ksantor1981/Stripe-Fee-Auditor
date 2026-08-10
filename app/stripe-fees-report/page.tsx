import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MarketingShell } from "@/components/MarketingShell";
import { SeoAnalyzeCta } from "@/components/SeoAnalyzeCta";
import { SeoPageTrustFooter } from "@/components/seo-page-trust-footer";
import { SeoRelatedReading } from "@/components/SeoRelatedReading";
import { SEO_RELATED_FEES_REPORT } from "@/lib/seo-related-reading";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pagePath = "/stripe-fees-report";
const pageTitle = "Stripe Fees Report: What to Include Beyond Dashboard Totals";
const pageDescription =
  "A useful Stripe fees report shows processing rate, all-in cost, refund drag, international uplift, and high-fee rows — not just a CSV sum. Export Balance transactions, then audit.";

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  keywords: [
    "Stripe fees report",
    "Stripe fee report",
    "Stripe processing fees report",
    "Stripe Balance report",
    "Stripe effective rate report",
    "Stripe fee breakdown report",
    "Stripe transaction fee report",
    "Stripe export transactions",
  ],
  alternates: { canonical: pagePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pagePath,
    siteName: "Stripe Fee Auditor",
    type: "article",
  },
  twitter: {
    card: "summary",
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

const dashboardShows = [
  "Fee rows per Balance transaction",
  "Payout totals and net amounts",
  "Raw export for spreadsheets",
];

const reportShouldAdd = [
  {
    title: "Processing rate vs all-in cost",
    body: "Separate card processing from refunds, disputes, Radar, Billing, and FX lines so the headline 2.9% is not mistaken for total Stripe drag.",
  },
  {
    title: "Ranked fee drivers",
    body: "International cards, micro-transactions, refund fee leakage, and one-off spikes — with dollar impact, not only percentages.",
  },
  {
    title: "High-fee transaction evidence",
    body: "Row-level charges you can match back to Stripe Dashboard, useful for finance reviews and CFO client packs.",
  },
  {
    title: "Directional savings checks",
    body: "What to verify first (billing cadence, local methods, interchange-plus eligibility) — estimates, not guaranteed savings.",
  },
];

const faqItems = [
  {
    q: "Is a Stripe fees report the same as the Balance CSV?",
    a: "The CSV is the source. A fees report is the interpreted view: effective rate, drivers, and actionable rows — without rebuilding pivot tables every month.",
  },
  {
    q: "Where do I export Stripe transactions for a fee report?",
    a: "Stripe Dashboard → Reports → Balance → Balance change from activity → Itemized export. See the step-by-step Balance CSV guide linked below.",
  },
  {
    q: "Can Stripe Dashboard show my effective rate?",
    a: "You can sum fees manually, but Dashboard does not rank drivers or separate recurring leakage from one-off spikes the way a focused fee audit does.",
  },
];

const absPage = absoluteUrl(pagePath);
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    headline: pageTitle,
    description: pageDescription,
    url: absPage,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

const breadcrumbCrumbs = sitePageBreadcrumbs(pageTitle, pagePath);

export default function StripeFeesReportPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Stripe fees report" }]} className="mb-6" />

        <p className="text-sm font-medium text-blue-600">Stripe fees report</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900">{pageTitle}</h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">{pageDescription}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Dashboard export</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {dashboardShows.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-gray-400">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">Fees report should add</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {reportShouldAdd.map((item) => (
                <li key={item.title}>
                  <span className="font-medium text-gray-900">{item.title}</span>
                  {" — "}
                  {item.body}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900">Build the report in three steps</h2>
          <ol className="mt-4 space-y-3 text-sm text-gray-600">
            <li>
              <span className="font-medium text-gray-900">1. Export</span> —{" "}
              <Link href="/stripe-balance-csv" className="text-blue-700 underline hover:text-blue-800">
                Stripe Balance CSV
              </Link>{" "}
              (itemized, 1–3 months).
            </li>
            <li>
              <span className="font-medium text-gray-900">2. Estimate</span> — optional{" "}
              <Link href="/stripe-fee-calculator" className="text-blue-700 underline hover:text-blue-800">
                published-rate calculator
              </Link>{" "}
              to set expectations.
            </li>
            <li>
              <span className="font-medium text-gray-900">3. Audit</span> — upload the CSV for processing vs
              all-in rate, drivers, and high-fee rows.
            </li>
          </ol>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Common questions</h2>
          {faqItems.map((item) => (
            <div key={item.q} className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-900">{item.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </div>
          ))}
        </section>

        <SeoAnalyzeCta
          className="mt-12 border border-blue-100"
          title="Turn your export into a fees report"
          description="Free preview from your Balance CSV — full report adds high-fee rows, savings checks, and exports."
          primaryLabel="Upload Balance CSV →"
          showSample
        />

        <SeoRelatedReading links={SEO_RELATED_FEES_REPORT} className="mt-10" />

        <SeoPageTrustFooter />
      </main>
    </MarketingShell>
  );
}
