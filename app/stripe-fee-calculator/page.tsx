import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LocalizedSeoPage } from "@/components/marketing/LocalizedSeoPage";
import { seoPageMetadata, seoPageFaqJsonLd } from "@/lib/i18n/page-helpers";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { SeoPayPalCalculatorCallout } from "@/components/SeoPayPalCalculatorCallout";
import { StripeFeeMiniEstimate } from "@/components/stripe-fee-mini-estimate";

const pagePath = "/stripe-fee-calculator";

export async function generateMetadata(): Promise<Metadata> {
  return seoPageMetadata("stripeFeeCalculator", pagePath);
}

export default async function Page() {
  const t = await getTranslations("seo.stripeFeeCalculator");
  const faqJsonLd = await seoPageFaqJsonLd("stripeFeeCalculator");
  const breadcrumbCrumbs = sitePageBreadcrumbs(t("metaTitle"), pagePath);

  return (
    <MarketingShell>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />
      <LocalizedSeoPage
        contentKey="stripeFeeCalculator"
          relatedKey="feeCalculator"
      >
          <StripeFeeMiniEstimate />
          <SeoPayPalCalculatorCallout className="mt-8" />

      </LocalizedSeoPage>
    </MarketingShell>
  );
}
