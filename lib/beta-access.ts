export function isBetaFlagEnabled(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export function isBetaFullAccessEnabled(
  value: string | undefined,
  nodeEnv: string | undefined
): boolean {
  // Never let a stale or accidentally enabled environment variable bypass the
  // paid report gate in production.
  return nodeEnv !== "production" && isBetaFlagEnabled(value);
}

// Development-only convenience for previewing the full report without payment.
export const FULL_REPORTS_FREE_DURING_BETA = isBetaFullAccessEnabled(
  process.env.FULL_REPORTS_FREE_DURING_BETA,
  process.env.NODE_ENV
);
