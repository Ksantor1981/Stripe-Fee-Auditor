import { validateEvent } from "@polar-sh/sdk/webhooks";

export type PlanId = "basic" | "pro" | "team";

export const PLANS: Record<PlanId, { label: string; price: string; desc: string; productEnvKey: string }> = {
  basic: {
    label: "Basic Report",
    price: "$5",
    desc: "Full anomaly list + CSV export",
    productEnvKey: "POLAR_PRODUCT_BASIC",
  },
  pro: {
    label: "Pro Report",
    price: "$12",
    desc: "Everything + PDF export + monthly breakdown",
    productEnvKey: "POLAR_PRODUCT_PRO",
  },
  team: {
    label: "Team",
    price: "$29",
    desc: "Pro + 5 reports + priority support",
    productEnvKey: "POLAR_PRODUCT_TEAM",
  },
};

export function isPlanId(value: string | null): value is PlanId {
  return value === "basic" || value === "pro" || value === "team";
}

export function isAllowedProductId(productId: string): boolean {
  const allowed = Object.values(PLANS)
    .map((plan) => process.env[plan.productEnvKey])
    .filter(Boolean);
  return allowed.includes(productId);
}

export function buildCheckoutUrl(
  planId: PlanId,
  reportId: string,
  accessToken: string,
  email?: string
): string {
  const checkoutLinkEnvKey = {
    basic: "POLAR_CHECKOUT_BASIC",
    pro: "POLAR_CHECKOUT_PRO",
    team: "POLAR_CHECKOUT_TEAM",
  }[planId];

  const checkoutLink = process.env[checkoutLinkEnvKey];
  if (!checkoutLink) {
    throw new Error(`Polar not configured: missing ${checkoutLinkEnvKey}`);
  }

  const url = new URL(`https://buy.polar.sh/${checkoutLink}`);
  url.searchParams.set("metadata[report_id]", reportId);
  url.searchParams.set("metadata[access_token]", accessToken);
  if (email) url.searchParams.set("customer_email", email);

  return url.toString();
}

export function verifyPolarWebhook(
  rawBody: string,
  headers: Record<string, string>
): ReturnType<typeof validateEvent> {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) throw new Error("POLAR_WEBHOOK_SECRET not set");
  return validateEvent(rawBody, headers, secret);
}
