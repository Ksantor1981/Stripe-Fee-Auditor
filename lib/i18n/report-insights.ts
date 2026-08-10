"use client";

import { useTranslations } from "next-intl";
import { fmt$ } from "@/lib/format";
import type { SavingsOpportunity } from "@/lib/fee-analyzer";
import type { FreeDiagnosis } from "@/lib/free-diagnosis";
import type { PaywallImpactSource } from "@/lib/paywall-impact";

export type TranslatedDiagnosis = {
  title: string;
  body: string;
  disclaimer?: string;
};

export type TranslatedSavingsOpportunity = {
  title: string;
  tip: string;
  actionLabel?: string;
  periodLossNote?: string;
  annualSavingsNote?: string;
  steps?: string[];
};

function formatMoney(amount: number): string {
  return fmt$(amount);
}

function formatPct(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
}

/** Localize analyzer-generated free diagnosis copy by kind. */
export function useTranslatedDiagnosis(
  diagnosis: FreeDiagnosis | undefined
): TranslatedDiagnosis | undefined {
  const t = useTranslations("report.diagnosisKinds");

  if (!diagnosis) return undefined;

  const p = diagnosis.params ?? {};
  const amount = formatMoney(diagnosis.amount);

  switch (diagnosis.kind) {
    case "international_card_uplift":
      return {
        title: t("internationalCardUplift.title"),
        body: t("internationalCardUplift.body", {
          count: p.count ?? 0,
          amount,
        }),
        disclaimer: t("internationalCardUplift.disclaimer"),
      };
    case "refund_fee_leakage":
      return {
        title: t("refundFeeLeakage.title"),
        body: t("refundFeeLeakage.body", {
          count: p.count ?? 0,
          amount,
        }),
        disclaimer: t("refundFeeLeakage.disclaimer"),
      };
    case "small_ticket_drag":
      return {
        title: t("smallTicketDrag.title"),
        body: t("smallTicketDrag.body", {
          count: p.count ?? 0,
          rate: formatPct(p.smallTicketRate ?? 0),
          amount,
        }),
        disclaimer: t("smallTicketDrag.disclaimer"),
      };
    case "other_fee_lines":
      return {
        title: t("otherFeeLines.title"),
        body: t("otherFeeLines.body", { amount }),
      };
    case "above_benchmark_rate":
      return {
        title: t("aboveBenchmarkRate.title"),
        body: t("aboveBenchmarkRate.body", {
          chargeRate: formatPct(p.chargeRate ?? 0),
          rateGap: (p.rateGap ?? 0).toFixed(2),
          expectedRate: formatPct(p.expectedRate ?? 0),
          amount,
        }),
        disclaimer: t("aboveBenchmarkRate.disclaimer"),
      };
    case "unusual_charge":
      return {
        title: t("unusualCharge.title"),
        body: t("unusualCharge.body", { amount }),
      };
    default:
      return {
        title: diagnosis.title,
        body: diagnosis.body,
        disclaimer: diagnosis.disclaimer,
      };
  }
}

/** Localize savings opportunity copy by kind; falls back to English analyzer strings. */
export function useTranslatedSavingsOpportunity(
  opportunity: SavingsOpportunity | undefined
): TranslatedSavingsOpportunity | undefined {
  const t = useTranslations("report.savingsKinds");
  const tf = useTranslations("feeLabels");

  if (!opportunity) return undefined;

  const p = opportunity.params ?? {};

  if (opportunity.kind === "international_card_fees") {
    return {
      title: tf("highInternationalCardFees"),
      tip: t("internationalCardFees.tip", {
        crossBorderPercent: (p.crossBorderPercent ?? 0).toFixed(1),
      }),
      actionLabel: tf("openPaymentMethods"),
      steps: [t("internationalCardFees.step1"), t("internationalCardFees.step2")],
    };
  }

  if (opportunity.kind === "small_transactions") {
    const currency = p.currency ?? "USD";
    const fixedFee = (p.fixedFee ?? 0.3).toFixed(2);
    return {
      title: tf("smallTransactionsFixedDominates", { currency, amount: fixedFee }),
      tip: t("smallTransactions.tip", {
        count: p.smallChargeCount ?? 0,
        currency,
        avgAmount: (p.avgSmallAmount ?? 0).toFixed(2),
      }),
      actionLabel: tf("reviewBillingSettings"),
      steps: [t("smallTransactions.step1"), t("smallTransactions.step2")],
    };
  }

  if (opportunity.kind === "ach_large_invoices") {
    const switchingShare = p.switchingSharePercent ?? 50;
    return {
      title: tf("largeInvoicesAchCheaper"),
      tip: t("achLargeInvoices.tip", { count: p.largeChargeCount ?? 0 }),
      actionLabel: tf("enableAchInStripe"),
      periodLossNote: t("achLargeInvoices.periodLossNote"),
      annualSavingsNote: t("achLargeInvoices.annualSavingsNote", { share: switchingShare }),
      steps: [t("achLargeInvoices.step1"), t("achLargeInvoices.step2")],
    };
  }

  return {
    title: opportunity.title,
    tip: opportunity.tip,
    actionLabel: opportunity.actionLabel,
    periodLossNote: opportunity.periodLossNote,
    annualSavingsNote: opportunity.annualSavingsNote,
    steps: opportunity.steps,
  };
}

/** Localize paywall impact label shown next to unlock CTA. */
export function useTranslatedPaywallLabel(
  source: PaywallImpactSource | undefined,
  label: string | undefined,
  benchmarkRate?: number
): string | undefined {
  const t = useTranslations("report.paywallImpactLabels");

  if (!source) return label;

  if (source === "rate_gap" && benchmarkRate != null) {
    return t("rateGap", { benchmark: benchmarkRate.toFixed(2) });
  }
  if (source === "fee_runrate") {
    return t("feeRunrate");
  }
  if (source === "savings") {
    return label;
  }
  return label;
}
