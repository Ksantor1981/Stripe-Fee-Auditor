/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";

export const metadata: Metadata = {
  title: "Stripe Fees for Small Transactions: Why Your Rate Is Higher | Fee Auditor",
  description:
    "Stripe's $0.30 fixed fee hits small transactions hard. A $5 charge has an effective rate of 9%. Here's the math and what to do about it.",
  alternates: { canonical: "/blog/stripe-fees-small-transactions" },
  openGraph: {
    title: "Stripe Fees for Small Transactions: Why Your Rate Is Higher",
    description: "Stripe's $0.30 fixed fee hits small transactions hard. A $5 charge costs 9% in fees.",
    url: "https://feeauditor.com/blog/stripe-fees-small-transactions",
  },
};

const TABLE_DATA = [
  { amount: "$100.00", pct: "$2.90", fixed: "$0.30", total: "$3.20", rate: "3.20%" },
  { amount: "$50.00",  pct: "$1.45", fixed: "$0.30", total: "$1.75", rate: "3.50%" },
  { amount: "$10.00",  pct: "$0.29", fixed: "$0.30", total: "$0.59", rate: "5.90%" },
  { amount: "$5.00",   pct: "$0.15", fixed: "$0.30", total: "$0.45", rate: "9.00%" },
  { amount: "$1.00",   pct: "$0.03", fixed: "$0.30", total: "$0.33", rate: "33.00%" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</Link>

        <div className="mt-4">
          <span className="text-xs text-gray-400">5 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Stripe Fees for Small Transactions: Why Your Effective Rate Might Be Higher Than You Think
        </h1>

        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          Stripe's pricing looks simple: 2.9% + $0.30. But that $0.30 fixed fee is the same
          whether you charge $100 or $5. For small transactions, it dominates — pushing your
          real effective rate far above what's advertised.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>See how small transactions affect your rate:</strong>{" "}
          <Link href="/analyze" className="underline font-medium">Upload your Stripe CSV</Link>{" "}
          to see your effective rate broken down by transaction size. Or{" "}
          <Link href="/analyze?sample=1" className="underline font-medium">try the sample report</Link>.
          <BlogBetaRetentionNote />
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              The math: how the $0.30 fixed fee works
            </h2>
            <p>
              The percentage fee (2.9%) scales with the transaction amount. The $0.30 fixed fee
              does not — it applies to every transaction regardless of size. On small transactions,
              the fixed fee becomes the dominant cost.
            </p>
            <div className="mt-4 rounded-lg border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Amount", "2.9% fee", "$0.30 fee", "Total fee", "Effective rate"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {TABLE_DATA.map((r) => (
                    <tr key={r.amount} className={parseFloat(r.rate) > 5 ? "bg-red-50/40" : "bg-white"}>
                      <td className="px-3 py-2.5 font-mono text-gray-900">{r.amount}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-600">{r.pct}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-600">{r.fixed}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-700 font-medium">{r.total}</td>
                      <td className={`px-3 py-2.5 font-mono font-bold ${parseFloat(r.rate) > 5 ? "text-red-600" : "text-gray-900"}`}>
                        {r.rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              For a $5 transaction, the $0.30 fixed fee alone represents 6% of the transaction
              value — before the 2.9% percentage fee even applies.
            </p>
            <p className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <strong>Manual card entry:</strong> If your team keys in card numbers (phone orders, invoices paid over the phone),
              Stripe adds <strong>+0.5%</strong> on top of standard card pricing — another lift on top of the fixed $0.30, separate from transaction size.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Which businesses are most affected
            </h2>
            <p>
              The fixed fee impact is most significant for businesses where small transactions
              make up a meaningful portion of volume:
            </p>
            <ul className="mt-3 space-y-2 text-sm list-none">
              {[
                "Digital content with per-item purchases ($1–$10 per item)",
                "SaaS with a free-to-paid trial charge ($1 authorization)",
                "Subscription services with a low starter tier ($5–$10/month)",
                "Marketplaces with small individual transactions",
                "Apps with in-app purchases under $10",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-gray-400">→</span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Even if your average transaction is healthy, a significant number of small
              transactions can drag up your overall blended rate by 0.3–0.5 percentage points.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How to identify if this is affecting you
            </h2>
            <p>
              Export your Stripe Balance CSV and filter for charge rows with amounts under $20.
              Sum the fees for those rows and compare to the fees you'd pay at a hypothetical
              "no fixed fee" rate. The difference is the excess you're paying due to small
              transaction fixed fees.
            </p>
            <p className="mt-3">
              feeauditor.com does this automatically — it flags transactions where the fixed fee
              is disproportionate to the charge amount and shows you your effective rate broken
              down by transaction size bucket.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What you can do about it
            </h2>
            <ul className="space-y-4 list-none">
              {[
                {
                  title: "Set a minimum transaction amount",
                  desc: "Stripe itself recommends this. If your minimum viable purchase is $1, consider requiring a $5 or $10 minimum. The fixed fee drops from 30% of revenue to 6% — a dramatic improvement to your effective rate without changing your pricing model fundamentally.",
                },
                {
                  title: "Bundle small purchases",
                  desc: "Instead of charging per item, let customers accumulate a balance and charge once it hits a threshold. Common in digital content: charge when the user has $10+ in their cart rather than $0.99 per article.",
                },
                {
                  title: "Move recurring small charges to annual billing",
                  desc: "A $5/month subscription has a $0.30 fixed fee on every charge — 12 charges per year = $3.60 in fixed fees alone. An annual charge of $60 has only one $0.30 fixed fee. Annual billing cuts your fixed fee cost by 92% for the same revenue.",
                },
                {
                  title: "Use Stripe's Link or optimized checkout for higher conversion",
                  desc: "Higher conversion on small transactions dilutes the fixed fee impact per successful sale. If your $5 product converts at 2% vs 3%, you're processing 50% more transactions for the same revenue — that's 50% more $0.30 fees.",
                },
              ].map((item) => (
                <li key={item.title} className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              When to consider specialized micropayment processors
            </h2>
            <p>
              For transactions consistently under $2, standard card processors like Stripe may
              not be economical regardless of strategy. Some specialized processors offer
              micropayment-optimized pricing (e.g., $0.05 + 5% instead of $0.30 + 2.9%).
            </p>
            <p className="mt-3">
              The break-even between Stripe's standard rate and a micropayment rate of $0.05 + 5%
              is approximately $8.33 — below that amount, the micropayment processor is cheaper;
              above it, Stripe wins. This only makes sense if the majority of your transactions
              are under $8.
            </p>
          </section>

        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
          <p className="font-semibold text-gray-900">See your effective rate by transaction size</p>
          <p className="mt-1 text-sm text-gray-600">
            Upload your Stripe Balance CSV and see exactly how small transactions are affecting
            your blended rate — and which ones are the biggest culprits.
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
              { href: "/blog/why-stripe-effective-rate-higher-than-2-9-percent", title: "Why Is My Stripe Effective Rate Higher Than 2.9%?" },
              { href: "/blog/stripe-ach-vs-credit-card-fees", title: "ACH vs Credit Card Fees on Stripe" },
              { href: "/blog/stripe-blended-rate-calculator", title: "Stripe Blended Rate Calculator" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block text-sm text-blue-600 hover:underline">{l.title} →</Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
