import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const TRUST_SIGNALS = [
  { icon: "🗑️", label: "CSV file is not stored" },
  { icon: "🔒", label: "No account required" },
  { icon: "⚡", label: "Results in 30 seconds" },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Export your CSV",
    body: "Go to Stripe Dashboard → Reporting → Balance → Download. Takes 30 seconds.",
  },
  {
    step: "2",
    title: "Drop it here",
    body: "Upload your CSV — your file is processed securely and deleted within 1 hour.",
  },
  {
    step: "3",
    title: "See your real rate",
    body: "Get effective fee rate, top cost drivers, anomalies, and month-over-month trends.",
  },
];

const METRICS = [
  { label: "Effective fee rate", example: "3.24%", desc: "Weighted avg across all charges" },
  { label: "Fee vs last period", example: "+$412", desc: "Month-over-month delta" },
  { label: "Anomaly count", example: "7 charges", desc: "Transactions >2σ above avg rate" },
  { label: "Top fee driver", example: "Intl cards", desc: "Category costing you the most" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-bold text-gray-900 text-lg">Stripe Fee Auditor</span>
        <Link
          href="/analyze"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Analyze My Fees
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          No account · No data stored · Free to start
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl leading-tight">
          See Your Real{" "}
          <span className="text-blue-600">Stripe Fee Rate</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-gray-500 leading-relaxed">
          Upload your Stripe Balance CSV and instantly see your effective fee rate,
          fee drivers, anomalies, and month-over-month trends.
        </p>
        <Link
          href="/analyze"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
        >
          Analyze My Fees
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Trust signals */}
        <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-gray-400">
          {TRUST_SIGNALS.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics preview */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            What you&apos;ll discover
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map(({ label, example, desc }) => (
              <div key={label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{example}</p>
                <p className="text-xs text-gray-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-1.5 font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-xs text-gray-400 space-y-2">
        <p>
          Stripe Fee Auditor is not affiliated with Stripe, Inc.{" "}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {" · "}
          <Link href="/refund" className="underline hover:text-gray-600">Refund Policy</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <Link href="/stripe-fee-calculator" className="hover:underline">Stripe fee calculator</Link>
          <span>·</span>
          <Link href="/stripe-balance-csv" className="hover:underline">Stripe Balance CSV</Link>
          <span>·</span>
          <Link href="/why-stripe-fee-rate-higher-than-2-9" className="hover:underline">Why fees exceed 2.9%</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <Link href="/blog/why-stripe-fees-increase" className="hover:underline">Why Stripe fees increase</Link>
          <span>·</span>
          <Link href="/blog/how-to-reduce-stripe-fees" className="hover:underline">How to reduce fees</Link>
          <span>·</span>
          <Link href="/blog/stripe-effective-fee-rate-explained" className="hover:underline">Fee rate explained</Link>
        </p>
      </footer>
    </main>
  );
}
