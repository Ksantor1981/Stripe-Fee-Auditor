import crypto from "crypto";

export type PlanId = "basic" | "pro" | "team";

export const PLANS: Record<PlanId, { label: string; price: string; desc: string; variantEnvKey: string }> = {
  basic: {
    label: "Basic Report",
    price: "$5",
    desc: "Full anomaly list + CSV export",
    variantEnvKey: "LEMONSQUEEZY_VARIANT_BASIC",
  },
  pro: {
    label: "Pro Report",
    price: "$12",
    desc: "Everything + PDF export + monthly breakdown",
    variantEnvKey: "LEMONSQUEEZY_VARIANT_PRO",
  },
  team: {
    label: "Team",
    price: "$29",
    desc: "Pro + 5 reports + priority support",
    variantEnvKey: "LEMONSQUEEZY_VARIANT_TEAM",
  },
};

export function isPlanId(value: string | null): value is PlanId {
  return value === "basic" || value === "pro" || value === "team";
}

export function isAllowedVariantId(variantId: string): boolean {
  const allowed = Object.values(PLANS)
    .map((plan) => process.env[plan.variantEnvKey])
    .filter(Boolean);
  return allowed.includes(variantId);
}

export function buildCheckoutUrl(planId: PlanId, reportId: string, accessToken: string, email?: string): string {
  const variantId = process.env[PLANS[planId].variantEnvKey];
  const store = process.env.LEMONSQUEEZY_STORE_SUBDOMAIN;

  if (!variantId || !store) {
    throw new Error(`LemonSqueezy not configured: missing ${PLANS[planId].variantEnvKey} or LEMONSQUEEZY_STORE_SUBDOMAIN`);
  }

  const url = new URL(`https://${store}.lemonsqueezy.com/checkout/buy/${variantId}`);
  url.searchParams.set("checkout[custom][report_id]", reportId);
  url.searchParams.set("checkout[custom][access_token]", accessToken);
  if (email) url.searchParams.set("checkout[email]", email);

  return url.toString();
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}
