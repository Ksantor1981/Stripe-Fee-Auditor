export function isBetaFlagEnabled(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

// Temporary beta: show full report/export without requiring payment.
// Production defaults closed; explicitly set FULL_REPORTS_FREE_DURING_BETA=true.
export const FULL_REPORTS_FREE_DURING_BETA = isBetaFlagEnabled(process.env.FULL_REPORTS_FREE_DURING_BETA);
