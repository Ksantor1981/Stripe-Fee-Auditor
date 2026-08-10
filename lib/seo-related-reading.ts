import type { SeoRelatedLink } from "@/components/SeoRelatedReading";

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
    context: "What should the report include?",
    href: "/stripe-fees-report",
    label: "Stripe fees report guide",
  },
  {
    context: "Don't have the CSV yet?",
    href: "/stripe-balance-csv",
    label: "CSV Export Guide",
  },
  {
    context: "Fees up vs last month?",
    href: "/blog/why-stripe-fees-increase",
    label: "Why Stripe fees increase",
  },
  {
    context: "Want to understand the fee drivers?",
    href: "/why-stripe-fee-rate-higher-than-2-9",
    label: "Why fees run higher",
  },
  {
    context: "Need the short percentage answer?",
    href: "/what-percent-does-stripe-take",
    label: "What percent Stripe takes",
  },
  {
    context: "Comparing payment options?",
    href: "/compare-stripe-paypal-wise",
    label: "Stripe vs PayPal vs Wise",
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
    label: "Stripe fees calculator",
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
    label: "Stripe fees calculator",
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
