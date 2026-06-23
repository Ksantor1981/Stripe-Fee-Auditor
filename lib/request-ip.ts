import type { NextRequest } from "next/server";

function firstHeaderIp(value: string | null): string | null {
  const raw = value?.split(",")[0]?.trim() ?? null;
  if (!raw) return null;

  const lowered = raw.toLowerCase();
  if (lowered === "unknown" || lowered === "::") return null;

  return raw;
}

/**
 * Single hop from trusted proxy headers. Vercel's own runtime is trusted;
 * self-hosted proxy headers are trusted only when explicitly opted in.
 */
export function getTrustedClientIp(req: NextRequest): string | null {
  const vercelIp = firstHeaderIp(req.headers.get("x-vercel-forwarded-for"));
  if (vercelIp) return vercelIp;

  const trustGenericProxyHeaders =
    process.env.VERCEL === "1" || process.env.TRUST_PROXY === "1";
  if (!trustGenericProxyHeaders) return null;

  return (
    firstHeaderIp(req.headers.get("x-forwarded-for")) ??
    firstHeaderIp(req.headers.get("x-real-ip"))
  );
}
