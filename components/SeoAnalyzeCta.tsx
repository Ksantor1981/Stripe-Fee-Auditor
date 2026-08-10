import Link from "next/link";
import { getTranslations } from "next-intl/server";

type Props = {
  title?: string;
  description?: string;
  primaryLabel?: string;
  showSample?: boolean;
  className?: string;
};

export async function SeoAnalyzeCta({
  title,
  description,
  primaryLabel,
  showSample = true,
  className = "",
}: Props) {
  const t = await getTranslations("seoShell");

  return (
    <div className={`rounded-xl border border-blue-100 bg-blue-50 px-5 py-6 ${className}`}>
      <h2 className="text-lg font-bold text-gray-900">{title ?? t("ctaTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description ?? t("ctaDescription")}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/analyze"
          className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          {primaryLabel ?? t("ctaPrimary")}
        </Link>
        {showSample && (
          <Link
            href="/analyze?sample=1"
            className="inline-flex justify-center text-center text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
          >
            {t("ctaSample")}
          </Link>
        )}
      </div>
    </div>
  );
}
