import type { Metadata } from "next";
import Link from "next/link";
import {
  BLOG_HUB_POSTS,
  FEE_BLOG_ENTRIES,
  PILLAR_EFFECTIVE_RATE_PATH,
  SEO_LANDING_ENTRIES,
  type BlogIndexEntry,
} from "./_data/blogIndex";
import { buildOgImageUrl } from "@/lib/seo-og";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const title = "Stripe Fees Guide: Hidden Fees, Audits & Savings | FeeAuditor Blog";
const description =
  "Practical guides on Stripe effective rate, Balance CSV exports, international card fees, ACH savings, payment alternatives, and no-OAuth fee audits.";
const ogImage = buildOgImageUrl({ title: "Stripe fee guides", eyebrow: "Fee Auditor Blog" });

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title,
    description,
    url: "https://feeauditor.com/blog",
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Stripe fee guides by Fee Auditor" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

const pillar = SEO_LANDING_ENTRIES.find((e) => e.path === PILLAR_EFFECTIVE_RATE_PATH)!;
const allEntries = [...BLOG_HUB_POSTS, ...SEO_LANDING_ENTRIES];
const entryByPath = new Map(allEntries.map((entry) => [entry.path, entry]));
const feePostPaths = new Set(FEE_BLOG_ENTRIES.map((entry) => entry.path));
const privacyPosts = BLOG_HUB_POSTS.filter((entry) => !feePostPaths.has(entry.path));

function entriesFor(paths: string[]): BlogIndexEntry[] {
  return paths
    .map((path) => entryByPath.get(path))
    .filter((entry): entry is BlogIndexEntry => Boolean(entry));
}

const GUIDE_SECTIONS = [
  {
    eyebrow: "Start here",
    title: "Find your real Stripe fee rate",
    description: "Use these pages when you want the shortest path from confusion to a useful number.",
    entries: entriesFor([
      PILLAR_EFFECTIVE_RATE_PATH,
      "/what-percent-does-stripe-take",
      "/stripe-fee-calculator",
      "/stripe-balance-csv",
    ]),
  },
  {
    eyebrow: "Diagnose fees",
    title: "Understand why Stripe costs more than expected",
    description: "Break down the drivers behind a 3.8% or 4%+ effective rate.",
    entries: entriesFor([
      "/blog/stripe-credit-card-processing-fees",
      "/blog/stripe-international-card-fees",
      "/blog/stripe-fees-small-transactions",
      "/blog/why-stripe-effective-rate-jumped-this-month",
      "/blog/stripe-blended-rate-calculator",
      "/blog/stripe-fee-leakage-report-may-2026",
      "/blog/cross-border-stripe-fees-migration-2026",
    ]),
  },
  {
    eyebrow: "Compare options",
    title: "Decide whether to switch, add ACH, or change checkout",
    description: "Comparison and optimization guides for founders who want lower payment costs.",
    entries: entriesFor([
      "/blog/stripe-alternatives-2026",
      "/blog/stripe-vs-paypal-fees",
      "/blog/stripe-ach-vs-credit-card-fees",
      "/blog/how-to-reduce-stripe-fees",
      "/blog/stripe-fee-audit-checklist-for-saas-founders",
    ]),
  },
  {
    eyebrow: "Export and privacy",
    title: "Audit fees without connecting your Stripe account",
    description: "CSV export steps, data-handling details, and no-OAuth privacy notes.",
    entries: [
      ...entriesFor([
        "/blog/how-to-export-stripe-balance-csv",
        "/how-it-works",
        "/blog/stripe-effective-fee-rate-explained",
      ]),
      ...privacyPosts,
    ],
  },
];

function GuideCard({ entry, featured = false }: { entry: BlogIndexEntry; featured?: boolean }) {
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
        {entry.slug === "cross-border-stripe-fees-migration-2026" && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
            New
          </span>
        )}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-gray-500">{entry.desc}</p>
      <p className="mt-2 text-xs text-gray-400">{entry.time} read</p>
    </Link>
  );
}

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-gray-900">
          Stripe fee guides for SaaS founders
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-gray-500">
          Practical guides on Stripe effective rate, Balance CSV exports, international fees,
          ACH savings, payment alternatives, and privacy-first fee audits.
        </p>

        <Link href={pillar.path} className="mt-8 block rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Start here</p>
          <h2 className="mt-1 font-semibold text-gray-900">{pillar.title}</h2>
          <p className="mt-1 text-sm text-gray-600">{pillar.desc}</p>
          <p className="mt-2 text-xs text-gray-400">{pillar.time} read</p>
        </Link>

        <div className="mt-12 space-y-14">
          {GUIDE_SECTIONS.map((section) => (
            <section key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{section.eyebrow}</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">{section.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">{section.description}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {section.entries.map((entry) => (
                  <GuideCard key={entry.path} entry={entry} featured={entry.path === PILLAR_EFFECTIVE_RATE_PATH} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
