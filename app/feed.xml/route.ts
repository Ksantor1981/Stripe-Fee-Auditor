import { BLOG_HUB_POSTS, SEO_LANDING_ENTRIES } from "@/app/blog/_data/blogIndex";

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://feeauditor.com").replace(/\/$/, "");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const allPosts = [...BLOG_HUB_POSTS, ...SEO_LANDING_ENTRIES];

  const items = allPosts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}${post.path}</link>
      <guid isPermaLink="true">${SITE_URL}${post.path}</guid>
      <description>${escapeXml(post.desc)}</description>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Stripe Fee Auditor — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Guides and analysis on Stripe fees, effective rate, and cost optimization for SaaS founders.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
