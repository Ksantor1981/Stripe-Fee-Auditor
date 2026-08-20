import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppShellHeader } from "@/components/AppShellHeader";
import { AdvertiserIdentityBanner } from "@/components/AdvertiserIdentityBanner";
import { absoluteUrl } from "@/lib/site-url";
import { AnalyzeClient } from "./_components/AnalyzeClient";
import { AnalyzePageIntro } from "./_components/AnalyzePageIntro";

type Props = {
  searchParams: Promise<{ sample?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { sample } = await searchParams;
  const isSample = sample === "1" || sample === "true";
  return {
    title: "Stripe Fee Audit — Analyze Actual Fees from Balance CSV",
    description:
      "Analyze fees Stripe already charged from your Balance CSV. See effective rate, fee drivers, refunds, and international cards. For estimates, use the calculator.",
    alternates: { canonical: "/analyze" },
    robots: isSample
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function AnalyzePage() {
  const t = await getTranslations("analyze");
  const pageUrl = absoluteUrl("/analyze");
  const auditJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#audit`,
    name: "Stripe Fee Audit",
    description:
      "Analyze fees Stripe already charged from an itemized Balance CSV. This is not a published-price fee calculator.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Fee Auditor",
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Thing",
      name: "Stripe Balance CSV fee audit",
    },
  };

  return (
    <main className="min-h-screen page-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(auditJsonLd).replace(/</g, "\\u003c") }}
      />
      <AppShellHeader />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <AnalyzePageIntro />
        <p className="mt-2 text-sm text-gray-500">{t("metaTrust")}</p>
        <p className="mt-3 text-sm text-gray-600">
          {t("estimateFirst")}{" "}
          <Link href="/stripe-fee-calculator" className="font-medium text-blue-600 underline hover:text-blue-800">
            {t("estimateLink")}
          </Link>
          .
        </p>
        <p className="mt-2 text-sm text-gray-600">
          <Link href="/what-percent-does-stripe-take" className="font-medium text-blue-600 underline hover:text-blue-800">
            {t("relatedPercent")}
          </Link>
          <span className="px-2 text-gray-400">·</span>
          <Link href="/blog/stripe-credit-card-processing-fees" className="font-medium text-blue-600 underline hover:text-blue-800">
            {t("relatedArticle")}
          </Link>
        </p>

        <div className="mt-8">
          <AnalyzeClient />
        </div>

        <AdvertiserIdentityBanner variant="inline" className="mt-10" />
      </div>
    </main>
  );
}
