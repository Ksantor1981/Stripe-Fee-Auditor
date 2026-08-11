import type { Metadata } from "next";
import { blogPageMetadata } from "@/lib/i18n/page-helpers";
import { BlogArticleContent } from "@/components/marketing/BlogArticleContent";

const pagePath = "/blog/how-i-found-1400-in-hidden-stripe-fees";
const contentKey = "how-i-found-1400-in-hidden-stripe-fees";

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
