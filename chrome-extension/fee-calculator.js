/** Published Stripe card pricing — mirrors lib/stripe-country-fees.ts (2025–2026 list rates). */
const ALL_IN_BUFFER_LOW = 0.002;
const ALL_IN_BUFFER_HIGH = 0.006;

const STRIPE_ACCOUNT_COUNTRIES = [
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
    crossBorderPercent: 0.008,
    currencyConversionPercent: 0.02,
    currency: "CAD",
  },
  {
    id: "AU",
    label: "Australia",
    domesticPercent: 0.017,
    domesticFixed: 0.3,
    crossBorderPercent: 0.02,
    currencyConversionPercent: 0.02,
    currency: "AUD",
  },
];

function getCountryProfile(id) {
  return STRIPE_ACCOUNT_COUNTRIES.find((c) => c.id === id) ?? STRIPE_ACCOUNT_COUNTRIES[0];
}

function parseUsd(raw) {
  const value = Number.parseFloat(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function parsePct(raw) {
  const value = Number.parseFloat(String(raw).replace(/%/g, "").trim());
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function formatMoney(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRate(rate) {
  return `${(rate * 100).toFixed(1)}%`;
}

function estimateCountryStripeFee({ amount, accountCountry, internationalShare, fxShare }) {
  const profile = getCountryProfile(accountCountry);
  const safeAmount = Math.max(amount, 0);
  const intlShare = Math.min(1, Math.max(0, internationalShare));
  const fx = Math.min(1, Math.max(0, fxShare ?? intlShare * 0.35));
  const chargeCount = safeAmount > 0 ? Math.max(1, Math.round(safeAmount / 50)) : 0;

  const base = safeAmount * profile.domesticPercent + chargeCount * profile.domesticFixed;
  const intlExtra = safeAmount * intlShare * profile.crossBorderPercent;
  const fxExtra = safeAmount * fx * profile.currencyConversionPercent;
  const estimatedFee = base + intlExtra + fxExtra;

  return {
    publishedFee: base,
    estimatedFee,
    effectiveRate: safeAmount > 0 ? estimatedFee / safeAmount : 0,
    profile,
  };
}

/** Same math as components/stripe-fee-mini-estimate.tsx */
function computeStripeFeeEstimate({
  accountCountry,
  volumeRaw,
  averageChargeRaw,
  intlShareRaw,
  targetNetRaw,
}) {
  const monthlyVolume = parseUsd(volumeRaw);
  const averageCharge = Math.max(parseUsd(averageChargeRaw), 0.01);
  const intlShare = parsePct(intlShareRaw) / 100;
  const targetNet = Math.max(parseUsd(targetNetRaw), 0);
  const chargeCount =
    monthlyVolume > 0 ? Math.max(1, Math.round(monthlyVolume / averageCharge)) : 0;

  const countryEstimate = estimateCountryStripeFee({
    amount: monthlyVolume,
    accountCountry,
    internationalShare: intlShare,
  });
  const profile = countryEstimate.profile;
  const publishedFee =
    monthlyVolume > 0
      ? monthlyVolume * profile.domesticPercent + chargeCount * profile.domesticFixed
      : 0;
  const publishedRate = monthlyVolume > 0 ? publishedFee / monthlyVolume : 0;
  const midRate = countryEstimate.effectiveRate;
  const lowRate = midRate + ALL_IN_BUFFER_LOW;
  const highRate = midRate + ALL_IN_BUFFER_HIGH + intlShare * 0.002;
  const midFee = monthlyVolume * midRate;
  const gapVsPublished = Math.max(0, midFee - publishedFee);
  const reverseGross =
    targetNet > 0 && profile.domesticPercent < 1
      ? (targetNet + profile.domesticFixed) / (1 - profile.domesticPercent)
      : 0;
  const reverseFee = Math.max(0, reverseGross - targetNet);

  return {
    monthlyVolume,
    chargeCount,
    profile,
    publishedFee,
    publishedRate,
    lowRate,
    highRate,
    midFee,
    gapVsPublished,
    targetNet,
    reverseGross,
    reverseFee,
  };
}

if (typeof globalThis !== "undefined") {
  globalThis.FeeCalculator = {
    STRIPE_ACCOUNT_COUNTRIES,
    computeStripeFeeEstimate,
    formatMoney,
    formatRate,
  };
}
