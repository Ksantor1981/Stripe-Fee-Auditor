"use client";

import Link, { type LinkProps } from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { FunnelPropValue } from "@/lib/funnel-log";
import { appendUtmToPath, type UtmParams } from "@/lib/utm";

type Props = Omit<LinkProps, "onClick" | "href"> & {
  href: string;
  funnelEvent: string;
  funnelProps?: Record<string, FunnelPropValue>;
  utm?: UtmParams;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function TrackedLink({ funnelEvent, funnelProps, utm, onClick, href, ...props }: Props) {
  const resolvedHref = utm ? appendUtmToPath(href, utm) : href;

  return (
    <Link
      {...props}
      href={resolvedHref}
      onClick={(e) => {
        trackEvent(funnelEvent, funnelProps);
        onClick?.(e);
      }}
    />
  );
}
