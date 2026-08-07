import type { Metadata } from "next";
import { AppShellHeader } from "@/components/AppShellHeader";
import { AdvertiserIdentityBanner } from "@/components/AdvertiserIdentityBanner";
import { AnalyzeClient } from "./_components/AnalyzeClient";
import { AnalyzePageIntro } from "./_components/AnalyzePageIntro";

export const metadata: Metadata = {
  title: "Analyze My Stripe Fees — Fee Auditor",
  description:
    "Upload an itemized Stripe Balance CSV for a free fee-rate diagnosis. No OAuth. Raw CSV is not stored. Independent tool — not affiliated with Stripe.",
  alternates: { canonical: "/analyze" },
};

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <AppShellHeader />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <AnalyzePageIntro />
        <p className="mt-2 text-sm text-gray-500">
          No OAuth · raw CSV is not stored · independent tool
        </p>

        <div className="mt-8">
          <AnalyzeClient />
        </div>

        <AdvertiserIdentityBanner variant="inline" className="mt-10" />
      </div>
    </main>
  );
}
