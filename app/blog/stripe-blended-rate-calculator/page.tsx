/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stripe Blended Rate Calculator: Find Your True Fee Rate | Fee Auditor",
  description:
    "What is your real Stripe blended rate? Learn the formula, use our calculator, and find out what's pushing your effective rate above 2.9%.",
  alternates: { canonical: "/blog/stripe-blended-rate-calculator" },
  openGraph: {
    title: "Stripe Blended Rate Calculator: Find Your True Fee Rate",
    description: "Learn the formula for your real Stripe blended rate and what's pushing it above 2.9%.",
    url: "https://feeauditor.com/blog/stripe-blended-rate-calculator",
  },
};

const FACTORS = [
  {
    factor: "International cards",
    desc: "Cards issued outside your Stripe account's country add 1.5% per transaction.",
    impact: "+1.5% per intl. charge",
    severity: "high",
  },
  {
    factor: "Fixed fee on small transactions",
    desc: "The $0.30 fixed fee represents 6% of a $5 charge — pushing effective rate above 9%.",
    impact: "+3–30% on small charges",
    severity: "high",
  },
  {
    factor: "Currency conversion",
    desc: "When Stripe converts between currencies, it adds 1–2% to the transaction.",
    impact: "+1–2% per conversion",
    severity: "medium",
  },
  {
    factor: "Stripe Billing fee",
    desc: "If you use Stripe's subscription billing engine, it adds about 0.7% of billing volume on top of card processing fees.",
    impact: "+0.7% of volume",
    severity: "medium",
  },
  {
    factor: "Refunds (fee not returned)",
    desc: "Stripe keeps the processing fee when you issue a refund, increasing your net cost.",
    impact: "+0.1–0.5% blended",
    severity: "medium",
  },
  {
    factor: "Dispute fees",
    desc: "Each dispute costs $15 regardless of outcome. A 0.5% dispute rate adds ~$0.75/transaction.",
    impact: "Variable",
    severity: "low",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</Link>

        <div className="mt-4">
          <span className="text-xs text-gray-400">6 min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Stripe Blended Rate Calculator: Finding Your True Payment Processing Cost
        </h1>

        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          Stripe's advertised rate is 2.9% + $0.30. Your actual blended rate — what you really
          pay across all transactions — is almost certainly higher. Here's the formula, the
          factors that inflate it, and how to calculate yours.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Get your blended rate instantly:</strong>{" "}
          <Link href="/analyze" className="underline font-medium">Upload your Stripe Balance CSV</Link>{" "}
          and feeauditor.com calculates your real blended rate automatically — broken down by
          month and transaction type. Or{" "}
          <Link href="/analyze?sample=1" className="underline font-medium">try the sample report</Link>.
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What is a blended rate?
            </h2>
            <p>
              Your blended rate (also called effective rate) is the total fees you paid divided
              by your total charge volume over a period. It's a single number that captures
              everything — percentage fees, fixed fees, international surcharges, currency
              conversion, and any other charges.
            </p>
            <p className="mt-3">
              Unlike the advertised rate, which applies to one idealized transaction type, your
              blended rate reflects your actual mix of customers, card types, geographies, and
              transaction sizes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              The formula
            </h2>
            <div className="rounded-lg bg-gray-900 text-green-400 px-5 py-4 font-mono text-sm">
              Blended rate (%) = (Total fees paid ÷ Total charge volume) × 100
            </div>
            <div className="mt-5 rounded-lg bg-gray-50 border border-gray-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Example</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total charge volume (4 months)</span>
                  <span className="font-mono">$78,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Total fees paid</span>
                  <span className="font-mono">$2,496</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-gray-900">
                  <span>Blended rate</span>
                  <span className="font-mono text-blue-700">3.20%</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                vs. advertised 2.9% — this business is paying 10% more than the stated rate.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How to calculate it manually
            </h2>
            <ol className="space-y-3 list-none">
              {[
                {
                  n: "1",
                  title: "Export your Stripe Balance CSV (Itemized)",
                  desc: 'Go to Dashboard → Reporting → Reports → Balance summary → Export → choose "Itemized". See our full export guide for details.',
                },
                {
                  n: "2",
                  title: 'Sum the "amount" column for charge rows',
                  desc: 'Filter the CSV where the "type" column equals "charge". Sum the "amount" column. This is your total charge volume (in cents — divide by 100 for dollars).',
                },
                {
                  n: "3",
                  title: 'Sum the "fee" column for those same rows',
                  desc: 'Sum the "fee" column for charge rows only. This is total fees paid on charges (also in cents).',
                },
                {
                  n: "4",
                  title: "Apply the formula",
                  desc: "(Total fees / Total charge volume) × 100 = your blended rate as a percentage.",
                },
              ].map((item) => (
                <li key={item.n} className="flex items-start gap-4">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
                    {item.n}
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
              What inflates your blended rate
            </h2>
            <p>
              Multiple factors push your real rate above the advertised 2.9%:
            </p>
            <div className="mt-4 space-y-3">
              {FACTORS.map((f) => (
                <div key={f.factor} className={`rounded-xl border px-5 py-4 ${
                  f.severity === "high"
                    ? "border-red-100 bg-red-50/30"
                    : f.severity === "medium"
                    ? "border-orange-100 bg-orange-50/20"
                    : "border-gray-100 bg-white"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900">{f.factor}</p>
                    <span className={`text-xs font-mono shrink-0 px-2 py-0.5 rounded ${
                      f.severity === "high"
                        ? "bg-red-100 text-red-700"
                        : f.severity === "medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>{f.impact}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What's a healthy blended rate?
            </h2>
            <p>There's no universal benchmark — it depends on your customer mix and transaction sizes:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                { profile: "US-only SaaS, domestic cards, avg transaction $50+", range: "2.9–3.1%" },
                { profile: "US-only SaaS with Stripe Billing", range: "3.6–4.5%" },
                { profile: "Mixed US/international, SaaS or subscriptions", range: "3.2–3.8%" },
                { profile: "Majority international customers", range: "4.0–5.0%+" },
                { profile: "Low average transaction value (under $20)", range: "4.0–6.0%+" },
              ].map((r) => (
                <li key={r.profile} className="flex items-baseline justify-between rounded-lg bg-gray-50 border border-gray-100 px-4 py-2 text-sm">
                  <span className="text-gray-600">{r.profile}</span>
                  <span className="font-semibold text-gray-900 ml-4 shrink-0 font-mono">{r.range}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              If your rate is above the expected range for your profile, something specific is
              driving it — usually international cards or small transactions. Both are identifiable
              from your Balance CSV.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Month-by-month tracking matters
            </h2>
            <p>
              Your blended rate isn't static. A spike in one month usually has a specific cause:
              a marketing campaign that drove international traffic, a product launch with small
              intro-priced transactions, or a batch of refunds.
            </p>
            <p className="mt-3">
              Tracking month-by-month lets you diagnose these spikes and respond — either by
              adjusting payment methods for affected customers, or at minimum understanding why
              your fees increased so you're not surprised at tax time.
            </p>
          </section>

        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
          <p className="font-semibold text-gray-900">Calculate your real blended rate</p>
          <p className="mt-1 text-sm text-gray-600">
            Upload your Stripe Balance CSV and get your blended rate, month-by-month breakdown,
            and per-transaction anomaly analysis in about 30 seconds. No account needed.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link href="/analyze" className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors text-center">
              Analyze My Fees
            </Link>
            <Link href="/analyze?sample=1" className="inline-block rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center">
              Try sample report →
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-sm font-semibold text-gray-700 mb-4">Related articles</p>
          <div className="space-y-3">
            {[
              { href: "/blog/why-stripe-effective-rate-higher-than-2-9-percent", title: "Why Is My Stripe Effective Rate Higher Than 2.9%?" },
              { href: "/blog/how-to-export-stripe-balance-csv", title: "How to Export Your Stripe Balance CSV" },
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
