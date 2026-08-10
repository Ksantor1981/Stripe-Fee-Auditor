import type { Metadata } from "next";
import { buildOgImageUrl } from "@/lib/seo-og";
import { BlogHubContent, blogHubMetadata } from "@/components/marketing/BlogHubContent";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await blogHubMetadata();
  const ogImage = buildOgImageUrl({ title: "Stripe fee guides", eyebrow: "Fee Auditor Blog" });
  return {
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
}

export default function BlogIndex() {
  return <BlogHubContent />;
}
