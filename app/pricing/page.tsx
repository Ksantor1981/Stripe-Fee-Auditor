import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { TrackedLink } from "@/components/TrackedLink";
import { FULL_REPORTS_FREE_DURING_BETA } from "@/lib/beta-access";

export const metadata: Metadata = {
  title: "Pricing — $12 CSV audit · Fee Monitor $9/mo",
  description:
    "One Stripe Balance CSV audit for $12. Preview free. Optional Fee Monitor at $9/mo for monthly CSV reminders and rate drift checks. No OAuth.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-lg px-4 py-14 sm:px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Pricing</h1>
        <p className="mt-3 text-base text-gray-600">
          $12 = one CSV audit. Preview first — pay once for full rows, exports, and a 30-day private link.
          {FULL_REPORTS_FREE_DURING_BETA ? " Full report is free during beta." : null}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Not a CSV summary — ranked savings actions, high-fee row evidence, and Stripe dashboard links from your export.
        </p>

        <div className="mt-8 rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-6 text-left shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">One audit · $12</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">This CSV, once</p>
          <ul className="mt-4 space-y-2 text-base text-gray-700">
            <li>Full high-fee rows &amp; savings ideas</li>
            <li>CSV + print export</li>
            <li>Private link · 30 days</li>
          </ul>
          {FULL_REPORTS_FREE_DURING_BETA ? (
            <p className="mt-4 text-sm font-medium text-emerald-800">Currently free during beta.</p>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Refund if payment succeeds but the report does not unlock.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Optional · $9/mo</p>
          <p className="mt-1 text-xl font-bold text-gray-900">Fee Monitor</p>
          <p className="mt-2 text-base text-gray-600">
            Monthly CSV reminder, rate drift checks, and report history — not another dashboard.
          </p>
          <Link href="/monitor" className="mt-4 inline-flex text-base font-semibold text-blue-600 hover:underline">
            Fee Monitor →
          </Link>
        </div>

        <TrackedLink
          href="/analyze"
          utm={{ source: "pricing", medium: "cta", campaign: "pricing_upload" }}
          funnelEvent="funnel_landing_cta"
          funnelProps={{ placement: "pricing_page" }}
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          Upload CSV
        </TrackedLink>
        <p className="mt-4 text-sm text-gray-500">
          <Link href="/stripe-fee-calculator" className="text-blue-600 hover:underline">
            Estimate without CSV
          </Link>
          {" · "}
          <Link href="/how-it-works" className="text-blue-600 hover:underline">
            How it works
          </Link>
        </p>
      </section>
    </MarketingShell>
  );
}
