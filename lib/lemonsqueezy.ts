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

export function buildCheckoutUrl(planId: PlanId, reportId: string, email?: string): string {
  const variantId = process.env[PLANS[planId].variantEnvKey];
  const store = process.env.LEMONSQUEEZY_STORE_SUBDOMAIN;

  if (!variantId || !store) {
    throw new Error(`LemonSqueezy not configured: missing ${PLANS[planId].variantEnvKey} or LEMONSQUEEZY_STORE_SUBDOMAIN`);
  }

  const url = new URL(`https://${store}.lemonsqueezy.com/checkout/buy/${variantId}`);
  url.searchParams.set("checkout[custom][report_id]", reportId);
  if (email) url.searchParams.set("checkout[email]", email);

  return url.toString();
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}
