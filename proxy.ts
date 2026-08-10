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

export function proxy(req: NextRequest) {
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
