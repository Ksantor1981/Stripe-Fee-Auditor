"use client";

import { useReportTranslations } from "@/lib/i18n/use-report-translations";

export function PrintButton() {
  const { t } = useReportTranslations();

  return (
    <button className="print-btn no-print" onClick={() => window.print()}>
      {t("print.downloadPdf")}
    </button>
  );
}
