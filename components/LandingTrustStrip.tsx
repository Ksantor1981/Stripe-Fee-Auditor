import Link from "next/link";
import { getTranslations } from "next-intl/server";

const TRUST_ITEM_KEYS = [
  "noOAuth",
  "rawCsvNotStored",
  "deterministic",
  "logicOnGitHub",
] as const;

/** Compact trust + pricing — one visual row, no paragraph wall. */
export async function LandingTrustStrip() {
  const t = await getTranslations("trust");
  const tc = await getTranslations("common");

  return (
    <div className="mt-5 max-w-xl space-y-2 text-center">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600">
        {TRUST_ITEM_KEYS.map((key, i) => (
          <span key={key} className="inline-flex items-center gap-2">
            {i > 0 ? <span className="text-gray-300" aria-hidden>·</span> : null}
            {key === "logicOnGitHub" ? (
              <a
                href="https://github.com/Ksantor1981/Stripe-Fee-Auditor"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 underline hover:text-blue-800"
              >
                {t(key)}
              </a>
            ) : (
              <span>{t(key)}</span>
            )}
          </span>
        ))}
      </p>
      <p className="text-sm font-medium text-gray-700">{t("pricingLine")}</p>
      <p className="text-xs text-gray-500">
        <Link href="/about" className="underline hover:text-gray-800">
          {tc("about")}
        </Link>
        {" · "}
        <Link href="/privacy#security" className="underline hover:text-gray-800">
          {tc("dataHandling")}
        </Link>
      </p>
    </div>
  );
}
