import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Stripe Fee Auditor",
  description: "Privacy Policy for Stripe Fee Auditor — how we handle your data.",
  alternates: { canonical: "/privacy" },
};

/** Set in Vercel / .env.local — env overrides this public support address. */
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "support@feeauditor.com";
const OPERATOR_NAME =
  process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim() || "the operator of Stripe Fee Auditor";
const OPERATOR_JURISDICTION = process.env.NEXT_PUBLIC_OPERATOR_JURISDICTION?.trim();
const OPERATOR_ADDRESS = process.env.NEXT_PUBLIC_OPERATOR_ADDRESS?.trim();

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: July 19, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              Stripe Fee Auditor (&quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;) is a tool that analyzes
              Stripe Balance CSV exports to help you understand your fee structure.
              We are committed to handling your data with care and transparency. The data controller
              for the personal data described in this policy is <strong>{OPERATOR_NAME}</strong>
              {OPERATOR_JURISDICTION ? <> ({OPERATOR_JURISDICTION})</> : null}
              {OPERATOR_ADDRESS ? <> at {OPERATOR_ADDRESS}</> : null}. You can contact the operator at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                {CONTACT_EMAIL}
              </a>.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              Fee analysis is produced by a <strong>deterministic algorithm</strong> (not a generative
              AI / LLM model). We do not send your CSV to third-party AI providers for analysis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div>
                <p className="font-medium text-gray-800 mb-1">CSV file content (processed, not retained as a file)</p>
                <p>
                  When you upload a Stripe Balance CSV, the file is transmitted to our server
                  over an encrypted HTTPS connection, <strong>processed in memory</strong> for that
                  request to generate your analysis, and <strong>is not stored as a raw CSV file</strong>{" "}
                  on disk, object storage, or a durable blob. We store only the{" "}
                  <strong>computed analysis result</strong> (JSON aggregates such as totals, rates,
                  fee mix, and selected charge-level fields needed for the report). A Stripe Balance
                  export typically contains transaction amounts and fees — not full card numbers — and
                  is not treated as cardholder data under PCI DSS card storage rules; still, we
                  minimize what we keep after analysis (including stripping free-text descriptions
                  where they are not needed).
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Computed analysis result</p>
                <p>
                  The computed analysis (fee totals, rates, high-fee charge flags, monthly breakdowns,
                  etc.) is stored in our database and linked to a random report ID plus a private
                  access token. Retention depends on whether the report is an unpaid preview, you
                  save an email link, beta full access applies, or you pay — see section 6.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Email address</p>
                <p>
                  Email is <strong>optional</strong> for viewing a preview (you can continue without
                  it). If you choose to submit your email (report gate, checkout, Fee Monitor,
                  waitlist, or monthly tips), you are requesting that we store it for the purpose you
                  selected: private report link / transactional messages, payment follow-up, monthly
                  CSV reminders, waitlist updates, or the newsletter. Marketing or newsletter emails
                  are sent only when you explicitly subscribe. We do not sell your email or personal
                  information.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">UTM and attribution parameters</p>
                <p>
                  When present, we may store campaign attribution with the report row — for example{" "}
                  <code className="text-xs">utm_source</code>, <code className="text-xs">utm_medium</code>,{" "}
                  <code className="text-xs">utm_campaign</code>, <code className="text-xs">utm_content</code>,
                  landing path, and HTTP referrer — to understand which pages or campaigns led to an
                  upload. These are marketing analytics fields, not the contents of your CSV.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">IP address</p>
                <p>
                  We log your IP address for rate limiting (to prevent abuse). Rate limit records are deleted after approximately 2 days.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Operational logs</p>
                <p>
                  Our hosting and infrastructure providers may process limited technical logs
                  such as request timestamps, IP addresses, URLs, error traces, and user-agent
                  data so the Service can run securely and reliably.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Analytics</p>
                <p>
                  We use{" "}
                  <a href="https://plausible.io/privacy" className="text-blue-600 hover:underline" rel="noopener noreferrer">
                    Plausible Analytics
                  </a>{" "}
                  (EU-hosted, privacy-focused, no cookies by default) to measure aggregate traffic.
                  First-party funnel events may also be logged server-side without raw CSV or full
                  report payloads. If Google Analytics 4 is configured, it is used for product
                  analytics, not advertising retargeting. We do not use third-party cookie-based
                  behavioural advertising.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
              <li>To generate your fee analysis report</li>
              <li>To send transactional messages about your report (when email is provided and a mail provider is configured)</li>
              <li>To provide Fee Monitor reminders and subscription-related messages when you subscribe</li>
              <li>To send monthly Stripe fee tips only when you explicitly subscribe</li>
              <li>To enforce rate limits and prevent abuse</li>
              <li>To operate payments and unlock paid features</li>
              <li>To understand aggregate traffic and improve the Service (via Plausible Analytics — see section 2)</li>
            </ul>
            <p className="text-gray-600 mt-3">
              We do not use your financial data for advertising, profiling, or any purpose beyond
              providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Legal Bases</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Where data protection law requires a legal basis, we rely on:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
              <li><strong>Contract</strong> — to process your CSV, generate reports, unlock paid access, and send transactional report messages.</li>
              <li><strong>Legitimate interests</strong> — to prevent abuse, secure the Service, debug errors, keep minimal operational logs, and measure aggregate website usage.</li>
              <li><strong>Legal obligations</strong> — where payment, tax, accounting, dispute, or consumer-protection records must be retained.</li>
              <li><strong>Consent</strong> — where we specifically ask for it (for example optional marketing).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use the following infrastructure and service providers (their own policies apply):
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
              <li><strong>Vercel</strong> — hosting and edge infrastructure (vercel.com/legal/privacy-policy)</li>
              <li><strong>Neon</strong> — PostgreSQL for report metadata and analysis results (neon.com/privacy-policy)</li>
              <li><strong>Polar</strong> — checkout, payment processing, receipts, and order-related records as our payment provider / merchant of record where applicable (polar.sh/legal/privacy)</li>
              <li><strong>Resend</strong> — transactional email delivery when enabled (resend.com/legal/privacy-policy)</li>
              <li><strong>Plausible Analytics</strong> — privacy-oriented, aggregate traffic metrics (plausible.io/privacy)</li>
              <li><strong>Google Analytics 4</strong> — product analytics only when configured (policies.google.com/privacy)</li>
            </ul>
            <p className="text-gray-600 mt-3">
              We only share with them what is needed to run the Service (for example payment
              receipts, report identifiers needed for checkout, or an email address you give us).
              These providers may process data in countries outside your own. Where required,
              we rely on their published transfer safeguards and data processing terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Retention</h2>
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
                    <td className="px-4 py-3">Not stored as a file; processed in memory for the request only</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Computed result (unpaid preview, no email)</td>
                    <td className="px-4 py-3">About <strong>1 hour</strong> after creation (may be briefly extended during checkout)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Computed result (unpaid, after you save an email)</td>
                    <td className="px-4 py-3">Extended to about <strong>72 hours</strong> from when the email is saved, so you can reopen the private link</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Computed result (after successful payment)</td>
                    <td className="px-4 py-3">Up to <strong>30 days</strong> from payment, then deleted automatically</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Computed result (beta full access)</td>
                    <td className="px-4 py-3">Up to <strong>30 days</strong> from report creation while the beta flag is enabled</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">UTM / attribution fields</td>
                    <td className="px-4 py-3">Deleted with the report row when it expires or on a verified deletion request</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Checkout session link state</td>
                    <td className="px-4 py-3">Short-lived server-side checkout state expires after about 24 hours</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Payment webhook event IDs</td>
                    <td className="px-4 py-3">Kept for up to 90 days to prevent duplicate payment processing</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Fee Monitor subscription email</td>
                    <td className="px-4 py-3">Kept while the subscription is active or until deletion request where legally possible; payment records are retained by Polar under their policy</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Email address (report / lists)</td>
                    <td className="px-4 py-3">Report emails are kept while the corresponding report row exists; newsletter and waitlist emails are kept until unsubscribe, deletion request, or list cleanup</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">IP address (rate limit)</td>
                    <td className="px-4 py-3">Deleted after about 2 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Site analytics (Plausible)</td>
                    <td className="px-4 py-3">Processed by Plausible under their retention policy; we do not send raw CSV or report contents there</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Security</h2>
            <p className="text-gray-600 leading-relaxed">
              Data is transmitted over HTTPS. CSV content is processed on the server for analysis
              and is not written to a public bucket. Report access uses a secret token in addition
              to the report ID. We use rate limiting and other controls to reduce abuse.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Your Rights (GDPR / CCPA and similar laws)</h2>
            <p className="text-gray-600 leading-relaxed">
              <strong>Deletion / erasure:</strong> email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Data deletion request")}`}
                className="text-blue-600 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              with subject &quot;Data deletion request&quot; and your report ID (and any access
              details we need to verify the request). We will delete the stored analysis and related
              personal data we hold for that report where legally possible. Rows are also removed
              automatically when they expire. We do not operate a user account system, so there is no
              separate &quot;profile&quot; beyond what is tied to an active report or subscription row.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              <strong>Access / know:</strong> you may ask what personal data we hold about you in
              connection with a report or email you provided (subject to verification).
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              <strong>Do not sell / share for ads:</strong> we do <strong>not sell</strong> personal
              information and we do not share it for cross-context behavioural advertising. If you
              are a California resident, you may still contact us to exercise CCPA rights that apply
              to you.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              Depending on where you live, you may also have rights to correct, restrict, object to,
              or receive a copy of your personal data, and to complain to a local data protection
              authority. We will not discriminate against you for exercising privacy rights that
              apply to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Automated Analysis</h2>
            <p className="text-gray-600 leading-relaxed">
              Reports are generated automatically from the CSV data you provide using deterministic
              fee calculations — not a machine-learning model that profiles you. The report is
              informational only and does not make legal, financial, credit, employment, or other
              similarly significant decisions about you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Children</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service is not directed at children. We do not knowingly collect data from
              children under 13, or under the higher age threshold that may apply in your country.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Changes</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy. Material changes will be reflected in the
              &quot;Last updated&quot; date above. Continued use of the Service after changes
              constitutes acceptance where permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
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
    </MarketingShell>
  );
}
