/* eslint-disable react/no-unescaped-entities -- long-form editorial copy */
import type { Metadata } from "next";
import Link from "next/link";
import { BlogBetaRetentionNote } from "@/components/BlogBetaRetentionNote";
import { BlogBreadcrumbs } from "@/components/BlogBreadcrumbs";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { buildOgImageUrl } from "@/lib/seo-og";
import { blogArticleBreadcrumbs } from "@/lib/breadcrumb-schema";
import { absoluteUrl } from "@/lib/site-url";

const slug = "/blog/cross-border-stripe-fees-migration-2026";
const shortTitle = "Cross-Border Stripe Fees & Migration 2026";
const title = "Cross-Border Stripe Fees: Why Your Rate Rises";
const description =
  "How international customers, migration trends, and currency mix can push Stripe fees above 2.9% in 2026, plus how to spot the change in your Balance CSV.";
const published = "2026-06-22";
const ogImage = buildOgImageUrl({ title: shortTitle, eyebrow: "June 2026 briefing" });

export const metadata: Metadata = {
  title: `${title} | Fee Auditor`,
  description,
  alternates: { canonical: slug },
  keywords: [
    "Stripe cross-border fees 2026",
    "Stripe international card fee",
    "Stripe effective rate migration",
    "global SaaS payment fees",
    "digital nomad Stripe fees",
    "Stripe currency conversion fee",
    "Stripe fee rate increase 2026",
  ],
  openGraph: {
    title,
    description,
    url: absoluteUrl(slug),
    type: "article",
    publishedTime: published,
    modifiedTime: published,
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

type FeeScenario = {
  label: string;
  layers: string;
  rate: string;
  on100: string;
  bar: number;
};

const FEE_SCENARIOS: FeeScenario[] = [
  {
    label: "US card, USD charge, USD settlement",
    layers: "Base only",
    rate: "~3.2%",
    on100: "~$3.20",
    bar: 56,
  },
  {
    label: "International card, same currency",
    layers: "Base + 1.5% cross-border",
    rate: "~4.7%",
    on100: "~$4.70",
    bar: 82,
  },
  {
    label: "International card + FX conversion",
    layers: "Base + 1.5% + ~1% FX",
    rate: "~5.7%",
    on100: "~$5.70",
    bar: 100,
  },
  {
    label: "$10 micro-subscription (intl + FX)",
    layers: "Fixed $0.30 dominates",
    rate: "~8%+",
    on100: "N/A",
    bar: 95,
  },
];

const MIGRATION_SIGNALS = [
  {
    signal: "International card share rising month over month",
    watch: "Even +5 pp in international mix can lift blended rate 0.2–0.4 pp",
  },
  {
    signal: "New customer clusters in visa-friendly countries",
    watch: "Cards issued outside your Stripe account country trigger cross-border fees",
  },
  {
    signal: "More charges in non-settlement currencies",
    watch: "FX conversion (~1% on many US accounts) stacks on top of cross-border",
  },
  {
    signal: "Effective rate jumped without pricing or product changes",
    watch: "Geography shift is a common silent driver — check before blaming Stripe",
  },
];

const FAQ = [
  {
    q: "Did Stripe raise international fees in 2026?",
    a: "Stripe has not announced a broad reset of standard cross-border card pricing in 2026. What changed for many SaaS teams is customer geography: more international cards and FX-heavy charges, not necessarily a new headline rate.",
  },
  {
    q: "How much do cross-border Stripe fees add?",
    a: "On typical US online card pricing, international cards add about 1.5% on top of the base rate. If currency conversion applies, add roughly another 1%. On a $100 charge that can mean ~$5.70 total processing cost vs ~$3.20 domestic.",
  },
  {
    q: "Why does global migration affect my Stripe bill?",
    a: "Migration and remote work do not change Stripe's published rates directly. They change who pays you and from which country their card was issued. More cross-border payments usually mean a higher blended effective rate.",
  },
  {
    q: "How do I see if migration is affecting my fees?",
    a: "Export an itemized Stripe Balance CSV and compare international card share and effective rate month over month. Fee Auditor breaks this out from your export without OAuth.",
  },
];

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: title,
  description,
  datePublished: published,
  dateModified: published,
  mainEntityOfPage: absoluteUrl(slug),
  author: { "@type": "Organization", name: "Fee Auditor", url: absoluteUrl("/") },
  publisher: { "@type": "Organization", name: "Fee Auditor", url: absoluteUrl("/") },
  keywords:
    "Stripe cross-border fees, international card fees, global migration, SaaS payment margins, effective fee rate",
  about: [
    { "@type": "Thing", name: "Stripe payment processing" },
    { "@type": "Thing", name: "Cross-border payments" },
    { "@type": "Thing", name: "Global labor mobility" },
  ],
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function FeeBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function CrossBorderMigration2026Page() {
  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={ARTICLE_JSON_LD} />
      <JsonLd data={FAQ_JSON_LD} />
      <BreadcrumbJsonLd crumbs={blogArticleBreadcrumbs(shortTitle, slug)} />

      <article className="mx-auto max-w-2xl px-4 py-16">
        <BlogBreadcrumbs title={shortTitle} path={slug} />

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-blue-600">
          June 2026 · News briefing
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900">{title}</h1>
        <p className="mt-3 text-sm text-gray-500">
          10 min read · Published {published} · Stripe fees · Global SaaS
        </p>

        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          If your Stripe effective rate crept up in 2025–2026 while headline pricing stayed at{" "}
          <strong>2.9% + $0.30</strong>, you are not imagining it. One under-discussed driver: your
          customers are paying from more countries than they used to — and cross-border card fees stack
          fast.
        </p>

        <div className="mt-8 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <strong>TL;DR:</strong> UN and industry data show record global mobility and a mainstream
          remote-work cohort. For Stripe merchants, that often means more international cards (+~1.5%)
          and FX conversion (+~1%) — pushing real costs toward <strong>4.7–5.7%+</strong> on affected
          charges before fixed fees bite on small tickets.
        </div>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              What changed in the world (and why SaaS founders should care)
            </h2>
            <p>
              The UN&apos;s <em>World Migration Report 2026</em> puts international migrants at roughly{" "}
              <strong>304 million</strong> by mid-2024 — about 3.7% of the global population, with
              migrant workers and remittance flows still climbing. Cross-border movement is not a niche
              edge case anymore; it is structural.
            </p>
            <p className="mt-3">
              Parallel to that, remote work went mainstream. Industry surveys commonly cite{" "}
              <strong>tens of millions</strong> of digital nomads globally and roughly{" "}
              <strong>60 countries</strong> now offering remote-work or digital-nomad visa pathways —
              up from essentially zero in 2019. Exact counts vary by definition, but the direction is
              clear: more people live, work, and spend outside their home banking jurisdiction.
            </p>
            <p className="mt-3">
              For a SaaS or subscription business on Stripe, that macro trend shows up as micro data: a
              German employee paying from Portugal, a US founder billing in USD while customers spread
              across the EU and APAC, a PLG signup surge from countries you never marketed to. Stripe
              still charges you based on <em>card issuer geography</em> and{" "}
              <em>currency path</em> — not where your customer says they live on a form.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              The fee math: from 2.9% headline to 5%+ reality
            </h2>
            <p>
              Stripe&apos;s advertised US online card rate is a floor, not a ceiling. Cross-border layers
              are additive. Numbers below use typical US published pricing; your account country and
              contract may differ — always verify on{" "}
              <a
                href="https://stripe.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                stripe.com/pricing
              </a>
              .
            </p>

            <div className="mt-5 overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Scenario (US account, $100 charge)</th>
                    <th className="px-4 py-3">Fee stack</th>
                    <th className="px-4 py-3">Approx. rate</th>
                    <th className="px-4 py-3">Approx. cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {FEE_SCENARIOS.slice(0, 3).map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                      <td className="px-4 py-3 text-gray-600">{row.layers}</td>
                      <td className="px-4 py-3 font-semibold text-blue-700">{row.rate}</td>
                      <td className="px-4 py-3">{row.on100}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-4">
              {FEE_SCENARIOS.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-800">{row.label}</span>
                    <span className="shrink-0 font-semibold text-gray-900">{row.rate}</span>
                  </div>
                  <FeeBar value={row.bar} />
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              On low-ticket subscriptions, the fixed <strong>$0.30</strong> makes the pain worse: a $10
              international charge can land near <strong>6–9%</strong> effective rate even before other
              fee lines (Billing, Radar, disputes). See our{" "}
              <Link href="/blog/stripe-fees-small-transactions" className="text-blue-600 underline">
                small-transaction fee guide
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              Three 2026 patterns we see in Stripe CSV audits
            </h2>
            <ol className="list-decimal space-y-4 pl-5">
              <li>
                <strong>“We didn’t go global — global came to us.”</strong> Organic signups from new
                countries raise international card share without a formal expansion plan. Effective rate
                drifts up 0.3–0.8 pp over two quarters.
              </li>
              <li>
                <strong>Remote workers, local cards.</strong> A customer keeps a US subscription but
                pays with a card issued where they relocated. Cross-border fee applies even if billing
                address looks domestic.
              </li>
              <li>
                <strong>Single-currency pricing, multi-currency wallets.</strong> Charging USD globally
                while cards settle through FX paths triggers conversion fees on top of cross-border
                markups. Common on self-serve SaaS without localized checkout.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Signals to monitor monthly</h2>
            <div className="space-y-3">
              {MIGRATION_SIGNALS.map((item) => (
                <div
                  key={item.signal}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <p className="font-semibold text-gray-900">{item.signal}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.watch}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">What founders are doing about it</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Audit before negotiating.</strong> Pull 3–6 months of Balance CSV and measure
                international share and blended rate trend — not one month in isolation.
              </li>
              <li>
                <strong>Local payment methods where volume justifies it.</strong> SEPA, iDEAL, and similar
                rails can reduce card-heavy cross-border mix in EU markets.
              </li>
              <li>
                <strong>Entity strategy at scale.</strong> A local Stripe account can turn some
                cross-border charges into domestic processing — but adds compliance overhead; usually
                worth it at sustained volume, not day one.
              </li>
              <li>
                <strong>Price for geography honestly.</strong> Adaptive Pricing and localized checkout
                do not eliminate fees, but they clarify who pays FX — important when customers move
                countries mid-subscription.
              </li>
            </ul>
            <p className="mt-4">
              Deeper dives:{" "}
              <Link href="/blog/stripe-international-card-fees" className="text-blue-600 underline">
                international card fees
              </Link>
              {" · "}
              <Link
                href="/blog/why-stripe-effective-rate-jumped-this-month"
                className="text-blue-600 underline"
              >
                why your rate jumped this month
              </Link>
              {" · "}
              <Link href="/blog/how-to-reduce-stripe-fees" className="text-blue-600 underline">
                how to reduce Stripe fees
              </Link>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-gray-900">FAQ</h2>
            <div className="space-y-5">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <h3 className="font-semibold text-gray-900">{item.q}</h3>
                  <p className="mt-1 text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">Sources & methodology</p>
            <p className="mt-2">
              Migration figures reference the IOM / UN <em>World Migration Report 2026</em> global
              overview (international migrant stock estimates). Remote-work visa counts are industry
              compilations and vary by definition (typically ~58–66 countries in 2026 reports). Stripe
              fee examples use published US online card pricing plus documented cross-border and currency
              conversion surcharges; verify against your Stripe Dashboard and contract. This article is
              informational, not tax or legal advice.
            </p>
          </section>
        </div>

        <div className="mt-12 rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
          <p className="mb-2 font-semibold text-gray-900">
            See if cross-border fees are raising your rate
          </p>
          <p className="mb-4 text-sm text-gray-600">
            Upload your Balance CSV — no OAuth, no raw file stored.
          </p>
          <Link
            href="/analyze"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Analyze My CSV →
          </Link>
          <BlogBetaRetentionNote tone="gray" />
        </div>
      </article>
    </main>
  );
}
