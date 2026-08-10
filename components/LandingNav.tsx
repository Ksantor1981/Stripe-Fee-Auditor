"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { TrackedLink } from "@/components/TrackedLink";

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
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const productActions = useMemo(
    () =>
      [
        {
          href: "/analyze",
          title: t("uploadCsv"),
          desc: t("uploadCsvDesc"),
          utm: { source: "landing", medium: "nav", campaign: "nav_product_upload" },
          funnelEvent: "funnel_landing_cta" as const,
          primary: true,
        },
        {
          href: "/analyze?sample=1",
          title: t("seeSampleReport"),
          desc: t("seeSampleDesc"),
          utm: { source: "landing", medium: "nav", campaign: "nav_product_sample" },
          funnelEvent: "funnel_sample_cta" as const,
          primary: false,
        },
      ] as const,
    [t]
  );

  const productIncludes = useMemo(
    () =>
      [
        { title: t("rateAnalysis"), desc: t("rateAnalysisDesc") },
        { title: t("feeBreakdown"), desc: t("feeBreakdownDesc") },
        { title: t("savingsFinder"), desc: t("savingsFinderDesc") },
        { title: t("benchmarking"), desc: t("benchmarkingDesc") },
      ] as const,
    [t]
  );

  const resourceItems = useMemo(
    () =>
      [
        { href: "/stripe-balance-csv", label: t("balanceCsvGuide") },
        { href: "/stripe-fee-calculator", label: t("feeCalculator") },
        { href: "/chrome-extension", label: t("chromeHelper") },
        { href: "/blog", label: t("blog") },
      ] as const,
    [t]
  );

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
            {tc("brand")}
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <NavDropdown
              label={t("product")}
              open={productOpen}
              onToggle={() => {
                setProductOpen((v) => !v);
                setResourcesOpen(false);
              }}
              onClose={closeMenus}
              panelId="nav-product-menu"
            >
              <div className="grid gap-0.5 sm:min-w-[24rem]">
                {productActions.map((item) => (
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
                  {t("everyReportIncludes")}
                </p>
                {productIncludes.map((item) => (
                  <div key={item.title} className="rounded-lg px-3 py-2.5">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </NavDropdown>

            <Link href="/how-it-works" className={NAV_LINK_CLASS}>
              {t("howItWorks")}
            </Link>

            <NavDropdown
              label={t("resources")}
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
                {resourceItems.map((item) => (
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
              {t("pricing")}
            </TrackedLink>

            <LocaleSwitcher />
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <TrackedLink
              href="/analyze"
              utm={{ source: "landing", medium: "nav", campaign: "header_cta" }}
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "nav" }}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-base font-semibold text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              {t("uploadCsv")}
            </TrackedLink>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LocaleSwitcher />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-nav"
              aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <XIcon className="size-5" aria-hidden /> : <MenuIcon className="size-5" aria-hidden />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div id="landing-mobile-nav" className="lg:hidden mt-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm space-y-3">
            <p className="px-2 text-xs font-semibold uppercase tracking-widest text-gray-400">{t("product")}</p>
            {productActions.map((item) => (
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
              {t("everyReportIncludes")}
            </p>
            {productIncludes.map((item) => (
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
              {t("howItWorks")}
            </Link>
            <Link
              href="/pricing"
              className="block rounded-lg px-2 py-2.5 text-base font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              {t("pricing")}
            </Link>
            <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-widest text-gray-400">{t("resources")}</p>
            {resourceItems.map((item) => (
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
              {t("uploadCsv")}
            </TrackedLink>
          </div>
        ) : null}
      </nav>
    </div>
  );
}
