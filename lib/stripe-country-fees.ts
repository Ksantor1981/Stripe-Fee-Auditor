/** Published Stripe card pricing by account country — illustrative, not a live API. */

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
  },
  {
    id: "UK",
    label: "United Kingdom",
    domesticPercent: 0.015,
    domesticFixed: 0.2,
    crossBorderPercent: 0.015,
    currencyConversionPercent: 0.02,
    currency: "GBP",
  },
  {
    id: "EU",
    label: "European Union",
    domesticPercent: 0.015,
    domesticFixed: 0.25,
    crossBorderPercent: 0.015,
    currencyConversionPercent: 0.02,
    currency: "EUR",
  },
  {
    id: "CA",
    label: "Canada",
    domesticPercent: 0.029,
    domesticFixed: 0.3,
    crossBorderPercent: 0.015,
    currencyConversionPercent: 0.02,
    currency: "CAD",
  },
  {
    id: "AU",
    label: "Australia",
    domesticPercent: 0.0175,
    domesticFixed: 0.3,
    crossBorderPercent: 0.015,
    currencyConversionPercent: 0.02,
    currency: "AUD",
  },
];

export function getCountryFeeProfile(id: StripeAccountCountry): CountryFeeProfile {
  return STRIPE_ACCOUNT_COUNTRIES.find((c) => c.id === id) ?? STRIPE_ACCOUNT_COUNTRIES[0];
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
