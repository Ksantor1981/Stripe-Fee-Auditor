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

/**
 * Phase 1 product policy: every audit receives the complete report in every
 * environment. Keep the legacy export name while billing infrastructure is
 * dormant so it can be reused later for a separate monitoring product.
 */
export const FULL_REPORTS_FREE = true;
export const FULL_REPORTS_FREE_DURING_BETA = FULL_REPORTS_FREE;
