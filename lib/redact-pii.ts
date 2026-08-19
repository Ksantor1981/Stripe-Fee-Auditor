/** Redact emails in logs — keep domain for debugging, hide local part. */
export function redactEmail(value: string): string {
  const trimmed = value.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "[redacted]";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!domain) return "[redacted]";
  const prefix = local.length <= 1 ? "*" : `${local.slice(0, 1)}***`;
  return `${prefix}@${domain}`;
}

const PII_LOG_KEYS = new Set(["email", "to", "from", "recipient", "owner_email"]);

export function redactOpsProps(
  data: Record<string, string | number | boolean | null | undefined>
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && (PII_LOG_KEYS.has(k) || k.endsWith("_email"))) {
      out[k] = redactEmail(v);
    } else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return out;
}
