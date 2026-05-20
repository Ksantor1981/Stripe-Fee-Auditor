/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const slug = "/blog/stripe-fee-leakage-report-may-2026";
const title = "Stripe Fee Leakage Report: Who Is Safe and Who Is Bleeding Margin?";
const description =
  "A May 2026 diagnostic model for Stripe fee leakage: compare safe SaaS payment profiles with the low-ticket, global, refund-heavy profiles that should audit fees now.";
const ogImage = buildOgImageUrl({ title, eyebrow: "May 2026 fee leakage report" });

export const metadata: Metadata = {
  title: "Stripe Fee Leakage Report May 2026 | Fee Auditor",
  description,
  alternates: { canonical: slug },
  keywords: [
    "Stripe fee leakage",
    "Stripe effective rate",
    "Stripe fee benchmark",
    "Stripe hidden fees",
    "Stripe international card fees",
    "Stripe currency conversion fees",
    "SaaS payment margins",
  ],
  openGraph: {
    title,
    description,
    url: absoluteUrl(slug),
    type: "article",
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

type Zone = "Safe" | "Watch" | "Audit now";

type Profile = {
  name: string;
  zone: Zone;
  range: string;
  bar: number;
  reason: string;
};

const PROFILE_RANGES: Profile[] = [
  {
    name: "High-ticket domestic B2B SaaS",
    zone: "Safe",
    range: "2.9-3.3%",
    bar: 36,
    reason: "Large invoices dilute the fixed fee, and domestic cards avoid cross-border markups.",
  },
  {
    name: "Annual-only subscriptions",
    zone: "Safe",
    range: "3.0-3.6%",
    bar: 42,
    reason: "One yearly charge replaces twelve monthly fixed fees.",
  },
  {
    name: "Local-market ecommerce with local rails",
    zone: "Safe",
    range: "1.0-3.5%",
    bar: 40,
    reason: "Bank rails and local methods can avoid card-heavy cross-border stacks.",
  },
  {
    name: "Mixed domestic + international SaaS",
    zone: "Watch",
    range: "3.4-5.2%",
    bar: 61,
    reason: "International cards and some conversion start lifting the blended rate.",
  },
  {
    name: "$5-$15 monthly plans",
    zone: "Audit now",
    range: "5.0-9.0%+",
    bar: 92,
    reason: "The $0.30 fixed fee can consume 2-6% before the percentage fee starts.",
  },
  {
    name: "Global SaaS priced in one currency",
    zone: "Audit now",
    range: "4.2-7.0%+",
    bar: 80,
    reason: "Cross-border and FX can stack on top of the base processing fee.",
  },
];

const MICRO_BILLING = [
  { amount: "$5", fixed: "6.0%", total: "8.9%", bar: 89 },
  { amount: "$10", fixed: "3.0%", total: "5.9%", bar: 59 },
  { amount: "$20", fixed: "1.5%", total: "4.4%", bar: 44 },
  { amount: "$50", fixed: "0.6%", total: "3.5%", bar: 35 },
  { amount: "$150", fixed: "0.2%", total: "3.1%", bar: 31 },
];

const STACKED_FEES = [
  { scenario: "Domestic card", fee: "$3.20", rate: "3.2%", bar: 56 },
  { scenario: "International card", fee: "$4.70", rate: "4.7%", bar: 82 },
  { scenario: "International + FX", fee: "$5.70", rate: "5.7%", bar: 100 },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  datePublished: "2026-05-18",
  dateModified: "2026-05-18",
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
    "Stripe fee leakage, Stripe effective rate, Stripe fee benchmark, Stripe hidden fees, SaaS payment margins",
  about: [
    { "@type": "Thing", name: "Stripe fees" },
    { "@type": "Thing", name: "SaaS margins" },
    { "@type": "Thing", name: "Payment processing" },
  ],
};

function ZoneBadge({ zone }: { zone: Zone }) {
  const cls =
    zone === "Safe"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : zone === "Watch"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-red-50 text-red-700 border-red-100";

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>{zone}</span>;
}

function Bar({ value, tone = "blue" }: { value: number; tone?: "blue" | "red" | "gray" }) {
  const cls = tone === "red" ? "bg-red-500" : tone === "gray" ? "bg-gray-700" : "bg-blue-600";
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${cls}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/blog" className="text-sm text-blue-600 hover:underline">
          ← Blog
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span>9 min read</span>
          <span>Updated May 2026</span>
          <span>Diagnostic model</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          Stripe Fee Leakage Report: Who Is Safe and Who Is Bleeding Margin?
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Stripe's 2.9% + $0.30 headline rate is still a useful starting point, but it is not a
          margin model. Once fixed fees, international cards, currency conversion, refunds, and
          billing add-ons enter the mix, two companies with the same revenue can have very different
          effective rates.
        </p>

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-relaxed text-blue-800">
          <strong>Important:</strong> This is a diagnostic benchmark, not a claim that Fee Auditor has
          surveyed every Stripe account. The ranges below are modeled from Stripe's published fee
          structure, common SaaS payment mixes, and the patterns founders ask about most: effective
          rate, international cards, FX conversion, refunds, and small-ticket subscriptions.
          <BlogBetaRetentionNote />
        </div>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">The short version</h2>
            <p>
              If you sell high-ticket subscriptions to mostly domestic customers, Stripe fees are
              usually boring. If you sell low-priced monthly plans to a global audience, your real
              payment cost can quietly become a meaningful margin leak.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Safe", value: "High ticket + domestic", cls: "border-emerald-100 bg-emerald-50 text-emerald-800" },
                { label: "Watch", value: "Mixed geography", cls: "border-amber-100 bg-amber-50 text-amber-800" },
                { label: "Audit now", value: "$5-$15 global plans", cls: "border-red-100 bg-red-50 text-red-800" },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl border px-4 py-3 ${item.cls}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide">{item.label}</p>
                  <p className="mt-1 text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Fee leakage by business profile</h2>
            <p>
              The right benchmark depends on your customer mix. A 4.5% effective rate can be alarming
              for a domestic B2B SaaS company and completely unsurprising for a global, low-ticket
              subscription app.
            </p>
            <div className="mt-5 space-y-3">
              {PROFILE_RANGES.map((profile) => (
                <div key={profile.name} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{profile.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{profile.reason}</p>
                    </div>
                    <ZoneBadge zone={profile.zone} />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <Bar value={profile.bar} tone={profile.zone === "Audit now" ? "red" : "blue"} />
                    </div>
                    <span className="w-24 shrink-0 text-right font-mono text-sm font-semibold text-gray-900">
                      {profile.range}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Why small monthly plans leak first</h2>
            <p>
              The fixed $0.30 fee is harmless on a $150 invoice and brutal on a $5 subscription. This
              is why founders often discover the problem only after adding a low-tier plan or running
              a discount-heavy launch.
            </p>
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-5">
              <p className="mb-4 text-sm font-semibold text-gray-700">
                Effective cost of 2.9% + $0.30 by charge size
              </p>
              <div className="space-y-4">
                {MICRO_BILLING.map((row) => (
                  <div key={row.amount} className="grid grid-cols-[52px_1fr_88px] items-center gap-3 text-sm">
                    <span className="font-mono font-semibold text-gray-900">{row.amount}</span>
                    <Bar value={row.bar} tone={row.bar >= 55 ? "red" : "gray"} />
                    <span className="text-right font-mono text-gray-700">{row.total}</span>
                    <span className="col-start-2 text-xs text-gray-500">
                      fixed fee alone: {row.fixed}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">The cross-border stack</h2>
            <p>
              Stripe lists the domestic online card rate, then separate add-ons for international
              cards and currency conversion. On a $100 charge, that stack changes the story quickly.
              Always verify the current pricing for your country and plan, especially if you have
              custom pricing.
            </p>
            <div className="mt-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-gray-700">
                Approximate fee on a $100 card payment under common US-listed rates
              </p>
              <div className="space-y-4">
                {STACKED_FEES.map((row) => (
                  <div key={row.scenario} className="grid grid-cols-[130px_1fr_96px] items-center gap-3 text-sm">
                    <span className="text-gray-600">{row.scenario}</span>
                    <Bar value={row.bar} tone={row.bar > 90 ? "red" : "blue"} />
                    <span className="text-right font-mono font-semibold text-gray-900">
                      {row.fee} ({row.rate})
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Source logic: domestic card baseline plus international card and currency conversion
                add-ons where applicable. Stripe pricing varies by country and may differ under custom
                agreements.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">The safe zone</h2>
            <div className="space-y-4">
              {[
                {
                  title: "High-ticket domestic B2B SaaS",
                  body: "If most customers are in your home market and the average charge is above about $150, the fixed fee barely matters and cross-border fees rarely appear.",
                },
                {
                  title: "Annual-only subscription models",
                  body: "Twelve monthly fixed fees become one yearly fixed fee. Even when the percentage fee is unchanged, the fixed-fee drag drops sharply.",
                },
                {
                  title: "Local rails instead of international cards",
                  body: "ACH, SEPA, iDEAL, Bancontact, and similar methods can be cheaper than card rails for the right market and transaction size.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-5 py-4">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">The bleeding zone</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Low-tier plans and micro-billing",
                  body: "A $5 monthly plan starts near 8.9% before international cards, conversion, refunds, or billing add-ons. That can change unit economics fast.",
                },
                {
                  title: "Global founders selling in one default currency",
                  body: "A single USD price for customers in many countries is simple, but international card and FX costs often concentrate in exactly this profile.",
                },
                {
                  title: "Refund-heavy businesses",
                  body: "Refunds do not restore the original processing fee. If refund volume rises, your net fee burden rises even if gross revenue looks healthy.",
                },
                {
                  title: "Card-heavy B2B invoices",
                  body: "For larger invoices, ACH or bank rails can be materially cheaper than cards. If customers pay $1,000 invoices by card, audit that segment separately.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-red-100 bg-red-50/30 px-5 py-4">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">How to read your own report</h2>
            <p>
              Do not stop at one blended number. The blended rate tells you there is a problem; the
              segment view tells you what to do next.
            </p>
            <ol className="mt-4 space-y-3 list-none">
              {[
                "Compare your blended rate to the expected range for your business model.",
                "Check whether unusual charges are mostly small invoices, international cards, FX, refunds, or one-off outliers.",
                "Look month by month. A spike after a launch or campaign usually points to customer mix, not a mysterious Stripe change.",
                "Test one action: annual pricing, ACH for B2B, local payment methods, or a pricing nudge on low-tier plans.",
              ].map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Methodology and limits</h2>
            <p>
              This report is intentionally conservative. It uses public fee components, simple SaaS
              payment profiles, and common account patterns. It does not know your custom Stripe
              pricing, your exact card country mix, your negotiated Billing plan, or your local tax
              setup.
            </p>
            <p className="mt-3">
              That is why the best next step is not arguing about the benchmark. It is exporting your
              own Balance CSV and calculating the real effective rate from your actual rows.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Reference: <a href="https://stripe.com/pricing" className="text-blue-600 underline" rel="nofollow noopener noreferrer" target="_blank">Stripe's public pricing page</a> lists the domestic card baseline plus additional
              charges such as international card and currency conversion add-ons. Always confirm the
              live rate for your account country and pricing agreement.
            </p>
          </section>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 px-5 py-6">
          <p className="font-semibold text-gray-900">Audit your own Stripe fee leakage</p>
          <p className="mt-1 text-sm text-gray-600">
            Upload your Stripe Balance CSV and Fee Auditor will calculate your effective rate, fee
            drivers, refund impact, month-by-month trend, and unusual charges. No OAuth connection is
            required, and raw CSV files are not stored.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analyze"
              className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Analyze My Fees
            </Link>
            <Link
              href="/analyze?sample=1"
              className="inline-block rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Try sample report →
            </Link>
          </div>
          <BlogBetaRetentionNote tone="gray" />
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <p className="mb-4 text-sm font-semibold text-gray-700">Related articles</p>
          <div className="space-y-3">
            {[
              { href: "/blog/stripe-blended-rate-calculator", title: "Stripe Blended Rate Calculator: Your True Fee Rate" },
              { href: "/blog/stripe-international-card-fees", title: "Stripe International Card Fees Explained" },
              { href: "/blog/stripe-fees-small-transactions", title: "Stripe Fees for Small Transactions" },
              { href: "/blog/how-to-export-stripe-balance-csv", title: "How to Export Your Stripe Balance CSV" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-blue-600 hover:underline">
                {link.title} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
