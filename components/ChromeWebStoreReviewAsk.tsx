"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import {
  chromeExtensionReviewHref,
  hasChromeWebStoreListing,
} from "@/lib/chrome-extension";

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
  const external = hasChromeWebStoreListing();

  function onClick() {
    trackEvent("funnel_chrome_review_ask_click", { placement });
  }

  const linkClass = "font-medium text-blue-600 hover:underline";

  return (
    <p className={`text-xs leading-relaxed text-gray-500 ${className}`.trim()}>
      If this helped you understand your Stripe fees, a{" "}
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          onClick={onClick}
        >
          Chrome Web Store review
        </a>
      ) : (
        <Link href={href} className={linkClass} onClick={onClick}>
          Chrome Web Store review
        </Link>
      )}{" "}
      helps other founders find it.
    </p>
  );
}
