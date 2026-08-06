import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingFaq, LANDING_FAQ_HOME_IDS } from "@/components/LandingFaq";
import { LandingNav } from "@/components/LandingNav";
import { TrackedLink } from "@/components/TrackedLink";
import { UserTestimonials } from "@/components/UserTestimonials";
import { FULL_REPORTS_FREE_DURING_BETA } from "@/lib/beta-access";
import { chromeExtensionInstallHref } from "@/lib/chrome-extension";
import { buildOgImageUrl } from "@/lib/seo-og";
import { absoluteUrl } from "@/lib/site-url";

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
  { label: "Stripe fees", value: "$3,597.77" },
  { label: "Processing rate", value: "3.82%" },
  { label: "All-in cost", value: "4.02%" },
  { label: "High-fee charges", value: "447" },
] as const;

const PAIN_LINKS = [
  { href: "/blog/stripe-international-card-fees", label: "International card fees" },
  { href: "/why-stripe-fee-rate-higher-than-2-9", label: "Refund fees not returned" },
  { href: "/blog/why-stripe-fees-increase", label: "Rate / payout drift" },
] as const;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Export your CSV",
    body: "Stripe Dashboard → Reports → Balance summary → Export → Itemized → Download to system. Takes about a minute. No API access needed.",
  },
  {
    step: "2",
    title: "Drop it here",
    body: "The CSV is sent to our server for analysis, but the raw file is not stored as a file. During beta, full report links from real uploads stay active for up to 30 days; after beta, unpaid previews expire sooner.",
  },
  {
    step: "3",
    title: "See your real rate",
    body: "Processing rate vs all-in cost, why your rate is higher (international cards, small transactions), refund fee leakage, benchmark context, high-fee charges when your volume allows, and savings ideas.",
  },
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

      {FULL_REPORTS_FREE_DURING_BETA ? (
        <div className="bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white">
          Free diagnosis · no signup.{" "}
          <TrackedLink
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "banner", campaign: "beta_banner" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "beta_banner" }}
            className="underline underline-offset-2 hover:text-emerald-100 transition-colors"
          >
            See sample report →
          </TrackedLink>
        </div>
      ) : (
        <div className="bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white">
          Free diagnosis · no signup.{" "}
          <TrackedLink
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "banner", campaign: "launch_banner_sample" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "launch_banner" }}
            className="underline underline-offset-2 hover:text-blue-100 transition-colors"
          >
            See sample report →
          </TrackedLink>
        </div>
      )}

      <LandingNav />

      {/* Hero — Curiosity */}
      <section id="problem" className="flex flex-col items-center justify-center px-4 py-12 sm:py-16 text-center scroll-mt-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Fee Auditor · feeauditor.com
        </p>

        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight max-w-3xl">
          Your Stripe dashboard says 2.9%.{" "}
          <span className="text-blue-600">Your effective rate often isn&apos;t.</span>
        </h1>
        <h2 className="sr-only">Stripe effective rate, refund leakage, and international card fees</h2>
        <p className="mt-5 max-w-xl text-base text-gray-600 leading-relaxed">
          Upload a Balance CSV and see your real rate and the top driver behind it.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md sm:max-w-none sm:w-auto">
          <TrackedLink
            href="/analyze"
            utm={{ source: "landing", medium: "cta", campaign: "hero_primary" }}
            funnelEvent="funnel_landing_cta"
            funnelProps={{ placement: "hero_primary" }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            Analyze my CSV — free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </TrackedLink>
          <TrackedLink
            href="/analyze?sample=1"
            utm={{ source: "landing", medium: "cta", campaign: "hero_sample" }}
            funnelEvent="funnel_sample_cta"
            funnelProps={{ placement: "hero_sample" }}
            className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-8 py-4 text-base font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            See sample report
          </TrackedLink>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          No OAuth · raw CSV is not stored · independent tool
        </p>

        {hasReportsAnalyzedCount && (
          <p className="mt-3 text-sm font-medium text-gray-500">
            {reportsAnalyzedLabel} reports analyzed in beta
          </p>
        )}
      </section>

      {/* Proof */}
      <section className="bg-gray-50 px-4 py-14 scroll-mt-14" aria-labelledby="proof-heading">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Proof
          </p>
          <h2 id="proof-heading" className="text-center text-2xl font-bold text-gray-900">
            What one real export showed
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-center">
            {PROOF_STATS.map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="mt-0.5 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <Image
              src="/screenshots/report-preview.png"
              alt="Stripe Fee Auditor report showing $3,597.77 in fees, 3.82% processing rate, 4.02% all-in cost rate, and savings teaser"
              width={1076}
              height={777}
              sizes="(min-width: 1024px) 960px, 100vw"
              className="h-auto w-full"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-gray-700">What usually drives it</p>
            <p className="mt-2 text-sm text-gray-600">
              {PAIN_LINKS.map((item, index) => (
                <span key={item.href}>
                  {index > 0 && <span className="text-gray-300"> · </span>}
                  <Link href={item.href} className="text-blue-600 hover:underline">
                    {item.label}
                  </Link>
                </span>
              ))}
            </p>
            <p className="mt-3 text-sm text-gray-500">
              <Link href="/stripe-fee-calculator" className="text-blue-600 hover:underline">
                Fee estimate
              </Link>
              {" · "}
              <Link
                href="/blog/how-i-found-1400-in-hidden-stripe-fees"
                className="text-blue-600 hover:underline"
              >
                Read the case study →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Interaction — How we find them */}
      <section id="how-it-works" className="bg-white px-4 py-16 scroll-mt-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            How it works
          </p>
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">How we find them</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, body }) => {
              const stepBody =
                step === "2" && !FULL_REPORTS_FREE_DURING_BETA
                  ? "The CSV is sent to our server for analysis, but the raw file is not stored as a file. Upload once for a free preview immediately — no card required. Unlock the full report for $12 when you want high-fee charge details, exports, and savings actions."
                  : body;
              return (
                <div key={step} className="relative rounded-xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {step}
                  </div>
                  <h3 className="mb-1.5 font-semibold text-gray-900">{title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{stepBody}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <TrackedLink
              href="/analyze?sample=1"
              utm={{ source: "landing", medium: "cta", campaign: "mid_sample" }}
              funnelEvent="funnel_sample_cta"
              funnelProps={{ placement: "mid_sample" }}
              className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              See sample report →
            </TrackedLink>
            <Link
              href="/stripe-fee-calculator"
              className="text-sm font-medium text-gray-500 underline underline-offset-2 hover:text-blue-600"
            >
              Fee estimate without CSV →
            </Link>
          </div>
        </div>
      </section>

      <UserTestimonials />

      {/* Pricing — Result */}
      <section id="pricing" className="px-4 py-16 bg-gray-50 scroll-mt-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            Pricing
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-3">
            One audit, one price
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-center text-base text-gray-600 leading-relaxed">
            $12 = one CSV audit. Preview free · pay once for full rows, exports, and a 30-day private link.
            {FULL_REPORTS_FREE_DURING_BETA ? " Full report is free during beta." : null}
          </p>
          <div className="mx-auto max-w-md rounded-2xl border-2 border-blue-200 bg-blue-50/80 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
              One audit · $12
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-2">This CSV, once</p>
            <p className="text-base text-blue-900/90 leading-relaxed">
              Full high-fee rows, savings actions with caveats, monthly detail, CSV + print export —
              private link for 30 days.
            </p>
            {FULL_REPORTS_FREE_DURING_BETA ? (
              <p className="mt-3 text-sm font-medium text-emerald-800">
                Currently free during beta — upload your CSV to get the full report.
              </p>
            ) : (
              <p className="mt-3 text-xs text-gray-500">
                Refund available if payment succeeds but the report does not unlock.
              </p>
            )}
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">
            Want monthly CSV reminders and rate drift checks?{" "}
            <Link href="/monitor" className="font-semibold text-blue-600 hover:underline">
              Fee Monitor ($9/mo)
            </Link>
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <TrackedLink
              href="/analyze"
              utm={{ source: "landing", medium: "cta", campaign: "footer" }}
              funnelEvent="funnel_landing_cta"
              funnelProps={{ placement: "footer" }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow hover:bg-blue-700 transition-colors"
            >
              Analyze my CSV
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </TrackedLink>
            <Link href="/stripe-fee-calculator" className="text-sm font-medium text-gray-500 underline underline-offset-2 hover:text-blue-600">
              Estimate first →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-10" aria-labelledby="chrome-helper-heading">
        <div className="mx-auto max-w-4xl rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
                Chrome helper · free on Web Store
              </p>
              <h2 id="chrome-helper-heading" className="mt-1 text-xl font-bold text-gray-900">
                Install the Chrome helper for export shortcuts and monthly reminders
              </h2>
              <p className="mt-2 text-base leading-relaxed text-gray-600">
                Opens the Stripe Balance export flow, sends you back to analyze the CSV, and can remind
                you every month. No Stripe page reading, no OAuth, no API keys.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
              <a
                href={chromeExtensionInstallHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Install from Chrome Web Store
              </a>
              <Link
                href="/analyze?sample=1"
                className="inline-flex justify-center rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                See sample report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-50 px-4 py-16 scroll-mt-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            FAQ
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
            Security &amp; trust
          </h2>
          <LandingFaq itemIds={LANDING_FAQ_HOME_IDS} />
          <p className="mt-6 text-center text-sm text-gray-500">
            More questions in{" "}
            <Link href="/how-it-works#faq" className="text-blue-600 hover:underline">
              How it works
            </Link>
            {" "}and our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-xs text-gray-400 space-y-2">
        <p>Updated June 2026</p>
        <p>
          Fee Auditor (feeauditor.com) is an independent SaaS tool. Not affiliated with, endorsed by,
          or part of Stripe, Inc. &quot;Stripe&quot; is a trademark of Stripe, Inc.{" "}
          <Link href="/how-it-works" className="underline hover:text-gray-600">How it works</Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
          {" · "}
          <Link href="/refund" className="underline hover:text-gray-600">Refund Policy</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <Link href="/monitor" className="hover:underline">Fee Monitor</Link>
          <span>·</span>
          <Link href="/chrome-extension" className="hover:underline">Chrome helper</Link>
          <span>·</span>
          <Link href="/stripe-fee-calculator" className="hover:underline">Stripe fee calculator</Link>
          <span>·</span>
          <Link href="/should-i-switch-from-stripe" className="hover:underline">Should I switch from Stripe?</Link>
          <span>·</span>
          <Link href="/compare-stripe-paypal-wise" className="hover:underline">Stripe vs PayPal vs Wise</Link>
          <span>·</span>
          <Link href="/stripe-vs-square-fees" className="hover:underline">Stripe vs Square</Link>
          <span>·</span>
          <Link href="/what-percent-does-stripe-take" className="hover:underline">What percent Stripe takes</Link>
          <span>·</span>
          <Link href="/stripe-balance-csv" className="hover:underline">Stripe Balance CSV</Link>
          <span>·</span>
          <Link href="/why-stripe-fee-rate-higher-than-2-9" className="hover:underline">Why fees exceed 2.9%</Link>
        </p>
        <p className="flex justify-center gap-3 flex-wrap">
          <a
            href="https://github.com/Ksantor1981/Stripe-Fee-Auditor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
          <span>·</span>
          <Link href="/blog/why-stripe-fees-increase" className="hover:underline">Why Stripe fees increase</Link>
          <span>·</span>
          <Link href="/blog/how-to-reduce-stripe-fees" className="hover:underline">How to reduce fees</Link>
          <span>·</span>
          <Link href="/blog/stripe-effective-fee-rate-explained" className="hover:underline">Fee rate explained</Link>
        </p>
      </footer>
    </main>
  );
}
