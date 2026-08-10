import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LocalizedSeoPage } from "@/components/marketing/LocalizedSeoPage";
import { seoPageMetadata, seoPageFaqJsonLd } from "@/lib/i18n/page-helpers";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { AdvertiserIdentityBanner } from "@/components/AdvertiserIdentityBanner";

const pagePath = "/why-stripe-fee-rate-higher-than-2-9";

export async function generateMetadata(): Promise<Metadata> {
  return seoPageMetadata("whyHigher", pagePath);
}

export default async function Page() {
  const t = await getTranslations("seo.whyHigher");
  const faqJsonLd = await seoPageFaqJsonLd("whyHigher");
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
        contentKey="whyHigher"
          relatedKey="whyHigher"
      >
          <AdvertiserIdentityBanner />

      </LocalizedSeoPage>
    </MarketingShell>
  );
}
