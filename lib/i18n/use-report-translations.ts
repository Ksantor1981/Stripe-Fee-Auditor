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
    "Card & charge processing": t("cardChargeProcessing"),
    "Fixed per-charge fees": t("fixedPerCharge"),
    "International card uplift": t("intlUplift"),
    "Refund fee impact": t("refundImpact"),
    "Other Stripe fee lines": t("otherLines"),
    "Base card processing": t("baseCard"),
    "No separate fee rows found": t("noFeeRows"),
    "International card": t("intlCard"),
    "Small transaction": t("smallTransaction"),
    "ACH anomaly": t("achAnomaly"),
    "Slightly elevated rate": t("slightlyElevated"),
    "High international card fees": t("highIntlFees"),
    "Large invoices still on cards — ACH is cheaper": t("largeInvoicesAch"),
    "No charge benchmark": t("noChargeBenchmark"),
    "<$20": t("bucketUnder20"),
    "$20–50": t("bucket20to50"),
    "$50–100": t("bucket50to100"),
    "$100–250": t("bucket100to250"),
    "$250+": t("bucket250plus"),
    "Currency conversion estimate": t("fxEstimate"),
  };

  return (english: string) => map[english] ?? english;
}
