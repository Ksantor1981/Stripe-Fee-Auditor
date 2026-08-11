import Link from "next/link";
import { getTranslations } from "next-intl/server";

/** Shared compact site footer — home and marketing pages. */
export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const ts = await getTranslations("seoShell");

  const groups = [
    {
      title: tn("product"),
      links: [
        { href: "/analyze", label: tn("uploadCsv") },
        { href: "/analyze?sample=1", label: tn("seeSampleReport") },
        { href: "/pricing", label: tn("pricing") },
        { href: "/chrome-extension", label: tn("chromeHelper") },
      ],
    },
    {
      title: tn("resources"),
      links: [
        { href: "/blog", label: tn("blog") },
        { href: "/#faq", label: ts("faqHeading") },
        { href: "/stripe-balance-csv", label: tn("balanceCsvGuide") },
        { href: "/how-it-works", label: tn("howItWorks") },
      ],
    },
    {
      title: tc("about"),
      links: [
        { href: "/about", label: tc("about") },
        { href: "/privacy", label: t("privacyPolicy") },
        { href: "/terms", label: t("termsOfService") },
        { href: "/refund", label: t("refundPolicy") },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-200 bg-[var(--page-band)]/60 px-4 py-10 text-sm text-gray-600">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="text-base font-bold text-gray-950 hover:text-gray-700">
            Fee Auditor
          </Link>
          <p className="mt-2 text-xs text-gray-500">{t("updated")}</p>
          <a
            href="https://github.com/Ksantor1981/Stripe-Fee-Auditor"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-medium underline underline-offset-2 hover:text-gray-950"
          >
            GitHub
          </a>
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">{group.title}</h2>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-gray-950">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-6xl border-t border-gray-200 pt-5 text-xs leading-relaxed text-gray-500">
        {t("disclaimer")}
      </p>
    </footer>
  );
}
