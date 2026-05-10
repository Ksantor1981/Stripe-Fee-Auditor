import crypto from "crypto";

/** Timing-safe comparison for `Authorization: Bearer <secret>` (Vercel Cron). */
export function verifyCronBearer(authHeader: string | null, secret: string | undefined): boolean {
  if (!secret) return false;
  const prefix = "Bearer ";
  const expected = Buffer.from(`${prefix}${secret}`, "utf8");
  const actual = Buffer.from(authHeader ?? "", "utf8");
  if (expected.length !== actual.length) return false;
  try {
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
