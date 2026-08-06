"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markPathLoad } from "@/lib/time-since-load";

/** Marks client navigation time per path for ms_since_load funnel props. */
export function PageLoadMarker() {
  const pathname = usePathname();

  useEffect(() => {
    markPathLoad(pathname);
  }, [pathname]);

  return null;
}
