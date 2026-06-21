import type { NextRequest } from "next/server";

/** First-touch marketing attribution. Set once per visitor (30-day cookie). */
export const ATTRIBUTION_COOKIE = "sfa_attr";
export const ATTRIBUTION_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  landing_path?: string;
  referrer?: string;
}

const MAX_LEN = 200;
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
const ALL_FIELDS = [...UTM_PARAMS, "landing_path", "referrer"] as const;

function clean(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_LEN) : undefined;
}

/** Build first-touch attribution from an incoming request (used in middleware). */
export function buildAttributionFromRequest(req: NextRequest): Attribution {
  const sp = req.nextUrl.searchParams;
  const attr: Attribution = {};

  for (const key of UTM_PARAMS) {
    const v = clean(sp.get(key));
    if (v) attr[key] = v;
  }

  // landing_path is always captured — it lets us segment SEO/blog vs landing
  // even when no UTM is present (organic/direct first touch).
  attr.landing_path = clean(req.nextUrl.pathname) ?? "/";

  // Keep only external referrers; same-origin navigation is not a traffic source.
  const ref = clean(req.headers.get("referer"));
  if (ref && !ref.includes(req.nextUrl.host)) attr.referrer = ref;

  return attr;
}

export function serializeAttribution(attr: Attribution): string {
  return encodeURIComponent(JSON.stringify(attr));
}

export function parseAttributionCookie(value: string | undefined): Attribution | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;

    const out: Attribution = {};
    for (const key of ALL_FIELDS) {
      const v = clean(parsed[key] as string | undefined);
      if (v) out[key] = v;
    }
    return out;
  } catch {
    return null;
  }
}

/** Read first-touch attribution from request cookies (used in API routes). */
export function readAttributionFromRequest(req: NextRequest): Attribution {
  return parseAttributionCookie(req.cookies.get(ATTRIBUTION_COOKIE)?.value) ?? {};
}
