/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stripe International Card Fees Explained | Fee Auditor",
  description:
    "Stripe adds a 1.5% cross-border fee on international cards. Here's exactly how it works, how to find it in your data, and how to reduce it.",
  alternates: { canonical: "/blog/stripe-international-card-fees" },
  openGraph: {
    title: "Stripe International Card Fees Explained",
    description:
      "Stripe adds 1.5% on international cards. Here's how it works and how to reduce it.",
    url: "https://feeauditor.com/blog/stripe-international-card-fees",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          ← Blog
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-gray-400">6 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Stripe International Card Fees Explained
        </h1>

        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          If you have any international customers, you're paying more than 2.9% on their
          transactions — often significantly more. Here's exactly how Stripe's cross-border fees
          work and what you can do about them.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>See your international card impact:</strong>{" "}
          <Link href="/analyze?sample=1" className="underline font-medium">
            Try the sample report
          </Link>{" "}
          to see how international card fees show up in a real analysis, or{" "}
          <Link href="/analyze" className="underline font-medium">
            upload your own CSV
          </Link>
          .
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What is the Stripe international card fee?
            </h2>
            <p>
              When a customer pays with a card issued by a bank outside the US (or outside your
              Stripe account's country), Stripe charges an additional 1.5% cross-border fee on
              top of the standard processing rate.
            </p>
            <p className="mt-3">
              For a US account, a domestic card is typically 2.9% + $0.30. An international card adds
              1.5% cross-border on top — before any currency conversion. The $0.30 fixed fee stays the
              same.
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Example: $100 payment</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Domestic US card", fee: "$3.20", rate: "3.2%", emphasis: false },
                  { label: "International card + same currency", fee: "$4.70", rate: "4.7%", emphasis: false },
                  { label: "International card + currency conversion", fee: "$5.70", rate: "5.7%", emphasis: false },
                  { label: "Extra vs domestic (intl + FX)", fee: "+$2.50", rate: "+2.5 pp", emphasis: true },
                ].map((r) => (
                  <div
                    key={r.label}
                    className={`flex justify-between ${r.emphasis ? "pt-2 border-t border-gray-200 font-medium text-red-700" : "text-gray-600"}`}
                  >
                    <span>{r.label}</span>
                    <span>
                      {r.fee} ({r.rate})
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800">
                <strong>2026 update:</strong> International card + currency conversion can reach about
                $5.70 on a $100 charge (1.5% cross-border + ~1% conversion + 2.9% base + $0.30 fixed).
                This is often the most expensive common card-present scenario — confirm numbers in your
                Stripe Dashboard for your pricing.
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What counts as an "international" card?
            </h2>
            <p>
              The fee applies when the card-issuing bank is in a different country than your Stripe
              account. For a US Stripe account:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                "A UK customer paying with a Barclays card → international fee applies",
                "A US customer traveling abroad, paying with their Chase card → no fee (card is US-issued)",
                "A Canadian customer paying with an RBC card → international fee applies",
                "A US customer with a card issued by a foreign bank → international fee applies",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-gray-400">→</span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              The determining factor is where the card was issued, not where the customer is
              currently located or what currency they're paying in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How to find international card charges in your data
            </h2>
            <p>
              In your Stripe Balance CSV export, international card transactions are identified by
              the text <code className="bg-gray-100 px-1 rounded text-sm">[international]</code>{" "}
              appearing in the description field. For example:
            </p>
            <div className="mt-3 rounded-lg bg-gray-900 text-green-400 px-5 py-4 font-mono text-xs overflow-x-auto">
              Card payment [international] - ACME Corp subscription
            </div>
            <p className="mt-4">
              To quantify the impact manually: filter your CSV for rows containing
              "[international]", sum the fee column for those rows, and compare to what the fee
              would have been at the domestic rate. The difference is your annual international
              card surcharge cost.
            </p>
            <p className="mt-3">
              feeauditor.com does this automatically — it identifies international card anomalies,
              calculates the excess fee, and estimates your annual savings opportunity if you
              shifted those transactions to cheaper payment methods.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How much is this actually costing you?
            </h2>
            <p>
              It depends on what percentage of your customers are international. Some rough math:
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Annual extra cost on $100k/year processing volume
              </p>
              <div className="space-y-2 text-sm">
                {[
                  { intl: "10% international customers", extra: "~$150/year extra" },
                  { intl: "25% international customers", extra: "~$375/year extra" },
                  { intl: "50% international customers", extra: "~$750/year extra" },
                  { intl: "75% international customers", extra: "~$1,125/year extra" },
                ].map((r) => (
                  <div key={r.intl} className="flex justify-between text-gray-600">
                    <span>{r.intl}</span>
                    <span className="font-medium text-red-600">{r.extra}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              At $500k/year volume, multiply by 5. At $1M/year, multiply by 10.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How to reduce international card fees
            </h2>
            <ul className="space-y-4 list-none">
              {[
                {
                  title: "Offer local payment methods in Europe",
                  desc: "SEPA Direct Debit costs 0.8% capped at €5 — there's no cross-border surcharge because it's a bank transfer, not a card. For European B2B customers paying recurring invoices, this can cut fees by 80%.",
                },
                {
                  title: "Use iDEAL for Netherlands customers",
                  desc: "iDEAL is the dominant payment method in the Netherlands and costs a flat €0.29 per transaction regardless of size. For a €100 payment, that's 0.29% vs roughly 4.7%+ with an international card in Euro.",
                },
                {
                  title: "Enable BECS Direct Debit for Australia",
                  desc: "For Australian customers, BECS Direct Debit is 1.75% capped at $3.50 AUD — cheaper than international card processing for most transaction sizes.",
                },
                {
                  title: "Set up a local Stripe account",
                  desc: "If you have significant volume in one country, setting up a separate Stripe account in that country eliminates the cross-border fee for those customers entirely. This adds operational complexity but can be worth it at scale.",
                },
              ].map((item) => (
                <li key={item.title} className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </li>
              ))}
            </ul>
          </section>

        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
          <p className="font-semibold text-gray-900">See how much international cards cost you</p>
          <p className="mt-1 text-sm text-gray-600">
            Upload your Stripe Balance CSV to feeauditor.com and see exactly which transactions
            are international, how much extra you paid, and your estimated annual savings from
            switching to local payment methods.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/analyze"
              className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors text-center"
            >
              Analyze My Fees
            </Link>
            <Link
              href="/analyze?sample=1"
              className="inline-block rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Try sample report →
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-sm font-semibold text-gray-700 mb-4">Related articles</p>
          <div className="space-y-3">
            {[
              { href: "/blog/why-stripe-effective-rate-higher-than-2-9-percent", title: "Why Is My Stripe Effective Rate Higher Than 2.9%?" },
              { href: "/blog/stripe-ach-vs-credit-card-fees", title: "ACH vs Credit Card Fees on Stripe" },
              { href: "/blog/how-to-reduce-stripe-fees", title: "How to Reduce Your Stripe Fees" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block text-sm text-blue-600 hover:underline">
                {l.title} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
