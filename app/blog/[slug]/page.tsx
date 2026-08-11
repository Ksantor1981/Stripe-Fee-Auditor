/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
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
    <main className="min-h-screen page-canvas">
      <BlogArticleContent contentKey={contentKey} path={"/blog/" + slug} namespace="privacy" />
    </main>
  );
}
