"use client";

import { trackEvent } from "@/lib/analytics";
import { chromeExtensionReviewHref } from "@/lib/chrome-extension";

interface Props {
  placement: string;
  className?: string;
}

/**
 * Soft review ask after value (sample or full report). No stars, bonuses, or incentives —
 * Chrome Web Store forbids rating/install manipulation.
 */
export function ChromeWebStoreReviewAsk({ placement, className = "" }: Props) {
  const href = chromeExtensionReviewHref();

  function onClick() {
    trackEvent("funnel_chrome_review_ask_click", { placement });
  }

  return (
    <p className={`text-xs leading-relaxed text-gray-500 ${className}`.trim()}>
      If this helped you understand your Stripe fees, a{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 hover:underline"
        onClick={onClick}
      >
        Chrome Web Store review
      </a>{" "}
      helps other founders find it.
    </p>
  );
}
