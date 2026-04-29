import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Is Your Stripe Effective Fee Rate? — Stripe Fee Auditor",
  description:
    "Your effective Stripe fee rate is the true percentage of revenue you pay to Stripe. Learn how to calculate it and what a good rate looks like.",
};

export default function BlogPost3() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 leading-tight">
          What Is Your Stripe Effective Fee Rate?
        </h1>
        <p className="mt-3 text-gray-500 text-sm">4 min read · Fundamentals</p>

        <div className="mt-8 space-y-5 text-base text-gray-700 leading-relaxed">
          <p>
            Stripe advertises 2.9% + $0.30 per transaction. But what you actually pay —
            your <strong>effective fee rate</strong> — is almost always different, and usually higher.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">How to Calculate It</h2>
          <p>
            Effective fee rate = total fees paid ÷ total charge volume × 100
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm">
            <p>Total fees: $1,240</p>
            <p>Total volume: $38,500</p>
            <p>Effective rate: $1,240 / $38,500 = <strong>3.22%</strong></p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">What&apos;s a Good Effective Rate?</h2>
          <p>
            For US-only domestic transactions with an average order value of $50+,
            a rate of 3.0–3.3% is typical. Higher than 3.5% usually means there&apos;s
            something to investigate — international cards, disputes, or small transaction sizes.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Why It&apos;s Higher Than 2.9%</h2>
          <p>
            Several factors push the rate above the advertised 2.9%:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>The $0.30 fixed fee adds ~0.3% on a $100 average order</li>
            <li>International cards add 1.5%</li>
            <li>Currency conversion adds 1%</li>
            <li>Disputes cost $15 each</li>
            <li>Refunds don&apos;t return the original processing fee</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Track It Monthly</h2>
          <p>
            The effective rate can shift month to month based on your customer mix.
            Tracking it helps you catch problems early — like a sudden influx of international
            traffic, or a disputed batch of transactions.
          </p>
        </div>

        <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 text-center">
          <p className="font-semibold text-gray-900 mb-2">Calculate your effective rate instantly</p>
          <Link href="/analyze" className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Analyze My Fees — Free →
          </Link>
        </div>
      </div>
    </main>
  );
}
