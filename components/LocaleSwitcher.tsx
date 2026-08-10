"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  localeLabels,
  localeShortLabels,
  locales,
  LOCALE_COOKIE,
  type AppLocale,
} from "@/i18n/config";

type Props = {
  className?: string;
};

export function LocaleSwitcher({ className = "" }: Props) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");

  function switchLocale(next: string) {
    if (!locales.includes(next as AppLocale) || next === locale) return;
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${maxAge};SameSite=Lax`;
    router.refresh();
  }

  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => switchLocale(event.target.value)}
        aria-label={t("language")}
        className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-800 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeShortLabels[code]} · {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
