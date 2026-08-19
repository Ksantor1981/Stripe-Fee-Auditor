import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "Free Stripe Fee Audit - FeeAuditor Pricing",
  description:
    "FeeAuditor is currently free. Upload a Stripe Balance CSV for a complete fee audit with no signup and no credit card.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Free Stripe Fee Audit - $0",
    description: "Complete Stripe fee audit. No signup. No credit card.",
    url: "/pricing",
    type: "website",
  },
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-lg px-4 py-14 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Free Stripe Fee Audit
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">FeeAuditor is currently free.</h1>
        <p className="mt-3 text-base text-gray-600">
          Upload your Stripe Balance CSV and get the complete existing report. No preview tier,
          signup, card, or checkout.
        </p>

        <div className="mt-8 rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-6 text-left shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Full Stripe fee audit
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">$0</p>
          <ul className="mt-4 space-y-2 text-base text-gray-700">
            <li>Complete fee totals, effective rate, and cost drivers</li>
            <li>High-cost transactions, anomalies, and recommended checks</li>
            <li>CSV and print export with a private 30-day report link</li>
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">In development</p>
          <p className="mt-1 text-xl font-bold text-gray-900">Automatic cost monitoring</p>
          <p className="mt-2 text-base text-gray-600">
            We are measuring demand for automatic rate-change alerts and a multi-company CFO
            workflow. These are not paid products yet.
          </p>
          <Link href="/monitor" className="mt-4 inline-flex text-base font-semibold text-blue-600 hover:underline">
            Join early access
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-left">
          <h2 className="text-xl font-bold text-gray-900">What the free audit is for</h2>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            FeeAuditor compares charge volume with processing fees and other Stripe fee lines. It
            highlights effective rate, monthly movement, unusually expensive transactions, refund
            drag, fixed-fee pressure, and cost categories worth checking in Stripe Dashboard.
          </p>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            The report is diagnostic, not accounting or tax advice, and savings are directional -
            verify pricing and account settings with Stripe before changing payment flows. The free
            phase helps us learn which findings are useful before automatic monitoring is built.
          </p>
        </section>

        <TrackedLink
          href="/analyze"
          utm={{ source: "pricing", medium: "cta", campaign: "pricing_upload" }}
          funnelEvent="funnel_landing_cta"
          funnelProps={{ placement: "pricing_page" }}
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow transition-colors hover:bg-blue-700"
        >
          Analyze My Stripe Fees - Free
        </TrackedLink>
      </section>
    </MarketingShell>
  );
}
