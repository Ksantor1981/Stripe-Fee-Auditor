import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { MarketingShell } from "@/components/MarketingShell";
import { SeoAnalyzeCta } from "@/components/SeoAnalyzeCta";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pagePath = "/stripe-fee-analysis-tools";
const pageTitle = "Best Stripe Fee Analysis Tools for Effective Rate Audits";
const pageDescription =
  "Compare Stripe fee calculators, Balance CSV exports, accounting tools, SaaS analytics, and Stripe Fee Auditor for checking your real effective Stripe rate.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Stripe fee analysis tools",
    "Stripe effective rate audit",
    "Stripe fee audit",
    "Stripe Balance CSV analysis",
    "Stripe fee calculator alternative",
    "Stripe fee reconciliation",
    "Stripe refund fee leakage",
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

const tools = [
  {
    name: "Stripe pricing docs",
    bestFor: "Official published rates and country-specific fee rules",
    limitation: "They do not calculate your actual blended rate from your transactions.",
    verdict: "Start here for official rates, then audit your own CSV.",
  },
  {
    name: "Stripe fee calculators",
    bestFor: "Estimating the fee on a single future transaction",
    limitation: "They miss card mix, refunds, disputes, FX, add-ons, and month-to-month drift.",
    verdict: "Useful before charging a customer; weak for diagnosing real fees.",
  },
  {
    name: "Stripe Balance CSV plus spreadsheet",
    bestFor: "Manual reconciliation with exact exported rows",
    limitation: "Accurate but slow; you still need to group fee drivers and spot outliers.",
    verdict: "Best DIY path if you like spreadsheets.",
  },
  {
    name: "Accounting or BI exports",
    bestFor: "Bookkeeping, payout reconciliation, dashboards, and warehouse pipelines",
    limitation: "They usually answer where money went, not why your effective rate is high.",
    verdict: "Good for finance operations; not a focused fee-leak diagnosis.",
  },
  {
    name: "SaaS analytics tools",
    bestFor: "MRR, churn, cohorts, revenue metrics, and subscription analytics",
    limitation: "Stripe fees are usually a side metric, and many tools require OAuth access.",
    verdict: "Great for SaaS metrics; less direct for fee-driver audits.",
  },
  {
    name: "Stripe Fee Auditor",
    bestFor: "CSV-based effective rate audit, fee drivers, refund leakage, and savings actions",
    limitation: "It is not accounting software, tax advice, or a live Stripe sync.",
    verdict: "Best fit when you want a fast fee audit without Stripe OAuth or API keys.",
  },
];

const faqItems = [
  {
    question: "What is the best tool to analyze Stripe fees?",
    answer:
      "It depends on the job. Stripe docs are best for official published pricing, calculators are best for single-transaction estimates, accounting tools are best for reconciliation, and Stripe Fee Auditor is built for checking your real effective Stripe rate from a Balance CSV.",
  },
  {
    question: "Is a Stripe fee calculator enough?",
    answer:
      "A calculator is enough before you charge a customer. It is not enough to explain your real monthly rate because it cannot see international cards, refunds, disputes, currency conversion, Stripe add-ons, or your actual transaction mix.",
  },
  {
    question: "Does Stripe Fee Auditor need Stripe OAuth?",
    answer:
      "No. Stripe Fee Auditor uses an itemized Stripe Balance CSV export. You do not connect Stripe OAuth and you do not share Stripe API keys.",
  },
  {
    question: "Does Stripe Fee Auditor replace accounting software?",
    answer:
      "No. It is a fee-analysis tool, not an accounting system. Use it to understand effective rate, high-fee charges, refund fee leakage, and savings opportunities, then reconcile official totals in Stripe or your accounting workflow.",
  },
];

const pageUrl = absoluteUrl(pagePath);
const breadcrumbCrumbs = sitePageBreadcrumbs(pageTitle, pagePath);

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
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
    "@type": "ItemList",
    "@id": `${pageUrl}#tools`,
    name: "Stripe fee analysis tool categories",
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      description: `${tool.bestFor}. ${tool.limitation}`,
    })),
  },
];

