import { getCountryFeeProfile, type StripeAccountCountry } from "./stripe-country-fees";

export type SettlementValidationErrorCode =
  | "multi_currency"
  | "currency_mismatch"
  | "missing_currency";

export type SettlementValidationResult =
  | { ok: true; currency: string }
  | { ok: false; error: string; code: SettlementValidationErrorCode };

/** Single settlement currency per export; must match the selected Stripe account country profile. */
export function validateSettlementCurrency(
  currencies: string[],
  accountCountry: StripeAccountCountry
): SettlementValidationResult {
  const normalized = [
    ...new Set(currencies.map((c) => c?.trim().toUpperCase()).filter(Boolean)),
  ];

  if (normalized.length === 0) {
    return {
      ok: false,
      code: "missing_currency",
      error: "No currency found in CSV rows.",
    };
  }

  if (normalized.length > 1) {
    return {
      ok: false,
      code: "multi_currency",
      error: `Mixed currencies in one export (${normalized.join(", ")}). Export a single settlement currency or filter in Stripe.`,
    };
  }

  const profile = getCountryFeeProfile(accountCountry);
  const expected = profile.currency.toUpperCase();
  const actual = normalized[0]!;

  if (actual !== expected) {
    return {
      ok: false,
      code: "currency_mismatch",
      error: `Expected ${expected} for ${profile.label} accounts, but CSV uses ${actual}. Pick the matching Stripe account country above.`,
    };
  }

  return { ok: true, currency: actual };
}
