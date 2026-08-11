import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LANDING_FAQ_HOME_IDS } from "@/components/LandingFaq";
import { LandingNavHydrate, LANDING_NAV_ROOT_ID } from "@/components/LandingNavHydrate";
import { LandingNavShell } from "@/components/LandingNavShell";
import { LandingTrustStrip } from "@/components/LandingTrustStrip";
import { FunnelAnchor } from "@/components/FunnelAnchor";
import { FunnelClickDelegate } from "@/components/FunnelClickDelegate";
import { SiteFooter } from "@/components/SiteFooter";
import { ChromeExtensionInstallCta } from "@/components/ChromeExtensionInstallCta";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const LandingFaq = dynamic(
  () => import("@/components/LandingFaq").then((mod) => ({ default: mod.LandingFaq })),
  {
    loading: () => (
      <div className="mx-auto max-w-3xl h-56 animate-pulse rounded-xl bg-gray-100" aria-hidden />
    ),
  }
);

const LandingSampleTabs = dynamic(
  () => import("@/components/LandingSampleTabs").then((mod) => ({ default: mod.LandingSampleTabs })),
  {
    loading: () => (
      <div className="mx-auto max-w-5xl h-96 animate-pulse rounded-2xl bg-gray-200/80" aria-hidden />
    ),
  }
);

const HOME_TITLE = "Free Stripe Fee Auditor — See Your Real Effective Rate";
const HOME_DESCRIPTION =
  "Upload your Stripe Balance CSV. See effective rate, international-card uplift, refund fee drag, and other fee drivers. Free diagnosis, no signup, no OAuth. Raw CSV is not stored.";
const HOME_OG_IMAGE = buildOgImageUrl({
  title: "See your real Stripe effective rate",
  eyebrow: "Fee Auditor · free diagnosis",
});

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "https://feeauditor.com",
    type: "website",
    images: [{ url: HOME_OG_IMAGE, width: 1200, height: 630, alt: "Stripe Fee Auditor real fee rate report" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [HOME_OG_IMAGE],
  },
};

const reportsAnalyzedCount = Number(process.env.NEXT_PUBLIC_REPORTS_ANALYZED_COUNT ?? 0);
const hasReportsAnalyzedCount = Number.isFinite(reportsAnalyzedCount) && reportsAnalyzedCount > 0;
const reportsAnalyzedLabel = new Intl.NumberFormat("en-US").format(reportsAnalyzedCount);

const FAQ_JSON_LD_ITEMS = [
  {
    q: "Is Fee Auditor useful for my business?",
    text: [
      "Useful if you have international cards, refunds, small subscriptions, or a Stripe rate that feels higher than expected. Skip if you only have a few domestic high-ticket charges and just need a rough spreadsheet formula.",
    ],
  },
  {
    q: "Do you store my Stripe CSV file?",
    text: [
      "No. Your browser reads the file for upload preview, then sends it once to our servers for analysis. We store computed numbers and aggregates (rates, totals, grouped categories) — not the raw CSV as a file.",
      "Transaction IDs may appear in your private report so you can match rows to Stripe; free-text descriptions from the export are stripped before long-term storage where possible.",
    ],
  },
  {
    q: "Does Stripe Fee Auditor connect to my Stripe account?",
    text: [
      "No API connection and no OAuth. You export a CSV from the Stripe Dashboard and upload it here — same data you could open in a spreadsheet, without granting third-party access to your live account.",
    ],
  },
  {
    q: "Who can see my report?",
    text: [
      "Only someone with your private link (including the access token in the URL). Treat it like a password: don't share it in public channels. Reports expire automatically based on our retention policy.",
    ],
  },
  {
    q: "Are the benchmarks and savings numbers guaranteed?",
    text: [
      "No. They are directional estimates built from your export using simplified rules, not Stripe's internal ledger. Use them to spot patterns and questions for your finance team — not as contractual fee quotes.",
    ],
  },
  {
    q: "Is the $12 full report worth it after beta?",
    text: [
      "It depends on your volume. If you process only a few small payments, the preview or a spreadsheet may be enough. If you process meaningful monthly volume, have international customers, refunds, or many low-ticket charges, the full report is designed to show the rows and actions behind the headline rate.",
    ],
  },
  {
    q: "Can I calculate this myself in Excel?",
    text: [
      "Yes. The basic blended rate is total charge fees divided by total charge volume. Fee Auditor is useful when you want monthly changes, high-fee charges, refund fee leakage, benchmark context, exports, and specific savings opportunities without rebuilding the spreadsheet every time.",
    ],
  },
  {
    q: "How is this different from a Stripe fee calculator?",
    text: [
      "A fee calculator estimates what Stripe might charge from public pricing and assumptions. Stripe Fee Auditor checks what you actually paid by analyzing an itemized Stripe Balance CSV, including refunds, other fee lines, card mix, monthly changes, and unusual transactions.",
    ],
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_JSON_LD_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.text.join(" "),
    },
  })),
};

