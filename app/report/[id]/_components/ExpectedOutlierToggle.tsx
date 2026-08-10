"use client";

import { Button } from "@/components/ui/button";
import { useReportTranslations } from "@/lib/i18n/use-report-translations";

type Props = {
  chargeId: string;
  marked: boolean;
  disabled?: boolean;
  onToggle: (chargeId: string) => void;
};

export function ExpectedOutlierToggle({ chargeId, marked, disabled, onToggle }: Props) {
  const { t } = useReportTranslations();

  return (
    <Button
      type="button"
      variant={marked ? "secondary" : "outline"}
      size="sm"
      disabled={disabled}
      className="h-8 text-xs shrink-0"
      onClick={() => onToggle(chargeId)}
    >
      {marked ? t("expectedOutlierToggle.excluded") : t("expectedOutlierToggle.markExpected")}
    </Button>
  );
}
