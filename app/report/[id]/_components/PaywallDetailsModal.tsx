"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useFmtMoney } from "@/lib/report-currency";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annualImpact?: number;
  firstOpportunity?: string;
  onCheckout: () => void;
}

export function PaywallDetailsModal({
  open,
  onOpenChange,
  annualImpact,
  firstOpportunity,
  onCheckout,
}: Props) {
  const fmt$ = useFmtMoney();
  const { t } = useReportTranslations();
  const hasImpact = annualImpact != null && annualImpact > 0;

  const included = [
    t("paywallBanner.includedUnusualCharges"),
    t("paywallBanner.includedSavings"),
    t("paywallBanner.includedMonthly"),
    t("paywallBanner.includedExport"),
    t("paywallBanner.includedLink"),
  ];

  const notIncluded = [
    t("paywallBanner.notIncludedOAuth"),
    t("paywallBanner.notIncludedAdvice"),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden"
        closeButtonClassName="z-10 text-white hover:bg-white/15 hover:text-white"
      >
        <div className="bg-gray-900 px-6 py-5">
          <h2 className="text-lg font-bold text-white">{t("paywallBanner.modalTitle")}</h2>
          <p className="text-sm text-gray-400 mt-1">{t("paywallBanner.modalSubtitle")}</p>
        </div>
        <div className="p-5">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-blue-700">{t("paywallBanner.planName")}</span>
              <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">$12</span>
            </div>
            {hasImpact && (
              <p className="mb-3 text-xs leading-relaxed text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                {t("paywallBanner.previewPointsTo", {
                  amount: fmt$(annualImpact!),
                  opportunity: firstOpportunity ? ` (${firstOpportunity})` : "",
                })}
              </p>
            )}
            <p className="mb-3 text-xs leading-relaxed text-blue-900/80">
              {t("paywallBanner.modalBody")}
            </p>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
              {t("paywallBanner.includedHeading")}
            </p>
            <ul className="space-y-1">
              {included.map((f) => (
                <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="text-blue-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              {t("paywallBanner.notIncludedHeading")}
            </p>
            <ul className="space-y-1">
              {notIncluded.map((f) => (
                <li key={f} className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="text-gray-300">•</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="h-11 w-full rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            onClick={onCheckout}
          >
            {hasImpact
              ? t("paywallBanner.continueUnlock", { amount: fmt$(annualImpact!) })
              : t("paywallBanner.continueCheckout")}
          </button>
          <p className="text-xs text-center text-gray-500 mt-3 leading-relaxed">
            {t("paywallBanner.modalCheckoutNote")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
