import type { Metadata } from "next";
import { blogPageMetadata } from "@/lib/i18n/page-helpers";
import { BlogArticleContent } from "@/components/marketing/BlogArticleContent";

const pagePath = "/blog/stripe-effective-fee-rate-explained";
const contentKey = "stripe-effective-fee-rate-explained";

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
