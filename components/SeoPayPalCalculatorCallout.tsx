import Link from "next/link";

/** Laconic note for PayPal calculator search traffic — list price vs actual CSV audit. */
export function SeoPayPalCalculatorCallout({
  className = "",
  hideStripeCalculatorLink = false,
}: {
  className?: string;
  hideStripeCalculatorLink?: boolean;
}) {
  return (
    <aside
      className={`rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-gray-700 ${className}`}
    >
      <p>
        <span className="font-medium text-gray-900">PayPal fee calculator?</span> Those tools estimate
        published PayPal rates. If you also run Stripe, compare use cases first, then audit your{" "}
        <strong>actual</strong> Balance CSV — not a single-transaction guess.
      </p>
      <p className="mt-2 text-xs text-gray-600">
        <Link href="/compare-stripe-paypal-wise" className="font-medium text-blue-700 underline hover:text-blue-800">
          Stripe vs PayPal vs Wise
        </Link>
        {hideStripeCalculatorLink ? null : (
          <>
            {" · "}
            <Link href="/stripe-fee-calculator" className="font-medium text-blue-700 underline hover:text-blue-800">
              Stripe fee calculator
            </Link>
          </>
        )}
        {" · "}
        <Link href="/analyze" className="font-medium text-blue-700 underline hover:text-blue-800">
          Upload CSV
        </Link>
      </p>
    </aside>
  );
}
