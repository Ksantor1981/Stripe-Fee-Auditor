import type { Metadata } from "next";
import Link from "next/link";

import { ChromeExtensionInstallCta } from "@/components/ChromeExtensionInstallCta";
import { FeeMonitorWaitlistForm } from "@/components/FeeMonitorWaitlistForm";
import { ManageBillingForm } from "@/components/ManageBillingForm";

export const metadata: Metadata = {
  title: "Fee Monitor — Catch Stripe Rate Drift Before It Becomes Normal",
  description:
    "Catch rate drift, refund leakage, and one-off anomalies before they become normal. Monthly CSV reminders — no permanent Stripe OAuth. $9/month.",
  alternates: { canonical: "/monitor" },
  openGraph: {
    title: "Fee Monitor — Catch Stripe Rate Drift Before It Becomes Normal",
    description:
      "Catch rate drift, refund leakage, and one-off anomalies before they become normal. Monthly CSV reminders without permanent Stripe OAuth.",
    url: "/monitor",
  },
};

const included = [
  "Monthly reminder to upload the latest Stripe Balance CSV",
  "A fresh full report for each monthly CSV upload",
  "A manual monthly check for refund leakage, high-fee charges, and one-off anomalies",
  "Processing rate vs all-in Stripe cost for each report",
  "Early access to report history and automatic drift alerts when they ship",
];

const notYet = [
  "No live Stripe OAuth connection in the first version",
  "No automatic sync until users ask for it",
  "No automatic cross-month comparison or drift alert yet",
  "No accounting, tax, or bookkeeping advice",
];

interface Props {
  searchParams?: Promise<{ payment?: string }>;
}

export default async function MonitorPage({ searchParams }: Props) {
  const payment = (await searchParams)?.payment;
  const paymentSuccess = payment === "success";

  return (
    <main className="min-h-screen bg-white text-gray-950">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-bold text-gray-900 hover:text-gray-700">
          Stripe Fee Auditor
        </Link>
        <Link href="/analyze" className="text-sm font-medium text-blue-600 hover:underline">
          Analyze a CSV →
        </Link>
      </nav>

      {paymentSuccess && (
        <section className="mx-auto max-w-5xl px-6 pt-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Fee Monitor active
            </p>
            <h2 className="mt-2 text-2xl font-bold">You&apos;re subscribed. Here&apos;s what happens next.</h2>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-xl bg-white/70 p-4">
                <p className="font-semibold">Monthly reminder</p>
                <p className="mt-1 text-emerald-900/75">You&apos;ll get a CSV reminder on the first day of each month.</p>
              </div>
              <div className="rounded-xl bg-white/70 p-4">
                <p className="font-semibold">Upload fresh CSV</p>
                <p className="mt-1 text-emerald-900/75">Export a new Stripe Balance CSV and run a fresh audit.</p>
              </div>
              <div className="rounded-xl bg-white/70 p-4">
                <p className="font-semibold">Watch rate drift</p>
                <p className="mt-1 text-emerald-900/75">Compare processing rate, all-in cost, and fee drivers month to month.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/analyze"
                className="inline-flex justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Audit a CSV now
              </Link>
              <Link
                href="/stripe-balance-csv"
                className="inline-flex justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                How to export the right CSV
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Fee Monitor · $9/mo</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
            Build a monthly Stripe fee-check habit before drift becomes invisible.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            <span className="font-semibold text-gray-900">$12</span> = one CSV check (this export, 30 days).{" "}
            <span className="font-semibold text-gray-900">$9/mo</span> = a monthly reminder + fresh
            full report. It is a manual check today; report history and automatic drift alerts come
            only after they ship. No permanent Stripe OAuth — you stay in control of every export.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/api/checkout/monitor?source=monitor_page_hero"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Start Fee Monitor — $9/mo
            </Link>
            <Link
              href="/analyze?sample=1"
              className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Run sample first
            </Link>
          </div>
          <div className="mt-4">
            <ChromeExtensionInstallCta placement="monitor_hero" variant="quiet" />
          </div>
          <div className="mt-7 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="font-semibold text-gray-950">No OAuth first</p>
              <p className="mt-1">You stay in control of every CSV export.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="font-semibold text-gray-950">History</p>
              <p className="mt-1">Report history is planned; today, save each private report link.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="font-semibold text-gray-950">Alerts later</p>
              <p className="mt-1">Monthly reminders now; automatic drift alerts later if demand is real.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-950">Monthly fee check</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-extrabold text-gray-950">$9</span>
            <span className="pb-1 text-sm font-medium text-gray-500">/ month</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-blue-900/80">
            Compared to a one-time $12 investigation: Monitor is for founders who want a reminder to
            repeat the check. It is not yet automatic monitoring or a historical dashboard.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-blue-950/80">
            {included.slice(0, 4).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/api/checkout/monitor?source=monitor_page_pricing"
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Subscribe with Polar
          </Link>
          <p className="mt-3 text-center text-xs leading-relaxed text-blue-900/60">
            You can still use one-time CSV audits without subscribing.
          </p>
          <div className="mt-5">
            <ManageBillingForm source="monitor_pricing_card" />
          </div>
          <div className="mt-5 border-t border-blue-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
              Not ready?
            </p>
            <div className="mt-3">
              <FeeMonitorWaitlistForm source="monitor_page_hero_waitlist" ctaLabel="Join early list" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Why it exists</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-gray-950">
            The useful question is not just “what is my rate?”
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            It is “did my rate get worse, why, and what should I inspect first?” Today Monitor
            creates the recurring check-in habit; comparison history and automatic drift detection
            are future functionality, not a promise already delivered.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["1", "Upload each month", "Use the same Balance CSV export workflow you already trust."],
              ["2", "Keep your report links", "Compare the new report with your prior export manually until in-product history ships."],
              ["3", "Get a monthly nudge", "A reminder brings you back before fee drift becomes invisible."],
            ].map(([step, title, copy]) => (
              <div key={step} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">First version</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">What is included</h2>
            <ul className="mt-5 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-700">
                  <span className="text-blue-600">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Not yet</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">What we are not pretending</h2>
            <ul className="mt-5 space-y-3">
              {notYet.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                  <span className="text-gray-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-slate-950 p-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">Newsletter</p>
          <h2 className="mt-2 text-2xl font-bold">Want monthly fee tips before subscribing?</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Join the free list if you only want occasional Stripe fee notes and product updates.
            Subscribe when you want the monthly CSV reminder habit.
          </p>
          <div className="mt-6">
            <FeeMonitorWaitlistForm source="monitor_page_bottom" ctaLabel="Join free list" />
          </div>
        </div>
      </section>
    </main>
  );
}
