const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  GBP: "en-GB",
  EUR: "de-DE",
  CAD: "en-CA",
  AUD: "en-AU",
};

export function fmtCurrency(
  value: number,
  currency = "USD",
  decimals = 2,
  locale?: string
): string {
  const code = currency.trim().toUpperCase() || "USD";
  const resolvedLocale = locale ?? CURRENCY_LOCALE[code] ?? "en-US";
  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function fmt$(value: number, decimals = 2): string {
  return fmtCurrency(value, "USD", decimals);
}

export function fmtPct(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function fmtMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function fmtDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
