import crypto from "crypto";
import { absoluteUrl } from "@/lib/site-url";

function getNewsletterSecret(): string {
  const secret =
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.REPORT_TOKEN_SALT?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.CHECKOUT_TOKEN_ENCRYPTION_KEY?.trim();

  if (!secret || secret.length < 32) {
    throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET or another 32+ character server secret is required");
  }

  return secret;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function signNewsletterUnsubscribe(email: string): string {
  return crypto
    .createHmac("sha256", getNewsletterSecret())
    .update(normalizeEmail(email), "utf8")
    .digest("base64url");
}

export function verifyNewsletterUnsubscribe(email: string, token: string): boolean {
  const expected = signNewsletterUnsubscribe(email);
  const expectedBytes = Buffer.from(expected);
  const actualBytes = Buffer.from(token);

  return expectedBytes.length === actualBytes.length && crypto.timingSafeEqual(expectedBytes, actualBytes);
}

export function buildNewsletterUnsubscribeUrl(email: string): string {
  const url = new URL("/api/newsletter/unsubscribe", absoluteUrl("/"));
  const normalized = normalizeEmail(email);
  url.searchParams.set("email", normalized);
  url.searchParams.set("token", signNewsletterUnsubscribe(normalized));
  return url.toString();
}
