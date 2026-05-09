import { Polar } from "@polar-sh/sdk";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { absoluteUrl } from "@/lib/site-url";

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

function getRequiredProductId(planId: PlanId): string {
  const productId = process.env[PLANS[planId].productEnvKey];
  if (!productId) {
    throw new Error(`Polar not configured: missing ${PLANS[planId].productEnvKey}`);
  }
  return productId;
}

function getPolarClient(): Polar | null {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  return accessToken ? new Polar({ accessToken }) : null;
}

export async function buildCheckoutUrl(
  planId: PlanId,
  reportId: string,
  accessToken: string,
  email?: string
): Promise<string> {
  const productId = getRequiredProductId(planId);
  const reportPath = `/report/${reportId}?token=${encodeURIComponent(accessToken)}`;
  const successUrl = absoluteUrl(`${reportPath}&payment=success&checkout_id={CHECKOUT_ID}`);
  const returnUrl = absoluteUrl(reportPath);

  const polar = getPolarClient();
  if (polar) {
    const checkout = await polar.checkouts.create({
      products: [productId],
      metadata: {
        report_id: reportId,
        access_token: accessToken,
        plan: planId,
      },
      customerEmail: email,
      successUrl,
      returnUrl,
      allowDiscountCodes: true,
      requireBillingAddress: false,
    });

    return checkout.url;
  }

  // Fallback for environments that still use static Polar checkout links.
  // Dynamic per-report success redirects require POLAR_ACCESS_TOKEN.
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
