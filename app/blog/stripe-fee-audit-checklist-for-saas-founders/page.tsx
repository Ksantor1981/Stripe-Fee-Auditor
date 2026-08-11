import type { Metadata } from "next";
import { blogPageMetadata } from "@/lib/i18n/page-helpers";
import { BlogArticleContent } from "@/components/marketing/BlogArticleContent";

const pagePath = "/blog/stripe-fee-audit-checklist-for-saas-founders";
const contentKey = "stripe-fee-audit-checklist-for-saas-founders";

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
