"use client";

import { useReportTranslations } from "@/lib/i18n/use-report-translations";

type PreviewKind = "drivers" | "trends" | "transactions";

export function LockedReportPreview({ kind }: { kind: PreviewKind }) {
  const { t } = useReportTranslations();
  const items =
    kind === "drivers"
      ? [
          t("paywallBanner.includedSavings"),
          t("paywallBanner.includedUnusualCharges"),
          t("paywallBanner.includedLink"),
        ]
      : kind === "trends"
        ? [
            t("paywallBanner.includedMonthly"),
            t("paywallBanner.includedSavings"),
            t("paywallBanner.includedExport"),
          ]
        : [
            t("paywallBanner.includedUnusualCharges"),
            t("paywallBanner.includedSavings"),
            t("paywallBanner.includedExport"),
          ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="select-none space-y-3 opacity-55 blur-[3px]" aria-hidden>
        {items.map((item, index) => (
          <div key={item} className="flex items-center justify-between rounded-xl bg-[#f0f1ee] px-4 py-3">
            <div>
              <p className="text-xs text-gray-500">{item}</p>
              <p className="mt-1 h-3 rounded bg-gray-300" style={{ width: String(150 + index * 34) + "px" }} />
            </div>
            <div className="h-7 w-16 rounded bg-gray-300" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/45">
        <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm">
          🔒 {t("paywallBanner.badge")}
        </span>
      </div>
    </div>
  );
}
