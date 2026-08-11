"use client";

import { useReportTranslations } from "@/lib/i18n/use-report-translations";

export function ReportWorkspaceNav() {
  const { t, tc } = useReportTranslations();
  const items = [
    { href: "#report-overview", label: t("multiMonthReport.tabOverview") },
    { href: "#report-drivers", label: tc("topFeeDrivers") },
    { href: "#report-trends", label: t("multiMonthReport.tabMonthlyDetail") },
    { href: "#report-transactions", label: t("multiMonthReport.tabHighFee") },
  ];

  return (
    <nav
      aria-label="Report sections"
      className="sticky top-16 z-30 mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-[#fbfbf8]/95 p-1.5 shadow-sm backdrop-blur"
    >
      <div className="flex min-w-max gap-1 sm:min-w-0">
        {items.map((item, index) => (
          <a
            key={item.href}
            href={item.href}
            className={`interactive-lift inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors sm:flex-1 ${
              index === 0
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "text-gray-600 hover:bg-white hover:text-gray-950"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}