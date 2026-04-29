import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Reduce Your Stripe Fees — Stripe Fee Auditor",
  description:
    "Practical tactics to lower your Stripe effective fee rate: negotiate custom pricing, reduce disputes, optimize currency settings, and more.",
};

export default function BlogPost2() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">
          How to Reduce Your Stripe Fees
        </h1>
        <p className="mt-3 text-gray-500 text-sm">7 min read · Optimization</p>

        <div className="mt-8 space-y-5 text-base text-gray-700 leading-relaxed">
          <p>
            Stripe&apos;s standard rate is 2.9% + $0.30 per transaction, but your <em>effective</em> rate
            — what you actually pay — can be significantly higher. Here&apos;s how to bring it down.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Negotiate Custom Pricing</h2>
          <p>
            Once you&apos;re processing over $80,000/month, Stripe will discuss custom rates.
            Contact your account manager or reach out at stripe.com/contact/sales.
            Even a 0.2% reduction on $100K/month saves $200 every month.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Increase Average Transaction Value</h2>
          <p>
            The $0.30 fixed component hurts small transactions most. Consider bundling products,
            offering annual plans instead of monthly, or setting a minimum order value.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Reduce Disputes</h2>
          <p>
            Enable Stripe Radar rules to block suspicious transactions before they become disputes.
            Use clear billing descriptors. Each avoided dispute saves $15 + potential refund costs.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Optimize Currency Settings</h2>
          <p>
            If you sell in multiple countries, consider enabling local payment methods via Stripe
            to avoid currency conversion fees (1% per transaction).
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Use ACH for High-Value B2B Payments</h2>
          <p>
            ACH bank transfers via Stripe cost 0.8% (capped at $5). For invoices over $1,000,
            this is 70–80% cheaper than card processing.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">First: Know Your Baseline</h2>
          <p>
            Before optimizing, you need to know your current effective rate and which transactions
            are costing the most. Upload your Stripe Balance CSV to{" "}
            <Link href="/" className="text-blue-600 underline">Stripe Fee Auditor</Link> for a
            free breakdown.
          </p>
        </div>

        <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 text-center">
          <p className="font-semibold text-gray-900 mb-2">See your current effective fee rate in 30 seconds</p>
          <Link href="/analyze" className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Analyze My Fees →
          </Link>
        </div>
      </div>
    </main>
  );
}
