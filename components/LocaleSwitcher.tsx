"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { localeLabels, locales, LOCALE_COOKIE, type AppLocale } from "@/i18n/config";

type Props = {
  className?: string;
  /** Compact EN / RU toggle for nav. */
  compact?: boolean;
};

export function LocaleSwitcher({ className = "", compact = true }: Props) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");

  function switchLocale(next: AppLocale) {
    if (next === locale) return;
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${maxAge};SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className={className} role="group" aria-label={t("language")}>
      {locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            aria-pressed={active}
            className={
              compact
                ? `rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                : `rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                  }`
            }
          >
            {compact ? code.toUpperCase() : localeLabels[code]}
          </button>
        );
      })}
    </div>
  );
}
