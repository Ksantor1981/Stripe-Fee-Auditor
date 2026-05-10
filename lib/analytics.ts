import type { FunnelPropValue } from "./funnel-log";

/** Browser → POST /api/event → structured line in Vercel logs. Fire-and-forget. */
export function trackEvent(name: string, props?: Record<string, FunnelPropValue>): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, props: props ?? {} }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}