export default function StripeFeeAnalysisToolsPage() {
  return (
    <MarketingShell className="min-h-screen bg-white text-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />

      <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Stripe fee analysis tools</span>
        </nav>

        <section className="mt-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">Tool comparison</p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal text-gray-950 sm:text-5xl">
            Best Stripe fee analysis tools for checking your real effective rate
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            If you only need the published fee for one transaction, a calculator is enough. If you want to know
            why your actual Stripe rate is higher than expected, you need your itemized Balance CSV and a fee-driver
            audit.
          </p>
        </section>

        <section className="mt-10 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Before selling</p>
            <p className="mt-2 text-sm text-gray-700">Use a calculator to estimate a future Stripe fee.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">After selling</p>
            <p className="mt-2 text-sm text-gray-700">Use a Balance CSV to calculate what Stripe actually took.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">When rates drift</p>
            <p className="mt-2 text-sm text-gray-700">Look for international cards, refunds, small charges, and add-ons.</p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-950">Which Stripe fee tool fits the job?</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
            <div className="hidden grid-cols-[1.1fr_1.4fr_1.4fr_1.2fr] gap-0 bg-gray-50 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 md:grid">
              <div className="px-4 py-3">Tool type</div>
              <div className="px-4 py-3">Best for</div>
              <div className="px-4 py-3">Limitation</div>
              <div className="px-4 py-3">Verdict</div>
            </div>
            {tools.map((tool) => (
              <article
                key={tool.name}
                className="grid gap-2 border-t border-gray-100 px-4 py-5 md:grid-cols-[1.1fr_1.4fr_1.4fr_1.2fr] md:gap-0 md:py-4"
              >
                <h3 className="font-bold text-gray-950">{tool.name}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{tool.bestFor}</p>
                <p className="text-sm leading-relaxed text-gray-600">{tool.limitation}</p>
                <p className="text-sm font-medium leading-relaxed text-gray-800">{tool.verdict}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-950">Use Stripe Fee Auditor when</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
              <li>You already process payments with Stripe and want the actual rate, not a published estimate.</li>
              <li>Your payout looks lower than expected and you want to separate fees from volume.</li>
              <li>You want to inspect international card fees, refund fee leakage, and high-fee charges.</li>
              <li>You prefer CSV-based analysis without Stripe OAuth or API keys.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-950">Use something else when</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
              <li>You need official Stripe policy details. Use Stripe documentation first.</li>
              <li>You need accounting, tax, or bookkeeping advice. Use your accountant or finance system.</li>
              <li>You are building a data warehouse export to Tableau, Qlik, Power BI, PostgreSQL, or JSON.</li>
              <li>You need live transaction sync or payment processing alternatives.</li>
            </ul>
          </div>
        </section>

        <SeoAnalyzeCta
          className="mt-12"
          title="Check your actual Stripe rate from a Balance CSV"
          description="Free preview first. No Stripe OAuth, no API keys, and raw CSV files are not stored as files."
          primaryLabel="Analyze My CSV"
        />

        <section className="mt-12" id="faq">
          <h2 className="text-2xl font-bold text-gray-950">Stripe fee analysis FAQ</h2>
          <div className="mt-5 divide-y divide-gray-100 rounded-2xl border border-gray-200">
            {faqItems.map((item) => (
              <article key={item.question} className="p-5">
                <h3 className="font-bold text-gray-950">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-950">Helpful next pages</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <Link href="/stripe-balance-csv" className="rounded-lg bg-gray-50 p-4 font-semibold text-blue-700 hover:bg-blue-50">
              Export the right Balance CSV
            </Link>
            <Link href="/what-percent-does-stripe-take" className="rounded-lg bg-gray-50 p-4 font-semibold text-blue-700 hover:bg-blue-50">
              Calculate published Stripe fees
            </Link>
            <Link href="/how-it-works" className="rounded-lg bg-gray-50 p-4 font-semibold text-blue-700 hover:bg-blue-50">
              See how data is handled
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
