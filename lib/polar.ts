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

function getPolarServer(): "sandbox" | "production" {
  const raw = process.env.POLAR_SERVER?.trim().toLowerCase();
  return raw === "sandbox" ? "sandbox" : "production";
}

function getPolarClient(): Polar | null {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  return accessToken ? new Polar({ accessToken, server: getPolarServer() }) : null;
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
    let checkout;
    try {
      checkout = await polar.checkouts.create({
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
    } catch (err) {
      const server = getPolarServer();
      const base =
        err instanceof Error && /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(err.message)
          ? `Polar API unreachable (server=${server}). Verify POLAR_ACCESS_TOKEN and POLAR_PRODUCT_PRO are from the same Polar environment; set POLAR_SERVER=sandbox if using sandbox credentials.`
          : err instanceof Error
            ? err.message
            : "Polar checkout creation failed";
      throw new Error(base);
    }

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
