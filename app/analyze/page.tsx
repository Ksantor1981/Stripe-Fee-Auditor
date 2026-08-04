import type { Metadata } from "next";
import Link from "next/link";
import { AdvertiserIdentityBanner } from "@/components/AdvertiserIdentityBanner";
import { AnalyzeClient } from "./_components/AnalyzeClient";

export const metadata: Metadata = {
  title: "Analyze My Stripe Fees — Fee Auditor",
  description:
    "Upload an itemized Stripe Balance CSV for a free fee-rate diagnosis in about 60 seconds. No OAuth. Raw CSV is not stored. Independent tool — not affiliated with Stripe.",
  alternates: { canonical: "/analyze" },
};

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            ← Back
          </Link>
          <span className="text-sm font-semibold text-gray-900">
            Fee Auditor
            <span className="ml-1.5 font-normal text-gray-500">feeauditor.com</span>
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <AdvertiserIdentityBanner className="mb-6" />
        <h1 className="text-2xl font-bold text-gray-900">Analyze Your Stripe Fees</h1>
        <p className="mt-2 text-sm text-gray-500">
          Free diagnosis first: your effective rate and one concrete fee driver. Independent tool — we
          are not Stripe support and do not connect via OAuth.
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            What to upload · ~60 seconds
          </p>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>
              <span className="font-medium text-gray-900">File:</span> itemized Stripe{" "}
              <strong>Balance</strong> CSV (not Summary, not Payments, not Payouts-only).
            </li>
            <li>
              <span className="font-medium text-gray-900">Path:</span> Dashboard → Reports → Balance
              summary → Export → <strong>Itemized</strong> → Download to system.
            </li>
            <li>
              <span className="font-medium text-gray-900">Trust:</span> no OAuth, no API keys. Raw CSV
              is not stored — we keep only redacted calculated results.
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            Need screenshots?{" "}
            <a href="#export-steps" className="font-medium text-blue-600 hover:underline">
              Export steps on this page
            </a>
            {" · "}
            <Link href="/stripe-balance-csv" className="font-medium text-blue-600 hover:underline">
              Quick export guide
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <AnalyzeClient />
        </div>
      </div>
    </main>
  );
}
