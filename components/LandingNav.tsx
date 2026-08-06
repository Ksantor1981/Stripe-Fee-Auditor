"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";

const NAV_LINKS = [
  {
    href: "/#pricing",
    label: "Pricing",
    funnelEvent: "funnel_nav_about" as const,
    funnelProps: { placement: "nav_pricing" },
    className: "text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors",
  },
  {
    href: "/about",
    label: "About",
    funnelEvent: "funnel_nav_about" as const,
    funnelProps: { placement: "nav" },
    className: "text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors",
  },
] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative px-4 py-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-bold text-gray-900 text-base sm:text-lg hover:text-gray-700 transition-colors min-w-0 truncate"
        >
          Fee Auditor
          <span className="ml-1.5 text-sm font-normal text-gray-500">feeauditor.com</span>
        </Link>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          {NAV_LINKS.map((link) => (
            <TrackedLink
              key={link.href}
              href={link.href}
              funnelEvent={link.funnelEvent}
              funnelProps={link.funnelProps}
              className={link.className}
            >
              {link.label}
            </TrackedLink>
          ))}
          <TrackedLink
            href="/analyze"
            utm={{ source: "landing", medium: "nav", campaign: "header_cta" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "nav" }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Analyze my CSV
          </TrackedLink>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          aria-expanded={open}
          aria-controls="landing-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon className="size-5" aria-hidden /> : <MenuIcon className="size-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div
          id="landing-mobile-nav"
          className="md:hidden mt-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm space-y-1"
        >
          {NAV_LINKS.map((link) => (
            <TrackedLink
              key={link.href}
              href={link.href}
              funnelEvent={link.funnelEvent}
              funnelProps={link.funnelProps}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </TrackedLink>
          ))}
          <TrackedLink
            href="/analyze"
            utm={{ source: "landing", medium: "nav", campaign: "header_cta" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "nav" }}
            className="block rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            onClick={() => setOpen(false)}
          >
            Analyze my CSV
          </TrackedLink>
        </div>
      )}
    </nav>
  );
}
