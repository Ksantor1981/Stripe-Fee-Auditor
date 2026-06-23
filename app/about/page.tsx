import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/LandingNav";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who built Stripe Fee Auditor, why it exists, and what data we store (and do not store) when you upload a Stripe Balance CSV.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNav />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">About Stripe Fee Auditor</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">
          Stripe Fee Auditor is an independent tool that helps founders and finance teams understand
          their real Stripe processing and all-in cost rates from a Balance Transactions CSV — without
          connecting Stripe OAuth or sharing API keys.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Why it exists</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Stripe&apos;s advertised 2.9% + $0.30 is only part of the story. International cards,
            small charges, refunds, disputes, and add-on services push the blended rate higher — often
            without a clear dashboard view. This tool turns your exported Balance data into a readable
            audit: processing rate, all-in cost, monthly trends, high-fee charges, and directional
            savings ideas.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Privacy &amp; data handling</h2>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 leading-relaxed">
            <li>
              <strong>No Stripe API access.</strong> You export CSV from the Stripe Dashboard and
              upload it once for analysis.
            </li>
            <li>
              <strong>Raw CSV is not stored as a file.</strong> We parse it in memory, compute
              aggregates, and discard the upload body.
            </li>
            <li>
              <strong>Computed report JSON</strong> (totals, rates, categorized rows) is stored so
              you can reopen your private link. Customer description fields are redacted before storage.
            </li>
            <li>
              <strong>USD accounts first.</strong> Beta supports USD Balance exports; multi-currency
              support is on the roadmap.
            </li>
          </ul>
          <p className="text-sm text-gray-600">
            Details:{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Independence</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Stripe Fee Auditor is not affiliated with Stripe, Inc. We do not receive referral fees
            from Stripe for recommendations in reports. Action links point to Stripe Dashboard pages
            so you can verify settings yourself.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/analyze"
            className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Analyze my fees →
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
