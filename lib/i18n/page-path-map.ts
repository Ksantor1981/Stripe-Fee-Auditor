import { BLOG_SLUG_TO_KEY } from "@/lib/i18n/blog-slug-map";

/** SEO landing paths → messages/pages seo.* content key */
export const SEO_PATH_TO_KEY: Record<string, string> = {
  "/stripe-fees-report": "stripeFeesReport",
  "/stripe-fee-calculator": "stripeFeeCalculator",
  "/stripe-balance-csv": "stripeBalanceCsv",
  "/why-stripe-fee-rate-higher-than-2-9": "whyHigher",
  "/what-percent-does-stripe-take": "whatPercent",
  "/stripe-data-export": "dataExport",
  "/compare-stripe-paypal-wise": "comparePaypal",
  "/should-i-switch-from-stripe": "shouldSwitch",
  "/stripe-fee-analysis-tools": "analysisTools",
  "/how-it-works": "howItWorks",
  "/monitor": "monitor",
  "/about": "about",
  "/stripe-vs-square-fees": "vsSquare",
  "/stripe-vs-paddle-fees": "vsPaddle",
  "/stripe-vs-gocardless": "vsGocardless",
};

export function blogPathFromSlug(slug: string): string {
  return `/blog/${slug}`;
}

export function contentKeyFromPath(path: string): { namespace: "seo" | "blog"; key: string } | null {
  if (SEO_PATH_TO_KEY[path]) {
    return { namespace: "seo", key: SEO_PATH_TO_KEY[path] };
  }
  if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length);
    const key = BLOG_SLUG_TO_KEY[slug];
    if (key) return { namespace: "blog", key };
  }
  return null;
}
