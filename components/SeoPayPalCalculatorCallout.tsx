import Link from "next/link";
import { getTranslations } from "next-intl/server";

/** Laconic note for PayPal calculator search traffic — list price vs actual CSV audit. */
export async function SeoPayPalCalculatorCallout({
  className = "",
  hideStripeCalculatorLink = false,
}: {
  className?: string;
  hideStripeCalculatorLink?: boolean;
}) {
  const t = await getTranslations("paypalCallout");

  return (
    <aside
      className={`rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-gray-700 ${className}`}
    >
      <p>
        <span className="font-medium text-gray-900">{t("title")} </span>
        {t.rich("body", {
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>
      <p className="mt-2 text-xs text-gray-600">
        <Link href="/compare-stripe-paypal-wise" className="font-medium text-blue-700 underline hover:text-blue-800">
          {t("compare")}
        </Link>
        {hideStripeCalculatorLink ? null : (
          <>
            {" · "}
            <Link href="/stripe-fee-calculator" className="font-medium text-blue-700 underline hover:text-blue-800">
              {t("calculator")}
            </Link>
          </>
        )}
        {" · "}
        <Link href="/analyze" className="font-medium text-blue-700 underline hover:text-blue-800">
          {t("upload")}
        </Link>
      </p>
    </aside>
  );
}
