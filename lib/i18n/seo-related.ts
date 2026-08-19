import type { SeoRelatedLink } from "@/components/SeoRelatedReading";

type RelatedItem = {
  context: string;
  href: string;
  label: string;
};

/** Build related-reading links from next-intl `seoRelated.{key}` arrays. */
export function seoRelatedFromMessages(
  raw: unknown,
  fallback: SeoRelatedLink[] = []
): SeoRelatedLink[] {
  if (!Array.isArray(raw)) return fallback;
  const links: SeoRelatedLink[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as RelatedItem).context === "string" &&
      typeof (item as RelatedItem).href === "string" &&
      typeof (item as RelatedItem).label === "string"
    ) {
      links.push(item as SeoRelatedLink);
    }
  }
  return links.length > 0 ? links : fallback;
}

export const SEO_RELATED_KEYS = {
  feesReport: "feesReport",
  feeCalculator: "feeCalculator",
  whyHigher: "whyHigher",
  balanceCsv: "balanceCsv",
  dataExport: "dataExport",
  percentTake: "percentTake",
} as const;

export type SeoRelatedKey = (typeof SEO_RELATED_KEYS)[keyof typeof SEO_RELATED_KEYS];
