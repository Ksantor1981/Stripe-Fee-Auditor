import { getTranslations } from "next-intl/server";

export async function SeoPageTrustFooter() {
  const t = await getTranslations("seoShell");

  return (
    <footer className="mt-16 pt-8 border-t border-gray-100 space-y-2 text-xs text-gray-500 leading-relaxed">
      <p>
        <span className="font-medium text-gray-600">{t("lastUpdated")}</span> {t("lastUpdatedValue")}
      </p>
      <p>{t("trustDisclaimer")}</p>
    </footer>
  );
}
