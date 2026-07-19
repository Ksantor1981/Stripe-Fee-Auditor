/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogArticleCta } from "@/components/BlogArticleCta";
import { BlogBreadcrumbs } from "@/components/BlogBreadcrumbs";
import { BlogFaqSection, BlogJsonLd, BlogSourcesSection } from "@/components/BlogSeoBlocks";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const slug = "/blog/how-i-found-1400-in-hidden-stripe-fees";
const title = "How I Found ~$1,400/Year in Hidden Stripe Fee Opportunities";
const description =
  "A real Stripe Balance CSV case study: $3,597.77 in fees over four months, a 3.82% processing rate, a 4.02% all-in Stripe cost, and the fee drivers worth checking.";
const published = "2026-06-25";
const ogImage = buildOgImageUrl({ title: "How I found ~$1,400/year in Stripe fee opportunities", eyebrow: "Stripe fee case study" });

export const metadata: Metadata = {
  title: `${title} | Fee Auditor`,
  description,
  alternates: { canonical: slug },
  keywords: [
    "Stripe fee case study",
    "hidden Stripe fees",
    "Stripe effective rate",
    "Stripe all-in cost",
    "Stripe fee audit",
    "Stripe Balance CSV",
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

const SUMMARY = [
  { label: "Charge volume", value: "$89,490.00" },
  { label: "Charge fees", value: "$3,417.77" },
  { label: "All-in fees", value: "$3,597.77" },
  { label: "High-fee charges", value: "447" },
];

const RATE_ROWS = [
  {
    metric: "Card processing rate",
    value: "3.82%",
    meaning: "Charge fees divided by processed charge volume.",
  },
  {
    metric: "All-in Stripe cost",
    value: "4.02%",
    meaning: "All Stripe fee lines divided by processed charge volume.",
  },
  {
    metric: "Annualized fees",
    value: "$10,793.31",
    meaning: "The four-month all-in fee total projected over twelve months.",
  },
  {
    metric: "Savings teaser",
    value: "up to ~$1,400/yr",
    meaning: "Directional opportunity, not a guaranteed reduction.",
  },
];

const DRIVERS = [
  {
    title: "International cards",
    body: "The first visible reason was international card exposure. Stripe's base card rate is only the starting point; cross-border fees can stack on top.",
  },
  {
    title: "Small recurring charges",
    body: "The fixed $0.30 fee matters much more on $5-$20 SaaS charges than on larger invoices. Low-ticket plans can make the effective rate look much worse.",
  },
  {
    title: "Other fee lines",
    body: "The all-in cost was higher than the card processing rate because Stripe fees outside normal charge rows still affect margin.",
  },
  {
    title: "Monthly drift",
    body: "The useful part was not just one percentage. The month-by-month view made it easier to spot whether the rate was stable or getting worse.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Is the ~$1,400/year number guaranteed savings?",
    answer:
      "No. It is a directional savings opportunity from the sample export. The real next step is to inspect which rows created the high fees, then decide whether ACH, local payment methods, annual billing, or pricing changes are realistic.",
  },
  {
    question: "Why are there two rates: 3.82% and 4.02%?",
    answer:
      "The 3.82% processing rate uses charge processing fees divided by charge volume. The 4.02% all-in Stripe cost includes other Stripe fee lines too. Keeping those separate avoids blaming card pricing for every fee.",
  },
  {
    question: "Can I find this manually in Stripe?",
    answer:
      "Yes. Export an itemized Balance CSV, filter charge rows, sum charge volume and charge fees, then compare that with all other fee rows in the period. Fee Auditor automates the grouping, timeline, high-fee rows, and savings prompts.",
  },
];

const SOURCES = [
  { href: "https://stripe.com/pricing", title: "Stripe pricing" },
  { href: "https://docs.stripe.com/reports", title: "Stripe reports documentation" },
  { href: "https://docs.stripe.com/reports/balance-transaction-types", title: "Stripe balance transaction types" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <BlogJsonLd title={title} description={description} path={slug} published={published} faqs={FAQ_ITEMS} />

      <article className="mx-auto max-w-2xl px-4 py-16">
        <BlogBreadcrumbs title={title} path={slug} />

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span>6 min read</span>
          <span>Updated June 2026</span>
          <span>Case study</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          How I Found ~$1,400/Year in Hidden Stripe Fee Opportunities
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          I used to think about Stripe fees as roughly 2.9% + $0.30. Then I looked at an
          itemized Balance CSV and measured the real rate from actual rows. The result was not
          dramatic in a fake "Stripe is evil" way. It was more useful than that: a 3.82% card
          processing rate, a 4.02% all-in Stripe cost, and a clear set of fee drivers to inspect.
        </p>

        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            4-month export
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            $3,597.77 in Stripe fees over four months
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-blue-900/80">
            Annualized, that is $10,793.31/year at the same run rate. The report also flagged
            447 high-fee charges and a directional savings opportunity of up to roughly $1,400/year.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {SUMMARY.map((item) => (
              <div key={item.label} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">The important distinction</h2>
            <p>
              The report separates card processing rate from all-in Stripe cost. That matters because
              not every Stripe fee is a normal card processing fee. If you mix every fee line into one
              number, you can end up chasing the wrong problem.
            </p>

            <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white text-sm">
              <div className="hidden bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid sm:grid-cols-[1fr_100px_1.4fr]">
                <span>Metric</span>
                <span>Value</span>
                <span>What it means</span>
              </div>
              {RATE_ROWS.map((row) => (
                <div
                  key={row.metric}
                  className="grid gap-1 border-t border-gray-100 px-4 py-3 sm:grid-cols-[1fr_100px_1.4fr] sm:gap-0"
                >
                  <span className="font-medium text-gray-900">{row.metric}</span>
                  <span className="font-mono font-semibold text-gray-900">{row.value}</span>
                  <span className="text-gray-500">{row.meaning}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">What pushed the rate up?</h2>
            <div className="space-y-4">
              {DRIVERS.map((driver) => (
                <div key={driver.title} className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <h3 className="font-semibold text-gray-900">{driver.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{driver.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Why this is better than a calculator</h2>
            <p>
              A Stripe fee calculator estimates what should happen. A Balance CSV shows what actually
              happened. The calculator cannot see whether this month had more international cards,
              more refunds, smaller charges, or extra fee lines. Your export can.
            </p>
            <p className="mt-3">
              That is why the most useful question is not "does Stripe charge 2.9%?" It is "what did
              Stripe charge on my actual mix, and which segment should I look at first?"
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">How to check your own account</h2>
            <ol className="space-y-3">
              {[
                "Go to Stripe Dashboard, then Reports, then Balance summary.",
                "Export an itemized Balance CSV for the period you want to inspect.",
                "Calculate charge fees divided by charge volume.",
                "Then compare that with all Stripe fee lines divided by charge volume.",
                "Inspect high-fee charges by amount, geography, refunds, and transaction type.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <BlogArticleCta
          title="Check whether your Stripe fees hide the same pattern"
          body="Upload an itemized Stripe Balance CSV to see processing rate, all-in cost, high-fee charges, monthly drift, and savings opportunities. No OAuth connection required."
          utmCampaign="stripe_fee_case_study_1400"
        />

        <BlogFaqSection items={FAQ_ITEMS} />
        <BlogSourcesSection items={SOURCES} />

        <section className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-700">Related guides</h2>
          <ul className="mt-4 space-y-3">
            {[
              { href: "/stripe-balance-csv", title: "How to Export Stripe Balance CSV and Check Your Real Fee Rate" },
              { href: "/blog/stripe-international-card-fees", title: "Stripe International Card Fees Explained" },
              { href: "/blog/stripe-fees-small-transactions", title: "Stripe Fees for Small Transactions" },
              { href: "/blog/stripe-blended-rate-calculator", title: "Stripe Blended Rate Calculator: Your True Fee Rate" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-blue-600 hover:underline">
                  {link.title} -&gt;
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
