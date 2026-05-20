export type UtmParams = {
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
};

/** Append UTM params to an app path (e.g. `/analyze?sample=1`). */
export function appendUtmToPath(path: string, utm: UtmParams): string {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("utm_source", utm.source);
  if (utm.medium) params.set("utm_medium", utm.medium);
  if (utm.campaign) params.set("utm_campaign", utm.campaign);
  if (utm.content) params.set("utm_content", utm.content);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Marketing URLs for posts (Twitter, IH, Reddit). */
export function buildMarketingSiteUrl(
  baseUrl: string,
  utm: UtmParams
): string {
  const base = baseUrl.replace(/\/$/, "");
  const params = new URLSearchParams({
    utm_source: utm.source,
    ...(utm.medium ? { utm_medium: utm.medium } : {}),
    ...(utm.campaign ? { utm_campaign: utm.campaign } : {}),
    ...(utm.content ? { utm_content: utm.content } : {}),
  });
  return `${base}/?${params.toString()}`;
}
