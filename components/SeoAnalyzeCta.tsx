import Link from "next/link";

type Props = {
  /** Optional context line above the buttons. */
  title?: string;
  description?: string;
  /** Primary button label */
  primaryLabel?: string;
  className?: string;
};

/**
 * Ranking-page CTA: one primary action → /analyze. Sample is secondary only.
 */
export function SeoAnalyzeCta({
  title = "Audit your real Stripe fee rate",
  description = "Upload a Balance CSV — no OAuth. Free preview first.",
  primaryLabel = "Analyze My CSV →",
  className = "",
}: Props) {
  return (
    <div className={`rounded-xl border border-blue-100 bg-blue-50 px-5 py-6 ${className}`}>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/analyze"
          className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          {primaryLabel}
        </Link>
        <Link
          href="/analyze?sample=1"
          className="inline-flex justify-center text-center text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
        >
          Or try sample in 10s
        </Link>
      </div>
    </div>
  );
}
