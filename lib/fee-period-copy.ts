/** Total Stripe-related fees in the analyzed window (charges + non-charge fee lines). */
export function periodTotalFees(chargeFees: number, otherFees: number): number {
  return chargeFees + otherFees;
}

/** Linear run-rate: same average per month → 12 months. */
export function annualRunRate(periodFees: number, monthCount: number): number {
  const n = Math.max(1, monthCount);
  return (periodFees / n) * 12;
}

/** Natural-language tail after "You paid $X in Stripe fees …". */
export function stripeFeesPeriodTail(monthCount: number): string {
  if (monthCount <= 1) return "this month.";
  if (monthCount === 3) return "this quarter.";
  if (monthCount === 12) return "this year.";
  return `over the last ${monthCount} months.`;
}
