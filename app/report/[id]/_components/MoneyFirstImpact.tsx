"use client";

import type { SavingsOpportunity } from "@/lib/fee-analyzer";
import { fmt$ } from "@/lib/format";
import { resolvePaywallImpact } from "@/lib/paywall-impact";
import type { FreeDiagnosis } from "@/lib/free-diagnosis";
import { PaywallBanner } from "./PaywallBanner";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  reportId: string;
  savings?: SavingsOpportunity;
  yearlyFeesAtThisRate?: number;
  highFeeCount?: number;
  chargeRate?: number;
  chargeVolume?: number;
  monthCount?: number;
  diagnosis?: FreeDiagnosis;
}

export function MoneyFirstImpact({
  reportId,
  savings,
  yearlyFeesAtThisRate,
  highFeeCount = 0,
  chargeRate,
  chargeVolume,
  monthCount,
  diagnosis,
}: Props) {
  const { t, tc } = useReportTranslations();
  const impact = resolvePaywallImpact({
    savingsAnnual: savings?.annualSavings,
    savingsTitle: savings?.title,
    chargeRate,
    chargeVolume,
    monthCount,
    yearlyFeesAtThisRate,
  });

  const headline = diagnosis
    ? t("moneyFirstImpact.headlineDiagnosis")
    : impact?.source === "savings"
      ? t("moneyFirstImpact.headlineSavings")
      : impact?.source === "rate_gap"
        ? t("moneyFirstImpact.headlineRateGap")
        : impact
          ? t("moneyFirstImpact.headlineRunrate")
          : t("moneyFirstImpact.headlineSnapshot");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">{headline}</p>

        {diagnosis ? (
          <>
            <p className="mt-2 text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              {diagnosis.title}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
              {t("moneyFirstImpact.diagnosisUnlock", { body: diagnosis.body })}
            </p>
            {diagnosis.disclaimer && (
              <p className="mt-3 text-xs leading-relaxed text-emerald-900/70">
                {diagnosis.disclaimer}
              </p>
            )}
          </>
        ) : impact ? (
          <>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {impact.source === "fee_runrate" ? t("moneyFirstImpact.approxPrefix") : t("moneyFirstImpact.upToPrefix")}
              {fmt$(impact.amount)}
              <span className="text-xl font-bold text-gray-500">{tc("yearSuffix")}</span>
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
              {impact.source === "savings" ? (
                t("moneyFirstImpact.savingsBody", {
                  label: impact.label ?? "",
                  confidence: savings?.confidence ? ` · ${tc("confidence", { level: savings.confidence })}` : "",
                })
              ) : impact.source === "rate_gap" ? (
                t("moneyFirstImpact.rateGapBody", { label: impact.label ?? "" })
              ) : (
                t("moneyFirstImpact.runrateBody", { amount: fmt$(impact.amount) })
              )}
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t("moneyFirstImpact.gatedTitle")}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
              {highFeeCount > 0
                ? highFeeCount === 1
                  ? t("moneyFirstImpact.gatedHighFeeSingular", { count: highFeeCount })
                  : t("moneyFirstImpact.gatedHighFeePlural", { count: highFeeCount })
                : t("moneyFirstImpact.gatedDefault")}
            </p>
          </>
        )}

        <p className="mt-3 text-xs leading-relaxed text-emerald-900/70">
          {t("moneyFirstImpact.disclaimer")}
        </p>
      </div>

      <PaywallBanner
        reportId={reportId}
        annualImpact={impact?.amount}
        impactSource={impact?.source}
        firstOpportunity={impact?.label}
        diagnosis={diagnosis}
      />
    </div>
  );
}
