import type { FunnelPropValue } from "./funnel-log";

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

/** Plausible custom events (configure matching goals in Plausible dashboard). */
const PLAUSIBLE_GOALS: Record<string, string> = {
  funnel_landing_cta: "Landing CTA",
  funnel_nav_blog: "Nav Blog",
  funnel_analyze_page_view: "Analyze Page View",
  funnel_csv_loaded: "CSV Loaded",
  funnel_export_instructions_done: "Export Instructions Done",
  funnel_analyze_submit: "Analyze Submit",
  funnel_analyze_client_ok: "Analyze Success",
  funnel_email_gate_view: "Email Gate View",
  funnel_email_unlock_ok: "Email Unlock",
  funnel_report_view: "Report View",
  funnel_paywall_modal_open: "Paywall Modal Open",
  funnel_checkout_redirect: "Checkout Start",
  funnel_payment_success: "Payment Success",
  funnel_share_x_click: "Share X",
  funnel_embed_copy: "Embed Copy",
  funnel_share_chart_png: "Share Chart PNG",
};

function plausibleProps(props: Record<string, FunnelPropValue>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return out;
}

/** Browser → POST /api/event (Vercel logs) + Plausible custom goal when mapped. */
export function trackEvent(name: string, props?: Record<string, FunnelPropValue>): void {
  if (typeof window === "undefined") return;

  const safeProps = props ?? {};

  try {
    void fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, props: safeProps }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }

  const goal = PLAUSIBLE_GOALS[name];
  if (!goal) return;

  try {
    window.plausible?.(goal, { props: plausibleProps(safeProps) });
  } catch {
    /* ignore */
  }
}
