import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LANDING_FAQ_HOME_IDS } from "@/components/LandingFaq";
import { LandingNavHydrate, LANDING_NAV_ROOT_ID } from "@/components/LandingNavHydrate";
import { LandingNavShell } from "@/components/LandingNavShell";
import { FunnelAnchor } from "@/components/FunnelAnchor";
import { FunnelClickDelegate } from "@/components/FunnelClickDelegate";
import { QuoteFooterStrip } from "@/components/QuoteFooterStrip";
import { FULL_REPORTS_FREE_DURING_BETA } from "@/lib/beta-access";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

const LandingFaq = dynamic(
  () => import("@/components/LandingFaq").then((mod) => ({ default: mod.LandingFaq })),
  {
    loading: () => (
      <div className="mx-auto max-w-3xl h-56 animate-pulse rounded-xl bg-gray-100" aria-hidden />
    ),
  }
);

const HOME_TITLE = "Free Stripe Fee Auditor — See Your Real Effective Rate";
const HOME_DESCRIPTION =
  "Upload your Stripe Balance CSV. See effective rate, international-card uplift, refund fee drag, and other fee drivers. Free diagnosis, no signup, no OAuth. Raw CSV is not stored.";
const HOME_OG_IMAGE = buildOgImageUrl({
  title: "See your real Stripe effective rate",
  eyebrow: "Fee Auditor · free diagnosis",
});

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "https://feeauditor.com",
    type: "website",
    images: [{ url: HOME_OG_IMAGE, width: 1200, height: 630, alt: "Stripe Fee Auditor real fee rate report" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [HOME_OG_IMAGE],
  },
};

const reportsAnalyzedCount = Number(process.env.NEXT_PUBLIC_REPORTS_ANALYZED_COUNT ?? 0);
const hasReportsAnalyzedCount = Number.isFinite(reportsAnalyzedCount) && reportsAnalyzedCount > 0;
const reportsAnalyzedLabel = new Intl.NumberFormat("en-US").format(reportsAnalyzedCount);

const PROOF_STATS = [
  { label: "Stripe fees (quarter)", value: "$498.76" },
  { label: "Processing rate", value: "6.33%" },
  { label: "All-in cost", value: "6.67%" },
  { label: "Extra vs 2.9% headline", value: "~$270/qtr" },
  { label: "Fee grade", value: "D" },
] as const;

const PAIN_LINKS = [
  { href: "/blog/stripe-international-card-fees", label: "International card fees" },
  { href: "/why-stripe-fee-rate-higher-than-2-9", label: "Refund fees not returned" },
  { href: "/blog/why-stripe-fees-increase", label: "Rate / payout drift" },
] as const;

const HOW_IT_WORKS = [
  { step: "1", title: "Export CSV", body: "Balance summary → Itemized export from Stripe Dashboard." },
  { step: "2", title: "Upload", body: "One file, no OAuth. Raw CSV is not stored." },
  { step: "3", title: "See drivers", body: "Ranked fee drivers, high-fee rows, and links back to Stripe Dashboard." },
];

