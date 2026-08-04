import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { SeoPageTrustFooter } from "@/components/seo-page-trust-footer";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Stripe Data Export: Balance CSV vs JSON, Tableau, PostgreSQL";
const pageDescription =
  "Pick the right Stripe export for the job. Fee reconciliation needs an itemized Balance CSV — Fee Auditor is not a JSON/Tableau/PostgreSQL connector. BI and warehouse paths use API or ETL.";
const pagePath = "/stripe-data-export";

export const metadata: Metadata = {
  title: "Stripe Export Paths: CSV vs JSON, Tableau, Postgres | Fee Auditor",
  description: pageDescription,
  keywords: [
    "export Stripe data",
    "export Stripe to JSON",
    "export Stripe to Tableau",
    "export Stripe to PostgreSQL",
    "export Stripe to Power BI",
    "Stripe CSV export",
    "Stripe Balance CSV",
    "Stripe data export",
    "Stripe fee reconciliation",
  ],
  alternates: {
    canonical: pagePath,
  },
  openGraph: {
    title: "Stripe Export Paths: CSV vs JSON, Tableau, Postgres",
    description: pageDescription,
    url: pagePath,
    siteName: "Stripe Fee Auditor",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stripe Export Paths: CSV vs JSON, Tableau, Postgres",
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

const exportOptions = [
  {
    goal: "Export Stripe to JSON",
    bestPath: "Stripe API or an ETL connector",
    note: "Use this for app integrations, data warehouses, or custom dashboards.",
  },
  {
    goal: "Export Stripe to Tableau or Power BI",
    bestPath: "CSV import, connector, or warehouse sync",
    note: "Useful for reporting, but you still need the right fee rows for reconciliation.",
  },
  {
    goal: "Export Stripe to PostgreSQL",
    bestPath: "Stripe API, webhooks, or a managed pipeline",
    note: "Best when you need ongoing sync, joins, and custom internal analytics.",
  },
  {
    goal: "Reconcile Stripe fees",
    bestPath: "Itemized Stripe Balance CSV",
    note: "Best for effective rate, payout differences, refund fee leakage, and fee drivers.",
  },
];

const feeAuditColumns = [
  "reporting_category",
  "gross",
  "fee",
  "net",
  "currency",
  "created",
  "balance_transaction_id",
];

const faqItems = [
  {
    question: "Can I export Stripe directly to JSON?",
    answer:
      "Yes, but JSON export is normally an API or connector workflow, not a Dashboard CSV workflow. If your goal is fee reconciliation, the itemized Balance CSV is usually faster than building a full API pipeline.",
  },
  {
    question: "Can I use Stripe data in Tableau or Power BI?",
    answer:
      "Yes. You can import CSV exports or sync Stripe into a warehouse first. For fee analysis, make sure your dataset includes balance transaction rows with gross, fee, net, currency, created date, and reporting category.",
  },
  {
    question: "Is Fee Auditor a Stripe data warehouse connector?",
    answer:
      "No. Fee Auditor is a Stripe fee analysis tool. It does not sync your Stripe account to PostgreSQL, Tableau, Power BI, or JSON. It analyzes an itemized Balance CSV to calculate your real effective rate and fee drivers.",
  },
  {
    question: "Which Stripe export should I use for fee reconciliation?",
    answer:
      "Use the itemized Balance CSV or Balance transactions export. Payment CSVs and payout summaries can be useful, but they usually do not contain enough transaction-level fee detail for a reliable fee audit.",
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

export default function StripeDataExportPage() {
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
          <p className="mb-3 text-sm font-medium text-blue-600">Stripe data export</p>
          <h1 className="text-4xl font-bold leading-tight text-gray-900">
            {pageTitle}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            The right Stripe export depends on the job. JSON, Tableau, Power BI, and PostgreSQL usually
            mean an API or data-pipeline workflow. Fee reconciliation is different: use the itemized
            Stripe Balance CSV so you can see transaction-level fees, refunds, and payout differences.
          </p>
        </header>

        <section className="mb-14 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-900">
          <h2 className="text-base font-bold text-blue-950">Quick answer</h2>
          <p className="mt-2">
            If you need a database or BI dashboard, use the Stripe API, webhooks, or an ETL connector.
            If you need to understand why Stripe fees or payouts look wrong, export the{" "}
            <Link href="/stripe-balance-csv" className="font-semibold underline">
              itemized Balance CSV
            </Link>{" "}
            and audit the fee rows directly.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Choose the Stripe export path for your goal
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Goal</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Best path</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Watch out for</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exportOptions.map((option) => (
                  <tr key={option.goal} className={option.goal === "Reconcile Stripe fees" ? "bg-emerald-50/50" : "bg-white"}>
                    <td className="px-4 py-3 font-medium text-gray-900">{option.goal}</td>
                    <td className="px-4 py-3 text-gray-600">{option.bestPath}</td>
                    <td className="px-4 py-3 text-gray-500">{option.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-14 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Data pipeline
            </p>
            <h2 className="text-xl font-bold text-gray-900">When you need JSON, BI, or SQL</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Use this route when you want ongoing sync, dashboards, joins with product data, or
              finance reporting across many sources. You will usually care about charges, customers,
              invoices, subscriptions, refunds, disputes, and payouts.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-700">
              Fee reconciliation
            </p>
            <h2 className="text-xl font-bold text-gray-900">When you need your real Stripe rate</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Use this route when payout is lower than expected, fees jumped this month, or you want to
              compare your real effective rate against Stripe&apos;s published pricing. Start with the
              itemized Balance CSV.
            </p>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Columns that matter for Stripe fee analysis
          </h2>
          <p className="text-sm leading-relaxed text-gray-500">
            BI exports can include dozens of objects. For a Stripe fee audit, the important part is much
            smaller: each row needs enough data to separate charge volume from fee dollars.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {feeAuditColumns.map((column) => (
              <span
                key={column}
                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {column}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-14 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-bold text-gray-900">Looking for fee reconciliation?</h2>
          <p className="mt-2 leading-relaxed text-gray-600">
            Fee Auditor is not a Tableau, Power BI, JSON, or PostgreSQL connector. It is a focused
            Stripe Balance CSV auditor: upload the itemized export, see your processing rate, all-in
            cost, refund leakage, international card drag, and top fee drivers.
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
              Export the right Balance CSV
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            No Stripe OAuth. Raw CSV files are not stored. Free preview before the full report.
          </p>
        </section>

        <section className="mb-14 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Common questions</h2>
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-xl border border-gray-200 p-5">
              <h3 className="mb-1 text-sm font-medium text-gray-900">{item.question}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{item.answer}</p>
            </div>
          ))}
        </section>

        <SeoPageTrustFooter />

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="mb-4 text-sm font-semibold text-gray-700">Related Stripe guides</p>
          <div className="space-y-3">
            {[
              { href: "/stripe-balance-csv", title: "How to export the right Stripe Balance CSV" },
              { href: "/blog/how-to-export-stripe-balance-csv", title: "Step-by-step Balance CSV export guide" },
              { href: "/stripe-fee-calculator", title: "Stripe fee calculator" },
              { href: "/why-stripe-fee-rate-higher-than-2-9", title: "Why your real Stripe rate is higher than expected" },
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
