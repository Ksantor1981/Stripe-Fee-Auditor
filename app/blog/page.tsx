import type { Metadata } from "next";
import Link from "next/link";
import {
  BLOG_HUB_POSTS,
  PILLAR_EFFECTIVE_RATE_PATH,
  SEO_LANDING_ENTRIES,
} from "./_data/blogIndex";
import { buildOgImageUrl } from "@/lib/seo-og";

const title = "Blog — Stripe Fee Auditor";
const description = "Guides on understanding and reducing your Stripe fees.";
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

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Blog</h1>
        <p className="mt-2 text-gray-500">Guides on Stripe fees, optimization, and privacy-first audits.</p>

        <Link
          href={pillar.path}
          className="mt-8 block rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm hover:border-blue-200 hover:shadow transition-all"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Start here</p>
          <h2 className="mt-1 font-semibold text-gray-900">{pillar.title}</h2>
          <p className="mt-1 text-sm text-gray-600">{pillar.desc}</p>
          <p className="mt-2 text-xs text-gray-400">{pillar.time} read</p>
        </Link>

        <div className="mt-10 space-y-4">
          {BLOG_HUB_POSTS.map((p) => (
            <Link
              key={p.path}
              href={p.path}
              className="block rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow transition-all"
            >
              <h2 className="font-semibold text-gray-900">{p.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
              <p className="mt-2 text-xs text-gray-400">{p.time} read</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
