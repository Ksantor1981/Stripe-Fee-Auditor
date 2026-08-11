import Link from "next/link";
import { getTranslations } from "next-intl/server";

const TRUST_ITEM_KEYS = [
  "noOAuth",
  "rawCsvNotStored",
  "deterministic",
] as const;

/** Compact risk-reversal line beneath the primary landing CTA. */
export async function LandingTrustStrip() {
  const t = await getTranslations("trust");
  const tc = await getTranslations("common");

  return (
    <div className="mt-5 max-w-xl text-center">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-600 sm:text-sm">
        {TRUST_ITEM_KEYS.map((key, index) => (
          <span key={key} className="inline-flex items-center gap-2">
            {index > 0 ? <span className="text-gray-300" aria-hidden>·</span> : null}
            <span>{t(key)}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="text-gray-300" aria-hidden>·</span>
          <Link href="/privacy#security" className="font-medium text-gray-700 underline underline-offset-2 hover:text-gray-950">
            {tc("dataHandling")} →
          </Link>
        </span>
      </p>
    </div>
  );
}
