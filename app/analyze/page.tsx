import type { Metadata } from "next";
import Link from "next/link";
import { AnalyzeClient } from "./_components/AnalyzeClient";

export const metadata: Metadata = {
  title: "Analyze My Stripe Fees — Stripe Fee Auditor",
  description: "Upload your Stripe Balance CSV and usually see your real fee rate in under 30 seconds.",
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
          <span className="text-sm font-semibold text-gray-900">Stripe Fee Auditor</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Analyze Your Stripe Fees</h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload your Stripe Balance CSV to see your effective fee rate and top cost drivers.
        </p>
        <div className="mt-8">
          <AnalyzeClient />
        </div>
      </div>
    </main>
  );
}
