import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LocalizedSeoPage } from "@/components/marketing/LocalizedSeoPage";
import { seoPageMetadata, seoPageFaqJsonLd } from "@/lib/i18n/page-helpers";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";

const pagePath = "/compare-stripe-paypal-wise";

export async function generateMetadata(): Promise<Metadata> {
  return seoPageMetadata("comparePaypal", pagePath);
}

export default async function Page() {
  const t = await getTranslations("seo.comparePaypal");
  const faqJsonLd = await seoPageFaqJsonLd("comparePaypal");
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
        contentKey="comparePaypal"
      >
      </LocalizedSeoPage>
    </MarketingShell>
  );
}
