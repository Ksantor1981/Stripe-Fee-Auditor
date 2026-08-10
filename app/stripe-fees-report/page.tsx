import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { MarketingShell } from "@/components/MarketingShell";
import {
  StripeFeesReportContent,
  stripeFeesReportMetadata,
} from "@/components/marketing/StripeFeesReportContent";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pagePath = "/stripe-fees-report";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await stripeFeesReportMetadata();
  return {
    title: `${title} | Fee Auditor`,
    description,
    keywords: [
      "Stripe fees report",
      "Stripe fee report",
      "Stripe processing fees report",
      "Stripe Balance report",
      "Stripe effective rate report",
      "Stripe fee breakdown report",
      "Stripe transaction fee report",
      "Stripe export transactions",
    ],
    alternates: { canonical: pagePath },
    openGraph: {
      title,
      description,
      url: pagePath,
      siteName: "Stripe Fee Auditor",
      type: "article",
    },
    twitter: { card: "summary", title, description },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function StripeFeesReportPage() {
  const meta = await stripeFeesReportMetadata();
  const tb = await getTranslations("breadcrumbs");
  const faq = await getTranslations("seo.stripeFeesReport");
  const faqItems = faq.raw("faq") as { q: string; a: string }[];

  const absPage = absoluteUrl(pagePath);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      headline: meta.title,
      description: meta.description,
      url: absPage,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  const breadcrumbCrumbs = sitePageBreadcrumbs(meta.title, pagePath);

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <StripeFeesReportContent breadcrumbHome={tb("home")} />
      </main>
    </MarketingShell>
  );
}
