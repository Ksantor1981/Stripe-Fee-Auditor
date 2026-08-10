export const locales = ["en", "es", "de", "fr", "hi", "ru"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
  hi: "हिन्दी",
  ru: "Русский",
};

/** Short codes shown in the nav select. */
export const localeShortLabels: Record<AppLocale, string> = {
  en: "EN",
  es: "ES",
  de: "DE",
  fr: "FR",
  hi: "HI",
  ru: "RU",
};

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

const ACCEPT_LANGUAGE_MAP: { prefix: string; locale: AppLocale }[] = [
  { prefix: "es", locale: "es" },
  { prefix: "de", locale: "de" },
  { prefix: "fr", locale: "fr" },
  { prefix: "hi", locale: "hi" },
  { prefix: "ru", locale: "ru" },
];

/** First matching browser language, or null → default en. */
export function localeFromAcceptLanguage(header: string | null): AppLocale | null {
  if (!header) return null;
  const tags = header.split(",").map((part) => part.trim().split(";")[0]?.toLowerCase() ?? "");
  for (const tag of tags) {
    for (const { prefix, locale } of ACCEPT_LANGUAGE_MAP) {
      if (tag === prefix || tag.startsWith(`${prefix}-`)) return locale;
    }
  }
  return null;
}
