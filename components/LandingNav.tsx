"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";

const PRODUCT_ACTIONS = [
  {
    href: "/analyze",
    title: "Upload CSV",
    desc: "Your Balance export — free diagnosis, no signup",
    utm: { source: "landing", medium: "nav", campaign: "nav_product_upload" },
    funnelEvent: "funnel_landing_cta" as const,
    primary: true,
  },
  {
    href: "/analyze?sample=1",
    title: "See sample report",
    desc: "Demo CSV — opens a full example report in ~10s",
    utm: { source: "landing", medium: "nav", campaign: "nav_product_sample" },
    funnelEvent: "funnel_sample_cta" as const,
    primary: false,
  },
] as const;

/** Shown as labels only — one product, not four separate pages. */
const PRODUCT_INCLUDES = [
  { title: "Rate analysis", desc: "Real all-in cost vs dashboard 2.9%" },
  { title: "Fee breakdown", desc: "International cards, refunds, fixed-fee drag" },
  { title: "Savings finder", desc: "Ranked actions with Stripe dashboard links" },
  { title: "Benchmarking", desc: "Compare against your transaction mix" },
] as const;

const RESOURCE_ITEMS = [
  { href: "/stripe-balance-csv", label: "Balance CSV guide" },
  { href: "/stripe-fee-calculator", label: "Fee calculator" },
  { href: "/chrome-extension", label: "Chrome helper" },
  { href: "/blog", label: "Blog" },
] as const;

const NAV_LINK_CLASS =
  "text-base font-medium text-gray-800 hover:text-gray-950 transition-colors";

function NavDropdown({
  label,
  open,
  onToggle,
  onClose,
  panelId,
  children,
  align = "left",
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  panelId: string;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-1 ${NAV_LINK_CLASS}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {label}
        <ChevronDownIcon className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close menu" onClick={onClose} />
          <div
            id={panelId}
            className={`absolute top-full z-50 mt-2 min-w-[18rem] rounded-xl border border-gray-200 bg-white p-2 shadow-lg ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const closeMenus = useCallback(() => {
    setProductOpen(false);
    setResourcesOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenus]);

  return (
    <div className="border-b border-gray-100">
      <nav className="relative mx-auto max-w-7xl px-4 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors shrink-0 sm:text-xl"
          >
            Fee Auditor
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <NavDropdown
              label="Product"
              open={productOpen}
              onToggle={() => {
                setProductOpen((v) => !v);
                setResourcesOpen(false);
              }}
              onClose={closeMenus}
              panelId="nav-product-menu"
            >
              <div className="grid gap-0.5 sm:min-w-[24rem]">
                {PRODUCT_ACTIONS.map((item) => (
                  <TrackedLink
                    key={item.title}
                    href={item.href}
                    utm={item.utm}
                    funnelEvent={item.funnelEvent}
                    funnelProps={{ placement: "nav_product" }}
                    className={`rounded-lg px-3 py-3 transition-colors ${
                      item.primary ? "bg-gray-900 text-white hover:bg-gray-800" : "hover:bg-gray-50"
                    }`}
                    onClick={closeMenus}
                  >
                    <p className={`text-base font-semibold ${item.primary ? "text-white" : "text-gray-900"}`}>
                      {item.title}
                    </p>
                    <p className={`text-sm ${item.primary ? "text-gray-200" : "text-gray-500"}`}>{item.desc}</p>
                  </TrackedLink>
                ))}
                <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Every report includes
                </p>
                {PRODUCT_INCLUDES.map((item) => (
                  <div key={item.title} className="rounded-lg px-3 py-2.5">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </NavDropdown>

            <Link href="/how-it-works" className={NAV_LINK_CLASS}>
              How it works
            </Link>

            <NavDropdown
              label="Resources"
              open={resourcesOpen}
              onToggle={() => {
                setResourcesOpen((v) => !v);
                setProductOpen(false);
              }}
              onClose={closeMenus}
              panelId="nav-resources-menu"
              align="right"
            >
              <div className="py-1">
                {RESOURCE_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50"
                    onClick={closeMenus}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <TrackedLink
              href="/pricing"
              funnelEvent="funnel_nav_about"
              funnelProps={{ placement: "nav_pricing" }}
              className={NAV_LINK_CLASS}
            >
              Pricing
            </TrackedLink>
          </div>

          <div className="hidden lg:block shrink-0">
            <TrackedLink
              href="/analyze"
              utm={{ source: "landing", medium: "nav", campaign: "header_cta" }}
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "nav" }}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-base font-semibold text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Upload CSV
            </TrackedLink>
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <XIcon className="size-5" aria-hidden /> : <MenuIcon className="size-5" aria-hidden />}
          </button>
        </div>

        {mobileOpen ? (
          <div id="landing-mobile-nav" className="lg:hidden mt-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm space-y-3">
            <p className="px-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Product</p>
            {PRODUCT_ACTIONS.map((item) => (
              <TrackedLink
                key={item.title}
                href={item.href}
                utm={item.utm}
                funnelEvent={item.funnelEvent}
                funnelProps={{ placement: "nav_mobile_product" }}
                className={`block rounded-lg px-2 py-2 ${
                  item.primary ? "bg-gray-900 text-white hover:bg-gray-800" : "hover:bg-gray-50"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <p className={`text-base font-semibold ${item.primary ? "text-white" : "text-gray-900"}`}>
                  {item.title}
                </p>
                <p className={`text-sm ${item.primary ? "text-gray-200" : "text-gray-500"}`}>{item.desc}</p>
              </TrackedLink>
            ))}
            <p className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Every report includes
            </p>
            {PRODUCT_INCLUDES.map((item) => (
              <div key={item.title} className="rounded-lg px-2 py-2">
                <p className="text-base font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
            <Link
              href="/how-it-works"
              className="block rounded-lg px-2 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className="block rounded-lg px-2 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Resources</p>
            {RESOURCE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-2 py-2 text-base text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <TrackedLink
              href="/analyze"
              utm={{ source: "landing", medium: "nav", campaign: "header_cta" }}
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "nav" }}
              className="block rounded-lg bg-gray-900 px-3 py-3 text-center text-base font-semibold text-white hover:bg-gray-800 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Upload CSV
            </TrackedLink>
          </div>
        ) : null}
      </nav>
    </div>
  );
}
