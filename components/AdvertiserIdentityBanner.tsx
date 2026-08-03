import Link from "next/link";

type Props = {
  className?: string;
  /** Compact one-liner under CTAs; default is a short banner box. */
  variant?: "banner" | "inline";
};

/**
 * Clear advertiser identity for Google Ads / brand-confusion policies.
 * States who operates the site and that it is not Stripe.
 */
export function AdvertiserIdentityBanner({ className = "", variant = "banner" }: Props) {
  const body = (
    <>
      <span className="font-semibold text-gray-900">Fee Auditor</span> (
      <Link href="/" className="underline underline-offset-2 hover:text-gray-800">
        feeauditor.com
      </Link>
      ) is an independent tool. Not affiliated with, endorsed by, or part of Stripe, Inc.
    </>
  );

  if (variant === "inline") {
    return <p className={`text-xs leading-relaxed text-gray-500 ${className}`}>{body}</p>;
  }

  return (
    <aside
      className={`rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600 ${className}`}
      role="note"
    >
      <p>{body}</p>
    </aside>
  );
}
