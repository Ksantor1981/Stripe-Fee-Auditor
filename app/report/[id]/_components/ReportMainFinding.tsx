"use client";

import type { FreeDiagnosis } from "@/lib/free-diagnosis";
import { useTranslatedDiagnosis } from "@/lib/i18n/report-insights";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";
import { useFmtMoney } from "@/lib/report-currency";

interface Props {
  diagnosis?: FreeDiagnosis;
  fallback?: string;
}

export function ReportMainFinding({ diagnosis, fallback }: Props) {
  const fmt$ = useFmtMoney();
  const { t } = useReportTranslations();
  const translated = useTranslatedDiagnosis(diagnosis);

  if (!diagnosis) {
    return fallback ? (
      <p className="mt-3 max-w-2xl text-sm font-medium text-gray-700">{fallback}</p>
    ) : null;
  }

  return (
    <section className="mt-5 rounded-xl border border-gray-200 border-l-4 border-l-blue-600 bg-[#fafaf7] p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
        {t("emailGate.freeDiagnosis")}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-950">
          {translated?.title ?? diagnosis.title}
        </h2>
        <p className="text-lg font-bold tabular-nums text-amber-700">
          {fmt$(diagnosis.amount)}
        </p>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">
        {translated?.body ?? diagnosis.body}
      </p>
      {(translated?.disclaimer ?? diagnosis.disclaimer) ? (
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          {translated?.disclaimer ?? diagnosis.disclaimer}
        </p>
      ) : null}
    </section>
  );
}
