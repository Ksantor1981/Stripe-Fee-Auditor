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
    "<$20": t("bucketUnder20"),
    "$20–50": t("bucket20to50"),
    "$50–100": t("bucket50to100"),
    "$100–250": t("bucket100to250"),
    "$250+": t("bucket250plus"),
    "Currency conversion estimate": t("currencyConversionEstimate"),
  };

  return (english: string) => map[english] ?? english;
}
