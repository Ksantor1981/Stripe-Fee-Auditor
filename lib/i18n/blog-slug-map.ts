/** Map URL slug → messages/pages blog content key (camelCase). */
export const BLOG_SLUG_TO_KEY: Record<string, string> = {
  "cross-border-stripe-fees-migration-2026": "crossBorderStripeFeesMigration2026",
  "how-i-found-1400-in-hidden-stripe-fees": "howIFound1400InHiddenStripeFees",
  "how-to-export-stripe-balance-csv": "howToExportStripeBalanceCsv",
  "how-to-reduce-stripe-fees": "howToReduceStripeFees",
  "stripe-ach-vs-credit-card-fees": "stripeAchVsCreditCardFees",
  "stripe-alternatives-2026": "stripeAlternatives2026",
  "stripe-blended-rate-calculator": "stripeBlendedRateCalculator",
  "stripe-credit-card-processing-fees": "stripeCreditCardProcessingFees",
  "stripe-effective-fee-rate-explained": "stripeEffectiveFeeRateExplained",
  "stripe-fee-audit-checklist-for-saas-founders": "stripeFeeAuditChecklistForSaasFounders",
  "stripe-fee-leakage-report-may-2026": "stripeFeeLeakageReportMay2026",
  "stripe-fees-small-transactions": "stripeFeesSmallTransactions",
  "stripe-international-card-fees": "stripeInternationalCardFees",
  "stripe-vs-paypal-fees": "stripeVsPaypalFees",
  "why-stripe-effective-rate-higher-than-2-9-percent": "whyStripeEffectiveRateHigherThan29Percent",
  "why-stripe-effective-rate-jumped-this-month": "whyStripeEffectiveRateJumpedThisMonth",
  "why-stripe-fees-increase": "whyStripeFeesIncrease",
  "why-i-wont-connect-my-stripe-account-to-third-party-tools": "whyIWontConnectMyStripeAccountToThirdPartyTools",
  "what-does-stripe-oauth-read-only-access-actually-see": "whatDoesStripeOauthReadOnlyAccessActuallySee",
  "how-to-audit-stripe-fees-without-connecting-your-account": "howToAuditStripeFeesWithoutConnectingYourAccount",
  "the-stripe-data-you-share-with-analytics-tools": "theStripeDataYouShareWithAnalyticsTools",
  "csv-vs-api-stripe-fee-analysis": "csvVsApiStripeFeeAnalysis",
};

export function blogContentKeyFromSlug(slug: string): string | null {
  return BLOG_SLUG_TO_KEY[slug] ?? null;
}
