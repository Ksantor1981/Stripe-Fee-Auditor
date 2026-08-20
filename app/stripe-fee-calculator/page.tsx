import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LocalizedSeoPage } from "@/components/marketing/LocalizedSeoPage";
import { seoPageMetadata, seoPageFaqJsonLd } from "@/lib/i18n/page-helpers";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { SeoPayPalCalculatorCallout } from "@/components/SeoPayPalCalculatorCallout";
import { StripeFeeMiniEstimate } from "@/components/stripe-fee-mini-estimate";
import { absoluteUrl } from "@/lib/site-url";

const pagePath = "/stripe-fee-calculator";
const RATES_CHECKED = "2026-08-19";

export async function generateMetadata(): Promise<Metadata> {
  return seoPageMetadata("stripeFeeCalculator", pagePath);
}

export default async function Page() {
  const t = await getTranslations("seo.stripeFeeCalculator");
  const faqJsonLd = await seoPageFaqJsonLd("stripeFeeCalculator");
  const breadcrumbCrumbs = sitePageBreadcrumbs(t("metaTitle"), pagePath);
  const pageUrl = absoluteUrl(pagePath);
  const howto = (t.raw("howto") as { name?: string; steps?: { name: string; text: string }[] } | undefined) ?? null;
  const calculatorJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#calculator`,
    name: t("heroTitle"),
    description: t("metaDescription"),
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Fee Auditor",
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Thing",
      name: "Stripe processing fee calculator",
    },
  };
  const howToJsonLd =
    howto?.name && Array.isArray(howto.steps) && howto.steps.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "@id": `${pageUrl}#howto`,
          name: howto.name,
          description: t("metaDescription"),
          url: pageUrl,
          step: howto.steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.name,
            text: step.text,
          })),
        }
      : null;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: t("heroTitle"),
    description: t("metaDescription"),
    datePublished: "2026-06-25",
    dateModified: RATES_CHECKED,
    author: { "@type": "Person", name: "Konstantin Starkov" },
    publisher: { "@type": "Organization", name: "Stripe Fee Auditor", url: absoluteUrl("/") },
    mainEntityOfPage: pageUrl,
  };

  return (
    <MarketingShell>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorJsonLd).replace(/</g, "\\u003c") }}
      />
      {howToJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />
      <LocalizedSeoPage
        contentKey="stripeFeeCalculator"
        relatedKey="feeCalculator"
      >
        <StripeFeeMiniEstimate />
        <SeoPayPalCalculatorCallout className="mt-8" hideStripeCalculatorLink />
      </LocalizedSeoPage>
    </MarketingShell>
  );
}
