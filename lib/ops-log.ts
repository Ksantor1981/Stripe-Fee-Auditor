/** Structured ops logs for Vercel — grep `ops_event` or filter `level":"error"`. */

export type OpsLevel = "info" | "warn" | "error";

export type OpsEventPayload = Record<string, string | number | boolean | null | undefined>;

export function opsLogLine(
  event: string,
  level: OpsLevel,
  data: OpsEventPayload = {}
): string {
  const props: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      props[k] = v;
    }
  }
  return JSON.stringify({
    type: "ops_event",
    level,
    event,
    props,
    ts: new Date().toISOString(),
  });
}

export function logOps(level: OpsLevel, event: string, data?: OpsEventPayload): void {
  const line = opsLogLine(event, level, data);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

/** Errors worth a Vercel log alert (message contains `ops_event` and `"level":"error"`). */
export function logOpsError(event: string, data?: OpsEventPayload): void {
  logOps("error", event, data);
}

export function logOpsWarn(event: string, data?: OpsEventPayload): void {
  logOps("warn", event, data);
}

export function logOpsInfo(event: string, data?: OpsEventPayload): void {
  logOps("info", event, data);
}
