import crypto from "crypto";
import { absoluteUrl } from "@/lib/site-url";

const BILLING_TOKEN_TTL_MS = 30 * 60 * 1000;

function getBillingSecret(): string {
  const secret =
    process.env.BILLING_PORTAL_SECRET?.trim() ||
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.REPORT_TOKEN_SALT?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.CHECKOUT_TOKEN_ENCRYPTION_KEY?.trim();

  if (!secret || secret.length < 32) {
    throw new Error("BILLING_PORTAL_SECRET or another 32+ character server secret is required");
  }

  return secret;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function signBillingPortal(email: string, expires: number): string {
  return crypto
    .createHmac("sha256", getBillingSecret())
    .update(`${normalizeEmail(email)}:${expires}`, "utf8")
    .digest("base64url");
}

export function buildBillingPortalUrl(email: string): string {
  const normalized = normalizeEmail(email);
  const expires = Date.now() + BILLING_TOKEN_TTL_MS;
  const url = new URL("/api/billing/portal", absoluteUrl("/"));
  url.searchParams.set("email", normalized);
  url.searchParams.set("expires", String(expires));
  url.searchParams.set("token", signBillingPortal(normalized, expires));
  return url.toString();
}

export function verifyBillingPortalToken(email: string, expiresRaw: string, token: string): boolean {
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const expected = signBillingPortal(email, expires);
  const expectedBytes = Buffer.from(expected);
  const actualBytes = Buffer.from(token);

  return expectedBytes.length === actualBytes.length && crypto.timingSafeEqual(expectedBytes, actualBytes);
}
