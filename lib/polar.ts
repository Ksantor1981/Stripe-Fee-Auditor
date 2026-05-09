import { Polar } from "@polar-sh/sdk";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { absoluteUrl } from "@/lib/site-url";

export type PlanId = "pro";

export const PLANS: Record<PlanId, { label: string; price: string; desc: string; productEnvKey: string }> = {
  pro: {
    label: "Full Report",
    price: "$12",
    desc: "Full anomaly list + savings opportunities + monthly breakdown + CSV export",
    productEnvKey: "POLAR_PRODUCT_PRO",
  },
};

export type ReportCheckoutMetadata = {
  reportId?: string;
  accessToken?: string;
  plan?: PlanId;
};

export function isPlanId(value: string | null): value is PlanId {
  return value === "pro";
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

function readStringMetadata(metadata: Record<string, unknown> | null | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

export function readReportMetadata(metadata: Record<string, unknown> | null | undefined): ReportCheckoutMetadata {
  const plan = readStringMetadata(metadata, "plan") ?? null;

  return {
    reportId: readStringMetadata(metadata, "report_id"),
    accessToken: readStringMetadata(metadata, "access_token"),
    plan: isPlanId(plan) ? plan : undefined,
  };
}

export async function getCheckoutReportMetadata(checkoutId: string | null | undefined): Promise<ReportCheckoutMetadata> {
  if (!checkoutId) return {};
  const polar = getPolarClient();
  if (!polar) return {};
  const checkout = await polar.checkouts.get({ id: checkoutId });
  return readReportMetadata(checkout.metadata);
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
    pro: "POLAR_CHECKOUT_PRO",
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