const FAQ_JSON_LD_ITEMS = [
  {
    q: "Is Fee Auditor useful for my business?",
    text: [
      "Useful if you have international cards, refunds, small subscriptions, or a Stripe rate that feels higher than expected. Skip if you only have a few domestic high-ticket charges and just need a rough spreadsheet formula.",
    ],
  },
  {
    q: "Do you store my Stripe CSV file?",
    text: [
      "No. Your browser reads the file for upload preview, then sends it once to our servers for analysis. We store computed numbers and aggregates (rates, totals, grouped categories) — not the raw CSV as a file.",
      "Transaction IDs may appear in your private report so you can match rows to Stripe; free-text descriptions from the export are stripped before long-term storage where possible.",
    ],
  },
  {
    q: "Does Stripe Fee Auditor connect to my Stripe account?",
    text: [
      "No API connection and no OAuth. You export a CSV from the Stripe Dashboard and upload it here — same data you could open in a spreadsheet, without granting third-party access to your live account.",
    ],
  },
  {
    q: "Who can see my report?",
    text: [
      "Only someone with your private link (including the access token in the URL). Treat it like a password: don't share it in public channels. Reports expire automatically based on our retention policy.",
    ],
  },
  {
    q: "Are the benchmarks and savings numbers guaranteed?",
    text: [
      "No. They are directional estimates built from your export using simplified rules, not Stripe's internal ledger. Use them to spot patterns and questions for your finance team — not as contractual fee quotes.",
    ],
  },
  {
    q: "Is the $12 full report worth it after beta?",
    text: [
      "It depends on your volume. If you process only a few small payments, the preview or a spreadsheet may be enough. If you process meaningful monthly volume, have international customers, refunds, or many low-ticket charges, the full report is designed to show the rows and actions behind the headline rate.",
    ],
  },
  {
    q: "Can I calculate this myself in Excel?",
    text: [
      "Yes. The basic blended rate is total charge fees divided by total charge volume. Fee Auditor is useful when you want monthly changes, high-fee charges, refund fee leakage, benchmark context, exports, and specific savings opportunities without rebuilding the spreadsheet every time.",
    ],
  },
  {
    q: "How is this different from a Stripe fee calculator?",
    text: [
      "A fee calculator estimates what Stripe might charge from public pricing and assumptions. Stripe Fee Auditor checks what you actually paid by analyzing an itemized Stripe Balance CSV, including refunds, other fee lines, card mix, monthly changes, and unusual transactions.",
    ],
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_JSON_LD_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.text.join(" "),
    },
  })),
};

