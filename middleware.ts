import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Strip UTM query params so /analyze has one canonical URL in Search Console. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/analyze") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  let changed = false;
  for (const key of UTM_PARAMS) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }

  if (changed) {
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/analyze",
};
