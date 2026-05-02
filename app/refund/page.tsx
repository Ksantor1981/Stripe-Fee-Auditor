import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Stripe Fee Auditor",
  description:
    "Refund policy for Stripe Fee Auditor — one-time fee analysis reports and digital delivery.",
};

/** Fallback until NEXT_PUBLIC_CONTACT_EMAIL is set on Vercel. Env overrides when configured. */
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "ksantor19811606@gmail.com";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900 text-sm">
            Stripe Fee Auditor
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 1, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. What you&apos;re buying</h2>
            <p className="text-gray-600 leading-relaxed">
              Stripe Fee Auditor sells <strong>one-time digital access</strong> to an automated fee analysis
              based on the Stripe Balance CSV you upload. Delivery is complete when your paid report is
              unlocked in the product (including CSV export / print view where applicable).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Refunds — general</h2>
            <p className="text-gray-600 leading-relaxed">
              Because the deliverable is digital and produced instantly after payment, <strong>all sales are
              final</strong> except where mandatory consumer law requires otherwise or where we approve a refund
              in our discretion (for example duplicate charges or a verified failure on our side to unlock your
              report).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. When we will refund</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
              <li>You were charged more than once for the same unlock attempt.</li>
              <li>Payment succeeded but the report did not unlock due to a technical error attributable to us —
                contact us within <strong>7 days</strong> of payment with your order/receipt reference.</li>
              <li>Your statutory rights (for example under EU/UK consumer law for faulty digital content)
                are not limited by this policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. When we typically do not refund</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
              <li>You are dissatisfied with the <strong>substance</strong> of the analysis (figures depend on
                your CSV; see Terms — no warranty on accuracy).</li>
              <li>You uploaded the wrong file, exceeded retention windows, or lost your report link.</li>
              <li>You filed a chargeback instead of contacting us first — we may dispute invalid claims.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. How to request a refund</h2>
            <p className="text-gray-600 leading-relaxed">
              Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              with your Paddle order/receipt ID, the email used at checkout, and a short description of the
              issue. We aim to respond within <strong>3 business days</strong>. Approved refunds are processed
              through Paddle according to their timelines.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Related policies</h2>
            <p className="text-gray-600 leading-relaxed">
              Payment processing may show Paddle branding depending on checkout configuration. For broader
              terms, see our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm text-gray-400 flex-wrap">
          <Link href="/terms" className="hover:text-gray-600">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-gray-600">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-gray-600">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
