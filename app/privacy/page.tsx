import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Stripe Fee Auditor",
  description: "Privacy Policy for Stripe Fee Auditor — how we handle your data.",
};

/** Set in Vercel / .env.local — env overrides this fallback address. */
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "ksantor19811606@gmail.com";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 1, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              Stripe Fee Auditor (&quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;) is a tool that analyzes
              Stripe Balance CSV exports to help you understand your fee structure.
              We are committed to handling your data with care and transparency.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div>
                <p className="font-medium text-gray-800 mb-1">CSV file content</p>
                <p>
                  When you upload a Stripe Balance CSV, the file is transmitted to our server
                  over an encrypted HTTPS connection, processed in memory to generate your
                  analysis, and <strong>is not stored as a raw file on disk</strong>. Parsed
                  values are used only to compute the report.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Analysis results</p>
                <p>
                  The computed analysis (fee totals, rates, anomalies, etc.) is stored in our
                  database and linked to a random report ID plus a private access token you
                  receive in the URL. <strong>Free preview reports expire about 1 hour</strong>{" "}
                  after creation. If you complete a purchase, we extend access so your report
                  remains available for <strong>up to 30 days</strong> from the time of payment.
                  Stored results are derived from your CSV — not a full copy of the file.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Email address</p>
                <p>
                  If you provide your email (for example at the report gate or checkout), we use
                  it to reach you about your report (for example a link after payment). We do
                  not send marketing email. We do not sell or share your email with third parties
                  for their own marketing.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">IP address</p>
                <p>
                  We log your IP address for rate limiting (to prevent abuse of the free tier).
                  Rate limit records are deleted after approximately 2 days.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Analytics</p>
                <p>
                  We do not use third-party cookie-based behavioural advertising on this site at
                  launch. If we add privacy-friendly, aggregate-only analytics later, we will
                  update this policy and list the provider here.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
              <li>To generate your fee analysis report</li>
              <li>To send transactional messages about your report (when email is provided and a mail provider is configured)</li>
              <li>To enforce rate limits and prevent abuse</li>
              <li>To operate payments and unlock paid features</li>
            </ul>
            <p className="text-gray-600 mt-3">
              We do not use your financial data for advertising, profiling, or any purpose beyond
              providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use the following infrastructure and service providers (their own policies apply):
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
              <li><strong>Vercel</strong> — hosting and edge infrastructure (vercel.com/legal/privacy-policy)</li>
              <li><strong>Neon</strong> — PostgreSQL for report metadata and analysis results (neon.com/privacy-policy)</li>
              <li><strong>Lemon Squeezy</strong> — payment processing (lemonsqueezy.com/privacy)</li>
              <li><strong>Resend</strong> — transactional email delivery when enabled (resend.com/legal/privacy-policy)</li>
            </ul>
            <p className="text-gray-600 mt-3">
              We only share with them what is needed to run the Service (for example payment
              receipts, report identifiers you pass at checkout, or an email address you give us).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="px-4 py-3">Raw CSV file</td>
                    <td className="px-4 py-3">Not stored as a file; processed in memory for the request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Analysis result (free / unpaid access)</td>
                    <td className="px-4 py-3">Expires about 1 hour after the report is created (may be briefly extended during checkout)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Analysis result (after successful payment)</td>
                    <td className="px-4 py-3">Up to 30 days from payment, then deleted automatically</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Email address</td>
                    <td className="px-4 py-3">Kept only while the corresponding report row exists; deleted when the report expires</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">IP address (rate limit)</td>
                    <td className="px-4 py-3">Deleted after about 2 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Security</h2>
            <p className="text-gray-600 leading-relaxed">
              Data is transmitted over HTTPS. CSV content is processed on the server for analysis
              and is not written to a public bucket. Report access uses a secret token in addition
              to the report ID. We use rate limiting and other controls to reduce abuse.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You may request deletion of the stored analysis associated with your report by
              contacting us and providing your report ID (and any access details we need to verify
              your request). Rows are also removed automatically when they expire. We do not operate
              a user account system, so there is no separate &quot;profile&quot; beyond what is tied
              to an active report row.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Children</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service is not directed at children under 13. We do not knowingly collect data
              from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy. Material changes will be reflected in the
              &quot;Last updated&quot; date above. Continued use of the Service after changes
              constitutes acceptance where permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For privacy-related questions or data requests, contact us at:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm text-gray-400 flex-wrap">
          <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
          <Link href="/refund" className="hover:text-gray-600">Refund Policy</Link>
          <Link href="/" className="hover:text-gray-600">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
