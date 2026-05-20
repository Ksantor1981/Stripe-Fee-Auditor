import type { NextRequest, NextResponse } from "next/server";
import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { decryptSecretPayload, encryptSecretPayload } from "@/lib/token-crypto";

const COOKIE_PREFIX = "sfa_ra_";
/** Matches paid-report TTL (30 days). */
export const REPORT_ACCESS_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

interface ReportAccessPayload {
  reportId: string;
  accessToken: string;
  exp: number;
}

export function reportAccessCookieName(reportId: string): string {
  return `${COOKIE_PREFIX}${reportId.replace(/-/g, "")}`;
}

function sealReportAccess(reportId: string, accessToken: string): string {
  const payload: ReportAccessPayload = {
    reportId,
    accessToken,
    exp: Date.now() + REPORT_ACCESS_COOKIE_MAX_AGE_SEC * 1000,
  };
  return encryptSecretPayload(JSON.stringify(payload));
}

function openReportAccessCookie(
  cookieValue: string,
  expectedReportId: string
): string | null {
  try {
    const parsed = JSON.parse(decryptSecretPayload(cookieValue)) as ReportAccessPayload;
    if (
      parsed.reportId !== expectedReportId ||
      typeof parsed.accessToken !== "string" ||
      !parsed.accessToken ||
      typeof parsed.exp !== "number" ||
      parsed.exp < Date.now()
    ) {
      return null;
    }
    return parsed.accessToken;
  } catch {
    return null;
  }
}

export function appendReportAccessCookie(
  res: NextResponse,
  reportId: string,
  accessToken: string
): void {
  res.cookies.set(reportAccessCookieName(reportId), sealReportAccess(reportId, accessToken), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REPORT_ACCESS_COOKIE_MAX_AGE_SEC,
  });
}

export function getReportAccessFromCookies(
  cookieStore: Pick<RequestCookies, "get">,
  reportId: string
): string | null {
  const raw = cookieStore.get(reportAccessCookieName(reportId))?.value;
  if (!raw) return null;
  return openReportAccessCookie(raw, reportId);
}

/** Query `token` is legacy/email fallback; middleware exchanges it into the httpOnly cookie. */
export function resolveReportAccessToken(
  reportId: string,
  options: {
    cookieStore?: Pick<RequestCookies, "get">;
    queryToken?: string | null;
    bodyToken?: string | null;
  }
): string {
  const fromCookie = options.cookieStore
    ? getReportAccessFromCookies(options.cookieStore, reportId)
    : null;
  if (fromCookie) return fromCookie;

  const query = options.queryToken?.trim();
  if (query) return query;

  const body = options.bodyToken?.trim();
  if (body) return body;

  return "";
}

export function resolveReportAccessFromRequest(
  req: NextRequest,
  reportId: string,
  bodyToken?: string | null
): string {
  return resolveReportAccessToken(reportId, {
    cookieStore: req.cookies,
    queryToken: req.nextUrl.searchParams.get("token"),
    bodyToken,
  });
}
