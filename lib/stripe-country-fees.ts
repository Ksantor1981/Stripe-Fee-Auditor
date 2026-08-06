/**
 * Published Stripe card pricing by account country — illustrative, not a live API.
 * Source: stripe.com/{us,gb,ie,ca,au}/pricing (2025–2026). Simplified cross-border uplifts;
 * UK/EU use tiered intl rates on Stripe's site (+1.9%/+2.9% UK, +1.1% EU non-EEA) — see FAQ.
 * Custom/IC+ accounts: Dashboard → Settings → Plans and fees.
 */

export type StripeAccountCountry = "US" | "UK" | "EU" | "CA" | "AU";

export interface CountryFeeProfile {
  id: StripeAccountCountry;
  label: string;
  /** Domestic online card percent (major units, e.g. 0.029 = 2.9%). */
  domesticPercent: number;
  /** Fixed fee per charge in major currency units. */
  domesticFixed: number;
  /** Cross-border uplift when card country differs from account country. */
  crossBorderPercent: number;
  /** Currency conversion uplift when settlement currency differs. */
  currencyConversionPercent: number;
  currency: string;
  /** ISO card-country codes treated as domestic for this account region. */
  domesticCardCountries: readonly string[];
}

export const STRIPE_ACCOUNT_COUNTRIES: CountryFeeProfile[] = [
  {
    id: "US",
    label: "United States",
    domesticPercent: 0.029,
    domesticFixed: 0.3,
    crossBorderPercent: 0.015,
    currencyConversionPercent: 0.01,
    currency: "USD",
    domesticCardCountries: ["US"],
  },
  {
    id: "UK",
    label: "United Kingdom",
    domesticPercent: 0.015,
    domesticFixed: 0.2,
    /** Simplified; Stripe GB: +1.9% non-UK EEA cards, +2.9% non-EEA — stripe.com/gb/pricing */
    crossBorderPercent: 0.015,
    currencyConversionPercent: 0.02,
    currency: "GBP",
    domesticCardCountries: ["GB"],
  },
  {
    id: "EU",
    label: "European Union",
    domesticPercent: 0.015,
    domesticFixed: 0.25,
    /** Simplified; Stripe EU: +1.1% for cards issued outside EEA — stripe.com/ie/pricing */
    crossBorderPercent: 0.015,
    currencyConversionPercent: 0.02,
    currency: "EUR",
    domesticCardCountries: [
      "AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "IE",
      "IS", "IT", "LI", "LT", "LU", "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK",
    ],
  },
  {
    id: "CA",
    label: "Canada",
    domesticPercent: 0.029,
    domesticFixed: 0.3,
    /** International cards: +0.8% — stripe.com/ca/pricing */
    crossBorderPercent: 0.008,
    currencyConversionPercent: 0.02,
    currency: "CAD",
    domesticCardCountries: ["CA"],
  },
  {
    id: "AU",
    label: "Australia",
    /** Domestic online cards: 1.7% + A$0.30 — stripe.com/au/pricing (lower pricing from 1 Oct 2026). */
    domesticPercent: 0.017,
    domesticFixed: 0.3,
    /** International cards: +2.0% — stripe.com/au/pricing */
    crossBorderPercent: 0.02,
    currencyConversionPercent: 0.02,
    currency: "AUD",
    domesticCardCountries: ["AU"],
  },
];

export function isStripeAccountCountry(value: unknown): value is StripeAccountCountry {
  return typeof value === "string" && STRIPE_ACCOUNT_COUNTRIES.some((country) => country.id === value);
}

export function getCountryFeeProfile(id: StripeAccountCountry): CountryFeeProfile {
  return STRIPE_ACCOUNT_COUNTRIES.find((c) => c.id === id) ?? STRIPE_ACCOUNT_COUNTRIES[0];
}

export function isDomesticCardCountry(
  cardCountry: string | null | undefined,
  accountCountry: StripeAccountCountry
): boolean | undefined {
  const normalized = cardCountry?.trim().toUpperCase();
  if (!normalized) return undefined;
  return getCountryFeeProfile(accountCountry).domesticCardCountries.includes(normalized);
}

export function estimateCountryStripeFee(params: {
  amount: number;
  accountCountry: StripeAccountCountry;
  /** Share of volume from cards issued outside the account country (0–1). */
  internationalShare: number;
  /** Share of charges needing currency conversion (0–1). */
  fxShare?: number;
}): {
  publishedFee: number;
  estimatedFee: number;
  effectiveRate: number;
  profile: CountryFeeProfile;
} {
  const profile = getCountryFeeProfile(params.accountCountry);
  const amount = Math.max(params.amount, 0);
  const intlShare = Math.min(1, Math.max(0, params.internationalShare));
  const fxShare = Math.min(1, Math.max(0, params.fxShare ?? intlShare * 0.35));
  const chargeCount = amount > 0 ? Math.max(1, Math.round(amount / 50)) : 0;

  const base = amount * profile.domesticPercent + chargeCount * profile.domesticFixed;
  const intlExtra = amount * intlShare * profile.crossBorderPercent;
  const fxExtra = amount * fxShare * profile.currencyConversionPercent;
  const estimatedFee = base + intlExtra + fxExtra;
  const publishedFee = base;

  return {
    publishedFee,
    estimatedFee,
    effectiveRate: amount > 0 ? estimatedFee / amount : 0,
    profile,
  };
}
