"use client";

import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";
import { chromeExtensionInstallHref } from "@/lib/chrome-extension";

type Variant = "inline" | "card" | "quiet";

interface Props {
  placement: string;
  variant?: Variant;
  className?: string;
}

export function ChromeExtensionInstallCta({
  placement,
  variant = "inline",
  className = "",
}: Props) {
  const href = chromeExtensionInstallHref();
  const t = useTranslations("chromeExtension");

  function onClick() {
    trackEvent("funnel_chrome_extension_cta", { placement });
  }

  if (variant === "quiet") {
    return (
      <p className={`text-xs text-gray-500 ${className}`.trim()}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:underline"
          onClick={onClick}
        >
          {t("installCta")}
        </a>
      </p>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`rounded-xl border border-gray-200 bg-white px-5 py-4 ${className}`.trim()}
      >
        <p className="text-sm font-semibold text-gray-900">{t("installCta")}</p>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          {t("heroDescription")}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="interactive-lift mt-3 inline-flex rounded-lg border border-gray-200 bg-[#f0f1ee] px-4 py-2 text-sm font-semibold text-gray-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          {t("installCta")} →
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="interactive-lift inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        {t("installCta")}
      </a>
    </div>
  );
}
