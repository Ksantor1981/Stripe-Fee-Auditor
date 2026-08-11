"use client";

import { useTranslations } from "next-intl";
import type { FeeGrade } from "@/lib/fee-grade";
import { useFeeLabelTranslator } from "@/lib/i18n/use-report-translations";

const GRADE_STYLES: Record<
  FeeGrade["letter"],
  { ring: string; bg: string; text: string }
> = {
  A: { ring: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-800" },
  B: { ring: "border-blue-200", bg: "bg-blue-50", text: "text-blue-800" },
  C: { ring: "border-amber-200", bg: "bg-amber-50", text: "text-amber-900" },
  D: { ring: "border-orange-200", bg: "bg-orange-50", text: "text-orange-900" },
  F: { ring: "border-red-200", bg: "bg-red-50", text: "text-red-800" },
};

const SUMMARY_KEYS: Record<string, string> = {
  "Directional grade from a small sample — upload more months to confirm.": "summaryLowHealthy",
  "Early signal only: fee drivers look elevated for this small export.": "summaryLowElevated",
  "Stripe fee setup looks efficient for your transaction mix.": "summaryA",
  "Mostly healthy, with a few fee drivers worth watching.": "summaryB",
  "Noticeable fee leakage — review international cards and add-on fee lines.": "summaryC",
  "Material fee leakage — several drivers are pushing your all-in cost up.": "summaryD",
  "High fee leakage — your all-in Stripe cost is well above a typical mix.": "summaryF",
};

type Props = {
  grade: FeeGrade;
  size?: "sm" | "md" | "lg";
  showSummary?: boolean;
  className?: string;
};

export function FeeGradeBadge({ grade, size = "md", showSummary = true, className = "" }: Props) {
  const t = useTranslations("report.feeGrade");
  const translateFeeLabel = useFeeLabelTranslator();
  const styles = GRADE_STYLES[grade.letter];
  const label = t(`label${grade.letter}`);
  const summaryKey = SUMMARY_KEYS[grade.summary];
  const summary = summaryKey ? t(summaryKey) : grade.summary;
  const topIssue = grade.topIssue ? translateFeeLabel(grade.topIssue) : null;
  const sizeClass =
    size === "lg"
      ? "px-4 py-3"
      : size === "sm"
        ? "px-2.5 py-1.5"
        : "px-3 py-2";
  const letterClass =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div
      className={`rounded-xl border ${styles.ring} ${styles.bg} ${sizeClass} ${className}`}
      title={summary}
    >
      <div className="flex items-center gap-3">
        <div className={`font-black leading-none ${letterClass} ${styles.text}`}>
          {grade.letter}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${styles.text}`}>
            {t("title", { label })}
          </p>
          {showSummary && (
            <p className="mt-0.5 text-xs leading-snug text-gray-600">{summary}</p>
          )}
          {topIssue && showSummary && (
            <p className="mt-1 text-[11px] leading-snug text-gray-500">
              {t("topDriver", { driver: topIssue })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
