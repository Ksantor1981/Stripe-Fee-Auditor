/**
 * Generate thin localized page.tsx wrappers for SEO and blog routes.
 * Run: node scripts/wire-localized-pages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const SEO_PAGES = [
  { dir: "stripe-fee-calculator", key: "stripeFeeCalculator", related: "feeCalculator", children: true },
  { dir: "stripe-balance-csv", key: "stripeBalanceCsv", related: "balanceCsv" },
  { dir: "why-stripe-fee-rate-higher-than-2-9", key: "whyHigher", related: "whyHigher", banner: true },
  { dir: "what-percent-does-stripe-take", key: "whatPercent", related: "percentTake" },
  { dir: "stripe-data-export", key: "dataExport" },
  { dir: "compare-stripe-paypal-wise", key: "comparePaypal" },
  { dir: "should-i-switch-from-stripe", key: "shouldSwitch" },
  { dir: "stripe-fee-analysis-tools", key: "analysisTools" },
  { dir: "how-it-works", key: "howItWorks" },
  { dir: "monitor", key: "monitor" },
  { dir: "about", key: "about" },
  { dir: "stripe-vs-square-fees", key: "vsSquare", variant: "comparison", cta: "stripe-vs-square" },
  { dir: "stripe-vs-paddle-fees", key: "vsPaddle", variant: "comparison", cta: "stripe-vs-paddle" },
  { dir: "stripe-vs-gocardless", key: "vsGocardless", variant: "comparison", cta: "stripe-vs-gocardless" },
];

const BLOG_SLUGS = [
  "why-stripe-fees-increase",
  "how-to-reduce-stripe-fees",
  "stripe-blended-rate-calculator",
  "how-i-found-1400-in-hidden-stripe-fees",
  "cross-border-stripe-fees-migration-2026",
  "stripe-alternatives-2026",
  "stripe-vs-paypal-fees",
  "stripe-effective-fee-rate-explained",
  "stripe-fee-audit-checklist-for-saas-founders",
  "stripe-fee-leakage-report-may-2026",
  "stripe-fees-small-transactions",
  "stripe-international-card-fees",
  "how-to-export-stripe-balance-csv",
  "why-stripe-effective-rate-jumped-this-month",
  "stripe-ach-vs-credit-card-fees",
  "stripe-credit-card-processing-fees",
  "why-stripe-effective-rate-higher-than-2-9-percent",
];

function seoPageContent({ dir, key, related, children, variant, cta, banner }) {
  const pagePath = `/${dir}`;
  const relatedProp = related ? `\n          relatedKey="${related}"` : "";
  const variantProp = variant ? `\n          variant="${variant}"` : "";
  const ctaProp = cta ? `\n          ctaCampaign="${cta}"` : "";
  const bannerImport = banner
    ? `import { AdvertiserIdentityBanner } from "@/components/AdvertiserIdentityBanner";\n`
    : "";
  const bannerEl = banner ? `\n          <AdvertiserIdentityBanner />\n` : "";
  const childrenImports = children
    ? `import { SeoPayPalCalculatorCallout } from "@/components/SeoPayPalCalculatorCallout";\nimport { StripeFeeMiniEstimate } from "@/components/stripe-fee-mini-estimate";\n`
    : "";
  const childrenBlock = children
    ? `\n          <StripeFeeMiniEstimate />\n          <SeoPayPalCalculatorCallout className="mt-8" />\n`
    : "";

  return `import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingShell } from "@/components/MarketingShell";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { LocalizedSeoPage } from "@/components/marketing/LocalizedSeoPage";
import { seoPageMetadata, seoPageFaqJsonLd } from "@/lib/i18n/page-helpers";
import { sitePageBreadcrumbs } from "@/lib/breadcrumb-schema";
${bannerImport}${childrenImports}
const pagePath = "${pagePath}";

export async function generateMetadata(): Promise<Metadata> {
  return seoPageMetadata("${key}", pagePath);
}

export default async function Page() {
  const t = await getTranslations("seo.${key}");
  const faqJsonLd = await seoPageFaqJsonLd("${key}");
  const breadcrumbCrumbs = sitePageBreadcrumbs(t("metaTitle"), pagePath);

  return (
    <MarketingShell>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\\\u003c") }}
        />
      ) : null}
      <BreadcrumbJsonLd crumbs={breadcrumbCrumbs} />
      <LocalizedSeoPage
        contentKey="${key}"${relatedProp}${variantProp}${ctaProp}
      >${bannerEl}${childrenBlock}
      </LocalizedSeoPage>
    </MarketingShell>
  );
}
`;
}

function blogPageContent(slug) {
  const pagePath = `/blog/${slug}`;
  return `import type { Metadata } from "next";
import { blogPageMetadata } from "@/lib/i18n/page-helpers";
import { BlogArticleContent } from "@/components/marketing/BlogArticleContent";

const pagePath = "${pagePath}";
const contentKey = "${slug}";

export async function generateMetadata(): Promise<Metadata> {
  return blogPageMetadata(contentKey, pagePath);
}

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <BlogArticleContent contentKey={contentKey} path={pagePath} />
    </main>
  );
}
`;
}

const privacySlugPage = `/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPageMetadata } from "@/lib/i18n/page-helpers";
import { BlogArticleContent } from "@/components/marketing/BlogArticleContent";
import { blogContentKeyFromSlug } from "@/lib/i18n/blog-slug-map";
import { PRIVACY_ARTICLES } from "../_data/privacyPosts";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PRIVACY_ARTICLES.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const contentKey = blogContentKeyFromSlug(slug);
  if (!contentKey) return {};
  return blogPageMetadata(contentKey, "/blog/" + slug, "privacy");
}

export default async function PrivacyArticlePage({ params }: Props) {
  const { slug } = await params;
  const contentKey = blogContentKeyFromSlug(slug);
  if (!contentKey) notFound();

  return (
    <main className="min-h-screen bg-white">
      <BlogArticleContent contentKey={contentKey} path={"/blog/" + slug} namespace="privacy" />
    </main>
  );
}
`;

for (const cfg of SEO_PAGES) {
  const file = path.join(root, "app", cfg.dir, "page.tsx");
  fs.writeFileSync(file, seoPageContent(cfg), "utf8");
  console.log("SEO:", cfg.dir);
}

for (const slug of BLOG_SLUGS) {
  const file = path.join(root, "app", "blog", slug, "page.tsx");
  fs.writeFileSync(file, blogPageContent(slug), "utf8");
  console.log("Blog:", slug);
}

fs.writeFileSync(path.join(root, "app", "blog", "[slug]", "page.tsx"), privacySlugPage, "utf8");
console.log("Privacy [slug] wired");