const SOFTWARE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Stripe Fee Auditor",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: absoluteUrl("/"),
  description: HOME_DESCRIPTION,
  offers: [
    {
      "@type": "Offer",
      name: "Full report",
      price: "12",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Fee Monitor",
      price: "9",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "9",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
    },
  ],
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fee Auditor",
  alternateName: ["Stripe Fee Auditor", "feeauditor.com"],
  url: absoluteUrl("/"),
  logo: absoluteUrl("/icon-192.png"),
  description:
    "Independent SaaS at feeauditor.com that analyzes a merchant’s own Stripe Balance CSV. Not affiliated with, endorsed by, or part of Stripe, Inc.",
  sameAs: [
    "https://github.com/Ksantor1981/Stripe-Fee-Auditor",
    "https://www.producthunt.com/products/stripe-fee-auditor",
    "https://www.indiehackers.com/product/stripe-fee-auditor-2",
  ],
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD).replace(/</g, "\\u003c") }}
      />

      <div
        id={LANDING_NAV_ROOT_ID}
        className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm"
      >
        <LandingNavShell />
      </div>

      <div className="pt-14">
      {FULL_REPORTS_FREE_DURING_BETA ? (
        <div className="bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white">
          Free diagnosis · no signup.{" "}
          <FunnelAnchor
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "banner", campaign: "beta_banner" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "beta_banner" }}
            className="underline underline-offset-2 hover:text-emerald-100 transition-colors"
          >
            See sample report →
          </FunnelAnchor>
        </div>
      ) : (
        <div className="bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white">
          Free diagnosis · no signup.{" "}
          <FunnelAnchor
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "banner", campaign: "launch_banner_sample" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "launch_banner" }}
            className="underline underline-offset-2 hover:text-blue-100 transition-colors"
          >
            See sample report →
          </FunnelAnchor>
        </div>
      )}

      {/* Hero — H1 paints from static HTML; nav shell is fixed above, JS hydrates on idle */}
      <section id="problem" className="flex flex-col items-center justify-center px-4 py-10 sm:py-14 text-center scroll-mt-28">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight max-w-3xl">
          Stripe advertises 2.9%. Your real all-in rate is often{" "}
          <span className="text-blue-600">much higher.</span>
        </h1>
        <p className="mt-4 max-w-xl text-xl font-semibold text-gray-800 sm:text-2xl">
          See which charges, refunds, and international payments pushed your rate up.
        </p>
        <h2 className="sr-only">Stripe effective rate, refund leakage, and international card fees</h2>
        <p className="mt-5 max-w-xl text-base text-gray-600 leading-relaxed">
          Stripe gives you fee rows. Fee Auditor tells you what they mean — from a Balance CSV, free, no OAuth.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md sm:max-w-none sm:w-auto">
          <FunnelAnchor
            href="/analyze"
            utm={{ source: "landing", medium: "cta", campaign: "hero_primary" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "hero_primary" }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            Audit my Stripe fees — free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </FunnelAnchor>
          <FunnelAnchor
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "cta", campaign: "hero_sample" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "hero_sample" }}
            className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-8 py-3 sm:py-3.5 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            See sample report
          </FunnelAnchor>
        </div>
        <p className="mt-4 max-w-xl text-sm text-gray-600 leading-relaxed">
          Not a CSV summary — see which Stripe transactions drove your rate up, and what may be worth fixing.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Calculated from your actual Balance transactions — not an AI estimate.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          No OAuth · raw CSV is not stored · descriptions stripped before storage
        </p>
        <p className="mt-2 text-sm text-gray-500">
          No CSV yet?{" "}
          <Link href="/stripe-balance-csv" className="font-medium text-blue-700 underline hover:text-blue-800">
            Export in 2 clicks from Stripe Dashboard →
          </Link>
          {" · "}
          <Link href="/privacy#security" className="font-medium text-blue-700 underline hover:text-blue-800">
            How we handle your data
          </Link>
        </p>

        {hasReportsAnalyzedCount && (
          <p className="mt-3 text-sm font-medium text-gray-500">
            {reportsAnalyzedLabel} reports analyzed in beta
          </p>
        )}
      </section>

      {/* Sample report */}
      <section id="sample" className="bg-gray-50 px-4 py-10 scroll-mt-24" aria-labelledby="sample-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="sample-heading" className="text-center text-2xl font-bold text-gray-900">
            Sample report from a Stripe export
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Illustrative Balance CSV — your volume and rates will differ.
          </p>
          <p className="mt-2 text-center text-sm text-gray-600 max-w-2xl mx-auto">
            This sample uses a heavy international-card mix (6.67% all-in) — an edge case to show fee drivers clearly.
            Many SaaS businesses with mixed card mix often land around{" "}
            <span className="font-medium text-gray-800">3.5–4.2%</span> all-in (directional, not a guarantee).
          </p>
          <p className="mt-1 text-center text-xs text-gray-500 max-w-xl mx-auto">
            Extra vs 2.9% headline in this sample: ~$270/quarter on ~$7.9k charge volume.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 text-center sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-3">
            {PROOF_STATS.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            {/* WebP + PNG srcSet; lazy — below fold on mobile, not LCP */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <picture>
              <source
                type="image/webp"
                srcSet="/screenshots/report-preview.webp 1x, /screenshots/report-preview@2x.webp 2x"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <img
                src="/screenshots/report-preview.png"
                srcSet="/screenshots/report-preview.png 1x, /screenshots/report-preview@2x.png 2x"
                sizes="(max-width: 1024px) 100vw, 1024px"
                alt="Stripe Fee Auditor report: Fee Grade D, $498.76 in quarter fees, 6.33% processing rate, 6.67% all-in cost, and comparison vs advertised 2.9% card pricing"
                width={1024}
                height={616}
                loading="lazy"
                decoding="async"
                className="mx-auto block h-auto w-full max-w-[1024px]"
              />
            </picture>
          </div>

          <div className="mt-10 mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white px-5 py-5 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              For founders &amp; fractional CFOs
            </p>
            <p className="mt-2 text-base text-gray-700 leading-relaxed">
              Audit a Stripe export, identify fee drivers, and bring transaction-level evidence to the next finance
              review.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              <Link href="/monitor" className="font-medium text-blue-700 underline hover:text-blue-800">
                Fee Monitor
              </Link>
              {" "}for monthly drift ·{" "}
              <Link href="/pricing" className="font-medium text-blue-700 underline hover:text-blue-800">
                Full report
              </Link>
              {" "}with high-fee rows &amp; exports
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-1.5 text-center text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-1 sm:gap-y-0">
            {PAIN_LINKS.map((item, index) => (
              <span key={item.href} className="inline-flex items-center">
                {index > 0 && <span className="hidden text-gray-300 sm:inline"> · </span>}
                <Link href={item.href} className="text-blue-700 underline hover:text-blue-800">
                  {item.label}
                </Link>
              </span>
            ))}
            <span className="inline-flex items-center">
              <span className="hidden text-gray-300 sm:inline"> · </span>
              <Link href="/blog/how-i-found-1400-in-hidden-stripe-fees" className="text-blue-700 underline hover:text-blue-800">
                Case study
              </Link>
            </span>
          </div>
        </div>
      </section>

      {/* Interaction — How we find them */}
      <section id="steps" className="bg-white px-4 py-10 scroll-mt-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-bold text-gray-900">Three steps</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + final CTA */}
      <section id="faq" className="bg-gray-50 px-4 py-10 scroll-mt-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-xl font-bold text-gray-900 mb-6">Trust</h2>
          <LandingFaq itemIds={LANDING_FAQ_HOME_IDS} />
          <p className="mt-6 text-center text-sm text-gray-500">
            More questions in{" "}
            <Link href="/how-it-works#faq" className="text-blue-700 underline hover:text-blue-800">
              How it works
            </Link>
            {" "}and our{" "}
            <Link href="/privacy" className="text-blue-700 underline hover:text-blue-800">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-md text-center">
          <FunnelAnchor
            href="/analyze"
            utm={{ source: "landing", medium: "cta", campaign: "footer" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "footer" }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow hover:bg-blue-700 transition-colors"
          >
            Audit my Stripe fees — free
          </FunnelAnchor>
          <p className="mt-3 text-sm text-gray-500">
            <Link href="/pricing" className="text-blue-700 underline hover:text-blue-800">
              Pricing
            </Link>
            {" · "}
            <Link href="/monitor" className="text-blue-700 underline hover:text-blue-800">
              Fee Monitor
            </Link>
          </p>
        </div>
      </section>

      <QuoteFooterStrip />

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-xs text-gray-600 space-y-2">
        <p>Updated August 2026</p>
        <p>
          Fee Auditor (feeauditor.com) is an independent SaaS tool. Not affiliated with, endorsed by,
          or part of Stripe, Inc. &quot;Stripe&quot; is a trademark of Stripe, Inc.{" "}
          <Link href="/how-it-works" className="underline hover:text-gray-900">How it works</Link>
          {" · "}
          <Link href="/pricing" className="underline hover:text-gray-900">Pricing</Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-gray-900">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-gray-900">Terms of Service</Link>
          {" · "}
          <Link href="/refund" className="underline hover:text-gray-900">Refund Policy</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <Link href="/monitor" className="underline hover:text-gray-900">Fee Monitor</Link>
          <span className="text-gray-400">·</span>
          <Link href="/chrome-extension" className="underline hover:text-gray-900">Chrome helper</Link>
          <span className="text-gray-400">·</span>
          <Link href="/stripe-fee-calculator" className="underline hover:text-gray-900">Stripe fee calculator</Link>
          <span className="text-gray-400">·</span>
          <Link href="/should-i-switch-from-stripe" className="underline hover:text-gray-900">Should I switch from Stripe?</Link>
          <span className="text-gray-400">·</span>
          <Link href="/compare-stripe-paypal-wise" className="underline hover:text-gray-900">Stripe vs PayPal vs Wise</Link>
          <span className="text-gray-400">·</span>
          <Link href="/stripe-vs-square-fees" className="underline hover:text-gray-900">Stripe vs Square</Link>
          <span className="text-gray-400">·</span>
          <Link href="/what-percent-does-stripe-take" className="underline hover:text-gray-900">What percent Stripe takes</Link>
          <span className="text-gray-400">·</span>
          <Link href="/stripe-balance-csv" className="underline hover:text-gray-900">Stripe Balance CSV</Link>
          <span className="text-gray-400">·</span>
          <Link href="/why-stripe-fee-rate-higher-than-2-9" className="underline hover:text-gray-900">Why fees exceed 2.9%</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <a
            href="https://github.com/Ksantor1981/Stripe-Fee-Auditor"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900"
          >
            GitHub
          </a>
          <span className="text-gray-400">·</span>
          <Link href="/blog/why-stripe-fees-increase" className="underline hover:text-gray-900">Why Stripe fees increase</Link>
          <span className="text-gray-400">·</span>
          <Link href="/blog/how-to-reduce-stripe-fees" className="underline hover:text-gray-900">How to reduce fees</Link>
          <span className="text-gray-400">·</span>
          <Link href="/blog/stripe-effective-fee-rate-explained" className="underline hover:text-gray-900">Fee rate explained</Link>
        </p>
      </footer>
      </div>

      <LandingNavHydrate />
      <FunnelClickDelegate />
    </main>
  );
}
