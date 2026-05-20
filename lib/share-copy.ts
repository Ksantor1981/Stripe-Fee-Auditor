/** Share intent URLs — never include report tokens (only marketing site URL). */

import { buildMarketingSiteUrl } from "@/lib/utm";

export const ADVERTISED_CARD_RATE_PCT = 2.9;

export function formatRateForTweet(rate: number): string {
  const rounded = Math.round(rate * 10) / 10;
  return `${rounded.toFixed(1)}%`;
}

export function buildTwitterIntentUrl(params: {
  actualRatePct: number;
  siteUrl: string;
  twitterHandle?: string;
}): string {
  const handle = (params.twitterHandle ?? "feeauditor").replace(/^@/, "");
  const actual = formatRateForTweet(params.actualRatePct);
  const advertised = ADVERTISED_CARD_RATE_PCT.toFixed(1).replace(/\.0$/, "");
  const text =
    `I thought my Stripe fee was ${advertised}%. Turns out it's ${actual}. Audited with @${handle}`;
  const marketingUrl = buildMarketingSiteUrl(params.siteUrl, {
    source: "twitter",
    medium: "social",
    campaign: "share_snippet",
  });
  const url = new URL("https://twitter.com/intent/tweet");
  url.searchParams.set("text", text);
  url.searchParams.set("url", marketingUrl);
  return url.toString();
}
