/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { PILLAR_EFFECTIVE_RATE_PATH } from "@/app/blog/_data/blogIndex";

export const metadata: Metadata = {
  title: "Why Did My Stripe Effective Rate Jump This Month? | Fee Auditor",
  description:
    "Your Stripe blended rate changed month-over-month and you don't know why. Here are the 6 most common causes — and how to find which one hit you.",
  alternates: { canonical: "/blog/why-stripe-effective-rate-jumped-this-month" },
  openGraph: {
    title: "Why Did My Stripe Effective Rate Jump This Month?",
    description:
      "6 reasons your Stripe blended rate changed — and how to diagnose which one hit you.",
    url: "https://feeauditor.com/blog/why-stripe-effective-rate-jumped-this-month",
  },
};

const CAUSES = [
  {
    n: "1",
    title: "More international customers this month",
    signal: "International volume share increased",
    detail:
      "Each international card adds 1.5% cross-border surcharge on top of your base rate. If you ran a promotion, launched in a new country, or got featured somewhere with a global audience — even a 10% shift toward international customers moves your blended rate by 0.15 percentage points or more.",
    howToCheck:
      "In your Balance CSV, count rows where description contains [international]. Compare this month's count to last month's as a percentage of total charges.",
    fix: "Enable local payment methods (SEPA for EU, iDEAL for Netherlands) to eliminate the surcharge for those customers.",
    severity: "high",
  },
  {
    n: "2",
    title: "A new low-priced product or plan",
    signal: "Average transaction value decreased",
    detail:
      "The fixed $0.30 Stripe fee is the same on a $5 charge as on a $500 charge. On a $5 transaction, that's 6% before the percentage fee even applies. If you launched a starter plan, a trial tier, or a low-priced add-on this month, those charges drag up your effective rate significantly.",
    howToCheck:
      "Group your charges by amount bucket: under $10, $10–50, $50–100, $100+. If the under-$10 bucket grew as a share of volume this month, that's your answer.",
    fix: "Set a minimum charge amount, bundle small charges into monthly invoices, or switch low-priced plans to annual billing.",
    severity: "high",
  },
  {
    n: "3",
    title: "Refunds from a previous month hitting now",
    signal: "High refund count with non-zero fees",
    detail:
      "Stripe keeps the original processing fee when you issue a refund. If you processed a batch of refunds this month for charges from last month, you paid processing fees twice on that revenue — once when the charge was made, and the retained fee when you refunded it. This quietly inflates your effective rate.",
    howToCheck:
      "Filter your CSV for rows where type contains 'refund'. Sum the fee column for those rows. If it's non-zero, that's retained fee leakage from this period.",
    fix: "Monitor refund rates by product and cohort. A spike in refunds often signals a product or expectation mismatch worth addressing beyond just the fee cost.",
    severity: "medium",
  },
  {
    n: "4",
    title: "Currency conversion stacking on top of cross-border fees",
    signal: "Non-USD charges appeared or increased",
    detail:
      "Cross-border fee (1.5%) and currency conversion fee (~1%) are separate charges that both apply when an international customer pays in their local currency. Together they add 2.5% to the base rate — pushing a $100 charge from $3.20 to $5.70 in fees. If you started accepting payments in new currencies this month, this compounds the international card effect.",
    howToCheck:
      "In your Balance CSV, filter for rows where currency is not 'usd'. These charges may have paid both the cross-border surcharge and the conversion fee.",
    fix: "Settle in the customer's local currency using Stripe's local settlement options, which can eliminate the conversion fee while keeping the cross-border fee.",
    severity: "medium",
  },
  {
    n: "5",
    title: "Stripe Billing or add-on fees newly applied",
    signal: "Other fees increased relative to charge fees",
    detail:
      "If you recently enabled Stripe Billing, Stripe Tax, Stripe Radar additional rules, or Stripe Link — each adds fees that show up as separate line items in your Balance CSV. Stripe Billing adds 0.7% of billing volume (pay-as-you-go). Stripe Tax adds 0.5% per taxed transaction. These don't show in your card processing rate but raise your all-in effective rate.",
    howToCheck:
      "In your Balance CSV, look at rows where type is 'stripe_fee' or reporting_category is not 'charge'. Sum these separately. If they grew this month, a product add-on is the cause.",
    fix: "Evaluate whether the convenience of each add-on justifies the cost at your current volume. For high-volume SaaS, the flat annual Billing plan often beats 0.7% pay-as-you-go.",
    severity: "medium",
  },
  {
    n: "6",
    title: "Dispute or chargeback fees",
    signal: "Fee spikes on specific dates",
    detail:
      "Each dispute costs $15 regardless of outcome. If you had even 3–4 chargebacks this month, that's $45–60 in flat fees on top of your processing costs. On a $10,000 revenue month, that's 0.45% added to your effective rate from disputes alone — before you even account for the reversed charge if you lose.",
    howToCheck:
      "Filter your CSV for rows where type contains 'dispute'. Count them and multiply by $15. Compare to previous months to see if this is a new pattern.",
    fix: "Review your Stripe Radar settings, improve your payment descriptor clarity (what shows on customer bank statements), and add 3D Secure for high-risk transactions.",
    severity: "low",
  },
];

