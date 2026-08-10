import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LocalizedSeoPage } from "@/components/marketing/LocalizedSeoPage";
import { seoPageMetadata, seoPageFaqJsonLd } from "@/lib/i18n/page-helpers";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
import { MonitorPaymentStatusPanel } from "@/components/monitor/MonitorPaymentStatusPanel";

const pagePath = "/monitor";

export async function generateMetadata(): Promise<Metadata> {
  return seoPageMetadata("monitor", pagePath);
}

type PageProps = {
  searchParams: Promise<{ payment?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { payment } = await searchParams;
  const t = await getTranslations("seo.monitor");
  const faqJsonLd = await seoPageFaqJsonLd("monitor");
  const breadcrumbCrumbs = sitePageBreadcrumbs(t("metaTitle"), pagePath);
  const paymentPanel =
    payment === "success" ? (
      <MonitorPaymentStatusPanel status="success" />
    ) : payment === "pending" ? (
      <MonitorPaymentStatusPanel status="pending" />
    ) : null;

  return (
    <MarketingShell>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />
      <LocalizedSeoPage contentKey="monitor">{paymentPanel}</LocalizedSeoPage>
    </MarketingShell>
  );
}
