import type { NextRequest } from "next/server";

/** Single hop from trusted proxy headers (Vercel). Returns null if unusable for rate limiting. */
export function getTrustedClientIp(req: NextRequest): string | null {
  const raw =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip")?.trim() ??
    null;

  if (!raw) return null;
  const lowered = raw.toLowerCase();
  if (lowered === "unknown" || lowered === "::") return null;

  return raw;
}
