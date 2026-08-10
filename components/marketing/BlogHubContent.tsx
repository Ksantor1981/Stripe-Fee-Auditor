import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PILLAR_EFFECTIVE_RATE_PATH } from "@/app/blog/_data/blogIndex";
import { contentKeyFromPath } from "@/lib/i18n/page-path-map";

type HubSectionId = "startHere" | "diagnose" | "compare" | "exportPrivacy";

type HubSectionConfig = {
  id: HubSectionId;
  paths: string[];
};

const HUB_SECTIONS: HubSectionConfig[] = [
  {
    id: "startHere",
    paths: [
      PILLAR_EFFECTIVE_RATE_PATH,
      "/blog/how-i-found-1400-in-hidden-stripe-fees",
      "/what-percent-does-stripe-take",
      "/stripe-fee-calculator",
      "/stripe-balance-csv",
    ],
  },
  {
    id: "diagnose",
    paths: [
      "/blog/stripe-credit-card-processing-fees",
      "/blog/stripe-international-card-fees",
      "/blog/stripe-fees-small-transactions",
      "/blog/why-stripe-effective-rate-jumped-this-month",
      "/blog/stripe-blended-rate-calculator",
      "/blog/stripe-fee-leakage-report-may-2026",
      "/blog/cross-border-stripe-fees-migration-2026",
    ],
  },
  {
    id: "compare",
    paths: [
      "/should-i-switch-from-stripe",
      "/blog/stripe-alternatives-2026",
      "/stripe-vs-square-fees",
      "/stripe-vs-gocardless",
      "/stripe-vs-paddle-fees",
      "/blog/stripe-vs-paypal-fees",
      "/compare-stripe-paypal-wise",
      "/blog/stripe-ach-vs-credit-card-fees",
      "/blog/how-to-reduce-stripe-fees",
      "/blog/stripe-fee-audit-checklist-for-saas-founders",
    ],
  },
  {
    id: "exportPrivacy",
    paths: [
      "/blog/how-to-export-stripe-balance-csv",
      "/how-it-works",
      "/blog/stripe-effective-fee-rate-explained",
      "/blog/why-i-wont-connect-my-stripe-account-to-third-party-tools",
      "/blog/what-does-stripe-oauth-read-only-access-actually-see",
      "/blog/how-to-audit-stripe-fees-without-connecting-your-account",
      "/blog/the-stripe-data-you-share-with-analytics-tools",
      "/blog/csv-vs-api-stripe-fee-analysis",
    ],
  },
];

type CardData = {
  path: string;
  title: string;
  desc: string;
  readTime: string | null;
};

async function loadCard(path: string): Promise<CardData | null> {
  const ref = contentKeyFromPath(path);
  if (!ref) return null;
  const t = await getTranslations(`${ref.namespace}.${ref.key}`);
  const title = ref.namespace === "blog" ? t("title") : t("metaTitle");
  const desc = t("metaDescription");
  const readTime = t.has("readTime") ? t("readTime") : null;
  return { path, title, desc, readTime };
}

function GuideCard({
  entry,
  featured = false,
  readSuffix,
}: {
  entry: CardData;
  featured?: boolean;
  readSuffix: string;
}) {
  return (
    <Link
      href={entry.path}
      className={
        featured
          ? "block rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow"
          : "block rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-gray-900">{entry.title}</h3>
        {entry.path === "/blog/cross-border-stripe-fees-migration-2026" && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">New</span>
        )}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-gray-500">{entry.desc}</p>
      {entry.readTime ? <p className="mt-2 text-xs text-gray-400">{readSuffix.replace("{time}", entry.readTime)}</p> : null}
    </Link>
  );
}

export async function BlogHubContent() {
  const t = await getTranslations("blogHub");
  const tb = await getTranslations("breadcrumbs");
  const nav = await getTranslations("nav");
  const readSuffix = t("readTimeFormat");

  const pillar = await loadCard(PILLAR_EFFECTIVE_RATE_PATH);
  const sections = await Promise.all(
    HUB_SECTIONS.map(async (section) => {
      const cards = (await Promise.all(section.paths.map(loadCard))).filter((c): c is CardData => c !== null);
      return {
        id: section.id,
        eyebrow: t(`sections.${section.id}.eyebrow`),
        title: t(`sections.${section.id}.title`),
        description: t(`sections.${section.id}.description`),
        cards,
      };
    }),
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs items={[{ label: tb("home"), href: "/" }, { label: nav("blog") }]} />
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-gray-900">{t("pageTitle")}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-gray-500">{t("pageSubtitle")}</p>

        {pillar ? (
          <Link
            href={pillar.path}
            className="mt-8 block rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{t("sections.startHere.eyebrow")}</p>
            <h2 className="mt-1 font-semibold text-gray-900">{pillar.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{pillar.desc}</p>
            {pillar.readTime ? (
              <p className="mt-2 text-xs text-gray-400">{readSuffix.replace("{time}", pillar.readTime)}</p>
            ) : null}
          </Link>
        ) : null}

        <div className="mt-12 space-y-14">
          {sections.map((section) => (
            <section key={section.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{section.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">{section.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">{section.description}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {section.cards.map((entry) => (
                  <GuideCard
                    key={entry.path}
                    entry={entry}
                    featured={entry.path === PILLAR_EFFECTIVE_RATE_PATH}
                    readSuffix={readSuffix}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export async function blogHubMetadata() {
  const t = await getTranslations("blogHub");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}
