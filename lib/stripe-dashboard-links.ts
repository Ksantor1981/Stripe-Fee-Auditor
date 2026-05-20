/** Stable Stripe Dashboard URLs for in-report action links (open in new tab). */

export const STRIPE_DASHBOARD = {
  paymentMethods: "https://dashboard.stripe.com/settings/payment_methods",
  billing: "https://dashboard.stripe.com/settings/billing",
  invoices: "https://dashboard.stripe.com/settings/billing/invoice",
  disputes: "https://dashboard.stripe.com/disputes",
  reports: "https://dashboard.stripe.com/reports/balance",
} as const;

export type StripeDashboardLinkKey = keyof typeof STRIPE_DASHBOARD;
