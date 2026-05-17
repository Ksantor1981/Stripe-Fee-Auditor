/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { absoluteUrl } from "@/lib/site-url";
import { getPrivacyArticle, PRIVACY_ARTICLES } from "../_data/privacyPosts";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PRIVACY_ARTICLES.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPrivacyArticle(slug);
  if (!post) return {};

  const path = "/blog/" + post.slug;
  const url = absoluteUrl(path);

  return {
    title: post.title + " | Fee Auditor",
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: "Fee Auditor",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default async function PrivacyArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPrivacyArticle(slug);
  if (!post) notFound();

  const url = absoluteUrl("/blog/" + post.slug);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    mainEntityOfPage: url,
    url,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { "@type": "Organization", name: "Fee Auditor", url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: "Fee Auditor", url: absoluteUrl("/") },
    keywords: post.keywords.join(", "),
    about: post.semanticCluster,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.shortTitle, item: url },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <article className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">← Blog</Link>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span>{post.time} read</span>
          <span>·</span>
          <time dateTime={post.dateModified}>Updated May 2026</time>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          {post.title}
        </h1>

        <div className="mt-6 space-y-4 text-lg leading-relaxed text-gray-600">
          {post.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Want the answer from your own Stripe data?</strong>{" "}
          <Link href="/analyze" className="font-medium underline">Upload your Balance CSV</Link>{" "}
          or{" "}
          <Link href="/analyze?sample=1" className="font-medium underline">open a sample report</Link>.
          No Stripe OAuth or API connection required.
          <BlogBetaRetentionNote />
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-xl font-bold text-gray-900">{section.heading}</h2>

              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3">{paragraph}</p>
              ))}

              {section.bullets && (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        {section.table.headers.map((header) => (
                          <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {section.table.rows.map((row) => (
                        <tr key={row.join("|")}>
                          {row.map((cell, index) => (
                            <td key={cell + "-" + index} className="px-4 py-3 align-top text-gray-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
          <h2 className="text-lg font-bold text-gray-900">Try it without connecting Stripe</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Fee Auditor analyzes an exported Stripe Balance Transactions CSV and turns it into a fee report:
            effective rate, benchmark verdict, top fee drivers, refund leakage, anomalies, monthly trends,
            and savings opportunities.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href="/analyze" className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Analyze My CSV
            </Link>
            <Link href="/analyze?sample=1" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              View sample report →
            </Link>
          </div>
          <BlogBetaRetentionNote tone="gray" />
        </section>

        <section className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-900">FAQ</h2>
          <div className="mt-4 space-y-5">
            {post.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
          <div className="mt-4 space-y-3">
            {post.related.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-blue-600 hover:underline">
                {link.title} →
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Sources</h2>
          <div className="mt-4 space-y-3">
            {post.sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-blue-600 hover:underline"
              >
                {source.title} →
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
