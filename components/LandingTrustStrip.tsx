import Link from "next/link";

const TRUST_ITEMS = [
  "No Stripe OAuth",
  "Raw CSV not stored",
  "Deterministic — not LLM",
  "Logic on GitHub",
] as const;

/** Compact trust + pricing — one visual row, no paragraph wall. */
export function LandingTrustStrip() {
  return (
    <div className="mt-5 max-w-xl space-y-2 text-center">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600">
        {TRUST_ITEMS.map((item, i) => (
          <span key={item} className="inline-flex items-center gap-2">
            {i > 0 ? <span className="text-gray-300" aria-hidden>·</span> : null}
            {item === "Logic on GitHub" ? (
              <a
                href="https://github.com/Ksantor1981/Stripe-Fee-Auditor"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 underline hover:text-blue-800"
              >
                {item}
              </a>
            ) : (
              <span>{item}</span>
            )}
          </span>
        ))}
      </p>
      <p className="text-sm font-medium text-gray-700">
        Free preview · Full audit $12 · Monitor $9/mo
      </p>
      <p className="text-xs text-gray-500">
        Built by{" "}
        <Link href="/about" className="font-medium text-blue-700 underline hover:text-blue-800">
          Konstantin Starkov
        </Link>
        {" · "}
        <Link href="/privacy#security" className="underline hover:text-gray-800">
          Data handling
        </Link>
      </p>
    </div>
  );
}
