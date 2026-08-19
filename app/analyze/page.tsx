import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppShellHeader } from "@/components/AppShellHeader";
import { AdvertiserIdentityBanner } from "@/components/AdvertiserIdentityBanner";
import { AnalyzeClient } from "./_components/AnalyzeClient";
import { AnalyzePageIntro } from "./_components/AnalyzePageIntro";

export const metadata: Metadata = {
  title: "Analyze Stripe Fees — Upload Balance CSV Free",
  description:
    "Upload your Stripe Balance CSV for a free fee audit: effective rate, international cards, refund leakage, and top fee drivers. No OAuth.",
  alternates: { canonical: "/analyze" },
};

export default async function AnalyzePage() {
  const t = await getTranslations("analyze");

  return (
    <main className="min-h-screen page-canvas">
      <AppShellHeader />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <AnalyzePageIntro />
        <p className="mt-2 text-sm text-gray-500">{t("metaTrust")}</p>

        <div className="mt-8">
          <AnalyzeClient />
        </div>

        <AdvertiserIdentityBanner variant="inline" className="mt-10" />
      </div>
    </main>
  );
}
