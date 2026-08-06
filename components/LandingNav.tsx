"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";

const PRODUCT_ITEMS = [
  {
    href: "/analyze?sample=1",
    title: "Rate analysis",
    desc: "Your real all-in processing cost",
    utm: { source: "landing", medium: "nav", campaign: "nav_product_rate" },
  },
  {
    href: "/analyze?sample=1",
    title: "Fee breakdown",
    desc: "International cards, refunds, small-ticket drag",
    utm: { source: "landing", medium: "nav", campaign: "nav_product_breakdown" },
  },
  {
    href: "/analyze?sample=1",
    title: "Savings finder",
    desc: "Concrete actions to reduce your rate",
    utm: { source: "landing", medium: "nav", campaign: "nav_product_savings" },
  },
  {
    href: "/analyze?sample=1",
    title: "Benchmarking",
    desc: "Compare against your transaction mix",
    utm: { source: "landing", medium: "nav", campaign: "nav_product_benchmark" },
  },
] as const;

const RESOURCE_ITEMS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/stripe-balance-csv", label: "Balance CSV guide" },
  { href: "/stripe-fee-calculator", label: "Fee calculator" },
  { href: "/chrome-extension", label: "Chrome helper" },
  { href: "/blog", label: "Blog" },
] as const;

const SECTION_LINKS = [
  { href: "/#proof", label: "Proof" },
  { href: "/#how-it-works", label: "Steps" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
] as const;

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
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
            className={`absolute top-full z-50 mt-2 min-w-[16rem] rounded-xl border border-gray-200 bg-white p-2 shadow-lg ${
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
      <nav className="relative mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="font-bold text-gray-900 hover:text-gray-700 transition-colors shrink-0">
            Fee Auditor
          </Link>

          <div className="hidden lg:flex items-center gap-6">
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
              <div className="grid gap-0.5 sm:min-w-[22rem]">
                {PRODUCT_ITEMS.map((item) => (
                  <TrackedLink
                    key={item.title}
                    href={item.href}
                    utm={item.utm}
                    funnelEvent="funnel_sample_cta"
                    funnelProps={{ placement: "nav_product" }}
                    className="rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors"
                    onClick={closeMenus}
                  >
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </TrackedLink>
                ))}
              </div>
            </NavDropdown>

            <Link href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
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
                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={closeMenus}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <TrackedLink
              href="/#pricing"
              funnelEvent="funnel_nav_about"
              funnelProps={{ placement: "nav_pricing" }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Upload CSV
            </TrackedLink>
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <XIcon className="size-5" aria-hidden /> : <MenuIcon className="size-5" aria-hidden />}
          </button>
        </div>

        <div className="hidden md:flex mt-2 border-t border-gray-100 pt-2 gap-1 overflow-x-auto">
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 whitespace-nowrap transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <span className="mx-1 text-gray-200">|</span>
          <TrackedLink
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "nav", campaign: "nav_section_sample" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "nav_section" }}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 whitespace-nowrap transition-colors"
          >
            Sample report
          </TrackedLink>
        </div>

        {mobileOpen ? (
          <div id="landing-mobile-nav" className="lg:hidden mt-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm space-y-3">
            <p className="px-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Product</p>
            {PRODUCT_ITEMS.map((item) => (
              <TrackedLink
                key={item.title}
                href={item.href}
                utm={item.utm}
                funnelEvent="funnel_sample_cta"
                funnelProps={{ placement: "nav_mobile_product" }}
                className="block rounded-lg px-2 py-2 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </TrackedLink>
            ))}
            <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Page</p>
            {SECTION_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Resources</p>
            {RESOURCE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
              className="block rounded-lg bg-gray-900 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
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
