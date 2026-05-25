/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogArticleCta } from "@/components/BlogArticleCta";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";
import { PILLAR_EFFECTIVE_RATE_PATH } from "../_data/blogIndex";

const slug = "/blog/stripe-fee-audit-checklist-for-saas-founders";
const pageTitle = "Stripe Fee Audit Checklist for SaaS Founders";
const pageDescription =
  "A practical monthly Stripe fee audit checklist for SaaS founders: effective rate, Balance CSV, international cards, refunds, small charges, ACH, and month-over-month monitoring.";
const ogImage = buildOgImageUrl({ title: pageTitle, eyebrow: "Monthly fee audit checklist" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  alternates: { canonical: slug },
  keywords: [
    "Stripe fee audit checklist",
    "Stripe effective fee rate",
    "Stripe Balance CSV",
    "monthly Stripe fee monitoring",
    "Stripe refund fees",
    "Stripe international card fees",
    "Stripe fees for SaaS",
    "Stripe blended rate",
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl(slug),
    type: "article",
    images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

type ChecklistItem = {
  title: string;
  why: string;
  check: string;
  action: string;
};

const CHECKLIST: ChecklistItem[] = [
  {
    title: "Separate processing rate from all-in Stripe cost",
    why: "The card processing rate answers one question; the all-in rate answers another. Mixing them together is how people get confused by payouts, refunds, disputes, Billing, Tax, and other fee rows.",
    check:
      "Start with charge fees divided by charge volume. Then calculate all Stripe fees divided by charge volume as a separate number.",
    action:
      "If the gap between processing rate and all-in rate is large, inspect non-charge fee rows before blaming card pricing.",
  },
  {
    title: "Compare this month against the previous month",
    why: "A single blended rate tells you where you are. Month-over-month comparison tells you what changed.",
    check:
      "Write down charge volume, charge fees, processing rate, refund count, and international share for each month.",
    action:
      "A jump above 0.5 percentage points usually deserves a closer look, especially if volume did not change much.",
  },
  {
    title: "Look for small transactions where $0.30 dominates",
    why: "The fixed fee is quiet on high-ticket invoices and brutal on $5-$20 plans. This is one of the fastest ways SaaS margins drift.",
    check:
      "Group charges into buckets: under $20, $20-$50, $50-$100, and $100+. Compare fee rate by bucket.",
    action:
      "Consider annual billing, bundling small add-ons, or a minimum charge where it fits the product.",
  },
  {
    title: "Check international card exposure",
    why: "International cards can add cross-border fees on top of the base card rate. A launch, affiliate post, or global audience spike can change your mix quickly.",
    check:
      "Count international-looking charges and compare their volume share against domestic charges.",
    action:
      "If a region is meaningful, test local payment methods such as SEPA Direct Debit, iDEAL, or other local rails available in Stripe.",
  },
  {
    title: "Measure refund fee leakage",
    why: "Refunds are not free. Stripe generally keeps the original processing fee, so a refund-heavy month can raise your real payment cost even when gross revenue looks fine.",
    check:
      "Filter refund rows and estimate retained fee impact for the same period.",
    action:
      "Tie refund spikes back to product changes, campaigns, cohorts, or expectation mismatch. The fee is usually a symptom.",
  },
  {
    title: "Audit large B2B invoices paid by card",
    why: "Card rails are convenient, but ACH or bank methods can be much cheaper for high-value invoices.",
    check:
      "List charges above $500 or $1,000 and calculate how much card fees cost on that segment.",
    action:
      "For invoices where the relationship allows it, offer ACH or bank transfer as the default payment method.",
  },
  {
    title: "Do not ignore disputes and chargebacks",
    why: "A few dispute fees can look small in isolation and still move your monthly rate if volume is modest.",
    check:
      "Filter for dispute or chargeback rows and separate explicit dispute fees from reversed principal.",
    action:
      "Review billing descriptor clarity, receipts, cancellation flow, and Radar settings before the pattern repeats.",
  },
  {
    title: "Reconcile three numbers before trusting any insight",
    why: "If charge volume, charge fees, and charge count do not match your Stripe export period, every downstream conclusion is suspect.",
    check:
      "Match charge volume, charge fees, and charge rows against the same date range in Stripe.",
    action:
      "Fix the export window or CSV type before optimizing. Use an itemized Balance export, not a summary download.",
  },
];

const MONTHLY_TEMPLATE = [
  ["Charge volume", "$42,000", "Did volume change enough to explain the fee change?"],
  ["Charge fees", "$1,596", "Processing fees on charge rows only."],
  ["Processing rate", "3.80%", "Charge fees / charge volume."],
  ["All-in rate", "4.05%", "All Stripe fee rows / charge volume."],
  ["Refunds", "$2,400", "Possible retained fee drag."],
  ["International share", "31%", "Often the first driver to inspect."],
];

const RELATED = [
  { href: PILLAR_EFFECTIVE_RATE_PATH, title: "Why Are My Stripe Fees Higher Than 2.9%?" },
  { href: "/blog/why-stripe-effective-rate-jumped-this-month", title: "Why Did My Stripe Effective Rate Jump This Month?" },
  { href: "/blog/how-to-export-stripe-balance-csv", title: "How to Export a Stripe Balance CSV" },
  { href: "/blog/stripe-international-card-fees", title: "Stripe International Card Fees Explained" },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: pageTitle,
  description: pageDescription,
  datePublished: "2026-05-25",
  dateModified: "2026-05-25",
  mainEntityOfPage: absoluteUrl(slug),
  author: {
    "@type": "Organization",
    name: "Fee Auditor",
    url: absoluteUrl("/"),
  },
  publisher: {
    "@type": "Organization",
    name: "Fee Auditor",
    url: absoluteUrl("/"),
  },
  keywords:
    "Stripe fee audit checklist, Stripe effective fee rate, Stripe Balance CSV, monthly Stripe fee monitoring, Stripe fees for SaaS",
  about: [
    { "@type": "Thing", name: "Stripe fees" },
    { "@type": "Thing", name: "SaaS payments" },
    { "@type": "Thing", name: "Payment processing" },
  ],
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <article className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          ← Blog
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span>8 min read</span>
          <span>Updated May 2026</span>
          <span>Checklist</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Stripe Fee Audit Checklist for SaaS Founders
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          I do not think most founders need a full finance dashboard on day one. But if Stripe is a
          meaningful part of your revenue, you should know one thing every month: did your real fee
          rate get better or worse, and why?
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-relaxed text-blue-800">
          <strong>Short version:</strong> export an itemized Stripe Balance CSV, calculate your
          effective fee rate, compare it to last month, then inspect international cards, small
          charges, refunds, disputes, and non-charge fee lines. The goal is not perfect accounting.
          The goal is catching margin leaks before they become normal.
        </div>

        <div className="mt-10 space-y-6 text-gray-700 leading-relaxed">
          <p>
            Stripe's dashboard is good at showing gross volume. It is less direct when you want a
            plain-English answer to "why did my fees move this month?" That is where a small monthly
            audit helps. It turns one export into a habit: check the rate, find the driver, decide
            whether action is worth it.
          </p>

          <p>
            This checklist is written for SaaS founders, indie hackers, agencies, and subscription
            businesses using Stripe. It is not tax advice, and it will not replace your accountant.
            It is the practical review I would run before assuming the headline 2.9% + $0.30 rate is
            the whole story.
          </p>
        </div>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-bold text-gray-900">The monthly scorecard</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Start with the same six numbers every month. They are simple enough to track in a
            spreadsheet, and strong enough to explain most Stripe fee changes.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="grid grid-cols-[1fr_110px_1.4fr] gap-0 border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span>Metric</span>
              <span>Example</span>
              <span>Why it matters</span>
            </div>
            {MONTHLY_TEMPLATE.map(([metric, example, note]) => (
              <div
                key={metric}
                className="grid grid-cols-[1fr_110px_1.4fr] gap-0 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0"
              >
                <span className="font-medium text-gray-900">{metric}</span>
                <span className="font-mono text-gray-700">{example}</span>
                <span className="text-gray-500">{note}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">The checklist</h2>
          <div className="mt-6 space-y-5">
            {CHECKLIST.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.why}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          What to check
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.check}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          Next action
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-5 text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900">What I would not over-optimize yet</h2>
          <p>
            It is tempting to turn every fee row into a project. I would avoid that early. If your
            Stripe volume is still tiny, the first audit may be enough. If your customers are mostly
            domestic and high-ticket, a 3.1%-3.4% rate might be boringly normal.
          </p>
          <p>
            The useful threshold is usually repetition. If the same driver shows up two months in a
            row - international cards, refund leakage, low-ticket plans, or B2B invoices paid by
            card - then it becomes worth changing pricing, payment methods, or checkout defaults.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-amber-100 bg-amber-50/40 px-5 py-5">
          <h2 className="text-xl font-bold text-gray-900">A simple monthly workflow</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
            <li>
              <strong>1. Export:</strong> Stripe Dashboard → Reports → Balance summary → Export →
              Itemized.
            </li>
            <li>
              <strong>2. Reconcile:</strong> match charge volume, charge fees, and charge count
              before trusting any insight.
            </li>
            <li>
              <strong>3. Compare:</strong> write down this month's processing rate and all-in rate
              next to last month.
            </li>
            <li>
              <strong>4. Diagnose:</strong> inspect the largest movement: international share,
              small-charge share, refund count, dispute fees, or non-charge fees.
            </li>
            <li>
              <strong>5. Act once:</strong> pick one change, then check next month whether the rate
              actually improved.
            </li>
          </ol>
        </section>

        <BlogArticleCta
          title="Run the checklist on your own Stripe export"
          body="Upload an itemized Stripe Balance CSV to see your processing rate, all-in rate, monthly trend, top fee drivers, refund impact, and savings opportunities. No OAuth connection required."
          utmCampaign="stripe-fee-audit-checklist"
        />

        <section className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Validating next
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            Monthly Stripe fee monitoring without OAuth
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-blue-900/80">
            Fee Auditor is a one-time CSV audit today. Fee Monitor is the next step: private report
            history, month-over-month comparisons, and reminders without permanent Stripe OAuth
            access.
          </p>
          <Link
            href="/monitor?utm_source=blog&utm_medium=cta&utm_campaign=stripe_fee_audit_checklist_monitor"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Join the Fee Monitor waitlist →
          </Link>
        </section>

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
          <ul className="mt-4 space-y-3 list-none p-0">
            {RELATED.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block text-sm text-blue-600 hover:underline">
                  {link.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
