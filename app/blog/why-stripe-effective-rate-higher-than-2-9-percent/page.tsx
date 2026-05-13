/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why Is My Stripe Effective Rate Higher Than 2.9%? | Fee Auditor",
  description:
    "Stripe advertises 2.9% + $0.30. But most businesses pay more. Here are the 4 real reasons your blended Stripe fee rate is higher than advertised.",
  alternates: { canonical: "/blog/why-stripe-effective-rate-higher-than-2-9-percent" },
  openGraph: {
    title: "Why Is My Stripe Effective Rate Higher Than 2.9%?",
    description:
      "Stripe advertises 2.9% + $0.30. But most businesses pay more. Here are the 4 real reasons.",
    url: "https://feeauditor.com/blog/why-stripe-effective-rate-higher-than-2-9-percent",
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
          <span className="text-xs text-gray-400">8 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Why Is My Stripe Effective Rate Higher Than 2.9%?
        </h1>

        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          Stripe advertises 2.9% + $0.30 per transaction. But if you export your Balance CSV and
          calculate your actual blended rate, you'll almost certainly find it's higher — often
          significantly. Here's why.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Quick check:</strong> Want to see your real effective rate right now?{" "}
          <Link href="/analyze" className="underline font-medium">
            Upload your Stripe Balance CSV
          </Link>{" "}
          and get your blended rate in 30 seconds. Or{" "}
          <Link href="/analyze?sample=1" className="underline font-medium">
            try the sample report
          </Link>{" "}
          first.
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What "2.9% + $0.30" actually means
            </h2>
            <p>
              The advertised rate is the base rate for domestic US card transactions with no
              additional features enabled. It applies to a very specific type of payment — a US
              customer, paying with a US-issued standard consumer card, in USD, with no disputes,
              no refunds, and no premium card type.
            </p>
            <p className="mt-3">
              In practice, most businesses process a mix of card types, geographies, and
              transaction sizes. Each variation adds to the cost. Stripe's dashboard shows you
              individual transaction fees clearly, but there's no screen that shows your true
              blended rate across all charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Reason 1: International cards add 1.5%
            </h2>
            <p>
              When a customer pays with a card issued outside the US, Stripe adds a 1.5%
              cross-border fee on top of the base rate. For international businesses or any SaaS
              with global customers, this is often the single biggest driver of elevated fees.
            </p>
            <p className="mt-3">
              A payment that should cost 2.9% ends up costing 4.4% — a 52% increase over the
              advertised rate. If 30% of your customers are international, your blended rate
              could easily be 3.3–3.5% even with everything else being normal.
            </p>
            <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
              <strong>How to check:</strong> In your Stripe Balance CSV export, rows with
              international cards typically have <code>[international]</code> in the description
              field. Count how many of your charges have this tag.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Reason 2: The fixed $0.30 hits small transactions hard
            </h2>
            <p>
              The $0.30 fixed fee is the same regardless of transaction size. On a $100 charge,
              $0.30 is 0.3% — negligible. On a $5 charge, $0.30 is 6% — before the 2.9%
              percentage even applies. Your total fee on that $5 charge is 8.9%.
            </p>
            <p className="mt-3">
              If you sell any low-priced products or have trial periods with small charges, these
              transactions can significantly drag up your overall effective rate even if they're a
              small fraction of total volume.
            </p>
            <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-600">
              <strong>Quick math:</strong> Effective rate = (fee / charge amount) × 100. For a
              $10 charge: ($0.30 + $0.29) / $10 = 5.9%. For a $50 charge: ($0.30 + $1.45) / $50
              = 3.5%.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Reason 3: Currency conversion adds 1–2%
            </h2>
            <p>
              If a customer pays in a currency other than your settlement currency, Stripe applies
              a currency conversion fee of 1–2% on top of standard fees. This happens automatically
              when you accept payments in multiple currencies.
            </p>
            <p className="mt-3">
              Many businesses don't realize this is happening until they look at the data. Stripe
              shows the conversion in the transaction details, but it's easy to miss in aggregate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Reason 4: Refunds don't return the processing fee
            </h2>
            <p>
              When you issue a refund, Stripe returns the payment to your customer — but keeps the
              original processing fee. So if you processed a $100 charge ($3.20 in fees) and then
              fully refunded it, you've paid $3.20 with zero net revenue.
            </p>
            <p className="mt-3">
              For businesses with any meaningful refund rate, this compounds over time. A 5%
              refund rate effectively adds around 0.15–0.20% to your blended fee rate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What's a normal effective rate?
            </h2>
            <p>
              Based on typical Stripe account profiles:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                { label: "US-only, domestic cards, B2C", rate: "2.9–3.1%" },
                { label: "Mixed US/international, SaaS", rate: "3.2–3.8%" },
                { label: "Majority international customers", rate: "4.0–5.0%+" },
                { label: "Low average transaction value (<$20)", rate: "4.0–6.0%+" },
              ].map((r) => (
                <li key={r.label} className="flex items-baseline justify-between rounded-lg bg-gray-50 border border-gray-100 px-4 py-2 text-sm">
                  <span className="text-gray-600">{r.label}</span>
                  <span className="font-semibold text-gray-900 ml-4 shrink-0">{r.rate}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              If your rate is above the range for your profile, there's likely a specific driver
              worth investigating — usually international cards or small transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How to calculate your real effective rate
            </h2>
            <p>
              The formula is simple: divide total fees paid by total charge volume, then multiply
              by 100.
            </p>
            <div className="mt-3 rounded-lg bg-gray-900 text-green-400 px-5 py-4 font-mono text-sm">
              Effective rate = (total fees / total charge volume) × 100
            </div>
            <p className="mt-4">
              To get the numbers, export your Stripe Balance CSV from Dashboard → Reporting →
              Reports → Balance summary → Export → Itemized. Sum the fee column and the amount
              column for charge-type rows, then apply the formula.
            </p>
            <p className="mt-3">
              Or use{" "}
              <Link href="/analyze" className="text-blue-600 underline">
                feeauditor.com
              </Link>{" "}
              — upload the CSV and get your real rate, broken down by month, card type, and
              transaction anomalies, in about 30 seconds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What can you actually do about it?
            </h2>
            <p>
              Once you know where the extra fees are coming from, you have real options:
            </p>
            <ul className="mt-3 space-y-3 list-none">
              {[
                {
                  title: "Switch B2B invoices to ACH",
                  desc: "ACH bank transfers cost 0.8% capped at $5 — dramatically cheaper than card for large transactions. If you have customers paying $1,000+ invoices by card, this alone can save hundreds per month.",
                },
                {
                  title: "Offer local payment methods for international customers",
                  desc: "SEPA Direct Debit in Europe, iDEAL in Netherlands, and BECS in Australia all avoid the international card surcharge. Stripe supports all of these natively.",
                },
                {
                  title: "Negotiate custom pricing",
                  desc: "Once you're processing $50k+/month, Stripe will often negotiate custom interchange-plus pricing that can reduce your effective rate by 0.3–0.5%.",
                },
                {
                  title: "Review your refund policies",
                  desc: "Since Stripe keeps the fee on refunded transactions, minimizing refunds directly improves your effective rate. This isn't always possible, but it's worth knowing the cost.",
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
          <p className="font-semibold text-gray-900">Find out your real Stripe effective rate</p>
          <p className="mt-1 text-sm text-gray-600">
            Export your Stripe Balance CSV and upload it to feeauditor.com. You'll see your
            blended rate, month-by-month trends, and which specific transactions are driving it up.
            No account needed.
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
              { href: "/blog/stripe-international-card-fees", title: "Stripe International Card Fees Explained" },
              { href: "/blog/stripe-ach-vs-credit-card-fees", title: "ACH vs Credit Card Fees on Stripe" },
              { href: "/blog/how-to-reduce-stripe-fees", title: "How to Reduce Your Stripe Fees" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block text-sm text-blue-600 hover:underline"
              >
                {l.title} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
