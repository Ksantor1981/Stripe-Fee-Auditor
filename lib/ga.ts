/**
 * GA4 Measurement ID is public (embedded in every page that loads gtag).
 * Prefer NEXT_PUBLIC_GA_MEASUREMENT_ID when set (e.g. Vercel env);
 * fallback keeps Ads/tag verification working when the dashboard is unavailable.
 */
export const DEFAULT_GA_MEASUREMENT_ID = "G-ZZPYWFYNEB";

export function getGaMeasurementId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return fromEnv || DEFAULT_GA_MEASUREMENT_ID;
}
