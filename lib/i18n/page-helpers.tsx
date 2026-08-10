import Link from "next/link";
import { getTranslations } from "next-intl/server";

type FaqItem = { q: string; a: string };

export async function seoPageMetadata(contentKey: string, canonical: string) {
  const t = await getTranslations(`seo.${contentKey}`);
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title: `${title} | Fee Auditor`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Stripe Fee Auditor",
      type: "article" as const,
    },
    twitter: {
      card: "summary" as const,
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large" as const,
        "max-video-preview": -1,
      },
    },
  };
}

export async function seoPageFaqJsonLd(contentKey: string) {
  const t = await getTranslations(`seo.${contentKey}`);
  const faq = (t.raw("faq") as FaqItem[] | undefined) ?? [];
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

type PageContentNamespace = "blog" | "privacy";

export async function blogPageMetadata(
  contentKey: string,
  canonical: string,
  namespace: PageContentNamespace = "blog",
) {
  const t = await getTranslations(`${namespace}.${contentKey}`);
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title: `${title} | Fee Auditor`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article" as const,
      title,
      description,
      url: canonical,
      siteName: "Fee Auditor",
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}

export async function blogReadTimeLabel(contentKey: string, namespace: PageContentNamespace = "blog") {
  const t = await getTranslations(`${namespace}.${contentKey}`);
  const hub = await getTranslations("blogHub");
  const readTime = t("readTime");
  const format = hub.has("readTimeFormat") ? hub("readTimeFormat") : "{time} read";
  return `${format.replace("{time}", readTime)} · Stripe Fees · Updated Aug 2026`;
}

export function renderInlineLinks(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return part;
    const [, label, href] = match;
    const external = href.startsWith("http");
    return (
      <Link
        key={`${href}-${index}`}
        href={href}
        className="text-blue-600 underline hover:text-blue-800"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </Link>
    );
  });
}
