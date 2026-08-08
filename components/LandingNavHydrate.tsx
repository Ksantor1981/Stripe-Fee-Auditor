"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const LANDING_NAV_ROOT_ID = "landing-nav-root";

/** Swaps static shell for interactive nav after idle — keeps first paint cheap. */
export function LandingNavHydrate() {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [Nav, setNav] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    setRoot(document.getElementById(LANDING_NAV_ROOT_ID));

    const load = () => {
      void import("@/components/LandingNav").then((mod) => {
        const el = document.getElementById(LANDING_NAV_ROOT_ID);
        if (el) el.replaceChildren();
        setNav(() => mod.LandingNav);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(load, 150);
    return () => window.clearTimeout(timer);
  }, []);

  if (!root || !Nav) return null;
  return createPortal(<Nav />, root);
}
