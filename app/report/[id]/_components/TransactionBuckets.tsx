"use client";

import type { TransactionBucket } from "@/lib/fee-analyzer";
import { fmtPct } from "@/lib/format";
import { useFmtMoney } from "@/lib/report-currency";
import { useReportTranslations, useFeeLabelTranslator } from "@/lib/i18n/use-report-translations";

interface Props {
  buckets: TransactionBucket[];
  baselineRate: number;
}

export function TransactionBuckets({ buckets, baselineRate }: Props) {
  const fmt$ = useFmtMoney();
  const { t } = useReportTranslations();
  const translateFeeLabel = useFeeLabelTranslator();

  if (!buckets || buckets.length === 0) return null;

  const maxRate = Math.max(...buckets.map((b) => b.rate));
  const under20Bucket = buckets.find((b) => b.label === "<$20");

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-700">{t("transactionBuckets.title")}</h2>
        <span className="text-xs text-gray-400">
          {t("transactionBuckets.baselineLabel", { rate: fmtPct(baselineRate) })}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">
        {t("transactionBuckets.subtitle")}
      </p>

      <div className="space-y-3">
        {buckets.map((b) => {
          const isHigh = b.rate > baselineRate + 0.5;
          const barWidth = maxRate > 0 ? (b.rate / maxRate) * 100 : 0;
          const bucketLabel = translateFeeLabel(b.label);

          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 w-20">{bucketLabel}</span>
                  <span className="text-xs text-gray-400">
                    {b.count === 0
                      ? t("transactionBuckets.zeroCharges")
                      : t("transactionBuckets.chargeCount", { count: b.count })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500">
                    {b.count === 0 ? "—" : t("transactionBuckets.feesLabel", { amount: fmt$(b.fees) })}
                  </span>
                  <span
                    className={`font-bold w-14 text-right ${
                      b.count === 0 ? "text-gray-400" : isHigh ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {b.count === 0 ? "—" : fmtPct(b.rate)}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isHigh ? "bg-red-400" : "bg-blue-400"
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {maxRate > 0 && (
                <div className="relative h-0">
                  <div
                    className="absolute top-[-8px] w-px h-3 bg-gray-400 opacity-50"
                    style={{ left: `${(baselineRate / maxRate) * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-full bg-blue-400" />
          <span>{t("transactionBuckets.legendNearBaseline")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 rounded-full bg-red-400" />
          <span>{t("transactionBuckets.legendAboveBaseline")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-px h-3 bg-gray-400 opacity-50" />
          <span>{t("transactionBuckets.legendYourBaseline")}</span>
        </div>
      </div>

      {under20Bucket && under20Bucket.rate > baselineRate + 1 && (
        <div className="mt-4 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2.5 text-xs text-orange-800">
          {t("transactionBuckets.smallTicketInsight", { rate: fmtPct(under20Bucket.rate) })}
        </div>
      )}
    </div>
  );
}
