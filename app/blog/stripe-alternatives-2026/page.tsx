import type { Metadata } from "next";
import { blogPageMetadata } from "@/lib/i18n/page-helpers";
import { BlogArticleContent } from "@/components/marketing/BlogArticleContent";

const pagePath = "/blog/stripe-alternatives-2026";
const contentKey = "stripe-alternatives-2026";

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
