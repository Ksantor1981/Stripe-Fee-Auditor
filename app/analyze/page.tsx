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
        <h1 className="text-2xl font-bold text-gray-900">See your real Stripe fee rate</h1>
        <p className="mt-2 text-sm text-gray-500">
          Free diagnosis · no OAuth · raw CSV is not stored. Two paths below — sample first if you
          don&apos;t have a file yet.
        </p>
        <AdvertiserIdentityBanner variant="inline" className="mt-3" />

        <div className="mt-8">
          <AnalyzeClient />
        </div>
      </div>
    </main>
  );
}
