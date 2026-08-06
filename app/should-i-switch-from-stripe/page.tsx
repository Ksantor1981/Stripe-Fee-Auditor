/* eslint-disable react/no-unescaped-entities -- long-form SEO copy */
import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrackedLink } from "@/components/TrackedLink";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const pageTitle = "Should I Switch From Stripe? Audit Fees First";
const pageDescription =
  "Before switching from Stripe, audit your real fee driver: international cards, small charges, refunds, ACH opportunities, checkout conversion, or tax operations.";
const pagePath = "/should-i-switch-from-stripe";
const updatedAt = "2026-07-13";
const ogImage = buildOgImageUrl({ title: "Should I switch from Stripe?", eyebrow: "Payment decision guide" });

export const metadata: Metadata = {
  title: `${pageTitle} | Fee Auditor`,
  description: pageDescription,
  keywords: [
    "should I switch from Stripe",
    "Stripe alternatives",
    "Stripe fees too high",
    "reduce Stripe fees",
    "Stripe payment processor comparison",
  ],
  alternates: { canonical: pagePath },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: absoluteUrl(pagePath),
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [ogImage],
  },
};

const DECISION_ROWS = [
  {
    symptom: "Your rate is high because many cards are international",
    inspect: "International card share, country mix, currency conversion, local payment method fit",
    firstMove: "Test local payment methods or local-currency pricing before changing processors",
    compare: "GoCardless, local bank debit, PayPal wallet, Stripe local methods",
  },
  {
    symptom: "Small subscriptions make your rate look extreme",
    inspect: "Average charge size, number of sub-$20 charges, fixed-fee drag",
    firstMove: "Bundle usage, move tiny monthly plans to annual, or set a minimum charge",
    compare: "A processor switch rarely fixes fixed-fee economics by itself",
  },
  {
    symptom: "Large B2B invoices are paid by card",
    inspect: "Card-funded invoices above $500, annual-plan charges, buyer type",
    firstMove: "Offer ACH or bank debit for large invoices while keeping card fallback",
    compare: "Stripe ACH, GoCardless, bank transfer workflows",
  },
  {
    symptom: "Refunds are leaking margin",
    inspect: "Refund count, retained processing fees, refund reasons, plan renewals",
    firstMove: "Fix trial gates, billing copy, cancellation UX, and annual-plan expectations",
    compare: "Do not switch until refund causes are understood",
  },
  {
    symptom: "Tax and compliance are the real pain",
    inspect: "VAT/GST/sales tax ops, invoices, country coverage, support burden",
    firstMove: "Compare merchant-of-record value, not only processing rate",
    compare: "Paddle, Lemon Squeezy, MoR platforms",
  },
  {
    symptom: "In-person payments matter",
    inspect: "POS workflow, card reader needs, staff workflow, local-service operations",
    firstMove: "Compare operational fit, not only online card fees",
    compare: "Square, Stripe Terminal, POS-first tools",
  },
];

const COMPARISON_LINKS = [
  {
    href: "/stripe-vs-gocardless",
    title: "Stripe vs GoCardless",
    desc: "Cards vs bank debit for recurring and B2B payments.",
  },
  {
    href: "/stripe-vs-square-fees",
    title: "Stripe vs Square",
    desc: "Online SaaS checkout vs POS and local-business workflows.",
  },
  {
    href: "/stripe-vs-paddle-fees",
    title: "Stripe vs Paddle",
    desc: "Payment processor vs merchant-of-record operations.",
  },
  {
    href: "/compare-stripe-paypal-wise",
    title: "Stripe vs PayPal vs Wise",
    desc: "Checkout, wallet preference, and money movement use cases.",
  },
];

