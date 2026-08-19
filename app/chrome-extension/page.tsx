import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import {
  CHROME_EXTENSION_STORE_URL,
  hasChromeWebStoreDetailUrl,
} from "@/lib/chrome-extension";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pagePath = "/chrome-extension";

export async function generateMetadata() {
  const t = await getTranslations("chromeExtension");
  const pageTitle = t("metaTitle");
  const pageDescription = t("metaDescription");
  const ogImage = buildOgImageUrl({
    title: "Stripe Fee Auditor Chrome Extension",
    eyebrow: "CSV helper · no OAuth",
  });

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      "Stripe Fee Auditor Chrome extension",
      "Stripe Balance CSV Chrome extension",
      "Stripe fee Chrome extension",
      "Stripe CSV export helper",
      "Stripe fee monitor extension",
    ],
    alternates: { canonical: pagePath },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pagePath,
      siteName: "Stripe Fee Auditor",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Stripe Fee Auditor Chrome Extension" }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
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

export default async function ChromeExtensionPage() {
  const t = await getTranslations("chromeExtension");
  const detailUrl = hasChromeWebStoreDetailUrl();

  const features = [
    { step: "1", title: t("feature1Title"), body: t("feature1Body") },
    { step: "2", title: t("feature2Title"), body: t("feature2Body") },
    { step: "3", title: t("feature3Title"), body: t("feature3Body") },
  ];

  const privacyPoints = [
    t("privacy1"),
    t("privacy2"),
    t("privacy3"),
    t("privacy4"),
    t("privacy5"),
  ];

  const pageDescription = t("metaDescription");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("metaTitle"),
    url: absoluteUrl("/chrome-extension"),
    description: pageDescription,
    isPartOf: {
      "@type": "WebSite",
      name: "Fee Auditor",
      url: absoluteUrl("/"),
    },
  };

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">{t("heroTitle")}</h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">{t("heroDescription")}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={CHROME_EXTENSION_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {detailUrl ? t("installCta") : t("installPending")}
          </a>
          <a
            href="https://github.com/Ksantor1981/Stripe-Fee-Auditor/tree/master/chrome-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {t("viewSource")}
          </a>
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900">{t("featuresHeading")}</h2>
          <ol className="mt-4 space-y-4">
            {features.map((f) => (
              <li key={f.step} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {f.step}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{f.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">{t("privacyHeading")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {privacyPoints.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-lg font-bold text-gray-900">{t("webAppHeading")}</h2>
          <p className="mt-2 text-sm text-gray-600">{t("webAppBody")}</p>
          <Link
            href="/analyze"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {t("webAppCta")}
          </Link>
        </section>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-lg font-semibold text-gray-900">When the Chrome helper is useful</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Use the helper when you already work in Stripe Dashboard and want a shorter path to the
            correct Balance export and FeeAuditor upload. It does not replace the web report or run
            a background Stripe integration; the CSV audit still starts only when you choose a file.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            If you prefer not to install an extension, use the web app directly. Both paths keep the
            same no-OAuth workflow and the same analysis of effective rate, fee drivers, and costly rows.
          </p>
        </section>

        <section className="mt-12 rounded-2xl bg-gray-900 px-6 py-8 text-center text-white">
          <h2 className="text-xl font-bold">{t("finalCtaTitle")}</h2>
          <p className="mt-2 text-sm text-gray-300">{t("finalCtaBody")}</p>
          <a
            href={CHROME_EXTENSION_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            {detailUrl ? t("installCta") : t("installPending")}
          </a>
          <p className="mt-4 text-xs text-gray-400">{t("githubNote")}</p>
        </section>
      </main>
    </MarketingShell>
  );
}
