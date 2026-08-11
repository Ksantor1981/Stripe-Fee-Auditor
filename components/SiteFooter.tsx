import Link from "next/link";
import { getTranslations } from "next-intl/server";

/** Shared site footer — home and marketing pages. */
export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");

  const seoLinks = t.raw("seoLinks") as { href: string; label: string }[];
  const blogLinks = t.raw("blogLinks") as { href: string; label: string }[];

  return (
    <footer className="border-t bg-[var(--page-band)]/60 px-4 py-8 text-center text-xs text-gray-600 space-y-2">
      <p>{t("updated")}</p>
      <p>
        {t("disclaimer")}{" "}
        <Link href="/how-it-works" className="underline hover:text-gray-900">
          {tn("howItWorks")}
        </Link>
        {" · "}
        <Link href="/pricing" className="underline hover:text-gray-900">
          {tn("pricing")}
        </Link>
        {" · "}
        <Link href="/privacy" className="underline hover:text-gray-900">
          {t("privacyPolicy")}
        </Link>
        {" · "}
        <Link href="/terms" className="underline hover:text-gray-900">
          {t("termsOfService")}
        </Link>
        {" · "}
        <Link href="/refund" className="underline hover:text-gray-900">
          {t("refundPolicy")}
        </Link>
      </p>
      <p className="flex justify-center gap-3 flex-wrap">
        {seoLinks.map((link, index) => (
          <span key={link.href} className="contents">
            {index > 0 ? <span className="text-gray-400">·</span> : null}
            <Link href={link.href} className="underline hover:text-gray-900">
              {link.label}
            </Link>
          </span>
        ))}
      </p>
      <p className="flex justify-center gap-3 flex-wrap">
        <a
          href="https://github.com/Ksantor1981/Stripe-Fee-Auditor"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-900"
        >
          GitHub
        </a>
        {blogLinks.map((link) => (
          <span key={link.href} className="contents">
            <span className="text-gray-400">·</span>
            <Link href={link.href} className="underline hover:text-gray-900">
              {link.label}
            </Link>
          </span>
        ))}
      </p>
    </footer>
  );
}
