/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { buildOgImageUrl } from "@/lib/seo-og";

const pageTitle = "Export Stripe Balance CSV: Itemized vs Summary Guide";
const pageDescription =
  "Export the right Stripe Balance CSV for fee analysis. Learn where Itemized lives, why Summary breaks reports, and what columns you need.";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Stripe Balance CSV" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  alternates: { canonical: "/blog/how-to-export-stripe-balance-csv" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://feeauditor.com/blog/how-to-export-stripe-balance-csv",
    type: "article",
    images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

const COLUMNS = [
  { name: "id", desc: "Unique identifier for the balance transaction", example: "bt_123abc" },
  { name: "type", desc: "Type: charge, payment_refund, stripe_fee, payout", example: "charge" },
  { name: "amount", desc: "Gross amount (in cents for USD)", example: "10000 = $100.00" },
  { name: "currency", desc: "Currency of the transaction", example: "usd" },
  { name: "fee", desc: "Fee charged by Stripe", example: "290 = $2.90" },
  { name: "net", desc: "Net amount after fees (amount − fee)", example: "9710 = $97.10" },
  { name: "created", desc: "Unix timestamp when transaction was created", example: "1678886400" },
  { name: "description", desc: "Transaction description, includes [international] tag for cross-border", example: "Card payment [international]" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</Link>

        <div className="mt-4">
          <span className="text-xs text-gray-400">4 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Export Stripe Balance CSV: Itemized vs Summary
        </h1>

        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          Understanding your real Stripe fees starts with one step: exporting the right Balance CSV.
          This file contains line-item data for every transaction, fee, and payout. Here's how
          to get the right export — and what to do with it.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Skip the manual work:</strong> Once you have your CSV,{" "}
          <Link href="/analyze" className="underline font-medium">upload it to feeauditor.com</Link>{" "}
          and usually get your real effective rate in under 30 seconds. Or{" "}
          <Link href="/analyze?sample=1" className="underline font-medium">try the sample report first</Link>.
          <BlogBetaRetentionNote />
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Which export to use: Itemized, not Summary
            </h2>
            <p>
              Stripe offers two Balance export types. Make sure you choose the right one:
            </p>
            <div className="mt-4 rounded-lg border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Export type</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">What it contains</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Use for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="bg-white">
                    <td className="px-4 py-2.5 font-medium text-gray-900">Summary</td>
                    <td className="px-4 py-2.5 text-gray-600">Aggregated totals by category</td>
                    <td className="px-4 py-2.5 text-gray-500">High-level overview only</td>
                  </tr>
                  <tr className="bg-emerald-50/40">
                    <td className="px-4 py-2.5 font-medium text-emerald-700">Itemized ✓</td>
                    <td className="px-4 py-2.5 text-gray-600">Every individual transaction with fee breakdown</td>
                    <td className="px-4 py-2.5 text-gray-600 font-medium">Fee analysis and reconciliation</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              The Itemized export is what feeauditor.com and most analysis tools expect. The
              Summary CSV does not contain enough detail for per-transaction fee analysis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Step-by-step: export from Balance History
            </h2>
            <ol className="space-y-4 list-none">
              {[
                {
                  step: "1",
                  title: "Log in to Stripe Dashboard",
                  desc: 'Go to dashboard.stripe.com. Make sure you\'re in the correct account if you manage multiple.',
                },
                {
                  step: "2",
                  title: 'Navigate to Reporting → Reports → Balance summary',
                  desc: 'In the left sidebar, click "Reporting" then "Reports". Under "Track money movement", click "Balance summary".',
                },
                {
                  step: "3",
                  title: "Set your date range",
                  desc: "Choose a date range of 3–12 months for the most useful analysis. Shorter periods may miss seasonal patterns; longer periods produce larger files.",
                },
                {
                  step: "4",
                  title: 'Click "Export" → choose "Itemized"',
                  desc: 'Click the Export button in the top right. In the dropdown that appears, select "Itemized" — NOT "Summary". This is the critical step most people get wrong.',
                },
                {
                  step: "5",
                  title: 'Click "Download to system"',
                  desc: 'Select "Download to system" to save the file locally. The file will be named something like balance_2026-01-01_2026-04-30.csv.',
                },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Key columns in the Itemized CSV
            </h2>
            <p>
              The Itemized Balance CSV contains many columns. These are the most important for
              fee analysis:
            </p>
            <div className="mt-4 rounded-lg border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700 whitespace-nowrap">Column</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Description</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700 whitespace-nowrap">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {COLUMNS.map((col) => (
                    <tr key={col.name} className="bg-white">
                      <td className="px-3 py-2.5 font-mono text-blue-700 whitespace-nowrap">{col.name}</td>
                      <td className="px-3 py-2.5 text-gray-600">{col.desc}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-500 text-xs whitespace-nowrap">{col.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Note: amounts are in the smallest currency unit (cents for USD). A $100 charge
              appears as <code className="bg-gray-100 px-1 rounded">10000</code> in the amount column.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Common mistakes to avoid
            </h2>
            <ul className="space-y-3 list-none">
              {[
                {
                  mistake: "Choosing Summary instead of Itemized",
                  fix: "Summary gives totals, not individual transactions. Always choose Itemized for fee analysis.",
                },
                {
                  mistake: "Exporting too short a period",
                  fix: "A single month may not show seasonal patterns. 3–6 months gives a more representative picture of your real effective rate.",
                },
                {
                  mistake: "Including multiple currencies in one export",
                  fix: "If you process in multiple currencies, the amounts aren't directly comparable. Export per-currency or use a single-currency date range for clean analysis.",
                },
                {
                  mistake: "Forgetting to include all transaction types",
                  fix: "Make sure your export includes charges, refunds, and fees — not just charges. Refunds affect your net effective rate.",
                },
              ].map((item) => (
                <li key={item.mistake} className="rounded-xl border border-orange-100 bg-orange-50/40 px-5 py-4">
                  <p className="font-semibold text-orange-800">⚠ {item.mistake}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.fix}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What to do with the CSV once you have it
            </h2>
            <p>
              The raw CSV is the starting point. What most businesses want to know from it:
            </p>
            <ul className="mt-3 space-y-2 text-sm list-none">
              {[
                "Their true blended effective rate (total fees / total charge volume)",
                "Month-by-month fee trends — which months were more expensive and why",
                "Which individual transactions paid significantly above-average rates",
                "How much international cards contributed to elevated fees",
                "Estimated annual savings from switching certain transactions to ACH",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-blue-400">→</span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              You can do all of this manually in a spreadsheet — or upload the CSV to{" "}
              <Link href="/analyze" className="text-blue-600 underline">feeauditor.com</Link>{" "}
              and usually get the full analysis in under 30 seconds.
            </p>
          </section>

        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
          <p className="font-semibold text-gray-900">Analyze your CSV, usually in under 30 seconds</p>
          <p className="mt-1 text-sm text-gray-600">
            Upload your Stripe Balance CSV (Itemized) to feeauditor.com. You'll see your real
            effective rate, which transactions are driving it up, and your estimated savings.
            No account needed. CSV is never stored.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link href="/analyze" className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors text-center">
              Analyze My Fees
            </Link>
            <Link href="/analyze?sample=1" className="inline-block rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center">
              Try sample report →
            </Link>
          </div>
          <BlogBetaRetentionNote tone="gray" />
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-sm font-semibold text-gray-700 mb-4">Related articles</p>
          <div className="space-y-3">
            {[
              { href: "/why-stripe-fee-rate-higher-than-2-9", title: "Why Are My Stripe Fees Higher Than 2.9%?" },
              { href: "/blog/stripe-blended-rate-calculator", title: "Stripe Blended Rate Calculator" },
              { href: "/blog/stripe-international-card-fees", title: "Stripe International Card Fees Explained" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block text-sm text-blue-600 hover:underline">{l.title} →</Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
