"use client";

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

  function onClick() {
    trackEvent("funnel_chrome_extension_cta", { placement });
  }

  if (variant === "quiet") {
    return (
      <p className={`text-xs text-gray-500 ${className}`.trim()}>
        Prefer a monthly nudge in the browser?{" "}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:underline"
          onClick={onClick}
        >
          Install Chrome helper
        </a>
        {" "}
        (secondary — sample report stays the main path).
      </p>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`rounded-xl border border-gray-200 bg-white px-5 py-4 ${className}`.trim()}
      >
        <p className="text-sm font-semibold text-gray-900">Install Chrome helper</p>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">
          Open Stripe Balance export, jump back to Fee Auditor, optional monthly reminder. No OAuth
          or API keys.
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="mt-3 inline-flex rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          Install Chrome helper →
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
        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        Install Chrome helper
      </a>
    </div>
  );
}
