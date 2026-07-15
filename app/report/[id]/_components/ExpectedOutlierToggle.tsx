"use client";

import { Button } from "@/components/ui/button";

type Props = {
  chargeId: string;
  marked: boolean;
  disabled?: boolean;
  onToggle: (chargeId: string) => void;
};

export function ExpectedOutlierToggle({ chargeId, marked, disabled, onToggle }: Props) {
  return (
    <Button
      type="button"
      variant={marked ? "secondary" : "outline"}
      size="sm"
      disabled={disabled}
      className="h-8 text-xs shrink-0"
      onClick={() => onToggle(chargeId)}
    >
      {marked ? "Included in adjusted rate ✓" : "Mark as expected one-off"}
    </Button>
  );
}
