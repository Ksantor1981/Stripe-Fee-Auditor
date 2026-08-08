"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import type { FunnelPropValue } from "@/lib/funnel-log";

function parseFunnelProps(raw: string | null): Record<string, FunnelPropValue> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Record<string, FunnelPropValue>;
    return typeof parsed === "object" && parsed !== null ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/** One listener for all [data-funnel-event] links — avoids per-CTA client components. */
export function FunnelClickDelegate() {
  useEffect(() => {
    let removeListener: (() => void) | undefined;

    const attach = () => {
      const onClick = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const anchor = target.closest<HTMLAnchorElement>("[data-funnel-event]");
        if (!anchor) return;

        const name = anchor.dataset.funnelEvent;
        if (!name) return;

        trackEvent(name, parseFunnelProps(anchor.dataset.funnelProps ?? null));
      };

      document.addEventListener("click", onClick, true);
      removeListener = () => document.removeEventListener("click", onClick, true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(attach, { timeout: 4000 });
      return () => {
        window.cancelIdleCallback(id);
        removeListener?.();
      };
    }

    const timer = window.setTimeout(attach, 200);
    return () => {
      window.clearTimeout(timer);
      removeListener?.();
    };
  }, []);

  return null;
}
