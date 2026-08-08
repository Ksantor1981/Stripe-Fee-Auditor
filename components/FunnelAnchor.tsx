import Link, { type LinkProps } from "next/link";
import type { FunnelPropValue } from "@/lib/funnel-log";
import { appendUtmToPath, type UtmParams } from "@/lib/utm";

type Props = Omit<LinkProps, "href"> & {
  href: string;
  funnelEvent: string;
  funnelProps?: Record<string, FunnelPropValue>;
  utm?: UtmParams;
  className?: string;
  children: React.ReactNode;
};

/** Server-friendly CTA link — funnel tracking via FunnelClickDelegate on the page. */
export function FunnelAnchor({ funnelEvent, funnelProps, utm, href, ...props }: Props) {
  const resolvedHref = utm ? appendUtmToPath(href, utm) : href;

  return (
    <Link
      {...props}
      href={resolvedHref}
      data-funnel-event={funnelEvent}
      data-funnel-props={funnelProps ? JSON.stringify(funnelProps) : undefined}
    />
  );
}
