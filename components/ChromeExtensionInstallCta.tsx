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
        className={`flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
            CH
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">Stripe Fee Auditor · Chrome</p>
            <p className="truncate text-xs text-gray-500">CSV helper · no OAuth · no API keys</p>
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="interactive-lift inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-[#f0f1ee] px-3 py-2 text-xs font-semibold text-gray-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
