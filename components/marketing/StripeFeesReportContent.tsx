import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoAnalyzeCta } from "@/components/SeoAnalyzeCta";
import { SeoPageTrustFooter } from "@/components/seo-page-trust-footer";
import { SeoRelatedReading } from "@/components/SeoRelatedReading";
import { getSeoRelated } from "@/lib/seo-related-reading";

type ReportAddsItem = { title: string; body: string };
type FaqItem = { q: string; a: string };

type StripeFeesReportCopy = {
  breadcrumb: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  dashboardTitle: string;
  dashboardItems: string[];
  reportAddsTitle: string;
  reportAddsItems: ReportAddsItem[];
  stepsTitle: string;
  step1Label: string;
  step1BeforeLink: string;
  step1LinkText: string;
  step1LinkHref: string;
  step1AfterLink: string;
  step2Label: string;
  step2BeforeLink: string;
  step2LinkText: string;
  step2LinkHref: string;
  step2AfterLink: string;
  step3Label: string;
  step3Body: string;
  faqTitle: string;
  faq: FaqItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimary: string;
};

type Props = {
  breadcrumbHome: string;
};

export async function StripeFeesReportContent({ breadcrumbHome }: Props) {
  const t = await getTranslations("seo.stripeFeesReport");
  const copy = {
    breadcrumb: t("breadcrumb"),
    eyebrow: t("eyebrow"),
    heroTitle: t("heroTitle"),
    heroDescription: t("heroDescription"),
    dashboardTitle: t("dashboardTitle"),
    dashboardItems: t.raw("dashboardItems") as string[],
    reportAddsTitle: t("reportAddsTitle"),
    reportAddsItems: t.raw("reportAddsItems") as ReportAddsItem[],
    stepsTitle: t("stepsTitle"),
    step1Label: t("step1Label"),
    step1BeforeLink: t("step1BeforeLink"),
    step1LinkText: t("step1LinkText"),
    step1LinkHref: t("step1LinkHref"),
    step1AfterLink: t("step1AfterLink"),
    step2Label: t("step2Label"),
    step2BeforeLink: t("step2BeforeLink"),
    step2LinkText: t("step2LinkText"),
    step2LinkHref: t("step2LinkHref"),
    step2AfterLink: t("step2AfterLink"),
    step3Label: t("step3Label"),
    step3Body: t("step3Body"),
    faqTitle: t("faqTitle"),
    faq: t.raw("faq") as FaqItem[],
    ctaTitle: t("ctaTitle"),
    ctaDescription: t("ctaDescription"),
    ctaPrimary: t("ctaPrimary"),
  } satisfies StripeFeesReportCopy;

  const relatedLinks = await getSeoRelated("feesReport");

  return (
    <>
      <Breadcrumbs items={[{ label: breadcrumbHome, href: "/" }, { label: copy.breadcrumb }]} className="mb-6" />

      <p className="text-sm font-medium text-blue-600">{copy.eyebrow}</p>
      <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900">{copy.heroTitle}</h1>
      <p className="mt-4 text-lg leading-relaxed text-gray-600">{copy.heroDescription}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{copy.dashboardTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {copy.dashboardItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-gray-400">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">{copy.reportAddsTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {copy.reportAddsItems.map((item) => (
              <li key={item.title}>
                <span className="font-medium text-gray-900">{item.title}</span>
                {" — "}
                {item.body}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900">{copy.stepsTitle}</h2>
        <ol className="mt-4 space-y-3 text-sm text-gray-600">
          <li>
            <span className="font-medium text-gray-900">{copy.step1Label}</span> —{" "}
            {copy.step1BeforeLink}
            <Link href={copy.step1LinkHref} className="text-blue-700 underline hover:text-blue-800">
              {copy.step1LinkText}
            </Link>
            {copy.step1AfterLink}
          </li>
          <li>
            <span className="font-medium text-gray-900">{copy.step2Label}</span> —{" "}
            {copy.step2BeforeLink}
            <Link href={copy.step2LinkHref} className="text-blue-700 underline hover:text-blue-800">
              {copy.step2LinkText}
            </Link>
            {copy.step2AfterLink}
          </li>
          <li>
            <span className="font-medium text-gray-900">{copy.step3Label}</span> — {copy.step3Body}
          </li>
        </ol>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{copy.faqTitle}</h2>
        {copy.faq.map((item) => (
          <div key={item.q} className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-medium text-gray-900">{item.q}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.a}</p>
          </div>
        ))}
      </section>

      <SeoAnalyzeCta
        className="mt-12 border border-blue-100"
        title={copy.ctaTitle}
        description={copy.ctaDescription}
        primaryLabel={copy.ctaPrimary}
        showSample
      />

      <SeoRelatedReading links={relatedLinks} className="mt-10" />
      <SeoPageTrustFooter />
    </>
  );
}

export async function stripeFeesReportMetadata() {
  const t = await getTranslations("seo.stripeFeesReport");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}
