import { Polar } from "@polar-sh/sdk";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { absoluteUrl } from "@/lib/site-url";
import { createCheckoutSession } from "@/lib/db";

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

export async function getSucceededCheckout(checkoutId: string): Promise<{
  productId: string | null;
  email: string;
} | null> {
  const polar = getPolarClient();
  if (!polar) return null;

  const checkout = await polar.checkouts.get({ id: checkoutId });
  if (checkout.status !== "succeeded") return null;

  return {
    productId: checkout.productId,
    email: checkout.customerEmail ?? "",
  };
}

export async function buildCheckoutUrl(
  planId: PlanId,
  reportId: string,
  accessToken: string,
  email?: string
): Promise<string> {
  const productId = getRequiredProductId(planId);
  const successUrl = absoluteUrl("/api/checkout/success?checkout_id={CHECKOUT_ID}");
  const returnUrl = absoluteUrl("/analyze");

  const polar = getPolarClient();
  if (polar) {
    const checkout = await polar.checkouts.create({
      products: [productId],
      metadata: {
        report_id: reportId,
        plan: planId,
      },
      customerEmail: email,
      successUrl,
      returnUrl,
      allowDiscountCodes: true,
      requireBillingAddress: false,
    });

    if (!checkout.id) {
      throw new Error("Polar checkout did not return an id");
    }

    await createCheckoutSession({
      checkoutId: checkout.id,
      reportId,
      accessToken,
      plan: planId,
    });

    return checkout.url;
  }

  throw new Error("Polar dynamic checkout is required: set POLAR_ACCESS_TOKEN");
}

export function verifyPolarWebhook(
  rawBody: string,
  headers: Record<string, string>
): ReturnType<typeof validateEvent> {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) throw new Error("POLAR_WEBHOOK_SECRET not set");
  return validateEvent(rawBody, headers, secret);
}
