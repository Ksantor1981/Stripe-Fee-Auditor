import type { Metadata } from "next";
import { blogPageMetadata } from "@/lib/i18n/page-helpers";
import { BlogArticleContent } from "@/components/marketing/BlogArticleContent";

const pagePath = "/blog/stripe-ach-vs-credit-card-fees";
const contentKey = "stripe-ach-vs-credit-card-fees";

export async function generateMetadata(): Promise<Metadata> {
  return blogPageMetadata(contentKey, pagePath);
}

export default function Page() {
  return (
    <main className="min-h-screen page-canvas">
      <BlogArticleContent contentKey={contentKey} path={pagePath} />
    </main>
  );
}
