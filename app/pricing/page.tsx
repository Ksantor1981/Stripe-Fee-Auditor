import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import { TrackedLink } from "@/components/TrackedLink";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    alternates: { canonical: "/pricing" },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/pricing",
      type: "website",
    },
  };
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");
  const auditFeatures = [t("auditFeature1"), t("auditFeature2"), t("auditFeature3")];

  return (
    <MarketingShell>
      <section className="mx-auto max-w-lg px-4 py-14 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">{t("heroTitle")}</h1>
        <p className="mt-3 text-base text-gray-600">{t("heroDescription")}</p>

        <div className="mt-8 rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-6 text-left shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            {t("auditLabel")}
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{t("auditPrice")}</p>
          <ul className="mt-4 space-y-2 text-base text-gray-700">
            {auditFeatures.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("monitorLabel")}</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{t("monitorTitle")}</p>
          <p className="mt-2 text-base text-gray-600">{t("monitorBody")}</p>
          <Link href="/monitor" className="mt-4 inline-flex text-base font-semibold text-blue-600 hover:underline">
            {t("monitorLink")}
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-left">
          <h2 className="text-xl font-bold text-gray-900">{t("purposeTitle")}</h2>
          <p className="mt-3 text-base leading-relaxed text-gray-600">{t("purposeBody1")}</p>
          <p className="mt-3 text-base leading-relaxed text-gray-600">{t("purposeBody2")}</p>
        </section>

        <TrackedLink
          href="/analyze"
          utm={{ source: "pricing", medium: "cta", campaign: "pricing_upload" }}
          funnelEvent="funnel_landing_cta"
          funnelProps={{ placement: "pricing_page" }}
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow transition-colors hover:bg-blue-700"
        >
          {t("uploadCta")}
        </TrackedLink>
      </section>
    </MarketingShell>
  );
}
