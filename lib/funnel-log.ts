/** Single-line JSON for Vercel / server logs — grep `funnel_event`. */

export type FunnelSource = "client_api" | "server";
export type FunnelPropValue = string | number | boolean;

export function funnelLogLine(
  event: string,
  props: Record<string, FunnelPropValue> = {},
  source: FunnelSource
): string {
  return JSON.stringify({
    type: "funnel_event",
    event,
    props,
    source,
    ts: new Date().toISOString(),
  });
}

export function logFunnelServer(event: string, props: Record<string, FunnelPropValue> = {}): void {
  console.log(funnelLogLine(event, props, "server"));
}

/** Shared validation + serialization for POST /api/event. */
export function sanitizeFunnelProps(raw: unknown): Record<string, FunnelPropValue> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, FunnelPropValue> = {};
  let n = 0;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (n >= 16) break;
    if (!/^[a-z][a-z0-9_]{0,31}$/i.test(k)) continue;
    if (typeof v === "string") {
      out[k] = v.length > 200 ? `${v.slice(0, 200)}…` : v;
    } else if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = v;
    } else if (typeof v === "boolean") {
      out[k] = v;
    }
    n++;
  }
  return out;
}

const EVENT_RE = /^funnel_[a-z0-9_]{1,48}$/;

export function isValidFunnelEventName(name: unknown): name is string {
  return typeof name === "string" && EVENT_RE.test(name);
}

export function logFunnelClientApi(name: string, props: Record<string, FunnelPropValue>): void {
  console.log(funnelLogLine(name, props, "client_api"));
}
