/** Hard cap on parsed CSV rows to limit CPU/memory DoS per request. */
export const MAX_CSV_ROWS = 75_000;

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Strip unsafe mapping keys and unknown canonical columns before remap.
 * Prevents prototype pollution-style keys and limits remap surface.
 */
export function sanitizeColumnMapping(
  mapping: Record<string, string> | undefined,
  allowedCanonical: ReadonlySet<string>
): Record<string, string> | undefined {
  if (!mapping || typeof mapping !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const [canonical, original] of Object.entries(mapping)) {
    if (typeof canonical !== "string" || typeof original !== "string") continue;
    const c = canonical.trim();
    const o = original.trim();
    if (!c || DANGEROUS_KEYS.has(c) || DANGEROUS_KEYS.has(o)) continue;
    if (!allowedCanonical.has(c)) continue;
    out[c] = o;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
