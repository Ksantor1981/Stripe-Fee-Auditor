import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FeeMonitorWaitlistForm } from "@/components/FeeMonitorWaitlistForm";

export const metadata: Metadata = {
  title: "FeeAuditor Automatic Monitoring - Early Access",
  description:
    "Join early access for automatic Stripe cost monitoring and effective-rate change alerts. In development; no subscription or card.",
  alternates: { canonical: "/monitor" },
};

export default function MonitorPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Automatic monitoring" }]} />
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-blue-600">
          In development
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900">
          Want FeeAuditor to watch your Stripe costs automatically?
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-600">
          We are exploring automatic monitoring for effective-rate changes and new cost issues.
          Phase 1 remains a free manual CSV audit; there is no monitoring subscription yet.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">Rate drift</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Compare the same Stripe export period over time and flag meaningful changes in
              processing rate or all-in cost instead of reacting to one noisy transaction.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">New cost drivers</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Surface changes in international-card mix, small-ticket pressure, refunds, disputes,
              and non-charge fee lines when they begin to affect the monthly result.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">Controlled access</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              The current product uses manual CSV uploads and no Stripe OAuth. Early access does not
              activate monitoring, create a subscription, or ask for payment details.
            </p>
          </div>
        </section>

        <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
          <h2 className="text-xl font-bold text-gray-950">Join Early Access</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Tell us this workflow matters. We will notify you when there is something real to test.
            No card, no OAuth, and no paid plan.
          </p>
          <div className="mt-5">
            <FeeMonitorWaitlistForm source="monitoring_interest" ctaLabel="Join Early Access" />
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
