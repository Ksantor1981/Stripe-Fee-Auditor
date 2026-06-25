import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LandingNav } from "@/components/LandingNav";

export const metadata: Metadata = {
  title: "About the Founder & Data Handling | Stripe Fee Auditor",
  description:
    "Who built Stripe Fee Auditor, why it exists, and what data we store (and do not store) when you upload a Stripe Balance CSV.",
  alternates: { canonical: "/about" },
};

const FOUNDER_LINKS = [
  { label: "GitHub", href: "https://github.com/Ksantor1981" },
  { label: "Product Hunt", href: "https://www.producthunt.com/products/stripe-fee-auditor?launch=stripe-fee-auditor" },
  { label: "Indie Hackers", href: "https://www.indiehackers.com/product/stripe-fee-auditor-2" },
];

const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Konstantin Starkov",
  url: "https://feeauditor.com/about",
  sameAs: FOUNDER_LINKS.map((link) => link.href),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <LandingNav />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} className="mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">About Stripe Fee Auditor</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">
          Stripe Fee Auditor is an independent tool that helps founders and finance teams understand
          their real Stripe processing and all-in cost rates from a Balance Transactions CSV — without
          connecting Stripe OAuth or sharing API keys.
        </p>

        <section className="mt-10 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white"
              aria-hidden
            >
              KS
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">About the founder</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Built by Konstantin Starkov, an indie SaaS founder. I built Stripe Fee Auditor after
                seeing how quickly the real Stripe cost can drift away from the headline 2.9% rate:
                one sample export showed a 3.82% card processing rate and a 4.02% all-in Stripe cost.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                The product is intentionally narrow: one CSV export, one question, one report that
                explains whether fees are normal or worth investigating.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {FOUNDER_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-200 hover:text-blue-700"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Why it exists</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Stripe&apos;s advertised 2.9% + $0.30 is only part of the story. International cards,
            small charges, refunds, disputes, and add-on services push the blended rate higher — often
            without a clear dashboard view. This tool turns your exported Balance data into a readable
            audit: processing rate, all-in cost, monthly trends, high-fee charges, and directional
            savings ideas.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Privacy &amp; data handling</h2>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 leading-relaxed">
            <li>
              <strong>No Stripe API access.</strong> You export CSV from the Stripe Dashboard and
              upload it once for analysis.
            </li>
            <li>
              <strong>Raw CSV is not stored as a file.</strong> We parse it in memory, compute
              aggregates, and discard the upload body.
            </li>
            <li>
              <strong>Computed report JSON</strong> (totals, rates, categorized rows) is stored so
              you can reopen your private link. Customer description fields are redacted before storage.
            </li>
            <li>
              <strong>USD accounts first.</strong> Beta supports USD Balance exports; multi-currency
              support is on the roadmap.
            </li>
          </ul>
          <p className="text-sm text-gray-600">
            Details:{" "}
            <Link href="/how-it-works" className="text-blue-600 hover:underline">
              How it works
            </Link>
            {" · "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Independence</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Stripe Fee Auditor is not affiliated with Stripe, Inc. We do not receive referral fees
            from Stripe for recommendations in reports. Action links point to Stripe Dashboard pages
            so you can verify settings yourself.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/analyze"
            className="inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Analyze my fees →
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
