export const locales = ["en", "ru"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  ru: "Русский",
};

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Prefer Russian when Accept-Language starts with ru. */
export function localeFromAcceptLanguage(header: string | null): AppLocale | null {
  if (!header) return null;
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("ru")) return "ru";
  return null;
}