const SEVERITY_STYLE: Record<string, { badge: string; border: string; bg: string }> = {
  high: {
    badge: "bg-red-50 text-red-700",
    border: "border-red-100",
    bg: "bg-red-50/20",
  },
  medium: {
    badge: "bg-amber-50 text-amber-700",
    border: "border-amber-100",
    bg: "bg-amber-50/20",
  },
  low: {
    badge: "bg-gray-100 text-gray-600",
    border: "border-gray-100",
    bg: "bg-gray-50/40",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          ← Blog
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-gray-400">8 min read</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">May 2026</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Why Did My Stripe Effective Rate Jump This Month?
        </h1>

        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          You checked your Stripe fees and noticed your effective rate is higher than last month.
          Nothing obvious changed. Here are the six most common causes — and exactly how to
          diagnose which one hit you.
        </p>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Faster diagnosis:</strong> Upload your Stripe Balance CSV to{" "}
          <Link href="/analyze" className="underline font-medium">
            feeauditor.com
          </Link>{" "}
          and the monthly breakdown shows your rate for each month with the delta vs previous
          period — the jump is visible immediately. Or{" "}
          <Link href="/analyze?sample=1" className="underline font-medium">
            try the sample report
          </Link>{" "}
          to see what this looks like.
        </div>

        <div className="mt-10 space-y-6 text-gray-700">
          <p className="leading-relaxed">
            A blended effective rate spike almost always has one of six causes. The challenge is
            that Stripe&apos;s dashboard doesn&apos;t surface the month-over-month comparison in a way
            that makes the cause obvious — you see total fees and total volume, but not what
            changed in the mix.
          </p>

          <p className="leading-relaxed">
            The good news: each cause leaves a specific fingerprint in your Balance CSV export.
            Here&apos;s how to read them.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          {CAUSES.map((cause) => {
            const style = SEVERITY_STYLE[cause.severity];
            return (
              <div
                key={cause.n}
                className={`rounded-2xl border p-6 ${style.border} ${style.bg}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 text-sm font-bold text-gray-600 shrink-0 mt-0.5">
                      {cause.n}
                    </span>
                    <h2 className="text-base font-bold text-gray-900 leading-snug">
                      {cause.title}
                    </h2>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${style.badge}`}>
                    {cause.severity === "high"
                      ? "Most common"
                      : cause.severity === "medium"
                        ? "Common"
                        : "Less common"}
                  </span>
                </div>

                <div className="ml-10 mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Signal:{" "}
                  </span>
                  <span className="text-xs text-gray-500 italic">{cause.signal}</span>
                </div>

                <p className="ml-10 text-sm text-gray-600 leading-relaxed mb-4">{cause.detail}</p>

                <div className="ml-10 rounded-lg bg-white border border-gray-100 px-4 py-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    How to check in your CSV
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">{cause.howToCheck}</p>
                </div>

                <div className="ml-10">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
                    What to do
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">{cause.fix}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">When multiple causes stack</h2>
            <p className="leading-relaxed">
              Rate spikes often have more than one cause simultaneously. A product launch that
              brings in international customers at a low price point combines causes 1 and 2 —
              the international surcharge and the fixed-fee dominance both apply to those
              transactions. The combined effect can push effective rate up by 2–3 percentage
              points in a single month.
            </p>
            <p className="mt-3 leading-relaxed">
              When diagnosing, start with the highest-severity causes first. International cards
              are responsible for rate spikes more often than any other single factor, especially
              for SaaS with any global distribution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              What a normal month-over-month variation looks like
            </h2>
            <p className="leading-relaxed">
              For a typical SaaS with mixed domestic and international customers, a variation of
              ±0.2 percentage points month-over-month is normal — it reflects small shifts in
              customer mix and transaction size distribution. Anything above ±0.5 percentage
              points usually has a specific cause worth investigating.
            </p>
            <p className="mt-3 leading-relaxed">
              A jump from 3.1% to 4.2% in a single month (1.1 percentage points) is almost
              certainly caused by something specific — not random variation. The most likely
              culprits in order: international volume surge, new low-priced product, or a batch
              of refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">The fastest way to diagnose</h2>
            <p className="leading-relaxed">
              Export your Stripe Balance CSV for the past 3–4 months (Itemized export from
              Reports → Balance summary → Export). Upload it to{" "}
              <Link href="/analyze" className="text-blue-600 underline">
                feeauditor.com
              </Link>
              . The monthly breakdown shows your effective rate for each month with the
              delta vs the previous period, and the anomaly breakdown shows which transaction
              categories are above baseline — which tells you directly which of the six causes
              above applies to your account.
            </p>
          </section>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
          <p className="font-semibold text-gray-900">See your month-over-month rate changes</p>
          <p className="mt-1 text-sm text-gray-600">
            Upload your Stripe Balance CSV and see your effective rate for each month, the
            delta vs previous period, and which transactions are driving the change. No OAuth,
            no account required. CSV is never stored.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/analyze"
              className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors text-center"
            >
              Analyze My Fees
            </Link>
            <Link
              href="/analyze?sample=1"
              className="inline-block rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Try sample report →
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-sm font-semibold text-gray-700 mb-4">Related articles</p>
          <div className="space-y-3">
            {[
              {
                href: PILLAR_EFFECTIVE_RATE_PATH,
                title: "Why Are My Stripe Fees Higher Than 2.9%?",
              },
              {
                href: "/blog/why-stripe-fees-increase",
                title: "Why Did My Stripe Fees Increase?",
              },
              {
                href: "/blog/stripe-international-card-fees",
                title: "Stripe International Card Fees Explained",
              },
              {
                href: "/blog/stripe-ach-vs-credit-card-fees",
                title: "ACH vs Credit Card Fees on Stripe",
              },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block text-sm text-blue-600 hover:underline"
              >
                {l.title} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
