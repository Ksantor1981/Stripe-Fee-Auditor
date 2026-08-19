import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SeoAnalyzeCta } from "@/components/SeoAnalyzeCta";
import { SeoPageTrustFooter } from "@/components/seo-page-trust-footer";
import { SeoRelatedReading } from "@/components/SeoRelatedReading";
import { ComparisonHeroActions, SeoSectionsRenderer } from "@/components/marketing/SeoSectionsRenderer";
import { getSeoRelated, type SeoRelatedKey } from "@/lib/seo-related-reading";

type FaqItem = { q: string; a: string };
type CtaCopy = { title: string; description: string; primaryLabel: string };

type Props = {
  contentKey: string;
  relatedKey?: SeoRelatedKey;
  variant?: "default" | "comparison";
  ctaCampaign?: string;
  children?: React.ReactNode;
};

export async function LocalizedSeoPage({
  contentKey,
  relatedKey,
  variant = "default",
  ctaCampaign = contentKey,
  children,
}: Props) {
  const t = await getTranslations(`seo.${contentKey}`);
  const tb = await getTranslations("breadcrumbs");
  const ts = await getTranslations("seoShell");
  const sectionLabels = {
    useCase: ts("comparisonUseCase"),
    alternative: ts("comparisonAlternative"),
    decision: ts("comparisonDecision"),
    goodFit: ts("comparisonGoodFit"),
    poorFit: ts("comparisonPoorFit"),
    auditCsv: ts("comparisonAuditCsv"),
    quickEstimate: ts("comparisonQuickEstimate"),
  };
  const sections = (t.raw("sections") as Record<string, unknown>[] | undefined) ?? [];
  const faq = (t.raw("faq") as FaqItem[] | undefined) ?? [];
  const cta = t.raw("cta") as CtaCopy | undefined;
  const relatedLinks = relatedKey ? await getSeoRelated(relatedKey) : null;

  const maxWidth = variant === "comparison" ? "max-w-5xl" : "max-w-3xl";

  return (
    <main className={`mx-auto ${maxWidth} px-6 py-16`}>
      <Breadcrumbs
        items={[{ label: tb("home"), href: "/" }, { label: t("breadcrumb") }]}
        className="mb-6"
      />

      {variant === "comparison" ? (
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center mb-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">{t("eyebrow")}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">{t("heroDescription")}</p>
            <ComparisonHeroActions ctaCampaign={ctaCampaign} labels={sectionLabels} />
          </div>
          {sections[0]?.type === "heroCard" ? (
            <div>{sections.slice(0, 1).map((s, i) => <SeoSectionsRenderer key={i} sections={[s]} labels={sectionLabels} />)}</div>
          ) : null}
        </section>
      ) : (
        <div className="mb-14">
          <p className="text-blue-600 text-sm font-medium mb-3">{t("eyebrow")}</p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{t("heroTitle")}</h1>
          <p className="text-lg text-gray-500 leading-relaxed">{t("heroDescription")}</p>
        </div>
      )}

      {children}

      <SeoSectionsRenderer
        sections={variant === "comparison" && sections[0]?.type === "heroCard" ? sections.slice(1) : sections}
        labels={sectionLabels}
      />

      {faq.length > 0 ? (
        <div className="mb-14 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{ts("faqHeading")}</h2>
          {faq.map((item) => (
            <div key={item.q} className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 text-sm mb-1">{item.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      ) : null}

      {cta ? (
        <SeoAnalyzeCta
          className="border border-blue-100"
          title={cta.title}
          description={cta.description}
          primaryLabel={cta.primaryLabel}
        />
      ) : (
        <SeoAnalyzeCta className="border border-blue-100" />
      )}

      {relatedLinks ? <SeoRelatedReading links={relatedLinks} className="mt-10" /> : null}
      <SeoPageTrustFooter />
    </main>
  );
}
