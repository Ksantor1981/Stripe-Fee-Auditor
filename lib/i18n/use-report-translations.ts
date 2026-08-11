"use client";

import { useTranslations } from "next-intl";

/** Report UI strings for client components under app/report/. */
export function useReportTranslations() {
  const t = useTranslations("report");
  const tc = useTranslations("report.common");
  return { t, tc };
}

/** Map English fee-analyzer labels to translated strings. */
export function useFeeLabelTranslator() {
  const t = useTranslations("feeLabels");
  const map: Record<string, string> = {
    "Card & charge processing": t("cardAndChargeProcessing"),
    "Fixed per-charge fees": t("fixedPerChargeFees"),
    "International card uplift": t("internationalCardUplift"),
    "Refund fee impact": t("refundFeeImpact"),
    "Other Stripe fee lines": t("otherStripeFeeLines"),
    "Other Stripe fees": t("otherStripeFees"),
    "Base card processing": t("baseCardProcessing"),
    "No separate fee rows found": t("noSeparateFeeRows"),
    "International card": t("internationalCard"),
    "Small transaction": t("smallTransaction"),
    "ACH anomaly": t("achAnomaly"),
    "Slightly elevated rate": t("slightlyElevatedRate"),
    "Elevated rate": t("elevatedRate"),
    "High international card fees": t("highInternationalCardFees"),
    "Large invoices still on cards — ACH is cheaper": t("largeInvoicesAchCheaper"),
    "No charge benchmark": t("noChargeBenchmark"),
    "Directional benchmark": t("directionalBenchmark"),
    "Looks normal for this mix": t("looksNormalForMix"),
    "Worth reviewing": t("worthReviewing"),
    "High versus typical range": t("highVsTypicalRange"),
    "international / cross-border cards": t("driverInternationalCards"),
    "refunds with retained processing fees": t("driverRefundsRetained"),
    "premium cards, disputes, Radar/add-on fees, or plan-specific pricing": t("driverPremiumCards"),
    "domestic card mix and fixed per-transaction fees": t("driverDomesticMix"),
    "all-in rate is far above the expected mix": t("gradeIssueRateFarAbove"),
    "all-in rate is materially above the expected mix": t("gradeIssueRateMateriallyAbove"),
    "all-in rate is slightly above the expected mix": t("gradeIssueRateSlightlyAbove"),
    "non-charge Stripe fee lines are a large share of total fees": t("gradeIssueNonChargeLargeShare"),
    "add-on or non-charge fee lines are adding to all-in cost": t("gradeIssueAddOnFees"),
    "international cards are a large share of volume": t("gradeIssueInternationalShare"),
    "refund volume is increasing retained processing fees": t("gradeIssueRefundVolume"),
    "many high-fee charges vs your baseline": t("gradeIssueHighFeeCharges"),
    "multiple high-severity fee leak drivers": t("gradeIssueMultipleLeaks"),
    "<$20": t("bucketUnder20"),
    "$20–50": t("bucket20to50"),
    "$50–100": t("bucket50to100"),
    "$100–250": t("bucket100to250"),
    "$250+": t("bucket250plus"),
    "Currency conversion estimate": t("currencyConversionEstimate"),
  };

  return (english: string) => {
    const smallDriver = /^small charges where the fixed (\S+) ([\d.,]+) fee matters$/.exec(english);
    if (smallDriver) {
      return t("driverSmallCharges", { currency: smallDriver[1], amount: smallDriver[2] });
    }

    const smallSaving = /^Small transactions — fixed (\S+) ([\d.,]+) dominates$/.exec(english);
    if (smallSaving) {
      return t("smallTransactionsFixedDominates", { currency: smallSaving[1], amount: smallSaving[2] });
    }

    return map[english] ?? english;
  };
}
