import { NextRequest, NextResponse } from "next/server";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_COOKIE_MAX_AGE_SEC,
  buildAttributionFromRequest,
  serializeAttribution,
} from "@/lib/attribution";

export const config = {
  // Page routes only. Exclude API (cookie is read there, not set), Next
  // internals, and static files (paths containing a dot).
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};

const STRIP_UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Canonical /analyze URL in Search Console — strip UTM after capturing attribution. */
function redirectAnalyzeWithoutUtm(req: NextRequest): NextResponse | null {
  if (req.nextUrl.pathname !== "/analyze") return null;

  const url = req.nextUrl.clone();
  let changed = false;
  for (const key of STRIP_UTM_PARAMS) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (!changed) return null;

  const res = NextResponse.redirect(url, 301);

  if (!req.cookies.get(ATTRIBUTION_COOKIE)) {
    const attribution = buildAttributionFromRequest(req);
    res.cookies.set(ATTRIBUTION_COOKIE, serializeAttribution(attribution), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ATTRIBUTION_COOKIE_MAX_AGE_SEC,
    });
  }

  return res;
}

export function proxy(req: NextRequest) {
  const utmRedirect = redirectAnalyzeWithoutUtm(req);
  if (utmRedirect) return utmRedirect;

  const res = NextResponse.next();

  // First-touch only: never overwrite an existing attribution cookie.
  if (req.cookies.get(ATTRIBUTION_COOKIE)) return res;

  const attribution = buildAttributionFromRequest(req);

  res.cookies.set(ATTRIBUTION_COOKIE, serializeAttribution(attribution), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ATTRIBUTION_COOKIE_MAX_AGE_SEC,
  });

  return res;
}
