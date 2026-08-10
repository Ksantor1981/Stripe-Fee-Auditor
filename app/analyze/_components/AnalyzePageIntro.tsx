"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

function AnalyzePageIntroInner() {
  const t = useTranslations("analyze");
  const isSample = useSearchParams().get("sample") === "1";

  if (isSample) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900">{t("sampleTitle")}</h1>
        <p className="mt-2 text-base text-gray-600">{t("sampleSubtitle")}</p>
        <p className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <strong>{t("sampleBanner")}</strong> {t("sampleBannerRest")}
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      <p className="mt-2 text-base text-gray-600">{t("subtitle")}</p>
    </>
  );
}

export function AnalyzePageIntro() {
  const t = useTranslations("analyze");

  return (
    <Suspense fallback={<h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>}>
      <AnalyzePageIntroInner />
    </Suspense>
  );
}
