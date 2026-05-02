import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Stripe Fee Auditor",
  description: "Terms of Service for Stripe Fee Auditor.",
};

/** Same env as Privacy (`NEXT_PUBLIC_CONTACT_EMAIL`) — one inbox is fine. */
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "ksantor19811606@gmail.com";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 1, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Stripe Fee Auditor (&quot;the Service&quot;), you agree to be
              bound by these Terms of Service. If you do not agree, do not use the Service. These
              Terms apply to all users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Stripe Fee Auditor is an automated data analysis tool that processes Stripe Balance
              CSV exports to provide fee analysis reports. The Service is for informational
              purposes only and does not constitute financial, accounting, legal, or tax advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Not Affiliated with Stripe</h2>
            <p className="text-gray-600 leading-relaxed">
              Stripe Fee Auditor is an independent tool and is not affiliated with, endorsed by, or
              sponsored by Stripe, Inc. &quot;Stripe&quot; is a trademark of Stripe, Inc. We
              reference Stripe solely to describe the data format our tool accepts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. No Warranty — Accuracy Disclaimer</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
              <p className="text-amber-800 text-sm font-medium">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND.
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We do not guarantee that the analysis results are complete, accurate, or error-free.
              Results depend on the data in your CSV export. Fee rates vary by card type, country,
              payment method, and your agreement with Stripe. Verify results in your Stripe Dashboard
              or with a qualified professional before making decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STRIPE FEE AUDITOR AND ITS
              OPERATORS SHALL NOT BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 leading-relaxed mb-3">
              <li>Financial losses or decisions based on analysis results</li>
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Errors, inaccuracies, or omissions in the analysis</li>
              <li>Unauthorized access to your data despite our security measures</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              Our total liability to you for claims arising from use of the Service shall not
              exceed the greater of <strong>$100 USD</strong> or the amount you paid for the
              Service in the 30 days preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-3">By using the Service, you confirm that:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
              <li>You have the right to upload and process the CSV data you provide</li>
              <li>You will not upload others&apos; data without authorization</li>
              <li>You will not reverse-engineer, abuse, or circumvent the Service</li>
              <li>You will not use the Service for unlawful purposes</li>
              <li>You understand results are automated estimates, not professional advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Payments and Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              Paid reports are processed through Lemon Squeezy. Digital delivery is considered
              complete when your report is unlocked. If the Service fails to deliver unlock or
              access due to an error on our side, contact us within 7 days; we will work with you
              in good faith (including refunds where appropriate). Other refund requests are
              evaluated case by case and may be subject to the payment provider&apos;s policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed">
              You may not use the Service to upload malicious files, access other users&apos;
              reports, run automated scraping or excessive requests in a way that harms the
              Service, or interfere with its operation. We may block access for abuse without
              notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service, including its design, algorithms, and code, is owned by the operator of
              Stripe Fee Auditor. The report generated from your data is for your use. You retain
              rights to your underlying business data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of the European Union and applicable member
              state law where the operator is located, excluding conflict-of-law rules. Disputes
              shall be brought in the competent courts of that jurisdiction unless mandatory
              consumer law in your country says otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify these Terms. The &quot;Last updated&quot; date will change when we do.
              Continued use after changes may constitute acceptance where permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms, contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm text-gray-400 flex-wrap">
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-gray-600">Refund Policy</Link>
          <Link href="/" className="hover:text-gray-600">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