const SOFTWARE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Stripe Fee Auditor",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: absoluteUrl("/"),
  description: HOME_DESCRIPTION,
  offers: [
    {
      "@type": "Offer",
      name: "Full report",
      price: "12",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Fee Monitor",
      price: "9",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "9",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
    },
  ],
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fee Auditor",
  alternateName: ["Stripe Fee Auditor", "feeauditor.com"],
  url: absoluteUrl("/"),
  logo: absoluteUrl("/icon-192.png"),
  description:
    "Independent SaaS at feeauditor.com that analyzes a merchant’s own Stripe Balance CSV. Not affiliated with, endorsed by, or part of Stripe, Inc.",
  sameAs: [
    "https://github.com/Ksantor1981/Stripe-Fee-Auditor",
    "https://www.producthunt.com/products/stripe-fee-auditor",
    "https://www.indiehackers.com/product/stripe-fee-auditor-2",
  ],
};

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main className="min-h-screen page-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD).replace(/</g, "\\u003c") }}
      />

      <div
        id={LANDING_NAV_ROOT_ID}
        className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-[#fbfbf8]/95 backdrop-blur-sm"
      >
        <LandingNavShell />
      </div>

      <div className="pt-16">
      {/* Hero — H1 paints from static HTML; nav shell is fixed above, JS hydrates on idle */}
      <section id="problem" className="flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#ffffff_0,_#f6f6f3_64%)] px-4 py-10 text-center scroll-mt-28 sm:py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight max-w-3xl">
          {t("heroTitleBefore")}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">{t("heroTitleHighlight")}</span>
        </h1>
        <p className="mt-4 max-w-xl text-xl font-semibold text-gray-800 sm:text-2xl">
          {t("heroSubtitle")}
        </p>
        <h2 className="sr-only">Stripe effective rate, refund leakage, and international card fees</h2>
        <p className="mt-3 max-w-lg text-sm text-gray-500">
          {t("heroMeta")}
        </p>

        <div className="mt-8">
          <FunnelAnchor
            href="/analyze"
            utm={{ source: "landing", medium: "cta", campaign: "hero_primary" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "hero_primary" }}
            className="interactive-lift inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            {t("heroCta")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </FunnelAnchor>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          <a href="#sample" className="font-medium text-blue-700 underline hover:text-blue-800">
            {t("previewScenarios")}
          </a>
          {" · "}
          <Link href="/stripe-balance-csv" className="font-medium text-blue-700 underline hover:text-blue-800">
            {t("exportGuide")}
          </Link>
          {" · "}
          {t("uploadLimit")}
        </p>

        {hasReportsAnalyzedCount && (
          <p className="mt-3 text-sm font-medium text-gray-500">
            {t("reportsAnalyzedBeta", { count: reportsAnalyzedLabel })}
          </p>
        )}

        <LandingTrustStrip />
      </section>

      {/* Sample report */}
      <section id="sample" className="page-band px-4 py-10 scroll-mt-24" aria-labelledby="sample-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="sample-heading" className="text-center text-2xl font-bold text-gray-900">
            {t("sampleHeading")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 max-w-md mx-auto">
            {t("sampleSub")}
          </p>

          <div className="mt-8">
            <LandingSampleTabs />
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 max-w-lg mx-auto">
            {t("cfoLine")}{" "}
            <Link href="/monitor" className="font-medium text-blue-700 underline hover:text-blue-800">
              {t("feeMonitor")}
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#f9f9f6] px-4 py-12 scroll-mt-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-bold text-gray-900 mb-6">{t("trustHeading")}</h2>
          <LandingFaq itemIds={LANDING_FAQ_HOME_IDS} />
        </div>
      </section>

      <section className="page-canvas px-4 py-5">
        <div className="mx-auto max-w-3xl">
          <ChromeExtensionInstallCta placement="home_footer" variant="card" />
        </div>
      </section>

      <SiteFooter />
      </div>

      <LandingNavHydrate />
      <FunnelClickDelegate />
    </main>
  );
}
