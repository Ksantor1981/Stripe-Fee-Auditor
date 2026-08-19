import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LocalizedSeoPage } from "@/components/marketing/LocalizedSeoPage";
import { seoPageMetadata, seoPageFaqJsonLd } from "@/lib/i18n/page-helpers";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const pagePath = "/what-percent-does-stripe-take";
const RATES_CHECKED = "2026-08-19";

export async function generateMetadata(): Promise<Metadata> {
  return seoPageMetadata("whatPercent", pagePath);
}

export default async function Page() {
  const t = await getTranslations("seo.whatPercent");
  const faqJsonLd = await seoPageFaqJsonLd("whatPercent");
  const breadcrumbCrumbs = sitePageBreadcrumbs(t("metaTitle"), pagePath);
  const pageUrl = absoluteUrl(pagePath);
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />
      <LocalizedSeoPage
        contentKey="whatPercent"
        relatedKey="percentTake"
      >
      </LocalizedSeoPage>
    </MarketingShell>
  );
}
