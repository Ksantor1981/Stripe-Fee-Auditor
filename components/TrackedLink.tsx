"use client";

import Link, { type LinkProps } from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { FunnelPropValue } from "@/lib/funnel-log";

type Props = Omit<LinkProps, "onClick"> & {
  funnelEvent: string;
  funnelProps?: Record<string, FunnelPropValue>;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function TrackedLink({ funnelEvent, funnelProps, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent(funnelEvent, funnelProps);
        onClick?.(e);
      }}
    />
  );
}