const CHECKLIST = [
  "Export 3-6 months of itemized Stripe Balance data.",
  "Separate processing rate from all-in Stripe cost.",
  "Identify the top driver: international cards, fixed fees, refunds, disputes, add-ons, or large invoices.",
  "Try the cheapest operational fix first: ACH, local payment methods, annual billing, better refund flow, or pricing changes.",
  "Only compare providers against the specific driver you found.",
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    headline: pageTitle,
    description: pageDescription,
    datePublished: updatedAt,
    dateModified: updatedAt,
    author: { "@type": "Person", name: "Konstantin Starkov" },
    publisher: { "@type": "Organization", name: "Stripe Fee Auditor", url: absoluteUrl("/") },
    mainEntityOfPage: absoluteUrl(pagePath),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Should I switch away from Stripe to reduce fees?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not before auditing the actual fee driver. Many Stripe fee issues are caused by card mix, small charges, refunds, disputes, or payment method selection rather than Stripe itself.",
        },
      },
      {
        "@type": "Question",
        name: "What should I do before comparing Stripe alternatives?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Export your itemized Stripe Balance CSV, calculate processing and all-in rates, identify the top fee driver, then compare alternatives only against that driver.",
        },
      },
    ],
  },
];

export default function ShouldISwitchFromStripePage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-5xl px-4 py-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: pageTitle }]} className="mb-8" />

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Payment decision guide
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              Should you switch from Stripe? Audit the fee driver first.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
              If Stripe feels expensive, the answer is not always "move processors." Your best fix
              may be ACH, annual billing, local payment methods, refund cleanup, or a merchant-of-record
              platform for tax operations.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href="/analyze"
                utm={{ source: "switch_guide", medium: "cta", campaign: "should_switch_hero" }}
                funnelEvent="funnel_landing_cta"
                funnelProps={{ placement: "should_switch_hero" }}
                className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Audit my actual Stripe CSV
              </TrackedLink>
              <Link
                href="/blog/stripe-alternatives-2026"
                className="inline-flex justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Read alternatives guide
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
              The rule of thumb
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Switch only after you know why the rate is high.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              A 4%+ all-in Stripe cost can mean several different things. The right next step depends
              on whether the driver is payment method, geography, refunds, disputes, add-ons, or checkout strategy.
            </p>
          </div>
        </section>

        <section className="mt-14" aria-labelledby="decision-heading">
          <h2 id="decision-heading" className="text-2xl font-bold text-gray-900">
            Decision guide: symptom to first move
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 text-sm">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-gray-50 font-semibold text-gray-700">
                <div className="px-4 py-3">If you see this</div>
                <div className="border-l border-gray-200 px-4 py-3">Inspect</div>
                <div className="border-l border-gray-200 px-4 py-3">First move</div>
                <div className="border-l border-gray-200 px-4 py-3">Compare</div>
              </div>
              {DECISION_ROWS.map((row) => (
                <div key={row.symptom} className="grid grid-cols-[1fr_1fr_1fr_1fr] border-t border-gray-100">
                  <div className="px-4 py-4 font-medium leading-relaxed text-gray-900">{row.symptom}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.inspect}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.firstMove}</div>
                  <div className="border-l border-gray-100 px-4 py-4 leading-relaxed text-gray-600">{row.compare}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" aria-labelledby="checklist-heading">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Pre-switch checklist
            </p>
            <h2 id="checklist-heading" className="mt-2 text-2xl font-bold text-gray-900">
              A processor switch is the last step, not the first.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              You can often get most of the benefit with a smaller change: payment method, plan
              structure, refund flow, or local checkout option.
            </p>
          </div>
          <ol className="space-y-3">
            {CHECKLIST.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-gray-700">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14" aria-labelledby="compare-heading">
          <h2 id="compare-heading" className="text-2xl font-bold text-gray-900">
            Compare the right alternative for the problem
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {COMPARISON_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow"
              >
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
                <p className="mt-3 text-sm font-semibold text-blue-600">Read comparison -&gt;</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            Measure before moving
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Your Stripe CSV tells you which alternative is worth testing.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            Fee Auditor turns the Balance CSV into processing rate, all-in rate, high-fee charges,
            refund impact, and savings opportunities. Start there before rebuilding checkout.
          </p>
          <TrackedLink
            href="/analyze"
            utm={{ source: "switch_guide", medium: "cta", campaign: "should_switch_bottom" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "should_switch_bottom" }}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Analyze my Stripe CSV
          </TrackedLink>
        </section>
      </div>
    </MarketingShell>
  );
}
