import type { SeoRelatedLink } from "@/components/SeoRelatedReading";
import { getTranslations } from "next-intl/server";
import { seoRelatedFromMessages } from "@/lib/i18n/seo-related";

/** Hub links: fees report → export → calculator → analyze */
export const SEO_RELATED_FEES_REPORT: SeoRelatedLink[] = [
  {
    context: "Need the export steps?",
    href: "/stripe-balance-csv",
    label: "Export Stripe Balance CSV",
  },
  {
    context: "Estimate published rates first?",
    href: "/stripe-fee-calculator",
    label: "Stripe fee calculator",
  },
  {
    context: "Why is the rate above 2.9%?",
    href: "/why-stripe-fee-rate-higher-than-2-9",
    label: "Why fees run higher",
  },
  {
    context: "Comparing PayPal or Wise?",
    href: "/compare-stripe-paypal-wise",
    label: "Stripe vs PayPal vs Wise",
  },
  {
    context: "Ready to run the audit?",
    href: "/analyze",
    label: "Analyze my CSV",
  },
];

export const SEO_RELATED_FEE_CALCULATOR: SeoRelatedLink[] = [
  {
    context: "Need actual fees, not an estimate?",
    href: "/analyze",
    label: "Analyze Stripe fees from Balance CSV",
  },
  {
    context: "Need the short percentage answer?",
    href: "/what-percent-does-stripe-take",
    label: "What percent Stripe takes",
  },
  {
    context: "Want the processing-fees explainer?",
    href: "/blog/stripe-credit-card-processing-fees",
    label: "Stripe credit card processing fees",
  },
  {
    context: "Don't have the CSV yet?",
    href: "/stripe-balance-csv",
    label: "CSV Export Guide",
  },
  {
    context: "Want to understand the fee drivers?",
    href: "/why-stripe-fee-rate-higher-than-2-9",
    label: "Why fees run higher",
  },
  {
    context: "Fees up vs last month?",
    href: "/blog/why-stripe-fees-increase",
    label: "Why Stripe fees increase",
  },
];

export const SEO_RELATED_WHY_HIGHER: SeoRelatedLink[] = [
  {
    context: "Build a full fees report",
    href: "/stripe-fees-report",
    label: "Stripe fees report",
  },
  {
    context: "Fees up vs last month?",
    href: "/blog/why-stripe-fees-increase",
    label: "Why Stripe fees increase",
  },
  {
    context: "Estimate published fees first",
    href: "/stripe-fee-calculator",
    label: "Stripe fee calculator",
  },
  {
    context: "Next: how to export the file",
    href: "/stripe-balance-csv",
    label: "CSV Export Guide",
  },
  {
    context: "Need the basic percentage first?",
    href: "/what-percent-does-stripe-take",
    label: "How much Stripe charges per transaction",
  },
  {
    context: "Ready to check your real rate?",
    href: "/analyze",
    label: "Analyze my CSV",
  },
];

export const SEO_RELATED_BALANCE_CSV: SeoRelatedLink[] = [
  {
    context: "What to do with the export?",
    href: "/stripe-fees-report",
    label: "Stripe fees report",
  },
  {
    context: "Estimate fees before you export?",
    href: "/stripe-fee-calculator",
    label: "Stripe fee calculator",
  },
  {
    context: "Why is the rate above 2.9%?",
    href: "/why-stripe-fee-rate-higher-than-2-9",
    label: "Why fees run higher than 2.9%",
  },
  {
    context: "Need the short percentage answer?",
    href: "/what-percent-does-stripe-take",
    label: "What percent Stripe takes",
  },
  {
    context: "Fees jumped month over month?",
    href: "/blog/why-stripe-fees-increase",
    label: "Why Stripe fees increase",
  },
  {
    context: "Other export formats?",
    href: "/stripe-data-export",
    label: "Stripe data export options",
  },
];

export const SEO_RELATED_DATA_EXPORT: SeoRelatedLink[] = [
  {
    context: "Need the fee-audit CSV?",
    href: "/stripe-balance-csv",
    label: "Balance CSV export guide",
  },
  {
    context: "Step-by-step blog walkthrough?",
    href: "/blog/how-to-export-stripe-balance-csv",
    label: "How to export Stripe data",
  },
  {
    context: "Export done — audit fees?",
    href: "/analyze",
    label: "Analyze my CSV",
  },
  {
    context: "Why is the rate above 2.9%?",
    href: "/why-stripe-fee-rate-higher-than-2-9",
    label: "Why fees run higher",
  },
  {
    context: "International card fees?",
    href: "/blog/stripe-international-card-fees",
    label: "Stripe international fees",
  },
  {
    context: "Estimate before exporting?",
    href: "/stripe-fee-calculator",
    label: "Stripe fee calculator",
  },
];

export const SEO_RELATED_PERCENT_TAKE: SeoRelatedLink[] = [
  {
    context: "Need a published-price estimate?",
    href: "/stripe-fee-calculator",
    label: "Calculate Stripe fees",
  },
  {
    context: "Need actual fees from your export?",
    href: "/analyze",
    label: "Analyze Stripe fees from Balance CSV",
  },
  {
    context: "Want the full processing-fees guide?",
    href: "/blog/stripe-credit-card-processing-fees",
    label: "Stripe credit card processing fees",
  },
  {
    context: "Why can the rate exceed 2.9%?",
    href: "/why-stripe-fee-rate-higher-than-2-9",
    label: "Why fees run higher",
  },
  {
    context: "Comparing Square?",
    href: "/stripe-vs-square-fees",
    label: "Stripe vs Square fees",
  },
  {
    context: "Need the export steps?",
    href: "/stripe-balance-csv",
    label: "Export Stripe Balance CSV",
  },
];

const SEO_RELATED_FALLBACKS = {
  feesReport: SEO_RELATED_FEES_REPORT,
  feeCalculator: SEO_RELATED_FEE_CALCULATOR,
  whyHigher: SEO_RELATED_WHY_HIGHER,
  balanceCsv: SEO_RELATED_BALANCE_CSV,
  dataExport: SEO_RELATED_DATA_EXPORT,
  percentTake: SEO_RELATED_PERCENT_TAKE,
} as const;

export type SeoRelatedKey = keyof typeof SEO_RELATED_FALLBACKS;

/** Locale-aware related links with English export fallback. */
export async function getSeoRelated(key: SeoRelatedKey): Promise<SeoRelatedLink[]> {
  const t = await getTranslations("seoRelated");
  return seoRelatedFromMessages(t.raw(key), SEO_RELATED_FALLBACKS[key]);
}
